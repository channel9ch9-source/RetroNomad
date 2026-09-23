# RetroNomad Project State

Last updated: 23 September 2026

This file is the durable handoff for the RetroNomad project.

A new working session should read, in order:
1. `PROJECT_STATE.md`
2. `DECISIONS.md`
3. `ROADMAP.md`
4. `PRICING_V1.md`

The repository is the authoritative project handoff. Chat memory is supplementary and should not be treated as the sole record of product decisions.

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
- internal 100-title Pricing v1 coverage lab at `pricing-coverage.html`

## Pricing v1 first live-provider run

First real-key coverage run: 23 September 2026.

Result:
- 100/100 titles attempted
- 0 safe matches
- 100 initially reported as NO_PAL_MATCH

Interpretation:
- **Do not treat this as evidence that RetroTechCollector lacks all 100 PAL titles.**
- The all-or-nothing result is a systematic diagnostic signal.
- The original coverage lab collapsed several distinct cases into one NO_PAL_MATCH status after applying exact platform + PAL filters.
- Diagnostic v2 now records raw catalogue candidates before filtering and distinguishes:
  - NO_RESULTS
  - PLATFORM_MISMATCH
  - REGION_MISMATCH
  - weak/ambiguous/title conflicts
- Diagnostic v2 also removes the exact platform parameter from title discovery so provider platform labels can be observed rather than hidden by the request itself.

Next action: rerun the updated coverage lab with the same limited developer key and inspect the exported diagnostic JSON before changing production platform/region mappings.

## Pricing v1 diagnostic v2 result

Second real-key run: 23 September 2026.

Result:
- 100/100 titles attempted
- 91 NO_RESULTS
- 5 PLATFORM_MISMATCH
- 4 REGION_MISMATCH
- 0 safe matches under the old catalogue-first/PAL-required logic

What this established:
- RetroTechCollector's observed PS1 platform label is `Sony PlayStation`, not the originally assumed `PlayStation`.
- Valid Dreamcast catalogue rows can have `region: null`; null must not be silently treated as PAL.
- 71 of 72 UPC/EAN **catalogue** lookups returned no row. The one UPC catalogue hit was Rez.
- 28 titles used title search; only a minority returned candidate catalogue rows.
- The provider documentation states that `/prices` also supports UPC and title filters and returns pricing rows with a UPC field. Therefore catalogue coverage alone is not enough to judge pricing-provider fit.

Diagnostic v3 now:
- tests `/prices?upc=` first when RetroNomad has a safe barcode
- falls back to `/prices?search=`
- recognises observed platform aliases (including `Sony PlayStation`)
- fetches catalogue detail by `masterItemId` to inspect region separately
- distinguishes exact UPC price matches, PAL title-price matches, region-unknown title matches, catalogue-only rows and no provider match
- never treats a title-only match with unknown/non-PAL region as safe PAL pricing

Next action: run diagnostic v3 over the 100 launch titles and use that report to decide whether RetroTechCollector is viable enough to keep.

## PALScout compatibility verdict

Added to the public analyser on 23 September 2026.

PALScout now gives a dedicated hardware-compatibility result separately from the existing UK-market/release classification.

Launch behaviour:
- target is a standard, unmodified UK/European console for the detected launch platform (PS1, PS2 or Dreamcast)
- recognised PAL-family identifier evidence can produce a PAL-compatible verdict
- explicit NTSC-U / NTSC-J evidence produces a not-PAL-compatible verdict unless stronger PAL identifier evidence creates a conflict/review state
- generic PAL wording without stronger identifier evidence remains provisional
- a French/German/Spanish/Italian PAL copy can be hardware-compatible even though it is not a UK-market copy
- packaging/language, UK collector-market identity and hardware compatibility are intentionally separate questions
- modified consoles, import adapters and similar workarounds are outside the launch compatibility verdict

This makes the first user-facing PALScout question explicit: “Will this copy run on ordinary UK/European PAL hardware?”

## Pricing v1 diagnostic v3 result and provider decision

Third real-key run: 23 September 2026.

