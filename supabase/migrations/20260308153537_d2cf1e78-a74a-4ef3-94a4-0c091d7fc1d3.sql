
-- 1. Fix chat_messages: Only room participants can read messages
DROP POLICY IF EXISTS "View room messages" ON public.chat_messages;
CREATE POLICY "View room messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp 
      WHERE rp.room_id = chat_messages.room_id 
      AND rp.user_id = auth.uid()
    )
  );

-- 2. Fix room_participants: Only see participants of rooms you've joined
DROP POLICY IF EXISTS "View room participants" ON public.room_participants;
CREATE POLICY "View room participants" ON public.room_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp 
      WHERE rp.room_id = room_participants.room_id 
      AND rp.user_id = auth.uid()
    )
  );

-- 3. Fix user_roles: Users can only view their own role (admins use is_admin() RPC)
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;
CREATE POLICY "Users view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin can view all roles (needed for admin panel)
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix user_badges: Only authenticated users can view (not public)
DROP POLICY IF EXISTS "User badges viewable" ON public.user_badges;
CREATE POLICY "User badges viewable by authenticated" ON public.user_badges
  FOR SELECT TO authenticated
  USING (true);

-- 5. Admin-only INSERT/UPDATE on user_roles (for role management)
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Create secure admin role update function
CREATE OR REPLACE FUNCTION public.update_user_role(_target_user_id uuid, _new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can update roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Prevent removing the last admin
  IF _new_role != 'admin' THEN
    IF (SELECT COUNT(*) FROM user_roles WHERE role = 'admin' AND user_id != _target_user_id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last admin';
    END IF;
  END IF;
  
  -- Upsert the role
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id, role) DO UPDATE SET role = _new_role;
  
  -- Delete old role entries if user had a different role
  DELETE FROM user_roles 
  WHERE user_id = _target_user_id AND role != _new_role;
  
  RETURN true;
END;
$$;
