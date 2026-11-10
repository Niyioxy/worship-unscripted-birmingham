# JUDAH v1 — Editorial and Community Support Agent

Worship Unscripted Birmingham. Initial build: 10 November 2026.
Status: development/Preview only. No production deployment or activation of public registration.

## Purpose
JUDAH stands for Joyful, Useful, Discernment-led Assistance and Hospitality.
It is the first internal support agent for the Worship Unscripted vision. The assistant does not replace human pastoral care, event safeguarding, lawful consent, or editorial review.

## What v1 actually does
1. **Editorial studio** at `/admin/judah` in Preview. The API requires a valid Preview admin session. The page is noindex and unavailable in Production.
2. **Draft generation** for original blog articles, platform-specific social posts and opt-in email copy. All outputs are plain text and explicitly unapproved. No publishing or email sending endpoints exist.
3. **Registration overview** returns only anonymous aggregate totals by interest category and opt-in count via Neon. No names, email addresses or telephone numbers are sent to the AI model. The existing authenticated admin dashboard continues to manage individual records separately.
4. **Safety gates**: request size limits; short topic validation; same-origin POST; Preview-only API; authenticated admin; no automated public publishing; no background mailing; no fabricated dates, confirmed bookings, venue details or religious testimonies.

## Required Preview-only Vercel environment variables
- `AI_GATEWAY_API_KEY`: server-side Vercel AI Gateway credential; do not commit or paste into chat. Create inside Vercel and store in Environment Variables, Preview environment only.
- `JUDAH_MODEL`: an active, approved AI Gateway model ID in provider/model format selected from the model listing. No model ID is hardcoded.
- `DATABASE_URL`: existing Neon connection if registration totals are desired.
- Existing Preview admin session configuration must already work.

JUDAH uses Vercel AI Gateway's OpenAI-compatible HTTPS endpoint. Rate limits, provider billing and model capabilities depend on the selected model and account. No AI call occurs if either key or model is absent.

## Usage
1. Open the **Preview deployment**, sign in at `/admin` using the established email/password flow.
2. Go to `/admin/judah`.
3. Review aggregate registration counts. Empty/unavailable counts do not prove there are no registrations.
4. Select Blog, Social or Follow-up draft, supply a non-sensitive topic and generate.
5. Fact-check, edit and approve before sharing through a separate manual workflow.
6. Never paste participant personal information into the prompts.

## Explicitly not part of v1
- Actual email delivery, autoresponders, broadcast campaigns, scheduling or subscriber segmentation at individual level.
- Persistent content approval/publishing queue or CMS integration.
- Access to personal registration records from JUDAH.
- Self-service opt-out or automated suppression (must precede marketing sending).
- Visitor-facing chatbot, WhatsApp, or production public access.
- Automated prayer/counselling outreach or AI decisions about people.

## Phase 2 development gates
1. Approve final privacy notice, lawful bases, Article 9 condition, retention policy, subprocessor documents and registration form before enabling public data collection.
2. Choose and authorise an email provider, verify the sender domain, create delivery audit logs, idempotency controls, bounce handling and complaint suppression.
3. Implement distinct message-purpose handling: one-off administrative confirmations where legally justified versus OPTIONAL marketing/programme updates requiring applicable PECR basis and verifiable preferences. Never bulk-email all registrants by default.
4. Ensure unsubscribe/withdrawal process, searchable suppression list and stop-sending policy are functional and tested, including consent revocation.
5. Add admin review and explicit send approval, an email preview, throttling, delivery status and deduplication.
6. Only then consider individually appropriate automations, e.g., opted-in event announcements and post-event feedback.

## Release strategy
This feature branch includes development-only work. Do not merge the branch wholesale into Production. Use a scoped release after build, security review and privacy approval. The existing homepage repair and SEO are unchanged.
