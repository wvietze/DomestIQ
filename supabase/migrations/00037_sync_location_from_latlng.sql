-- Auto-populate PostGIS geography columns from lat/lng on worker_profiles and
-- worker_service_areas. Prior migrations require client code to set the
-- geography column directly, which is awkward via PostgREST — seed scripts,
-- help-desk registration, and the worker onboarding form all set lat/lng only.
-- This trigger makes the geography column derivable, so search_workers() can
-- rely on it regardless of how rows are created.

CREATE OR REPLACE FUNCTION sync_worker_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_worker_profiles_location ON worker_profiles;
CREATE TRIGGER sync_worker_profiles_location
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_worker_location();

CREATE OR REPLACE FUNCTION sync_service_area_center()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.center_lat IS NOT NULL AND NEW.center_lng IS NOT NULL THEN
    NEW.center = ST_SetSRID(ST_MakePoint(NEW.center_lng, NEW.center_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_service_areas_center ON worker_service_areas;
CREATE TRIGGER sync_service_areas_center
  BEFORE INSERT OR UPDATE OF center_lat, center_lng ON worker_service_areas
  FOR EACH ROW EXECUTE FUNCTION sync_service_area_center();

-- Backfill existing rows that have lat/lng but no geography set.
UPDATE worker_profiles
SET location = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location IS NULL
  AND location_lat IS NOT NULL
  AND location_lng IS NOT NULL;

UPDATE worker_service_areas
SET center = ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
WHERE center IS NULL
  AND center_lat IS NOT NULL
  AND center_lng IS NOT NULL;
