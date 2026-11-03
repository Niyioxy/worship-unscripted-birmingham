# Worship Unscripted Birmingham: pre-release checklist

This work is intentionally staged on `feature/complete-site-before-release`. Do not merge to `main` or promote to production until release checks pass.

## Implemented in the branch
- Four foundational pages: Vision, Experience, Our Story, Get Involved
- Four additional pages: Community, Gatherings, Contact, Privacy
- Shared interior navigation, mobile menu, footer, and existing motion system
- Registration-interest role preselection through `/register?interest=attend|music|volunteer`
- Registration availability GET endpoint
- Explicit registration gate requiring `DATABASE_URL`, `REGISTRATION_ENABLED=true`, and `PRIVACY_NOTICE_APPROVED=true`

## Must complete before public launch
- [ ] Confirm legal controller identity, privacy contact, lawful basis, data processors, retention period and privacy notice; replace provisional wording. Do not enable registration before this is approved.
- [ ] Provision and test PostgreSQL `DATABASE_URL` securely. Never commit database credentials.
- [ ] Validate schema and duplicate submissions, failure paths, and consent choices.
- [ ] Confirm operational contact address and publish it on Contact and Privacy pages.
- [ ] Test local production build and TypeScript checks.
- [ ] Test keyboard navigation, screen-reader labels, contrast, reduced motion, responsive layouts and cross-browser behaviour.
- [ ] Check all pages and links on a private preview before merging.
- [ ] Test that interest registration is not represented as a seat reservation.
- [ ] Confirm the first gathering date, venue, accessibility, capacity, safety and media permissions before enabling event booking.
- [ ] Obtain and use actual user-approved photos and founder video rather than generic stock images.
- [ ] Check permissions for all photos, music and recordings.
- [ ] Decide how confirmation email, unsubscribe, waiting list, admin review and post-event feedback will be delivered; these are not yet implemented.
- [ ] Approve the final release.

## Environment variables
- `DATABASE_URL`: secure PostgreSQL connection string
- `REGISTRATION_ENABLED`: `true` only when registration is approved
- `PRIVACY_NOTICE_APPROVED`: `true` only after the complete privacy notice is published and reviewed

The presence of environment variables does not replace end-to-end verification.
