-- 00040_set_search_path_on_security_definer_fns.sql
--
-- NOTE ON APPLICATION: Like the other migrations on this project, this may need
-- to be applied via the Supabase Dashboard SQL Editor. ALTER FUNCTION requires
-- ownership of the function being altered; the dashboard executes SQL with
-- sufficient privileges (the function owner / superuser) for these statements to
-- succeed.
--
-- WHY THIS EXISTS
-- The Supabase Security Advisor flags `function_search_path_mutable` for every
-- SECURITY DEFINER function that does not pin its `search_path`. A SECURITY
-- DEFINER function runs with the privileges of its OWNER rather than the caller.
-- If the function references objects unqualified (e.g. `profiles` instead of
-- `public.profiles`), an attacker who can create objects in a schema that sits
-- earlier on the resolved search_path can shadow those references and have their
-- malicious object executed with the owner's elevated privileges. Pinning the
-- search_path closes this privilege-escalation vector.
--
-- `search_path = public, pg_temp` is the recommended safe value: it resolves
-- against the application schema first, with `pg_temp` listed LAST so that
-- session-temporary objects cannot shadow real ones.
--
-- This migration only sets the search_path on each SECURITY DEFINER function.
-- It does NOT recreate or otherwise modify any function body or behavior.
--
-- Functions covered (name + signature + source migration):
--   public.handle_new_user()                  -- 00002_create_profiles.sql
--   public.update_worker_rating()             -- 00009_create_reviews.sql
--   public.generate_income_statement(uuid, date) -- 00020_create_income_statements.sql
--   public.generate_referral_code()           -- 00024_create_referrals.sql
--   public.qualify_referral_on_review()       -- 00024_create_referrals.sql

-- 00002_create_profiles.sql
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;

-- 00009_create_reviews.sql
ALTER FUNCTION public.update_worker_rating() SET search_path = public, pg_temp;

-- 00020_create_income_statements.sql
ALTER FUNCTION public.generate_income_statement(uuid, date) SET search_path = public, pg_temp;

-- 00024_create_referrals.sql
ALTER FUNCTION public.generate_referral_code() SET search_path = public, pg_temp;
ALTER FUNCTION public.qualify_referral_on_review() SET search_path = public, pg_temp;
