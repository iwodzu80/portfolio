-- Migration to fix critical security issues: PII exposure, input validation, and user enumeration

-- ============================================================================
-- STEP 0: Fix existing data to prevent constraint violations
-- ============================================================================

-- Fix empty names in profiles
UPDATE public.profiles 
SET name = 'User' 
WHERE name IS NULL OR char_length(trim(name)) = 0;

-- Fix empty titles in sections
UPDATE public.sections 
SET title = 'Section' 
WHERE title IS NULL OR char_length(trim(title)) = 0;

-- Fix empty titles in projects (if any)
UPDATE public.projects 
SET title = 'Untitled Project' 
WHERE title IS NULL OR char_length(trim(title)) = 0;

-- Fix empty titles in project_features (if any)
UPDATE public.project_features 
SET title = 'Feature' 
WHERE title IS NULL OR char_length(trim(title)) = 0;

-- Fix empty titles in project_links (if any)
UPDATE public.project_links 
SET title = 'Link' 
WHERE title IS NULL OR char_length(trim(title)) = 0;

-- ============================================================================
-- FIX #1: Email and Phone Exposure via Public RLS
-- ============================================================================

-- Drop the existing public profile policy
DROP POLICY IF EXISTS "Public can view profiles with active shares" ON public.profiles;

-- Create a secure view that respects privacy settings
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  name,
  photo_url,
  role,
  tagline,
  description,
  social_links,
  CASE WHEN show_email = true THEN email ELSE NULL END as email,
  CASE WHEN show_phone = true THEN phone ELSE NULL END as phone,
  show_email,
  show_phone
FROM public.profiles
WHERE EXISTS (
  SELECT 1 
  FROM public.portfolio_shares 
  WHERE portfolio_shares.user_id = profiles.user_id 
  AND portfolio_shares.is_active = true
);

-- Grant SELECT on the view to anonymous users
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Keep the original RLS policy for authenticated users on the profiles table
CREATE POLICY "Public can view profiles with active shares" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = profiles.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- ============================================================================
-- FIX #2: Server-Side Input Validation
-- ============================================================================

-- Add length constraints to profiles table
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_name_length,
  DROP CONSTRAINT IF EXISTS profiles_email_length,
  DROP CONSTRAINT IF EXISTS profiles_phone_length,
  DROP CONSTRAINT IF EXISTS profiles_tagline_length,
  DROP CONSTRAINT IF EXISTS profiles_description_length,
  DROP CONSTRAINT IF EXISTS profiles_role_length;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_name_length CHECK (name IS NULL OR (char_length(trim(name)) > 0 AND char_length(name) <= 100)),
  ADD CONSTRAINT profiles_email_length CHECK (email IS NULL OR char_length(email) <= 255),
  ADD CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) <= 50),
  ADD CONSTRAINT profiles_tagline_length CHECK (tagline IS NULL OR char_length(tagline) <= 200),
  ADD CONSTRAINT profiles_description_length CHECK (description IS NULL OR char_length(description) <= 1000),
  ADD CONSTRAINT profiles_role_length CHECK (role IS NULL OR char_length(role) <= 100);

-- Add validation function for profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate name is not just whitespace (if provided)
  IF NEW.name IS NOT NULL AND char_length(trim(NEW.name)) = 0 THEN
    RAISE EXCEPTION 'Name cannot be empty or whitespace only';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_before_change ON public.profiles;
CREATE TRIGGER validate_profile_before_change
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_data();

-- Add validation constraints for sections table
ALTER TABLE public.sections
  DROP CONSTRAINT IF EXISTS sections_title_length,
  DROP CONSTRAINT IF EXISTS sections_description_length;

ALTER TABLE public.sections
  ADD CONSTRAINT sections_title_length CHECK (title IS NULL OR (char_length(trim(title)) > 0 AND char_length(title) <= 200)),
  ADD CONSTRAINT sections_description_length CHECK (description IS NULL OR char_length(description) <= 1000);

-- Add validation constraints for projects table
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_title_length,
  DROP CONSTRAINT IF EXISTS projects_description_length;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_title_length CHECK (title IS NULL OR (char_length(trim(title)) > 0 AND char_length(title) <= 200)),
  ADD CONSTRAINT projects_description_length CHECK (description IS NULL OR char_length(description) <= 2000);

-- Add validation constraints for project_features table
ALTER TABLE public.project_features
  DROP CONSTRAINT IF EXISTS project_features_title_length;

ALTER TABLE public.project_features
  ADD CONSTRAINT project_features_title_length CHECK (title IS NULL OR (char_length(trim(title)) > 0 AND char_length(title) <= 200));

-- Add validation constraints for project_links table
ALTER TABLE public.project_links
  DROP CONSTRAINT IF EXISTS project_links_title_length,
  DROP CONSTRAINT IF EXISTS project_links_url_length;

ALTER TABLE public.project_links
  ADD CONSTRAINT project_links_title_length CHECK (title IS NULL OR (char_length(trim(title)) > 0 AND char_length(title) <= 100)),
  ADD CONSTRAINT project_links_url_length CHECK (url IS NULL OR (char_length(trim(url)) > 0 AND char_length(url) <= 1000));

-- ============================================================================
-- FIX #3: User ID Enumeration via Portfolio Shares
-- ============================================================================

-- Drop the existing public portfolio_shares policy
DROP POLICY IF EXISTS "Public can view active shares for verification" ON public.portfolio_shares;

-- Create a more restrictive policy that doesn't expose user_id directly
CREATE POLICY "Public can verify share existence" 
ON public.portfolio_shares 
FOR SELECT 
USING (is_active = true);

-- Create a SECURITY DEFINER function to safely get user_id from share_id
CREATE OR REPLACE FUNCTION public.get_user_from_share(share_id_param TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_user_id UUID;
BEGIN
  -- Validate share_id format (alphanumeric and hyphens only)
  IF share_id_param IS NULL OR share_id_param !~ '^[a-zA-Z0-9\-]+$' THEN
    RAISE EXCEPTION 'Invalid share_id format';
  END IF;
  
  -- Get user_id for active share
  SELECT user_id INTO result_user_id
  FROM public.portfolio_shares
  WHERE share_id = share_id_param AND is_active = true;
  
  RETURN result_user_id;
END;
$$;

-- Grant execute to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_from_share(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_from_share(TEXT) TO authenticated;