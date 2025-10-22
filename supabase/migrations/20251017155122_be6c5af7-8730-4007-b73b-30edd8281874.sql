-- Add visibility toggle fields for Tech Used and Key Learnings sections in projects
ALTER TABLE public.projects
ADD COLUMN show_tech_used BOOLEAN DEFAULT true,
ADD COLUMN show_key_learnings BOOLEAN DEFAULT true;