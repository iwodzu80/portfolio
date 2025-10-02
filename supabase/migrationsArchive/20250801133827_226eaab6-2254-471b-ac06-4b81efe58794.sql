-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    photo TEXT,
    telephone TEXT,
    role TEXT,
    tagline TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS public.links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_shares table
CREATE TABLE IF NOT EXISTS public.portfolio_shares (
    share_id TEXT NOT NULL PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_analytics table
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    share_id TEXT REFERENCES public.portfolio_shares(share_id) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for sections
CREATE POLICY "Users can view their own sections" ON public.sections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sections" ON public.sections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections" ON public.sections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections" ON public.sections
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sections 
            WHERE sections.id = projects.section_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects in their sections" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sections 
            WHERE sections.id = projects.section_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.sections 
            WHERE sections.id = projects.section_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.sections 
            WHERE sections.id = projects.section_id 
            AND sections.user_id = auth.uid()
        )
    );

-- Create RLS policies for links
CREATE POLICY "Users can view links of their projects" ON public.links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = links.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create links for their projects" ON public.links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = links.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update links of their projects" ON public.links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = links.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete links of their projects" ON public.links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = links.project_id 
            AND sections.user_id = auth.uid()
        )
    );

-- Create RLS policies for features
CREATE POLICY "Users can view features of their projects" ON public.features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = features.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create features for their projects" ON public.features
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = features.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update features of their projects" ON public.features
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = features.project_id 
            AND sections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete features of their projects" ON public.features
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            JOIN public.sections ON sections.id = projects.section_id
            WHERE projects.id = features.project_id 
            AND sections.user_id = auth.uid()
        )
    );

-- Create RLS policies for portfolio_shares
CREATE POLICY "Users can view their own shares" ON public.portfolio_shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shares" ON public.portfolio_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares" ON public.portfolio_shares
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON public.portfolio_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_analytics (allow viewing by share owner)
CREATE POLICY "Users can view analytics for their shares" ON public.portfolio_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_shares 
            WHERE portfolio_shares.share_id = portfolio_analytics.share_id 
            AND portfolio_shares.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert analytics" ON public.portfolio_analytics
    FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_features_updated_at
    BEFORE UPDATE ON public.features
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_shares_updated_at
    BEFORE UPDATE ON public.portfolio_shares
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to record portfolio views
CREATE OR REPLACE FUNCTION public.record_portfolio_view(
    p_share_id TEXT,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.portfolio_analytics (share_id, user_agent)
    VALUES (p_share_id, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;