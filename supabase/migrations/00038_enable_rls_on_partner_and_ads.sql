-- Enable RLS on tables that were created without it.
-- Supabase Security Advisor flagged these as `rls_disabled_in_public`:
--   partner_applications, sponsorships, ad_placements

-- ─── partner_applications ──────────────────────────────────────────
-- Stores PII (contact emails, phones, internal admin notes) submitted via
-- the public "Become a Partner" form. The form needs anonymous INSERT,
-- but reads/updates/deletes must be admin-only.

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner applications"
  ON partner_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read partner applications"
  ON partner_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update partner applications"
  ON partner_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete partner applications"
  ON partner_applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── sponsorships ──────────────────────────────────────────────────
-- Public placements rendered to all users (landing, dashboards, search).
-- Active rows must be readable by everyone; only admins can write.

ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sponsorships"
  ON sponsorships FOR SELECT
  USING (
    is_active = true
    AND (ends_at IS NULL OR ends_at > now())
    AND starts_at <= now()
  );

CREATE POLICY "Admins can read all sponsorships"
  ON sponsorships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert sponsorships"
  ON sponsorships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update sponsorships"
  ON sponsorships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete sponsorships"
  ON sponsorships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── ad_placements ─────────────────────────────────────────────────
-- Targeted ads shown inside the authenticated app shell.
-- Active rows readable by authenticated users; admin-only writes.

ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active ads"
  ON ad_placements FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND (ends_at IS NULL OR ends_at > now())
    AND starts_at <= now()
  );

CREATE POLICY "Admins can read all ads"
  ON ad_placements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ads"
  ON ad_placements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update ads"
  ON ad_placements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete ads"
  ON ad_placements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
