# Phone Studio — Plan Chi Tiết Handoff

> **Mục tiêu:** GM soạn toàn bộ nội dung điện thoại nạn nhân/nghi phạm per-case trong Studio, không sửa code.
> Thay Google Sheets bằng Supabase cho phone data. Per-case device profile, app launcher, nội dung editable.
>
> **Đọc trước khi làm:** `AGENTS.md` (global + dự án), `docs/HANDOFF_ROADMAP.md` mục 1–3.

---

## Tiến độ (review 2026-10-24, commit `1d3089a`, `a9048cb`)

| Bước    | Trạng thái | Ghi chú review                                                                                      |
| ------- | ---------- | --------------------------------------------------------------------------------------------------- |
| P1–P6   | ✅         | Migration 30–34 viết xong, đúng spec. **Chưa chạy production.**                                     |
| P7      | ✅ code    | `scripts/ops/migrate-phone-sheets.mjs` có, **chưa chạy** (chờ migration 31).                        |
| P8      | ✅         | Route chỉ GET, đọc qua RLS public. Ghi đi qua server action có `requireAdminAuth`.                  |
| P9–P16  | ✅         | Dual-source Supabase → Sheets hoạt động. Chassis switch classic/modern có.                          |
| P17     | ✅ code    | Migration 34 bucket `phone-assets`, chưa chạy.                                                      |
| P18–P27 | ✅         | Studio 7 tab + preview + sidebar. Trang được `app/(admin)/layout.tsx` chặn bằng `requireAdminAuth`. |
| P28     | ❌         | `e2e/phone-studio.spec.ts` chỉ test Studio, chưa test phone runtime case_000.                       |
| P29     | ❌         | Chưa có.                                                                                            |
| P30     | ✅         | `docs/core_specs/20_phone_studio.md`.                                                               |
| P31     | ❌         | `CHANGELOG.md`, `HANDOFF_ROADMAP.md`, `TECHDEBT.md` chưa nhắc Phone Studio.                         |

Lỗi/thiếu phát hiện khi review:

1. **E2E Studio sẽ fail:** Playwright không có bước đăng nhập admin (`storageState`). `/studio/*` redirect `/login`. Cần project `setup` đăng nhập bằng tài khoản test đọc từ env.
2. **Fallback app launcher dính case_000:** `app/api/phone-data/apps/route.ts` trả 15 app với icon `/images/cases/case_000/...` cho mọi vụ chưa cấu hình. Vụ mới nên trả danh sách rỗng hoặc icon chung `/images/phone/icons/*`.
3. **Spoiler qua RLS public:** 7 bảng `phone_*` đọc công khai bằng anon key, không cần license. Mức độ tương đương `/api/phone` hiện tại, xử lý cùng hệ thống license (spec 07/08), không chặn release.
4. Phần việc còn lại chuyển vào [`WORKTREE_PLAN.md`](WORKTREE_PLAN.md) — worktree **WT-1**.

---

## 0. Trạng thái hiện tại — Hardcode cần bỏ

