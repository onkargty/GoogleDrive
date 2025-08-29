/*
  # Fix Files Table Schema

  1. Changes
    - Add missing starred column to files table
    - Update files table structure to match application expectations
    - Ensure proper indexes exist
    - Fix RLS policies

  2. Security
    - Maintain RLS on files table
    - Update policies for proper access control
*/

-- Add missing starred column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'starred'
  ) THEN
    ALTER TABLE files ADD COLUMN starred boolean DEFAULT false;
  END IF;
END $$;

-- Update RLS policies to be more permissive for file access
DROP POLICY IF EXISTS "Users can view files shared with them" ON files;

CREATE POLICY "Users can view files shared with them"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT file_id FROM shared_files 
      WHERE shared_with_user_id = auth.uid()
    )
  );

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_files_starred ON files(starred);
CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);