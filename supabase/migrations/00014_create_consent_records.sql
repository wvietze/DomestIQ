CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_text TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consent records" ON consent_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert consent records" ON consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);
