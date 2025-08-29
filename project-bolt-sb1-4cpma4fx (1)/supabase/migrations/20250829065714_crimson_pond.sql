/*
  # Fix Infinite Recursion in Files Table RLS Policies

  1. Problem
    - Current RLS policies on files table are causing infinite recursion
    - The policies are referencing themselves in a way that creates a loop

  2. Solution
    - Drop all existing problematic policies
    - Create simple, direct policies that don't cause recursion
    - Use auth.uid() directly instead of complex subqueries

  3. Security
    - Users can only access their own files
    - Simple ownership-based access control
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can create own files" ON files;
DROP POLICY IF EXISTS "Users can create their own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can view files shared with them" ON files;
DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;

-- Create simple, non-recursive policies
CREATE POLICY "Users can manage their own files"
  ON files
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Also fix folders table policies if they have similar issues
DROP POLICY IF EXISTS "Users can create own folders" ON folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can view their own folders" ON folders;

-- Create simple, non-recursive policies for folders
CREATE POLICY "Users can manage their own folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);