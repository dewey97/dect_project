CREATE TABLE public.evidence_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_edges_case ON public.evidence_edges(case_id);

ALTER TABLE public.evidence_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Edges" ON public.evidence_edges FOR ALL USING (true);
