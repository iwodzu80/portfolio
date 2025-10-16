-- Add key_learnings column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS key_learnings text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN projects.key_learnings IS 'Array of key learnings from the project';