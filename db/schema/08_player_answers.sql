CREATE TABLE public.player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.play_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES public.evidence_nodes(id) ON DELETE CASCADE,
    submitted_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, node_id) -- Mỗi session chỉ ghi nhận trạng thái của 1 node một lần (hoặc ghi đè)
);

CREATE INDEX idx_player_answers_session ON public.player_answers(session_id);

ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Answers" ON public.player_answers FOR ALL USING (true);
