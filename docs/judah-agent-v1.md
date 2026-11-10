# JUDAH — Integrated Agent Build (November 2026)

This supersedes the initial JUDAH v1 draft specification. Source: `feature/judah-agent-v1`.
This is a complete **development implementation**, not an authorisation to send emails, publish posts or process live registration data. It cannot be called production-ready until configuration, database migrations, privacy review, and end-to-end testing are completed.

## Purpose and identity

JUDAH supports Worship Unscripted Birmingham, an independent interdenominational Christian worship initiative in Birmingham, UK. Its work is content creation, registration administration, approved follow-up and partnership development.

**Non-negotiable programme facts:** Venue and first event date are NOT confirmed; proposed gathering Saturday evenings around 6–8 pm and 15–20 people total. Public registration is NOT open. JUDAH must not invent event details, spiritual testimonies, attendee identities, permission or commitments.

## What is built

### 1. Admin dashboard
- `/admin` remains the protected registration admin.
- `/admin/judah` is a dedicated Preview-only JUDAH command centre with Overview, Content, Email Campaigns and Partnerships tabs.
- Shows aggregate registration totals (attendance/music/volunteer/updates opt-in), activity, email configuration and queue delivery counts.
- Personal registration details remain in the existing protected admin interface; JUDAH never exports them to an AI provider.

### 2. AI content studio
- Server-side AI Gateway endpoint `/api/internal/admin/judah`.
- Blog/article, social captions and opt-in email copy drafts with context-specific instructions.
- Editable title/channel/body; save as draft, approve or archive.
- Approval is a human decision recorded in `judah_content`; **no automated posting to Instagram, LinkedIn or Facebook**.
- Public blog routes `/blog` and `/blog/[id]` display approved website articles only when `JUDAH_BLOG_PUBLIC_ENABLED=true` in production. Otherwise no articles are exposed and indexing is disabled.

### 3. Campaign composer and workflow
- Draft subject/body, optional interest segment, human approval, scheduling, pause/archive, audit trail.
- The queue is populated from *only* explicit special-category consent evidence + separate optional updates opt-in; also excludes suppression and synthetic tests.
- Daily `09:00 UTC` Vercel Cron entry `/api/cron/judah`; picks at most 10 records per invocation.
- Resend integration with idempotency keys and last-moment consent, campaign-status and suppression rechecks.
- Failed/uncertain requests are not automatically retried, because a provider timeout may still have delivered. Errors remain visible.
- Live delivery is blocked unless **all** explicit production flags and email provider configuration are in place.
- Optional one-address Preview test emails, limited to one per five minutes using a separately configured test mailbox.

### 4. Welcome automation
- Migration 007 adds a single evergreen welcome template.
- Admin may approve a suitable all-categories email and mark it as the prepared welcome template.
- When registration is lawfully enabled and `JUDAH_WELCOME_AUTOMATION_ENABLED=true`, opted-in registrations with explicit consent can be enqueued after the database transaction commits; idempotently.
- Enrollment does not send mail. The cron dispatcher remains separately locked.
- A welcome campaign can be paused/disabled; queued mail for that template is suppressed. No welcome messages are permitted before authorisation.

### 5. Opt-out and consent
- `/unsubscribe` page (never indexed), with server-side POST endpoint `/api/judah/unsubscribe`.
- Authenticated-encrypted single-purpose token protects email addresses in the URL.
- Opting out sets optional updates to false, persists suppression and suppresses pending queued deliveries. It does **not** remove the underlying registration or consent-evidence record; handle deletion and access rights through the documented administration process.
- Keep `JUDAH_UNSUBSCRIBE_SECRET` stable and securely backed up to prevent breaking issued links.

### 6. Outreach and targeting
- **Separate** organisation-only partner CRM (migration 006), distinct from attendee and religious-interest data.
- Target groups: Birmingham churches, worship teams, studio hire providers, community groups, sponsors and other relevant organisations.
- Stores organisation name, website, locality, sector, source/provider, review stage, assessed lawful basis, notes and audit activity.
- Apollo API: optional organisation search only using `APOLLO_API_KEY`.
- Hunter API: optional domain/organisation matching only using `HUNTER_API_KEY`. Does **not** transfer discovered individual email addresses or people records into JUDAH.
- useGTM: manually attributed organisation source and text bulk-import. Its documented integration/API capability has **not** been confirmed; do not claim direct API connectivity.
- Up to 40 organisation-only bulk rows per import, format `Organisation | https://site.example | studio`. No personal contact uploads.
- No prospecting sends or auto-enrichment of attendee data. Research suggestions still need independent checking and legal assessment.

## Deployment environment and database

