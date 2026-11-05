-- ==============================================================================
-- Migration 50: Bỏ khóa `passcode` khỏi case_characters.device
-- Mô tả:
--   - Gameplay không dùng passcode (màn khóa điện thoại mở bằng chạm). Phone Studio
--     đã gỡ ô nhập này.
--   - Bảng case_characters cho anon đọc, nên passcode lộ xuống trình duyệt. Với
--     Case #000, passcode `120713` trùng đáp án câu hỏi phụ của Hà.
--   - Chủ dự án chốt 2026-11-05: không làm câu đố nhập mã mở khóa điện thoại.
--
-- Kiểm tra trước khi chạy:
--   select case_slug, key, device->>'passcode' as passcode
--   from public.case_characters where device ? 'passcode';
-- ==============================================================================

BEGIN;

UPDATE public.case_characters
SET device = device - 'passcode'
WHERE device ? 'passcode';

COMMIT;

-- Kiểm tra sau khi chạy (phải ra 0 dòng):
--   select key from public.case_characters where device ? 'passcode';
