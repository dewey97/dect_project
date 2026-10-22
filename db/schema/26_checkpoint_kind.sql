-- ==============================================================================
-- 26. CHECKPOINT KIND — phân loại checkpoint theo loại gameplay
-- ==============================================================================
-- Thêm cột `kind` (loại checkpoint) và `subject_key` (nhân vật liên quan) vào
-- bảng `case_checkpoints`, thay thế việc suy luận loại từ checkpoint_id hoặc
-- cột `type` không chuẩn hóa.
--
-- `kind` values:
--   phone_lookup             Tra cứu số điện thoại nghi phạm
--   suspect_interrogation    Thẩm tra nghi phạm (3 lớp: Động cơ, Ngoại phạm, Mâu thuẫn)
--   followup                 Câu hỏi phụ sau thẩm tra (time/choice/code/text)
--   indictment               Cáo trạng kết án
--   epilogue                 Hậu án / Ký sự kết thúc
--   choice                   Câu hỏi trắc nghiệm chung
--   code                     Nhập mã / mật khẩu
--   time                     Nhập mốc thời gian
--   text                     Nhập văn bản tự do
--
-- `subject_key` liên kết tới nhân vật `case_characters.key` cùng vụ.
-- Dùng cho suspect_interrogation và followup: xác định thẩm tra ai.
-- ==============================================================================

-- 1. Thêm cột kind
ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS kind TEXT;

-- 2. Thêm cột subject_key
ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS subject_key TEXT;

-- 3. Backfill case_000 (9 checkpoint)
UPDATE public.case_checkpoints SET kind = 'phone_lookup', subject_key = NULL
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-0';

UPDATE public.case_checkpoints SET kind = 'suspect_interrogation', subject_key = 'vu'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1a';

UPDATE public.case_checkpoints SET kind = 'suspect_interrogation', subject_key = 'tung'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1b';

UPDATE public.case_checkpoints SET kind = 'suspect_interrogation', subject_key = 'ha'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1c';

UPDATE public.case_checkpoints SET kind = 'followup', subject_key = 'vu'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1a-followup';

UPDATE public.case_checkpoints SET kind = 'followup', subject_key = 'tung'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1b-followup';

UPDATE public.case_checkpoints SET kind = 'followup', subject_key = 'ha'
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1c-followup';

UPDATE public.case_checkpoints SET kind = 'indictment', subject_key = NULL
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-2b';

UPDATE public.case_checkpoints SET kind = 'epilogue', subject_key = NULL
  WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-epilogue';

-- 4. Mặc định cho checkpoint không match ở trên → 'text'
UPDATE public.case_checkpoints SET kind = 'text'
  WHERE kind IS NULL;

-- 5. Áp dụng NOT NULL + DEFAULT cho lần tạo mới
ALTER TABLE public.case_checkpoints
  ALTER COLUMN kind SET NOT NULL,
  ALTER COLUMN kind SET DEFAULT 'text';

-- 6. CHECK constraint cho kind values
ALTER TABLE public.case_checkpoints
  DROP CONSTRAINT IF EXISTS case_checkpoints_kind_check;
ALTER TABLE public.case_checkpoints
  ADD CONSTRAINT case_checkpoints_kind_check
  CHECK (kind IN (
    'phone_lookup',
    'suspect_interrogation',
    'followup',
    'indictment',
    'epilogue',
    'choice',
    'code',
    'time',
    'text'
  ));

-- 7. Index trên kind để query theo loại
CREATE INDEX IF NOT EXISTS idx_case_checkpoints_kind
  ON public.case_checkpoints (case_id, kind);

-- ==============================================================================
-- Smoke test (chạy trong transaction, rollback cuối)
-- Chủ dự án duyệt xong mới chạy migration thật.
-- ==============================================================================
-- BEGIN;
--
-- -- Kiểm tra backfill
-- SELECT checkpoint_id, kind, subject_key
-- FROM public.case_checkpoints
-- WHERE case_id = 'case_000'
-- ORDER BY checkpoint_id;
--
-- -- Kiểm tra constraint: phải lỗi
-- -- INSERT INTO public.case_checkpoints (case_id, checkpoint_id, title, kind)
-- -- VALUES ('case_000', 'cp-test-bad', 'test', 'invalid_kind');
--
-- ROLLBACK;
