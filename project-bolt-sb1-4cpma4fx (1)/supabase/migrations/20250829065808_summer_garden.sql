/*
  # Fix Infinite Recursion in Files Table Policies

  1. Security Changes
    - Drop all existing policies on files table that are causing recursion
    - Create simple, direct policies without circular references
    - Ensure policies use direct user ID comparison without subqueries

  2. Policy Structure
    - Simple ownership-based access control
    - No recursive joins or complex subqueries
    - Direct comparison with auth.uid()
*/

-- Drop all existing policies on files table
DROP POLICY IF EXISTS "Users can manage their own files" ON files;
DROP POLICY IF EXISTS "Users can insert their own files" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;
DROP POLICY IF EXISTS "File owners can manage shares" ON files;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);