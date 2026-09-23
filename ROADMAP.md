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

# Active milestone — Find a release-safe licensed pricing source

## PriceCharting commercial route
- [x] Confirm public PAL product catalogue exists with dedicated PAL platform namespaces and PAL EAN/GTIN records
- [x] Confirm standard API/CSV terms are internal-use only
- [ ] Contact PriceCharting for a commercial agreement / express written permission for RetroNomad
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

**Prepare and send a concise PriceCharting commercial-data enquiry describing RetroNomad's exact-PAL-release use case and asking for permission/terms for attributed public guide-price display.**

Do not purchase a normal PriceCharting API subscription for RetroNomad public use unless a suitable commercial agreement is confirmed.
