# RetroNomad Decisions

Last updated: 23 September 2026

This file records durable product, architecture and evidence decisions for RetroNomad so future work does not depend on reconstructing old ChatGPT conversations.

A new working session should read:
1. `PROJECT_STATE.md`
2. `DECISIONS.md`
3. `ROADMAP.md`
4. `PRICING_V1.md`

## 1. Product identity

### Parent brand
**RetroNomad**

Purpose: a global retro-game buying/deal-finder assistant for physical games.

Tagline:
**Find the right copy. Wherever it was released.**

### Regional intelligence layer
**PALScout**

PALScout is the UK/European release-identification layer inside RetroNomad. It is not the parent brand because the product is intended to expand beyond PAL territories.

### Core product principle
**Identify the exact physical release before comparing price.**

RetroNomad must not compare unlike:
- games
- platforms
- regions
- editions
- budget lines
- completeness states
- item types
- bundles
- condition-specific copies where condition materially changes the comparison

If identity or comparability is uncertain, the result must move to review rather than being guessed.

---

## 2. Evidence philosophy

Evidence priority:

1. Exact verified catalogue/barcode/reference match when unique
2. Positive visual/gallery evidence across the listing
3. Explicit seller title/description
4. Marketplace item specifics
5. Generic product metadata

Important rules:
- Conflicting evidence lowers confidence and forces review.
- Absence from one photograph is not proof a component is missing.
- Possible reproductions should be held for review rather than accused from weak signs.
- Explicit foreign-territory evidence must not be silently admitted to a UK/PAL comparison bucket.
- A provider/API result does not override RetroNomad's classified identity merely because an identifier query returned something.

---

## 3. Classification model

Required classification fields:
- Game
- Platform
- Item type
- Region
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

Current UK/PAL market buckets:
- `UK_EXACT`
- `UK_SHARED_PAL`
- `UK_COMPATIBLE_EU_ENGLISH`
- `UK_VISUAL_REQUIRED`
- `NO_OFFICIAL_UK_RETAIL`
- `EUROPE_UNRESOLVED`

### Special handling decisions
- Bundles remain separate from single-item comparisons.
- Demo/promo products remain separate.
- A normal retail game that includes a bonus demo disc is not itself a demo product.
- Release-family collisions must be blocked rather than fuzzily merged.
- Condition changes comparison status/bucket, not the underlying release identity.
- Rule of Rose PS2 must not be represented as a normal UK retail release.
- Dreamcast `-50` codes are European, not inherently UK-only.

---

## 4. Launch catalogue scope

Initial launch library:
- 40 PS1 games
- 40 PS2 games
- 20 Dreamcast games
- 100 game/platform pairs total

Current release evidence is deliberately market-aware rather than assuming one PAL SKU equals one country.

The first expansion beyond launch scope should happen only after the UK/PAL classifier and Pricing v1 flow are validated end to end.

---

## 5. Validation standard

A fixed 50-listing UK marketplace benchmark was used to harden the classifier.

Initial benchmark:
- Decision/status: 39/50
- Game ID: 45/50
- Platform: 50/50
- Edition: 47/50
- Completeness: 36/50

A critical failure was identified where a Japanese NTSC-J Shenmue II listing could enter a shared-PAL READY path.

Fixes included:
- foreign-region veto
- bundle detection
- bonus-demo vs demo-product separation
- title aliases
- release-family separation
- completeness phrase expansion
- incomplete/missing-disc parsing
- seller-text condition parsing
- parent-title overlap pruning
- magazine/demo item-type separation

The preserved full-detail rerun reached 50/50 benchmark status matches with zero false-READY cases.

**Decision:** never describe that as universal 100% classifier accuracy. It applies only to the fixed benchmark.

---

## 6. Pricing v1

### Pricing gate
Automatic pricing only runs after the listing is **Comparison-ready**.

"Comparison-ready" means release/completeness classification is ready for comparison. It does **not** mean the listing is cheap, valuable, or a good purchase.

### Manual pricing first
Manual source-backed references were implemented before automatic pricing.

Manual references may include:
- market/price-guide reference
- personal target price
- manual comparable
- low / typical / high
- source name
- source URL
- date
- item-only vs landed basis

References are stored by the exact comparison key rather than just the game title.

### First automatic provider
**RetroTechCollector** was selected for the first automatic-pricing beta because its documented Developer Data API exposes:
- game catalogue metadata
- platform
- UPC/EAN
- release region
- latest pricing snapshots
- loose / CIB / new / box-only / manual-only pricing
- browser CORS support
- developer-key access

### RetroTechCollector validation decision — 23 September 2026

Three real-key launch-scope diagnostics were completed.

Final v3:
- 1/100 safe exact UPC/EAN price match
- 33 title/platform price matches with unknown region
- 62 no usable provider match
- 4 weak matches
- 0 title-price matches explicitly confirmed PAL

Permanent decision:
- RetroTechCollector is **not** the primary UK/PAL pricing provider.
- Keep it only as a possible exact-identifier supplemental source.
- If RetroNomad has an exact barcode/EAN and the provider does not return that exact/equivalent barcode, do not fall back to a title price.
- A title-only match is usable only if the provider explicitly confirms PAL on that exact matched record.
- Unknown provider region is not evidence of PAL.
- Do not weaken this rule to improve apparent coverage.

The live analyser and production-worker template were updated to enforce this.

### Next pricing-provider direction

PriceCharting is the strongest next candidate because its public catalogue contains dedicated PAL products with EAN/GTIN metadata and region-specific guide prices.

However, its standard API/CSV licence is internal-use only. Public third-party application display requires a commercial agreement and express written permission.

