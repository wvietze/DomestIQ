CREATE TABLE worker_service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  center GEOGRAPHY(POINT, 4326),
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_km INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_areas_center ON worker_service_areas USING GIST(center);

ALTER TABLE worker_service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service areas are publicly viewable" ON worker_service_areas FOR SELECT USING (true);
CREATE POLICY "Workers can manage own service areas" ON worker_service_areas FOR ALL USING (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
