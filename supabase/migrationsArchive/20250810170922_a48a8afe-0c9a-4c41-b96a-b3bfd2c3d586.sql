-- 20250810_validate_links_url.sql
-- Add trigger-based validation for links.url to allow only safe protocols

-- Create or replace validation function
CREATE OR REPLACE FUNCTION public.validate_links_url()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Disallow empty or whitespace-only URLs
  IF NEW.url IS NULL OR btrim(NEW.url) = '' THEN
    RAISE EXCEPTION 'Link URL cannot be empty';
  END IF;

  -- Only allow http, https, mailto, and tel protocols (case-insensitive)
  IF NOT (NEW.url ~* '^(https?://|mailto:|tel:)') THEN
    RAISE EXCEPTION 'Invalid URL protocol. Only http, https, mailto, and tel are allowed';
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger is present on links table
DROP TRIGGER IF EXISTS trg_validate_links_url ON public.links;
CREATE TRIGGER trg_validate_links_url
BEFORE INSERT OR UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.validate_links_url();