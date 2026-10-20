-- ==============================================================================
-- Table: case_checkpoints
-- Mô tả: Nguồn dữ liệu có cấu trúc cho Checkpoint Studio (Admin).
-- Runtime gameplay hiện vẫn đọc tab `checkpoints` từ Google Sheets.
-- Bảng này chưa được nối vào runtime — chỉ phục vụ biên tập trong Studio.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.case_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL DEFAULT 'case_000',
  checkpoint_id TEXT NOT NULL,
  node_id TEXT,
  dossier TEXT,
  title TEXT NOT NULL DEFAULT '',
  question TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'evidence_picker',
  question_type TEXT,
  unlocked_evidence_id TEXT,
  followup_of TEXT,
  suspect_label TEXT,
  evidence_step_label TEXT,
  answer_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  narrative TEXT,
  ai_context TEXT,
  ai_valid_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_invalid_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, checkpoint_id)
);

CREATE INDEX IF NOT EXISTS idx_case_checkpoints_case_id
  ON public.case_checkpoints(case_id);

ALTER TABLE public.case_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin read for case_checkpoints" ON public.case_checkpoints;
CREATE POLICY "Allow admin read for case_checkpoints" ON public.case_checkpoints
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow admin write for case_checkpoints" ON public.case_checkpoints;
CREATE POLICY "Allow admin write for case_checkpoints" ON public.case_checkpoints
  FOR ALL USING (
    auth.role() = 'service_role' OR
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ) WITH CHECK (
    auth.role() = 'service_role' OR
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
