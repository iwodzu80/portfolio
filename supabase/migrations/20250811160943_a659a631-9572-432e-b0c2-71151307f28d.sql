-- 20250811120000_add_section_description.sql
-- Add optional description column to sections
ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS description text;