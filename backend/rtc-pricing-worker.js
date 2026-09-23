// RetroNomad Pricing v1 production proxy (Cloudflare Worker style).
// DO NOT deploy with a shared provider key until the provider has approved
// RetroNomad's intended public third-party display/use.
//
// Environment secrets/vars:
// RTC_API_KEY       - RetroTechCollector key with catalogue:read + prices:read
// ALLOWED_ORIGIN    - e.g. https://channel9ch9-source.github.io
//
// GET /price?game=Final%20Fantasy%20VII&platform=PS1&upc=0711719694328&bucket=CIB
//
// Response contains only the matched product, selected condition price,
// provider snapshot date, and USD->GBP conversion. It does not expose the key.

const RTC_BASE = "https://api.retrotechcollector.app/developer/v1";
const FX_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=GBP";

function platformAliases(p) {
  return { PS1: ["Sony PlayStation", "PlayStation"], PS2: ["Sony PlayStation 2", "PlayStation 2"], Dreamcast: ["Sega Dreamcast"] }[p] || [p || ""];
}

function platformMatches(row, platformCode) {
  return platformAliases(platformCode).includes(row.platform || "");
}

function barcodeEquivalent(a, b) {
  const x = String(a || "").replace(/\D/g, ""), y = String(b || "").replace(/\D/g, "");
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length === 13 && x[0] === "0" && x.slice(1) === y) return true;
  if (y.length === 13 && y[0] === "0" && y.slice(1) === x) return true;
  return false;
}

function bucketField(b) {
  return { CIB: "cib", Loose: "loose", New: "new", "Box Only": "boxOnly", "Manual Only": "manualOnly" }[b] || "";
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function score(row, game, platformCode) {
  let n = 0;
  const a = norm(row.name), b = norm(game);
  if (a === b) n += 100;
  else if (a.includes(b) || b.includes(a)) n += 55;
  if (String(row.region || "").toUpperCase().includes("PAL")) n += 25;
  if (platformMatches(row, platformCode)) n += 20;
  return n;
}

async function rtc(path, key) {
  const r = await fetch(RTC_BASE + path, {
    headers: { Authorization: "Bearer " + key, Accept: "application/json" }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || ("RTC HTTP " + r.status));
  return j;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "cache-control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "https://channel9ch9-source.github.io";
    const origin = request.headers.get("origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": allowed,
          "access-control-allow-methods": "GET,OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400"
        }
      });
    }
    if (origin && origin !== allowed) return json({ error: "origin_not_allowed" }, 403, allowed);
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405, allowed);
    if (!env.RTC_API_KEY) return json({ error: "provider_not_configured" }, 503, allowed);

    const u = new URL(request.url);
    if (u.pathname !== "/price") return json({ error: "not_found" }, 404, allowed);

    const game = (u.searchParams.get("game") || "").trim();
    const platformCode = (u.searchParams.get("platform") || "").trim();
    const upc = (u.searchParams.get("upc") || "").replace(/\D/g, "");
    const bucket = (u.searchParams.get("bucket") || "").trim();
    const field = bucketField(bucket);
    if (!game || !platformCode || !field) {
      return json({ error: "invalid_request", message: "game, platform and supported bucket are required" }, 400, allowed);
    }

    try {
      let best, p, matchBasis, matchRegion = null;

      if (upc.length >= 8 && upc.length <= 14) {
        const exact = await rtc("/prices?upc=" + encodeURIComponent(upc) + "&limit=20", env.RTC_API_KEY);
        const rows = (exact.data || []).filter(r =>
          String(r.category || "GAME").toUpperCase() === "GAME" &&
          platformMatches(r, platformCode) &&
          barcodeEquivalent(r.upc, upc)
        );
        if (!rows.length) return json({ error: "exact_identifier_price_unavailable" }, 404, allowed);

        rows.sort((a, b) => score(b, game, platformCode) - score(a, game, platformCode));
        best = rows[0];
        const bestScore = score(best, game, platformCode);
        const secondScore = rows[1] ? score(rows[1], game, platformCode) : -1;
        if (bestScore < 80) return json({ error: "identifier_conflict" }, 409, allowed);
        if (secondScore >= bestScore - 5) return json({ error: "ambiguous_match" }, 409, allowed);

        p = best;
        matchBasis = "exact_barcode";
      } else {
        const title = await rtc("/prices?search=" + encodeURIComponent(game) + "&limit=20", env.RTC_API_KEY);
        const rows = (title.data || []).filter(r =>
          String(r.category || "GAME").toUpperCase() === "GAME" &&
          platformMatches(r, platformCode)
        );
        if (!rows.length) return json({ error: "no_title_platform_price_match" }, 404, allowed);

        rows.sort((a, b) => score(b, game, platformCode) - score(a, game, platformCode));
        best = rows[0];
        const bestScore = score(best, game, platformCode);
        const secondScore = rows[1] ? score(rows[1], game, platformCode) : -1;
        if (bestScore < 80) return json({ error: "weak_match" }, 409, allowed);
        if (secondScore >= bestScore - 5) return json({ error: "ambiguous_match" }, 409, allowed);

        const detail = await rtc("/catalogue/" + encodeURIComponent(best.masterItemId), env.RTC_API_KEY);
        matchRegion = detail.data?.region || null;
        if (!String(matchRegion || "").toUpperCase().includes("PAL")) {
          return json({ error: "region_not_confirmed_pal" }, 409, allowed);
        }

        p = best;
        matchBasis = "title_explicit_pal";
      }

      const usd = Number(p[field]);
      if (!(usd > 0)) return json({ error: "price_unavailable", bucket }, 404, allowed);

      const fxRes = await fetch(FX_URL);
      if (!fxRes.ok) throw new Error("fx_unavailable");
      const fx = await fxRes.json();
      const rate = Number(fx?.rates?.GBP);
      if (!(rate > 0)) throw new Error("fx_rate_missing");

      return json({
        provider: "RetroTechCollector",
        masterItemId: best.masterItemId,
        name: best.name,
        platform: best.platform,
        region: matchRegion,
        upc: best.upc || null,
        matchBasis,
        bucket,
        priceUsd: usd,
        priceGbp: Math.round(usd * rate * 100) / 100,
        priceSnapshotDate: (p.scrapeDate || "").slice(0, 10) || null,
        fx: { base: "USD", quote: "GBP", rate, date: fx.date || null }
      }, 200, allowed);
    } catch (e) {
      return json({ error: "upstream_error", message: String(e.message || e) }, 502, allowed);
    }
  }
};
