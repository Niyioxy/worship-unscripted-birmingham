-- Apply in the Neon SQL editor before enabling genuine registrations.
-- Requires existing public.worship_interest(email) unique or primary key.
-- Records the text version and timestamp of the separate Article 9 consent.
CREATE TABLE IF NOT EXISTS public.worship_consent_evidence (
  email text PRIMARY KEY REFERENCES public.worship_interest(email) ON DELETE CASCADE,
  statement_version text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CHECK (length(statement_version) BETWEEN 1 AND 80)
);
CREATE INDEX IF NOT EXISTS worship_consent_evidence_consented_at_idx
  ON public.worship_consent_evidence (consented_at);
COMMENT ON TABLE public.worship_consent_evidence IS
  'Separate consent evidence for religious-belief information; remove with registration.';
