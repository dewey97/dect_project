-- ==============================================================================
-- 37. RE-SEED ALL CASE_000 DATA FROM GOOGLE SHEETS (replaces hardcoded data)
-- Generated: 2026-10-24T08:29:10.223Z
-- ==============================================================================

BEGIN;

-- 1. case_evidence: 54 records from Sheet tab "evidences"
DELETE FROM public.case_evidence WHERE case_slug = 'case_000';
INSERT INTO public.case_evidence (case_slug, code, title, kind, file_url, thumb_url, phase, description, slot_index, metadata) VALUES
  ('case_000', 'A-01', 'Cẩm nang hướng dẫn điều tra ban đầu', 'pdf', NULL, NULL, 0, 'Quy trình tiếp nhận án mạng, hướng dẫn phân tích hiện trường và kiểm tra vật chứng.', 0, '{"original_code":"A-01"}'),
  ('case_000', 'A-02', 'Phiếu tiếp nhận tin báo tội phạm (06:45)', 'pdf', NULL, NULL, 0, 'Nguyễn Văn Khang, sinh 04/08/1988 (PIN máy: 0408), nghề nghiệp tự do cho vay nặng lãi.', 1, '{"original_code":"A-02"}'),
  ('case_000', 'A-04', 'Báo cáo Khám nghiệm tử thi', 'pdf', NULL, NULL, 0, 'Quyết định khởi tố vụ án giết người tại số 14 Đường Bờ Sông.', 3, '{"original_code":"A-04"}'),
  ('case_000', 'A-05', 'Biên bản khám nghiệm hiện trường ban đầu', 'pdf', NULL, NULL, 0, 'Hiện trường phòng khách xáo trộn, ấm trà hoa cúc vỡ vụn dính máu, cửa sau khép hờ.', 4, '{"original_code":"A-05"}'),
  ('case_000', 'A-06', 'Ảnh hiện trường ban đầu', 'photo', 'https://drive.google.com/file/d/12hl7u7c9VY02fu8ax3YRgAaiJg-DhE4_/view?usp=sharing', 'https://drive.google.com/file/d/12hl7u7c9VY02fu8ax3YRgAaiJg-DhE4_/view?usp=sharing', 0, NULL, 5, '{"original_code":"A-06"}'),
  ('case_000', 'A-07', 'Ảnh xấp Đơn đòi đất văng trên sàn', 'photo', NULL, NULL, 0, 'Xấp đơn đòi đất dính giọt máu khô M1 rơi trên sàn gạch.', 6, '{"original_code":"A-07"}'),
  ('case_000', 'A-08', 'Ảnh miếng bình vỡ', 'photo', NULL, NULL, 0, NULL, 7, '{"original_code":"A-08"}'),
  ('case_000', 'A-09', 'Ảnh dấu vân tay trên khung ảnh', 'photo', NULL, NULL, 0, NULL, 8, '{"original_code":"A-09"}'),
  ('case_000', 'A-10', 'Bức ảnh năm xưa', 'photo', NULL, NULL, 0, NULL, 9, '{"original_code":"A-10"}'),
  ('case_000', 'ev-10', 'Điện thoại nạn nhân Khang (iPhone 6s Plus)', 'photo', NULL, NULL, 0, 'Thu giữ tại hiện trường. Chứa Call Log 3 SĐT ẩn danh, Voicemail 20:32:15 lọt còi tàu và chat trốn đi Đà Lạt.', 10, '{}'),
  ('case_000', 'A-11', 'Trích đoạn bài báo cũ năm 1996', 'pdf', NULL, NULL, 0, 'Nhật báo 24/07/1996 đưa tin cái chết ngạt của bé Gia Huy trong tủ gỗ khi chơi trốn tìm.', 11, '{"original_code":"A-11"}'),
  ('case_000', 'A-12', 'Sổ ghi nợ ', 'pdf', NULL, NULL, 0, 'Trang sổ tay ghi nợ: Lê Quang Vũ (Lệch Pha) nợ 300 triệu; Đạt Gà nợ 80 triệu.', 12, '{"original_code":"A-12"}'),
  ('case_000', 'A-18', 'Ảnh chụp màn hình App đặt xe của Vũ', 'photo', NULL, NULL, 0, 'Lịch sử chuyến xe: đặt 19:25:40, tài xế đón 19:30:15 đưa Vũ ra Quán Bia 88.', 18, '{"original_code":"A-18"}'),
  ('case_000', 'A-22', 'Biên bản xác minh nhật ký cuộc gọi', 'pdf', NULL, NULL, 0, 'Tổng hợp cuộc gọi đến/đi từ tổng đài viễn thông số máy Khang đêm 24/07.', 22, '{"original_code":"A-22"}'),
  ('case_000', 'A-23', 'Bảng tin dân cư rao vặt ngõ 14', 'photo', NULL, NULL, 0, 'Mẩu tin dịch vụ đục phá bê tông 0912.331.888 / 0984.180.357 & Thông báo đứt cáp TV 20:10.', 23, '{"original_code":"A-23"}'),
  ('case_000', 'B-03', 'Sổ thu chi', 'photo', NULL, NULL, 1, NULL, 30, '{"original_code":"B-03"}'),
  ('case_000', 'C-01', 'Ảnh trạm tàu ngoài cửa sổ', 'photo', NULL, NULL, 2, NULL, 32, '{"original_code":"C-01"}'),
  ('case_000', 'C-02', 'Ảnh hoa xoan trên sàn nhà', 'photo', 'https://drive.google.com/file/d/1CiQT5e5fYYiDg48fXUk4Oe036WZlWi_z/view?usp=drive_link', 'https://drive.google.com/file/d/1CiQT5e5fYYiDg48fXUk4Oe036WZlWi_z/view?usp=drive_link', 2, NULL, 33, '{"original_code":"C-02"}'),
  ('case_000', 'C-03', 'Ảnh lược dính tóc', 'photo', 'https://drive.google.com/file/d/1FsopgkatQllpT9-r9af8ttHQ_V0Lrroe/view?usp=drive_link', 'https://drive.google.com/file/d/1FsopgkatQllpT9-r9af8ttHQ_V0Lrroe/view?usp=drive_link', 2, NULL, 34, '{"original_code":"C-03"}'),
  ('case_000', 'C-04', 'Ảnh bùa yêu dưới gối', 'photo', 'https://drive.google.com/file/d/11rPmlApf5TsTDguEOBKQBqL09SIks8eU/view?usp=drive_link', 'https://drive.google.com/file/d/11rPmlApf5TsTDguEOBKQBqL09SIks8eU/view?usp=drive_link', 2, NULL, 35, '{"original_code":"C-04"}'),
  ('case_000', 'C-05', 'Ảnh tủ gỗ nhà Khang', 'photo', 'https://drive.google.com/file/d/1BFoeURAu_ByUfOKUGttoXfxdAGHIrnuR/view?usp=drive_link', 'https://drive.google.com/file/d/1BFoeURAu_ByUfOKUGttoXfxdAGHIrnuR/view?usp=drive_link', 2, NULL, 36, '{"original_code":"C-05"}'),
  ('case_000', 'D-01', 'Biên bản khám xét nhà ở Trần Thị Hà', 'photo', NULL, NULL, 3, NULL, 37, '{"original_code":"D-01"}'),
  ('case_000', 'D-02', 'Ảnh hộp sắt', 'photo', 'https://drive.google.com/file/d/1ukceiesKmAyfGTkAGwP-5k3XMev9AV_b/view?usp=drive_link', 'https://drive.google.com/file/d/1ukceiesKmAyfGTkAGwP-5k3XMev9AV_b/view?usp=drive_link', 3, NULL, 38, '{"original_code":"D-02"}'),
  ('case_000', 'D-03', 'Ảnh áo gió', 'photo', NULL, NULL, 3, NULL, 39, '{"original_code":"D-03"}'),
  ('case_000', 'D-04', 'Ảnh lọn tóc', 'photo', 'https://drive.google.com/file/d/1ol_USfhFCBUG-2PwXvMWn0Gqch9bEOrK/view?usp=drive_link', 'https://drive.google.com/file/d/1ol_USfhFCBUG-2PwXvMWn0Gqch9bEOrK/view?usp=drive_link', 3, NULL, 40, '{"original_code":"D-04"}'),
  ('case_000', 'D-05', 'Ảnh kéo bấm', 'photo', 'https://drive.google.com/file/d/1RDvA6-qFnEjrWZmGscj-wtwHCGX25kH3/view?usp=drive_link', 'https://drive.google.com/file/d/1RDvA6-qFnEjrWZmGscj-wtwHCGX25kH3/view?usp=drive_link', 3, NULL, 41, '{"original_code":"D-05"}'),
  ('case_000', 'D-06', 'Ảnh bùa yêu', 'photo', 'https://drive.google.com/file/d/1i78D3-On8x3tYK4Uc2EtSEK-kwPnM77Y/view?usp=drive_link', 'https://drive.google.com/file/d/1i78D3-On8x3tYK4Uc2EtSEK-kwPnM77Y/view?usp=drive_link', 3, NULL, 42, '{"original_code":"D-06"}'),
  ('case_000', 'avatar_khang', 'Ảnh chân dung Nguyễn Văn Khang', 'photo', 'https://drive.google.com/file/d/1mPAJrCPdTQfaBL95AZLKhw0HWR3pwwk7/view?usp=sharing', 'https://drive.google.com/file/d/1mPAJrCPdTQfaBL95AZLKhw0HWR3pwwk7/view?usp=sharing', 0, 'Nạn nhân vụ án', 43, '{"pin_on_board":true,"original_code":"avatar_khang"}'),
  ('case_000', 'avatar_mai', 'Ảnh chân dung Nguyễn Ngọc Mai', 'photo', 'https://drive.google.com/file/d/1PoGlB98AO6jeLb6TJYEKHSIWj9HLOv5u/view?usp=drive_link', 'https://drive.google.com/file/d/1PoGlB98AO6jeLb6TJYEKHSIWj9HLOv5u/view?usp=drive_link', 0, 'Em họ nạn nhân Khang', 44, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_mai"}'),
  ('case_000', 'avatar_vu', 'Ảnh chân dung Lê Quang Vũ', 'photo', 'https://drive.google.com/file/d/1p2iTi-nTJzV1tX78Xc1iLUdWzA44TSH2/view?usp=drive_link', 'https://drive.google.com/file/d/1p2iTi-nTJzV1tX78Xc1iLUdWzA44TSH2/view?usp=drive_link', 0, 'Chồng của Mai / Kỹ sư điện', 45, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_vu"}'),
  ('case_000', 'avatar_tung', 'Ảnh chân dung Nguyễn Thanh Tùng', 'photo', 'https://drive.google.com/file/d/1e7q8IfpxjUenEubpfBo8QvYtyQWzJZJo/view?usp=drive_link', 'https://drive.google.com/file/d/1e7q8IfpxjUenEubpfBo8QvYtyQWzJZJo/view?usp=drive_link', 0, 'Thợ nề / Bạn thời thơ ấu', 46, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_tung"}'),
  ('case_000', 'avatar_ha', 'Ảnh chân dung Trần Thị Hà', 'photo', 'https://drive.google.com/file/d/1FCt-oKG1SGz6NskaULlP3p1UK8kWuQJm/view?usp=drive_link', 'https://drive.google.com/file/d/1FCt-oKG1SGz6NskaULlP3p1UK8kWuQJm/view?usp=drive_link', 0, 'Kế toán / Bạn gái Khang', 47, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_ha"}'),
  ('case_000', 'avatar_lua', 'Ảnh chân dung Bà Nguyễn Thị Lụa', 'photo', 'https://drive.google.com/file/d/1aUxMRCdOmivCMLlNLLUWYwRgBx9jxprA/view?usp=drive_link', 'https://drive.google.com/file/d/1aUxMRCdOmivCMLlNLLUWYwRgBx9jxprA/view?usp=drive_link', 0, 'Hàng xóm / Người phát hiện thi thể', 48, '{"original_code":"avatar_lua"}'),
  ('case_000', 'avatar_dat', 'Ảnh chân dung Trần Văn Đạt', 'photo', 'https://drive.google.com/file/d/11udVUD8fpXnLB2o5BHRnuvLb5uKAruw9/view?usp=drive_link', 'https://drive.google.com/file/d/11udVUD8fpXnLB2o5BHRnuvLb5uKAruw9/view?usp=drive_link', 0, 'Tiểu thương Chợ Cảng', 49, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_dat"}'),
  ('case_000', 'avatar_vy', 'Ảnh chân dung Nguyễn Thảo Vy', 'photo', 'https://drive.google.com/file/d/1u5yPxYaOrQYK25d8kt-CBYbOdniYf1fy/view?usp=drive_link', 'https://drive.google.com/file/d/1u5yPxYaOrQYK25d8kt-CBYbOdniYf1fy/view?usp=drive_link', 0, 'Nhân tình của Khang', 50, '{"is_suspect":true,"pin_on_board":true,"original_code":"avatar_vy"}'),
  ('case_000', 'avatar_huy', 'Ảnh bé Nguyễn Gia Huy (1996)', 'photo', NULL, NULL, 0, 'Em trai của Tùng', 51, '{"original_code":"avatar_huy"}'),
  ('case_000', 'avatar_tien', 'Ảnh Nguyễn Thanh Tiến', 'photo', 'https://drive.google.com/file/d/1eoxkju6mYi8k1ejsRtDBic61PCR43pC0/view?usp=drive_link', 'https://drive.google.com/file/d/1eoxkju6mYi8k1ejsRtDBic61PCR43pC0/view?usp=drive_link', 0, 'Bố của Tùng', 52, '{"original_code":"avatar_tien"}'),
  ('case_000', 'crime_scene', 'Hiện trường thi thể (Chalk Outline)', 'photo', 'https://drive.google.com/file/d/12hl7u7c9VY02fu8ax3YRgAaiJg-DhE4_/view?usp=sharing', 'https://drive.google.com/file/d/12hl7u7c9VY02fu8ax3YRgAaiJg-DhE4_/view?usp=sharing', 0, 'Vị trí ngã của nạn nhân trên sàn gạch', 53, '{"original_code":"crime_scene"}')
ON CONFLICT (case_slug, code) DO UPDATE SET
  title = EXCLUDED.title, kind = EXCLUDED.kind, file_url = EXCLUDED.file_url,
  thumb_url = EXCLUDED.thumb_url, phase = EXCLUDED.phase, description = EXCLUDED.description,
  slot_index = EXCLUDED.slot_index, metadata = EXCLUDED.metadata, updated_at = NOW();

-- 2. phone_contacts: 39 records from Sheet tab "contacts" (3 skipped, empty name)
DELETE FROM public.phone_contacts WHERE case_slug = 'case_000';
INSERT INTO public.phone_contacts (case_slug, contact_id, name, display_name, phone_number, category, note, is_saved, avatar_url, is_suspicious, slot_index) VALUES
  ('case_000', 'C01', 'Anh Dũng Cầu Cảng', 'Anh Dũng Cầu Cảng', '0903.445.112', NULL, NULL, true, NULL, false, 0),
  ('case_000', 'C02', 'Anh Hùng Sửa Nước', 'Anh Hùng Sửa Nước', '0988.665.123', NULL, NULL, true, NULL, false, 1),
  ('case_000', 'C03', 'Bác Bảy', 'Bác Bảy', '0908.441.229', NULL, NULL, true, NULL, false, 2),
  ('case_000', 'C04', 'Bà Hai', 'Bà Hai', '0913.552.771', NULL, NULL, true, NULL, false, 3),
  ('case_000', 'C05', 'Bảo Xăm Hình', 'Bảo Xăm Hình', '0934.112.887', NULL, NULL, true, NULL, false, 4),
  ('case_000', 'C06', 'Bé My', 'Bé My', '0971.223.445', NULL, NULL, true, NULL, false, 5),
  ('case_000', 'C07', 'Bình Còi Ba Gác', 'Bình Còi Ba Gác', '0915.223.789', 'CLUE', NULL, true, NULL, false, 6),
  ('case_000', 'C08', 'Chị Hạnh Giặt Là', 'Chị Hạnh Giặt Là', '0914.556.789', NULL, NULL, true, NULL, false, 7),
  ('case_000', 'C09', 'Chị Lan Quán Nước', 'Chị Lan Quán Nước', '0932.889.102', 'CLUE', NULL, true, NULL, false, 8),
  ('case_000', 'C10', 'Chú Sáu Xe Ôm', 'Chú Sáu Xe Ôm', '0913.667.228', NULL, NULL, true, NULL, false, 9),
  ('case_000', 'C11', 'Cô Mai Thuốc Tây', 'Cô Mai Thuốc Tây', '0962.771.889', NULL, NULL, true, NULL, false, 10),
  ('case_000', 'C12', 'Cô Sáu', 'Cô Sáu', '0972.334.881', NULL, NULL, true, NULL, false, 11),
  ('case_000', 'C13', 'Cơm Chị Ba', 'Cơm Chị Ba', '0908.334.991', NULL, NULL, true, NULL, false, 12),
  ('case_000', 'C14', 'Cường Mũi Két', 'Cường Mũi Két', '0973.665.412', NULL, NULL, true, NULL, false, 13),
  ('case_000', 'C15', 'Dũng Lò Mổ', 'Dũng Lò Mổ', '0904.778.221', NULL, NULL, true, NULL, false, 14),
  ('case_000', 'C16', 'Duy Bida 88', 'Duy Bida 88', '0916.334.556', NULL, NULL, true, NULL, false, 15),
  ('case_000', 'C17', 'Đức Cầm Đồ', 'Đức Cầm Đồ', '0909.882.114', NULL, NULL, true, NULL, false, 16),
  ('case_000', 'C18', 'Giang Bến Xe', 'Giang Bến Xe', '0938.221.776', NULL, NULL, true, NULL, false, 17),
  ('case_000', 'C19', 'Hà', 'Hà', '0984.112.568', 'CLUE', NULL, true, NULL, false, 18),
  ('case_000', 'C20', 'Hải Lác Bến Phà', 'Hải Lác Bến Phà', '0918.776.543', NULL, NULL, true, NULL, false, 19),
  ('case_000', 'C21', 'Hoàng Cắt Tóc', 'Hoàng Cắt Tóc', '0948.332.115', NULL, NULL, true, NULL, false, 20),
  ('case_000', 'C22', 'Hùng Đen Cửu Vạn', 'Hùng Đen Cửu Vạn', '0936.445.882', NULL, NULL, true, NULL, false, 21),
  ('case_000', 'C23', 'Khánh Rồng', 'Khánh Rồng', '0905.112.334', NULL, NULL, true, NULL, false, 22),
  ('case_000', 'C24', 'Linh Nail', 'Linh Nail', '0975.667.889', NULL, NULL, true, NULL, false, 23),
  ('case_000', 'C25', 'Long Sẹo', 'Long Sẹo', '0979.441.223', NULL, NULL, true, NULL, false, 24),
  ('case_000', 'C26', 'Minh Béo', 'Minh Béo', '0917.443.221', NULL, NULL, true, NULL, false, 25),
  ('case_000', 'C27', 'Nam Thợ Nề', 'Nam Thợ Nề', '0906.887.332', NULL, NULL, true, NULL, false, 26),
  ('case_000', 'C28', 'Ngọc Mai', 'Ngọc Mai', '0912.456.789', 'CLUE', NULL, true, NULL, false, 27),
  ('case_000', 'C29', 'Phương Đồ Gỗ', 'Phương Đồ Gỗ', '0933.556.112', NULL, NULL, true, NULL, false, 28),
  ('case_000', 'C30', 'Quân Lô Đề', 'Quân Lô Đề', '0982.441.667', NULL, NULL, true, NULL, false, 29),
  ('case_000', 'C31', 'Thảo Vy', 'Thảo Vy', '0978.552.109', 'CLUE', NULL, true, NULL, false, 30),
  ('case_000', 'C32', 'Thắng Sửa Xe', 'Thắng Sửa Xe', '0977.112.445', NULL, NULL, true, NULL, false, 31),
  ('case_000', 'C33', 'Thím Tư', 'Thím Tư', '0964.881.332', NULL, NULL, true, NULL, false, 32),
  ('case_000', 'C34', 'Tiến Bến Cảng', 'Tiến Bến Cảng', '0919.223.554', NULL, NULL, true, NULL, false, 33),
  ('case_000', 'C35', 'Tuấn Béo Xưởng Mộc', 'Tuấn Béo Xưởng Mộc', '0902.998.114', NULL, NULL, true, NULL, false, 34),
  ('case_000', 'C36', 'Tuấn Bia 88', 'Tuấn Bia 88', '0945.888.188', 'CLUE', NULL, true, NULL, false, 35),
  ('case_000', 'C37', 'Vinh Quán Nhậu', 'Vinh Quán Nhậu', '0907.334.221', NULL, NULL, true, NULL, false, 36),
  ('case_000', 'C38', 'Vũ', 'Vũ', '0967.452.183', 'CLUE', NULL, true, NULL, false, 37),
  ('case_000', 'C39', 'Yến Bún Đậu', 'Yến Bún Đậu', '0985.221.998', NULL, NULL, true, NULL, false, 38);

-- 3. phone_calls: 21 records from Sheet tab "calls"
DELETE FROM public.phone_calls WHERE case_slug = 'case_000';
INSERT INTO public.phone_calls (case_slug, code, contact_name, phone_number, call_type, timestamp, duration, audio_url, is_key_clue, clue_title, clue_analysis, slot_index) VALUES
  ('case_000', 'L01', 'Thảo Vy', '0984.180.357', 'INCOMING', '24/07/2016 20:23', NULL, NULL, false, NULL, NULL, 0),
  ('case_000', 'L02', '0984.180.357', '0984.180.357', 'INCOMING', '24/07/2016 19:46', NULL, NULL, false, NULL, NULL, 1),
  ('case_000', 'L03', '0912.331.888', '0912.331.888', 'INCOMING', '24/07/2016 19:03', NULL, NULL, false, NULL, NULL, 2),
  ('case_000', 'L04', '0988.200.991', '0988.200.991', 'OUTGOING', '24/07/2016 18:15', NULL, NULL, false, NULL, NULL, 3),
  ('case_000', 'L05', 'Bình Còi Ba Gác', '0915.223.789', 'INCOMING', '24/07/2016 18:00', NULL, NULL, false, NULL, NULL, 4),
  ('case_000', 'L06', 'Chị Lan Quán Nước', '0932.889.102', 'INCOMING', '24/07/2016 17:30', NULL, NULL, false, NULL, NULL, 5),
  ('case_000', 'L07', 'Bác Bảy', '0908.441.229', 'INCOMING', '24/07/2016 16:20', NULL, NULL, false, NULL, NULL, 6),
  ('case_000', 'L08', 'Thảo Vy', '0978.552.109', 'INCOMING', '24/07/2016 14:05', NULL, NULL, false, NULL, NULL, 7),
  ('case_000', 'L09', 'Cơm Chị Ba', '0908.334.991', 'OUTGOING', '24/07/2016 11:30', NULL, NULL, false, NULL, NULL, 8),
  ('case_000', 'L10', 'Chú Sáu Xe Ôm', '0913.667.228', 'OUTGOING', '24/07/2016 10:15', NULL, NULL, false, NULL, NULL, 9),
  ('case_000', 'L11', 'Thảo Vy', '0978.552.109', 'OUTGOING', '24/07/2016 08:45', NULL, NULL, false, NULL, NULL, 10),
  ('case_000', 'L12', 'Thảo Vy', '0978.552.109', 'INCOMING', '23/07/2016 21:40', NULL, NULL, false, NULL, NULL, 11),
  ('case_000', 'L13', 'Long Sẹo', '0979.441.223', 'OUTGOING', '23/07/2016 18:10', NULL, NULL, false, NULL, NULL, 12),
  ('case_000', 'L14', 'Cô Sáu', '0972.334.881', 'INCOMING', '23/07/2016 15:40', NULL, NULL, false, NULL, NULL, 13),
  ('case_000', 'L15', 'Thảo Vy', '0978.552.109', 'OUTGOING', '23/07/2016 12:15', NULL, NULL, false, NULL, NULL, 14),
  ('case_000', 'L16', 'Dũng Lò Mổ', '0904.778.221', 'OUTGOING', '23/07/2016 09:20', NULL, NULL, false, NULL, NULL, 15),
  ('case_000', 'L17', 'Thảo Vy', '0978.552.109', 'INCOMING', '22/07/2016 22:20', NULL, NULL, false, NULL, NULL, 16),
  ('case_000', 'L18', 'Hà', '0984.112.568', 'INCOMING', '22/07/2016 20:30', NULL, NULL, false, NULL, NULL, 17),
  ('case_000', 'L19', 'Thảo Vy', '0978.552.109', 'MISSED', '22/07/2016 17:45', NULL, NULL, false, NULL, NULL, 18),
  ('case_000', 'L20', 'Thảo Vy', '0978.552.109', 'OUTGOING', '21/07/2016 21:15', NULL, NULL, false, NULL, NULL, 19),
  ('case_000', 'L21', 'Tuấn Bia 88', '0945.888.188', 'OUTGOING', '21/07/2016 19:15', NULL, NULL, false, NULL, NULL, 20);

DELETE FROM public.phone_messages WHERE case_slug = 'case_000';
-- 4. phone_messages: 89 rows from 16 threads (parsed from Sheet "messages")
INSERT INTO public.phone_messages (case_slug, thread_key, thread_name, thread_phone, sender, role, body, timestamp, code, is_clue, clue_title, clue_analysis, attachment_type, attachment_url, attachment_duration, slot_index) VALUES
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Khoản đợt một em chuẩn bị xong tiền mặt rồi nhé. Tối mai tầm mấy giờ anh tiện nhận tiền?', '04/05 14:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 0),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Tối mai 21h qua số 29 Đường Vĩnh Thái. Giờ đấy anh mới xong việc ở chỗ công trình. Nhớ mang đủ giấy tờ.', '04/05 14:32', NULL, false, NULL, NULL, NULL, NULL, NULL, 1),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Oke anh', '04/05 14:35', NULL, false, NULL, NULL, NULL, NULL, NULL, 2),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Khoản nợ mới lúc nào anh chuyển nốt em phần còn lại được? Em đang kẹt quá', '22/05 10:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 3),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Cuối tuần này chuyển tiếp phần còn lại nhé.', '22/05 11:05', NULL, false, NULL, NULL, NULL, NULL, NULL, 4),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Cứ tối ra đúng địa chỉ cũ tôi đưa tiền, đừng chuyển khoản lằng nhằng mất công đối soát.', '22/05 11:06', NULL, false, NULL, NULL, NULL, NULL, NULL, 5),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Tối nay vẫn số 29 Đường Vĩnh Thái anh nhỉ?', '25/05 16:48', NULL, false, NULL, NULL, NULL, NULL, NULL, 6),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Ừ', '25/05 16:49', NULL, false, NULL, NULL, NULL, NULL, NULL, 7),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Hôm nay em gửi lãi tháng 6 được không?', '12/06 16:40', NULL, false, NULL, NULL, NULL, NULL, NULL, 8),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Tầm 9 giờ tối đi, giờ đấy vắng người dễ làm việc. Mà hôm nay đừng có lề mề như lần trước.', '12/06 17:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 9),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Lần trước do kẹt xe thôi. Anh khó tính vừa thôi chứ.', '12/06 17:18', NULL, false, NULL, NULL, NULL, NULL, NULL, 10),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Không khó tính để bị trễ việc à? Vừa bực mình với con người yêu trời đánh xong. Trông chán phát khiếp.', '12/06 17:22', NULL, false, NULL, NULL, NULL, NULL, NULL, 11),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Mà anh hay đi với em thế chị Hà có nghĩ gì k đấy', '12/06 17:28', NULL, false, NULL, NULL, NULL, NULL, NULL, 12),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Lắm chuyện, con mẹ ấy thì biết gì anh sắp chia tay với nó rồi kệ nó đi', '12/06 17:49', NULL, false, NULL, NULL, NULL, NULL, NULL, 13),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Anh mới kiểm tra lại sổ
> Nhớ ngày mai trả lãi tháng 7 đấy
> Em nhớ trả anh đúng hạn. Không liệu hồn
Em biết rồi
Cũng may là em chuẩn bị trước rồi
Nhớ mai cho em vay thêm vài chục với. Em đang kẹt xíu
Anh khỏi lo em đã khất nợ bao giờ đâu', '03/07 22:01', NULL, false, NULL, NULL, NULL, NULL, NULL, 14),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'Đợt cuối cùng gom xong rồi. Tối nay hẹn ở đâu để tất toán dứt điểm đây?', '24/07 16:05', NULL, false, NULL, NULL, NULL, NULL, NULL, 15),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', '9h rưỡi tối nay. Chỗ mọi khi', '24/07 16:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 16),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Thảo Vy', 'received', 'À mà dạo này em cứ thấy có cảm giác như bị ai theo dõi ấy.
Mà em có gây thù chuốc oán với ai bao giờ đâu nhỉ 😣', '24/07 16:22', NULL, false, NULL, NULL, NULL, NULL, NULL, 17),
  ('case_000', 'thread_th_o_vy', 'Thảo Vy', '0978.552.109', 'Nạn nhân', 'sent', 'Đùa à 😂 Em thì chỉ có zai theo thôi chứ ai', '24/07 16:23', NULL, false, NULL, NULL, NULL, NULL, NULL, 18),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Anh vẫn đang ở quán nhậu ạ? Sao anh nhậu lâu vậy, từ lúc 5h chiều tới giờ.
