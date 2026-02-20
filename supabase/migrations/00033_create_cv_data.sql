-- Migration 00033: Worker CV data
-- Free CV builder - highest-value data generator for partner API

CREATE TABLE IF NOT EXISTS worker_cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  work_history JSONB NOT NULL DEFAULT '[]',
  education JSONB NOT NULL DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  personal_statement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_cv_data_worker ON worker_cv_data(worker_id);

ALTER TABLE worker_cv_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can manage their own CV data"
  ON worker_cv_data FOR ALL
  USING (auth.uid() = worker_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_cv_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_cv_data_timestamp ON worker_cv_data;
CREATE TRIGGER trg_update_cv_data_timestamp
  BEFORE UPDATE ON worker_cv_data
  FOR EACH ROW
  EXECUTE FUNCTION update_cv_data_timestamp();
