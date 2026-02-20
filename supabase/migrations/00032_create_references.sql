-- Migration 00032: Worker references system
-- References = verified employment relationships with duration data

CREATE TABLE IF NOT EXISTS worker_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reference_text TEXT NOT NULL,
  relationship TEXT NOT NULL, -- employer, client, regular_client
  duration_months INTEGER,
  is_visible_on_profile BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_references_worker ON worker_references(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_references_client ON worker_references(client_id);

ALTER TABLE worker_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible references"
  ON worker_references FOR SELECT
  USING (is_visible_on_profile = true OR auth.uid() = worker_id OR auth.uid() = client_id);

CREATE POLICY "Clients can write references"
  ON worker_references FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Workers can toggle visibility"
  ON worker_references FOR UPDATE
  USING (auth.uid() = worker_id);

-- Reference requests (worker asks client for reference)
CREATE TABLE IF NOT EXISTS reference_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  UNIQUE(worker_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_reference_requests_client
  ON reference_requests(client_id) WHERE status = 'pending';

ALTER TABLE reference_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can create reference requests"
  ON reference_requests FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Users can view their own reference requests"
  ON reference_requests FOR SELECT
  USING (auth.uid() = worker_id OR auth.uid() = client_id);

CREATE POLICY "Users can update their own reference requests"
  ON reference_requests FOR UPDATE
  USING (auth.uid() = worker_id OR auth.uid() = client_id);

-- Shareable reference tokens (public links)
CREATE TABLE IF NOT EXISTS reference_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reference_ids UUID[] NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reference_share_tokens_token ON reference_share_tokens(token);

ALTER TABLE reference_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can manage their share tokens"
  ON reference_share_tokens FOR ALL
  USING (auth.uid() = worker_id);

-- Public read by token (handled in API, no RLS needed for public)
CREATE POLICY "Anyone can read by token"
  ON reference_share_tokens FOR SELECT
  USING (true);
