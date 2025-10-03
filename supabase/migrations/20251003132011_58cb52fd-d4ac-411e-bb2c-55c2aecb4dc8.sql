-- Create test_table_next
CREATE TABLE public.test_table_next (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_message TEXT NOT NULL,
  test_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_table_next ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own test records"
  ON public.test_table_next
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
  ON public.test_table_next
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
  ON public.test_table_next
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
  ON public.test_table_next
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_test_table_next_updated_at
  BEFORE UPDATE ON public.test_table_next
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();