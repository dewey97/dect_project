-- ==============================================================================
-- Migration 46: Drop empty columns from case_checkpoints (B26-5)
-- Mô tả: Bỏ 3 cột không còn dữ liệu và không còn code đọc/ghi:
--   unlocked_evidence_id, suspect_label, evidence_step_label.
-- CHỈ CHẠY SAU KHI đã push và deploy code không còn select các cột này
-- (app/api/checkpoints/route.ts). Production chạy code cũ sẽ lỗi nếu chạy sớm.
-- Backup trước:
--   create table if not exists public.case_checkpoints_backup_b26 as
--     select * from public.case_checkpoints;
-- Kiểm trước (phải ra 0):
--   select count(*) from public.case_checkpoints
--   where nullif(unlocked_evidence_id,'') is not null
--      or nullif(suspect_label,'') is not null
--      or nullif(evidence_step_label,'') is not null;
-- ==============================================================================

BEGIN;

ALTER TABLE public.case_checkpoints
  DROP COLUMN IF EXISTS unlocked_evidence_id,
  DROP COLUMN IF EXISTS suspect_label,
  DROP COLUMN IF EXISTS evidence_step_label;

COMMIT;
