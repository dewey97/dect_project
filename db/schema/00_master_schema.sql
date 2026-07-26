-- ==========================================
-- SCRIPT TẠO DATABASE (GỘP) - SUPABASE
-- Chạy toàn bộ script này trên SQL Editor
-- ==========================================

-- 1. BẢNG CASES (VỤ ÁN)
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
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Cases" ON public.cases FOR ALL USING (true);

-- 2. BẢNG EVIDENCE_NODES (THẺ TRÊN BẢNG)
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

-- 3. BẢNG EVIDENCE_EDGES (DÂY NỐI)
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

-- 4. BẢNG TIMELINE_EVENTS (DÒNG THỜI GIAN)
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

-- 5. BẢNG LOCATIONS (BẢN ĐỒ TƯƠNG TÁC)
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

-- 6. BẢNG PROFILES (NGƯỜI CHƠI)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Profiles" ON public.profiles FOR ALL USING (true);

-- 7. BẢNG PLAY_SESSIONS (TIẾN TRÌNH CHƠI)
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

-- 8. BẢNG PLAYER_ANSWERS (TIẾN TRÌNH CHI TIẾT / MỞ KHÓA BẰNG CHỨNG)
CREATE TABLE public.player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.play_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES public.evidence_nodes(id) ON DELETE CASCADE,
    submitted_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, node_id)
);
CREATE INDEX idx_player_answers_session ON public.player_answers(session_id);
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Actions for Answers" ON public.player_answers FOR ALL USING (true);
