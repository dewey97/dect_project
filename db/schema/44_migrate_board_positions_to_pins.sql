-- ==============================================================================
-- Migration 44: Migrate board positions to boardgame_pins (B23-3)
-- Mô tả: Chuẩn hóa toàn bộ vị trí ghim điều tra về bảng `boardgame_pins`.
-- Trước khi di chuyển: Tạo bảng backup an toàn `boardgame_pins_backup_b23`.
-- ==============================================================================

BEGIN;

-- 1. Backup bảng boardgame_pins hiện tại
CREATE TABLE IF NOT EXISTS public.boardgame_pins_backup_b23 AS
SELECT * FROM public.boardgame_pins;

-- 2. Đồng bộ các vị trí từ case_board_nodes vào boardgame_pins (nếu chưa có trong pins)
INSERT INTO public.boardgame_pins (
  id,
  case_id,
  position_x,
  position_y,
  label,
  detail,
  rotation,
  scale,
  created_at,
  updated_at
)
SELECT
  cbn.id,
  cbn.case_slug AS case_id,
  COALESCE((cbn.config->'position'->'desktop'->>'x')::float8, (cbn.config->'position'->>'x')::float8, 0.5) AS position_x,
  COALESCE((cbn.config->'position'->'desktop'->>'y')::float8, (cbn.config->'position'->>'y')::float8, 0.5) AS position_y,
  cbn.title AS label,
  CONCAT('Node: ', cbn.title) AS detail,
  COALESCE((cbn.config->>'rotation')::float8, 0) AS rotation,
  COALESCE((cbn.config->>'scale')::float8, 1.0) AS scale,
  cbn.created_at,
  NOW() AS updated_at
FROM public.case_board_nodes cbn
WHERE NOT EXISTS (
  SELECT 1 FROM public.boardgame_pins bp WHERE bp.id = cbn.id
)
AND cbn.config IS NOT NULL
AND (cbn.config->'position') IS NOT NULL;

-- 3. Đồng bộ các vị trí từ case_checkpoints.board_config vào boardgame_pins (nếu checkpoint có cấu hình position)
INSERT INTO public.boardgame_pins (
  id,
  case_id,
  position_x,
  position_y,
  label,
  detail,
  rotation,
  scale,
  created_at,
  updated_at
)
SELECT
  CONCAT(cc.case_id, ':', cc.kind, ':', cc.id) AS id,
  cc.case_id,
  COALESCE((cc.board_config->'position'->'desktop'->>'x')::float8, 0.5) AS position_x,
  COALESCE((cc.board_config->'position'->'desktop'->>'y')::float8, 0.5) AS position_y,
  COALESCE(cc.board_config->>'pin_title', cc.title) AS label,
  cc.question AS detail,
  0 AS rotation,
  1.0 AS scale,
  cc.created_at,
  NOW() AS updated_at
FROM public.case_checkpoints cc
WHERE cc.board_config IS NOT NULL
AND (cc.board_config->'position'->'desktop'->>'x') IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.boardgame_pins bp 
  WHERE bp.id = CONCAT(cc.case_id, ':', cc.kind, ':', cc.id)
  OR bp.id = CONCAT(cc.case_id, ':', cc.kind, ':system')
  OR bp.id = CONCAT(cc.case_id, ':', cc.kind, ':verdict')
);

COMMIT;
