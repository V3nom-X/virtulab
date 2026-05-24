
DO $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower('benjaminkale81@gmail.com') LIMIT 1;
  IF _uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    DELETE FROM public.user_roles WHERE user_id = _uid AND role <> 'admin'::app_role;
  ELSE
    RAISE NOTICE 'User benjaminkale81@gmail.com not found; sign up first, then re-run.';
  END IF;
END$$;
