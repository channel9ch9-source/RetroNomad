# Search-first product direction

## Phase 1 — Deal Finder + Wishlist alerts
- [x] Confirm RetroNomad as the primary search destination for buyers
- [x] Reframe manual listing checker as a secondary utility
- [x] Define PALScout as the UK/European classification engine under search results
- [x] Add public search.html Phase 1 shell using the 100-game launch catalogue
- [x] Add browser-local saved-target prototype without claiming active alerts
- [x] Replace bare saved targets with versioned Saved Hunts model
- [x] Add wishlist.html management UI
- [x] Add legacy saved-target migration, duplicate prevention and JSON export
- [x] Add pause/archive/delete and future-alert preference state
- [x] Add foreground last-checked + match-history support
- [x] Reopen Saved Hunts directly in the Deal Finder search form
- [x] Add marketplace-source.js provider registry and normalised listing schema
- [x] Add reusable palscout-classifier.js for marketplace candidates
- [x] Preserve item specifics, condition, identifiers and language signals in normalised marketplace rows
- [x] Add search-pipeline.js: provider -> PALScout -> matcher -> ranked results
- [x] Run synthetic end-to-end pipeline QA with MATCH / REVIEW / FILTERED outcomes
- [x] Add strict Match / Review / Filtered search matcher
- [x] Regression-test representative UK PAL, shared PAL, NTSC, edition, completeness, price and ambiguity cases
- [x] Document the search/result contract in MARKETPLACE_V1.md
- [x] Design the search form, launch filters and search-results card
- [x] Define the listing-normalisation / marketplace-source abstraction
- [ ] Keep eBay integration disabled until legitimate developer access is available
- [ ] Connect a trusted release-safe pricing source after classification
- [x] Build Saved Hunts / wishlist foundation in the browser
- [x] Add provider-neutral scheduled monitor core
- [x] Add D1/SQLite persistence schema for server-side hunts, matches, monitor runs and notification queue
- [x] Add Cloudflare Worker-style scheduler scaffold with health/admin-test endpoints
- [x] Regression-test new-match deduplication, paused hunts and alert-request rules
- [x] Build passwordless account/session implementation
- [x] Build authenticated browser-to-backend Saved Hunt sync
- [x] Add deletion tombstones so multi-device sync cannot resurrect removed hunts
- [x] Add Account UI + wishlist sync controls + search save/sync hook
- [ ] Deploy/configure the account backend on a suitable same-site/custom-domain setup
- [ ] Configure transactional sign-in email delivery + abuse/rate controls
- [ ] Update privacy/account-data policy before enabling public accounts
- [ ] Add server-compatible PALScout + matcher execution
- [ ] Connect an authorised live marketplace inventory adapter
- [ ] Enable autonomous scheduled monitoring only after auth + live inventory are configured
- [ ] Add real notification delivery after user identity/contact verification exists

## Phase 2 — "Should I buy this?"
- [x] Core listing classifier prototype exists
- [x] PALScout compatibility verdict exists
- [ ] Rework analyser UX as a secondary decision-support tool
- [ ] Add trusted exact-release pricing comparison

## Phase 3 — Photo / Lot Analyzer
- [ ] Batch photo ingestion
- [ ] Multi-game identification
- [ ] Per-item release / completeness / value estimation
- [ ] Highlight items worth closer inspection

## Phase 4 — Expansion
- [ ] More authorised marketplaces
- [ ] NTSC-U / US regional intelligence
- [ ] NTSC-J / Japan regional intelligence
- [ ] Advanced collector features


# RetroNomad Roadmap

Last updated: 23 September 2026

This file tracks completed work, the active milestone, blockers and the order of future development.

## Product objective

Build RetroNomad into a trustworthy physical-game discovery assistant that can:

1. identify the exact physical release
2. determine whether the listing is comparison-ready
3. attach an appropriate reference price only after identity is safe
4. eventually discover authorised marketplace listings
5. let users track wanted releases and target prices