| File                                                             | Hardcode                                                                                  | Cần làm                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `components/phone-engine/system/home-screen.tsx`                 | 15 app icon path cứng `/images/cases/case_000/phone/icons/*`                              | Đọc từ DB `case_phone_apps`                            |
| `components/phone-engine/chassis/iphone-classic-chassis.tsx:131` | Wallpaper `bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')]`            | Đọc từ `case_characters.device.wallpaper_url`          |
| `components/phone-engine/apps/camera-app.tsx:237`                | Monkey selfie `/images/cases/case_000/phone/monkey_selfie.png`                            | Đọc từ `case_characters.device.selfie_url`             |
| `components/phone-engine/phone-simulator.tsx:281`                | Luôn render `IPhoneClassicChassis`                                                        | Switch theo `device.chassis`                           |
| `components/phone-engine/phone-simulator.tsx:136`                | Status bar hardcode `time="21:30"`, `batteryLevel={15}`, `serviceText="Không có Dịch vụ"` | Đọc từ device profile                                  |
| `components/phone-engine/phone-simulator.tsx:148–149`            | Lock screen hardcode `time="21:30"`, `date="Thứ Bảy, 23 tháng 7"`                         | Đọc từ device profile                                  |
| `components/phone-engine/phone-simulator.tsx:194–241`            | Settings app hardcode IMEI, SĐT, pin, chủ sở hữu                                          | Đọc từ device profile JSONB                            |
| `app/api/phone/route.ts`                                         | Toàn bộ đọc Google Sheets                                                                 | Giai đoạn 1 giữ nguyên, giai đoạn 2 thay bằng Supabase |
| `lib/hooks/use-phone-data.ts`                                    | Gọi `/api/phone?tab=` (Sheets)                                                            | Giai đoạn 2 đổi sang API mới đọc Supabase              |

---

## 1. Schema Supabase — Migrations

### Migration 30: `case_phone_apps` — App launcher per-case

```sql
-- 30_case_phone_apps.sql

-- Mỗi vụ án chọn app nào hiển thị trên home screen, thứ tự, icon, khóa/mở
CREATE TABLE case_phone_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  app_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon_url TEXT,                                  -- NULL = dùng icon mặc định theo app_type
  slot_index INTEGER NOT NULL DEFAULT 0,          -- vị trí trên home screen (0-based)
  is_dock BOOLEAN NOT NULL DEFAULT false,         -- true = dock bar dưới cùng
  is_locked BOOLEAN NOT NULL DEFAULT false,       -- app bị khoá, cần giải checkpoint
  unlock_checkpoint_id TEXT,                      -- checkpoint_id mở khoá app này
  config JSONB NOT NULL DEFAULT '{}',             -- cấu hình riêng từng app (game difficulty, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_slug, app_type)
);

-- Trigger auto-update updated_at
CREATE TRIGGER set_phone_apps_updated_at
  BEFORE UPDATE ON case_phone_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE case_phone_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phone_apps_read" ON case_phone_apps FOR SELECT USING (true);
CREATE POLICY "phone_apps_write" ON case_phone_apps FOR ALL USING (private.is_admin());
```

**`app_type` hợp lệ** (CHECK constraint hoặc validate ở application layer):
`messages`, `phone`, `photos`, `camera`, `maps`, `notes`, `banking`, `safari`, `contacts`, `settings`, `snake`, `game2048`, `minesweeper`, `flappybird`, `tetris`

### Migration 31: Phone data tables — Thay Google Sheets

