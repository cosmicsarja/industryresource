-- =============================================================================
-- VENDOR PHOTOS STORAGE BUCKET + RLS POLICIES
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cmrhvsiqlzntxwftfryj/sql/new
-- =============================================================================

-- 1. Create the public vendor-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-photos',
  'vendor-photos',
  true,                                  -- public: anyone can read via URL
  5242880,                               -- 5 MB per file
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies on storage.objects for vendor-photos
DO $$
BEGIN
  -- Public read: anyone can view vendor photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'vendor-photos: public read'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "vendor-photos: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'vendor-photos');
  END IF;

  -- Authenticated vendors can upload to their own folder ({vendor_id}/...)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'vendor-photos: vendor upload'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "vendor-photos: vendor upload"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'vendor-photos'
        AND auth.role() = 'authenticated'
        -- Path must start with the vendor's own vendor_id
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.vendors WHERE user_id = auth.uid()
        )
      );
  END IF;

  -- Vendors can update (overwrite) only their own objects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'vendor-photos: vendor update'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "vendor-photos: vendor update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'vendor-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.vendors WHERE user_id = auth.uid()
        )
      );
  END IF;

  -- Vendors can delete only their own objects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'vendor-photos: vendor delete'
      AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "vendor-photos: vendor delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'vendor-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM public.vendors WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3. Verify
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'vendor-photos';
