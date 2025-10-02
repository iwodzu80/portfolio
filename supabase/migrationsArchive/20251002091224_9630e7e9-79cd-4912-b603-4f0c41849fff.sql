-- Create test_test_table
CREATE TABLE public.test_test_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_message TEXT NOT NULL,
  test_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_test_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own test records"
  ON public.test_test_table
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records"
  ON public.test_test_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records"
  ON public.test_test_table
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records"
  ON public.test_test_table
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_test_test_table_updated_at
  BEFORE UPDATE ON public.test_test_table
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();