```sql
-- 31_phone_data_tables.sql

-- Danh bạ
CREATE TABLE phone_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  contact_id TEXT,                                -- mã nội bộ (vd: "CT-01")
  name TEXT NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  category TEXT,                                  -- "Bạn bè", "Gia đình", "Công việc"
  note TEXT,
  is_saved BOOLEAN DEFAULT true,
  avatar_url TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lịch sử cuộc gọi
CREATE TABLE phone_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  code TEXT,                                      -- mã chứng cứ (vd: "A-05")
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  call_type TEXT NOT NULL DEFAULT 'incoming',      -- incoming | outgoing | missed
  timestamp TEXT,                                  -- "22/07/2016 14:30"
  duration TEXT,                                   -- "2 phút 15 giây"
  audio_url TEXT,                                  -- URL file ghi âm (nếu có)
  is_key_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tin nhắn (flat, group theo thread_key)
CREATE TABLE phone_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  thread_key TEXT NOT NULL,                        -- nhóm thread (vd: "thread_vy", "thread_ha")
  thread_name TEXT NOT NULL,                       -- tên hiển thị thread (vd: "Vy 💕")
  thread_phone TEXT,                               -- SĐT thread
  sender TEXT NOT NULL,                            -- tên người gửi
  role TEXT NOT NULL DEFAULT 'received',            -- sent | received | corrupted
  body TEXT NOT NULL DEFAULT '',
  timestamp TEXT,                                  -- "22/07 17:30"
  code TEXT,                                       -- mã chứng cứ
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  attachment_type TEXT,                             -- image | audio | video | NULL
  attachment_url TEXT,
  attachment_duration TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ảnh trong gallery
CREATE TABLE phone_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  photo_code TEXT,                                 -- mã chứng cứ (vd: "P-01")
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,                         -- Supabase Storage URL
  taken_at TEXT,                                   -- "20/07/2016 09:15"
  description TEXT,
  exif_json JSONB,                                 -- { camera, gps, ... }
  is_evidence BOOLEAN DEFAULT false,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ghi chú (Notes app)
CREATE TABLE phone_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',                    -- markdown
  is_pinned BOOLEAN DEFAULT false,
  code TEXT,                                       -- mã chứng cứ
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Giao dịch ngân hàng
CREATE TABLE phone_bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  tx_type TEXT NOT NULL DEFAULT 'out',             -- in | out
  amount BIGINT NOT NULL DEFAULT 0,                -- VNĐ
  counterparty TEXT NOT NULL,
  note TEXT,
  timestamp TEXT,
  code TEXT,                                       -- mã chứng cứ
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  clue_analysis TEXT,
  balance_after BIGINT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lịch sử duyệt web (Safari)
CREATE TABLE phone_browser_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  visited_at TEXT,
  favicon_url TEXT,
  code TEXT,
  is_clue BOOLEAN DEFAULT false,
  clue_title TEXT,
  slot_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS cho tất cả bảng phone data
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'phone_contacts', 'phone_calls', 'phone_messages',
    'phone_photos', 'phone_notes', 'phone_bank_transactions',
    'phone_browser_history'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "%s_read" ON %I FOR SELECT USING (true)', tbl || '_read', tbl);
    EXECUTE format('CREATE POLICY "%s_write" ON %I FOR ALL USING (private.is_admin())', tbl || '_write', tbl);
  END LOOP;
END $$;

-- Index cho truy vấn theo case
CREATE INDEX idx_phone_contacts_case ON phone_contacts(case_slug);
CREATE INDEX idx_phone_calls_case ON phone_calls(case_slug);
CREATE INDEX idx_phone_messages_case ON phone_messages(case_slug);
CREATE INDEX idx_phone_messages_thread ON phone_messages(case_slug, thread_key);
CREATE INDEX idx_phone_photos_case ON phone_photos(case_slug);
CREATE INDEX idx_phone_notes_case ON phone_notes(case_slug);
CREATE INDEX idx_phone_bank_tx_case ON phone_bank_transactions(case_slug);
CREATE INDEX idx_phone_browser_case ON phone_browser_history(case_slug);
```

### Migration 32: Mở rộng `case_characters.device` JSONB

```sql
-- 32_device_profile_extend.sql

-- Mở rộng device JSONB cho nhân vật nạn nhân (hoặc bất kỳ nhân vật nào có điện thoại)
-- Thêm các trường: chassis, wallpaper_url, lockscreen_url, selfie_url, status_bar, lock_screen, settings_info
-- Backfill case_000 từ hardcode hiện tại

UPDATE case_characters
SET device = device || jsonb_build_object(
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
```

### Migration 33: Seed `case_phone_apps` cho case_000

```sql
-- 33_seed_phone_apps_case_000.sql

-- Seed 15 app hiện tại của case_000
INSERT INTO case_phone_apps (case_slug, app_type, display_name, icon_url, slot_index, is_dock) VALUES
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
ON CONFLICT (case_slug, app_type) DO NOTHING;
```

---

## 2. TypeScript Types — Cập nhật `lib/types/database.ts`

Thêm interfaces:

