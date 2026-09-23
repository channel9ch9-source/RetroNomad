# Shared Classification Core v1

Last updated: 23 September 2026

## Purpose

RetroNomad's Deal Finder and scheduled Saved Hunt monitor must not maintain separate classification/matching rules.

The browser Deal Finder and backend monitor now use the same shared pure-logic modules.

## Files

Shared:
- `shared/palscout-core.js`
- `shared/search-matcher-core.js`
- `shared/release-evidence-data.js`

Browser adapters:
- `palscout-classifier.js`
- `search-matcher.js`
- `search-pipeline.js`

Backend:
- `backend/search-engine.js`
- `backend/alerts-worker.js`

## Browser flow

```
release-evidence.js
-> shared/palscout-core.js
-> shared/search-matcher-core.js
-> search-pipeline.js
```

The browser adapter scripts use dynamic module imports and preserve the historical globals:
- `window.PALScoutClassifier`
- `window.RetroNomadMatcher`

`search-pipeline.js` waits for both shared cores before evaluating candidates.

## Backend flow

```
authorised provider adapter
-> normalised marketplace rows
-> backend/search-engine.js
-> shared/palscout-core.js
-> shared/search-matcher-core.js
-> MATCH / REVIEW / FILTERED
-> Saved Hunt new-match detection
```

The provider adapter must not decide release identity itself.

It returns normalised listing evidence only.

## Shared evidence

The server-shareable evidence module currently mirrors the public `release-evidence.js` dataset.

Parity check on 23 September 2026:
- browser evidence rows: 217
- shared evidence rows: 217
- serialized datasets: exact match

Until the legacy analyser is migrated, `release-evidence.js` remains the practical source of truth and the shared mirror must be parity-tested whenever release evidence changes.

## Regression result

Representative FFVII target:

- PS1
- UK-market preferred
- original release only
- CIB
- English-friendly
- no bundles/promos
- <= £80 delivered

Candidate outcomes:
- exact UK CIB £75 -> MATCH
- generic PAL without safe release evidence -> REVIEW
- NTSC-U -> FILTERED
- Platinum -> FILTERED
- bundle -> FILTERED
- £95 delivered -> FILTERED

Result:
- 1 MATCH
- 1 REVIEW
- 4 FILTERED

## Important scope boundary

The shared core now controls:
- browser Deal Finder marketplace-result classification
- browser Deal Finder target matching
- scheduled backend Saved Hunt classification
- scheduled backend target matching

The richer `analyze.html` Phase 2 listing checker still contains UI/photo-specific embedded logic.

Do not claim that the manual listing analyser has already been fully migrated to the shared core.

A later refactor should feed its extracted photo/OCR/manual evidence into the shared classifier without losing its richer review workflow.
