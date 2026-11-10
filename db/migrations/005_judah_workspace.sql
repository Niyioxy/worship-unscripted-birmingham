-- JUDAH agent workspace. Apply only in the approved Preview Neon database.
-- Does not enable registration, sends, or production automation.
BEGIN;
CREATE TABLE IF NOT EXISTS public.judah_content (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 kind TEXT NOT NULL CHECK (kind IN ('blog','social','email','announcement')),
 title VARCHAR(180) NOT NULL,
 body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','archived')),
 channel TEXT NOT NULL DEFAULT 'website',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 approved_at TIMESTAMPTZ,
 CHECK (length(body) <= 30000)
);
CREATE INDEX IF NOT EXISTS judah_content_status_created_idx ON public.judah_content(status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.judah_campaigns (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 title VARCHAR(180) NOT NULL,
 subject VARCHAR(200) NOT NULL,
 body TEXT NOT NULL,
 audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','attend','music','volunteer')),
 status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','scheduled','paused','completed','archived')),
 send_after TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 approved_at TIMESTAMPTZ,
 CHECK (length(body) <= 15000)
);
CREATE INDEX IF NOT EXISTS judah_campaigns_due_idx ON public.judah_campaigns(status,send_after);

CREATE TABLE IF NOT EXISTS public.judah_deliveries (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 campaign_id BIGINT NOT NULL REFERENCES public.judah_campaigns(id) ON DELETE CASCADE,
 registration_id BIGINT NOT NULL REFERENCES public.worship_interest(id) ON DELETE CASCADE,
 status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','failed','suppressed')),
 provider_message_id TEXT,
 last_error TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 sent_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE (campaign_id,registration_id)
);
CREATE INDEX IF NOT EXISTS judah_deliveries_campaign_status_idx ON public.judah_deliveries(campaign_id,status);

CREATE TABLE IF NOT EXISTS public.judah_suppression (
 email TEXT PRIMARY KEY,
 reason TEXT NOT NULL DEFAULT 'unsubscribe',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (length(email) <= 254)
);

CREATE TABLE IF NOT EXISTS public.judah_audit (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 action VARCHAR(100) NOT NULL,
 object_kind VARCHAR(30),
 object_id BIGINT,
 detail TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS judah_audit_created_idx ON public.judah_audit(created_at DESC);
COMMIT;