```ts
/** Bảng case_phone_apps: App launcher per-case */
export interface DbCasePhoneApp {
  id: string;
  case_slug: string;
  app_type: string;
  display_name: string;
  icon_url: string | null;
  slot_index: number;
  is_dock: boolean;
  is_locked: boolean;
  unlock_checkpoint_id: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_contacts */
export interface DbPhoneContact {
  id: string;
  case_slug: string;
  contact_id: string | null;
  name: string;
  display_name: string | null;
  phone_number: string | null;
  category: string | null;
  note: string | null;
  is_saved: boolean;
  avatar_url: string | null;
  is_suspicious: boolean;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_calls */
export interface DbPhoneCall {
  id: string;
  case_slug: string;
  code: string | null;
  contact_name: string;
  phone_number: string | null;
  call_type: string;
  timestamp: string | null;
  duration: string | null;
  audio_url: string | null;
  is_key_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_messages */
export interface DbPhoneMessage {
  id: string;
  case_slug: string;
  thread_key: string;
  thread_name: string;
  thread_phone: string | null;
  sender: string;
  role: string;
  body: string;
  timestamp: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  attachment_type: string | null;
  attachment_url: string | null;
  attachment_duration: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_photos */
export interface DbPhonePhoto {
  id: string;
  case_slug: string;
  photo_code: string | null;
  label: string;
  image_url: string;
  taken_at: string | null;
  description: string | null;
  exif_json: Record<string, unknown> | null;
  is_evidence: boolean;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_notes */
export interface DbPhoneNote {
  id: string;
  case_slug: string;
  title: string;
  body: string;
  is_pinned: boolean;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_bank_transactions */
export interface DbPhoneBankTx {
  id: string;
  case_slug: string;
  tx_type: string;
  amount: number;
  counterparty: string;
  note: string | null;
  timestamp: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  balance_after: number | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_browser_history */
export interface DbPhoneBrowserHistory {
  id: string;
  case_slug: string;
  title: string;
  url: string | null;
  visited_at: string | null;
  favicon_url: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}
```

Cập nhật `CaseCharacterDevice` trong `lib/types/database.ts`:

```ts
export interface CaseCharacterDevice {
  label?: string;
  model?: string;
  lastUpdated?: string;
  description?: string;
  // Mới — Phone Studio
  chassis?: "iphone_classic" | "iphone_modern" | "android_vintage";
  wallpaper_url?: string;
  lockscreen_url?: string;
  selfie_url?: string;
  passcode?: string;
  status_bar?: {
    time?: string;
    battery?: number;
    service_text?: string;
  };
  lock_screen?: {
    time?: string;
    date?: string;
  };
  settings_info?: Record<string, string>;
}
```

---

## 3. API Endpoints — Thay thế `/api/phone`

### 3.1. `GET /api/phone-data/apps?caseId=<slug>`

Trả `case_phone_apps` sắp theo `is_dock`, `slot_index`.

### 3.2. `GET /api/phone-data/[tab]?caseId=<slug>`

`tab` = `contacts | calls | messages | photos | notes | bank | browser`

Đọc bảng Supabase tương ứng, sắp theo `slot_index`. Trả format tương thích `usePhoneData`.

### 3.3. Migration strategy — Feature flag

Thêm hàm kiểm tra: `hasPhoneDataInSupabase(caseSlug)` — đếm row `case_phone_apps WHERE case_slug = ?`.

- Có data Supabase → dùng API mới `/api/phone-data/*`
- Không có → fallback `/api/phone` (Google Sheets)

Hook `usePhoneData` kiểm tra trước, chọn nguồn. Case mới tạo qua Studio luôn dùng Supabase. Case_000 ban đầu vẫn dùng Sheets, chạy migration script seed xong thì chuyển.

### 3.4. Server actions cho Studio

```
lib/actions/phone-actions.ts
```

