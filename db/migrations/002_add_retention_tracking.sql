-- Run after 001_create_worship_interest.sql in Neon SQL Editor.
-- Track the most recent meaningful interaction separately from technical row updates.
BEGIN;
ALTER TABLE public.worship_interest
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ;
UPDATE public.worship_interest
SET last_interaction_at = COALESCE(updated_at, created_at, NOW())
WHERE last_interaction_at IS NULL;
ALTER TABLE public.worship_interest
  ALTER COLUMN last_interaction_at SET DEFAULT NOW(),
  ALTER COLUMN last_interaction_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS worship_interest_retention_idx
  ON public.worship_interest (last_interaction_at);
COMMIT;
