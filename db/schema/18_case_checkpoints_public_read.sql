-- ==============================================================================
-- Policy: public read for case_checkpoints
-- Mô tả: Runtime gameplay đọc checkpoint trực tiếp từ Checkpoint Studio
-- (Supabase) thay vì tab `checkpoints` trên Google Sheets.
-- Ghi vẫn chỉ admin/service_role theo policy ở 16_case_checkpoints.sql.
-- ==============================================================================

DROP POLICY IF EXISTS "Allow public read for case_checkpoints"
  ON public.case_checkpoints;

CREATE POLICY "Allow public read for case_checkpoints"
  ON public.case_checkpoints
  FOR SELECT
  TO anon, authenticated
  USING (true);
