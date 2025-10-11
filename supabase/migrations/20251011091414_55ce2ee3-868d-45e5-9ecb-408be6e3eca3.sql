-- Add social_links and is_public columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.social_links IS 'Array of social media links with platform and url';
COMMENT ON COLUMN public.profiles.is_public IS 'Whether the profile is publicly visible';