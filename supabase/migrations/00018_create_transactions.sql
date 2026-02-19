-- Transactions table: records every payment through the platform
-- Client pays: worker_amount + platform_fee = total_amount

CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  worker_amount NUMERIC(10,2) NOT NULL,       -- Full amount the worker receives
  platform_fee NUMERIC(10,2) NOT NULL,        -- Fee charged to client on top
  total_amount NUMERIC(10,2) NOT NULL,        -- worker_amount + platform_fee
  platform_fee_percent NUMERIC(5,2) NOT NULL, -- Fee percentage applied
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status transaction_status NOT NULL DEFAULT 'pending',
  paystack_reference TEXT UNIQUE,
  paystack_access_code TEXT,
  paystack_transfer_code TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_client ON transactions(client_id);
CREATE INDEX idx_transactions_worker ON transactions(worker_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(paystack_reference);
CREATE INDEX idx_transactions_paid_at ON transactions(paid_at);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Clients can see their transactions
CREATE POLICY "Clients can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = client_id);

-- Workers can see transactions where they're the worker
CREATE POLICY "Workers can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = worker_id);

-- Only server can create/update (via admin client in webhook)
CREATE POLICY "Service role can manage transactions"
  ON transactions FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
