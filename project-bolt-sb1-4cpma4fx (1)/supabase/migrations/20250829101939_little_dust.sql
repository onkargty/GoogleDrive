/*
  # Fix Storage Bucket Policies

  1. Storage Policies
    - Enable authenticated users to upload files to their own folder
    - Enable authenticated users to download their own files
    - Enable authenticated users to delete their own files
    - Enable authenticated users to list their own files

  2. Security
    - Users can only access files in their own user folder (user_id prefix)
    - All operations require authentication
*/

-- Create storage policies for the files bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = auth.uid()::text);