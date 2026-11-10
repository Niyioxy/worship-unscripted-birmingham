-- JUDAH onboarding automation after registration privacy launch approval.
BEGIN;
ALTER TABLE public.judah_campaigns ADD COLUMN IF NOT EXISTS automation_key TEXT;
ALTER TABLE public.judah_campaigns ADD COLUMN IF NOT EXISTS evergreen BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.judah_campaigns ADD CONSTRAINT judah_campaigns_automation_key_check
 CHECK (automation_key IS NULL OR automation_key IN ('welcome_opted_in'));
CREATE UNIQUE INDEX IF NOT EXISTS judah_campaigns_active_welcome_idx
  ON public.judah_campaigns (automation_key)
  WHERE automation_key IS NOT NULL AND status='scheduled' AND evergreen=TRUE;
COMMIT;
