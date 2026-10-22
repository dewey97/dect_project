-- ==============================================================================
-- 25. CHUYỂN is_admin() SANG SCHEMA PRIVATE
-- ==============================================================================
-- Mục đích: PostgREST tự expose mọi hàm trong schema `public` qua REST/RPC.
-- Hàm `is_admin()` không nên gọi được từ client qua RPC vì nó dùng
-- SECURITY DEFINER (chạy với quyền owner, bỏ qua RLS trên profiles).
--
-- Giải pháp: tạo schema `private` (không nằm trong `search_path` của
-- PostgREST), chuyển hàm vào đó. RLS policies gọi `private.is_admin()`
-- vẫn hoạt động bình thường vì policy chạy trong context DB, không qua REST.
--
-- Sau migration: Supabase security advisor không còn cảnh báo `is_admin()`
-- gọi được qua RPC.
-- ==============================================================================

BEGIN;

-- 1. Tạo schema private (PostgREST không expose)
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Tạo hàm mới trong schema private
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO anon, authenticated;

-- 3. Cập nhật tất cả policy đang gọi public.is_admin() → private.is_admin()
--    Phải DROP + CREATE lại vì ALTER POLICY không đổi được USING/WITH CHECK.

-- 3a. PROFILES (migration 21, mục 2)
DROP POLICY IF EXISTS "Profiles readable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles readable by owner or admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR private.is_admin());

DROP POLICY IF EXISTS "Users insert own player profile" ON public.profiles;
CREATE POLICY "Users insert own player profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND (role = 'player' OR private.is_admin()));

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR private.is_admin())
  WITH CHECK (id = auth.uid() OR private.is_admin());

-- 3b. CASES (migration 21, mục 3)
DROP POLICY IF EXISTS "Admin write cases" ON public.cases;
CREATE POLICY "Admin write cases" ON public.cases
  FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3c. DOSSIER_DOCUMENTS (migration 21, mục 4)
DROP POLICY IF EXISTS "Admin write dossier_documents" ON public.dossier_documents;
CREATE POLICY "Admin write dossier_documents" ON public.dossier_documents
  FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3d. CASE_DOSSIERS (migration 21, mục 5)
DROP POLICY IF EXISTS "Admin write case_dossiers" ON public.case_dossiers;
CREATE POLICY "Admin write case_dossiers" ON public.case_dossiers
  FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3e. APP_SETTINGS (migration 21, mục 6)
DROP POLICY IF EXISTS "Admin insert settings" ON public.app_settings;
CREATE POLICY "Admin insert settings" ON public.app_settings
  FOR INSERT WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admin update settings" ON public.app_settings;
CREATE POLICY "Admin update settings" ON public.app_settings
  FOR UPDATE USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3f. FEEDBACKS (migration 21, mục 7)
DROP POLICY IF EXISTS "Admin read feedbacks" ON public.feedbacks;
CREATE POLICY "Admin read feedbacks" ON public.feedbacks
  FOR SELECT USING (private.is_admin());

DROP POLICY IF EXISTS "Admin update feedbacks" ON public.feedbacks;
CREATE POLICY "Admin update feedbacks" ON public.feedbacks
  FOR UPDATE USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3g. PLAY_SESSIONS (migration 21, mục 8)
DROP POLICY IF EXISTS "Players manage own sessions" ON public.play_sessions;
CREATE POLICY "Players manage own sessions" ON public.play_sessions
  FOR ALL USING (player_id = auth.uid() OR private.is_admin())
  WITH CHECK (player_id = auth.uid() OR private.is_admin());

-- 3h. STORAGE avatars (migration 21, mục 9)
DROP POLICY IF EXISTS "Admin write avatars" ON storage.objects;
CREATE POLICY "Admin write avatars" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND private.is_admin())
  WITH CHECK (bucket_id = 'avatars' AND private.is_admin());

-- 3i. CASE_CHARACTERS (migration 23)
DROP POLICY IF EXISTS "Admin write case_characters" ON public.case_characters;
CREATE POLICY "Admin write case_characters" ON public.case_characters
  FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 4. Xóa hàm cũ trong schema public
DROP FUNCTION IF EXISTS public.is_admin();

-- ==============================================================================
-- 5. SMOKE TEST — chạy thử policy với các role khác nhau
-- ==============================================================================
-- Dùng savepoint để rollback test mà không hủy migration.

SAVEPOINT smoke_test;

-- 5a. Anon: không đọc được profiles (không có uid)
SET LOCAL ROLE anon;
DO $$
BEGIN
  -- private.is_admin() phải trả false cho anon
  IF private.is_admin() THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: anon is_admin() returned true';
  END IF;
END $$;

-- 5b. Authenticated (player): không phải admin
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  IF private.is_admin() THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: authenticated is_admin() returned true without admin JWT';
  END IF;
END $$;

-- 5c. Kiểm tra hàm tồn tại trong schema private
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'private' AND p.proname = 'is_admin'
  ) THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: private.is_admin() not found';
  END IF;
END $$;

-- 5d. Kiểm tra hàm KHÔNG còn trong schema public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: public.is_admin() still exists';
  END IF;
END $$;

RELEASE SAVEPOINT smoke_test;

RESET ROLE;

COMMIT;
