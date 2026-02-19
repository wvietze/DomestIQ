CREATE TABLE worker_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  skill_level TEXT DEFAULT 'intermediate',
  custom_rate NUMERIC(10,2),
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, service_id)
);

ALTER TABLE worker_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Worker services are publicly viewable" ON worker_services FOR SELECT USING (true);
CREATE POLICY "Workers can manage own services" ON worker_services FOR ALL USING (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
