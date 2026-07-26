CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    synopsis TEXT,
    full_story TEXT,
    difficulty SMALLINT DEFAULT 1,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED')),
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security để chuẩn bị phân quyền
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Cases" ON public.cases FOR ALL USING (true);
