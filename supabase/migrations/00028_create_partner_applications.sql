-- Partner Applications: Track companies interested in partnering with DomestIQ
CREATE TABLE partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company_type TEXT NOT NULL,  -- bank, insurer, micro_lender, sponsor, advertiser, government, other
  interest TEXT NOT NULL,       -- data_api, sponsorship, advertising, multiple
  message TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, contacted, approved, rejected
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_apps_status ON partner_applications(status);
