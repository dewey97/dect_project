CREATE TABLE public.play_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PLAYING' CHECK (status IN ('PLAYING', 'COMPLETED', 'ABANDONED')),
    score INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(player_id, case_id)
);

CREATE INDEX idx_play_sessions_player ON public.play_sessions(player_id);
CREATE INDEX idx_play_sessions_case ON public.play_sessions(case_id);

ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Sessions" ON public.play_sessions FOR ALL USING (true);
