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

## Email delivery abstraction

The Worker expects:
- `AUTH_EMAIL_WEBHOOK_URL`
- optional `AUTH_EMAIL_WEBHOOK_SECRET`

The adapter receives the recipient, subject and one-time sign-in link.

This deliberately avoids hard-coding an email vendor before deployment.

Production requirements for the email adapter:
- authenticated API/webhook
- verified sender domain
- delivery/error visibility
- rate limiting/abuse controls
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

Not deployed/configured:
- database binding
- same-site/custom account API host
- email-delivery adapter
- production rate limiting
- abuse protection
- account privacy-policy update
- authorised marketplace source
- real notifications

Therefore the public site correctly remains in local-only account mode.
