-- Add policy to allow public read access to portfolio_shares for share verification
CREATE POLICY "Public can view active shares for verification" 
ON public.portfolio_shares 
FOR SELECT 
USING (active = true);