-- Per-editor AI request limits, separate from login throttling.
CREATE TABLE IF NOT EXISTS public.wu_blog_ai_usage (
 fingerprint CHAR(64) PRIMARY KEY,
 requests INTEGER NOT NULL DEFAULT 0,
 window_started TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
