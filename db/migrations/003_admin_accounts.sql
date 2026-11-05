CREATE TABLE IF NOT EXISTS public.worship_admin_accounts (
 email text PRIMARY KEY,
 password_salt text NOT NULL,
 password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
