-- Add public read policies for portfolio sharing feature
-- These policies allow anonymous users to view portfolio data when accessing via valid, active share links

-- 1. Add public read policy for profiles table
-- Allow reading profile data if the user has an active portfolio share
CREATE POLICY "Allow public access to profiles with active shares" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = profiles.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- 2. Add public read policy for sections table
-- Allow reading sections if the user has an active portfolio share
CREATE POLICY "Allow public access to sections with active shares" 
ON public.sections 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = sections.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- 3. Add public read policy for projects table
-- Allow reading projects if the user has an active portfolio share
CREATE POLICY "Allow public access to projects with active shares" 
ON public.projects 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = projects.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- 4. Add public read policy for project_links table
-- Allow reading project links if the project owner has an active portfolio share
CREATE POLICY "Allow public access to project_links with active shares" 
ON public.project_links 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects 
    JOIN public.portfolio_shares ON portfolio_shares.user_id = projects.user_id
    WHERE projects.id = project_links.project_id 
    AND portfolio_shares.is_active = true
  )
);

-- 5. Add public read policy for project_features table
-- Allow reading project features if the project owner has an active portfolio share
CREATE POLICY "Allow public access to project_features with active shares" 
ON public.project_features 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects 
    JOIN public.portfolio_shares ON portfolio_shares.user_id = projects.user_id
    WHERE projects.id = project_features.project_id 
    AND portfolio_shares.is_active = true
  )
);

-- 6. Add public read policy for portfolio_shares table itself
-- Allow reading portfolio shares to verify if a share_id is valid and active
CREATE POLICY "Allow public access to verify active shares" 
ON public.portfolio_shares 
FOR SELECT 
TO public
USING (is_active = true);