Result:
- 100/100 titles attempted
- 33 TITLE_PRICE_REGION_UNKNOWN
- 62 NO_PROVIDER_MATCH
- 4 WEAK_MATCH
- 1 UPC_PRICE_MATCH
- 1/100 safe matches
- 0 title-price matches explicitly confirmed PAL

Key interpretation:
- RetroTechCollector is not viable as RetroNomad's primary UK/PAL pricing provider for the current 100-title launch scope.
- The one release-safe exact identifier hit was Rez (Dreamcast), UPC/EAN 5060004761289.
- Region-unknown title matches cannot be used as PAL pricing. In many cases the provider returned a different UPC from RetroNomad's PAL/EAN seed, showing that title fallback can cross into another regional release.
- PS2 coverage was particularly poor in this launch test: no safe exact UPC/PAL title-price matches.
- Provider documentation states RetroTechCollector's market values come from PriceCharting.

Safety patch now live:
- provider platform aliases updated (including `Sony PlayStation`)
- exact-barcode pricing uses the price endpoint directly
- exact barcode/equivalent barcode + title/platform agreement is required
- if an exact PAL/UK barcode lookup misses, title fallback is blocked
- title-only pricing is allowed only when the matched provider catalogue row explicitly says PAL
- the serverless worker template enforces the same rules

Provider direction:
- RetroTechCollector remains only a limited possible exact-identifier supplemental source.
- PriceCharting direct is the strongest next candidate because its public catalogue contains dedicated PAL products with PAL EAN/GTIN/model metadata.
- PriceCharting's standard API/CSV terms are internal-use only; public third-party display requires a commercial licence and express written permission.
- Do not integrate or expose a normal PriceCharting token without permission.
- Manual Pricing v1 remains the safe fallback while licensed provider access is unresolved.

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
6. Barcode/UPC lookup is not trusted blindly: a provider row that conflicts with the classified game, or multiple similarly strong PAL rows, is rejected for manual review.
7. Fetch price by matched masterItemId.
8. Map CIB→cib, Loose→loose, New→new, Box Only→boxOnly, Manual Only→manualOnly.
9. Do not auto-price Incomplete or Condition-specific copies.
10. Convert USD→GBP with a daily central-bank reference rate via Frankfurter.
11. Populate the existing Pricing v1 form and comparison panel; do not label a purchase 'good' or 'bad'.

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

1. Pricing-provider validation for RetroTechCollector is complete; retain it only for exact-identifier supplemental matches.
2. Contact PriceCharting about a commercial/public-app licence for attributed PAL guide-price display.
3. In parallel, continue researching region-aware physical-game pricing sources with documented API/licensing terms.
4. Keep manual Pricing v1 as the default fallback until a licensed release-safe provider is available.
5. Once a provider is approved, run the same 100-title launch coverage benchmark before production integration.
6. Then validate full listing → classification → exact release → price → GBP conversion flow.
7. Add wishlist + target-price alerts after backend/serverless infrastructure exists.
8. Revisit authorised marketplace discovery, including eBay only if legitimate developer access becomes available.
9. Expand to NTSC-U, NTSC-J and more platforms only after UK/PAL pricing is stable.

## Durable project records

- `PROJECT_STATE.md`: current product state, implementation status and key evidence
- `DECISIONS.md`: durable product/architecture decisions and rationale, including the eBay developer-access history
- `ROADMAP.md`: completed milestones, active milestone, blockers and exit criteria
- `PRICING_V1.md`: detailed Pricing v1 provider and security rules

When a substantial session changes the project, update the relevant durable record before ending the session.

## Accuracy/transparency requirements

- Never fabricate favourable deal results.
- Never fake benchmark improvements.
- Never call something a Good Deal without a trustworthy price reference.
- 'Comparison-ready' means classification is ready; it does not mean the price is good.
- Unknown/ambiguous evidence must become Needs review.
- If a provider has no price or the mapping is ambiguous, show that honestly.


## Homepage product-positioning refresh

Completed 23 September 2026.

The public homepage now leads with the concrete buyer problem rather than abstract release classification.

Primary customer journey:
1. Check whether the physical copy appears compatible with standard UK/European hardware.
2. Identify the exact regional/physical release.
3. Check completeness and condition evidence.
4. Compare value only when a trusted release-safe pricing source is available.

