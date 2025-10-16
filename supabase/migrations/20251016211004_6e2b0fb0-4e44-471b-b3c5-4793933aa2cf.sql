-- Update get_user_from_share function to respect profile privacy settings
-- This ensures that portfolios marked as private cannot be accessed via share links

DROP FUNCTION IF EXISTS public.get_user_from_share(text);

CREATE OR REPLACE FUNCTION public.get_user_from_share(share_id_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result_user_id UUID;
BEGIN
  -- Validate share_id format (alphanumeric and hyphens only)
  IF share_id_param IS NULL OR share_id_param !~ '^[a-zA-Z0-9\-]+$' THEN
    RAISE EXCEPTION 'Invalid share_id format';
  END IF;
  
  -- Get user_id for active share AND public profile
  SELECT ps.user_id INTO result_user_id
  FROM public.portfolio_shares ps
  JOIN public.profiles p ON p.user_id = ps.user_id
  WHERE ps.share_id = share_id_param 
    AND ps.is_active = true
    AND p.is_public = true;
  
  RETURN result_user_id;
END;
$function$;