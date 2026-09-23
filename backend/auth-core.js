// RetroNomad passwordless authentication helpers.
// Designed for Web Crypto environments such as Cloudflare Workers.

export const SESSION_COOKIE = "__Host-rn_session";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function validEmail(value) {
  const email = normalizeEmail(value);
  return email.length >= 5 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function randomToken(bytes = 32) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  let s = "";
  for (const b of a) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function isoAfterMinutes(minutes, from = new Date()) {
  return new Date(from.getTime() + Math.max(1, Number(minutes) || 1) * 60000).toISOString();
}

export function isoAfterDays(days, from = new Date()) {
  return new Date(from.getTime() + Math.max(1, Number(days) || 1) * 86400000).toISOString();
}

export function parseCookies(header = "") {
  const out = {};
  for (const part of String(header).split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function sessionTokenFromRequest(request) {
  return parseCookies(request.headers.get("cookie") || "")[SESSION_COOKIE] || "";
}

export function sessionCookie(token, maxAgeSeconds = 2592000) {
  return [
    SESSION_COOKIE + "=" + encodeURIComponent(token),
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=" + Math.max(0, Number(maxAgeSeconds) || 0)
  ].join("; ");
}

export function clearSessionCookie() {
  return sessionCookie("", 0);
}

export function safeReturnUrl(candidate, appOrigin) {
  const base = String(appOrigin || "").replace(/\/$/, "");
  if (!base) return "";
  try {
    const u = new URL(candidate || "/wishlist.html", base);
    if (u.origin !== new URL(base).origin) return base + "/wishlist.html";
    return u.toString();
  } catch {
    return base + "/wishlist.html";
  }
}

export function opaqueId(prefix = "id") {
  return prefix + "_" + randomToken(18);
}