Decision:
- seek permission/commercial terms before integration
- do not expose a normal PriceCharting token
- do not scrape around the licence
- continue manual Pricing v1 fallback until a release-safe licensed source is available

### Beta key model
Use BYOK (bring your own key).

The developer key:
- is entered by the user
- is stored only in browser `sessionStorage`
- is never committed to GitHub
- is never included in exported pricing reports
- is sent directly from the browser to the provider in beta mode

Required scopes:
- `catalogue:read`
- `prices:read`

### Matching safety
Automatic pricing must:
1. require Comparison-ready classification
2. prefer UPC/EAN where a numeric identifier exists
3. otherwise search by exact game + mapped platform
4. require PAL + exact provider platform in current launch mode
5. reject weak matches
6. reject ambiguous similarly scored matches
7. reject an identifier result whose returned title conflicts with the classified game
8. fetch price only after a safe catalogue match
9. map only supported completeness buckets
10. leave incomplete/condition-specific copies manual

### FX
Provider USD price snapshots are converted to GBP with a daily reference FX rate.

This is for reference-price comparison, not live trading.

### Product language
Allowed descriptive language includes:
- below reference
- near typical reference
- above reference
- reference unavailable
- provider match ambiguous

Do not fabricate a provider price or convert weak identity evidence into a pricing conclusion.

---

## 7. PriceCharting decision

PriceCharting remains a possible future provider.

It was not chosen for the initial public beta because its API/documentation places restrictions around displaying subscriber data in third-party applications without appropriate commercial permission.

**Decision:** do not expose a normal subscriber token in the public app and do not build a public integration until licensing/permission is clear.

---

## 8. Hosting and backend architecture

Current hosting:
**Static GitHub Pages**

GitHub Pages is suitable for:
- the public landing page
- browser-side classification
- local OCR
- user-supplied API keys
- browser-local pricing references
- public/static release evidence

GitHub Pages is not suitable for safely holding:
- shared API secrets
- user accounts
- server-side rate limits
- scheduled alerts
- background marketplace discovery
- protected production integrations

### Production pricing
A production shared RetroTechCollector key must never be embedded in client-side GitHub Pages.

A serverless/backend proxy is required with:
- secret storage
- origin restriction
- rate limiting
- cache
- failure logging that excludes secrets
- the same ambiguity/review rules as the browser beta

Template:
`backend/rtc-pricing-worker.js`

Do not deploy a shared-key pricing service until provider permission for RetroNomad's intended public display/use has been confirmed.

---

## 9. eBay decision and history

RetroNomad's long-term marketplace-discovery concept included authorised eBay listing discovery.

The earlier eBay developer application was rejected, including after appeal, under eBay's internal eligibility/risk controls.

### Permanent decision
Do **not**:
- evade the rejection
- create misleading identities/accounts
- conceal the earlier rejection
- spam repeated applications
- scrape or imitate an authorised API workflow in a way that violates eBay rules

### Future reapplication approach
If reapplying later:
- use accurate real information
- use a project/business email where appropriate
- point to the functioning public RetroNomad prototype
- clearly describe the intended authorised Browse API use
- disclose the earlier rejection if asked/relevant
- show that RetroNomad has a legitimate working classifier/product rather than only an idea

### Product architecture while eBay is unavailable
Keep marketplace discovery decoupled from:
- release classification
- pricing
- wishlist logic
- target prices

RetroNomad should still be useful when a user supplies a listing URL/text/gallery manually.

Potential future architecture:
- authorised marketplace API: active listing discovery
- RetroNomad classifier/reference DB: exact physical release identification
- licensed/approved pricing source: valuation reference
- user wishlist/target prices: alert logic

Do not invent an "average eBay sold price" without a legitimate data source.

---

## 10. OCR and listing ingestion

Current browser-side design:
- listing title + description input
- public URL ingestion where browser/CORS permits
- eBay item-ID/title fallback
- up to 6 uploaded listing images
- Tesseract.js OCR in the browser
- gallery component confirmation
- serial/barcode candidate extraction

Decision:
OCR and page metadata are evidence sources, not identity authorities. Low-confidence OCR must not override exact verified evidence.

---

## 11. Security and privacy

Current beta principles:
- no shared secrets in GitHub
- API keys are not exported
- user-supplied listing images are processed locally for OCR
- local pricing references remain browser-local unless the user deliberately exports them
- backend/account persistence is deferred until a real backend exists

---

## 12. Features deliberately deferred

Do not prematurely add:
- accounts
- cloud persistence
- shared API keys in the frontend
- scheduled alerts on static hosting
- broad NTSC-U / NTSC-J expansion
- large platform expansion
- automated marketplace discovery without authorised access

First prove the current UK/PAL classification + pricing chain.

---

## 13. Current validation tooling

`pricing-coverage.html` is the internal 100-title Pricing v1 validation runner.

It:
- derives all 100 launch game/platform pairs from release evidence
- prefers safe numeric barcodes when available
- falls back to title/platform search
- requires PAL + exact platform
- applies strong/ambiguous-match guards
- fetches provider price buckets only after a safe catalogue match
- exports a JSON report without the API key

Creating this tool does **not** count as completing provider validation.

A real developer-key run still has to be performed and reviewed.

---

## 14. Durable handoff rule

Any substantial future RetroNomad session should update these files before ending if project state changed:
- `PROJECT_STATE.md`
- `DECISIONS.md`
- `ROADMAP.md`
- `PRICING_V1.md` when pricing behaviour changes

The repository is the authoritative handoff. Chat memory is supplementary, not the project database.
