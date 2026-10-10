-- ==============================================================================
-- Table: boardgame_connections
-- Mô tả: Lưu trữ dây chỉ đỏ admin nối giữa các ghim trên Bảng điều tra (/evidence/boardgame)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.boardgame_connections (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  from_pin_id TEXT NOT NULL,
  to_pin_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index tra cứu theo case_id
CREATE INDEX IF NOT EXISTS idx_boardgame_connections_case_id ON public.boardgame_connections(case_id);

-- Enable RLS
ALTER TABLE public.boardgame_connections ENABLE ROW LEVEL SECURITY;

-- 1. Cho phép đọc công khai
DROP POLICY IF EXISTS "Allow public read access for boardgame_connections" ON public.boardgame_connections;
CREATE POLICY "Allow public read access for boardgame_connections" ON public.boardgame_connections
  FOR SELECT USING (true);

-- 2. Cho phép insert / update / delete cho admin (service_role + profiles.role = 'admin')
DROP POLICY IF EXISTS "Allow write access for boardgame_connections" ON public.boardgame_connections;
CREATE POLICY "Allow write access for boardgame_connections" ON public.boardgame_connections
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ) WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
