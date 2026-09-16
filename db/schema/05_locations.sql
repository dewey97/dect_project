CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('CASE', 'LOCATION', 'EVIDENCE')),
    details TEXT,
    position_x FLOAT8 NOT NULL,
    position_y FLOAT8 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_case ON public.locations(case_id);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Locations" ON public.locations FOR ALL USING (true);
