-- Create a simple test table
CREATE TABLE public.test_simple (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_simple ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test records"
ON public.test_simple
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
ON public.test_simple
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
ON public.test_simple
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
ON public.test_simple
FOR DELETE
USING (auth.uid() = user_id);