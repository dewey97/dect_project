-- ==============================================================================
-- MIGRATION XUẤT BẢN TỪ GOOGLE SHEETS SANG SUPABASE PHONE DATA
-- Case: case_000
-- Sinh ngày: 2026-10-24T07:50:32.366Z
-- LƯU Ý: Rà soát kỹ dữ liệu trước khi nạp vào production.
-- ==============================================================================

BEGIN;

-- 1. phone_contacts (42 records)
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
  ('case_000', 'C39', 'Yến Bún Đậu', 'Yến Bún Đậu', '0985.221.998', NULL, NULL, true, NULL, false, 38),
  ('case_000', 'C40', 'Liên hệ #40', 'Liên hệ #40', '0988.200.991', 'CLUE', NULL, false, NULL, false, 39),
  ('case_000', 'C41', 'Liên hệ #41', 'Liên hệ #41', '0912.331.888', 'CLUE', NULL, false, NULL, false, 40),
  ('case_000', 'C42', 'Liên hệ #42', 'Liên hệ #42', '0984.180.357', 'CLUE', NULL, false, NULL, false, 41);

-- 2. phone_calls (21 records)
DELETE FROM public.phone_calls WHERE case_slug = 'case_000';
INSERT INTO public.phone_calls (case_slug, code, contact_name, phone_number, call_type, timestamp, duration, audio_url, is_key_clue, clue_title, clue_analysis, slot_index) VALUES
  ('case_000', NULL, 'Không rõ', '0984.180.357', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 0),
  ('case_000', NULL, 'Không rõ', '0984.180.357', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 1),
  ('case_000', NULL, 'Không rõ', '0912.331.888', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 2),
  ('case_000', NULL, 'Không rõ', '0988.200.991', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 3),
  ('case_000', NULL, 'Không rõ', '0915.223.789', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 4),
  ('case_000', NULL, 'Không rõ', '0932.889.102', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 5),
  ('case_000', NULL, 'Không rõ', '0908.441.229', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 6),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 7),
  ('case_000', NULL, 'Không rõ', '0908.334.991', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 8),
  ('case_000', NULL, 'Không rõ', '0913.667.228', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 9),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 10),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 11),
  ('case_000', NULL, 'Không rõ', '0979.441.223', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 12),
  ('case_000', NULL, 'Không rõ', '0972.334.881', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 13),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 14),
  ('case_000', NULL, 'Không rõ', '0904.778.221', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 15),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 16),
  ('case_000', NULL, 'Không rõ', '0984.112.568', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 17),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'INCOMING', NULL, NULL, NULL, false, NULL, NULL, 18),
  ('case_000', NULL, 'Không rõ', '0978.552.109', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 19),
  ('case_000', NULL, 'Không rõ', '0945.888.188', 'OUTGOING', NULL, NULL, NULL, false, NULL, NULL, 20);

-- 3. phone_messages (16 records)
DELETE FROM public.phone_messages WHERE case_slug = 'case_000';
INSERT INTO public.phone_messages (case_slug, thread_key, thread_name, thread_phone, sender, role, body, timestamp, code, is_clue, clue_title, clue_analysis, attachment_type, attachment_url, attachment_duration, slot_index) VALUES
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 0),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 1),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 2),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 3),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 4),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 5),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 6),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 7),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 8),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 9),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 10),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 11),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 12),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 13),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 14),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 15);

-- 5. case_phone_apps (12 records)
INSERT INTO public.case_phone_apps (case_slug, app_type, display_name, icon_url, slot_index, is_dock) VALUES
  ('case_000', 'app_0', 'app_0', NULL, 0, false),
  ('case_000', 'app_1', 'app_1', NULL, 1, false),
  ('case_000', 'app_2', 'app_2', NULL, 2, false),
  ('case_000', 'app_3', 'app_3', NULL, 3, false),
  ('case_000', 'app_4', 'app_4', NULL, 4, false),
  ('case_000', 'app_5', 'app_5', NULL, 5, false),
  ('case_000', 'app_6', 'app_6', NULL, 6, false),
  ('case_000', 'app_7', 'app_7', NULL, 7, false),
  ('case_000', 'app_8', 'app_8', NULL, 8, false),
  ('case_000', 'app_9', 'app_9', NULL, 9, false),
  ('case_000', 'app_10', 'app_10', NULL, 10, false),
  ('case_000', 'app_11', 'app_11', NULL, 11, false)
ON CONFLICT (case_slug, app_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon_url = EXCLUDED.icon_url,
  slot_index = EXCLUDED.slot_index,
  is_dock = EXCLUDED.is_dock,
  updated_at = NOW();

COMMIT;
