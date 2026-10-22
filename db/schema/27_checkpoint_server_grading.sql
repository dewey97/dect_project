-- Migration 27: Checkpoint Server Grading & Public View
--
-- Mục tiêu:
-- 1. Tạo VIEW `case_checkpoints_public` giấu toàn bộ cột nhạy cảm chứa đáp án
--    (`answer_config`, `ai_context`, `ai_valid_cases`, `ai_invalid_cases`).
-- 2. Chỉ hiển thị các cột dữ liệu cấu trúc cần thiết cho Client / Player:
--    (`id`, `case_id`, `checkpoint_id`, `node_id`, `dossier`, `title`, `question`,
--     `type`, `kind`, `subject_key`, `question_type`, `unlocked_evidence_id`,
--     `followup_of`, `suspect_label`, `evidence_step_label`, `depends_on`,
--     `hints`, `narrative`, `flow_position`, `created_at`, `updated_at`).
-- 3. Cấp quyền SELECT trên view cho `anon, authenticated`.

CREATE OR REPLACE VIEW public.case_checkpoints_public AS
SELECT
  id,
  case_id,
  checkpoint_id,
  node_id,
  dossier,
  title,
  question,
  type,
  kind,
  subject_key,
  question_type,
  unlocked_evidence_id,
  followup_of,
  suspect_label,
  evidence_step_label,
  depends_on,
  hints,
  narrative,
  flow_position,
  created_at,
  updated_at
FROM public.case_checkpoints;

-- Cấp quyền đọc public cho người chơi
GRANT SELECT ON public.case_checkpoints_public TO anon, authenticated;

-- Comment mô tả view
COMMENT ON VIEW public.case_checkpoints_public IS 'Public view of case_checkpoints for gameplay client, hides answer_config and ai_* columns to prevent answer leakage.';

-- -----------------------------------------------------------------------------
-- SMOKE TEST (chạy thử rồi ROLLBACK, không làm thay đổi trạng thái database)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- Kiểm tra view tồn tại và đọc được
  IF NOT EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'case_checkpoints_public'
  ) THEN
    RAISE EXCEPTION 'Smoke test failed: view case_checkpoints_public does not exist';
  END IF;

  RAISE NOTICE 'Migration 27 smoke test passed successfully.';
END $$;
