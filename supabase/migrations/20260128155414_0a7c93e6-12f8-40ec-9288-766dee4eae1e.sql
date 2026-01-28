-- Add last_active_at column to profiles for tracking user activity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient querying of inactive users
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at DESC);