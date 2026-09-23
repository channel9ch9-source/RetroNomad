# Alerts Backend v1

Last updated: 23 September 2026

This document defines the first provider-neutral backend foundation for RetroNomad Saved Hunts.

## Why a backend is required

Static GitHub Pages cannot safely provide:
- scheduled/background checks
- persistent per-user server data
- shared marketplace API credentials
- notification delivery
- rate limiting for shared provider access
- server-side deduplication across devices/sessions

The browser Saved Hunts implementation remains useful as the product/data-model prototype, but autonomous alerts require a backend.

## Architecture

Future production flow:

```
Authenticated Saved Hunt
-> scheduler
-> authorised marketplace adapter
-> normalised listing
-> PALScout classifier
-> target matcher
-> MATCH / REVIEW / FILTERED
-> new MATCH detection
-> notification queue
-> notification provider
```

The marketplace and notification providers are deliberately abstract.

No scraping or unauthorised marketplace access should be inserted merely to make the scheduler appear functional.

## Files

- `backend/schema.sql`
  - D1/SQLite-compatible persistence schema
- `backend/monitor-core.js`
  - provider-neutral monitor/new-match logic
- `backend/alerts-worker.js`
  - Cloudflare Worker-style scheduler/API shell

## Persistence

Tables:

### saved_hunts
Server-side form of a user's hunt.

Contains:
- owner ID from future authentication
- target JSON
- active/paused/archived status
- alert preference
- last checked state
- next due check

### hunt_matches
Deduplicated qualifying matches.

Primary identity:
`hunt_id + source + external_id`

Tracks:
- first seen
- last seen
- most recent delivered GBP price
- notification timestamp

### monitor_runs
Audit record for each scheduled hunt execution.

Tracks:
- candidate count
- MATCH / REVIEW / FILTERED counts
- number of new matches
- provider/failure state

### notification_queue
Durable queue of newly qualifying matches awaiting notification delivery.

Unique constraint prevents the same hunt/listing pair from being queued repeatedly.

## Monitor core

`runHunt()` is intentionally provider-neutral.

It receives callbacks for:
- search
- loading previously seen listing keys
- saving matches
- saving run summaries
- queueing notifications

It only queues notifications for:
- an ACTIVE hunt
- with alerts requested
- where the candidate is classified MATCH
- and the marketplace listing has not been seen previously for that hunt

REVIEW candidates do not trigger alerts.

FILTERED candidates do not trigger alerts.

## Worker shell

`backend/alerts-worker.js` includes:

### GET /health
Reports readiness only:
- database configured?
- marketplace configured?
- notification provider configured?
- user auth configured?

Current expected state is scaffold-only.

### POST /internal/run-due
Admin-only manual scheduler trigger protected by `ADMIN_TOKEN`.

This exists for future deployment QA.

### /api/hunts/*
Currently returns HTTP 501 intentionally.

Public Saved Hunt sync must not be enabled until a real authentication/account design exists.

### scheduled()
Runs due active/alert-requested hunts through the monitor.

## Current deployment blockers

The worker is NOT production-ready until all of these exist:

1. authenticated user/account ownership for hunts
2. authorised live marketplace inventory provider
3. server-compatible PALScout + matcher execution wired into the provider adapter
4. notification provider and verified delivery destination
5. production rate limiting / abuse protection
6. privacy/data-retention policy for accounts and notifications
7. deployment secrets and origin/security configuration
8. end-to-end test using real authorised inventory

## Marketplace rule

The current worker deliberately throws `provider_not_configured`.

Do not replace this with page scraping or a workaround for the earlier eBay API rejection.

When legitimate provider access exists, implement it as an adapter that returns the same normalised marketplace-listing contract already defined in `MARKETPLACE_V1.md`.

## Notification rule

A user checking “I want an alert” in the browser does not mean alerts are active.

Notification delivery becomes active only when:
- the hunt exists in authenticated backend persistence
- the monitor can query authorised inventory
- a real notification channel has been verified for that user

Until then, the product must continue to label alerts as unavailable/static-beta.
