# Worship Unscripted Birmingham: Registration launch decisions

Status: **Draft, not approved.** Public registration must remain closed until the decisions below are documented and implemented.\n\nSupporting material: [provider approval requests](provider-approval-requests.md), [registration acceptance tests](registration-acceptance-tests.md), and [migration 004](../db/migrations/004_explicit_consent_evidence.sql).

## Confirmed operating arrangement

- Worship Unscripted Birmingham is an independent programme.
- Adeniyi Owolabi founded the programme and decides the purpose of participant registrations, how records are used and who can access them.
- HarvestFlow sponsors the programme. Sponsorship alone does not confer registration-data access or joint control.
- Website hosting: Vercel. Registration database: Neon.
- Admin login, synthetic data insert/read/delete, and CSV export were tested in Preview.

## 1. Confirm lawful basis (action required)\n\nICO guidance updated October 2026 confirms that special-category processing requires both Article 6 and Article 9 conditions documented in advance: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/ . For a new attendee with no previous connection, do not presume the Article 9(2)(d) not-for-profit condition applies. The ICO notes restrictions concerning regular contacts and prospective individuals: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-conditions-for-processing/ .

Document a UK GDPR Article 6 basis for each distinct purpose. A likely candidate for handling invitations and enquiries is Article 6(1)(f), legitimate interests, **only after an interests and balancing assessment**. For optional promotional updates, assess UK GDPR consent and PECR direct-marketing rules.

A Christian worship interest list may reveal or suggest religious belief. Assess whether information is special-category data under Article 9. Record a condition **before** collection. Options to assess include:
- Article 9(2)(a), explicit consent: separate express, specific statement and demonstrable record, with an effective withdrawal path.
- Article 9(2)(d), not-for-profit bodies: applies only if the programme meets the detailed requirements about its aims, permitted individuals, safeguards and disclosures. Independence and non-profit intent alone do not prove eligibility.

**Do not treat the existing required generic consent checkbox as explicit Article 9 consent.** If explicit consent is selected, update the form, validation and Neon schema to preserve the specific affirmative statement and timestamp, and test withdrawal and deletion.

Official source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/

## 2. Controller contact and accountability

- Confirm the privacy contact email is monitored and requests can be handled promptly.
- Determine whether a postal contact address or further identifying details must be provided in the final notice.
- Record authorised dashboard users and their access permissions.
- Keep administrator secrets and participant exports private; never send CSVs through public links.

## 3. Processors and international transfers

Check Vercel and Neon contract terms, any sub-processors, processing locations, data protection terms, and international-transfer mechanism where relevant. Record your findings. The privacy notice must match the actual arrangements, not assumptions.

### Provider research recorded 7 November 2026

- **Vercel:** Its current published DPA is at https://vercel.com/legal/dpa and describes processors, sub-processors, cross-border safeguards and processing in the US. **Do not assume the agreement covers the project's account:** verify the plan, contractual applicability and enabled hosting/logging features. On the retrieved DPA, coverage is stated for Pro and Enterprise plans.
- **Neon:** Its published DPA is available at https://neon.com/pdf/DPA.pdf, and its security portal is https://neon.com/security. **Do not assume the precise database region:** confirm the region configured for this particular Neon project and its actual sub-processors.
- **Not yet verified:** Vercel account plan, Neon project region, exact processing/subprocessor locations for these accounts, signing/acceptance of applicable DPAs, restricted-transfer mechanism, backup and deletion terms. Record evidence and dates before final privacy notice approval.

## 4. Retention and deletion

- Decide and document the retention period for a person who registered interest but never attends (draft suggests 12 months since last meaningful interaction).
- Establish a tested process to delete or anonymise expired records.
- Establish a process for access, correction, removal and withdrawal requests.
- Verify that database backups and exports are covered by appropriate retention and access processes.
- The Preview admin dashboard provides a **read-only 12-month retention review** that excludes fictional test records. It does **not** delete data or establish the final policy.\n- Do not claim automatic deletion until automation is actually implemented and tested.

## 5. Final privacy notice and consent UX

- Complete the draft with confirmed facts, final lawful bases and contact details.
- Confirm the form's statements accurately describe the chosen basis.
- Keep optional marketing updates unchecked by default.
- Have the responsible organiser approve the final text.

## 6. Technical controls implemented in Preview (7 November 2026)

- Public registration requires **six independent gates**, all normally closed: `DATABASE_URL`, `REGISTRATION_ENABLED=true`, `PRIVACY_NOTICE_APPROVED=true`, `SPECIAL_CATEGORY_PROCESSING_APPROVED=true`, `PROCESSOR_TERMS_APPROVED=true`, and `CONSENT_MIGRATION_APPLIED=true`. Environment variables are **not** set by these code changes.
- The registration form has a separate, required, express consent statement about interest in a Christian worship gathering possibly revealing religion. This is a **proposed Article 9(2)(a) consent workflow**, not yet a legal approval.
- A versioned consent receipt is written transactionally to `public.worship_consent_evidence` only for public registrations. Migration: `db/migrations/004_explicit_consent_evidence.sql`. **Must be applied in Neon manually** after review and before enabling the relevant gate.
- A privileged, Preview-only per-record deletion action requires the administrator to type the exact participant email and confirm deletion. Consent evidence cascades when the migration is installed. **Backups and downloaded CSV exports are not removed** by this action; follow the separate retention and access process.
- The existing fictional test record and rollback test continue to work without depending on migration 004.
- The system does not claim automatic deletion, guaranteed anti-spam throttling or a production release.

### Critical Vercel agreement blocker (verified 7 November 2026)

Vercel's published Data Processing Addendum, updated **17 March 2026** with effective date **31 March 2026**, section Schedule 1(6)(a), states **customers are prohibited from including sensitive data or special categories of data in Customer Data**. This is a release blocker for a worship-interest form that may reveal religious belief even if explicit consent is captured.

- Source: https://vercel.com/legal/dpa
- Obtain written clarification or a suitable agreement explicitly permitting this processing, **or** move the relevant data processing to a provider/arrangement that permits it.
- Confirm the user's Vercel plan (the published DPA says it applies to Pro and Enterprise), the actual Neon region, Neon contractual terms, subprocessor locations and appropriate international-transfer safeguards.
- **Do not enable the registration environment variables until the contractual issue is resolved and the responsible organiser approves the complete compliance basis.** Merely adding consent or database encryption does not override a provider prohibition.

## 7. Controlled release gate

Only after the above:
1. Apply any approved migration for explicit-consent evidence, if needed.
2. Exercise the form and admin dashboard in a protected Preview with a disposable synthetic participant.
3. Confirm all categories, consent choices, retention behaviour, and removal process.
4. Review access controls, rate limiting and spam safeguards.
5. Obtain written organiser approval and configure all consent, processor and release flags only in the intended environment; **do not enable these now**.

This is an operational review checklist, not legal advice. Seek qualified UK privacy advice if the Article 9 condition remains unclear.
