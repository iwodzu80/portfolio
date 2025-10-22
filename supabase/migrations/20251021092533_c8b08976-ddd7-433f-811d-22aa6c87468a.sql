-- Add a flag to track if default content has been created for a user
-- This prevents duplicate "My Projects" sections from being created

-- First, let's clean up existing duplicates for the affected user
-- Keep only the oldest "My Projects" section for each user
WITH duplicates AS (
  SELECT 
    id,
    user_id,
    title,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id, title ORDER BY created_at ASC) as rn
  FROM sections
  WHERE title = 'My Projects'
)
DELETE FROM sections
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add a column to profiles to track if default content has been initialized
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_content_created boolean DEFAULT false;

-- Mark existing users as having default content created (based on having sections)
UPDATE profiles
SET default_content_created = true
WHERE user_id IN (
  SELECT DISTINCT user_id FROM sections
);