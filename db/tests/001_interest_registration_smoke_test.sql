-- Run in Neon SQL Editor after migration 001.
-- Tests insert, consent, optional updates, upsert, and required values.
-- Entire test rolls back: no personal data is retained.
BEGIN;
INSERT INTO public.worship_interest(full_name,email,phone,interest,first_time,updates_opt_in)
VALUES('Test Worshipper','test-worship-unscripted@example.invalid',NULL,'attend',TRUE,FALSE);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.worship_interest WHERE email='test-worship-unscripted@example.invalid' AND interest='attend' AND first_time=TRUE AND updates_opt_in=FALSE AND consent_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Initial insert validation failed';
  END IF;
END $$;
INSERT INTO public.worship_interest(full_name,email,phone,interest,first_time,updates_opt_in)
VALUES('Test Worshipper Updated','test-worship-unscripted@example.invalid',NULL,'volunteer',FALSE,TRUE)
ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,phone=EXCLUDED.phone,interest=EXCLUDED.interest,first_time=EXCLUDED.first_time,updates_opt_in=EXCLUDED.updates_opt_in,consent_at=NOW(),updated_at=NOW();
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM public.worship_interest WHERE email='test-worship-unscripted@example.invalid') <> 1 THEN
    RAISE EXCEPTION 'Email uniqueness/upsert failed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.worship_interest WHERE email='test-worship-unscripted@example.invalid' AND interest='volunteer' AND first_time=FALSE AND updates_opt_in=TRUE AND updated_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Upsert field validation failed';
  END IF;
END $$;
ROLLBACK;
-- If no ERROR appears, all assertions passed and the test row was rolled back.