10 giờ mà anh chưa về em sẽ ra quán chở anh về nhé.', '17/07 21:49', NULL, false, NULL, NULL, NULL, NULL, NULL, 19),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Nạn nhân', 'sent', 'Cô điên à? Tôi đi với bạn bè đàng hoàng chứ có phải làm gì khuất tất đâu
> Tôi tự biết đường về', '17/07 21:50', NULL, false, NULL, NULL, NULL, NULL, NULL, 20),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Thế đúng 10h em gọi video nhé. Anh mà chưa về là em ra tận quán đưa anh về đấy.', '17/07 21:51', NULL, false, NULL, NULL, NULL, NULL, NULL, 21),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Sáng em có ghé nhà anh dọn dẹp với nấu sẵn cho anh vài món, em để trong tủ lạnh, anh nhớ ăn nhé.
Mà sao em không thấy cái áo sơ mi trắng trong tủ anh đâu.
Thường dịp đặc biệt anh mới mặc nó thôi mà.
Nay anh đi gặp ai đặc biệt lắm ạ?

> Cô rảnh à mà hỏi lắm thế.
> Tôi đi đâu kệ tôi', '18/07 10:12', NULL, false, NULL, NULL, NULL, NULL, NULL, 22),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Nạn nhân', 'sent', 'Mà bớt cái kiểu cứ đùng đùng qua nhà tôi thế đi.', '18/07 10:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 23),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Tối nay anh đi đâu hả?', '21/07 19:03', NULL, false, NULL, NULL, NULL, NULL, NULL, 24),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Em qua dọn nhà cho anh nè. Mà không thấy anh đâu.
Hay là anh lại đi chơi bida với mấy thằng lông bông kia rồi.
Em đã bảo anh đừng chơi vs lũ đấy nữa mà, có tốt đẹp j đâu.
[VIDEO: https://drive.google.com/file/d/1X0Qq-_NgfpQ0Mfnz9cmMU2FDH4d6LWzA/view?usp=sharing]
Anh xem chúng mình đẹp đôi chưa nè', '21/07 19:03', NULL, false, NULL, NULL, NULL, NULL, NULL, 25),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Hnay em nấu canh cua rau đay, anh thích món đó mà. 
Để em mang sag cho anh nhé? Em biết anh hay quên ăn tối...', '22/07 21:17', NULL, false, NULL, NULL, NULL, NULL, NULL, 26),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Sao anh ko trả lời em?
Em để phần anh trong hộp cơm ở trước cửa nhé. Anh nhớ lấy vào ăn kẻo nguội.', '22/07 22:03', NULL, false, NULL, NULL, NULL, NULL, NULL, 27),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Em thấy hộp cơm hôm qua anh đã lấy vào rồi 🥰
Vậy là anh có ăn pk? Chiều nay em nghỉ sớm, hay để em ghé qua dọn nhà cho anh nha?', '23/07 12:44', NULL, false, NULL, NULL, NULL, NULL, NULL, 28),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Nạn nhân', 'sent', 'Đừng có sang. Bận.', '23/07 14:51', NULL, false, NULL, NULL, NULL, NULL, NULL, 29),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', 'Anh ơi, em vừa sao xong mẻ trà hoa cúc mới, thơm lắm anh. Lát anh có ở nhà ko, em mang qua nhé?', '24/07 19:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 30),
  ('case_000', 'thread_h_', 'Hà', '0984.112.568', 'Hà', 'received', '[AUDIO: https://drive.google.com/file/d/1xFjEvvM5uE7zkXD93OIVY_NQNNH-tpvz/view?usp=drive_link]', '24/07 20:32', NULL, false, NULL, NULL, NULL, NULL, NULL, 31),
  ('case_000', 'thread_0988_200_991', '0988.200.991', '0988.200.991', 'Nạn nhân', 'sent', 'Hạn 20 rồi mày không thấy lịch à. 300 triệu không phải 300 nghìn. Tắt máy trốn thì tao tìm đến tận nhà mày.', '21/07 09:14', NULL, false, NULL, NULL, NULL, NULL, NULL, 32),
  ('case_000', 'thread_0988_200_991', '0988.200.991', '0988.200.991', 'Nạn nhân', 'sent', 'Mày nghĩ tắt máy là xong à?', '22/07 20:31', NULL, false, NULL, NULL, NULL, NULL, NULL, 33),
  ('case_000', 'thread_0988_200_991', '0988.200.991', '0988.200.991', 'Nạn nhân', 'sent', 'Ngày mai không gọi lại tao thì tao cho rải giấy nợ để cả phố biết mặt thằng rể quý nhà họ Nguyễn.', '22/07 20:31', NULL, false, NULL, NULL, NULL, NULL, NULL, 34),
  ('case_000', 'thread_0988_200_991', '0988.200.991', '0988.200.991', 'Nạn nhân', 'sent', 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng. Không thì ngày mai tao ghé nhà máy thăm bố vợ mày luôn thể.', '24/07 18:12', NULL, false, NULL, NULL, NULL, NULL, NULL, 35),
  ('case_000', 'thread_viettel_km', 'VIETTEL_KM', '198', 'VIETTEL_KM', 'received', '[QC] Duy nhat ngay 05/07/2016, Viettel KM 50% gia tri the nap cho thue bao tra truoc. Chi tiet lien he 198 (0d).', '05/07 08:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 36),
  ('case_000', 'thread_viettel_km', 'VIETTEL_KM', '198', 'VIETTEL_KM', 'received', '[QC] Tu 00h-24h ngay 20/07/2016, Viettel KM 50% gia tri the nap cho thue bao tra truoc (25% cong vao TK KM, 25% cong vao TK KM2). Chi tiet LH 198 (0d).', '20/07 08:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 37),
  ('case_000', 'thread_viettel_km', 'VIETTEL_KM', '198', 'VIETTEL_KM', 'received', '[QC] Dang ky goi cuoc 3G Mimax chi voi 70.000d/thang co ngay 600MB toc do cao, het luu luong truy cap mien phi. Soan MIMAX gui 191.', '23/07 10:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 38),
  ('case_000', 'thread_0912_331_888', '0912.331.888', '0912.331.888', '0912.331.888', 'received', '20 năm qua mày sống tốt nhỉ', '22/07 20:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 39),
  ('case_000', 'thread_0912_331_888', '0912.331.888', '0912.331.888', 'Nạn nhân', 'sent', 'Thằng nào đấy?', '22/07 20:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 40),
  ('case_000', 'thread_c_m_ch__ba', 'Cơm Chị Ba', '0908.334.991', 'Nạn nhân', 'sent', 'Cho em 2 suất sườn bì chả nhiều ớt cay qua 14 Bờ Sông chị nhé.', '18/07 11:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 41),
  ('case_000', 'thread_c_m_ch__ba', 'Cơm Chị Ba', '0908.334.991', 'Cơm Chị Ba', 'received', 'Có ngay em ơi, 15 phút nữa chú xe ôm mang qua nhé.', '18/07 11:25', NULL, false, NULL, NULL, NULL, NULL, NULL, 42),
  ('case_000', 'thread_c_m_ch__ba', 'Cơm Chị Ba', '0908.334.991', 'Nạn nhân', 'sent', 'Trưa nay có cá kho tộ với canh chua không chị?', '22/07 11:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 43),
  ('case_000', 'thread_c_m_ch__ba', 'Cơm Chị Ba', '0908.334.991', 'Cơm Chị Ba', 'received', 'Có cá hú kho tộ ngon lắm em, lấy thêm chén canh chua nha?', '22/07 11:32', NULL, false, NULL, NULL, NULL, NULL, NULL, 44),
  ('case_000', 'thread_c_m_ch__ba', 'Cơm Chị Ba', '0908.334.991', 'Nạn nhân', 'sent', 'Vâng cho 1 phần cơm cá kho + canh chua.', '22/07 11:33', NULL, false, NULL, NULL, NULL, NULL, NULL, 45),
  ('case_000', 'thread_ch__h_nh_gi_t_l_', 'Chị Hạnh Giặt Là', '0914.556.789', 'Nạn nhân', 'sent', 'Chị Hạnh ơi em gửi thằng đệ mang 1 cái áo khoác da với 2 chăn lông qua giặt khô, làm cẩn thận hộ em.', '12/07 16:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 46),
  ('case_000', 'thread_ch__h_nh_gi_t_l_', 'Chị Hạnh Giặt Là', '0914.556.789', 'Chị Hạnh Giặt Là', 'received', 'Rồi chị nhận được rồi, giặt hấp da mất 2-3 hôm em nhé.', '12/07 16:10', NULL, false, NULL, NULL, NULL, NULL, NULL, 47),
  ('case_000', 'thread_ch__h_nh_gi_t_l_', 'Chị Hạnh Giặt Là', '0914.556.789', 'Chị Hạnh Giặt Là', 'received', 'Đồ giặt xong rồi em ơi, tiện ghé lấy nhé.', '15/07 17:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 48),
  ('case_000', 'thread_ch__h_nh_gi_t_l_', 'Chị Hạnh Giặt Là', '0914.556.789', 'Chị Hạnh Giặt Là', 'received', 'Khang ơi áo da với chăn của em giặt xong cả tuần rồi để chật tiệm quá, chiều tiện ghé 42 Khâm Thiên lấy hộ chị.', '21/07 15:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 49),
  ('case_000', 'thread_ch__h_nh_gi_t_l_', 'Chị Hạnh Giặt Là', '0914.556.789', 'Nạn nhân', 'sent', 'Vâng chiều em cho thằng Long qua vác về.', '21/07 15:35', NULL, false, NULL, NULL, NULL, NULL, NULL, 50),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Long Sẹo', 'received', 'Anh Khang ơi em dán xong 50 tờ thông báo nợ quanh khu chợ đầu mối rồi nhé.', '08/07 09:10', NULL, false, NULL, NULL, NULL, NULL, NULL, 51),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Nạn nhân', 'sent', 'Tốt, tối lượn qua bến phà ngó xem có động tĩnh gì không.', '08/07 09:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 52),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Nạn nhân', 'sent', 'Mày thấy thằng Hải Lác chạy xe ở bến chưa?', '19/07 14:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 53),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Long Sẹo', 'received', 'Em đảo qua 2 vòng mà bọn xe ôm bảo nó nghỉ ốm mấy hôm nay rồi anh ạ.', '19/07 16:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 54),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Long Sẹo', 'received', 'Anh ơi em vừa tóm được quả xe Dream của nó dựng ở quán nước đầu bến!', '21/07 11:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 55),
  ('case_000', 'thread_long_s_o', 'Long Sẹo', '0979.441.223', 'Nạn nhân', 'sent', 'Giữ luôn chìa khóa xe nó, bảo khi nào mang đủ 75 triệu đến nhà tao thì trả xe.', '21/07 11:16', NULL, false, NULL, NULL, NULL, NULL, NULL, 56),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Nạn nhân', 'sent', 'Tuấn, tiền gỗ đợt trước 45 triệu đến hạn rồi. Chiều tao cho người qua lấy.', '08/06 09:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 57),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Tuấn Béo Xưởng Mộc', 'received', 'Anh Khang ơi đợt này bên chủ nhà họ chậm thanh toán quá, anh thư thư cho em mấy hôm với ạ.', '08/06 09:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 58),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Nạn nhân', 'sent', 'Mấy hôm của mày là nửa tháng rồi đấy à? Đừng để tao phải mang mấy anh em xuống tận xưởng mộc bốc máy cưa máy bào đi.', '25/06 14:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 59),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Tuấn Béo Xưởng Mộc', 'received', 'Em lạy anh, anh cho em xin đến đầu tháng 7 công trình xong em thanh toán đủ cả gốc lẫn lãi cho anh!', '25/06 14:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 60),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Nạn nhân', 'sent', '🎙️ [Tin nhắn thoại 0:06] [Khôn hồn thì trả đúng hạn cho bố nghe chưa? Không thì t cho cả mày và cái xưởng của mày sáng nhất Hà Nội đấy. Ông đây đếch phải chưa từng cho thằng nào bay màu đâu nhé]', '21/07 10:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 61),
  ('case_000', 'thread_tu_n_b_o_x__ng_m_c', 'Tuấn Béo Xưởng Mộc', '0902.998.114', 'Nạn nhân', 'sent', 'Biết điều đấy, trước 30/7 nốt 25 triệu còn lại không thì đừng trách tao.', '21/07 10:25', NULL, false, NULL, NULL, NULL, NULL, NULL, 62),
  ('case_000', 'thread_vnpt_notice', 'VNPT_Notice', 'VNPT', 'VNPT_Notice', 'received', '[Thong bao] Cuoc Internet FiberVNN thang 06/2016 cua thue bao 0904888666 la 220.000d. Han thanh toan: 20/07/2016.', '10/07 08:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 63),
  ('case_000', 'thread_vnpt_notice', 'VNPT_Notice', 'VNPT', 'VNPT_Notice', 'received', '[Thong bao] Thue bao 0904888666 da thanh toan cuoc Internet FiberVNN thang 06/2016 so tien 220.000d qua ViettinBank. Cam on Quy khach.', '21/07 08:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 64),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Tuấn Bia 88', 'received', 'Tối nay chung kết Euro Pháp - Bồ Đào Nha ra quán làm nồi lẩu xem bóng đá không Khang ơi? Có mấy anh em xóm Cảng nữa.', '10/07 17:40', NULL, false, NULL, NULL, NULL, NULL, NULL, 65),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Nạn nhân', 'sent', 'Bận rồi, tối phải đi chốt mấy khoản họ.', '10/07 18:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 66),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Nạn nhân', 'sent', 'Trưa nay quán có lòng non với cháo lòng không ông?', '15/07 11:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 67),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Tuấn Bia 88', 'received', 'Có luôn ông ơi, vừa mổ lòng tươi rói. Ra nhanh kẻo hết.', '15/07 11:22', NULL, false, NULL, NULL, NULL, NULL, NULL, 68),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Tuấn Bia 88', 'received', 'Khang ơi, tối nay rảnh ra làm vài cốc bia hơi phố cổ không ông? Lô bia hơi Hà Nội mới về mát lịm.', '20/07 18:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 69),
  ('case_000', 'thread_tu_n_bia_88', 'Tuấn Bia 88', '0945.888.188', 'Nạn nhân', 'sent', 'Tối bận đi thu nợ rồi ông. Để bữa khác.', '20/07 18:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 70),
  ('case_000', 'thread_duy_bida_88', 'Duy Bida 88', '0916.334.556', 'Duy Bida 88', 'received', 'Chiều nay rảnh qua CLB làm độ bida lỗ 500k/ván với thằng Nam không anh Khang?', '05/07 14:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 71),
  ('case_000', 'thread_duy_bida_88', 'Duy Bida 88', '0916.334.556', 'Nạn nhân', 'sent', 'Chiều bận, tối 8h tao qua.', '05/07 14:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 72),
  ('case_000', 'thread_duy_bida_88', 'Duy Bida 88', '0916.334.556', 'Duy Bida 88', 'received', 'Bàn số 1 vừa thay nỉ nhập khẩu mới mượt lắm anh ơi, tối rảnh qua test bàn.', '18/07 19:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 73),
  ('case_000', 'thread_duy_bida_88', 'Duy Bida 88', '0916.334.556', 'Nạn nhân', 'sent', 'Dạo này đang bận mấy vụ gom tiền, để cuối tuần.', '20/07 11:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 74),
  ('case_000', 'thread_195', '195', '195', '195', 'received', 'Tai khoan cua Quy khach da duoc cong 500.000d tu the cao nap ngay 20/07/2016. So du hien tai: 584.250d. Thoi han su dung den 30/12/2016.', '20/07 09:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 75),
  ('case_000', 'thread_th_ng_s_a_xe', 'Thắng Sửa Xe', '0977.112.445', 'Nạn nhân', 'sent', 'Con SH của anh dạo này đi nồi kêu rè rè với phanh trước bị bó, chiều anh vứt qua xưởng chú coi hộ.', '14/07 10:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 76),
  ('case_000', 'thread_th_ng_s_a_xe', 'Thắng Sửa Xe', '0977.112.445', 'Thắng Sửa Xe', 'received', 'Vâng anh cứ vứt qua xưởng để em kiểm tra kỹ cho.', '14/07 10:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 77),
  ('case_000', 'thread_th_ng_s_a_xe', 'Thắng Sửa Xe', '0977.112.445', 'Thắng Sửa Xe', 'received', 'Anh Khang ơi tháo ra thấy mòn hết bố ba càng với bi nồi rồi, em thay luôn bộ mới xịn của Honda nhé? Tổng tầm hơn triệu.', '16/07 15:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 78),
  ('case_000', 'thread_th_ng_s_a_xe', 'Thắng Sửa Xe', '0977.112.445', 'Nạn nhân', 'sent', 'Ừ thay luôn đồ ngon cho anh.', '18/07 09:10', NULL, false, NULL, NULL, NULL, NULL, NULL, 79),
  ('case_000', 'thread_th_ng_s_a_xe', 'Thắng Sửa Xe', '0977.112.445', 'Thắng Sửa Xe', 'received', 'Xe SH của anh thay dầu với làm nồi xong rồi nhé, tổng hết 850k anh nhé. Chiều rảnh ghé lấy.', '18/07 14:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 80),
  ('case_000', 'thread_qu_n_l____', 'Quân Lô Đề', '0982.441.667', 'Nạn nhân', 'sent', 'Vào cho tao cặp 68 - 86 mỗi con 500 điểm lô, đề đít 8 năm trăm nghìn.', '16/07 16:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 81),
  ('case_000', 'thread_qu_n_l____', 'Quân Lô Đề', '0982.441.667', 'Quân Lô Đề', 'received', 'Đã nhận đủ bảng của anh Khang nhé. Chúc anh rực rỡ!', '16/07 17:00', NULL, false, NULL, NULL, NULL, NULL, NULL, 82),
  ('case_000', 'thread_qu_n_l____', 'Quân Lô Đề', '0982.441.667', 'Quân Lô Đề', 'received', 'Nổ 68 hai nháy anh ơiii!! Tổng ăn 80 củ, trừ gốc còn lời 62 củ. Mai anh lấy tiền mặt hay bắn tài khoản?', '16/07 18:35', NULL, false, NULL, NULL, NULL, NULL, NULL, 83),
  ('case_000', 'thread_qu_n_l____', 'Quân Lô Đề', '0982.441.667', 'Nạn nhân', 'sent', 'Chuyển thẳng vào thẻ Vietcombank cho tao.', '17/07 10:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 84),
  ('case_000', 'thread_qu_n_l____', 'Quân Lô Đề', '0982.441.667', 'Quân Lô Đề', 'received', 'Em vừa chuyển rồi đó anh, check tk hộ em nhé.', '17/07 10:45', NULL, false, NULL, NULL, NULL, NULL, NULL, 85),
  ('case_000', 'thread_th_m_t_', 'Thím Tư', '0964.881.332', 'Thím Tư', 'received', 'Khang ơi ở quê chú thím vừa gửi buồng chuối ngự với bao gạo nếp lên xe khách Mỹ Đình, trưa cháu ra bến đón lấy nhé.', '02/07 08:30', NULL, false, NULL, NULL, NULL, NULL, NULL, 86),
  ('case_000', 'thread_th_m_t_', 'Thím Tư', '0964.881.332', 'Nạn nhân', 'sent', 'Cháu bận không đi được đâu, thím bảo phụ xe gọi xe ôm ship tận nhà cho cháu, cháu trả tiền ship.', '03/07 09:15', NULL, false, NULL, NULL, NULL, NULL, NULL, 87),
  ('case_000', 'thread_th_m_t_', 'Thím Tư', '0964.881.332', 'Thím Tư', 'received', 'Cuối tháng giỗ ông nội ở quê cháu có sắp xếp về được không Khang? Cả họ ai cũng hỏi thăm.', '15/07 16:20', NULL, false, NULL, NULL, NULL, NULL, NULL, 88);

-- 5. phone_notes/phone_browser/phone_bank: 12 records from Sheet tab "apps"

-- 5a. phone_notes: 2 records
DELETE FROM public.phone_notes WHERE case_slug = 'case_000';
INSERT INTO public.phone_notes (case_slug, title, body, is_pinned, is_clue, slot_index) VALUES
  ('case_000', 'Nợ Vũ Đen & Phương án', 'Thằng Vũ còn nợ 350tr tiền họ. Lãi tháng 7 mới nộp 10tr5. Con Mai vợ nó làm căng vụ đất đai ở Bờ Sông. Bảo thằng Vũ nếu không cản được con Mai rút đơn kiện thì tao cho đàn em tới tận xưởng cơ khí xiết đồ.', false, false, 0),
  ('case_000', 'Kế hoạch đi Đà Lạt', 'Tour khởi hành sáng 25/07. Đã cọc cho bên công ty du lịch 12tr. Chuẩn bị giấy tờ đất và rút bớt tiền mặt trong tài khoản mang theo. Hẹn Nhi đón ở sân bay Nội Bài.', false, false, 1);

-- 5b. phone_browser_history: 4 records
DELETE FROM public.phone_browser_history WHERE case_slug = 'case_000';
INSERT INTO public.phone_browser_history (case_slug, title, url, visited_at, is_clue, slot_index) VALUES
  ('case_000', 'google.com', 'Cách xóa lịch sử cuộc gọi Viettel không để lại vết trên tổng đài', '24/07 • 19:45', false, 0),
  ('case_000', 'vnr.com.vn', 'https://vnr.com.vn/gio-tau-chay-ha-noi-phu-ly-2016-tau-hang-d19e', '24/07 • 20:10', false, 1),
  ('case_000', 'google.com', 'Quy định về hợp đồng vay nợ tiền mặt không chứng thực', '23/07 • 11:20', false, 2),
  ('case_000', 'dantri.com.vn', 'https://dantri.com.vn/the-thao/ket-qua-chung-ket-euro-2016-portugal-vo-vuc.htm', '11/07 • 07:15', false, 3);

-- 5c. phone_bank_transactions: 6 records
DELETE FROM public.phone_bank_transactions WHERE case_slug = 'case_000';
INSERT INTO public.phone_bank_transactions (case_slug, tx_type, amount, counterparty, note, timestamp, is_clue, slot_index) VALUES
  ('case_000', 'out', 12000000, 'CÔNG TY CP DU LỊCH VIỆT', 'Khang CK coc tour Da Lat 25/7 - Yen Nhi', '15:30 (22/07/2016)', false, 0),
  ('case_000', 'in', 10500000, 'LE QUANG VU', 'Vu tra lai thang 7 khoan 350tr', '11:20 (19/07/2016)', false, 1),
  ('case_000', 'in', 200000000, 'NGUYEN HOANG HAI', 'Tien coc giay tay thua dat 14 bo song', '09:15 (15/07/2016)', false, 2),
  ('case_000', 'out', 18500000, 'TIEM VANG KIM THANH', 'Mua day chuyen vang trang tang Nhi', '16:45 (10/07/2016)', false, 3),
  ('case_000', 'in', 2100000000, 'KHO BAC NHA NUOC DONG DA', 'Tien den bu dot 1 thua dat 14 bo song - Nguyen Van Khang', '14:00 (05/07/2016)', false, 4),
  ('case_000', 'out', 50000000, 'VP LUAT SU NAM VAP CONG SU', 'Thanh toan phi dich vu ho so thua ke & hop dong di chúc', '10:30 (02/07/2016)', false, 5);

-- 6. Remove junk placeholder apps (app_0..app_11 from old migrate-phone-sheets)
DELETE FROM public.case_phone_apps WHERE case_slug = 'case_000' AND app_type LIKE 'app_%';

COMMIT;
