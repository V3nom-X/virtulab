ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS cinematic_video_enabled boolean NOT NULL DEFAULT true;