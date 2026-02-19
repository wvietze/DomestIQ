CREATE TABLE report_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reported_content_type TEXT NOT NULL,
  reported_content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE report_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON report_flags FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON report_flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
