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
