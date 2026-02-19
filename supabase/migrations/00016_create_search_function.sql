CREATE OR REPLACE FUNCTION search_workers(
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 50,
  p_service_id UUID DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT 0,
  p_available_day INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  worker_id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  hourly_rate NUMERIC,
  overall_rating NUMERIC,
  total_reviews INTEGER,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  service_radius_km INTEGER,
  id_verified BOOLEAN,
  criminal_check_clear BOOLEAN,
  search_rank NUMERIC,
  profile_completeness INTEGER,
  distance_km DOUBLE PRECISION,
  services JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.id AS worker_id,
    wp.user_id,
    p.full_name,
    p.avatar_url,
    wp.bio,
    wp.hourly_rate,
    wp.overall_rating,
    wp.total_reviews,
    wp.location_lat,
    wp.location_lng,
    wp.service_radius_km,
    wp.id_verified,
    wp.criminal_check_clear,
    wp.search_rank,
    wp.profile_completeness,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND wp.location IS NOT NULL
      THEN ST_Distance(wp.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000
      ELSE NULL
    END AS distance_km,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'icon', s.icon))
       FROM worker_services ws JOIN services s ON ws.service_id = s.id WHERE ws.worker_id = wp.id),
      '[]'::jsonb
    ) AS services
  FROM worker_profiles wp
  JOIN profiles p ON wp.user_id = p.id
  WHERE wp.is_active = true
    AND wp.overall_rating >= p_min_rating
    AND (p_service_id IS NULL OR wp.id IN (SELECT ws.worker_id FROM worker_services ws WHERE ws.service_id = p_service_id))
    AND (p_available_day IS NULL OR wp.id IN (SELECT wa.worker_id FROM worker_availability wa WHERE wa.day_of_week = p_available_day AND wa.is_available = true))
    AND (p_lat IS NULL OR p_lng IS NULL OR wp.location IS NULL OR
         ST_DWithin(wp.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000))
  ORDER BY
    CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND wp.location IS NOT NULL
      THEN wp.search_rank - (ST_Distance(wp.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000 * 0.5)
      ELSE wp.search_rank
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
