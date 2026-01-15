-- Favorite YouTube Channels table
CREATE TABLE public.favorite_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

ALTER TABLE public.favorite_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorite channels"
ON public.favorite_channels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite channels"
ON public.favorite_channels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite channels"
ON public.favorite_channels FOR DELETE
USING (auth.uid() = user_id);

-- Experiment Likes table
CREATE TABLE public.experiment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_id UUID REFERENCES public.custom_experiments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

ALTER TABLE public.experiment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
ON public.experiment_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like experiments"
ON public.experiment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike experiments"
ON public.experiment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Experiment Comments table
CREATE TABLE public.experiment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_id UUID REFERENCES public.custom_experiments(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.experiment_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.experiment_comments FOR SELECT
USING (true);

CREATE POLICY "Users can add comments"
ON public.experiment_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.experiment_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.experiment_comments FOR DELETE
USING (auth.uid() = user_id);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
ON public.challenges FOR SELECT
USING (is_active = true);

-- User preferences table for settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system',
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  color_blind_mode BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  new_experiments_notifications BOOLEAN DEFAULT true,
  community_updates_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Seed badges data
INSERT INTO public.badges (name, description, icon, points) VALUES
('First Experiment', 'Complete your first experiment', '🎯', 10),
('Physics Pro', 'Complete 10 physics experiments', '⚡', 100),
('Chemistry Starter', 'Complete 5 chemistry experiments', '🧪', 50),
('Biology Beginner', 'Complete 5 biology experiments', '🧬', 50),
('Week Streak', 'Log in for 7 consecutive days', '🔥', 70),
('Master Builder', 'Create 5 custom experiments', '🏗️', 80),
('Quiz Master', 'Score 100% on 5 quizzes', '📚', 90),
('Collaborator', 'Join 3 collaboration sessions', '👥', 60),
('Video Learner', 'Watch 10 educational videos', '🎬', 40),
('Science Explorer', 'Complete experiments in all categories', '🔬', 150)
ON CONFLICT DO NOTHING;

-- Seed some challenges
INSERT INTO public.challenges (title, description, category, end_date, points) VALUES
('Winter Physics Challenge', 'Create a simulation involving heat transfer', 'Physics', now() + interval '5 days', 150),
('Biology Visualization', 'Build an interactive cell model', 'Biology', now() + interval '12 days', 120),
('Chemistry Week', 'Complete 5 chemistry experiments', 'Chemistry', now() + interval '7 days', 100)
ON CONFLICT DO NOTHING;

-- Create trigger for user_preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create trigger for experiment_comments updated_at
CREATE TRIGGER update_experiment_comments_updated_at
BEFORE UPDATE ON public.experiment_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);