-- ==============================================================================
-- 35. CASE EVIDENCE — Hệ thống quản lý chứng cứ vụ án per-case & Storage
-- ==============================================================================
-- Quản lý tài liệu điều tra, vật chứng, ảnh hiện trường, tệp âm thanh và ảnh 360:
--   1. Thêm cột panorama_url, scene_360_url vào bảng cases.
--   2. Bảng case_evidence (PDF, photo, audio, object).
--   3. Storage bucket evidence-assets (lưu PDF, ảnh chứng cứ, audio).
--   4. RLS: Đọc công khai (public read), ghi chỉ dành cho Admin (private.is_admin()).
--   5. Seed dữ liệu case_000 từ CASE_000_PDFS và CASE_000_EVIDENCE.
-- ==============================================================================

-- 1. Thêm cột ảnh 360 / Panorama vào cases
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS panorama_url TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS scene_360_url TEXT;

-- 2. Bảng case_evidence
CREATE TABLE IF NOT EXISTS public.case_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'photo' CHECK (kind IN ('pdf', 'image', 'photo', 'audio', 'object')),
  file_url TEXT,
  thumb_url TEXT,
  phase INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT case_evidence_case_code_key UNIQUE(case_slug, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_evidence_case ON public.case_evidence(case_slug, phase, slot_index);
CREATE INDEX IF NOT EXISTS idx_case_evidence_kind ON public.case_evidence(case_slug, kind);

-- RLS
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_evidence_read" ON public.case_evidence;
CREATE POLICY "case_evidence_read"
  ON public.case_evidence FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "case_evidence_write" ON public.case_evidence;
CREATE POLICY "case_evidence_write"
  ON public.case_evidence FOR ALL
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- 3. Storage bucket: evidence-assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-assets', 'evidence-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public Read Access
DROP POLICY IF EXISTS "Public Read Access for evidence-assets" ON storage.objects;
CREATE POLICY "Public Read Access for evidence-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evidence-assets');

-- Admin Insert/Upload Access
DROP POLICY IF EXISTS "Admin Upload Access for evidence-assets" ON storage.objects;
CREATE POLICY "Admin Upload Access for evidence-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidence-assets' AND
    (SELECT private.is_admin())
  );

-- Admin Update Access
DROP POLICY IF EXISTS "Admin Update Access for evidence-assets" ON storage.objects;
CREATE POLICY "Admin Update Access for evidence-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'evidence-assets' AND
    (SELECT private.is_admin())
  );

-- Admin Delete Access
DROP POLICY IF EXISTS "Admin Delete Access for evidence-assets" ON storage.objects;
CREATE POLICY "Admin Delete Access for evidence-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidence-assets' AND
    (SELECT private.is_admin())
  );

-- 4. Seed dữ liệu case_000
-- 4.1. Cập nhật panorama / scene_360 cho case_000
UPDATE public.cases
SET
  panorama_url = '/images/cases/case_000/PANORAMA.png',
  scene_360_url = '/images/cases/case_000/crime_scene_360.jpg'
WHERE slug = 'case_000';

