import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const api = read("app/api/internal/admin/judah/route.ts");
const workspace = read("app/api/internal/admin/judah/workspace/route.ts");
const mail = read("lib/judah-delivery.ts");
const auth = read("lib/judah-workspace.ts");
const unsubscribe = read("app/api/judah/unsubscribe/route.ts");
const registration = read("app/api/interest/route.ts");
const partner = read("app/api/internal/admin/judah/partners/route.ts");
const discover = read("app/api/internal/admin/judah/discover/route.ts");
const blog = read("app/blog/[id]/page.tsx");

test("JUDAH creative API is authenticated, same-origin and preview-only", () => {
  assert.match(api, /VERCEL_ENV\s*!==\s*"preview"/);
  assert.match(api, /isAdmin\(request\)/);
  assert.match(api, /sameOrigin\(request\)/);
  assert.match(api, /AI_GATEWAY_API_KEY/);
  assert.doesNotMatch(api, /sendEmail\(/);
});

test("Real email delivery requires independent live authorisation", () => {
  assert.match(mail, /VERCEL_ENV\s*===\s*"production"/);
  assert.match(mail, /JUDAH_LIVE_SENDING_AUTHORISED/);
  assert.match(auth, /JUDAH_EMAIL_ENABLED/);
  assert.match(auth, /JUDAH_MAIL_PRIVACY_APPROVED/);
  assert.match(auth, /REGISTRATION_ENABLED/);
  assert.match(auth, /SPECIAL_CATEGORY_PROCESSING_APPROVED/);
  assert.match(auth, /CONSENT_MIGRATION_APPLIED/);
  assert.match(mail, /Idempotency-Key/);
});

test("Campaign audience filtering requires affirmative updates permission and consent evidence", () => {
  assert.match(workspace, /w\.updates_opt_in=TRUE/);
  assert.match(workspace, /INNER JOIN public\.worship_consent_evidence/);
  assert.match(workspace, /judah_suppression/);
  assert.match(workspace, /wu-admin-test-/);
  assert.match(mail, /row\.updates_opt_in/);
  assert.match(mail, /row\.explicit_consent/);
  assert.match(mail, /row\.suppressed/);
});

test("Unsubscribe rechecks token and suppresses queued messages", () => {
  assert.match(unsubscribe, /verifyJudahMailToken/);
  assert.match(unsubscribe, /UPDATE public\.worship_interest SET updates_opt_in=FALSE/);
  assert.match(unsubscribe, /UPDATE public\.judah_deliveries SET status='suppressed'/);
  assert.match(auth, /createCipheriv\("aes-256-gcm"/);
  assert.match(auth, /createDecipheriv\("aes-256-gcm"/);
});

test("Registration defaults closed behind explicit legal and consent gates", () => {
  assert.match(registration, /REGISTRATION_ENABLED==="true"/);
  assert.match(registration, /PRIVACY_NOTICE_APPROVED==="true"/);
  assert.match(registration, /SPECIAL_CATEGORY_PROCESSING_APPROVED==="true"/);
  assert.match(registration, /explicitReligiousConsent!==true/);
});

test("Organisation targeting remains separate from real attendee records", () => {
  assert.match(partner, /judah_partners/);
  assert.doesNotMatch(partner, /FROM public\.worship_interest/);
  assert.match(discover, /q_organization_name/);
  assert.match(discover, /domain-search/);
  assert.doesNotMatch(discover, /person_emails|personal_emails|email_finder/);
});

test("Public blog requires both production and explicit public-enable flag", () => {
  assert.match(blog, /JUDAH_BLOG_PUBLIC_ENABLED/);
  assert.match(blog, /VERCEL_ENV/);
  assert.match(blog, /status='approved'/);
});

test("JUDAH source keeps previous homepage and SEO out of scope", () => {
  for (const file of ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts"]) {
    assert.ok(read(file).length > 0, file + " is present");
  }
});
