-- Create test table
CREATE TABLE public.test (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_message TEXT NOT NULL,
  test_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test records"
  ON public.test
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
  ON public.test
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
  ON public.test
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
  ON public.test
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_test_updated_at
  BEFORE UPDATE ON public.test
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();