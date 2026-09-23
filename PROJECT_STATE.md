# RetroNomad Project State

Last updated: 23 September 2026

This file is the durable handoff for the RetroNomad project. A new ChatGPT conversation should read this file before changing the product.

## Product

**RetroNomad** is a global retro-game buying/deal-finder assistant.

Tagline: **Find the right copy. Wherever it was released.**

**PALScout** is RetroNomad's first regional intelligence layer for UK/European physical releases.

Core principle: identify the exact physical release before comparing price. Never compare unlike releases, regions, editions, completeness states or item types.

## Evidence hierarchy

1. Exact verified catalogue/barcode/reference match when unique
2. Positive visual/gallery evidence across the listing
3. Explicit seller title/description
4. Marketplace item specifics
5. Generic product metadata

Conflicts lower confidence and force REVIEW. Absence from one photo is never proof that a component is missing. Possible reproductions should be held for review rather than accused from weak signs.

## Classification fields

- Game
- Platform
- Item type
- Region (PAL / NTSC-U / NTSC-J)
- Country/edition
- Release / budget line / promo
- Completeness
- Condition
- Authenticity / repro caution
- Bundle
- Item price
- Postage
- Total
- Confidence
- Review reason / missing evidence

## Market buckets

- UK_EXACT
- UK_SHARED_PAL
- UK_COMPATIBLE_EU_ENGLISH
- UK_VISUAL_REQUIRED
- NO_OFFICIAL_UK_RETAIL
- EUROPE_UNRESOLVED

Rules:
- Explicit foreign territory evidence (NTSC-J, NTSC-U/C, Japan, USA, PAL-FR/ITA/DE/ES, etc.) must not enter a UK comparison bucket unless stronger exact identifier evidence creates an explicit conflict for review.
- Bundles are separate.
- Demo/promo products are separate, but a retail game that merely includes a bonus demo disc is not itself a demo.
- Release-family collisions are blocked (for example MGS3 Snake Eater must not be mapped to Subsistence).
- Condition problems change the comparison bucket/status, not the underlying release identity.

## Reference data

Launch scope:
- PS1: 40 games
- PS2: 40 games
- Dreamcast: 20 games
- 100 games total

Market-aware v3 data:
- 217+ release-evidence records
- UK_EXACT: 51 games
- UK_SHARED_PAL: 12 games
- 63/100 identifier-comparison-ready without forced country guessing
- UK_COMPATIBLE_EU_ENGLISH: 28
- UK_VISUAL_REQUIRED: 7
- NO_OFFICIAL_UK_RETAIL: 1
- EUROPE_UNRESOLVED: 1

Important special cases:
- Silent Hill PS1 SLES-01514 / 4988602555660 is shared PAL; needs package evidence.
- FFVII UK SCES-00867 / 0711719694328 is UK exact.
- FFVII Spain SCES-00900 / 0711719694625 is non-UK exact.
- Vagrant Story 4036636200459 is UK exact; 4036636200480 is non-UK exact; SLES-02754 is shared.
- Dreamcast -50 codes are European, not UK-only.
- T-36806D-05 (RE Code Veronica DC), T-7019D-05 (Dino Crisis DC), T-17715D-05 (Grandia II DC) are strong UK evidence.
- Rule of Rose PS2 has no normal UK retail release; do not invent a UK retail bucket.
- Street Fighter Alpha 3 PS1 remains Europe unresolved in the seed.

## Validation

A real/current-or-recent 50-listing UK marketplace benchmark was created.

Initial benchmark:
- Decision/status: 39/50 = 78%
- Game ID: 45/50 = 90%
- Platform: 50/50 = 100%
- Edition: 47/50 = 94%
- Completeness parsing: 36/50 = 72%
- One critical false-ready case: Japanese NTSC-J Shenmue II fell into a shared-PAL READY path.

Fixes implemented after benchmark:
- foreign-region veto
- bundle detection
- bonus demo vs main demo distinction
- Klonoa short-name alias
- MGS3 Snake Eater vs Subsistence separation
- broader completeness phrases
- missing-disc/incomplete parsing
- seller-text condition parsing
- parent-title overlap pruning (e.g. Shenmue vs Shenmue II)
- magazine/demo item-type separation

Rerun result:
- title-only rerun reached 49/50 decisions; the remaining Tombi condition fact existed in seller details, not the title.
- full preserved listing-detail reasoning reached 50/50 status matches with zero false-READY cases.
Do not claim universal 100% classifier accuracy; this result applies to the fixed 50-listing benchmark.

## Public product

Repository:
channel9ch9-source/RetroNomad

GitHub Pages:
https://channel9ch9-source.github.io/retronomad/

Analyser:
https://channel9ch9-source.github.io/retronomad/analyze.html

