-- First, let's check if there are foreign key constraints
-- We need to handle the portfolio_analytics references before deleting duplicates

-- Create a temporary table to store the share_ids we want to keep
CREATE TEMP TABLE shares_to_keep AS
SELECT DISTINCT ON (user_id) share_id, user_id
FROM portfolio_shares
ORDER BY user_id, updated_at DESC;

-- Update portfolio_analytics to point to the share_ids we're keeping
UPDATE portfolio_analytics 
SET share_id = (
  SELECT stk.share_id 
  FROM shares_to_keep stk
  JOIN portfolio_shares ps ON ps.share_id = portfolio_analytics.share_id
  WHERE ps.user_id = stk.user_id
  LIMIT 1
)
WHERE share_id NOT IN (SELECT share_id FROM shares_to_keep);

-- Now delete the duplicate portfolio_shares records
DELETE FROM portfolio_shares
WHERE share_id NOT IN (SELECT share_id FROM shares_to_keep);

-- Add unique constraint to prevent future duplicates
ALTER TABLE portfolio_shares ADD CONSTRAINT portfolio_shares_user_id_unique UNIQUE (user_id);