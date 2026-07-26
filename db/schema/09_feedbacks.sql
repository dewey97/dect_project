-- Table: feedbacks
CREATE TABLE public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('BUG', 'TYPO', 'FEEDBACK', 'RATING', 'OTHER')),
    rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 5),
    content TEXT,
    contact_info TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Bất kỳ ai cũng có thể INSERT (Gửi feedback ẩn danh)
CREATE POLICY "Cho phép tất cả mọi người gửi feedback" 
ON public.feedbacks 
FOR INSERT 
WITH CHECK (true);

-- Policy: Chỉ ai có quyền (Admin) mới được SELECT, UPDATE, DELETE
-- Tạm thời cho phép tất cả SELECT/UPDATE ở môi trường dev, 
-- sau này đấu nối Auth sẽ sửa lại bằng `auth.uid() = admin_id`
CREATE POLICY "Cho phép đọc feedback" 
ON public.feedbacks 
FOR SELECT 
USING (true);

CREATE POLICY "Cho phép cập nhật feedback" 
ON public.feedbacks 
FOR UPDATE 
USING (true);
