-- Migration 00034: Estate registrations
-- Geographic coverage data + security company partnerships

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS estates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  security_company TEXT,
  requires_preregistration BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, suburb, city)
);

CREATE INDEX IF NOT EXISTS idx_estates_name_trgm ON estates USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_estates_city ON estates(city);

ALTER TABLE estates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view estates"
  ON estates FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add estates"
  ON estates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Worker estate registrations
CREATE TABLE IF NOT EXISTS worker_estate_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  registration_number TEXT,
  registered_since DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, estate_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_estate_regs_worker ON worker_estate_registrations(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_estate_regs_estate ON worker_estate_registrations(estate_id);

ALTER TABLE worker_estate_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can manage their registrations"
  ON worker_estate_registrations FOR ALL
  USING (auth.uid() = worker_id);

CREATE POLICY "Anyone can view registrations"
  ON worker_estate_registrations FOR SELECT
  USING (true);