Brand structure:
- RetroNomad remains the global parent product.
- PALScout is presented prominently as the UK/European compatibility + release-intelligence layer.
- US/NTSC-U and Japan/NTSC-J are shown as planned future regional intelligence layers.

Accuracy/marketing changes:
- removed the previous illustrative marketplace-results count that could imply automatic listing discovery is already live
- homepage now states that users submit listing URLs/text/photos today
- marketplace discovery is clearly marked planned
- exact-release valuation is clearly marked in development
- PAL compatibility is explicitly separated from UK-market identity and packaging/language
- compatibility scope is explicitly standard, unmodified UK/European hardware



## PALScout compatibility QA and URL-ingestion repair

Completed 23 September 2026.

Compatibility QA:
- representative UK exact PAL, continental PAL, NTSC-U, NTSC-J, unknown and conflicting-region cases were exercised
- mixed PAL + NTSC evidence now becomes review rather than an outright compatibility verdict
- common negated seller wording such as "UK PAL - not NTSC-US" no longer falsely triggers the NTSC path
- PlayStation serial prefixes are now used as hardware-region evidence:
  - SLES/SCES -> PAL Europe signal
  - SLUS/SCUS -> North America/non-PAL signal
  - SLPS/SLPM/SCPS/SCPM -> Japan/Asia-family non-PAL signal
- PAL-Europe serial evidence does not by itself claim a UK-specific release
- region detection now considers listing text, OCR-derived text and an explicitly supplied identifier
- the compatibility regression cases passed after the fixes

URL-ingestion repair:
- the current analyser still referenced `cleanUrlInput`, `detectListingSource`, `parseEbayUrl` and `importListingUrl`, but their definitions had disappeared during later analyser changes
- the helper block was restored from the earlier repository commit that introduced marketplace URL ingestion rather than reconstructed from memory
- syntax validation passes
- representative eBay URL parsing recovers item IDs and title slugs
- generic source detection still recognises eBay, Etsy and Vinted
- direct browser page import remains subject to marketplace CORS/access restrictions; eBay's full automatic listing import still requires authorised API/server-side access



## Search-first product direction

Confirmed 23 September 2026.

RetroNomad is now defined primarily as a **search and buying-intelligence product**.

The customer should come to RetroNomad to search for the game they want. RetroNomad should eventually discover authorised marketplace listings, then use PALScout/regional intelligence to classify and filter them before showing the user the best-matching copies.

Primary workflow:
Search -> Filter -> Compare -> Alert

PALScout's role:
Compatibility -> Region -> Exact release -> Edition -> Completeness

The listing analyser remains a useful secondary checker/debugging utility, but future development should not treat manual URL/text/photo submission as the main consumer experience.



## Reaffirmed original product concept

User restated the original concept from the prior chat on 23 September 2026.

RetroNomad is a **Retro Game Hunting Assistant** with one app containing:
1. Deal Finder
2. Wishlist + price alerts
3. "Should I buy this?" listing analysis
4. Photo / Lot Analyzer later

Build order:
- Phase 1: Deal Finder + Wishlist alerts
- Phase 2: "Should I buy this?" analysis
- Phase 3: Photo / Lot Analyzer
- Phase 4: More marketplaces + advanced collector features

This is consistent with the newly confirmed search-first direction. The current listing analyser should be treated as enabling technology and a future secondary utility, not the main consumer product.

PALScout remains the UK/European release-intelligence layer underneath Deal Finder, alerts and listing analysis.



## Phase 1 search shell

Completed 23 September 2026.

New public page:
`search.html`

The search-first shell now lets a user define:
- game
- platform
- PAL/UK release preference
- edition
- completeness
- condition preference
- English-friendly packaging/materials requirement
- bundle exclusion
- demo/promo exclusion
- maximum delivered GBP price

The page uses the existing release-evidence catalogue and currently resolves 100 unique launch game/platform pairs.

Current behaviour:
- builds a structured buying target
- shows the future live result-card contract
- can save targets locally in the browser as a prototype convenience
- explicitly states that alerts are not active
- explicitly states that no live marketplace source is connected
- does not fabricate listings or prices

