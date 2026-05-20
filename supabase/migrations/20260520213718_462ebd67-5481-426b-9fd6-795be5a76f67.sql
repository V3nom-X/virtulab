-- Drop the legacy broad SELECT policy on avatars that allows listing all files
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Also revoke from signed-in users so private tables aren't discoverable in GraphQL.
-- (RLS still gates rows; this only hides schema introspection / unrelated tables.)
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM authenticated;

GRANT SELECT ON public.badges TO authenticated;
GRANT SELECT ON public.challenges TO authenticated;
GRANT SELECT ON public.experiments TO authenticated;
GRANT SELECT ON public.quizzes TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.custom_experiments TO authenticated;
GRANT SELECT ON public.experiment_comments TO authenticated;
GRANT SELECT ON public.experiment_likes TO authenticated;
GRANT SELECT ON public.experiment_requests TO authenticated;
GRANT SELECT ON public.favorite_channels TO authenticated;
GRANT SELECT ON public.quiz_results TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT SELECT ON public.user_preferences TO authenticated;
GRANT SELECT ON public.user_progress TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.collaboration_rooms TO authenticated;
GRANT SELECT ON public.room_participants TO authenticated;

-- Preserve write grants used by RLS-protected INSERT/UPDATE/DELETE from clients
GRANT INSERT, UPDATE, DELETE ON
  public.custom_experiments,
  public.experiment_comments,
  public.experiment_likes,
  public.experiment_requests,
  public.favorite_channels,
  public.profiles,
  public.quiz_results,
  public.user_preferences,
  public.user_progress,
  public.user_roles,
  public.chat_messages,
  public.collaboration_rooms,
  public.room_participants,
  public.experiments
TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM authenticated;