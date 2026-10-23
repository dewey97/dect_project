-- ==============================================================================
-- 33. SEED PHONE APPS CASE_000 — 15 ứng dụng chuẩn iOS cho case_000
-- ==============================================================================

INSERT INTO public.case_phone_apps (case_slug, app_type, display_name, icon_url, slot_index, is_dock) VALUES
  -- Grid apps (slot 0-10)
  ('case_000', 'photos',      'Ảnh',        '/images/cases/case_000/phone/icons/photos.png',      0,  false),
  ('case_000', 'camera',      'Camera',     '/images/cases/case_000/phone/icons/camera.png',      1,  false),
  ('case_000', 'maps',        'Bản đồ',    '/images/cases/case_000/phone/icons/maps.png',        2,  false),
  ('case_000', 'notes',       'Ghi chú',   '/images/cases/case_000/phone/icons/notes.png',       3,  false),
  ('case_000', 'banking',     'Ngân hàng', '/images/cases/case_000/phone/icons/banking.svg',     4,  false),
  ('case_000', 'flappybird',  'Flappy Bird','/images/cases/case_000/phone/icons/flappybird.svg', 5,  false),
  ('case_000', 'tetris',      'Xếp Gạch', '/images/cases/case_000/phone/icons/tetris.svg',      6,  false),
  ('case_000', 'snake',       'Snake ''97','/images/cases/case_000/phone/icons/snake.svg',       7,  false),
  ('case_000', 'game2048',    '2048',      '/images/cases/case_000/phone/icons/game2048.svg',    8,  false),
  ('case_000', 'minesweeper', 'Dò Mìn',   '/images/cases/case_000/phone/icons/minesweeper.svg', 9,  false),
  ('case_000', 'settings',    'Cài đặt',  '/images/cases/case_000/phone/icons/settings.png',    10, false),
  -- Dock apps (slot 0-3)
  ('case_000', 'phone',       'Điện thoại','/images/cases/case_000/phone/icons/phone.png',      0,  true),
  ('case_000', 'messages',    'Tin nhắn',  '/images/cases/case_000/phone/icons/messages.png',    1,  true),
  ('case_000', 'contacts',    'Danh bạ',   '/images/cases/case_000/phone/icons/contacts.png',    2,  true),
  ('case_000', 'safari',      'Safari',    '/images/cases/case_000/phone/icons/safari.png',      3,  true)
ON CONFLICT (case_slug, app_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon_url = EXCLUDED.icon_url,
  slot_index = EXCLUDED.slot_index,
  is_dock = EXCLUDED.is_dock,
  updated_at = NOW();
