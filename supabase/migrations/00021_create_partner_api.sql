-- Partner API infrastructure: enables banks, insurers, and lenders
-- to access verified worker income data WITH worker consent

CREATE TABLE partner_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('bank', 'insurer', 'lender', 'government')),
  api_key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of the API key
  contact_email TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 100,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE partner_api_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can manage partner keys
CREATE POLICY "Service role manages partner keys"
  ON partner_api_keys FOR ALL
  USING (auth.role() = 'service_role');

-- Partner data requests: audit trail of every data access
CREATE TABLE partner_data_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partner_api_keys(id),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  consent_id UUID REFERENCES consent_records(id),
  request_type TEXT NOT NULL CHECK (request_type IN (
    'income_verification',
    'employment_history',
    'identity_verification'
  )),
  status TEXT NOT NULL DEFAULT 'pending_consent' CHECK (status IN (
    'pending_consent', 'consented', 'fulfilled', 'denied', 'expired'
  )),
  -- Data shared with partner (sanitized, never raw personal info)
  data_shared JSONB,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_requests_worker ON partner_data_requests(worker_id);
CREATE INDEX idx_partner_requests_partner ON partner_data_requests(partner_id);
CREATE INDEX idx_partner_requests_status ON partner_data_requests(status);

ALTER TABLE partner_data_requests ENABLE ROW LEVEL SECURITY;

-- Workers can see requests for their data
CREATE POLICY "Workers can view own data requests"
  ON partner_data_requests FOR SELECT
  USING (auth.uid() = worker_id);

-- Workers can update consent status
CREATE POLICY "Workers can respond to data requests"
  ON partner_data_requests FOR UPDATE
  USING (auth.uid() = worker_id);

CREATE POLICY "Service role manages data requests"
  ON partner_data_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Partner API request log (rate limiting and audit)
CREATE TABLE partner_api_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partner_api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_api_log_partner ON partner_api_log(partner_id);
CREATE INDEX idx_partner_api_log_created ON partner_api_log(created_at);

ALTER TABLE partner_api_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages api log"
  ON partner_api_log FOR ALL
  USING (auth.role() = 'service_role');
