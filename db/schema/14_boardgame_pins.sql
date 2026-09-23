-- ==============================================================================
-- Table: boardgame_pins
-- Mô tả: Lưu trữ tọa độ tùy chỉnh và thông tin các Ghim hệ thống trên Bảng điều tra Boardgame (/evidence/boardgame)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.boardgame_pins (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  position_x FLOAT8 NOT NULL,
  position_y FLOAT8 NOT NULL,
  label TEXT,
  detail TEXT,
  color TEXT,
  note_color TEXT,
  pin_color TEXT,
  photo_url TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  pulse_border BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tra cứu theo case_id
CREATE INDEX IF NOT EXISTS idx_boardgame_pins_case_id ON public.boardgame_pins(case_id);

-- Enable RLS
ALTER TABLE public.boardgame_pins ENABLE ROW LEVEL SECURITY;

-- 1. Cho phép đọc công khai
DROP POLICY IF EXISTS "Allow public read access for boardgame_pins" ON public.boardgame_pins;
CREATE POLICY "Allow public read access for boardgame_pins" ON public.boardgame_pins
  FOR SELECT USING (true);

-- 2. Cho phép insert / update / delete cho admin
DROP POLICY IF EXISTS "Allow write access for boardgame_pins" ON public.boardgame_pins;
CREATE POLICY "Allow write access for boardgame_pins" ON public.boardgame_pins
  FOR ALL USING (true) WITH CHECK (true);
