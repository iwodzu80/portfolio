-- Clean up duplicate portfolio_shares records, keeping only the most recent one per user
DELETE FROM portfolio_shares
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM portfolio_shares
  ORDER BY user_id, updated_at DESC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE portfolio_shares ADD CONSTRAINT portfolio_shares_user_id_unique UNIQUE (user_id);