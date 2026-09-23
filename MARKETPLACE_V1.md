# Marketplace Search v1

Last updated: 23 September 2026

This document defines RetroNomad's Phase 1 search target, marketplace-normalisation contract and result-card fields.

## Product role

RetroNomad is search-first.

Primary customer flow:

Search -> Filter -> Compare -> Alert

PALScout runs underneath the search experience and classifies candidate marketplace listings before they are eligible to appear as suitable matches.

The manual listing analyser is a secondary utility.

## Launch search target

Required:
- game

Optional / launch filters:
- platform: PS1 / PS2 / Dreamcast
- release preference:
  - any PAL-compatible copy
  - UK-market preferred
  - UK exact only
  - UK/shared PAL okay
  - any European PAL copy
- edition preference:
  - original release only
  - any edition
  - original or budget/reissue
- completeness:
  - complete in box
  - case + game; manual optional
  - loose acceptable
  - any completeness
- condition:
  - any usable condition
  - no known major damage
  - collector-quality preferred
- English-friendly packaging/materials required: yes/no
- exclude multi-game bundles: yes/no
- exclude demo/promo copies: yes/no
- maximum delivered price in GBP

Target-price logic is based on item price + postage when both are available.

## Search target model

```json
{
  "game": "Silent Hill",
  "platform": "PS1",
  "compatibility": "UK_EU_PAL",
  "releasePreference": "uk-preferred",
  "editionPreference": "original",
  "completeness": "cib",
  "condition": "no-major",
  "englishRequired": true,
  "excludeBundles": true,
  "excludePromo": true,
  "maxDeliveredGbp": 80
}
```

## Marketplace source abstraction

No marketplace-specific response format should leak into the classifier/search UI.

Every authorised provider adapter must expose:

```js
search(target) -> Promise<Array<providerListing>>
```

The provider result is normalised into RetroNomad's marketplace listing shape by `marketplace-source.js`.

Current required normalised fields:
- source
- externalId
- canonicalUrl
- title
- currency

Current optional / useful fields:
- description
- imageUrl
- itemPrice
- postage
- total
- seller
- listedAt
- fetchedAt
- sourceRegion
- raw provider payload

The JSON schema is:
`marketplace-listing.schema.json`

No live provider is registered in the public beta yet.

## Result-card contract

A future live result card should show only source-backed values.

Identity / source:
- marketplace
- listing title
- canonical listing URL
- image
- marketplace item ID

Price:
- item price
- postage
- delivered total
- currency
- exact-release reference value when licensed/available
- descriptive price position only when reference pricing is trustworthy

PALScout classification:
- compatibility verdict
- exact release / market bucket
- edition
- completeness
- language / packaging evidence
- condition concerns
- match confidence
- review reason when unresolved

Possible card states:
- strong match
- review required
- filtered / unsuitable
- reference price unavailable

Do not display a listing as a strong target match merely because the title matches the game.

## Safety / accuracy rules

- Unknown or conflicting release evidence remains review.
- Foreign-region evidence must not be silently converted into a UK/PAL match.
- PAL compatibility does not imply UK-market identity.
- Bundles, demos and promos remain separate when the user's target excludes them.
- Delivered-price ceilings should use item + postage, not item price alone.
- No fabricated live inventory, sold-price average or deal grade.
- Pricing remains downstream of safe release/completeness classification.

## Current implementation

Public search shell:
`search.html`

Current behaviour:
- uses the 100 launch game/platform pairs from `release-evidence.js`
- builds a structured target
- previews the exact result-card data contract
- can save a target to browser localStorage as a prototype convenience
- does not claim that saved targets are actively monitored
- clearly reports that no live inventory provider is connected

Future authorised marketplace adapters can register through `marketplace-source.js` without changing the core search target or result-card contract.


## Matching engine

Implementation:
`search-matcher.js`

The engine evaluates a classified marketplace candidate against the user's search target and returns one of:

- `MATCH` — no known hard mismatch and no unresolved requirement
- `REVIEW` — candidate may fit, but one or more required facts are missing/ambiguous
- `FILTERED` — candidate definitely violates at least one hard requirement

Current hard filters include:
- wrong game
- wrong platform
- known incompatible region/hardware
- UK-only target with non-UK release
- original-only target with budget/reissue/promo copy
- CIB target with incomplete/loose copy
- English-required target with confirmed non-English-friendly packaging/materials
- excluded bundles
- excluded demos/promos
- known major damage when disallowed
- delivered GBP price above the user's ceiling

Current review triggers include:
- unknown game/platform identity
- unconfirmed PAL compatibility
- ambiguous release territory
- unknown edition when edition matters
- unknown completeness when completeness matters
- unknown English/package suitability when required
- unknown delivered GBP price when a price ceiling is set

Soft preferences do not become hard filters. Example:
- `UK-market preferred` ranks UK exact / UK-shared results above other valid PAL-family copies, but does not automatically reject a suitable non-UK PAL copy.

Internal ranking currently prefers:
1. MATCH over REVIEW over FILTERED
2. stronger UK-market fit when UK is preferred
3. higher classification confidence
4. confirmed English-friendly packaging/materials
5. collector-quality evidence when preferred
6. lower delivered GBP price when otherwise comparable

The internal rank is not a public "deal score" and must not be presented as one.
