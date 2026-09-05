-- 1. Badge awarding: explicit allow-list with default deny
CREATE OR REPLACE FUNCTION public.award_badge_secure(_badge_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _badge_id UUID;
  _user_id UUID;
  _completed_count INTEGER;
  _distinct_started INTEGER;
  _physics_count INTEGER;
  _chemistry_count INTEGER;
  _biology_count INTEGER;
  _perfect_quiz_count INTEGER;
  _passed_quiz_count INTEGER;
  _custom_exp_count INTEGER;
  _room_count INTEGER;
  _has_all_categories BOOLEAN;
  _ok BOOLEAN := FALSE;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RETURN FALSE; END IF;

  SELECT id INTO _badge_id FROM badges WHERE name = _badge_name LIMIT 1;
  IF _badge_id IS NULL THEN RETURN FALSE; END IF;

  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = _badge_id) THEN
    RETURN TRUE;
  END IF;

  SELECT COUNT(*) INTO _completed_count FROM user_progress WHERE user_id = _user_id AND completed = true;
  SELECT COUNT(DISTINCT experiment_id) INTO _distinct_started FROM user_progress WHERE user_id = _user_id;

  CASE _badge_name
    WHEN 'First Experiment', 'First Steps' THEN
      _ok := _completed_count >= 1;
    WHEN 'Explorer' THEN
      _ok := _distinct_started >= 5;
    WHEN 'Scientist' THEN
      _ok := _completed_count >= 10;
    WHEN 'Master' THEN
      _ok := _completed_count >= 25;
    WHEN 'Physics Pro' THEN
      SELECT COUNT(*) INTO _physics_count
      FROM user_progress up JOIN experiments e ON up.experiment_id = e.id
      WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'physics';
      _ok := _physics_count >= 10;
    WHEN 'Chemistry Starter' THEN
      SELECT COUNT(*) INTO _chemistry_count
      FROM user_progress up JOIN experiments e ON up.experiment_id = e.id
      WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'chemistry';
      _ok := _chemistry_count >= 5;
    WHEN 'Biology Beginner' THEN
      SELECT COUNT(*) INTO _biology_count
      FROM user_progress up JOIN experiments e ON up.experiment_id = e.id
      WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'biology';
      _ok := _biology_count >= 5;
    WHEN 'Science Explorer' THEN
      SELECT
        (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'physics') >= 1
        AND (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'chemistry') >= 1
        AND (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'biology') >= 1
        AND (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'earth_science') >= 1
      INTO _has_all_categories;
      _ok := COALESCE(_has_all_categories, FALSE);
    WHEN 'Quiz Master' THEN
      SELECT COUNT(*) INTO _perfect_quiz_count FROM quiz_results WHERE user_id = _user_id AND score = 100 AND passed = true;
      _ok := _perfect_quiz_count >= 5;
    WHEN 'Quiz Whiz' THEN
      SELECT COUNT(*) INTO _passed_quiz_count FROM quiz_results WHERE user_id = _user_id AND score >= 90 AND passed = true;
      _ok := _passed_quiz_count >= 5;
    WHEN 'Creator' THEN
      SELECT COUNT(*) INTO _custom_exp_count FROM custom_experiments WHERE user_id = _user_id;
      _ok := _custom_exp_count >= 1;
    WHEN 'Master Builder' THEN
      SELECT COUNT(*) INTO _custom_exp_count FROM custom_experiments WHERE user_id = _user_id;
      _ok := _custom_exp_count >= 5;
    WHEN 'Collaborator' THEN
      SELECT COUNT(DISTINCT room_id) INTO _room_count FROM room_participants WHERE user_id = _user_id;
      _ok := _room_count >= 3;
    ELSE
      -- Default deny: badges without a server-verifiable requirement
      -- (e.g. 'Streak', 'Week Streak', 'Video Learner') can never be self-awarded.
      RETURN FALSE;
  END CASE;

  IF NOT _ok THEN RETURN FALSE; END IF;

  INSERT INTO user_badges (user_id, badge_id)
  VALUES (_user_id, _badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN TRUE;
END;
$function$;

-- 2. MFA assurance helper: if the user enrolled a verified TOTP factor,
-- their token must be aal2 to touch personal data.
CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN FALSE
    WHEN EXISTS (
      SELECT 1 FROM auth.mfa_factors f
      WHERE f.user_id = auth.uid() AND f.status = 'verified'
    ) THEN COALESCE(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    ELSE TRUE
  END;
$$;

REVOKE ALL ON FUNCTION public.mfa_satisfied() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mfa_satisfied() TO authenticated;

-- 3. Strip leftover privileges from anon on every public table,
-- keeping only read access to the public catalog tables.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
END $$;

GRANT SELECT ON public.experiments TO anon;
GRANT SELECT ON public.badges TO anon;
GRANT SELECT ON public.challenges TO anon;

-- Trim authenticated privileges to what policies actually allow
REVOKE INSERT, UPDATE, DELETE ON public.badges FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.challenges FROM authenticated;
REVOKE UPDATE, DELETE ON public.experiments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quizzes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_badges FROM authenticated;

-- 4. Re-scope policies to the authenticated role (+ MFA gate on personal data)

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (public.mfa_satisfied());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied())
  WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());

