-- Add privacy controls for email and phone visibility on shared portfolios
ALTER TABLE public.profiles
ADD COLUMN show_email boolean DEFAULT true,
ADD COLUMN show_phone boolean DEFAULT true;