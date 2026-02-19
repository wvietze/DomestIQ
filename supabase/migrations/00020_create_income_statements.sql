-- Income statements: verified earning records for workers
-- This is the data layer that makes us valuable to banks

CREATE TABLE income_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  avg_booking_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  services_breakdown JSONB NOT NULL DEFAULT '{}',
  verification_hash TEXT NOT NULL,  -- SHA-256 hash for tamper detection
  is_shared BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT unique_worker_period UNIQUE (worker_id, period_start, period_end)
);

CREATE INDEX idx_income_statements_worker ON income_statements(worker_id);
CREATE INDEX idx_income_statements_period ON income_statements(period_start, period_end);

ALTER TABLE income_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own income statements"
  ON income_statements FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Service role can manage income statements"
  ON income_statements FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate monthly income statement for a worker
CREATE OR REPLACE FUNCTION generate_income_statement(
  p_worker_id UUID,
  p_month DATE  -- First day of the month
)
RETURNS UUID AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_total_earnings NUMERIC(10,2);
  v_total_bookings INTEGER;
  v_avg_value NUMERIC(10,2);
  v_breakdown JSONB;
  v_hash TEXT;
  v_statement_id UUID;
BEGIN
  v_period_start := date_trunc('month', p_month)::DATE;
  v_period_end := (date_trunc('month', p_month) + interval '1 month' - interval '1 day')::DATE;

  -- Calculate totals from completed transactions
  SELECT
    COALESCE(SUM(t.worker_amount), 0),
    COUNT(*),
    COALESCE(AVG(t.worker_amount), 0)
  INTO v_total_earnings, v_total_bookings, v_avg_value
  FROM transactions t
  WHERE t.worker_id = p_worker_id
    AND t.status = 'completed'
    AND t.paid_at >= v_period_start
    AND t.paid_at < v_period_end + interval '1 day';

  -- Services breakdown
  SELECT COALESCE(jsonb_object_agg(
    s.name,
    jsonb_build_object('count', sub.cnt, 'total', sub.total)
  ), '{}')
  INTO v_breakdown
  FROM (
    SELECT b.service_id, COUNT(*) as cnt, SUM(t.worker_amount) as total
    FROM transactions t
    JOIN bookings b ON b.id = t.booking_id
    WHERE t.worker_id = p_worker_id
      AND t.status = 'completed'
      AND t.paid_at >= v_period_start
      AND t.paid_at < v_period_end + interval '1 day'
    GROUP BY b.service_id
  ) sub
  JOIN services s ON s.id = sub.service_id;

  -- Generate verification hash (tamper detection)
  v_hash := encode(
    digest(
      p_worker_id::TEXT || v_period_start::TEXT || v_period_end::TEXT ||
      v_total_earnings::TEXT || v_total_bookings::TEXT,
      'sha256'
    ),
    'hex'
  );

  -- Upsert the statement
  INSERT INTO income_statements (
    worker_id, period_start, period_end,
    total_earnings, total_bookings, avg_booking_value,
    services_breakdown, verification_hash
  ) VALUES (
    p_worker_id, v_period_start, v_period_end,
    v_total_earnings, v_total_bookings, v_avg_value,
    v_breakdown, v_hash
  )
  ON CONFLICT (worker_id, period_start, period_end) DO UPDATE SET
    total_earnings = EXCLUDED.total_earnings,
    total_bookings = EXCLUDED.total_bookings,
    avg_booking_value = EXCLUDED.avg_booking_value,
    services_breakdown = EXCLUDED.services_breakdown,
    verification_hash = EXCLUDED.verification_hash,
    generated_at = now()
  RETURNING id INTO v_statement_id;

  RETURN v_statement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