- `getPhoneApps(caseSlug)` — đọc apps
- `upsertPhoneApp(data)` — tạo/sửa app
- `deletePhoneApp(id)` — xóa app
- `reorderPhoneApps(caseSlug, items: {id, slot_index, is_dock}[])` — đổi thứ tự
- `getPhoneContacts(caseSlug)` — đọc danh bạ
- `upsertPhoneContact(data)` — tạo/sửa
- `deletePhoneContact(id)` — xóa
- (tương tự cho calls, messages, photos, notes, bank, browser)
- `duplicatePhoneData(fromSlug, toSlug)` — nhân bản toàn bộ phone data (gọi trong `duplicateCase`)

---

## 4. Runtime Refactor — Phone Engine đọc DB

### 4.1. `home-screen.tsx`

**Hiện tại:** Hardcode 15 app.
**Sau:** Nhận `apps: DbCasePhoneApp[]` từ props (hoặc context). Chia `gridApps` / `dockApps` theo `is_dock`. Render theo `slot_index`.

```tsx
interface IPhoneHomeScreenProps {
  onOpenApp: (app: IPhoneApp) => void;
  apps: DbCasePhoneApp[]; // MỚI
  completedCheckpoints?: Set<string>; // MỚI — kiểm tra unlock
}
```

App bị khoá (`is_locked && !completedCheckpoints.has(unlock_checkpoint_id)`): icon mờ + badge khoá.

Icon fallback: nếu `icon_url` null → dùng map mặc định `DEFAULT_APP_ICONS[app_type]` (giữ icon hiện tại làm fallback, di chuyển từ hardcode sang object map).

### 4.2. `iphone-classic-chassis.tsx`

**Hiện tại:** Wallpaper hardcode `bg-[url('/images/cases/case_000/phone/clean_beach_wallpaper.png')]`.
**Sau:** Nhận `wallpaperUrl?: string` qua props. Dùng inline style `backgroundImage`.

```tsx
export interface ChassisProps {
  children: React.ReactNode;
  onHomePress?: () => void;
  onPowerPress?: () => void;
  frameless?: boolean;
  className?: string;
  wallpaperUrl?: string; // MỚI
}
```

CSS: bỏ `bg-url-placeholder` khỏi className, thêm `style={{ backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined }}` vào `data-phone-screen` div.

### 4.3. `camera-app.tsx`

**Hiện tại:** Monkey selfie hardcode.
**Sau:** Nhận `selfieUrl?: string` qua props hoặc context. Fallback: nếu null → ẩn easter egg.

### 4.4. `phone-simulator.tsx`

**Hiện tại:** Luôn render `IPhoneClassicChassis`. Status bar/lock screen hardcode.
**Sau:**

1. **Chassis switching**: Switch `device.chassis` → `IPhoneClassicChassis` | `ModernPhoneChassis`. Default `iphone_classic`.
2. **Status bar**: `time={device.status_bar?.time}`, `batteryLevel={device.status_bar?.battery}`, `serviceText={device.status_bar?.service_text}`.
3. **Lock screen**: `time={device.lock_screen?.time}`, `date={device.lock_screen?.date}`.
4. **Settings app**: Đọc `device.settings_info` thay hardcode.
5. **Home screen**: Pass `apps` prop từ fetch `/api/phone-data/apps`.

### 4.5. `PhoneProvider` & data loading

Thêm state `phoneApps` và `phoneDataSource` vào context. Fetch apps khi mount:

```tsx
// Trong component cha (phone-content-wrapper hoặc evidence page)
const { data: apps } = usePhoneApps(caseId);
// Pass vào PhoneSimulator → PhoneProvider → HomeScreen
```

Hook mới: `lib/hooks/use-phone-apps.ts`

```ts
export function usePhoneApps(caseId: string) {
  // Fetch /api/phone-data/apps?caseId=...
  // Fallback: trả DEFAULT_CASE_000_APPS nếu API trả rỗng
}
```