The order matters. Discovery and alerts are not useful if release identity is unreliable.

---

# Completed foundation

## Brand and public site
- [x] RetroNomad selected as parent brand
- [x] PALScout selected as UK/PAL regional intelligence layer
- [x] tagline established: "Find the right copy. Wherever it was released."
- [x] public GitHub Pages site
- [x] public analyser

## Launch reference data
- [x] 100-game launch scope
- [x] PS1: 40
- [x] PS2: 40
- [x] Dreamcast: 20
- [x] identifier-level release evidence
- [x] market-aware UK/PAL buckets
- [x] important country/shared-release exceptions documented

## Listing analyser
- [x] title + description input
- [x] generic URL ingestion where possible
- [x] eBay item-ID/title fallback
- [x] platform inference
- [x] completeness inference
- [x] edition detection
- [x] serial/barcode extraction
- [x] photo upload
- [x] local OCR
- [x] gallery component confirmation
- [x] condition flags
- [x] foreign-region veto
- [x] bundle handling
- [x] demo/promo separation
- [x] Comparison-ready / Review / Separate statuses

## Classifier benchmark
- [x] real/current-or-recent 50-listing benchmark
- [x] critical false-READY failure identified
- [x] classifier hardening
- [x] fixed benchmark full-detail rerun: 50/50 status matches
- [x] zero false-READY cases on that benchmark
- [x] limitation documented: not universal accuracy

## Pricing v1 manual layer
- [x] manual source-backed references
- [x] exact comparison keys
- [x] local persistence
- [x] pricing gate
- [x] descriptive comparison language
- [x] pricing schema

## Pricing v1 automatic beta
- [x] RetroTechCollector selected as first pilot provider
- [x] browser BYOK connector
- [x] sessionStorage-only key handling
- [x] catalogue search
- [x] PAL/platform filtering
- [x] supported condition-bucket mapping
- [x] USD→GBP conversion
- [x] weak/ambiguous provider match rejection
- [x] conflicting UPC/title rejection
- [x] serverless production proxy template
- [x] 100-title pricing coverage runner

## Durable project handoff
- [x] PROJECT_STATE.md
- [x] PRICING_V1.md
- [x] DECISIONS.md
- [x] ROADMAP.md

---

# Active milestone — Pricing v1 provider validation

## Goal
Determine whether RetroTechCollector is sufficiently complete and reliable for RetroNomad's initial 100-title PAL launch scope.

## Step 1 — obtain test API access
- [ ] Create/sign into a RetroTechCollector account controlled by the user
- [ ] Check current Developer API access/trial options before purchasing anything
- [ ] Create a limited RetroNomad beta key with:
  - [ ] `catalogue:read`
  - [ ] `prices:read`
- [ ] Do not paste the key into ChatGPT
- [ ] Do not commit the key to GitHub

## Step 2 — run coverage lab
Open:
`pricing-coverage.html`

- [x] Connect the developer key
- [x] Run the first 100-title pass
- [x] Reach 100/100 attempted titles
- [x] Export and inspect the first JSON report
- [x] Identify that the original harness collapsed every result into NO_PAL_MATCH after filtering
- [x] Add diagnostic v2 with raw candidate capture and separate platform/region mismatch states
- [x] Rerun all 100 titles with diagnostic v2
- [x] Export and inspect the diagnostic-v2 JSON report
- [x] Confirm provider platform-label mismatch and nullable region behaviour
- [x] Confirm UPC catalogue coverage is extremely sparse in this test
- [x] Add diagnostic v3 using the provider price endpoint first
- [x] Run all 100 titles with diagnostic v3
- [x] Export and inspect the diagnostic-v3 JSON report
- [x] Decide provider fit: RetroTechCollector is limited to exact-identifier supplemental use, not the primary UK/PAL source
- [x] Harden analyser and worker so failed exact PAL barcode lookups cannot fall back to another region's title price

