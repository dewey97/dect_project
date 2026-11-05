-- ==============================================================================
-- Migration 49: Xóa các bảng backup tạm (B26-6, phần không cần đổi code)
-- Mô tả:
--   - boardgame_pins_backup_b23: backup trước khi chuyển bố cục bảng (migration 44).
--   - *_backup_doc_codes: backup trước khi bỏ gạch nối mã tài liệu (migration 47).
--   Không còn code nào đọc các bảng này. Production đã chạy ổn sau 2 migration đó
--   và đã smoke test 2026-11-05.
--
-- Phần B26-6 CHƯA làm ở đây (cần đổi code, deploy rồi mới bỏ cột):
--   - Unique (case_id, mode, tag_code) của dossier_documents: không thừa, vì
--     lib/actions/dossier-actions.ts upsert với onConflict "case_id,mode,tag_code".
--     Muốn bỏ thì đổi onConflict sang "case_id,tag_code" trước.
--   - case_dossiers.flow_position: Dossier Studio vẫn ghi (dossier-config-actions.ts).
--   - case_board_nodes.checkpoint_id: board-actions.ts vẫn ghi.
--   - case_characters.avatar_code: Checkpoint Studio và /api/characters vẫn dùng.
--
-- Kiểm tra trước khi chạy (xem số dòng, quyết định có cần export không):
--   select 'boardgame_pins_backup_b23' t, count(*) from public.boardgame_pins_backup_b23
--   union all select 'case_evidence_backup_doc_codes', count(*) from public.case_evidence_backup_doc_codes
--   union all select 'dossier_documents_backup_doc_codes', count(*) from public.dossier_documents_backup_doc_codes
--   union all select 'case_dossiers_backup_doc_codes', count(*) from public.case_dossiers_backup_doc_codes
--   union all select 'case_checkpoints_backup_doc_codes', count(*) from public.case_checkpoints_backup_doc_codes;
-- ==============================================================================

BEGIN;

DROP TABLE IF EXISTS public.boardgame_pins_backup_b23;
DROP TABLE IF EXISTS public.case_evidence_backup_doc_codes;
DROP TABLE IF EXISTS public.dossier_documents_backup_doc_codes;
DROP TABLE IF EXISTS public.case_dossiers_backup_doc_codes;
DROP TABLE IF EXISTS public.case_checkpoints_backup_doc_codes;

COMMIT;

-- Kiểm tra sau khi chạy (phải ra 0 dòng):
--   select table_name from information_schema.tables
--   where table_schema = 'public' and table_name like '%backup%';
