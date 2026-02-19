-- Revenue ledger: tracks all DomestIQ revenue streams
-- Platform fees, partner API fees, premium subscriptions

CREATE TABLE revenue_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'platform_fee',
    'partner_api_fee',
    'premium_subscription',
    'refund'
  )),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_revenue_ledger_type ON revenue_ledger(entry_type);
CREATE INDEX idx_revenue_ledger_created ON revenue_ledger(created_at);
CREATE INDEX idx_revenue_ledger_transaction ON revenue_ledger(transaction_id);

ALTER TABLE revenue_ledger ENABLE ROW LEVEL SECURITY;

-- Only service role and admin can view revenue
CREATE POLICY "Service role manages revenue"
  ON revenue_ledger FOR ALL
  USING (auth.role() = 'service_role');
