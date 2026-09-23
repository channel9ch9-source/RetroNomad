# Saved Hunts v1

Last updated: 23 September 2026

This document defines RetroNomad's Phase 1 wishlist / target-price foundation.

## Product role

A Saved Hunt is a persistent version of a structured RetroNomad search target.

Example:

- Silent Hill
- PS1
- UK-market preferred
- original release only
- complete in box
- English-friendly
- no bundles
- no demos/promos
- maximum £80 delivered

Saved Hunts are the bridge between one-time Deal Finder searches and future automated marketplace monitoring.

## Current beta boundary

The public beta is still hosted on static GitHub Pages.

Therefore:
- Saved Hunts can be created, viewed, paused, archived, deleted and exported.
- Alert preference can be recorded.
- Foreground searches can record last-checked metadata and matching-listing history when a live provider exists.
- RetroNomad cannot yet run checks in the background.
- RetroNomad cannot yet send email, push or other notifications.
- Alert state is explicitly stored as `UNAVAILABLE_STATIC_BETA`.

Do not describe a saved hunt as actively monitored until backend scheduling and an authorised marketplace source are actually connected.

## Files

- `saved-hunts.js` — storage and data-model module
- `saved-hunt.schema.json` — Saved Hunt JSON schema
- `wishlist.html` — public Saved Hunts management UI
- `search.html` — creates and reopens Saved Hunts

## Saved Hunt shape

Core fields:
- schemaVersion
- id
- label
- target
- status
- createdAt
- updatedAt
- monitoring
- alerts
- matchHistory

Statuses:
- `ACTIVE`
- `PAUSED`
- `ARCHIVED`

Monitoring state currently begins as:
- `NOT_RUNNING`

A foreground provider-backed search can set:
- `CHECKED_FOREGROUND_ONLY`

Alerts currently store:
- requested: whether the user wants an alert when backend monitoring becomes available
- state: `UNAVAILABLE_STATIC_BETA`
- channel: null
- lastNotifiedAt: null

## Match history

A Saved Hunt may retain up to 100 matching-listing history rows.

Each row stores:
- marketplace/source
- external listing ID
- title
- canonical URL
- delivered GBP price when available
- first seen time
- last seen time
- last match state

Rows are deduplicated by:
`source + externalId`

A later sighting updates `lastSeenAt` and the observed delivered price rather than creating a duplicate.

Only candidates that the target matcher classified as `MATCH` enter match history.

## Local storage

Primary key:
`retronomad_saved_hunts_v1`

Legacy key:
`retronomad_saved_targets`

The v1 module automatically migrates legacy bare targets into Saved Hunt records and removes the old key after migration.

Identical active targets are deduplicated rather than saved repeatedly.

## Search integration

A hunt can be reopened with:

`search.html?hunt=<hunt-id>`

The search page restores the target fields.

When authorised provider results eventually exist, running a saved hunt in the foreground will:
1. execute the normal marketplace -> PALScout -> matcher pipeline
2. record the check summary
3. update matching-listing history

This does not count as background monitoring.

## Future backend responsibilities

A future backend/serverless service will need to:
- persist hunts per account
- schedule recurring checks
- query authorised marketplace sources
- run PALScout + matching logic server-side or through a shared service
- deduplicate listings across checks
- detect newly qualifying matches
- respect user alert settings
- send notifications
- record last-checked / last-notified state
- handle rate limits and provider failures
- provide unsubscribe / pause controls

The browser v1 data model is designed so those capabilities can be added without redefining what a Saved Hunt means.
