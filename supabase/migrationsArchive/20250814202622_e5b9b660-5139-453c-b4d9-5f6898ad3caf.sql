-- Add unique constraint to share_id to prevent duplicates across all users
ALTER TABLE portfolio_shares ADD CONSTRAINT portfolio_shares_share_id_unique UNIQUE (share_id);