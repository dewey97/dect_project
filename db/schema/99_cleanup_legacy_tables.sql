-- ====================================================================
-- DỌN DẸP 8 BẢNG RÁC KHÔNG CÒN SỬ DỤNG TRÊN SUPABASE (DECT_PROJECT)
-- Chạy script này trên Supabase SQL Editor
-- ====================================================================

-- 1. Xóa các bảng liên quan đến tiến trình cũ và quan hệ
DROP TABLE IF EXISTS public.player_answers CASCADE;
DROP TABLE IF EXISTS public.relationships CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;

-- 2. Xóa các bảng dữ liệu kịch bản cũ (đã chuyển 100% sang Google Sheets Live CMS)
DROP TABLE IF EXISTS public.timeline_events CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.boardgame_pins CASCADE;

-- 3. Xóa các bảng React Flow node/edge cũ
DROP TABLE IF EXISTS public.evidence_edges CASCADE;
DROP TABLE IF EXISTS public.evidence_nodes CASCADE;

-- 4. Dọn row rác nhân bản trong bảng cases
DELETE FROM public.cases WHERE title = 'Copy of TRỐN TÌM';
