import type { Pool, PoolClient } from "pg";

export type InterestSubmission = {
  fullName: string;
  email: string;
  phone: string;
  interest: "attend" | "music" | "volunteer";
  firstTime: boolean;
  updates: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInterestSubmission(body: Record<string, unknown>): InterestSubmission {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const interest = body.interest;
  const firstTime = body.firstTime;
  if (!fullName || fullName.length > 120 || !emailPattern.test(email) || email.length > 254 ||
      phone.length > 30 || !["attend", "music", "volunteer"].includes(String(interest)) ||
      !["yes", "no"].includes(String(firstTime)) || body.consent !== true) {
    throw new Error("Please check your details and consent before submitting.");
  }
  return {
    fullName, email, phone,
    interest: interest as InterestSubmission["interest"],
    firstTime: firstTime === "yes",
    updates: body.updates === true
  };
}

export async function saveInterestSubmission(db: Pool | PoolClient, entry: InterestSubmission) {
  await db.query(
    `INSERT INTO public.worship_interest
     (full_name,email,phone,interest,first_time,updates_opt_in)
     VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(email) DO UPDATE SET
     full_name=EXCLUDED.full_name,phone=EXCLUDED.phone,
     interest=EXCLUDED.interest,first_time=EXCLUDED.first_time,
     updates_opt_in=EXCLUDED.updates_opt_in,consent_at=NOW(),
     updated_at=NOW(),last_interaction_at=NOW()`,
    [entry.fullName,entry.email,entry.phone||null,entry.interest,entry.firstTime,entry.updates]
  );
}

/**
 * Separate Article 9 explicit-consent evidence.
 * The public endpoint calls this inside the same transaction as its registration.
 * Do not call without checking consent flags and recording the exact text version.
 */
export const SPECIAL_CATEGORY_CONSENT_VERSION = "religious-interest-v1-2026-11";
export async function savePublicInterestSubmission(
  db: PoolClient, entry: InterestSubmission, consentVersion: string
) {
  if (consentVersion !== SPECIAL_CATEGORY_CONSENT_VERSION) {
    throw new Error("Consent statement version mismatch");
  }
  await saveInterestSubmission(db, entry);
  await db.query(
    `INSERT INTO public.worship_consent_evidence (email, statement_version, consented_at, updated_at)
     VALUES ($1,$2,NOW(),NOW())
     ON CONFLICT(email) DO UPDATE SET statement_version=EXCLUDED.statement_version,
       consented_at=EXCLUDED.consented_at,updated_at=NOW()`,
    [entry.email, consentVersion]
  );
}
