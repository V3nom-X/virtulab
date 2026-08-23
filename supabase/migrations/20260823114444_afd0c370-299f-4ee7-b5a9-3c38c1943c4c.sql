-- 1) Score sanity bounds
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_score_range CHECK (score >= 0 AND score <= 100);

-- 2) Server-side quiz grading
CREATE OR REPLACE FUNCTION public.grade_quiz(_quiz_id uuid, _answers jsonb)
RETURNS TABLE (score integer, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _questions jsonb;
  _passing integer;
  _total integer;
  _correct integer := 0;
  _i integer;
  _score integer;
  _passed boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF jsonb_typeof(_answers) <> 'array' OR jsonb_array_length(_answers) > 200 THEN
    RAISE EXCEPTION 'Invalid answers payload';
  END IF;

  SELECT q.questions, COALESCE(q.passing_score, 70) INTO _questions, _passing
  FROM quizzes q WHERE q.id = _quiz_id;

  IF _questions IS NULL THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  _total := jsonb_array_length(_questions);
  IF _total = 0 THEN
    RAISE EXCEPTION 'Quiz has no questions';
  END IF;

  FOR _i IN 0.._total - 1 LOOP
    IF (_answers -> _i) IS NOT NULL
       AND (_answers -> _i) = (_questions -> _i -> 'correctAnswer') THEN
      _correct := _correct + 1;
    END IF;
  END LOOP;

  _score := ROUND((_correct::numeric / _total) * 100);
  _passed := _score >= _passing;

  INSERT INTO quiz_results (user_id, quiz_id, score, passed)
  VALUES (_user_id, _quiz_id, _score, _passed);

  RETURN QUERY SELECT _score, _passed;
END;
$$;

-- 3) Server-side progress recording
CREATE OR REPLACE FUNCTION public.record_experiment_time(_experiment_id uuid, _seconds integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _seconds IS NULL OR _seconds < 0 OR _seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid duration';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM experiments WHERE id = _experiment_id) THEN
    RAISE EXCEPTION 'Experiment not found';
  END IF;

  INSERT INTO user_progress (user_id, experiment_id, time_spent_seconds, last_accessed_at)
  VALUES (_user_id, _experiment_id, _seconds, now())
  ON CONFLICT (user_id, experiment_id) DO UPDATE
    SET time_spent_seconds = COALESCE(user_progress.time_spent_seconds, 0) + _seconds,
        last_accessed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_experiment(_experiment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _best_score integer;
  _time integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM experiments WHERE id = _experiment_id) THEN
    RAISE EXCEPTION 'Experiment not found';
  END IF;

  SELECT MAX(qr.score) INTO _best_score
  FROM quiz_results qr
  JOIN quizzes q ON q.id = qr.quiz_id
  WHERE qr.user_id = _user_id AND q.experiment_id = _experiment_id AND qr.passed = true;

  SELECT COALESCE(time_spent_seconds, 0) INTO _time
  FROM user_progress WHERE user_id = _user_id AND experiment_id = _experiment_id;

  -- Completion requires a verified passing quiz OR at least 2 minutes of tracked activity
  IF _best_score IS NULL AND COALESCE(_time, 0) < 120 THEN
    RETURN false;
  END IF;

  INSERT INTO user_progress (user_id, experiment_id, completed, score, completed_at, last_accessed_at)
  VALUES (_user_id, _experiment_id, true, _best_score, now(), now())
  ON CONFLICT (user_id, experiment_id) DO UPDATE
    SET completed = true,
        score = COALESCE(EXCLUDED.score, user_progress.score),
        completed_at = COALESCE(user_progress.completed_at, now()),
        last_accessed_at = now();

  RETURN true;
END;
$$;

-- Uniqueness needed by the upserts above
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_experiment_key ON public.user_progress (user_id, experiment_id);

-- 4) Remove direct client writes to progress/quiz results
DROP POLICY IF EXISTS "Users create own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users submit results" ON public.quiz_results;
REVOKE INSERT, UPDATE, DELETE ON public.user_progress FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_results FROM authenticated, anon;

-- 5) Room participation check without self-referential policy
CREATE OR REPLACE FUNCTION public.is_room_participant(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM room_participants rp
    WHERE rp.room_id = _room_id AND rp.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM collaboration_rooms cr
    WHERE cr.id = _room_id AND cr.host_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "View room participants" ON public.room_participants;
CREATE POLICY "View room participants" ON public.room_participants
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_room_participant(room_id));

DROP POLICY IF EXISTS "View room messages" ON public.chat_messages;
CREATE POLICY "View room messages" ON public.chat_messages
FOR SELECT TO authenticated
USING (public.is_room_participant(room_id));

DROP POLICY IF EXISTS "Send messages" ON public.chat_messages;
CREATE POLICY "Send messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_room_participant(room_id));

-- 6) Drop duplicate public-role avatar storage policies
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- 7) Lock down internal SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.grade_quiz(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_experiment_time(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_experiment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_room_participant(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grade_quiz(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_experiment_time(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_experiment(uuid) TO authenticated;

-- 8) Quiz answers must not be discoverable before sign-in
REVOKE SELECT ON public.quizzes FROM anon;

-- 9) The app uses the REST API only: close the GraphQL schema to app roles
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql_public FROM anon, authenticated;