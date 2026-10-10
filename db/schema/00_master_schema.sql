-- ====================================================================
-- MASTER SCHEMA (5 CORE TABLES) - SUPABASE POSTGRESQL
-- Hệ thống điều tra trinh thám (dect_project)
-- Kịch bản & vật chứng quản lý tại Google Sheets Live CMS
-- ====================================================================

-- 1. BẢNG CASES (DANH MỤC VỤ ÁN)
CREATE TABLE IF NOT EXISTS public.cases (
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

-- 2. BẢNG PROFILES (NGƯỜI DÙNG & PHÂN QUYỀN)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. BẢNG PLAY_SESSIONS (PHIÊN CHƠI CỦA TÀI KHOẢN)
CREATE TABLE IF NOT EXISTS public.play_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PLAYING' CHECK (status IN ('PLAYING', 'COMPLETED', 'ABANDONED')),
    score INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_play_sessions_player ON public.play_sessions(player_id);
ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for Authenticated" ON public.play_sessions FOR ALL USING (auth.role() = 'authenticated');

-- 4. BẢNG FEEDBACKS (GÓP Ý & BÁO LỖI TỪ NGƯỜI CHƠI)
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT DEFAULT 'case_000',
    type TEXT DEFAULT 'FEEDBACK' CHECK (type IN ('BUG', 'TYPO', 'FEEDBACK', 'RATING', 'OTHER')),
    rating_score INT,
    content TEXT,
    contact_info TEXT,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Public Insert Feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Admins Read/Update Feedbacks" ON public.feedbacks FOR ALL USING (true);

-- 5. BẢNG APP_SETTINGS (CẤU HÌNH TOÀN CỤC & BANNER)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    maintenance_mode BOOLEAN DEFAULT false,
    banner_active BOOLEAN DEFAULT true,
    banner_text TEXT DEFAULT '🚀 Chào mừng đến với Dect Project!',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Read App Settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow Admin Update App Settings" ON public.app_settings FOR UPDATE USING (true);

-- Khởi tạo dòng cấu hình mặc định (id = 1)
INSERT INTO public.app_settings (id, maintenance_mode, banner_active, banner_text)
VALUES (1, false, true, '🚀 Chào mừng đến với Dect Project!')
ON CONFLICT (id) DO NOTHING;
