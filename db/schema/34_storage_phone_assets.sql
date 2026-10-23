-- ========================================================
-- 34. STORAGE BUCKET: PHONE ASSETS
-- ========================================================
-- Stores wallpapers, app icons, photos, avatars, and audio clips for phone evidence.
-- Folders structure:
--   cases/<case_slug>/wallpapers/
--   cases/<case_slug>/photos/
--   cases/<case_slug>/icons/
--   cases/<case_slug>/avatars/
--   cases/<case_slug>/audio/

-- 1. Create public bucket 'phone-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('phone-assets', 'phone-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public Read Access
DROP POLICY IF EXISTS "Public Read Access for phone-assets" ON storage.objects;
CREATE POLICY "Public Read Access for phone-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'phone-assets');

-- 3. Admin Upload/Insert Access
DROP POLICY IF EXISTS "Admin Upload Access for phone-assets" ON storage.objects;
CREATE POLICY "Admin Upload Access for phone-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'phone-assets' AND
  (SELECT private.is_admin())
);

-- 4. Admin Update Access
DROP POLICY IF EXISTS "Admin Update Access for phone-assets" ON storage.objects;
CREATE POLICY "Admin Update Access for phone-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'phone-assets' AND
  (SELECT private.is_admin())
);

-- 5. Admin Delete Access
DROP POLICY IF EXISTS "Admin Delete Access for phone-assets" ON storage.objects;
CREATE POLICY "Admin Delete Access for phone-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'phone-assets' AND
  (SELECT private.is_admin())
);