## Step 3 — audit results
Final v3 outcome:
- [x] 1 safe exact UPC/EAN price match
- [x] 33 strong title/platform matches rejected because region was unknown
- [x] 62 no usable provider matches
- [x] 4 weak matches
- [x] no explicitly PAL title-price matches
- [x] provider limitation documented rather than hidden

Rules:
- do not force 100% coverage by weakening ambiguity thresholds
- do not guess missing UPCs
- do not relabel foreign editions to improve coverage
- preserve review states where evidence is genuinely ambiguous

## Step 4 — close provider pilot
- [x] fix evidence-supported platform mapping defects
- [x] document provider gaps
- [x] record final launch-scope coverage statistics in PROJECT_STATE.md
- [x] preserve strict ambiguity/region rules instead of forcing coverage

### Exit criteria for active milestone
Proceed only when:
- every one of the 100 launch titles has an understood outcome
- there are no known unsafe auto-match paths
- successful matches have been manually spot-checked
- remaining missing/ambiguous cases are documented rather than hidden

---

# Product clarity work while pricing response is pending

- [x] Add a dedicated PALScout compatibility verdict to the analyser
- [x] Separate PAL hardware compatibility from UK-market/country classification
- [x] Keep NTSC-U/NTSC-J, PAL territory, language/package and collector-market signals distinct
- [x] Redesign homepage messaging/layout around the simple customer journey: check compatibility → identify exact release → check completeness → compare value
- [ ] Add concise examples showing UK/EU, US and Japanese release use cases

# PALScout compatibility QA

- [x] Add PAL/NTSC compatibility verdict
- [x] Test UK exact PAL, continental PAL, NTSC-U, NTSC-J and unknown-region cases
- [x] Fix PAL+NTSC conflict handling so mixed evidence becomes review
- [x] Fix common negated wording such as "UK PAL - not NTSC-US"
- [x] Use PlayStation serial prefixes as region evidence without treating PAL-Europe as UK-specific
- [x] Run serial-prefix regression cases for SLES/SCES, SLUS/SCUS and Japan/Asia-family prefixes
- [x] Restore listing URL ingestion helpers that had been dropped from the current analyser
- [x] Smoke-test eBay URL item-ID/title parsing and Vinted source detection
- [x] Browser smoke-test exposed a hanging direct eBay metadata request
- [x] Add a 6-second timeout + graceful fallback to listing URL import
- [x] Re-test exposed a post-fetch UI hang on the eBay path
- [x] Replace eBay direct browser fetch with immediate URL-only fallback
- [x] Re-test the public analyser with a real eBay link: immediate recognition worked and item ID was recovered; title remains unavailable when the URL itself contains no usable title slug

# Active milestone — Find a release-safe licensed pricing source

## PriceCharting commercial route
- [x] Confirm public PAL product catalogue exists with dedicated PAL platform namespaces and PAL EAN/GTIN records
- [x] Confirm standard API/CSV terms are internal-use only
- [x] Identify PriceCharting's official commercial-permission route in its current Terms/API documentation
- [x] Draft the RetroNomad commercial-data enquiry
- [x] Send PriceCharting the commercial agreement / express written permission enquiry (23 Sep 2026)
- [ ] Ask specifically about attributed public display of current PAL loose/CIB/new/box/manual guide prices
- [ ] Ask about API quota, caching, attribution, redistribution and launch-stage pricing

## Other candidates
- [x] Note MyPlayersVault as a region-aware public-price candidate
- [ ] Establish whether it offers a documented developer API or commercial data feed
- [ ] Research additional UK/PAL physical-game pricing providers with legitimate API/licensing paths

## Provider acceptance test
Any replacement provider must:
- distinguish PAL from NTSC-U/NTSC-J
- support enough of the 100-title launch set to be useful
- expose exact identifiers or release-specific product IDs
- provide a documented public-app/licensing path
- survive the 100-title coverage benchmark before production use

