-- ========================================================
-- 13. STORAGE BUCKET: AVATARS & COVERS
-- ========================================================

-- Insert storage bucket 'avatars' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to all files in 'avatars' bucket
CREATE POLICY "Public Read Access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Allow authenticated / anon insert to 'avatars' bucket
CREATE POLICY "Public Upload Access for avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Policy: Allow update & delete for avatars
CREATE POLICY "Public Update Access for avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

CREATE POLICY "Public Delete Access for avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');
