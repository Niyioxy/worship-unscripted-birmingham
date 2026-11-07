# Registration acceptance test protocol
Status: **Prepared; execute only after migration and provider approval**.

## Before tests
1. Keep Production unchanged. Protect Preview with admin access.
2. Obtain suitable contractual clearance for possibly religious-belief-revealing information.
3. Apply and verify `db/migrations/004_explicit_consent_evidence.sql` to the target Neon database using its SQL editor, after reviewing its foreign key to `public.worship_interest(email)`.
4. Use fictional `@example.invalid` addresses only, never a real person's details.
5. Confirm all six registration gates are closed by default.

## Test cases
- Public GET `/api/interest` returns `acceptingInterest:false` when any release gate is missing.
- POST returns 503 with no database writes when public registration is closed.
- Browser form shows separate, initially unchecked religious-interest explicit consent and optional future-updates opt-in.
- Once all gates are legitimately approved in a restricted test environment, reject missing or false explicit consent and an incorrect consent statement version.
- With synthetic data, verify one interest record and corresponding `worship_consent_evidence` row with matching email, statement version and timestamp.
- Submit a duplicate synthetic email; ensure there is one current registration and an updated consent receipt.
- Verify categories Attend, Music, Volunteer; optional phone; marketing opt-in false/true; CSV exports.
- Delete a test record and confirm its consent evidence is gone through FK cascade.
- Verify deletions do not remove unrelated registrations; verify fake admin records can only be deleted by their specific control.
- Confirm any retention review does not itself delete data.
- Verify session requirements for all admin endpoints, Origin checks for mutations and public field validation.
- Document the backup and exported-copy handling of erasure requests.

**Do not switch on public data collection as an acceptance-test shortcut.**
