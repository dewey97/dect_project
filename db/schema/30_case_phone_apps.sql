-- ==============================================================================
-- 30. CASE PHONE APPS — Danh mục ứng dụng trên điện thoại theo vụ án
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.case_phone_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  app_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon_url TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  is_dock BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  unlock_checkpoint_id TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_slug, app_type)
);

CREATE INDEX IF NOT EXISTS idx_case_phone_apps_case
  ON public.case_phone_apps (case_slug, slot_index);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_phone_apps_updated_at ON public.case_phone_apps;
CREATE TRIGGER set_phone_apps_updated_at
  BEFORE UPDATE ON public.case_phone_apps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.case_phone_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phone_apps_read" ON public.case_phone_apps;
CREATE POLICY "phone_apps_read" ON public.case_phone_apps
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "phone_apps_write" ON public.case_phone_apps;
CREATE POLICY "phone_apps_write" ON public.case_phone_apps
  FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());