---

## 5. Studio UI — `/studio/phone`

### 5.1. Route

```
app/(admin)/studio/phone/page.tsx
```

### 5.2. Layout 3 cột

```
┌──────────────┬─────────────────────┬──────────────┐
│  Sidebar     │   Editor chính      │  Preview     │
│              │                     │              │
│ Case picker  │ Tab: Device | Apps  │  iPhone      │
│ Device info  │      | Content      │  frame       │
│              │                     │  (live)      │
│              │                     │              │
└──────────────┴─────────────────────┴──────────────┘
```

**Mobile:** 1 cột, tab switching giữa Editor và Preview.

### 5.3. Tab "Device" (Thông tin thiết bị)

Form fields:

- **Chassis**: dropdown `iphone_classic | iphone_modern | android_vintage`
- **Wallpaper**: upload ảnh (Supabase Storage bucket `phone-assets`) + preview
- **Selfie (Camera easter egg)**: upload ảnh
- **Lock screen**: time input, date input
- **Status bar**: time, battery (slider 0-100), service text
- **Settings info**: key-value editor (SĐT, IMEI, cảm biến, ...)
- **Passcode**: text input + hint

Lưu vào `case_characters.device` JSONB cho nhân vật nạn nhân (hoặc nhân vật có `device` data).

### 5.4. Tab "Apps" (App launcher)

- Bảng toàn bộ app types có sẵn (15 loại)
- Mỗi dòng: checkbox bật/tắt, tên hiển thị (editable), icon (upload hoặc dùng mặc định), vị trí (drag reorder), dock toggle, locked toggle + checkpoint picker
- Nút "Thêm tất cả mặc định" seed 15 app chuẩn iOS cho case mới

### 5.5. Tab "Content" (Nội dung từng app)

Sub-tabs: Tin nhắn | Cuộc gọi | Danh bạ | Ảnh | Ghi chú | Ngân hàng | Safari

Mỗi sub-tab:

- **Tin nhắn**: tạo thread (thread_key, tên, SĐT), thêm tin nhắn trong thread (sender, role, body, timestamp, attachment upload). Đánh dấu manh mối (is_clue + code + title + analysis).
- **Cuộc gọi**: bảng inline (contact, SĐT, loại, thời gian, duration, audio upload, manh mối).
- **Danh bạ**: bảng inline (tên, SĐT, danh mục, ghi chú, avatar upload). Dropdown chọn từ `case_characters` để auto-fill.
- **Ảnh**: lưới upload (batch upload Supabase Storage), gắn photo_code, label, mô tả, EXIF, đánh dấu chứng cứ.
- **Ghi chú**: textarea markdown, preview iOS note style.
- **Ngân hàng**: bảng giao dịch (loại, số tiền, bên đối tác, ghi chú, timestamp, manh mối).
- **Safari**: bảng lịch sử (title, url, thời gian, favicon, manh mối).

### 5.6. Preview cột phải

Nhúng `<PhoneSimulator>` với dữ liệu từ state Studio (truyền trực tiếp qua props, không qua API). Khi admin sửa → preview cập nhật ngay (WYSIWYG).

Scale nhỏ hơn (0.6-0.7) để vừa cột preview.

---

## 6. Script migration Google Sheets → Supabase

### `scripts/ops/migrate-phone-sheets.mjs`

1. Gọi `/api/phone?tab=contacts&caseId=case_000` → parse → insert `phone_contacts`
2. Gọi `/api/phone?tab=calls&caseId=case_000` → parse → insert `phone_calls`
3. Gọi `/api/phone?tab=messages&caseId=case_000` → parse → insert `phone_messages`
4. Gọi `/api/phone?tab=photos&caseId=case_000` → parse → insert `phone_photos`
5. Gọi `/api/phone?tab=apps&caseId=case_000` → parse → insert `case_phone_apps` (nếu chưa seed)

