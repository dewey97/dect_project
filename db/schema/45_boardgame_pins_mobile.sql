-- ==============================================================================
-- Migration 45: Add mobile coordinates to boardgame_pins (B24-3)
-- Mô tả: Thêm mobile_x, mobile_y vào boardgame_pins để hỗ trợ lưu trữ tọa độ mobile thống nhất
-- ==============================================================================

BEGIN;

ALTER TABLE public.boardgame_pins
ADD COLUMN IF NOT EXISTS mobile_x FLOAT8,
ADD COLUMN IF NOT EXISTS mobile_y FLOAT8;

-- Tự động đồng bộ mobile position từ case_board_nodes config nếu có
UPDATE public.boardgame_pins bp
SET 
  mobile_x = (cbn.config->'position'->'mobile'->>'x')::float8,
  mobile_y = (cbn.config->'position'->'mobile'->>'y')::float8
FROM public.case_board_nodes cbn
WHERE bp.id = cbn.id
  AND cbn.config IS NOT NULL
  AND (cbn.config->'position'->'mobile'->>'x') IS NOT NULL
  AND bp.mobile_x IS NULL;

-- Tự động đồng bộ mobile position từ case_checkpoints board_config nếu có
UPDATE public.boardgame_pins bp
SET
  mobile_x = (cc.board_config->'position'->'mobile'->>'x')::float8,
  mobile_y = (cc.board_config->'position'->'mobile'->>'y')::float8
FROM public.case_checkpoints cc
WHERE bp.id = CONCAT(cc.case_id, ':', cc.kind, ':', cc.id)
  AND cc.board_config IS NOT NULL
  AND (cc.board_config->'position'->'mobile'->>'x') IS NOT NULL
  AND bp.mobile_x IS NULL;

COMMIT;
