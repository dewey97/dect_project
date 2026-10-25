-- ==============================================================================
-- 43_drop_legacy_evidence_board.sql
-- Xóa các bảng evidence_edges và evidence_nodes cũ (React Flow board cũ).
-- Hệ thống điều tra hiện tại đã chuyển toàn bộ sang boardgame_pins / board_nodes / case_checkpoints.
-- ==============================================================================

DROP TABLE IF EXISTS public.evidence_edges CASCADE;
DROP TABLE IF EXISTS public.evidence_nodes CASCADE;
