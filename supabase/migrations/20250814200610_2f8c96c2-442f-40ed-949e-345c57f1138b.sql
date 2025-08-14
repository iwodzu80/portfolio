-- Clean up duplicate portfolio_shares records, keeping only the most recent one per user
-- First, let's see what columns exist in portfolio_shares
-- The table has: user_id, share_id, updated_at, created_at, active

DELETE FROM portfolio_shares
WHERE (user_id, updated_at) NOT IN (
  SELECT user_id, MAX(updated_at)
  FROM portfolio_shares
  GROUP BY user_id
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE portfolio_shares ADD CONSTRAINT portfolio_shares_user_id_unique UNIQUE (user_id);