-- 4.2. Seed chứng cứ case_000
INSERT INTO public.case_evidence (
  case_slug,
  code,
  title,
  kind,
  file_url,
  thumb_url,
  phase,
  description,
  slot_index,
  metadata
)
VALUES
  -- 1 PDF khởi đầu
  (
    'case_000',
    '00-HD',
    '00. Cẩm nang hướng dẫn điều tra ban đầu',
    'pdf',
    '/documents/case_000/00_khoi_dau/00_huong_dan_ban_dau.pdf',
    NULL,
    0,
    'Cẩm nang nghiệp vụ điều tra hiện trường, quy trình khám nghiệm và đối chiếu lời khai.',
    5,
    '{"id": "pdf-00-hd"}'::jsonb
  ),
  -- 7 Vật chứng & Ảnh hiện trường
  (
    'case_000',
    'p1',
    'p1. Ảnh hiện trường phòng khách & bộ bình trà vỡ',
    'photo',
    '/photo_scene_overview.jpg',
    '/photo_scene_overview.jpg',
    0,
    'Hiện trường phòng khách xáo trộn, bộ bình trà thủy tinh pha hoa cúc bị vỡ vụn trên sàn gạch.',
    21,
    '{"id": "ev-p1", "evidenceId": "EV-SCENE-OVERVIEW", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "20:00", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p3',
    'p3. Mảnh thủy tinh 8.2cm dính máu (Hung khí)',
    'photo',
    '/photo_glass_shard.jpg',
    '/photo_glass_shard.jpg',
    0,
    'Mảnh vỡ bình trà sắc nhọn 8.2cm dính vết máu khô và dấu vân tay miết trượt (vật chứng đâm đứt động mạch cảnh).',
    22,
    '{"id": "ev-p3", "evidenceId": "EV-GLASS-SHARD", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "21:00", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p4',
    'p4. Khung ảnh kỷ niệm xóm Bờ Sông hè 1996 bị vỡ kính',
    'photo',
    '/images/cases/case_000/trontim.jpg',
    '/images/cases/case_000/trontim.jpg',
    0,
    'Bức ảnh chụp kỷ niệm xóm Bờ Sông hè 1996: Khang ngỗ ngược, Tùng (sẹo chữ V lông mày), bé Huy nhỏ thó đeo còi đồng nép sau lưng Tùng, bé Hà váy hoa và bé Mai được ông bế.',
    23,
    '{"id": "ev-p4", "evidenceId": "EV-CHILDHOOD-BROKEN-FRAME", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "20:00", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p10',
    'p10. Ảnh chụp màn hình ứng dụng đặt xe ôm của Vũ',
    'photo',
    '/images/cases/case_000/cuong_ve_xe_tung.png',
    '/images/cases/case_000/cuong_ve_xe_tung.png',
    0,
    'Lệnh đặt xe ôm của Vũ lúc 19:25:40, tài xế đón lúc 19:30:15 chạy ra Quán Bia 88.',
    24,
    '{"id": "ev-p10", "evidenceId": "EV-RIDE-VU", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "19:25", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p2',
    'p2. Ảnh hiện trường xấp Đơn tố cáo đòi đất 200m²',
    'photo',
    '/photo_scattered_docs.jpg',
    '/photo_scattered_docs.jpg',
    0,
    'Xấp Đơn tố cáo đòi lại đất của Mai văng vãi dưới sàn phòng khách, trên góc mép có dính 02 giọt máu khô (M1).',
    25,
    '{"id": "ev-p2", "evidenceId": "EV-SCATTERED-DOCS", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "18:50", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p5',
    'p5. Mẩu báo cũ 1996 về tai nạn ngạt khí tủ gỗ',
    'photo',
    '/photo_old_newspaper.jpg',
    '/photo_old_newspaper.jpg',
    2,
    'Trang nhật báo cắt năm 1996 đưa tin tai nạn ngạt khí tủ gỗ thương tâm của bé Gia Huy (7 tuổi) chiều 24/07/1996.',
    141,
    '{"id": "ev-p5", "evidenceId": "EV-OLD-NEWSPAPER", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "24/07/1996", "integrityStatus": "secured"}'::jsonb
  ),
  (
    'case_000',
    'p6',
    'p6. Ảnh chuỗi chat Khang & Thảo Vy hẹn trốn đi Đà Lạt',
    'photo',
    '/images/cases/case_000/photo_cheating_sms.jpg',
    '/images/cases/case_000/photo_cheating_sms.jpg',
    3,
    'Chuỗi tin nhắn trích xuất từ iPhone 6s Plus: Thảo Vy hẹn vé 06:15 sáng mai, Khang gom hơn 2 tỷ tiền mặt bỏ trốn và ruồng rẫy Hà.',
    161,
    '{"id": "ev-p6", "evidenceId": "EV-CHEATING-SMS", "recoveredBy": "ĐIỀU TRA VIÊN", "chainOfCustody": "VERIFIED", "timestamp": "17:55", "integrityStatus": "secured"}'::jsonb
  )
ON CONFLICT (case_slug, code) DO NOTHING;
