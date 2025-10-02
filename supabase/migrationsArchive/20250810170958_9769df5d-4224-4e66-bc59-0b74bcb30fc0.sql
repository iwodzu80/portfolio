-- 20250810_fix_search_path_validate_links_url.sql
-- Set a stable search_path for validation function per linter
CREATE OR REPLACE FUNCTION public.validate_links_url()
RETURNS trigger
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