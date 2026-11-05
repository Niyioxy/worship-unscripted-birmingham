CREATE TABLE IF NOT EXISTS public.worship_admin_accounts (
 email text PRIMARY KEY,
 password_salt text NOT NULL,
 password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.worship_admin_login_attempts (
 email text PRIMARY KEY,
 failed_count integer NOT NULL DEFAULT 0,
 locked_until timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
