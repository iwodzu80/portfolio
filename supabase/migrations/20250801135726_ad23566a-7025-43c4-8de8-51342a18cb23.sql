-- Re-run the migration to ensure database is up to date
-- Add project_role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_role') THEN
        ALTER TABLE projects ADD COLUMN project_role TEXT;
    END IF;
END $$;

-- Add referrer column if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolio_analytics' AND column_name = 'referrer') THEN
        ALTER TABLE portfolio_analytics ADD COLUMN referrer TEXT;
    END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_roles if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles' AND rowsecurity = true) THEN
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for user_roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
        CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can insert their own roles') THEN
        CREATE POLICY "Users can insert their own roles" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can update their own roles') THEN
        CREATE POLICY "Users can update their own roles" ON user_roles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can delete their own roles') THEN
        CREATE POLICY "Users can delete their own roles" ON user_roles FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Update the record_portfolio_view function to handle referrer parameter
CREATE OR REPLACE FUNCTION public.record_portfolio_view(
    p_share_id text, 
    p_referrer text DEFAULT NULL::text, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.portfolio_analytics (share_id, referrer, user_agent)
    VALUES (p_share_id, p_referrer, p_user_agent);
END;
$function$;