Không tự chạy. Xuất SQL vào `data/_review/phone-migration.sql` để chủ dự án review.

---

## 7. `duplicateCase` mở rộng

Cập nhật `lib/actions/case-actions.ts` → `duplicateCase()`:

Thêm bảng cần nhân bản:

- `case_phone_apps`
- `phone_contacts`
- `phone_calls`
- `phone_messages`
- `phone_photos`
- `phone_notes`
- `phone_bank_transactions`
- `phone_browser_history`

Pattern giống code hiện tại: đọc từ `fromSlug`, thay `case_slug` → `toSlug`, insert hàng loạt.

---

## 8. Supabase Storage — Bucket `phone-assets`

Tạo bucket `phone-assets` (public read, admin write):

- `/phone-assets/<case_slug>/wallpaper.webp`
- `/phone-assets/<case_slug>/selfie.webp`
- `/phone-assets/<case_slug>/icons/<app_type>.png`
- `/phone-assets/<case_slug>/photos/<photo_code>.webp`
- `/phone-assets/<case_slug>/audio/<call_code>.mp3`
- `/phone-assets/<case_slug>/attachments/<msg_id>.webp`

Nén client-side trước upload (WebP, max 1920px).

---

## 9. Thứ tự thực hiện (chia giai đoạn)

### Giai đoạn 1 — Schema + Device profile (2-3 ngày)

| Bước | Việc                                       | File chính                                  |
| ---- | ------------------------------------------ | ------------------------------------------- |
| P1   | Viết migration 30 (`case_phone_apps`)      | `db/schema/30_case_phone_apps.sql`          |
| P2   | Viết migration 31 (`phone_*` data tables)  | `db/schema/31_phone_data_tables.sql`        |
| P3   | Viết migration 32 (mở rộng `device` JSONB) | `db/schema/32_device_profile_extend.sql`    |
| P4   | Viết migration 33 (seed apps case_000)     | `db/schema/33_seed_phone_apps_case_000.sql` |
| P5   | Cập nhật types `lib/types/database.ts`     | Thêm interfaces                             |
| P6   | Cập nhật `CaseCharacterDevice` type        | `lib/types/database.ts`                     |
| P7   | Viết script migration Sheets→DB            | `scripts/ops/migrate-phone-sheets.mjs`      |

**Chưa chạy migration. Chưa đổi runtime.**

### Giai đoạn 2 — API + Runtime refactor (3-4 ngày)

| Bước | Việc                                                                               | File chính                                           |
| ---- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P8   | API endpoints `/api/phone-data/*`                                                  | `app/api/phone-data/apps/route.ts`, `[tab]/route.ts` |
| P9   | Server actions `lib/actions/phone-actions.ts`                                      | CRUD cho tất cả bảng                                 |
| P10  | Hook `usePhoneApps`                                                                | `lib/hooks/use-phone-apps.ts`                        |
| P11  | Refactor `home-screen.tsx` → đọc apps DB                                           | Bỏ hardcode 15 icon                                  |
| P12  | Refactor `iphone-classic-chassis.tsx` → wallpaper từ props                         | Bỏ bg-url cứng                                       |
| P13  | Refactor `camera-app.tsx` → selfie từ props/context                                | Bỏ monkey_selfie path cứng                           |
| P14  | Refactor `phone-simulator.tsx` → chassis switch, status bar, lock screen, settings | Đọc device JSONB                                     |
| P15  | Feature flag `usePhoneData` → chọn Supabase/Sheets                                 | `lib/hooks/use-phone-data.ts`                        |
| P16  | Mở rộng `duplicateCase` nhân bản phone data                                        | `lib/actions/case-actions.ts`                        |
| P17  | Tạo Storage bucket `phone-assets` + RLS                                            | Supabase Dashboard hoặc migration                    |

**Done:** case_000 chạy bình thường (fallback Sheets hoặc seeded DB). Case mới đọc từ DB.