Current analyser includes:
- listing title + description
- URL ingestion with eBay item-ID/title fallback
- platform auto-inference
- completeness auto-inference
- edition detection
- automatic serial/barcode extraction
- 100-game launch catalogue
- identifier-level PALScout evidence
- photo upload (up to 6)
- local browser OCR with Tesseract.js
- photo serial/barcode candidates
- gallery component confirmation: disc/manual/case/barcode/spine
- all-discs confirmation
- English/UK package confirmation
- visible-condition flags
- region signals and foreign-region veto
- bundle handling
- Comparison-ready / Review / Separate classification
- manual Pricing v1 references saved locally by exact comparison bucket
- automatic Pricing v1 connector described below

## Pricing v1

Goal: only attach price data after the listing has been classified into the correct release/completeness bucket.

Never manufacture an 'average eBay market price'.

### Automatic beta provider: RetroTechCollector

Chosen for the first automatic-pricing pilot because its Developer Data API:
- exposes catalogue metadata including platform, UPC and release region
- exposes latest price snapshots for loose, CIB, new, box-only and manual-only
- supports browser CORS
- offers a Developer API add-on (currently documented at £9/month)
- stores price snapshots in USD
- supports catalogue and pricing scopes

Beta security model:
- BYOK (bring your own developer key)
- key is entered by the user
- key is stored only in browser sessionStorage for the current tab/session
- key is never committed to GitHub and is not stored in RetroNomad local pricing records
- required scopes: catalogue:read and prices:read

Automatic matching:
1. Pricing only auto-runs after Comparison-ready classification.
2. Prefer UPC/EAN when a numeric identifier is available.
3. Otherwise search by exact game title + mapped platform.
4. Require PAL catalogue rows for the current UK/PAL launch mode.
5. Reject weak or ambiguous catalogue matches.
6. Fetch price by matched masterItemId.
7. Map CIB→cib, Loose→loose, New→new, Box Only→boxOnly, Manual Only→manualOnly.
8. Do not auto-price Incomplete or Condition-specific copies.
9. Convert USD→GBP with a daily central-bank reference rate via Frankfurter.
10. Populate the existing Pricing v1 form and comparison panel; do not label a purchase 'good' or 'bad'.

Production shared-key mode:
- do not put a service API key in GitHub Pages.
- a production shared key needs a backend/serverless secret store.
- confirm with the provider that public third-party display/redistribution is permitted under the intended plan before using one shared RetroNomad key.

PriceCharting remains a possible future provider, but its API documentation states that application display to third parties requires a commercial licence and express written permission. Do not expose a normal subscriber token in the public app.

## Pricing v1 manual fallback

Manual/user-provided references remain available:
- market/price-guide reference
- personal target price
- manual comparable
- low / typical / high
- source name
- source URL
- reference date
- item-only vs landed basis
- exact comparison bucket

Saved locally per exact key:
Game · Platform · Release · Edition · Completeness/condition bucket

Pricing is gated if classification is not Comparison-ready.

## Architecture constraints

Current hosting is static GitHub Pages.
It cannot safely hold shared API secrets or run Python/Flask server-side.

Current browser-side integrations:
- listing page metadata fetch where CORS allows
- Tesseract.js local OCR
- BYOK pricing API
- free/reference FX API

Future production dynamic features (shared marketplace/pricing credentials, accounts, alerts, scheduled discovery) require a backend/serverless host.

## eBay developer account

The earlier eBay developer application was rejected after appeal under internal eligibility/risk controls. Do not evade or spam reapplications.

When reapplying later:
- use accurate real information
- use a project/business email where appropriate
- point to the working public RetroNomad prototype
- clearly explain authorised Browse API use
- do not conceal the earlier rejection

Potential eventual architecture:
- eBay Browse API: active listing discovery
- RetroNomad classifier/reference DB: release identification
- licensed pricing source: valuation
- user target prices/alerts
- no unauthorised eBay sold-data-derived market averages

## Brand

Parent: RetroNomad
Regional layer: PALScout
Tagline: Find the right copy. Wherever it was released.

PALScout is not the parent brand because the product is intended to expand globally.

## Roadmap from this point

1. Test the new automatic RetroTechCollector BYOK pricing connector with a real developer key.
2. Verify coverage/matching for the 100 launch titles, especially PAL PS1/PS2/Dreamcast variants.
3. Ask/confirm provider terms for a production public shared-key integration.
4. If approved, deploy a server-side pricing proxy with secret storage and rate limiting.
5. Add wishlist + target-price alerts.
6. Add authorised marketplace discovery/connectors.
7. Expand reference data to NTSC-U, NTSC-J and more platforms.
8. Add accounts/cloud persistence only when a backend exists.

## Accuracy/transparency requirements

- Never fabricate favourable deal results.
- Never fake benchmark improvements.
- Never call something a Good Deal without a trustworthy price reference.
- 'Comparison-ready' means classification is ready; it does not mean the price is good.
- Unknown/ambiguous evidence must become Needs review.
- If a provider has no price or the mapping is ambiguous, show that honestly.
