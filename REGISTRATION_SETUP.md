# Registration setup

The registration UI is available at `/register`. It records **interest only**, not confirmed seat reservations.

## Database

Create a PostgreSQL database (for example, via Vercel Storage / a compatible Postgres provider). Set `DATABASE_URL` as a server-side environment variable in Vercel Project Settings → Environment Variables. Never prefix this variable with `NEXT_PUBLIC_`.

The API route `/api/interest` creates the `worship_interest` table on the first valid request. The database user therefore needs permission to create tables. After initial setup, use a restricted runtime database role for production.

No personal details are stored unless a database is configured. When `DATABASE_URL` is missing, the form returns a clear 'Registration is not yet open' message.

## Privacy and launch checklist

- Publish an appropriate privacy notice identifying the data controller, purpose, retention period and contact method before public collection.
- Verify access controls, database backups, rate limiting, anti-spam protection and deletion/export procedures.
- Test submissions, repeat email behaviour and mobile accessibility.
- Configure transactional confirmation email if required. The current confirmation is **on-screen only**.
- Introduce capacity, confirmed reservations and waitlisting only once venue capacity and team allocation are confirmed.

The public site must not claim that a seat has been reserved when a visitor merely joins the interest list.

## Live readiness behaviour

The registration page now requests `GET /api/interest` on load. If `DATABASE_URL` is absent or the readiness request fails, the submit button stays disabled and a clear message is shown. This check only verifies the presence of the environment variable, **not** database connectivity or table permissions. A successful end-to-end submission is still required before launch.

## Go-live test

1. Provision PostgreSQL and add `DATABASE_URL` in the Vercel project environment settings for Production (and Preview if desired).
2. Redeploy after saving the environment variable.
3. Open `/register` in a private browser session and verify the readiness message clears.
4. Submit one test registration with an email address you control. Confirm the success screen appears and the row exists in `worship_interest`.
5. Repeat with the same email to verify upsert behaviour, and test an invalid email and missing consent.
6. Publish a proper privacy notice and establish a monitored contact address before accepting real visitor details.
7. Verify database backups, spam/rate-limit protection, and access to deletion/export requests before public promotion.

**Important:** No automatic confirmation email is sent yet. The form's success screen confirms database acceptance only. Do not describe this as a confirmed seat booking.
