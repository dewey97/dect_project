-- ==============================================================================
-- 28. CHECKPOINT CONFIG NORMALIZE — chuẩn hóa answer_config cho vụ án mới
-- ==============================================================================
-- Mục tiêu: Chuẩn hóa cấu trúc answer_config để loại bỏ hardcode trong code.
-- 1. Thêm `input_type` rõ ràng cho các checkpoint `followup` (time | choice | code | text)
-- 2. Chuẩn hóa `valid_suspects` trong checkpoint `indictment` theo character.key ('ha')
--    thay vì tên hiển thị tiếng Việt, đồng thời giữ tương thích với cả hai.
-- 3. Đảm bảo options của choice lưu nhãn hiển thị và correct_answer khớp nhãn.
-- ==============================================================================

-- 1. Backfill followup case_000: cp-000-1a-followup (Vũ: Mốc thời gian)
UPDATE public.case_checkpoints
SET answer_config = jsonb_set(
  COALESCE(answer_config, '{}'::jsonb),
  '{input_type}',
  '"time"'::jsonb,
  true
) || jsonb_build_object(
  'inputType', 'time',
  'questionType', 'time',
  'correctAnswer', '21:15',
  'correct_answer', '21:15'
)
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1a-followup';

-- 2. Backfill followup case_000: cp-000-1b-followup (Tùng: Trắc nghiệm)
UPDATE public.case_checkpoints
SET answer_config = jsonb_set(
  COALESCE(answer_config, '{}'::jsonb),
  '{input_type}',
  '"choice"'::jsonb,
  true
) || jsonb_build_object(
  'inputType', 'choice',
  'questionType', 'choice',
  'options', jsonb_build_array('CÓ', 'KHÔNG'),
  'correctAnswer', 'KHÔNG',
  'correct_answer', 'KHÔNG'
)
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1b-followup';

-- 3. Backfill followup case_000: cp-000-1c-followup (Hà: Mật khẩu hộp thiếc)
UPDATE public.case_checkpoints
SET answer_config = jsonb_set(
  COALESCE(answer_config, '{}'::jsonb),
  '{input_type}',
  '"code"'::jsonb,
  true
) || jsonb_build_object(
  'inputType', 'code',
  'questionType', 'code',
  'correctAnswer', '120713',
  'correct_answer', '120713'
)
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1c-followup';

-- 4. Backfill indictment case_000: cp-000-2b (Cáo trạng: thêm character.key 'ha')
UPDATE public.case_checkpoints
SET answer_config = jsonb_set(
  COALESCE(answer_config, '{}'::jsonb),
  '{validSuspects}',
  jsonb_build_array('ha', 'Trần Thị Hà'),
  true
) || jsonb_build_object(
  'valid_suspects', jsonb_build_array('ha', 'Trần Thị Hà')
)
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-2b';

-- ==============================================================================
-- Smoke test
-- ==============================================================================
-- SELECT checkpoint_id, kind, subject_key, answer_config->>'input_type' AS input_type, answer_config->>'correctAnswer' AS ans
-- FROM public.case_checkpoints
-- WHERE case_id = 'case_000' AND kind IN ('followup', 'indictment');
