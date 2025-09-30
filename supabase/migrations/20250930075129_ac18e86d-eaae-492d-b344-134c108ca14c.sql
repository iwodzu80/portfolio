-- Create a simple test table for Supabase integration verification
CREATE TABLE public.test_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_message TEXT NOT NULL,
  test_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own test records" 
ON public.test_table 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test records" 
ON public.test_table 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test records" 
ON public.test_table 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test records" 
ON public.test_table 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_test_table_updated_at
BEFORE UPDATE ON public.test_table
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();