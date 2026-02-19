-- Upgrade consent system for granular, POPIA-compliant consent management
-- This supports: platform terms, data sharing, income verification, marketing

-- Add granular consent types for financial data sharing
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS consent_category TEXT;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partner_api_keys(id);
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Index for querying active consents
CREATE INDEX IF NOT EXISTS idx_consent_records_user_type
  ON consent_records(user_id, consent_type)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_consent_records_category
  ON consent_records(consent_category)
  WHERE revoked_at IS NULL;

-- Consent categories:
-- 'platform_terms' - Agreement to Terms of Service
-- 'privacy_policy' - Acknowledgment of Privacy Policy
-- 'popi_consent' - POPIA processing consent
-- 'income_data_sharing' - Consent to share income data with financial partners
-- 'identity_sharing' - Consent to share identity verification with partners
-- 'marketing' - Marketing communications consent
-- 'location_tracking' - GPS location data collection consent

COMMENT ON TABLE consent_records IS
  'POPIA-compliant consent audit trail. Every consent given, modified, or revoked is recorded here. '
  'Consent is granular, specific, informed, and revocable per POPIA Section 11.';
