-- Registration and retention smoke test. Run in Neon SQL Editor.
-- Uses an example.invalid address and rolls back every change.
BEGIN;
INSERT INTO public.worship_interest
  (full_name,email,phone,interest,first_time,updates_opt_in)
VALUES
  ('Retention Test','wub-retention-test@example.invalid',NULL,'attend',TRUE,FALSE)
ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,interest=EXCLUDED.interest,first_time=EXCLUDED.first_time,updates_opt_in=EXCLUDED.updates_opt_in,updated_at=NOW(),last_interaction_at=NOW();
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.worship_interest
    WHERE email='wub-retention-test@example.invalid'
      AND last_interaction_at IS NOT NULL
      AND consent_at IS NOT NULL
  ) THEN RAISE EXCEPTION 'Insert/retention tracking failed'; END IF;
END $$;
UPDATE public.worship_interest
SET last_interaction_at = NOW() - INTERVAL '13 months'
WHERE email='wub-retention-test@example.invalid';
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.worship_interest
    WHERE email='wub-retention-test@example.invalid'
      AND last_interaction_at < NOW() - INTERVAL '12 months'
  ) THEN RAISE EXCEPTION 'Retention expiry detection failed'; END IF;
END $$;
INSERT INTO public.worship_interest
  (full_name,email,phone,interest,first_time,updates_opt_in)
VALUES
  ('Retention Test Returning','wub-retention-test@example.invalid',NULL,'volunteer',FALSE,TRUE)
ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,phone=EXCLUDED.phone,interest=EXCLUDED.interest,first_time=EXCLUDED.first_time,updates_opt_in=EXCLUDED.updates_opt_in,consent_at=NOW(),updated_at=NOW(),last_interaction_at=NOW();
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.worship_interest
    WHERE email='wub-retention-test@example.invalid'
      AND interest='volunteer'
      AND updates_opt_in=TRUE
      AND last_interaction_at >= NOW() - INTERVAL '1 minute'
  ) THEN RAISE EXCEPTION 'Returning registration did not refresh retention clock'; END IF;
  IF (SELECT COUNT(*) FROM public.worship_interest WHERE email='wub-retention-test@example.invalid') <> 1
  THEN RAISE EXCEPTION 'Duplicate registration found'; END IF;
END $$;
ROLLBACK;
-- Success: completes without an error; no test data is retained.
