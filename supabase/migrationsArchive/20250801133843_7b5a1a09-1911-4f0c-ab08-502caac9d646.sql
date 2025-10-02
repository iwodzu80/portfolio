-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  photo TEXT,
  telephone TEXT,
  role TEXT,
  tagline TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sections table
CREATE TABLE public.sections (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create links table
CREATE TABLE public.links (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create features table
CREATE TABLE public.features (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_shares table
CREATE TABLE public.portfolio_shares (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_analytics table
CREATE TABLE public.portfolio_analytics (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT NOT NULL REFERENCES public.portfolio_shares(share_id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- RLS Policies for sections
CREATE POLICY "Users can view their own sections" 
ON public.sections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections" 
ON public.sections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections" 
ON public.sections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections" 
ON public.sections FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.sections WHERE id = section_id));

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.sections WHERE id = section_id));

CREATE POLICY "Users can insert their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.sections WHERE id = section_id));

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() IN (SELECT user_id FROM public.sections WHERE id = section_id));

-- RLS Policies for links
CREATE POLICY "Users can view their own project links" 
ON public.links FOR SELECT 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can update their own project links" 
ON public.links FOR UPDATE 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can insert their own project links" 
ON public.links FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can delete their own project links" 
ON public.links FOR DELETE 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

-- RLS Policies for features
CREATE POLICY "Users can view their own project features" 
ON public.features FOR SELECT 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can update their own project features" 
ON public.features FOR UPDATE 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can insert their own project features" 
ON public.features FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

CREATE POLICY "Users can delete their own project features" 
ON public.features FOR DELETE 
USING (auth.uid() IN (
  SELECT s.user_id FROM public.sections s 
  JOIN public.projects p ON s.id = p.section_id 
  WHERE p.id = project_id
));

-- RLS Policies for portfolio_shares
CREATE POLICY "Users can view their own portfolio shares" 
ON public.portfolio_shares FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio shares" 
ON public.portfolio_shares FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio shares" 
ON public.portfolio_shares FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio shares" 
ON public.portfolio_shares FOR DELETE 
USING (auth.uid() = user_id);

-- Public access to shared portfolios and analytics
CREATE POLICY "Anyone can view active shared portfolios" 
ON public.portfolio_shares FOR SELECT 
USING (active = true);

CREATE POLICY "Anyone can view portfolio analytics" 
ON public.portfolio_analytics FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert portfolio analytics" 
ON public.portfolio_analytics FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at 
    BEFORE UPDATE ON public.sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_shares_updated_at 
    BEFORE UPDATE ON public.portfolio_shares 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for recording portfolio views
CREATE OR REPLACE FUNCTION record_portfolio_view(
  p_share_id TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.portfolio_analytics (share_id, referrer, user_agent)
  VALUES (p_share_id, p_referrer, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anonymous users
GRANT EXECUTE ON FUNCTION record_portfolio_view(TEXT, TEXT, TEXT) TO anon;