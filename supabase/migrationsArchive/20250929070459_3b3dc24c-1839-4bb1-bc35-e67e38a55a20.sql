-- Fix search path for validation function (from existing migration)
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

-- Create trigger for project_links table (updating from existing migration)
DROP TRIGGER IF EXISTS trg_validate_project_links_url ON public.project_links;
CREATE TRIGGER trg_validate_project_links_url
BEFORE INSERT OR UPDATE ON public.project_links
FOR EACH ROW
EXECUTE FUNCTION public.validate_links_url();

-- Create trigger for links table
DROP TRIGGER IF EXISTS trg_validate_links_url ON public.links;
CREATE TRIGGER trg_validate_links_url
BEFORE INSERT OR UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.validate_links_url();

-- Fix search path for updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;