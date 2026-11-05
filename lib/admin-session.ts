import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
export const COOKIE_NAME = "wu_admin_session";
const MAX_AGE = 60 * 60 * 2;
const secret = () => process.env.ADMIN_API_SECRET;
export function configured() { return process.env.VERCEL_ENV === "preview" && !!secret() && secret()!.length >= 32; }
function digest(value: string) { return createHash("sha256").update(value).digest(); }
function mac(value: string) { return createHmac("sha256", secret()!).update(value).digest("hex"); }
export function matchesSecret(value: string) { return configured() && timingSafeEqual(digest(value), digest(secret()!)); }
export function createSession() {
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = String(expiry);
  return { value: payload + "." + mac(payload), maxAge: MAX_AGE };
}
export function validSession(value?: string) {
  if (!configured() || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^\d{10}$/.test(parts[0]) || !/^[0-9a-f]{64}$/.test(parts[1])) return false;
  const expires = Number(parts[0]);
  if (expires < Math.floor(Date.now() / 1000) || expires > Math.floor(Date.now() / 1000) + MAX_AGE) return false;
  return timingSafeEqual(Buffer.from(parts[1], "hex"), Buffer.from(mac(parts[0]), "hex"));
}
export function isAdmin(request: NextRequest) { return validSession(request.cookies.get(COOKIE_NAME)?.value); }
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.nextUrl.host && new URL(origin).protocol === "https:"; }
  catch { return false; }
}
