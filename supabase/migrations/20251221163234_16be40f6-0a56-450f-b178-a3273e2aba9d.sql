-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for experiment difficulty
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create enum for experiment category
CREATE TYPE public.experiment_category AS ENUM ('physics', 'chemistry', 'biology', 'earth_science');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User badges (earned badges)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, badge_id)
);

-- Experiments table
CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category experiment_category NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 30,
  thumbnail_url TEXT,
  simulation_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User experiment progress
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  score INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, experiment_id)
);

-- Custom user experiments (builder)
CREATE TABLE public.custom_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  components JSONB DEFAULT '[]',
  scripts JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Collaboration rooms
CREATE TABLE public.collaboration_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Room participants
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  cursor_x REAL DEFAULT 0,
  cursor_y REAL DEFAULT 0,
  UNIQUE (room_id, user_id)
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User quiz results
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can view all, update their own
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles: viewable by authenticated users
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Badges: viewable by everyone
CREATE POLICY "Badges viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges: users can view all, insert their own
CREATE POLICY "User badges viewable" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Experiments: viewable by everyone
CREATE POLICY "Experiments viewable by everyone" ON public.experiments FOR SELECT USING (true);
CREATE POLICY "Authenticated can create experiments" ON public.experiments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- User progress: users manage their own
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Custom experiments: users manage their own, view public ones
CREATE POLICY "View public or own custom experiments" ON public.custom_experiments FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users create own custom experiments" ON public.custom_experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own custom experiments" ON public.custom_experiments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own custom experiments" ON public.custom_experiments FOR DELETE USING (auth.uid() = user_id);

-- Collaboration rooms: viewable by authenticated, host manages
CREATE POLICY "View active rooms" ON public.collaboration_rooms FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated create rooms" ON public.collaboration_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host updates room" ON public.collaboration_rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host deletes room" ON public.collaboration_rooms FOR DELETE USING (auth.uid() = host_id);

-- Room participants: room members can view/manage
CREATE POLICY "View room participants" ON public.room_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Join room" ON public.room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own cursor" ON public.room_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Leave room" ON public.room_participants FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: room members can view/send
CREATE POLICY "View room messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Quizzes: viewable by everyone
CREATE POLICY "Quizzes viewable" ON public.quizzes FOR SELECT USING (true);

-- Quiz results: users manage their own
CREATE POLICY "Users view own results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users submit results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_custom_experiments_updated_at BEFORE UPDATE ON public.custom_experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for collaboration features
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert some default badges
INSERT INTO public.badges (name, description, icon, points) VALUES
('First Steps', 'Complete your first experiment', 'rocket', 10),
('Explorer', 'Try 5 different experiments', 'compass', 25),
('Scientist', 'Complete 10 experiments', 'flask', 50),
('Master', 'Complete 25 experiments', 'award', 100),
('Quiz Whiz', 'Pass 5 quizzes with 90%+ score', 'brain', 75),
('Collaborator', 'Join 3 collaboration sessions', 'users', 30),
('Creator', 'Build your first custom experiment', 'hammer', 40),
('Streak', 'Use the app 7 days in a row', 'flame', 60);

-- Insert some sample experiments
INSERT INTO public.experiments (title, description, category, difficulty, duration_minutes, simulation_type, is_featured) VALUES
('Simple Pendulum', 'Explore the physics of a swinging pendulum and discover the relationship between length and period.', 'physics', 'beginner', 15, 'pendulum', true),
('Projectile Motion', 'Launch projectiles at different angles and velocities to understand parabolic motion.', 'physics', 'intermediate', 20, 'projectile', true),
('Spring Oscillation', 'Study Hooke''s law and simple harmonic motion with springs and masses.', 'physics', 'beginner', 15, 'spring', true),
('Wave Interference', 'Visualize constructive and destructive interference patterns.', 'physics', 'intermediate', 25, 'wave', false),
('Electric Circuits', 'Build and analyze series and parallel circuits.', 'physics', 'advanced', 30, 'circuit', true),
('Chemical Reactions', 'Mix virtual chemicals and observe reaction rates and products.', 'chemistry', 'intermediate', 20, 'reaction', true),
('Molecular Structure', 'Explore 3D molecular structures and bonding.', 'chemistry', 'beginner', 15, 'molecule', false),
('Cell Division', 'Watch mitosis and meiosis in action.', 'biology', 'intermediate', 25, 'cell', true),
('Ecosystem Simulation', 'Model predator-prey relationships and population dynamics.', 'biology', 'advanced', 30, 'ecosystem', false),
('Plate Tectonics', 'Simulate continental drift and earthquake formation.', 'earth_science', 'intermediate', 20, 'tectonics', true),
('Weather Patterns', 'Create and observe weather systems and atmospheric phenomena.', 'earth_science', 'beginner', 15, 'weather', false),
('Rock Cycle', 'Transform rocks through igneous, sedimentary, and metamorphic processes.', 'earth_science', 'beginner', 20, 'rock_cycle', false);