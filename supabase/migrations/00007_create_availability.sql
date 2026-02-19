CREATE TABLE worker_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, day_of_week)
);

CREATE TABLE worker_blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, blocked_date)
);

ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is publicly viewable" ON worker_availability FOR SELECT USING (true);
CREATE POLICY "Workers can manage own availability" ON worker_availability FOR ALL USING (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Blocked dates are publicly viewable" ON worker_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Workers can manage own blocked dates" ON worker_blocked_dates FOR ALL USING (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
