-- ==============================================================================
-- 31. PHONE DATA TABLES — Dữ liệu nội dung ứng dụng điện thoại theo vụ án
-- ==============================================================================
-- Thay thế Google Sheets cho 7 phân hệ điện thoại:
--   1. phone_contacts: Danh bạ liên lạc
--   2. phone_calls: Lịch sử cuộc gọi
--   3. phone_messages: Tin nhắn trao đổi (nhóm theo thread_key)
--   4. phone_photos: Thư viện hình ảnh
--   5. phone_notes: Sổ tay ghi chú
--   6. phone_bank_transactions: Sao kê ngân hàng
--   7. phone_browser_history: Lịch sử duyệt web Safari
-- ==============================================================================

-- 1. Danh bạ
CREATE TABLE IF NOT EXISTS public.phone_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  contact_id TEXT,
  name TEXT NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  category TEXT,
  note TEXT,
  is_saved BOOLEAN DEFAULT true,
  avatar_url TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Lịch sử cuộc gọi
CREATE TABLE IF NOT EXISTS public.phone_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  code TEXT,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  call_type TEXT NOT NULL DEFAULT 'incoming',
  timestamp TEXT,
  duration TEXT,
  audio_url TEXT,
  is_key_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tin nhắn (flat, group theo thread_key)
CREATE TABLE IF NOT EXISTS public.phone_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  thread_key TEXT NOT NULL,
  thread_name TEXT NOT NULL,
  thread_phone TEXT,
  sender TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'received',
  body TEXT NOT NULL DEFAULT '',
  timestamp TEXT,
  code TEXT,
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  attachment_type TEXT,
  attachment_url TEXT,
  attachment_duration TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ảnh trong gallery
CREATE TABLE IF NOT EXISTS public.phone_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  photo_code TEXT,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  taken_at TEXT,
  description TEXT,
  exif_json JSONB,
  is_evidence BOOLEAN DEFAULT false,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ghi chú (Notes app)
CREATE TABLE IF NOT EXISTS public.phone_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN DEFAULT false,
  code TEXT,
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Giao dịch ngân hàng
CREATE TABLE IF NOT EXISTS public.phone_bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  tx_type TEXT NOT NULL DEFAULT 'out',
  amount BIGINT NOT NULL DEFAULT 0,
  counterparty TEXT NOT NULL,
  note TEXT,
  timestamp TEXT,
  code TEXT,
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  balance_after BIGINT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Lịch sử duyệt web (Safari)
CREATE TABLE IF NOT EXISTS public.phone_browser_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  visited_at TEXT,
  favicon_url TEXT,
  code TEXT,
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phone_contacts_case ON public.phone_contacts(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_calls_case ON public.phone_calls(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_messages_case ON public.phone_messages(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_messages_thread ON public.phone_messages(case_slug, thread_key, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_photos_case ON public.phone_photos(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_notes_case ON public.phone_notes(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_bank_tx_case ON public.phone_bank_transactions(case_slug, slot_index);
CREATE INDEX IF NOT EXISTS idx_phone_browser_case ON public.phone_browser_history(case_slug, slot_index);

-- RLS
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'phone_contacts', 'phone_calls', 'phone_messages',
    'phone_photos', 'phone_notes', 'phone_bank_transactions',
    'phone_browser_history'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%s_read" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_read" ON public.%I FOR SELECT USING (true)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%s_write" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_write" ON public.%I FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin())', tbl, tbl);
  END LOOP;
END $$;
