-- ==============================================================================
-- 29. BOARDGAME PINS & CONNECTIONS CASE SLUG FOREIGN KEY
-- ==============================================================================
-- Chuẩn hóa case_id từ 'case-000' sang 'case_000' cho boardgame_pins và boardgame_connections.
-- Thêm khóa ngoại FOREIGN KEY tham chiếu cases(slug) (ON UPDATE CASCADE ON DELETE RESTRICT).
-- ==============================================================================

-- 1. Chuẩn hóa dữ liệu case_id cũ nếu có
UPDATE public.boardgame_pins
SET case_id = replace(case_id, '-', '_')
WHERE case_id LIKE '%-%';

UPDATE public.boardgame_connections
SET case_id = replace(case_id, '-', '_')
WHERE case_id LIKE '%-%';

-- 2. Thêm khóa ngoại FK cho boardgame_pins
ALTER TABLE public.boardgame_pins DROP CONSTRAINT IF EXISTS boardgame_pins_case_slug_fkey;
ALTER TABLE public.boardgame_pins ADD CONSTRAINT boardgame_pins_case_slug_fkey
  FOREIGN KEY (case_id) REFERENCES public.cases(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- 3. Thêm khóa ngoại FK cho boardgame_connections
ALTER TABLE public.boardgame_connections DROP CONSTRAINT IF EXISTS boardgame_connections_case_slug_fkey;
ALTER TABLE public.boardgame_connections ADD CONSTRAINT boardgame_connections_case_slug_fkey
  FOREIGN KEY (case_id) REFERENCES public.cases(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;
