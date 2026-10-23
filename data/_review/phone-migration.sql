-- ==============================================================================
-- MIGRATION XUẤT BẢN TỪ GOOGLE SHEETS SANG SUPABASE PHONE DATA
-- Case: case_000
-- Sinh ngày: 2026-10-23T17:31:04.921Z
-- LƯU Ý: Rà soát kỹ dữ liệu trước khi nạp vào production.
-- ==============================================================================

BEGIN;

-- 1. phone_contacts (17 records)
DELETE FROM public.phone_contacts WHERE case_slug = 'case_000';
INSERT INTO public.phone_contacts (case_slug, contact_id, name, display_name, phone_number, category, note, is_saved, avatar_url, is_suspicious, slot_index) VALUES
  ('case_000', 'CT-01', 'Liên hệ #1', 'Liên hệ #1', NULL, NULL, NULL, true, NULL, false, 0),
  ('case_000', 'CT-02', 'Liên hệ #2', 'Liên hệ #2', NULL, NULL, NULL, true, NULL, false, 1),
  ('case_000', 'CT-03', 'Liên hệ #3', 'Liên hệ #3', NULL, NULL, NULL, true, NULL, false, 2),
  ('case_000', 'CT-04', 'Liên hệ #4', 'Liên hệ #4', NULL, NULL, NULL, true, NULL, false, 3),
  ('case_000', 'CT-05', 'Liên hệ #5', 'Liên hệ #5', NULL, NULL, NULL, true, NULL, false, 4),
  ('case_000', 'CT-06', 'Liên hệ #6', 'Liên hệ #6', NULL, NULL, NULL, true, NULL, false, 5),
  ('case_000', 'CT-07', 'Liên hệ #7', 'Liên hệ #7', NULL, NULL, NULL, true, NULL, false, 6),
  ('case_000', 'CT-08', 'Liên hệ #8', 'Liên hệ #8', NULL, NULL, NULL, true, NULL, false, 7),
  ('case_000', 'CT-09', 'Liên hệ #9', 'Liên hệ #9', NULL, NULL, NULL, true, NULL, false, 8),
  ('case_000', 'CT-10', 'Liên hệ #10', 'Liên hệ #10', NULL, NULL, NULL, true, NULL, false, 9),
  ('case_000', 'CT-11', 'Liên hệ #11', 'Liên hệ #11', NULL, NULL, NULL, true, NULL, false, 10),
  ('case_000', 'CT-12', 'Liên hệ #12', 'Liên hệ #12', NULL, NULL, NULL, true, NULL, false, 11),
  ('case_000', 'CT-13', 'Liên hệ #13', 'Liên hệ #13', NULL, NULL, NULL, true, NULL, false, 12),
  ('case_000', 'CT-14', 'Liên hệ #14', 'Liên hệ #14', NULL, NULL, NULL, true, NULL, false, 13),
  ('case_000', 'CT-15', 'Liên hệ #15', 'Liên hệ #15', NULL, NULL, NULL, true, NULL, false, 14),
  ('case_000', 'CT-16', 'Liên hệ #16', 'Liên hệ #16', NULL, NULL, NULL, true, NULL, false, 15),
  ('case_000', 'CT-17', 'Liên hệ #17', 'Liên hệ #17', NULL, NULL, NULL, true, NULL, false, 16);

-- 2. phone_calls (17 records)
DELETE FROM public.phone_calls WHERE case_slug = 'case_000';
INSERT INTO public.phone_calls (case_slug, code, contact_name, phone_number, call_type, timestamp, duration, audio_url, is_key_clue, clue_title, clue_analysis, slot_index) VALUES
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 0),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 1),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 2),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 3),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 4),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 5),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 6),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 7),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 8),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 9),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 10),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 11),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 12),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 13),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 14),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 15),
  ('case_000', NULL, 'Không rõ', NULL, 'incoming', NULL, NULL, NULL, false, NULL, NULL, 16);

-- 3. phone_messages (17 records)
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
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 15),
  ('case_000', 'thread_default', 'Hội thoại', NULL, 'Người gửi', 'received', '', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 16);

-- 4. phone_photos (17 records)
DELETE FROM public.phone_photos WHERE case_slug = 'case_000';
INSERT INTO public.phone_photos (case_slug, photo_code, label, image_url, taken_at, description, exif_json, is_evidence, slot_index) VALUES
  ('case_000', NULL, 'Ảnh #1', '', NULL, NULL, NULL, false, 0),
  ('case_000', NULL, 'Ảnh #2', '', NULL, NULL, NULL, false, 1),
  ('case_000', NULL, 'Ảnh #3', '', NULL, NULL, NULL, false, 2),
  ('case_000', NULL, 'Ảnh #4', '', NULL, NULL, NULL, false, 3),
  ('case_000', NULL, 'Ảnh #5', '', NULL, NULL, NULL, false, 4),
  ('case_000', NULL, 'Ảnh #6', '', NULL, NULL, NULL, false, 5),
  ('case_000', NULL, 'Ảnh #7', '', NULL, NULL, NULL, false, 6),
  ('case_000', NULL, 'Ảnh #8', '', NULL, NULL, NULL, false, 7),
  ('case_000', NULL, 'Ảnh #9', '', NULL, NULL, NULL, false, 8),
  ('case_000', NULL, 'Ảnh #10', '', NULL, NULL, NULL, false, 9),
  ('case_000', NULL, 'Ảnh #11', '', NULL, NULL, NULL, false, 10),
  ('case_000', NULL, 'Ảnh #12', '', NULL, NULL, NULL, false, 11),
  ('case_000', NULL, 'Ảnh #13', '', NULL, NULL, NULL, false, 12),
  ('case_000', NULL, 'Ảnh #14', '', NULL, NULL, NULL, false, 13),
  ('case_000', NULL, 'Ảnh #15', '', NULL, NULL, NULL, false, 14),
  ('case_000', NULL, 'Ảnh #16', '', NULL, NULL, NULL, false, 15),
  ('case_000', NULL, 'Ảnh #17', '', NULL, NULL, NULL, false, 16);

-- 5. case_phone_apps (17 records)
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
  ('case_000', 'app_11', 'app_11', NULL, 11, false),
  ('case_000', 'app_12', 'app_12', NULL, 12, false),
  ('case_000', 'app_13', 'app_13', NULL, 13, false),
  ('case_000', 'app_14', 'app_14', NULL, 14, false),
  ('case_000', 'app_15', 'app_15', NULL, 15, false),
  ('case_000', 'app_16', 'app_16', NULL, 16, false)
ON CONFLICT (case_slug, app_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon_url = EXCLUDED.icon_url,
  slot_index = EXCLUDED.slot_index,
  is_dock = EXCLUDED.is_dock,
  updated_at = NOW();

COMMIT;
