-- Create the foundational database schema for the portfolio manager

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  tagline TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sections table for organizing portfolio content
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table for portfolio projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_links table for project URLs
CREATE TABLE public.project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_features table for project features/technologies
CREATE TABLE public.project_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio_shares table for shareable portfolio links
CREATE TABLE public.portfolio_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio_analytics table for tracking portfolio views
CREATE TABLE public.portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create links table (referenced by existing migrations)
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sections
CREATE POLICY "Users can view their own sections" ON public.sections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sections" ON public.sections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sections" ON public.sections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sections" ON public.sections
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for project_links
CREATE POLICY "Users can view their own project links" ON public.project_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own project links" ON public.project_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own project links" ON public.project_links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project links" ON public.project_links
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for project_features
CREATE POLICY "Users can view their own project features" ON public.project_features
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own project features" ON public.project_features
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own project features" ON public.project_features
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project features" ON public.project_features
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_shares
CREATE POLICY "Users can view their own portfolio shares" ON public.portfolio_shares
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolio shares" ON public.portfolio_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio shares" ON public.portfolio_shares
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio shares" ON public.portfolio_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_analytics (allow anonymous reads for shared portfolios)
CREATE POLICY "Allow anonymous inserts for portfolio analytics" ON public.portfolio_analytics
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view analytics for their shared portfolios" ON public.portfolio_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.share_id = portfolio_analytics.share_id 
      AND ps.user_id = auth.uid()
    )
  );

-- Create RLS policies for links
CREATE POLICY "Users can view their own links" ON public.links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own links" ON public.links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON public.links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON public.links
  FOR DELETE USING (auth.uid() = user_id);

-- Create public policies for shared portfolio viewing
CREATE POLICY "Allow public viewing of shared profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.user_id = profiles.user_id 
      AND ps.is_active = true
    )
  );

CREATE POLICY "Allow public viewing of shared sections" ON public.sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.user_id = sections.user_id 
      AND ps.is_active = true
    )
  );

CREATE POLICY "Allow public viewing of shared projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.user_id = projects.user_id 
      AND ps.is_active = true
    )
  );

CREATE POLICY "Allow public viewing of shared project links" ON public.project_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.user_id = project_links.user_id 
      AND ps.is_active = true
    )
  );

CREATE POLICY "Allow public viewing of shared project features" ON public.project_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_shares ps 
      WHERE ps.user_id = project_features.user_id 
      AND ps.is_active = true
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_links_updated_at
  BEFORE UPDATE ON public.project_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_features_updated_at
  BEFORE UPDATE ON public.project_features
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_portfolio_shares_updated_at
  BEFORE UPDATE ON public.portfolio_shares
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();