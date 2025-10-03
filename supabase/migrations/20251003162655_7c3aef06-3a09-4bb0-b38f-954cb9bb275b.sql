-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  tagline TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create sections table
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create project_links table
CREATE TABLE public.project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create project_features table
CREATE TABLE public.project_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create portfolio_shares table
CREATE TABLE public.portfolio_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  share_id TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create portfolio_analytics table
CREATE TABLE public.portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT NOT NULL,
  user_id UUID,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to validate URLs
CREATE OR REPLACE FUNCTION public.validate_links_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.url IS NULL OR btrim(NEW.url) = '' THEN
    RAISE EXCEPTION 'Link URL cannot be empty';
  END IF;

  IF NOT (NEW.url ~* '^(https?://|mailto:|tel:)') THEN
    RAISE EXCEPTION 'Invalid URL protocol. Only http, https, mailto, and tel are allowed';
  END IF;

  RETURN NEW;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view profiles with active shares" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = profiles.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles" 
ON public.user_roles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roles" 
ON public.user_roles FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for sections
CREATE POLICY "Users can view their own sections" 
ON public.sections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections" 
ON public.sections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections" 
ON public.sections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections" 
ON public.sections FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view sections with active shares" 
ON public.sections FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = sections.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view projects with active shares" 
ON public.projects FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.portfolio_shares 
    WHERE portfolio_shares.user_id = projects.user_id 
    AND portfolio_shares.is_active = true
  )
);

-- RLS Policies for project_links
CREATE POLICY "Users can view their own project links" 
ON public.project_links FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project links" 
ON public.project_links FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project links" 
ON public.project_links FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project links" 
ON public.project_links FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view project links with active shares" 
ON public.project_links FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects 
    JOIN public.portfolio_shares ON portfolio_shares.user_id = projects.user_id
    WHERE projects.id = project_links.project_id 
    AND portfolio_shares.is_active = true
  )
);

-- RLS Policies for project_features
CREATE POLICY "Users can view their own project features" 
ON public.project_features FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project features" 
ON public.project_features FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project features" 
ON public.project_features FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project features" 
ON public.project_features FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view project features with active shares" 
ON public.project_features FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.projects 
    JOIN public.portfolio_shares ON portfolio_shares.user_id = projects.user_id
    WHERE projects.id = project_features.project_id 
    AND portfolio_shares.is_active = true
  )
);

-- RLS Policies for portfolio_shares
CREATE POLICY "Users can view their own shares" 
ON public.portfolio_shares FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shares" 
ON public.portfolio_shares FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares" 
ON public.portfolio_shares FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" 
ON public.portfolio_shares FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active shares for verification" 
ON public.portfolio_shares FOR SELECT 
USING (is_active = true);

-- RLS Policies for portfolio_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.portfolio_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous analytics inserts" 
ON public.portfolio_analytics FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_project_links_updated_at
BEFORE UPDATE ON public.project_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_project_features_updated_at
BEFORE UPDATE ON public.project_features
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_portfolio_shares_updated_at
BEFORE UPDATE ON public.portfolio_shares
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for URL validation on project_links
CREATE TRIGGER trg_validate_project_links_url
BEFORE INSERT OR UPDATE ON public.project_links
FOR EACH ROW
EXECUTE FUNCTION public.validate_links_url();