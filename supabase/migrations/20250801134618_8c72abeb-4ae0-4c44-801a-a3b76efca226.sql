-- Add missing columns to existing tables

-- Add project_role column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_role TEXT;

-- Add referrer column to portfolio_analytics table
ALTER TABLE public.portfolio_analytics ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles" 
ON public.user_roles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roles" 
ON public.user_roles FOR DELETE 
USING (auth.uid() = user_id);

-- Update the record_portfolio_view function to include referrer parameter
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

-- Create trigger for user_roles updated_at
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();