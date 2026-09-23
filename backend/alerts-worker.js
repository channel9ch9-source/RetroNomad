// RetroNomad Saved Hunts monitor worker (Cloudflare Worker / D1 style).
//
// This is infrastructure scaffolding, not a deployed production service.
//
// Required bindings/secrets for a future deployment:
// DB                    - D1 database created from backend/schema.sql
// ADMIN_TOKEN           - secret for the internal manual run endpoint
// MARKETPLACE_PROVIDER  - remains "disabled" until an authorised provider adapter exists
// NOTIFICATION_PROVIDER - remains "disabled" until a real delivery integration exists
// CHECK_INTERVAL_MINUTES - optional, defaults to 60
//
// Important: this worker intentionally does NOT expose public CRUD endpoints for user hunts.
// User/account authentication must be designed before browser-local hunts are synced server-side.

import { runHunt } from "./monitor-core.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function parseJson(text, fallback = null) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function mapHunt(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    label: row.label,
    target: parseJson(row.target_json, {}),
    status: row.status,
    alertRequested: Boolean(row.alert_requested),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastCheckedAt: row.last_checked_at,
    nextCheckAt: row.next_check_at
  };
}

async function dueHunts(env, limit = 25) {
  const ts = new Date().toISOString();
  const q = await env.DB.prepare(
    `SELECT * FROM saved_hunts
     WHERE status = 'ACTIVE'
       AND alert_requested = 1
       AND (next_check_at IS NULL OR next_check_at <= ?)
     ORDER BY COALESCE(next_check_at, created_at) ASC
     LIMIT ?`
  ).bind(ts, limit).all();
  return (q.results || []).map(mapHunt);
}

async function seenKeys(env, huntId) {
  const q = await env.DB.prepare(
    "SELECT source, external_id FROM hunt_matches WHERE hunt_id = ?"
  ).bind(huntId).all();
  return new Set((q.results || []).map(r => String(r.source) + "|" + String(r.external_id)));
}

async function persistMatches(env, huntId, rows) {
  for (const row of rows) {
    await env.DB.prepare(
      `INSERT INTO hunt_matches
       (hunt_id, source, external_id, title, canonical_url, delivered_gbp, first_seen_at, last_seen_at, last_match_state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MATCH')
       ON CONFLICT(hunt_id, source, external_id) DO UPDATE SET
         title = excluded.title,
         canonical_url = excluded.canonical_url,
         delivered_gbp = excluded.delivered_gbp,
         last_seen_at = excluded.last_seen_at,
         last_match_state = 'MATCH'`
    ).bind(
      huntId, row.source, row.externalId, row.title, row.canonicalUrl,
      row.deliveredGbp, row.firstSeenAt, row.lastSeenAt
    ).run();
  }
}

async function persistRun(env, run) {
  await env.DB.prepare(
    `INSERT INTO monitor_runs
     (id, hunt_id, started_at, finished_at, provider_count, candidate_count, match_count, review_count, filtered_count, new_match_count, status, error_code, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    run.id, run.huntId, run.startedAt, run.finishedAt || null,
    run.providerCount || 0, run.total || 0, run.MATCH || 0, run.REVIEW || 0,
    run.FILTERED || 0, run.newMatchCount || 0, run.status,
    run.errorCode || null, run.errorMessage || null
  ).run();

  await env.DB.prepare(
    `UPDATE saved_hunts
     SET last_checked_at = ?, last_check_json = ?, next_check_at = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    run.finishedAt || null,
    JSON.stringify({
      total: run.total || 0,
      MATCH: run.MATCH || 0,
      REVIEW: run.REVIEW || 0,
      FILTERED: run.FILTERED || 0,
      newMatchCount: run.newMatchCount || 0,
      status: run.status
    }),
    run.nextCheckAt || null,
    run.finishedAt || new Date().toISOString(),
    run.huntId
  ).run();
}

function queueId(huntId, source, externalId) {
  const safe = [huntId, source, externalId].join("_").replace(/[^a-zA-Z0-9_-]+/g, "_");
  return "notify_" + safe.slice(0, 180);
}

async function persistNotification(env, item) {
  const id = queueId(item.huntId, item.source, item.externalId);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO notification_queue
     (id, hunt_id, source, external_id, channel, payload_json, created_at, status)
     VALUES (?, ?, ?, ?, NULL, ?, ?, 'PENDING')`
  ).bind(
    id, item.huntId, item.source, item.externalId,
    JSON.stringify(item.payload), new Date().toISOString()
  ).run();
}

async function searchAuthorisedInventory(target, env) {
  // Deliberate hard stop. Do not replace this with scraping.
  // Add a provider adapter only after RetroNomad has legitimate marketplace access.
  if (!env.MARKETPLACE_PROVIDER || env.MARKETPLACE_PROVIDER === "disabled") {
    const e = new Error("No authorised marketplace inventory provider is configured.");
    e.code = "provider_not_configured";
    throw e;
  }

  throw Object.assign(
    new Error("Configured marketplace provider has no adapter implementation yet."),
    { code: "provider_adapter_missing" }
  );
}

async function runOne(env, hunt) {
  return runHunt({
    hunt,
    search: target => searchAuthorisedInventory(target, env),
    loadSeenKeys: huntId => seenKeys(env, huntId),
    saveMatches: (huntId, rows) => persistMatches(env, huntId, rows),
    saveRun: run => persistRun(env, run),
    queueNotification: item => persistNotification(env, item),
    intervalMinutes: Number(env.CHECK_INTERVAL_MINUTES || 60)
  });
}

async function runDue(env, limit = 25) {
  if (!env.DB) throw new Error("DB binding is not configured.");
  const hunts = await dueHunts(env, limit);
  const results = [];
  for (const hunt of hunts) {
    results.push(await runOne(env, hunt));
  }
  return {
    due: hunts.length,
    completed: results.length,
    providerUnavailable: results.filter(x => x.run?.status === "PROVIDER_UNAVAILABLE").length,
    failed: results.filter(x => x.run?.status === "FAILED").length
  };
}

function authorisedAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === "Bearer " + env.ADMIN_TOKEN;
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);

    if (request.method === "GET" && u.pathname === "/health") {
      return json({
        service: "retronomad-saved-hunts-monitor",
        status: "scaffold_only",
        databaseConfigured: Boolean(env.DB),
        marketplaceConfigured: Boolean(env.MARKETPLACE_PROVIDER && env.MARKETPLACE_PROVIDER !== "disabled"),
        notificationsConfigured: Boolean(env.NOTIFICATION_PROVIDER && env.NOTIFICATION_PROVIDER !== "disabled"),
        userAuthConfigured: false,
        publicHuntSyncEnabled: false
      });
    }

    if (request.method === "POST" && u.pathname === "/internal/run-due") {
      if (!authorisedAdmin(request, env)) return json({ error: "unauthorised" }, 401);
      try {
        return json(await runDue(env, Math.min(100, Math.max(1, Number(u.searchParams.get("limit") || 25)))));
      } catch (e) {
        return json({ error: "run_failed", message: String(e.message || e) }, 500);
      }
    }

    if (u.pathname.startsWith("/api/hunts")) {
      return json({
        error: "user_auth_not_configured",
        message: "Public Saved Hunt sync is intentionally disabled until a real account/authentication layer exists."
      }, 501);
    }

    return json({ error: "not_found" }, 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDue(env, 25));
  }
};
