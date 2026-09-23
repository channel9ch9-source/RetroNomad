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

- [ ] Connect the developer key
- [ ] Run/resume all 100 launch titles
- [ ] Reach 100/100 attempted titles unless a provider quota/service error blocks the run
- [ ] Export the JSON coverage report
- [ ] Upload only the exported report for analysis

## Step 3 — audit results
For every non-clean result, categorise it as one of:
- [ ] RetroNomad mapping/data defect
- [ ] provider catalogue gap
- [ ] genuinely ambiguous physical release
- [ ] identifier conflict
- [ ] provider price gap
- [ ] API/service error

Rules:
- do not force 100% coverage by weakening ambiguity thresholds
- do not guess missing UPCs
- do not relabel foreign editions to improve coverage
- preserve review states where evidence is genuinely ambiguous

## Step 4 — fix and rerun
- [ ] fix only evidence-supported mapping/data defects
- [ ] rerun affected titles
- [ ] document remaining provider gaps
- [ ] record final launch-scope coverage statistics in PROJECT_STATE.md

### Exit criteria for active milestone
Proceed only when:
- every one of the 100 launch titles has an understood outcome
- there are no known unsafe auto-match paths
- successful matches have been manually spot-checked
- remaining missing/ambiguous cases are documented rather than hidden

---

# Next milestone — End-to-end listing → price validation

After provider coverage is understood:

- [ ] take a sample of real listing inputs
- [ ] classify through the normal analyser
- [ ] verify exact release/completeness key
- [ ] verify provider catalogue match
- [ ] verify correct completeness price field
- [ ] verify GBP conversion
- [ ] verify ambiguous listings do not receive automatic prices
- [ ] verify foreign-region listings remain blocked from UK comparison paths

Exit criterion:
A representative sample must complete the full chain without known identity-to-price mismatches.

---

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

**Create or sign into the user's RetroTechCollector account, inspect the currently available API/trial option, then create a limited beta key and run the 100-title coverage lab.**

Do not purchase a plan until the currently available trial/API access path has been checked.
