-- ==============================================================================
-- 23. CASE CHARACTERS — danh sách nhân vật theo vụ án (Case Bible)
-- ==============================================================================
-- Thay thế các hằng số trong code chỉ đúng cho case_000:
--   VALID_CASE_CHARACTERS (lib/cases/case-000-suspects.ts),
--   KNOWN_CASE_PHONES (lib/cases/case-000-clues.ts),
--   nạn nhân "Khang" và DEFAULT_VICTIM_DEVICE (phone-simulator).
--
-- `key`        : định danh ngắn dùng trong gameplay (`vu`, `ha`...), khớp mã
--                ảnh `avatar_<key>` trên tab `evidences`.
-- `aliases`    : các cách người chơi có thể gõ tên (so khớp không dấu).
-- `role`       : victim | suspect | witness | related.
-- `phones`     : số điện thoại (chỉ chữ số) để nhận diện manh mối SĐT.
-- `slot_index` : thứ tự hiển thị trên bàn điều tra.
-- `device`     : metadata điện thoại tang vật (thường gắn với nạn nhân).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.case_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_slug TEXT NOT NULL REFERENCES public.cases(slug)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  key TEXT NOT NULL CHECK (key ~ '^[a-z0-9_]{1,40}$'),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  aliases TEXT[] NOT NULL DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'suspect'
    CHECK (role IN ('victim', 'suspect', 'witness', 'related')),
  description TEXT,
  avatar_code TEXT,
  phones TEXT[] NOT NULL DEFAULT '{}',
  slot_index INTEGER NOT NULL DEFAULT 0,
  device JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_slug, key)
);

CREATE INDEX IF NOT EXISTS idx_case_characters_case
  ON public.case_characters (case_slug, slot_index);

ALTER TABLE public.case_characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read case_characters" ON public.case_characters;
CREATE POLICY "Public read case_characters" ON public.case_characters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write case_characters" ON public.case_characters;
CREATE POLICY "Admin write case_characters" ON public.case_characters
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed case_000 (nguồn: hằng số cũ trong code + tab `evidences`).
INSERT INTO public.case_characters
  (case_slug, key, name, aliases, role, description, avatar_code, phones, slot_index, device)
VALUES
  ('case_000', 'vu', 'Lê Quang Vũ',
   ARRAY['lê quang vũ','le quang vu','vũ','vu','quang vũ','quang vu'],
   'suspect', 'Chồng của Mai / Kỹ sư điện', 'avatar_vu', ARRAY['0988200991'], 0, NULL),
  ('case_000', 'tung', 'Nguyễn Thanh Tùng',
   ARRAY['nguyễn thanh tùng','nguyen thanh tung','tùng','tung','thanh tùng','thanh tung'],
   'suspect', 'Thợ nề tự do / Bạn thời thơ ấu', 'avatar_tung', ARRAY['0912331888'], 1, NULL),
  ('case_000', 'ha', 'Trần Thị Hà',
   ARRAY['trần thị hà','tran thi ha','hà','ha','thị hà','thi ha'],
   'suspect', 'Kế toán / Bạn gái Khang', 'avatar_ha', ARRAY['0978552109','0984112568'], 2, NULL),
  ('case_000', 'mai', 'Nguyễn Ngọc Mai',
   ARRAY['nguyễn ngọc mai','nguyen ngoc mai','mai','ngọc mai','ngoc mai'],
   'suspect', 'Em họ nạn nhân Khang', 'avatar_mai', '{}', 3, NULL),
  ('case_000', 'dat', 'Trần Văn Đạt',
   ARRAY['trần văn đạt','tran van dat','đạt','dat','văn đạt','van dat'],
   'suspect', 'Tiểu thương Chợ Cảng', 'avatar_dat', ARRAY['0984180357'], 4, NULL),
  ('case_000', 'vy', 'Nguyễn Thảo Vy',
   ARRAY['nguyễn thảo vy','nguyen thao vy','vy','thảo vy','thao vy'],
   'suspect', 'Nhân tình của Khang', 'avatar_vy', '{}', 5, NULL),
  ('case_000', 'khang', 'Nguyễn Văn Khang',
   ARRAY['nguyễn văn khang','nguyen van khang','khang','văn khang','van khang'],
   'victim', 'Nạn nhân vụ án', 'avatar_khang', '{}', 10,
   '{"label":"Điện thoại nạn nhân","model":"iPhone 6s","lastUpdated":"24/07/2016 // 17:55","description":"Điện thoại cá nhân của nạn nhân Khang"}'::jsonb),
  ('case_000', 'lua', 'Nguyễn Thị Lụa',
   ARRAY['nguyễn thị lụa','nguyen thi lua','bà lụa','ba lua','lụa','lua'],
   'witness', 'Hàng xóm / Người phát hiện thi thể', 'avatar_lua', '{}', 11, NULL),
  ('case_000', 'huy', 'Nguyễn Gia Huy',
   ARRAY['nguyễn gia huy','nguyen gia huy','gia huy','huy'],
   'related', 'Em trai của Tùng', 'avatar_huy', '{}', 12, NULL),
  ('case_000', 'tien', 'Nguyễn Thanh Tiến',
   ARRAY['nguyễn thanh tiến','nguyen thanh tien','thanh tiến','thanh tien','tiến','tien'],
   'related', 'Bố của Tùng', 'avatar_tien', '{}', 13, NULL)
ON CONFLICT (case_slug, key) DO NOTHING;
