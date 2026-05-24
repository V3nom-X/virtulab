
-- 1. Profiles: no longer discoverable pre sign-in
REVOKE SELECT ON public.profiles FROM anon;

-- Also tighten the RLS so even direct queries require auth
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. SECURITY DEFINER function lockdown
-- Strip PUBLIC/anon execute on everything, then re-grant only where intended.
REVOKE EXECUTE ON FUNCTION public.is_admin()                          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.award_badge_secure(text)            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_user_role(uuid, public.app_role) FROM PUBLIC, anon;

-- handle_new_user runs only from the auth trigger; no client role should call it.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Re-grant where intentionally callable by signed-in users
GRANT EXECUTE ON FUNCTION public.is_admin()                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_badge_secure(text)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, public.app_role) TO authenticated;

-- Trigger-only helpers: deny direct invocation entirely
REVOKE EXECUTE ON FUNCTION public.update_updated_at()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_experiment_request()    FROM PUBLIC, anon, authenticated;

-- Default privileges so future functions don't auto-expose to anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;
