-- Create test4 table
CREATE TABLE public.test4 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_message TEXT NOT NULL,
  test_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test4 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test records"
  ON public.test4
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
  ON public.test4
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
  ON public.test4
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
  ON public.test4
  FOR DELETE
  USING (auth.uid() = user_id);