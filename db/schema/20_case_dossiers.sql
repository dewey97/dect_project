-- Migration: 20_case_dossiers.sql
-- Quản lý danh mục các Bộ Hồ Sơ theo vụ án và danh sách mã tài liệu/vật chứng thuộc mỗi bộ.

CREATE TABLE IF NOT EXISTS case_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL DEFAULT 'case_000',
  dossier_key TEXT NOT NULL,
  title TEXT NOT NULL,
  document_codes TEXT[] NOT NULL DEFAULT '{}',
  flow_position JSONB DEFAULT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, dossier_key)
);

CREATE INDEX IF NOT EXISTS idx_case_dossiers_case_id ON case_dossiers (case_id);

ALTER TABLE case_dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read case_dossiers" ON case_dossiers;
CREATE POLICY "Public read case_dossiers" ON case_dossiers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update case_dossiers" ON case_dossiers;
CREATE POLICY "Public insert/update case_dossiers" ON case_dossiers
  FOR ALL USING (true) WITH CHECK (true);

-- Seed initial dossiers for case_000 if not present
INSERT INTO case_dossiers (case_id, dossier_key, title, document_codes, description)
VALUES
  ('case_000', 'ban_dau', 'Ban Đầu', ARRAY['A-01', 'A-04', 'A-05', 'A-06'], 'Hồ sơ khám nghiệm hiện trường và thu giữ tử thi ban đầu'),
  ('case_000', 'bo_a', 'Bộ A', ARRAY['A-03', 'A-13', 'A-14', 'A-15', 'A-16', 'A-17', 'A-19', 'A-20', 'A-21'], 'Hồ sơ lời khai và lý lịch nghi vấn giai đoạn 1 (Vũ, Mai, Hà, Lụa, Tiến)'),
  ('case_000', 'bo_b', 'Bộ B', ARRAY['B-01', 'B-02', 'B-04', 'B-05', 'E-01', 'E-02', 'E-03', 'E-04'], 'Hồ sơ đối chất và lời khai nghi vấn giai đoạn 2 (Tùng, Đạt Gà, Quán Bia 88)'),
  ('case_000', 'bo_c', 'Bộ C', ARRAY['C-01', 'C-02', 'D-02', 'D-04', 'D-05', 'D-12', 'D-13', 'D-14'], 'Hồ sơ vật chứng vi mô, hộp thiếc mật và tài liệu bổ sung (Hà, Vy, Lan, Bình)'),
  ('case_000', 'ket_luan', 'Kết Luận', ARRAY['KL-01', 'HA-01', 'HA-02', 'HA-03'], 'Bản cáo trạng truy tố và các tài liệu hậu án')
ON CONFLICT (case_id, dossier_key) DO UPDATE
SET
  title = EXCLUDED.title,
  document_codes = EXCLUDED.document_codes,
  description = EXCLUDED.description;
