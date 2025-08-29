/*
  # Fix RLS Policies and Remove Infinite Recursion

  1. Policy Fixes
    - Drop all existing problematic policies on files table
    - Create new, simple policies without recursion
    - Ensure policies don't reference themselves or create circular dependencies

  2. Storage
    - Storage bucket should be created via Supabase dashboard, not client-side
    - Remove client-side bucket creation logic
*/

-- Drop all existing policies on files table to remove recursion
DROP POLICY IF EXISTS "Users can create own files" ON files;
DROP POLICY IF EXISTS "Users can create their own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can view files shared with them" ON files;
DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;

-- Create simple, non-recursive policies for files
CREATE POLICY "Users can view their own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Drop duplicate policies on folders table
DROP POLICY IF EXISTS "Users can create own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can view own folders" ON folders;

-- Keep only the authenticated policies for folders (they're already correct)
-- No changes needed for folders as the existing authenticated policies are fine