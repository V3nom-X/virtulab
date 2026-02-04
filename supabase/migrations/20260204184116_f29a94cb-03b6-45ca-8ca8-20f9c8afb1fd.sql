-- 1. Create is_admin RPC function for server-side admin verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 2. Fix experiment_likes table - require authentication for SELECT
DROP POLICY IF EXISTS "Users can view all likes" ON public.experiment_likes;

CREATE POLICY "Authenticated users can view likes"
ON public.experiment_likes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Fix user_badges table - remove direct INSERT policy, create secure function
DROP POLICY IF EXISTS "Users earn badges" ON public.user_badges;

-- Create secure badge award function that validates badge requirements
CREATE OR REPLACE FUNCTION public.award_badge_secure(
  _badge_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _badge_id UUID;
  _user_id UUID;
  _completed_count INTEGER;
  _physics_count INTEGER;
  _chemistry_count INTEGER;
  _biology_count INTEGER;
  _perfect_quiz_count INTEGER;
  _custom_exp_count INTEGER;
  _has_all_categories BOOLEAN;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get badge ID
  SELECT id INTO _badge_id FROM badges WHERE name = _badge_name;
  
  IF _badge_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already earned
  IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = _badge_id) THEN
    RETURN TRUE; -- Already has badge
  END IF;
  
  -- Validate badge requirements based on badge name
  
  -- First Experiment badge - check if user has completed at least 1 experiment
  IF _badge_name = 'First Experiment' THEN
    SELECT COUNT(*) INTO _completed_count 
    FROM user_progress 
    WHERE user_id = _user_id AND completed = true;
    
    IF _completed_count < 1 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Physics Pro - 10 physics experiments
  IF _badge_name = 'Physics Pro' THEN
    SELECT COUNT(*) INTO _physics_count 
    FROM user_progress up
    JOIN experiments e ON up.experiment_id = e.id
    WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'physics';
    
    IF _physics_count < 10 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Chemistry Starter - 5 chemistry experiments
  IF _badge_name = 'Chemistry Starter' THEN
    SELECT COUNT(*) INTO _chemistry_count 
    FROM user_progress up
    JOIN experiments e ON up.experiment_id = e.id
    WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'chemistry';
    
    IF _chemistry_count < 5 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Biology Beginner - 5 biology experiments
  IF _badge_name = 'Biology Beginner' THEN
    SELECT COUNT(*) INTO _biology_count 
    FROM user_progress up
    JOIN experiments e ON up.experiment_id = e.id
    WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'biology';
    
    IF _biology_count < 5 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Science Explorer - at least 1 from each category
  IF _badge_name = 'Science Explorer' THEN
    SELECT 
      (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'physics') >= 1
      AND
      (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'chemistry') >= 1
      AND
      (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'biology') >= 1
      AND
      (SELECT COUNT(*) FROM user_progress up JOIN experiments e ON up.experiment_id = e.id WHERE up.user_id = _user_id AND up.completed = true AND e.category = 'earth_science') >= 1
    INTO _has_all_categories;
    
    IF NOT _has_all_categories THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Quiz Master - 5 perfect quizzes
  IF _badge_name = 'Quiz Master' THEN
    SELECT COUNT(*) INTO _perfect_quiz_count 
    FROM quiz_results 
    WHERE user_id = _user_id AND score = 100 AND passed = true;
    
    IF _perfect_quiz_count < 5 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Master Builder - 5 custom experiments
  IF _badge_name = 'Master Builder' THEN
    SELECT COUNT(*) INTO _custom_exp_count 
    FROM custom_experiments 
    WHERE user_id = _user_id;
    
    IF _custom_exp_count < 5 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- All validations passed - award the badge
  INSERT INTO user_badges (user_id, badge_id)
  VALUES (_user_id, _badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;