-- ==============================================================================
-- 32. DEVICE PROFILE EXTEND — Mở rộng metadata thiết bị điện thoại trong case_characters
-- ==============================================================================
-- Mở rộng device JSONB cho nhân vật nạn nhân (hoặc bất kỳ nhân vật nào có điện thoại)
-- Thêm các trường: chassis, wallpaper_url, lockscreen_url, selfie_url, status_bar,
-- lock_screen, settings_info, passcode.
-- Backfill case_000 từ hardcode hiện tại.
-- ==============================================================================

UPDATE public.case_characters
SET device = COALESCE(device, '{}'::jsonb) || jsonb_build_object(
  'chassis', 'iphone_classic',
  'wallpaper_url', '/images/cases/case_000/phone/clean_beach_wallpaper.png',
  'selfie_url', '/images/cases/case_000/phone/monkey_selfie.png',
  'status_bar', jsonb_build_object(
    'time', '21:30',
    'battery', 15,
    'service_text', 'Không có Dịch vụ'
  ),
  'lock_screen', jsonb_build_object(
    'time', '21:30',
    'date', 'Thứ Bảy, 23 tháng 7'
  ),
  'settings_info', jsonb_build_object(
    'phone_number', '0904.888.666 (Viettel)',
    'imei', '356984110294812',
    'security_sensor', 'Touch ID',
    'forensic_status', 'Đã trích xuất dữ liệu'
  ),
  'passcode', '120713'
)
WHERE role = 'victim' AND case_slug = 'case_000';
