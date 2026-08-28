-- 10. BẢNG CHARACTERS (NHÂN VẬT TRONG VỤ ÁN)
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'SUSPECT' CHECK (role IN ('VICTIM', 'KILLER', 'SUSPECT', 'WITNESS', 'DETECTIVE')),
    avatar_url TEXT,
    is_global BOOLEAN DEFAULT false,
    position_x FLOAT8 DEFAULT 0 NOT NULL,
    position_y FLOAT8 DEFAULT 0 NOT NULL,
    -- Bộ Ba Thuộc Tính Bản Chất (Gộp từ truth_profiles cũ)
    real_motive TEXT,
    real_alibi TEXT,
    red_herring_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, name)
);
CREATE INDEX IF NOT EXISTS idx_characters_case ON public.characters(case_id);
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Characters" ON public.characters FOR ALL USING (true);
