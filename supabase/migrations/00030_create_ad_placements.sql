-- Ad Placements: Targeted advertising within the platform
CREATE TABLE ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  advertiser_logo_url TEXT,
  placement TEXT NOT NULL,       -- worker_dashboard, client_dashboard, search_results, worker_profile
  target_services TEXT[],        -- ['cleaning','gardening','painting'] or NULL for all
  target_role TEXT NOT NULL,     -- worker, client, all
  headline TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL,
  cta_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ads_active ON ad_placements(placement, is_active, target_role);
