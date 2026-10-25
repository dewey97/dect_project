-- ==============================================================================
-- 40. CLEANUP LEGACY DOSSIER X TRÊN PRODUCTION (B12-8)
-- ==============================================================================
-- Hồ sơ A-03 đã nằm trong dossier bo_a ("Bộ A").
-- Dossier "x" (key: "x", title: "X") tạo tạm ngày 2026-10-21 nay được dọn dẹp sạch.
-- data fix một lần, chạy lại vô hại.
-- ==============================================================================

DELETE FROM public.case_dossiers
WHERE case_id = 'case_000' AND dossier_key = 'x';
