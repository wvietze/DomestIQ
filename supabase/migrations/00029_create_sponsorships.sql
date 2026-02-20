-- Sponsorships: Branded partner placements throughout the platform
CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_logo_url TEXT,
  placement TEXT NOT NULL,  -- verification, onboarding_worker, onboarding_client, dashboard_worker, dashboard_client, search, landing
  headline TEXT NOT NULL,
  description TEXT,
  cta_text TEXT,
  cta_url TEXT,
  bg_color TEXT DEFAULT '#ecfdf5',
  text_color TEXT DEFAULT '#059669',
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsorships_active ON sponsorships(placement, is_active);
