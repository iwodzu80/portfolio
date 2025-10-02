-- Fix database function security by adding proper search paths and validation

-- Update the record_portfolio_view function with proper security
DROP FUNCTION IF EXISTS public.record_portfolio_view(text, text, text);
DROP FUNCTION IF EXISTS public.record_portfolio_view(text, text);

CREATE OR REPLACE FUNCTION public.record_portfolio_view(
  p_share_id TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Input validation
  IF p_share_id IS NULL OR length(trim(p_share_id)) = 0 THEN
    RAISE EXCEPTION 'share_id cannot be null or empty';
  END IF;
  
  -- Validate share_id format (alphanumeric and hyphens only)
  IF NOT p_share_id ~ '^[a-zA-Z0-9\-]+$' THEN
    RAISE EXCEPTION 'Invalid share_id format';
  END IF;
  
  -- Limit user_agent length to prevent abuse
  IF p_user_agent IS NOT NULL AND length(p_user_agent) > 500 THEN
    p_user_agent := left(p_user_agent, 500);
  END IF;
  
  -- Limit referrer length to prevent abuse
  IF p_referrer IS NOT NULL AND length(p_referrer) > 500 THEN
    p_referrer := left(p_referrer, 500);
  END IF;
  
  -- Only record if the share_id exists and is active
  IF EXISTS (
    SELECT 1 FROM public.portfolio_shares 
    WHERE share_id = p_share_id AND active = true
  ) THEN
    INSERT INTO public.portfolio_analytics (share_id, referrer, user_agent)
    VALUES (p_share_id, p_referrer, p_user_agent);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Grant execute permissions to anonymous users
GRANT EXECUTE ON FUNCTION public.record_portfolio_view(TEXT, TEXT, TEXT) TO anon;

-- Update the validation trigger function with proper security
CREATE OR REPLACE FUNCTION public.validate_links_url()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

-- Update the timestamp trigger function with proper security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;