### Giai đoạn 3 — Studio UI (4-5 ngày)

| Bước | Việc                                            | File chính                                              |
| ---- | ----------------------------------------------- | ------------------------------------------------------- |
| P18  | Route + layout 3 cột                            | `app/(admin)/studio/phone/page.tsx`                     |
| P19  | Tab Device: form thông tin thiết bị             | `components/admin/phone-studio/device-form.tsx`         |
| P20  | Tab Apps: app launcher editor                   | `components/admin/phone-studio/app-launcher-editor.tsx` |
| P21  | Tab Content > Tin nhắn: thread + message editor | `components/admin/phone-studio/messages-editor.tsx`     |
| P22  | Tab Content > Cuộc gọi                          | `components/admin/phone-studio/calls-editor.tsx`        |
| P23  | Tab Content > Danh bạ                           | `components/admin/phone-studio/contacts-editor.tsx`     |
| P24  | Tab Content > Ảnh (batch upload)                | `components/admin/phone-studio/photos-editor.tsx`       |
| P25  | Tab Content > Ghi chú + Ngân hàng + Safari      | `components/admin/phone-studio/misc-editors.tsx`        |
| P26  | Preview panel nhúng `PhoneSimulator`            | Trong `page.tsx`, cột phải                              |
| P27  | Sidebar admin thêm mục "Điện thoại"             | `components/admin/admin-sidebar.tsx`                    |

### Giai đoạn 4 — Polish + Docs (1-2 ngày)

| Bước | Việc                                                         |
| ---- | ------------------------------------------------------------ |
| P28  | E2E: test mở phone case_000 → home screen hiện đủ app        |
| P29  | E2E: test tạo case mới → add app qua Studio → phone render   |
| P30  | Docs `docs/core_specs/20_phone_studio.md`                    |
| P31  | Cập nhật `CHANGELOG.md`, `HANDOFF_ROADMAP.md`, `TECHDEBT.md` |

---

## 10. Phân công đề xuất

| Giai đoạn   | Claude                       | Model khác            |
| ----------- | ---------------------------- | --------------------- |
| 1 (Schema)  | P1-P4 migration, P5-P6 types | P7 migration script   |
| 2 (Runtime) | P8-P10, P14, P15, P16        | P11-P13, P17          |
| 3 (Studio)  | P18, P21, P26                | P19-P20, P22-P25, P27 |
| 4 (Polish)  | P28-P29                      | P30-P31               |

---

## 11. Ràng buộc & Rủi ro

| Ràng buộc                    | Giải pháp                                    |
| ---------------------------- | -------------------------------------------- |
| Không tự chạy migration      | Viết SQL, chủ dự án duyệt                    |
| Không tự push                | Commit khi done, chủ dự án push              |
| Case_000 không được hỏng     | Feature flag Sheets/DB; E2E 9/9 phải pass    |
| Supabase Storage 1GB free    | Nén WebP client-side; theo dõi quota         |
| GM upload ảnh sai kích thước | Client-side resize + crop trước upload       |
| `next/font/google` cấm       | Không liên quan (không thêm font)            |
| `import type` bắt buộc       | Mọi interface import phải dùng `import type` |
| Không `autoFocus` modal      | Studio form không autoFocus                  |
| Chỉ dùng pnpm                | Không cài dependency mới                     |

---

## 12. Điều kiện "Done"

1. `npx tsc --noEmit --incremental false` sạch.
2. `pnpm test:e2e` 9/9+ pass (thêm test phone nếu có).
3. Case_000 phone mở bình thường, 15 app hiện đủ, tin nhắn/cuộc gọi/ảnh đầy đủ.
4. Case mới tạo qua Studio → phone có app, có nội dung, preview WYSIWYG.
5. `duplicateCase` nhân bản phone data.
6. Cập nhật docs.
7. Không gây regression.
