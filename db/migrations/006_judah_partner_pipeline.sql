-- JUDAH partnerships CRM: organisation-level discovery, not attendee personal data.
BEGIN;
CREATE TABLE IF NOT EXISTS public.judah_partners (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organisation VARCHAR(180) NOT NULL,
  website VARCHAR(300),
  location VARCHAR(160) NOT NULL DEFAULT 'Birmingham, UK',
  segment VARCHAR(40) NOT NULL CHECK(segment IN ('church','worship_team','studio','community','sponsor','other')),
  contact_channel VARCHAR(300),
  source_url VARCHAR(500),
  provider VARCHAR(24) NOT NULL DEFAULT 'manual' CHECK(provider IN ('manual','hunter','apollo','usegtm')),
  suitability TEXT NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'research' CHECK(status IN ('research','review','approved','contacted','responded','partnered','declined','suppressed')),
  outreach_basis VARCHAR(30) NOT NULL DEFAULT 'unassessed' CHECK(outreach_basis IN ('unassessed','corporate_reviewed','consent_recorded','not_permitted')),
  notes TEXT NOT NULL DEFAULT '',
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(length(suitability)<=2500 AND length(notes)<=3000)
);
CREATE INDEX IF NOT EXISTS judah_partners_status_idx ON public.judah_partners(status,created_at DESC);
CREATE INDEX IF NOT EXISTS judah_partners_segment_idx ON public.judah_partners(segment);
CREATE TABLE IF NOT EXISTS public.judah_partner_activity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  partner_id BIGINT NOT NULL REFERENCES public.judah_partners(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK(length(action) <= 100),
  details TEXT NOT NULL DEFAULT '' CHECK(length(details) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS judah_partner_activity_partner_idx ON public.judah_partner_activity(partner_id,created_at DESC);
COMMIT;
