-- Silence the recurring Supabase Security Advisor warning `rls_disabled_in_public`
-- for `public.spatial_ref_sys`.
--
-- `spatial_ref_sys` is a system table created by the PostGIS extension (see
-- migration 00001). It lives in the `public` schema, so PostgREST exposes it and
-- the advisor flags it as having RLS disabled. The data is non-sensitive public
-- reference data (EPSG coordinate-system definitions) — there is nothing to leak —
-- but the advisor only checks whether RLS is enabled.
--
-- Enabling RLS with a permissive SELECT policy clears the advisory while keeping
-- the table readable, so PostGIS coordinate lookups continue to work. Our location
-- search uses geography(4326) via ST_DWithin/ST_Distance, which does not read this
-- table at runtime, so this is a no-op for app behaviour.
--
-- NOTE: `spatial_ref_sys` may be owned by `supabase_admin`. If `ALTER TABLE ...`
-- raises "must be owner of table spatial_ref_sys", run this in the Supabase
-- Dashboard SQL Editor (which executes with sufficient privileges).

ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spatial_ref_sys is public reference data"
  ON public.spatial_ref_sys
  FOR SELECT
  USING (true);
