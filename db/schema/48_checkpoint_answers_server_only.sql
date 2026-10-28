-- ==============================================================================
-- Migration 48: Checkpoint answers server-only (SPEC-22, phương án A)
-- Mô tả:
--   - Bỏ policy "Allow public read for case_checkpoints" (migration 18). Sau đó
--     anon / người chơi thường không đọc được bảng gốc chứa answer_config và ai_*.
--     Admin vẫn đọc qua policy "Allow admin read for case_checkpoints" (migration 16).
--   - Bỏ view case_checkpoints_public (migration 27/46): view dùng
--     security_invoker nên sẽ rỗng với anon, và không còn code nào đọc nó.
--
-- Gameplay đọc qua /api/checkpoints (service role + lọc allowlist trong
-- lib/checkpoints/public-checkpoint.ts); chấm điểm qua /api/checkpoints/verify
-- và /api/scan-answer.
--
-- CHỈ CHẠY SAU KHI:
--   1. Code mới đã deploy production (route /api/checkpoints dùng service role).
--   2. Biến SUPABASE_SERVICE_ROLE_KEY có trên VPS. Thiếu biến này,
--      createAdminClient() ném lỗi ở production.
--   Chạy sớm hơn: production chạy code cũ sẽ không tải được checkpoint.
-- Local dev thiếu SUPABASE_SERVICE_ROLE_KEY sẽ dùng anon key và nhận 0 checkpoint.
-- ==============================================================================

BEGIN;

DROP POLICY IF EXISTS "Allow public read for case_checkpoints"
  ON public.case_checkpoints;

DROP VIEW IF EXISTS public.case_checkpoints_public;

COMMIT;

-- Kiểm tra sau khi chạy (phải ra 0 dòng):
--   select policyname from pg_policies
--   where tablename = 'case_checkpoints'
--     and policyname = 'Allow public read for case_checkpoints';
