
-- ============ STORAGE BUCKETS ============
-- Run this in Supabase SQL Editor (with service_role or as superuser)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('machine-photos', 'machine-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('material-photos', 'material-photos', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies for machine-photos bucket
DO $$
BEGIN
  -- machine-photos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'machine-photos: public read' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "machine-photos: public read" ON storage.objects FOR SELECT USING (bucket_id = 'machine-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'machine-photos: authenticated upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "machine-photos: authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'machine-photos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'machine-photos: authenticated update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "machine-photos: authenticated update" ON storage.objects FOR UPDATE USING (bucket_id = 'machine-photos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'machine-photos: authenticated delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "machine-photos: authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'machine-photos' AND auth.role() = 'authenticated');
  END IF;

  -- material-photos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'material-photos: public read' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "material-photos: public read" ON storage.objects FOR SELECT USING (bucket_id = 'material-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'material-photos: authenticated upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "material-photos: authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'material-photos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'material-photos: authenticated update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "material-photos: authenticated update" ON storage.objects FOR UPDATE USING (bucket_id = 'material-photos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'material-photos: authenticated delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "material-photos: authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'material-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;
