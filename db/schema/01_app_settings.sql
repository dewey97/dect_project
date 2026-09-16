-- TẠO BẢNG CẤU HÌNH HỆ THỐNG
CREATE TABLE public.app_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Đảm bảo chỉ có 1 dòng duy nhất
    maintenance_mode BOOLEAN DEFAULT false,
    banner_active BOOLEAN DEFAULT true,
    banner_text TEXT DEFAULT '🚀 Chào mừng đến với Dect Project - Studio đang trong giai đoạn Alpha Test!',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BẬT ROW LEVEL SECURITY
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- CHO PHÉP ĐỌC TẤT CẢ (Vì Landing Page cần đọc public)
CREATE POLICY "Allow public read access for settings" ON public.app_settings FOR SELECT USING (true);

-- CHO PHÉP GHI TẤT CẢ (Để dev dễ dàng, sau này giới hạn role admin)
CREATE POLICY "Allow all update for settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow all insert for settings" ON public.app_settings FOR INSERT WITH CHECK (true);

-- TẠO SẴN 1 DÒNG MẶC ĐỊNH KHI KHỞI TẠO
INSERT INTO public.app_settings (id, maintenance_mode, banner_active, banner_text) 
VALUES (1, false, true, '🚀 Mật vụ đầu tiên "Mật danh Cú Đêm" sẽ sớm ra mắt!');
