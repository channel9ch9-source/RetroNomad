# Accounts + Saved Hunt Sync v1

Last updated: 23 September 2026

This document defines RetroNomad's passwordless account and browser-to-backend Saved Hunt sync architecture.

## Goal

Move Saved Hunts from browser-only storage to authenticated server ownership so future scheduled monitoring can continue when the user's browser is closed.

## Authentication model

RetroNomad uses passwordless email sign-in.

Flow:

1. user enters an email address
2. backend creates a short-lived random one-time token
3. backend stores only the SHA-256 hash of that token
4. an email-delivery adapter sends the one-time sign-in link
5. user opens the link
6. backend consumes the token once
7. backend creates or finds the user account
8. backend creates a random server session
9. backend stores only the hash of the session token
10. browser receives the raw session token only in a Secure + HttpOnly cookie

No password is stored by RetroNomad.

The browser application must not store the session token in localStorage.

## Session deployment requirement

The production app and account API should be hosted on the same site, for example:

- app: `https://www.example.com`
- API: `https://api.example.com`

This allows secure SameSite session cookies to work reliably while keeping the raw token inaccessible to JavaScript.

The current GitHub Pages host is not treated as the final account deployment architecture.

`runtime-config.js` therefore leaves account sync disabled until a suitable backend/app-domain setup exists.

## Files

Browser:
- `runtime-config.js`
- `account-sync.js`
- `account.html`
- `saved-hunts.js`
- `wishlist.html`
- `search.html`

Backend:
- `backend/auth-core.js`
- `backend/schema.sql`
- `backend/alerts-worker.js`

## Database identity tables

### users
Stores:
- internal user ID
- normalized email
- display email
- created time
- last login time

### auth_tokens
Stores one-time passwordless login attempts:
- random token ID
- email
- SHA-256 token hash
- LOGIN purpose
- safe return URL
- creation / expiry / used timestamps

Login tokens expire after 15 minutes and are single-use.

### sessions
Stores:
- internal session ID
- user ID
- SHA-256 session-token hash
- created / expiry / last-seen timestamps
- optional revoked timestamp

Current session lifetime: 30 days.

## Account endpoints

### POST /api/auth/request-link
Requires allowed browser origin.

Input:
```json
{
  "email": "user@example.com",
  "returnTo": "https://app.example/account.html"
}
```

Requires an email-delivery adapter.

### GET /api/auth/verify?token=...
Consumes the one-time token, creates/finds the user, creates a session cookie and redirects to the safe app return URL.

### GET /api/me
Returns either:
- authenticated false
- authenticated true + server user ID/email

### POST /api/auth/logout
Revokes the server session and clears the cookie.

### POST /api/hunts/sync
Requires authenticated session ownership.

The browser never sends an owner/user ID that the server trusts. Owner identity comes from the session.

## Sync payload

Browser sends:

```json
{
  "schemaVersion": 1,
  "deviceId": "dev_...",
  "hunts": [],
  "deletions": [
    {
      "id": "hunt_...",
      "deletedAt": "..."
    }
  ]
}
```

Server:
1. resolves owner from the session
2. applies tombstones for that owner's hunts
3. validates each incoming target
4. rejects an ID collision owned by another account
5. prevents server tombstones from being silently resurrected
6. applies newer client snapshots
7. returns the complete non-deleted server snapshot for that user

Browser replaces its local hunt snapshot with the returned server snapshot and clears only deletion tombstones acknowledged by the server.

## Conflict model

v1 uses:
- immutable random hunt IDs
- server tombstones for deletion
- client `updatedAt` as the last-write comparison for edits
- server ownership as the security boundary

This is intentionally simple for the first account implementation.

A future multi-device revision may replace timestamp last-write-wins with explicit server revision numbers if concurrent editing becomes common.

## Delete semantics

Deleting a local hunt no longer simply forgets it.

The browser records a tombstone in:
`retronomad_saved_hunt_tombstones_v1`

This is necessary so a deleted hunt does not reappear from another device during the next sync.

After the backend acknowledges a tombstone, the browser removes the local tombstone.

The server keeps a soft-deleted Saved Hunt row so an older device cannot resurrect the same hunt ID.

## Search integration

When account sync is enabled and the user is authenticated:

1. create/update a Saved Hunt locally
2. browser immediately calls Saved Hunt sync
3. server stores it under the authenticated account
4. future monitoring can operate from server persistence

If account sync is unavailable, the hunt still saves locally.

## Wishlist integration

`wishlist.html` exposes:
- local-only state when backend is disabled
- sign-in prompt when backend is enabled but session is absent
- Sync now when authenticated

The page remains fully usable offline/local-only.

## Email delivery

The first deployed transactional-email provider is Resend.

Preferred Worker secret/config:
- `RESEND_API_KEY` — Cloudflare Worker secret, never exposed to browser code
- `AUTH_EMAIL_FROM` — optional non-secret sender override

If `AUTH_EMAIL_FROM` is absent, the Worker uses the Resend development sender:
`RetroNomad <onboarding@resend.dev>`

That development sender is for initial testing. A verified RetroNomad-owned sending domain must be configured before general-user sign-in is treated as production-ready.

The older generic webhook path remains as a fallback:
- `AUTH_EMAIL_WEBHOOK_URL`
- optional `AUTH_EMAIL_WEBHOOK_SECRET`

Email priority:
1. Resend when `RESEND_API_KEY` exists
2. generic webhook when configured
3. fail safely when no provider exists

The Worker calls Resend's email API directly with `fetch`; no API key is shipped to the browser.

Initial abuse guard:
- at most one sign-in-link request per email address per minute
- at most five per email address per fifteen minutes

A stronger public-launch abuse layer such as Turnstile and/or edge rate limiting should be added before opening sign-in broadly.

Production requirements:
- verified sender domain
- delivery/error visibility
- stronger abuse controls
- no logging of raw one-time tokens beyond what is required for delivery

## Current status

Implemented in source code:
- passwordless token/session model
- authenticated user ownership
- browser account client
- Saved Hunt tombstones
- browser-to-backend sync endpoint
- account UI
- search save -> sync hook
- wishlist manual sync control

Deployed/configured:
- same-origin Cloudflare Worker + static application
- D1 database binding and initial schema
- secure HttpOnly session architecture
- browser runtime account sync enabled on the Cloudflare deployment
- Resend email-delivery code path
- basic per-email sign-in request throttling

Still pending:
- `RESEND_API_KEY` deployment secret
- first real passwordless-email smoke test
- verified RetroNomad sending domain for general-user email
- stronger public abuse protection
- account privacy-policy update
- authorised marketplace source
- real notifications

The GitHub Pages build remains local-only; the Cloudflare deployment is the account-capable environment.
