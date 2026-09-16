CREATE TABLE public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    character_name TEXT NOT NULL,
    event_title TEXT NOT NULL,
    location TEXT,
    start_min INT NOT NULL,
    end_min INT NOT NULL,
    is_truth BOOLEAN DEFAULT true,
    is_fatal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_case ON public.timeline_events(case_id);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Timeline" ON public.timeline_events FOR ALL USING (true);