Apply the following migrations to a **separate approved Preview database first**, in order:
- `001_create_worship_interest.sql`, `002_add_retention_tracking.sql`, `003_admin_accounts.sql`, `004_explicit_consent_evidence.sql` (existing preconditions).
- `005_judah_workspace.sql` content, campaigns, deliveries, suppression, audit.
- `006_judah_partner_pipeline.sql` partnership CRM.
- `007_judah_welcome_sequence.sql` evergreen welcome campaign columns.

Never expose Neon `DATABASE_URL` or any provider keys in website code, browser logs, screenshots or chat.

**Preview environment:**
- `DATABASE_URL`, `ADMIN_API_SECRET`, previously provisioned admin account.
- `AI_GATEWAY_API_KEY`, `JUDAH_MODEL` (active model ID confirmed in AI Gateway).
- `APOLLO_API_KEY` / `HUNTER_API_KEY` optional, server-side.
- `RESEND_API_KEY`, `JUDAH_FROM_EMAIL`, `JUDAH_PREVIEW_TEST_ENABLED=true`, `JUDAH_TEST_EMAIL` optional for one-address test only.
- `JUDAH_UNSUBSCRIBE_SECRET` random secret ≥32 chars for opt-out link creation and verification.
- `JUDAH_EMAIL_ENABLED=false`, `JUDAH_MAIL_PRIVACY_APPROVED=false`, `JUDAH_WELCOME_AUTOMATION_ENABLED=false` unless explicitly cleared.

**Production, only after privacy, security and launch approval:**
- Must review and affirm `REGISTRATION_ENABLED`, `PRIVACY_NOTICE_APPROVED`, `SPECIAL_CATEGORY_PROCESSING_APPROVED`, `PROCESSOR_TERMS_APPROVED`, `CONSENT_MIGRATION_APPLIED`.
- Independently set `JUDAH_MAIL_PRIVACY_APPROVED=true` after email provider/privacy/PECR sign-off.
- Set `JUDAH_EMAIL_ENABLED=true` **and** `JUDAH_LIVE_SENDING_AUTHORISED=true` only after a separate explicit send approval.
- Set `CRON_SECRET` (minimum 24 chars), `RESEND_API_KEY`, `JUDAH_FROM_EMAIL`, `JUDAH_UNSUBSCRIBE_SECRET`, and verify sender domain and operational suppression handling.
- `JUDAH_SITE_URL` optionally sets the canonical unsubscribe link origin.
- `JUDAH_BLOG_PUBLIC_ENABLED=true` only after editorial website release review.
- `JUDAH_WELCOME_AUTOMATION_ENABLED=true` only if welcome consent purpose and mail authorisation are documented.

**Important:** JUDAH admin APIs are Preview-only. Production sends cannot be enabled or initiated through the Preview admin; a separate approved production operations/access plan is needed before go-live. No environment flags should be switched on in this build.

## Test and acceptance checklist

1. GitHub Actions JUDAH checks: TypeScript `tsc --noEmit` and Next.js `npm run build` pass for the exact branch head.
2. Preview admin account signs in; unauthenticated JUDAH admin endpoints return 401 and production-only paths remain unavailable.
3. Apply migrations 005–007 in a disposable Preview Neon branch.
4. Confirm empty dashboard, aggregate totals, draft generation, editing/approval, campaign creation/scheduling and audit history.
5. Configure AI Gateway credential; generate a blog/social/email draft, verify no fabricated dates or personal data.
6. Verify only opted-in records with explicit consent evidence enter the queue, no suppressed/fictional registrations are included.
7. Confirm preview test email goes only to `JUDAH_TEST_EMAIL`; verify no bulk sends.
8. Confirm unsubscribe, pending-message suppression and email sending gate remain functional.
9. Import only fictitious organisation examples; verify Apollo/Hunter lookups independently and check credit usage.
10. Check mobile layout, keyboard access, broken links, auth/session expiry and production site unaffected.
11. Security & privacy review before ANY live operational release.

## Architectural safeguards and limitation

- Partner API and mail admin are intentionally isolated; no real personal data transmitted to prospecting API providers.
- Do not use obtained contact lists for indiscriminate outreach. UK PECR/UK GDPR rules vary for individual vs corporate subscribers and may require consent or legitimate-interest assessment. For a religious organisation, infer no individual's religion from a prospecting record.
- Registration processing may reveal religious interests and requires both a UK GDPR Article 6 basis and appropriate Article 9 condition.
- No guarantee of rankings, subscriber conversions, event attendance, or email deliverability.
- Cron is daily, not minute-accurate, and requires a verified deployment.
- No paid API calls occur until credentials are configured and an admin initiates a task.
- Automated content publishing to social networks is intentionally out of scope until accounts, tokens, human approvals and platform policies have been reviewed.
