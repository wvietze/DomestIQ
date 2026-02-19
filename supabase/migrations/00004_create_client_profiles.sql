CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  suburb TEXT,
  city TEXT,
  province TEXT,
  location GEOGRAPHY(POINT, 4326),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  preferred_contact TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own profile" ON client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Clients can update own profile" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Clients can insert own profile" ON client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
