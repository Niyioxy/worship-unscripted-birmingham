import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
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
// Authenticated encryption keeps subscriber emails out of public URL parameters and logs.
function mailKey() {
  const secret=process.env.JUDAH_UNSUBSCRIBE_SECRET;
  if(!secret||secret.length<32)throw new Error("Unsubscribe secret missing");
  return createHash("sha256").update(secret).digest();
}
export function judahMailToken(email:string) {
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",mailKey(),iv);
  const data=Buffer.concat([cipher.update(email.trim().toLowerCase(),"utf8"),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),data]).toString("base64url");
}
export function verifyJudahMailToken(token:string) {
  if(token.length>600||!token||!/^[A-Za-z0-9_-]+$/.test(token))return null;
  try {
    const raw=Buffer.from(token,"base64url");
    if(raw.length<29)return null;
    const decipher=createDecipheriv("aes-256-gcm",mailKey(),raw.subarray(0,12));
    decipher.setAuthTag(raw.subarray(12,28));
    const email=Buffer.concat([decipher.update(raw.subarray(28)),decipher.final()]).toString("utf8");
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)&&email.length<=254?email:null;
  }catch{return null}
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
