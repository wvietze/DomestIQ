CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  hourly_rate NUMERIC(10,2),
  overall_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  location GEOGRAPHY(POINT, 4326),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  service_radius_km INTEGER NOT NULL DEFAULT 25,
  id_verified BOOLEAN NOT NULL DEFAULT false,
  criminal_check_clear BOOLEAN NOT NULL DEFAULT false,
  search_rank NUMERIC(10,2) NOT NULL DEFAULT 0,
  profile_completeness INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST(location);
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_search_rank ON worker_profiles(search_rank DESC);
CREATE INDEX idx_worker_profiles_is_active ON worker_profiles(is_active) WHERE is_active = true;

ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker profiles are publicly viewable" ON worker_profiles FOR SELECT USING (true);
CREATE POLICY "Workers can update own profile" ON worker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Workers can insert own profile" ON worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-compute search_rank
CREATE OR REPLACE FUNCTION compute_search_rank()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_rank = (NEW.overall_rating * 20) + (NEW.profile_completeness * 0.3) +
    CASE WHEN NEW.id_verified THEN 10 ELSE 0 END +
    CASE WHEN NEW.criminal_check_clear THEN 5 ELSE 0 END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_worker_search_rank
  BEFORE INSERT OR UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION compute_search_rank();
