-- ==============================================================================
-- 24. PERSIST RUNTIME DATA TABLES (MAP VECTOR, HOTSPOTS, WAITLIST) (Task A5)
-- ==============================================================================
-- Mục đích: Chuyển dữ liệu lưu file trong container Docker sang Supabase:
--   1. `map_vectors`: Lưu bản đồ vector thế giới mở rộng (world_vector_map.json)
--   2. `reinvestigation_hotspots`: Lưu tọa độ & ảnh điểm khám xét lại theo từng vụ án
--   3. `waitlist_entries`: Lưu danh sách email đăng ký nhận thông tin
--
-- RLS:
--   - map_vectors: Đọc công khai, Ghi chỉ admin
--   - reinvestigation_hotspots: Đọc công khai, Ghi chỉ admin
--   - waitlist_entries: Thêm công khai (anon/authenticated), Đọc chỉ admin
-- ==============================================================================

BEGIN;

-- 0. Đảm bảo schema private và hàm private.is_admin() tồn tại
--    (tương thích kể cả khi migration 25 chưa chạy)
CREATE SCHEMA IF NOT EXISTS private;

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

-- ==============================================================================
-- 1. BẢNG map_vectors: Bản đồ vector thế giới mở rộng dùng chung
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.map_vectors (
  id TEXT PRIMARY KEY DEFAULT 'world',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.map_vectors IS 'Bản đồ vector thế giới mở rộng (dùng chung cho mọi vụ án)';

ALTER TABLE public.map_vectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read map_vectors" ON public.map_vectors;
CREATE POLICY "Public read map_vectors" ON public.map_vectors
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin write map_vectors" ON public.map_vectors;
CREATE POLICY "Admin write map_vectors" ON public.map_vectors
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ==============================================================================
-- 2. BẢNG reinvestigation_hotspots: Điểm khám xét lại hiện trường theo vụ án
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reinvestigation_hotspots (
  case_slug TEXT PRIMARY KEY REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  hotspots JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reinvestigation_hotspots IS 'Cấu hình điểm khám xét lại hiện trường (hotspots 2D/360) theo từng vụ án';

ALTER TABLE public.reinvestigation_hotspots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reinvestigation_hotspots" ON public.reinvestigation_hotspots;
CREATE POLICY "Public read reinvestigation_hotspots" ON public.reinvestigation_hotspots
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin write reinvestigation_hotspots" ON public.reinvestigation_hotspots;
CREATE POLICY "Admin write reinvestigation_hotspots" ON public.reinvestigation_hotspots
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ==============================================================================
-- 3. BẢNG waitlist_entries: Danh sách email đăng ký nhận thông tin sớm
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'landing_hero',
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_entries_email_source_key UNIQUE (email, source)
);

COMMENT ON TABLE public.waitlist_entries IS 'Danh sách người dùng đăng ký nhận thông tin vụ án mới (waitlist)';

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon and authenticated insert waitlist" ON public.waitlist_entries;
CREATE POLICY "Anon and authenticated insert waitlist" ON public.waitlist_entries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    btrim(email) <> '' AND
    email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
  );

DROP POLICY IF EXISTS "Admin read waitlist" ON public.waitlist_entries;
CREATE POLICY "Admin read waitlist" ON public.waitlist_entries
  FOR SELECT TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "Admin modify waitlist" ON public.waitlist_entries;
CREATE POLICY "Admin modify waitlist" ON public.waitlist_entries
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admin delete waitlist" ON public.waitlist_entries;
CREATE POLICY "Admin delete waitlist" ON public.waitlist_entries
  FOR DELETE TO authenticated
  USING (private.is_admin());

-- ==============================================================================
-- 4. SMOKE TEST — kiểm tra RLS cho các vai trò khác nhau
-- ==============================================================================
SAVEPOINT smoke_test;

-- 4a. Vai trò anon:
SET LOCAL ROLE anon;

-- anon đọc được map_vectors
DO $$
BEGIN
  PERFORM * FROM public.map_vectors LIMIT 1;
END $$;

-- anon đọc được reinvestigation_hotspots
DO $$
BEGIN
  PERFORM * FROM public.reinvestigation_hotspots LIMIT 1;
END $$;

-- anon KHÔNG đọc được waitlist_entries (sẽ rỗng hoặc 0 dòng)
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM public.waitlist_entries;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: anon was able to see waitlist_entries';
  END IF;
END $$;

-- 4b. Vai trò authenticated bình thường:
SET LOCAL ROLE authenticated;

-- authenticated bình thường không được ghi map_vectors
DO $$
BEGIN
  IF private.is_admin() THEN
    RAISE EXCEPTION 'SMOKE TEST FAIL: regular authenticated is_admin() returned true';
  END IF;
END $$;

RELEASE SAVEPOINT smoke_test;
RESET ROLE;

COMMIT;