# Later milestone — End-to-end listing → price validation

After a provider passes the launch benchmark:

- [ ] take a sample of real listing inputs
- [ ] classify through the normal analyser
- [ ] verify exact release/completeness key
- [ ] verify provider release match
- [ ] verify correct completeness price field
- [ ] verify GBP conversion
- [ ] verify ambiguous listings do not receive automatic prices
- [ ] verify foreign-region listings remain blocked from UK comparison paths

Exit criterion:
A representative sample must complete the full chain without known identity-to-price mismatches.

# Provider production decision

## Terms/permission
- [ ] contact/confirm RetroTechCollector terms for RetroNomad's intended public third-party display/use
- [ ] confirm whether a shared production integration is permitted
- [ ] document any attribution/caching/redistribution requirements

Do not deploy a shared key until permission is clear.

## If approved
- [ ] deploy serverless pricing proxy
- [ ] store provider key only as server-side secret
- [ ] restrict allowed origin
- [ ] add rate limiting
- [ ] add caching
- [ ] add provider-failure logging without secrets
- [ ] preserve ambiguity gates server-side
- [ ] remove need for ordinary users to provide their own key

---

# Wishlist + target-price alerts

Only after a backend/serverless layer exists:

- [ ] define wishlist data model
- [ ] store exact wanted release, not only game title
- [ ] allow target item price and/or landed price
- [ ] allow completeness preference
- [ ] support alert state
- [ ] avoid alerts when listing identity is unresolved
- [ ] add notification channel(s)

Static GitHub Pages alone is not sufficient for scheduled alerts.

---

# Marketplace discovery

## eBay
Current state:
**No authorised eBay developer access. Earlier developer application was rejected after appeal.**

Do not:
- evade the rejection
- scrape protected data as a substitute for authorised API use
- create misleading accounts
- spam applications

Future:
- [ ] maintain a functioning public RetroNomad prototype
- [ ] prepare a concise authorised Browse API use case
- [ ] reapply only when there is a materially stronger legitimate application
- [ ] use accurate identity/business/project information
- [ ] disclose prior rejection where appropriate
- [ ] if approved, integrate active listing discovery behind an authorised connector/backend

The classifier must remain marketplace-independent so users can paste listing data manually even without eBay API access.

## Other marketplaces
- [ ] research marketplaces with documented developer/API access
- [ ] assess terms before implementation
- [ ] keep discovery adapters separate from release classification

---

# Geographic/platform expansion

After UK/PAL launch flow is stable:

## Regions
- [ ] NTSC-U
- [ ] NTSC-J
- [ ] country-specific release intelligence beyond current PAL launch scope

## Platforms
Expand only with evidence-backed reference data and validation.

Potential future systems should not be added merely to inflate catalogue size.

---

# Accounts and cloud persistence

Deferred until a backend exists.

Possible future account features:
- [ ] cloud wishlist
- [ ] saved target prices
- [ ] alert history
- [ ] saved listing checks
- [ ] user preferences
- [ ] cross-device persistence

Do not bolt authentication onto the static prototype before there is a real server-side need.

---

# Ongoing quality rules

At every milestone:
- [ ] no fabricated deal results
- [ ] no invented benchmark gains
- [ ] no "Good Deal" label without a trustworthy reference basis
- [ ] no automatic price on unresolved identity
- [ ] no hidden fallback that converts ambiguity into a guess
- [ ] benchmark claims must name the benchmark/population
- [ ] update durable handoff files when state changes

---

# Immediate next action

**While waiting for PriceCharting's licensing response, design the search-first RetroNomad experience: launch filters, result-card data model and marketplace-source abstraction, while keeping the existing analyser as a secondary utility.**

Do not purchase a normal PriceCharting API subscription for RetroNomad public use unless a suitable commercial agreement is confirmed.
