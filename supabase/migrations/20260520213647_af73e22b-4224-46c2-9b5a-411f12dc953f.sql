-- 1) Storage: remove broad listing on avatars bucket, keep public URLs working
DO $$ BEGIN
  -- Drop legacy broad SELECT policies that allow listing all avatar files
  EXECUTE (
    SELECT string_agg(format('DROP POLICY IF EXISTS %I ON storage.objects;', polname), ' ')
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
      AND (qual ILIKE '%avatars%' OR qual = 'true' OR polname ILIKE '%avatar%public%')
  );
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Owner-scoped policies for avatars (path convention: <user_id>/<filename>)
DROP POLICY IF EXISTS "Avatar owners can list" ON storage.objects;
CREATE POLICY "Avatar owners can list"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar owners can upload" ON storage.objects;
CREATE POLICY "Avatar owners can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar owners can update" ON storage.objects;
CREATE POLICY "Avatar owners can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar owners can delete" ON storage.objects;
CREATE POLICY "Avatar owners can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2) Hide private tables from anonymous GraphQL/PostgREST exposure.
-- Revoke SELECT from anon on the entire public schema, then re-grant only on
-- tables that are intentionally discoverable before sign-in.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;

GRANT SELECT ON public.badges TO anon;
GRANT SELECT ON public.challenges TO anon;
GRANT SELECT ON public.experiments TO anon;
GRANT SELECT ON public.quizzes TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Make sure new public tables don't accidentally re-expose to anon in future
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM anon;