-- ==============================================================================
-- 39. DYNAMIC INVESTIGATION BOARD NODES & CHECKPOINT BOARD CONFIG
-- ==============================================================================
-- WT-1: wt/board-dynamic
-- 1. Bổ sung cột board_config JSONB vào public.case_checkpoints
-- 2. Tạo bảng public.case_board_nodes lưu trữ các node bảng điều tra động
-- 3. RLS: Đọc công khai (public read), ghi/sửa/xóa chỉ admin (private.is_admin())
-- 4. Backfill tọa độ case_000: victim, victim_phone, reinvestigate, suspects_hub, evidence_hub
-- 5. Backfill board_config cho các checkpoint case_000 (phone_lookup, indictment, followup)
-- 6. Cập nhật khóa cũ trong boardgame_pins sang id node mới
-- ==============================================================================

BEGIN;

-- 1. Bổ sung board_config vào case_checkpoints
ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS board_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Tạo bảng case_board_nodes
CREATE TABLE IF NOT EXISTS public.case_board_nodes (
  id            TEXT PRIMARY KEY,
  case_slug     TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  node_kind     TEXT NOT NULL CHECK (node_kind IN
                  ('victim','victim_phone','reinvestigate','suspects_hub','evidence_hub',
                   'note','photo','dossier','custom')),
  title         TEXT,
  subject_key   TEXT,
  checkpoint_id UUID REFERENCES public.case_checkpoints(id) ON DELETE CASCADE,
  slot_index    INT NOT NULL DEFAULT 0,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index tra cứu theo case_slug
CREATE INDEX IF NOT EXISTS idx_case_board_nodes_case
  ON public.case_board_nodes (case_slug, slot_index);

-- Trigger cập nhật updated_at
DROP TRIGGER IF EXISTS set_case_board_nodes_updated_at ON public.case_board_nodes;
CREATE TRIGGER set_case_board_nodes_updated_at
  BEFORE UPDATE ON public.case_board_nodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. RLS
ALTER TABLE public.case_board_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_nodes_public_read" ON public.case_board_nodes;
CREATE POLICY "board_nodes_public_read" ON public.case_board_nodes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "board_nodes_admin_write" ON public.case_board_nodes;
CREATE POLICY "board_nodes_admin_write" ON public.case_board_nodes
  FOR ALL
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

-- 4. Backfill 5 node hệ thống cơ bản cho case_000
INSERT INTO public.case_board_nodes (id, case_slug, node_kind, title, subject_key, slot_index, config)
VALUES
  (
    'case_000:victim:khang',
    'case_000',
    'victim',
    'Nguyễn Văn Khang',
    'khang',
    0,
    jsonb_build_object(
      'pin_title', 'Nguyễn Văn Khang',
      'photo_url', '/images/cases/case_000/victim_khang.png',
      'position', jsonb_build_object(
        'desktop', jsonb_build_object('x', 0.44, 'y', 0.58),
        'mobile', jsonb_build_object('x', 0.44, 'y', 0.58)
      )
    )
  ),
  (
    'case_000:victim_phone:item',
    'case_000',
    'victim_phone',
    'Điện thoại nạn nhân',
    'khang',
    1,
    jsonb_build_object(
      'pin_title', 'Điện thoại nạn nhân',
      'photo_url', '/phone.png',
      'scale', 0.85,
      'position', jsonb_build_object(
        'desktop', jsonb_build_object('x', 0.38, 'y', 0.14),
        'mobile', jsonb_build_object('x', 0.38, 'y', 0.14)
      )
    )
  ),
  (
    'case_000:reinvestigate:scene',
    'case_000',
    'reinvestigate',
    'Khám xét hiện trường',
    NULL,
    2,
    jsonb_build_object(
      'pin_title', 'Khám xét hiện trường',
      'photo_url', '/images/cases/case_000/crime_scene.png',
      'scale', 0.95,
      'position', jsonb_build_object(
        'desktop', jsonb_build_object('x', 0.18, 'y', 0.36),
        'mobile', jsonb_build_object('x', 0.18, 'y', 0.36)
      )
    )
  ),
  (
    'case_000:suspects_hub:hub',
    'case_000',
    'suspects_hub',
    'Nghi phạm',
    NULL,
    3,
    jsonb_build_object(
      'pin_title', 'Nghi phạm',
      'position', jsonb_build_object(
        'desktop', jsonb_build_object('x', 0.58, 'y', 0.38),
        'mobile', jsonb_build_object('x', 0.58, 'y', 0.38)
      )
    )
  ),
  (
    'case_000:evidence_hub:hub',
    'case_000',
    'evidence_hub',
    'Vật chứng',
    NULL,
    4,
    jsonb_build_object(
      'pin_title', 'Vật chứng',
      'position', jsonb_build_object(
        'desktop', jsonb_build_object('x', 0.82, 'y', 0.28),
        'mobile', jsonb_build_object('x', 0.82, 'y', 0.28)
      )
    )
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  config = EXCLUDED.config,
  updated_at = now();

-- 5. Backfill board_config cho checkpoints case_000 (phone_lookup, indictment)
UPDATE public.case_checkpoints
SET board_config = jsonb_build_object(
  'pin_title', 'Mở rộng điều tra',
  'position', jsonb_build_object(
    'desktop', jsonb_build_object('x', 0.42, 'y', 0.27),
    'mobile', jsonb_build_object('x', 0.42, 'y', 0.27)
  )
)
WHERE case_id IN ('case_000', 'case-000') AND kind = 'phone_lookup';

UPDATE public.case_checkpoints
SET board_config = jsonb_build_object(
  'pin_title', 'Bản kết luận điều tra',
  'position', jsonb_build_object(
    'desktop', jsonb_build_object('x', 0.22, 'y', 0.80),
    'mobile', jsonb_build_object('x', 0.22, 'y', 0.80)
  )
)
WHERE case_id IN ('case_000', 'case-000') AND kind = 'indictment';

-- 6. Cập nhật mapping ID trong boardgame_pins từ format c0-pin sang format chuẩn
UPDATE public.boardgame_pins SET id = 'case_000:phone_lookup:system' WHERE id = 'c0-pin-phone';
UPDATE public.boardgame_pins SET id = 'case_000:victim_phone:item' WHERE id = 'c0-pin-victim-phone';
UPDATE public.boardgame_pins SET id = 'case_000:reinvestigate:scene' WHERE id = 'c0-pin-reinvestigate';
UPDATE public.boardgame_pins SET id = 'case_000:suspects_hub:hub' WHERE id = 'c0-pin-suspects';
UPDATE public.boardgame_pins SET id = 'case_000:indictment:verdict' WHERE id = 'c0-pin-indictment';

COMMIT;
