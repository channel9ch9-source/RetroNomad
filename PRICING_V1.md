# RetroNomad Pricing v1

## Current automatic provider

RetroTechCollector Developer/Data API is the first Pricing v1 automatic provider.

Why it was selected for the beta:
- catalogue metadata includes release region
- UPC/EAN search is supported
- prices are available by completeness bucket (loose, CIB, new, box only, manual only)
- the API is specifically documented for developer access
- browser callers are supported, which allows a safe BYOK beta without putting a shared secret in GitHub Pages
- a low-cost Developer API add-on is documented

## Beta mode: BYOK

The public analyser accepts a user's own RetroTechCollector developer key.

Security:
- stored only in sessionStorage (current browser tab/session)
- never written to GitHub
- never included in exported pricing-reference JSON
- never sent to RetroNomad because GitHub Pages has no RetroNomad backend
- only sent directly from the user's browser to RetroTechCollector

Required key scopes:
- catalogue:read
- prices:read

Automatic flow:
1. Listing must be Comparison-ready.
2. RetroNomad builds the exact game/platform/release/completeness context.
3. If a barcode/EAN exists, use it first.
4. Otherwise search by game + exact provider platform.
5. Require PAL catalogue candidates in the UK/PAL launch mode.
6. Reject weak/ambiguous matches.
7. Fetch the matched master item price.
8. Map the RetroNomad bucket to the provider field.
9. Convert USD to GBP using a daily central-bank reference FX rate.
10. Populate Pricing v1 automatically.
11. Manual source-backed references remain available as fallback.

Provider bucket map:
- CIB -> cib
- Loose -> loose
- New -> new
- Box Only -> boxOnly
- Manual Only -> manualOnly
- Incomplete / Condition-specific -> no automatic provider price

## Coverage validation

A browser-side validation runner lives at:

- `pricing-coverage.html`

It is an internal/developer tool for roadmap validation, not a source of fabricated coverage claims.

The runner:
- derives the 100 launch game/platform pairs from `release-evidence.js`
- prefers a safe numeric barcode/EAN when one is present in RetroNomad evidence
- falls back to exact game-title + mapped platform search
- requires PAL + exact platform
- rejects weak title agreement even when a barcode query returns a row
- rejects multiple similarly strong PAL candidates instead of selecting one arbitrarily
- fetches `/prices/:masterItemId` only after a safe catalogue match
- records which of loose/CIB/new/box-only/manual-only price buckets are populated
- paces calls below the standalone Developer API add-on's documented 60 requests/minute burst limit
- exports a JSON report that never contains the developer key

Important: creation of this runner is **not** a completed provider coverage test. A real developer key still needs to be used to run the 100-title validation and review the exported failures/ambiguities.

## Production mode

A public shared provider key must never be embedded in analyze.html.

A serverless proxy template lives at:
backend/rtc-pricing-worker.js

Before deploying it with one shared RetroNomad provider key:
1. obtain/confirm provider permission for RetroNomad's public user-facing price display/use
2. store RTC_API_KEY as a server-side secret
3. restrict allowed origin
4. add rate limits/cache
5. log provider-match failures without logging secrets
6. keep ambiguous matching as an error, not a guess

## PriceCharting

PriceCharting remains a possible future provider. Its API documentation says subscriber API/CSV data are internal-use by default; sharing it within an application used by third parties requires a commercial licence and express written permission. Do not use a standard subscriber token as a public RetroNomad data source.

## FX

RetroTechCollector price snapshots are documented in USD.

Pricing v1 converts them to GBP with Frankfurter daily reference rates. This is suitable for reference-price comparison, not live FX trading.

## Product-language rule

Pricing v1 may say:
- below reference
- near typical reference
- above reference
- reference unavailable
- provider match ambiguous

It must not turn a weak/ambiguous classification into a pricing conclusion and must not fabricate a price when no provider data exists.
