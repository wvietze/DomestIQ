-- Add friendly location name to worker_profiles
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS location_name TEXT;
