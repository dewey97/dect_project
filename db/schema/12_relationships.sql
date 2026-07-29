-- 12. BẢNG RELATIONSHIPS (MA TRẬN QUAN HỆ NHÂN VẬT)
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    character_1_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    character_2_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    relation_type TEXT DEFAULT 'Giao thiệp' NOT NULL,
    affinity_score INT DEFAULT 0 CHECK (affinity_score >= -100 AND affinity_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, character_1_id, character_2_id)
);
CREATE INDEX IF NOT EXISTS idx_relationships_case ON public.relationships(case_id);
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Relationships" ON public.relationships FOR ALL USING (true);
