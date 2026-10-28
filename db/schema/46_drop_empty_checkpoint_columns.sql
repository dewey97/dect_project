-- ==============================================================================
-- Migration 46: Drop empty columns from case_checkpoints (B26-5)
-- Mô tả: Bỏ 3 cột không còn dữ liệu và không còn code đọc/ghi:
--   unlocked_evidence_id, suspect_label, evidence_step_label.
-- View case_checkpoints_public (migration 27) phụ thuộc các cột này nên được
-- tạo lại y như cũ, chỉ bỏ 3 cột (route đọc view bằng select("*")).
-- CHỈ CHẠY SAU KHI đã push và deploy code không còn select các cột này
-- (app/api/checkpoints/route.ts). Production chạy code cũ sẽ lỗi nếu chạy sớm.
-- Kiểm trước (phải ra 0):
--   select count(*) from public.case_checkpoints
--   where nullif(unlocked_evidence_id,'') is not null
--      or nullif(suspect_label,'') is not null
--      or nullif(evidence_step_label,'') is not null;
-- ==============================================================================

BEGIN;

DROP VIEW IF EXISTS public.case_checkpoints_public;

ALTER TABLE public.case_checkpoints
  DROP COLUMN IF EXISTS unlocked_evidence_id,
  DROP COLUMN IF EXISTS suspect_label,
  DROP COLUMN IF EXISTS evidence_step_label;

CREATE VIEW public.case_checkpoints_public
WITH (security_invoker = true) AS
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
  followup_of,
  depends_on,
  hints,
  narrative,
  flow_position,
  created_at,
  updated_at
FROM public.case_checkpoints;

GRANT SELECT ON public.case_checkpoints_public TO anon, authenticated;

COMMENT ON VIEW public.case_checkpoints_public IS 'Public view of case_checkpoints for gameplay client, hides answer_config and ai_* columns to prevent answer leakage.';

COMMIT;
