-- ==============================================================================
-- 21. SECURITY HARDENING — RLS chỉ cho admin ghi, khóa leo thang quyền qua profiles
-- ==============================================================================
-- Trước migration này:
--   * profiles: "Allow All Actions for Profiles" (ALL USING true) ⇒ kể cả anon
--     cũng UPDATE được role='admin' cho bất kỳ user nào.
--   * cases, dossier_documents, case_dossiers, app_settings, feedbacks,
--     play_sessions: ghi tự do cho mọi người.
--   * storage bucket avatars: anon upload/update/delete.
-- Sau migration:
--   * public.is_admin() là nguồn sự thật duy nhất cho quyền admin trong RLS.
--   * Người dùng chỉ đọc/sửa profile của chính mình, không đổi được cột role.
--   * Nội dung vụ án: đọc công khai, ghi chỉ admin.
--   * feedbacks: ai cũng gửi được, chỉ admin đọc/cập nhật.
-- Không đổi: game_rooms (chơi nhóm cần ghi công khai), case_checkpoints
-- (đọc công khai cho tới khi chuyển chấm điểm lên server).
-- ==============================================================================

-- 1. Hàm kiểm tra admin (SECURITY DEFINER để đọc profiles mà không đệ quy RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
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

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 2. PROFILES
DROP POLICY IF EXISTS "Allow All Actions for Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles readable by owner or admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

-- Người dùng chỉ tự tạo profile role 'player'; admin (JWT app_metadata) được tạo role admin.
CREATE POLICY "Users insert own player profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND (role = 'player' OR public.is_admin()));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Cột role không sửa được qua API công khai (đổi role qua dashboard / service_role).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.profiles FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;

-- 3. CASES
DROP POLICY IF EXISTS "Allow All Actions for Cases" ON public.cases;
DROP POLICY IF EXISTS "Public read cases" ON public.cases;
DROP POLICY IF EXISTS "Admin write cases" ON public.cases;
CREATE POLICY "Public read cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Admin write cases" ON public.cases
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. DOSSIER_DOCUMENTS
DROP POLICY IF EXISTS "Allow all insert/update dossier_documents" ON public.dossier_documents;
DROP POLICY IF EXISTS "Admin write dossier_documents" ON public.dossier_documents;
CREATE POLICY "Admin write dossier_documents" ON public.dossier_documents
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. CASE_DOSSIERS
DROP POLICY IF EXISTS "Public insert/update case_dossiers" ON public.case_dossiers;
DROP POLICY IF EXISTS "Admin write case_dossiers" ON public.case_dossiers;
CREATE POLICY "Admin write case_dossiers" ON public.case_dossiers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. APP_SETTINGS
DROP POLICY IF EXISTS "Allow all insert for settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow all update for settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin update settings" ON public.app_settings;
CREATE POLICY "Admin insert settings" ON public.app_settings
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update settings" ON public.app_settings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. FEEDBACKS (giữ policy INSERT công khai)
DROP POLICY IF EXISTS "Cho phép cập nhật feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Cho phép đọc feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Admin read feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admin update feedbacks" ON public.feedbacks;
CREATE POLICY "Admin read feedbacks" ON public.feedbacks
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin update feedbacks" ON public.feedbacks
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. PLAY_SESSIONS
DROP POLICY IF EXISTS "Allow All Actions for Sessions" ON public.play_sessions;
DROP POLICY IF EXISTS "Players manage own sessions" ON public.play_sessions;
CREATE POLICY "Players manage own sessions" ON public.play_sessions
  FOR ALL USING (player_id = auth.uid() OR public.is_admin())
  WITH CHECK (player_id = auth.uid() OR public.is_admin());

-- 9. STORAGE avatars: đọc công khai, ghi chỉ admin (app chưa có luồng upload avatar)
DROP POLICY IF EXISTS "Public Upload Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin write avatars" ON storage.objects;
CREATE POLICY "Admin write avatars" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND public.is_admin())
  WITH CHECK (bucket_id = 'avatars' AND public.is_admin());
