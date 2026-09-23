# RetroNomad Pricing v1

## Current automatic provider status

RetroTechCollector Developer/Data API was the first Pricing v1 automatic-provider pilot.

After three real-key coverage passes across the 100-title launch catalogue, it is **not suitable as RetroNomad's primary UK/PAL pricing provider**.

Final diagnostic-v3 result:
- 100/100 titles attempted
- 1 safe exact UPC/EAN price match
- 33 strong title/platform price matches whose catalogue region was null
- 62 no usable provider matches
- 4 weak matches
- 0 title-price matches with an explicitly confirmed PAL region

The single safe exact identifier hit was Rez on Dreamcast.

RetroTechCollector may remain as a **limited exact-identifier supplemental source**, but RetroNomad must not use its title-only values when release region is unknown.

Provider documentation states that its market values come from PriceCharting. The v3 results showed that title fallback frequently resolved to a different regional product record than RetroNomad's PAL identifier, so those values are not release-safe for the current product.

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
3. If a numeric barcode/EAN exists, query the provider price endpoint by that identifier.
4. Require an equivalent returned barcode, an allowed provider platform label, and strong title agreement.
5. **If the exact barcode price lookup misses, do not fall back to title pricing.** A failed PAL identifier followed by a title match can silently substitute an NTSC/other-region price.
6. If no numeric barcode is available, title search may be attempted.
7. A title-only price match is usable only when the provider catalogue detail explicitly identifies the matched record as PAL.
8. Reject weak and ambiguous matches.
9. Map the RetroNomad bucket to the provider field.
10. Convert USD to GBP using a daily central-bank reference FX rate.
11. Populate Pricing v1 only after a release-safe match.
12. Manual source-backed references remain available as fallback.

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
- tests the provider price endpoint by UPC/EAN first
- falls back to title-price discovery only for diagnostics
- records provider platform labels, UPCs, catalogue region and available price buckets
- rejects weak or ambiguous title matches
- distinguishes exact identifier matches from region-unknown title matches
- paces calls below the documented provider burst limit
- exports a JSON report that never contains the developer key

Real-key coverage validation is complete for the launch scope. The three diagnostic passes established that RetroTechCollector has only one release-safe exact-identifier price match in the current 100-title PAL launch set, so it is not the primary provider path going forward.

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

PriceCharting is now the strongest candidate to investigate for the next UK/PAL pricing route.

Why:
- its public catalogue has dedicated PAL platform namespaces
- PAL product pages expose EAN/GTIN/model metadata
- examples in the launch scope show PAL-specific product records for games such as Silent Hill, Silent Hill 2 and Rez
- its condition model maps closely to RetroNomad's loose/CIB/new/box/manual buckets

Constraint:
PriceCharting's API documentation says subscriber API/CSV data are licensed for internal use by default. Sharing price data inside an application used by third parties requires a commercial licence and express written permission.

Decision:
- do not use a normal subscriber token in RetroNomad
- do not scrape PriceCharting as a substitute for permission
- next step is to ask PriceCharting about a commercial agreement for a public application that identifies exact PAL releases and displays attributed current guide prices

MyPlayersVault is also worth monitoring because it publicly separates UK/PAL, NTSC-U and NTSC-J values, but no documented developer API suitable for RetroNomad has been established yet.

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