Marketplace abstraction:
- `marketplace-source.js` provides a provider registry and normalisation layer
- `marketplace-listing.schema.json` defines the normalised listing contract
- `MARKETPLACE_V1.md` documents launch filters, target model, result-card fields and accuracy rules

The homepage now points primarily to Search RetroNomad and presents Search -> Filter -> Compare -> Alert as the main customer journey. The listing analyser remains linked as a secondary utility.



## Phase 1 matching engine

Completed 23 September 2026.

New module:
`search-matcher.js`

Purpose:
Evaluate a PALScout-classified marketplace candidate against the user's structured search target.

States:
- MATCH
- REVIEW
- FILTERED

The engine keeps hard requirements, unknown evidence and soft preferences separate.

Representative regression cases passed for:
- exact UK PAL match
- shared PAL match
- NTSC-U incompatibility
- wrong edition
- incomplete copy
- price ceiling failure
- unknown completeness
- continental PAL with unknown English/package suitability

UK-market preferred is deliberately treated as a ranking preference, not the same as UK exact only.

The search page now loads the matcher module. A live marketplace result still requires two upstream pieces:
1. an authorised marketplace inventory provider
2. reusable PALScout classification of each candidate listing

No live inventory is fabricated while those sources are unavailable.


## Reusable PALScout marketplace classifier

Completed 23 September 2026.

New modules:
- `palscout-classifier.js`
- `search-pipeline.js`

The Deal Finder pipeline is now structurally:

Authorised marketplace adapter
-> normalised marketplace listing
-> PALScout classification
-> RetroNomad target matcher
-> ranked MATCH / REVIEW / FILTERED results

`palscout-classifier.js` reuses the current 100-game launch catalogue and analyser aliases and returns:
- game
- platform
- item type
- compatibility state
- region signal
- release market bucket
- catalogue market context
- edition
- completeness
- English/package suitability when explicit
- bundle / promo state
- major condition concerns
- identifier evidence
- confidence
- review reasons / conflicts

Safety rules added for search use:
- title alone never proves a UK-exact release
- generic PAL wording without stronger evidence remains review
- identifier/title or identifier/platform conflicts force review
- UK_VISUAL_REQUIRED cannot become a strong search match without the missing visual/package evidence
- explicit wrong-region / wrong-edition / wrong-completeness candidates remain filterable by the matcher

Marketplace normalisation now preserves item specifics, condition text, identifiers, explicit language suitability and OCR text where a future authorised provider exposes them.

Synthetic end-to-end QA:
- 6 candidate FFVII listings were passed through a synthetic provider adapter
- outcome: 1 MATCH, 1 REVIEW, 4 FILTERED
- exact UK CIB under ceiling -> MATCH
- generic PAL without exact release evidence -> REVIEW
- NTSC-U -> FILTERED
- Platinum with original-only target -> FILTERED
- bundle with bundles excluded -> FILTERED
- price above delivered ceiling -> FILTERED

No synthetic provider is registered in the public site. It was used only for implementation QA; the public search still correctly reports that no live source is connected.


## Saved Hunts / wishlist foundation

Completed 23 September 2026.

New files:
- `saved-hunts.js`
- `saved-hunt.schema.json`
- `wishlist.html`
- `SAVED_HUNTS_V1.md`

Saved Hunts now replace the earlier bare localStorage target prototype.

Capabilities:
- create a versioned Saved Hunt from a Deal Finder search target
- prevent duplicate active targets
- automatically migrate old `retronomad_saved_targets` data
- list hunts in a dedicated wishlist page
- pause / resume / archive / delete
- record whether the user wants future alerts
- reopen a hunt into `search.html?hunt=<id>`
- export Saved Hunts as JSON
- store foreground last-checked summaries when a live provider eventually runs
- store/deduplicate matching-listing history by source + external ID

Regression tests passed for save, duplicate prevention, pause state, alert preference, foreground check metadata, match-history deduplication and legacy migration.

Important limitation:
- Saved Hunts are browser-local.
- monitoring state begins as NOT_RUNNING.
- alert state is UNAVAILABLE_STATIC_BETA.
- no scheduled background checks or real notifications exist yet.
- autonomous alerts require both backend infrastructure and an authorised live marketplace source.

