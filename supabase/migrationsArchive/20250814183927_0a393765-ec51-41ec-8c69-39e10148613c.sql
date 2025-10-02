-- Add public read policies for shared portfolios

-- Allow anyone to view profiles that have active shared portfolios
CREATE POLICY "Public can view profiles with active shares" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = profiles.id 
    AND portfolio_shares.active = true
  )
);

-- Allow anyone to view sections that belong to users with active shared portfolios
CREATE POLICY "Public can view sections with active shares" 
ON public.sections 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = sections.user_id 
    AND portfolio_shares.active = true
  )
);

-- Allow anyone to view projects in sections that belong to users with active shared portfolios
CREATE POLICY "Public can view projects with active shares" 
ON public.projects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.sections
    JOIN public.portfolio_shares ON portfolio_shares.user_id = sections.user_id
    WHERE sections.id = projects.section_id 
    AND portfolio_shares.active = true
  )
);

-- Allow anyone to view features of projects that belong to users with active shared portfolios
CREATE POLICY "Public can view features with active shares" 
ON public.features 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects
    JOIN public.sections ON sections.id = projects.section_id
    JOIN public.portfolio_shares ON portfolio_shares.user_id = sections.user_id
    WHERE projects.id = features.project_id 
    AND portfolio_shares.active = true
  )
);

-- Allow anyone to view links of projects that belong to users with active shared portfolios
CREATE POLICY "Public can view links with active shares" 
ON public.links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects
    JOIN public.sections ON sections.id = projects.section_id
    JOIN public.portfolio_shares ON portfolio_shares.user_id = sections.user_id
    WHERE projects.id = links.project_id 
    AND portfolio_shares.active = true
  )
);