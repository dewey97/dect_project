CREATE TABLE public.evidence_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('evidence', 'question')),
    position_x FLOAT8 NOT NULL,
    position_y FLOAT8 NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT,
    logic_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_nodes_case ON public.evidence_nodes(case_id);

ALTER TABLE public.evidence_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Nodes" ON public.evidence_nodes FOR ALL USING (true);
