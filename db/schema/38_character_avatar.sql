-- ==============================================================================
-- 38. CHARACTER AVATAR — Thêm cột avatar_url, avatar_asset_path và siết policy bucket avatars
-- ==============================================================================
-- WT-4: wt/character-assets
-- 1. Bổ sung avatar_url và avatar_asset_path vào public.case_characters
-- 2. Đảm bảo bucket 'avatars' tồn tại, công khai đọc (public read)
-- 3. Siết quyền ghi/xóa: chỉ private.is_admin() (xóa bỏ public upload/update/delete cũ từ migration 13)
-- ==============================================================================

-- 1. Bổ sung cột avatar vào case_characters
ALTER TABLE public.case_characters
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_asset_path TEXT;

-- 2. Đảm bảo bucket 'avatars' tồn tại và public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Gỡ bỏ tất cả policy cũ trên storage.objects liên quan đến bucket 'avatars'
DROP POLICY IF EXISTS "Public Read Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin write avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access for avatars" ON storage.objects;

-- 4. Tạo policy mới: Public Read
CREATE POLICY "Public Read Access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 5. Tạo policy mới: Admin Insert / Update / Delete (private.is_admin())
CREATE POLICY "Admin Upload Access for avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (SELECT private.is_admin())
);

CREATE POLICY "Admin Update Access for avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (SELECT private.is_admin())
);

CREATE POLICY "Admin Delete Access for avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (SELECT private.is_admin())
);