-- quizzes: answer keys only for signed-in users
DROP POLICY IF EXISTS "Quizzes viewable" ON public.quizzes;
CREATE POLICY "Quizzes viewable by authenticated" ON public.quizzes
  FOR SELECT TO authenticated USING (true);

-- quiz_results / user_progress (read-only from client)
DROP POLICY IF EXISTS "Users view own results" ON public.quiz_results;
CREATE POLICY "Users view own results" ON public.quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());
DROP POLICY IF EXISTS "Users view own progress" ON public.user_progress;
CREATE POLICY "Users view own progress" ON public.user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());

-- custom_experiments
DROP POLICY IF EXISTS "Users create own custom experiments" ON public.custom_experiments;
DROP POLICY IF EXISTS "Users update own custom experiments" ON public.custom_experiments;
DROP POLICY IF EXISTS "Users delete own custom experiments" ON public.custom_experiments;
DROP POLICY IF EXISTS "View public or own custom experiments" ON public.custom_experiments;
CREATE POLICY "View public or own custom experiments" ON public.custom_experiments
  FOR SELECT TO authenticated USING (is_public = true OR (auth.uid() = user_id AND public.mfa_satisfied()));
CREATE POLICY "Users create own custom experiments" ON public.custom_experiments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users update own custom experiments" ON public.custom_experiments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied())
  WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users delete own custom experiments" ON public.custom_experiments
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());

-- experiment_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.experiment_comments;
DROP POLICY IF EXISTS "Users can add comments" ON public.experiment_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.experiment_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.experiment_comments;
CREATE POLICY "Authenticated can view comments" ON public.experiment_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add comments" ON public.experiment_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.experiment_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.experiment_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- experiment_likes
DROP POLICY IF EXISTS "Authenticated users can view likes" ON public.experiment_likes;
DROP POLICY IF EXISTS "Users can like experiments" ON public.experiment_likes;
DROP POLICY IF EXISTS "Users can unlike experiments" ON public.experiment_likes;
CREATE POLICY "Authenticated users can view likes" ON public.experiment_likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like experiments" ON public.experiment_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike experiments" ON public.experiment_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- favorite_channels
DROP POLICY IF EXISTS "Users can view their own favorite channels" ON public.favorite_channels;
DROP POLICY IF EXISTS "Users can add their own favorite channels" ON public.favorite_channels;
DROP POLICY IF EXISTS "Users can delete their own favorite channels" ON public.favorite_channels;
CREATE POLICY "Users can view their own favorite channels" ON public.favorite_channels
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users can add their own favorite channels" ON public.favorite_channels
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users can delete their own favorite channels" ON public.favorite_channels
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());

-- user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND public.mfa_satisfied())
  WITH CHECK (auth.uid() = user_id AND public.mfa_satisfied());

-- room_participants
DROP POLICY IF EXISTS "Leave room" ON public.room_participants;
DROP POLICY IF EXISTS "Update own cursor" ON public.room_participants;
CREATE POLICY "Leave room" ON public.room_participants
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Update own cursor" ON public.room_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- collaboration_rooms
DROP POLICY IF EXISTS "Host deletes room" ON public.collaboration_rooms;
DROP POLICY IF EXISTS "Host updates room" ON public.collaboration_rooms;
CREATE POLICY "Host deletes room" ON public.collaboration_rooms
  FOR DELETE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Host updates room" ON public.collaboration_rooms
  FOR UPDATE TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);