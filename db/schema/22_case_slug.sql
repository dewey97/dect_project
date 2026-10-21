-- ==============================================================================
-- 22. CASE SLUG — mã định danh vụ án thống nhất (`case_000`, `case_001`, ...)
-- ==============================================================================
-- Trước migration này:
--   * `cases.id` là UUID, còn nội dung vụ án (`case_checkpoints`, `case_dossiers`,
--     `dossier_documents`) dùng TEXT `case_000` và không liên kết với `cases`.
--   * App tự đoán `case_00N` bằng cách đếm số dòng `cases` ⇒ trùng mã khi xóa vụ.
-- Sau migration:
--   * `cases.slug` là khóa nghiệp vụ duy nhất, DB tự cấp khi INSERT không truyền slug.
--   * Nội dung vụ án tham chiếu `cases.slug` (ON UPDATE CASCADE, ON DELETE RESTRICT).
-- Chưa gắn FK cho `boardgame_pins` / `boardgame_connections` vì dữ liệu cũ còn
-- `case-000`; code đọc cả hai dạng và ghi dạng chuẩn.
-- ==============================================================================

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE public.cases SET slug = 'case_000'
WHERE id = '7edde065-c9ea-4f41-875e-5526a29f5804' AND slug IS NULL;

-- Cấp slug tuần tự cho các vụ còn lại theo thứ tự tạo.
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS n
  FROM public.cases WHERE slug IS NULL
)
UPDATE public.cases c
SET slug = 'case_' || lpad(n::text, 3, '0')
FROM numbered WHERE c.id = numbered.id;

CREATE OR REPLACE FUNCTION public.assign_case_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    SELECT 'case_' || lpad(
      (COALESCE(MAX(substring(slug FROM '^case_([0-9]+)$')::int), -1) + 1)::text,
      3, '0')
    INTO NEW.slug
    FROM public.cases;
  END IF;
  NEW.slug := lower(btrim(NEW.slug));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_case_slug ON public.cases;
CREATE TRIGGER trg_assign_case_slug
  BEFORE INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.assign_case_slug();

ALTER TABLE public.cases ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_slug_key;
ALTER TABLE public.cases ADD CONSTRAINT cases_slug_key UNIQUE (slug);
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_slug_format;
ALTER TABLE public.cases ADD CONSTRAINT cases_slug_format
  CHECK (slug ~ '^[a-z0-9_]{1,64}$');

-- Nội dung vụ án tham chiếu slug.
ALTER TABLE public.case_checkpoints DROP CONSTRAINT IF EXISTS case_checkpoints_case_slug_fkey;
ALTER TABLE public.case_checkpoints ADD CONSTRAINT case_checkpoints_case_slug_fkey
  FOREIGN KEY (case_id) REFERENCES public.cases(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.case_dossiers DROP CONSTRAINT IF EXISTS case_dossiers_case_slug_fkey;
ALTER TABLE public.case_dossiers ADD CONSTRAINT case_dossiers_case_slug_fkey
  FOREIGN KEY (case_id) REFERENCES public.cases(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.dossier_documents DROP CONSTRAINT IF EXISTS dossier_documents_case_slug_fkey;
ALTER TABLE public.dossier_documents ADD CONSTRAINT dossier_documents_case_slug_fkey
  FOREIGN KEY (case_id) REFERENCES public.cases(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;
