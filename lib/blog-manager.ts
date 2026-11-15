import { createHmac, createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE = "wu_blog_editor";
let pool: Pool | undefined;
export function blogDb() {
  if (!process.env.DATABASE_URL) throw new Error("Neon database not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return pool;
}
export function blogSetupStatus() {
  const hash = (process.env.BLOG_ADMIN_PASSWORD_HASH || "").trim();
  const parts = hash.split(":");
  const saltValid = parts.length === 2 && /^[a-f0-9]{32,128}$/i.test(parts[0] || "");
  const digestValid = parts.length === 2 && /^[a-f0-9]{128}$/i.test(parts[1] || "");
  return {
    database: process.env.DATABASE_URL ? "ready" : "missing",
    sessionSecret: (process.env.BLOG_SESSION_SECRET || "").length >= 32 ? "ready" : "missing_or_too_short",
    passwordHash: saltValid && digestValid ? "ready" : (hash ? "incorrect_format" : "missing"),
    cms: process.env.BLOG_CMS_ENABLED === "true" ? "enabled" : "disabled",
  };
}
export function blogAuthReady() {
  const hash = process.env.BLOG_ADMIN_PASSWORD_HASH || "";
  const [salt, digest] = hash.split(":");
  return Boolean(process.env.DATABASE_URL && process.env.BLOG_SESSION_SECRET &&
    process.env.BLOG_SESSION_SECRET.length >= 32 &&
    salt && /^[a-f0-9]{32,128}$/i.test(salt) &&
    digest && /^[a-f0-9]{128}$/i.test(digest));
}
export function blogPasswordMatches(password: string) {
  if (!blogAuthReady() || password.length < 12 || password.length > 256) return false;
  const [salt, digest] = process.env.BLOG_ADMIN_PASSWORD_HASH!.split(":");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), 64);
  return timingSafeEqual(actual, Buffer.from(digest, "hex"));
}
function signature(value: string) {
  return createHmac("sha256", process.env.BLOG_SESSION_SECRET!).update(value).digest("hex");
}
export function newBlogSession() {
  const exp = String(Math.floor(Date.now() / 1000) + 6 * 60 * 60);
  return exp + "." + signature(exp);
}
export function blogAuthenticated(req: NextRequest) {
  if (!blogAuthReady()) return false;
  const value = req.cookies.get(COOKIE)?.value || "";
  const [expiry,mac] = value.split(".");
  if (!/^\d{10}$/.test(expiry||"") || !/^[a-f0-9]{64}$/.test(mac||"")) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number(expiry) < now || Number(expiry) > now + 6*60*60) return false;
  return timingSafeEqual(Buffer.from(signature(expiry),"hex"),Buffer.from(mac,"hex"));
}
export function blogSessionCookie(res: NextResponse, token: string, maxAge: number) {
  res.cookies.set(COOKIE, token, { httpOnly:true, secure:true, sameSite:"strict", path:"/", maxAge });
}
export function blogOriginValid(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try { const u = new URL(origin); return u.protocol === "https:" && u.host === req.nextUrl.host; }
  catch { return false; }
}
export function blogReply(body: object,status=200) {
  return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private","X-Robots-Tag":"noindex, nofollow","X-Content-Type-Options":"nosniff"}});
}
export function blogBlocked(req: NextRequest,writing=false) {
  if (!blogAuthenticated(req)) return blogReply({error:"Please sign into Blog Manager"},401);
  if (writing && !blogOriginValid(req)) return blogReply({error:"Invalid request origin"},403);
  return null;
}
export function blogFingerprint(req:NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  return createHash("sha256").update((process.env.BLOG_SESSION_SECRET||"")+":"+ip+":"+(req.headers.get("user-agent")||"")).digest("hex");
}
export function validSlug(value:unknown):value is string {
  return typeof value === "string" && value.length >= 3 && value.length <= 120 &&
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) &&
    value !== "why-worship-unscripted-birmingham-exists";
}
export function clean(value:unknown,max:number) {
  return typeof value==="string" ? value.trim().slice(0,max+1) : "";
}
