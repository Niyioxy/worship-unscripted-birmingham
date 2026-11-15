-- Self-service Worship Unscripted blog. Run on an approved Neon database before enabling CMS.
BEGIN;
CREATE TABLE IF NOT EXISTS public.wu_blog_posts(
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 slug VARCHAR(120) NOT NULL UNIQUE,
 title VARCHAR(180) NOT NULL,
 excerpt VARCHAR(300) NOT NULL DEFAULT '',
 body TEXT NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 published_at TIMESTAMPTZ,
 CHECK(length(body)>0 AND length(body)<=40000),
 CHECK(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
CREATE INDEX IF NOT EXISTS wu_blog_status_published_idx ON public.wu_blog_posts(status,published_at DESC);

CREATE TABLE IF NOT EXISTS public.wu_blog_login_limits(
 fingerprint CHAR(64) PRIMARY KEY,
 attempts INTEGER NOT NULL DEFAULT 0,
 window_started TIMESTAMPTZ NOT NULL DEFAULT now(),
 locked_until TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
