-- ==============================================================================
-- Column: flow_position
-- Mô tả: Lưu vị trí node trên sơ đồ phụ thuộc của Checkpoint Studio.
-- Dạng JSONB: { "x": number, "y": number }. NULL = dùng layout tự động.
-- ==============================================================================

ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS flow_position JSONB;

COMMENT ON COLUMN public.case_checkpoints.flow_position IS
  'Vị trí node trên Flow view: {"x": number, "y": number}. NULL dùng auto-layout.';
