import { createHmac, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "./admin-session";

let pool: Pool | undefined;
export function judahDb() {
  if (!process.env.DATABASE_URL) throw new Error("Database not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return pool;
}
export function judahJson(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow"
  }});
}
export function judahAdmin(request: NextRequest, writing = false) {
  if (process.env.VERCEL_ENV !== "preview") return judahJson({error:"Not found"},404);
  if (!isAdmin(request)) return judahJson({error:"Sign in as administrator"},401);
  if (writing && !sameOrigin(request)) return judahJson({error:"Invalid origin"},403);
  return null;
}
export function judahSendingReady() {
  return process.env.JUDAH_EMAIL_ENABLED === "true" &&
    process.env.REGISTRATION_ENABLED === "true" &&
    process.env.PRIVACY_NOTICE_APPROVED === "true" &&
    process.env.SPECIAL_CATEGORY_PROCESSING_APPROVED === "true" &&
    process.env.PROCESSOR_TERMS_APPROVED === "true" &&
    process.env.CONSENT_MIGRATION_APPLIED === "true" &&
    process.env.JUDAH_MAIL_PRIVACY_APPROVED === "true" &&
    Boolean(process.env.RESEND_API_KEY && process.env.JUDAH_FROM_EMAIL &&
      process.env.JUDAH_UNSUBSCRIBE_SECRET && process.env.JUDAH_UNSUBSCRIBE_SECRET.length >= 32);
}
export function judahEmailStatus() {
  return {
    ready: judahSendingReady(),
    providerConfigured: Boolean(process.env.RESEND_API_KEY && process.env.JUDAH_FROM_EMAIL),
    privacyApproved: process.env.JUDAH_MAIL_PRIVACY_APPROVED === "true",
    sendingEnabled: process.env.JUDAH_EMAIL_ENABLED === "true"
  };
}
export function judahMailToken(email: string) {
  const secret = process.env.JUDAH_UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 32) throw new Error("Unsubscribe signing secret missing");
  const payload = Buffer.from(email.trim().toLowerCase(),"utf8").toString("base64url");
  return payload + "." + createHmac("sha256",secret).update(payload).digest("base64url");
}
export function verifyJudahMailToken(token: string) {
  const secret = process.env.JUDAH_UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 32 || token.length > 600) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) ||
    !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;
  const expected = createHmac("sha256", secret).update(parts[0]).digest();
  const received = Buffer.from(parts[1],"base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected,received)) return null;
  const email = Buffer.from(parts[0],"base64url").toString("utf8");
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length<=254 ? email : null;
}
export async function judahAudit(action: string, kind?: string, id?: number, detail?: string) {
  await judahDb().query(
    "INSERT INTO public.judah_audit (action, object_kind, object_id, detail) VALUES ($1,$2,$3,$4)",
    [action,kind||null,id||null,detail?.slice(0,500)||null]
  );
}
export function intId(value: unknown): number | null {
  const v=typeof value==="number"?value:Number(value);
  return Number.isSafeInteger(v) && v>0 ? v : null;
}
export function field(value: unknown, max: number): string {
  return typeof value==="string" ? value.trim().slice(0,max+1) : "";
}
