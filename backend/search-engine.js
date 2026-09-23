// RetroNomad server-side search evaluation.
// Uses the same shared PALScout classifier + target matcher as the browser Deal Finder.

import { createPALScoutClassifier } from "../shared/palscout-core.js";
import { createSearchMatcher } from "../shared/search-matcher-core.js";
import { RELEASE_EVIDENCE } from "../shared/release-evidence-data.js";

const PALScout = createPALScoutClassifier(RELEASE_EVIDENCE);
const Matcher = createSearchMatcher();

export function classifyCandidate(target, listing) {
  const classified = PALScout.classifyMarketplaceListing(listing, {
    platform: target?.platform || ""
  });
  const match = Matcher.evaluate(target || {}, classified);
  return { ...classified, match };
}

export function evaluateNormalizedCandidates(target, listings = []) {
  const rows = (Array.isArray(listings) ? listings : []).map(listing =>
    classifyCandidate(target, listing)
  );
  return Matcher.sortEvaluated(rows);
}

export function summarizeEvaluated(rows = []) {
  const counts = { MATCH: 0, REVIEW: 0, FILTERED: 0 };
  for (const row of rows) {
    const state = row?.match?.state;
    if (Object.prototype.hasOwnProperty.call(counts, state)) counts[state]++;
  }
  return { total: rows.length, ...counts };
}

export function classifierForDiagnostics() {
  return PALScout;
}

export function matcherForDiagnostics() {
  return Matcher;
}
