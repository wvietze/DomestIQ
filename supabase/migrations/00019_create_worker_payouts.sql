-- Worker payouts: tracks money sent to workers' bank accounts

CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE worker_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES profiles(id),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status payout_status NOT NULL DEFAULT 'pending',
  paystack_transfer_code TEXT,
  paystack_recipient_code TEXT,
  bank_name TEXT,
  account_number_last4 TEXT,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worker_payouts_worker ON worker_payouts(worker_id);
CREATE INDEX idx_worker_payouts_transaction ON worker_payouts(transaction_id);
CREATE INDEX idx_worker_payouts_status ON worker_payouts(status);

ALTER TABLE worker_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own payouts"
  ON worker_payouts FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Service role can manage payouts"
  ON worker_payouts FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER update_worker_payouts_updated_at
  BEFORE UPDATE ON worker_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Worker bank details for payouts (stored securely)
CREATE TABLE worker_bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  bank_name TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL, -- encrypted, never stored plain
  account_number_last4 TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  paystack_recipient_code TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE worker_bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own bank details"
  ON worker_bank_details FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can manage own bank details"
  ON worker_bank_details FOR ALL
  USING (auth.uid() = worker_id);

CREATE TRIGGER update_worker_bank_details_updated_at
  BEFORE UPDATE ON worker_bank_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
