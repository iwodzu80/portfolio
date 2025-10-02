-- Create test3 table
CREATE TABLE public.test3 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_message text NOT NULL,
  test_number integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test3 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test records"
ON public.test3
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
ON public.test3
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
ON public.test3
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
ON public.test3
FOR DELETE
USING (auth.uid() = user_id);