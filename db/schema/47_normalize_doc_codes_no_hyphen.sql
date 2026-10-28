-- 47. NORMALIZE DOCUMENT & EVIDENCE CODES (REMOVE HYPHENS)
-- Chuyển toàn bộ mã tài liệu/vật chứng từ định dạng có gạch nối (A-01, B-02, KL-01...) sang dạng liền (A01, B02, KL01...).

-- 1. Sao lưu dự phòng dữ liệu trước khi chuẩn hóa
DROP TABLE IF EXISTS public.case_evidence_backup_doc_codes;
CREATE TABLE public.case_evidence_backup_doc_codes AS SELECT * FROM public.case_evidence;

DROP TABLE IF EXISTS public.dossier_documents_backup_doc_codes;
CREATE TABLE public.dossier_documents_backup_doc_codes AS SELECT * FROM public.dossier_documents;

DROP TABLE IF EXISTS public.case_dossiers_backup_doc_codes;
CREATE TABLE public.case_dossiers_backup_doc_codes AS SELECT * FROM public.case_dossiers;

DROP TABLE IF EXISTS public.case_checkpoints_backup_doc_codes;
CREATE TABLE public.case_checkpoints_backup_doc_codes AS SELECT * FROM public.case_checkpoints;

-- 2. Cập nhật bảng case_evidence (mã vật chứng / tài liệu)
UPDATE public.case_evidence
SET code = REPLACE(code, '-', '')
WHERE code ~ '^[A-Za-z]+-[0-9]+$';

-- 3. Cập nhật bảng dossier_documents (mã tag hồ sơ lời khai / lý lịch)
UPDATE public.dossier_documents
SET tag_code = REPLACE(tag_code, '-', '')
WHERE tag_code LIKE '%-%';

-- 4. Cập nhật bảng case_dossiers (danh sách document_codes trong các bộ hồ sơ)
UPDATE public.case_dossiers
SET document_codes = COALESCE(
  (
    SELECT array_agg(REPLACE(doc_code, '-', ''))
    FROM unnest(document_codes) AS doc_code
  ),
  '{}'::text[]
);

-- 5. Cập nhật các checkpoint (answer_config và hints tham chiếu mã có gạch nối)
UPDATE public.case_checkpoints
SET answer_config = regexp_replace(
  answer_config::text,
  '([A-Z]{1,2})-([0-9]{2})',
  $$\1\2$$,
  'g'
)::jsonb
WHERE answer_config::text ~ '[A-Z]{1,2}-[0-9]{2}';

-- Cập nhật gợi ý hints trong case_checkpoints
UPDATE public.case_checkpoints
SET hints = regexp_replace(
  hints::text,
  '([A-Z]{1,2})-([0-9]{2})',
  $$\1\2$$,
  'g'
)::jsonb
WHERE hints::text ~ '[A-Z]{1,2}-[0-9]{2}';
