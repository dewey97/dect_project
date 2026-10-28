# Cấu trúc Cơ sở dữ liệu (Database Architecture)

> **Hệ thống Database Supabase (PostgreSQL) — Kiến trúc Tinh gọn (5 Core Tables)**  
> _Toàn bộ nội dung vụ án (nhân vật, checkpoint, đáp án, vật chứng, hồ sơ, điện thoại, bản đồ) lưu trong Supabase và biên tập qua Studio (`/studio/*`). Xem [`21_studio_authoring_guide.md`](../studio/authoring_guide.md) cho bảng trường nhập ↔ cột DB._

---

## 1. Core Registry (Quản lý Danh mục Vụ án)

### Table: `cases`

Lưu trữ thông tin metadata bao quát của các Vụ án trong hệ thống.

| Tên Cột           | Kiểu Dữ liệu  | Mô tả                                                                | Mặc định            |
| :---------------- | :------------ | :------------------------------------------------------------------- | :------------------ |
| `id`              | `UUID`        | Khóa chính (Primary Key).                                            | `gen_random_uuid()` |
| `title`           | `TEXT`        | Tên vụ án (VD: TRỐN TÌM).                                            | -                   |
| `synopsis`        | `TEXT`        | Tóm tắt ngắn gọn dành cho người chơi.                                | -                   |
| `full_story`      | `TEXT`        | Cốt truyện chi tiết ẩn (Dành riêng cho Game Master).                 | -                   |
| `difficulty`      | `SMALLINT`    | Độ khó (Từ 1 đến 5 sao).                                             | `1`                 |
| `status`          | `TEXT`        | Trạng thái hiển thị (`DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED`). | `DRAFT`             |
| `cover_image_url` | `TEXT`        | Đường dẫn CDN trỏ tới ảnh bìa vụ án.                                 | -                   |
| `created_at`      | `TIMESTAMPTZ` | Thời gian tạo.                                                       | `NOW()`             |
| `updated_at`      | `TIMESTAMPTZ` | Thời gian cập nhật gần nhất.                                         | `NOW()`             |
| `slug`            | `TEXT`        | Mã nghiệp vụ duy nhất (`case_000`), `^[a-z0-9_]{1,64}$`.             | Trigger tự cấp      |

**Mã vụ án (`db/schema/22_case_slug.sql`)**

- `slug` là khóa tham chiếu của mọi bảng nội dung: `case_checkpoints.case_id`, `case_dossiers.case_id`, `dossier_documents.case_id`, `case_characters.case_slug`, `boardgame_pins.case_id`, `boardgame_connections.case_id` (FK `ON UPDATE CASCADE`, `ON DELETE RESTRICT`).
- INSERT không truyền `slug` thì trigger `assign_case_slug` cấp số kế tiếp (`case_001`, `case_002`...). App không tự đếm.
- Xóa vụ án còn nội dung sẽ bị DB chặn (lỗi `23503`); xóa nội dung trước.
- `boardgame_pins` / `boardgame_connections` đã được chuẩn hóa `case-000` -> `case_000` và gắn FK qua migration 29 (`29_boardgame_pins_case_slug_fk.sql`). `board-actions.ts` dùng trực tiếp `normalizeCaseId()`.
- Code chuẩn hóa mọi mã đầu vào qua `normalizeCaseId()` (`lib/cases/case-id.ts`). URL gameplay: `/evidence/web?case_id=<slug>`; Studio: `?case=<slug>`.

### Table: `case_characters`

Danh sách nhân vật theo vụ án (`db/schema/23_case_characters.sql`). Gameplay nạp qua `GET /api/characters?caseId=` trong `CaseCharactersProvider` trước khi render bàn điều tra; Studio biên tập tại `/studio/characters`.

| Tên Cột       | Kiểu Dữ liệu | Mô tả                                                                                 |
| :------------ | :----------- | :------------------------------------------------------------------------------------ |
| `case_slug`   | `TEXT`       | FK `cases.slug`.                                                                      |
| `key`         | `TEXT`       | Mã ngắn không dấu (`vu`, `ha`), duy nhất trong vụ án; khớp ảnh `avatar_<key>`.        |
| `name`        | `TEXT`       | Họ tên đầy đủ.                                                                        |
| `aliases`     | `TEXT[]`     | Các cách gõ tên để so khớp câu trả lời (so khớp không dấu).                           |
| `role`        | `TEXT`       | `victim`, `suspect`, `witness`, `related`. Nạn nhân bị loại khỏi danh sách nghi phạm. |
| `description` | `TEXT`       | Quan hệ / nghề nghiệp.                                                                |
| `avatar_code` | `TEXT`       | Mã ảnh trên tab `evidences`.                                                          |
| `phones`      | `TEXT[]`     | SĐT (chỉ chữ số). Dùng để nhận diện manh mối SĐT theo 3 số cuối.                      |
| `slot_index`  | `INTEGER`    | Thứ tự trên bàn điều tra.                                                             |
| `device`      | `JSONB`      | Điện thoại tang vật của nạn nhân: `label`, `model`, `lastUpdated`, `description`.     |

RLS: đọc công khai, ghi chỉ admin (`private.is_admin()`).

---

## 2. Players & Security (Người dùng & Phân quyền)

### Table: `profiles`

Mở rộng thông tin định danh người dùng từ `auth.users` của Supabase.

| Tên Cột        | Kiểu Dữ liệu  | Mô tả                                                                                                              | Mặc định   |
| :------------- | :------------ | :----------------------------------------------------------------------------------------------------------------- | :--------- |
| `id`           | `UUID`        | Khóa chính, khớp với User ID của Supabase Auth.                                                                    | -          |
| `display_name` | `TEXT`        | Tên hiển thị của thám tử.                                                                                          | -          |
| `avatar_url`   | `TEXT`        | Ảnh đại diện.                                                                                                      | -          |
| `role`         | `TEXT`        | Quyền hạn (`player`, `admin`). Hệ thống dùng biến này để xác thực quyền vào Admin Studio qua `requireAdminAuth()`. | `'player'` |
| `created_at`   | `TIMESTAMPTZ` | Thời điểm tham gia.                                                                                                | `NOW()`    |

### Phân quyền RLS (`db/schema/21_security_hardening_rls.sql`)

- `private.is_admin()` (SECURITY DEFINER, schema `private` — không expose qua PostgREST/RPC): `true` khi JWT `app_metadata.role` là `admin`/`super_admin` hoặc `profiles.role = 'admin'`. Mọi policy ghi của admin dùng hàm này.
- `profiles`: chỉ chủ tài khoản hoặc admin đọc được. User tự tạo profile với `role = 'player'`. Qua API công khai chỉ sửa được `display_name`, `avatar_url`; đổi `role` phải dùng dashboard hoặc `service_role`.
- `cases`, `dossier_documents`, `case_dossiers`, `app_settings`: đọc công khai, ghi chỉ admin.
- `feedbacks`: ai cũng gửi được; chỉ admin đọc và cập nhật.
- `play_sessions`: người chơi thao tác phiên của mình; admin thao tác tất cả.
- Bucket `avatars`: đọc công khai, ghi chỉ admin.
- Bảo mật đáp án (migration 48 `48_checkpoint_answers_server_only.sql`): bỏ policy public read của migration 18 và bỏ view `case_checkpoints_public`. `case_checkpoints` chỉ đọc được bằng `service_role` hoặc admin (policy migration 16). Gameplay đọc qua `/api/checkpoints`, route này dùng service role và lọc `answer_config` theo allowlist (`lib/checkpoints/public-checkpoint.ts`): giữ `options`, nhãn ô nhập, `availableEvidences`, `epilogueStories`, `unlocksDossier`, `photoCodes`, cờ `hasMotive`/`hasContradiction`; bỏ mọi đáp án và cột `ai_*`. Chấm điểm qua `/api/checkpoints/verify` và `/api/scan-answer`.
- Chưa khóa: `game_rooms` (chơi nhóm cần ghi công khai).
- Server phải tự kiểm tra quyền trước khi ghi: `requireAdminAuth()` trong server action, `denyIfNotAdmin()` (`lib/security/admin-route-guard.ts`) trong Route Handler.

### Table: `play_sessions`

Lưu lại lịch sử phiên chơi và tiến trình của tài khoản.

| Tên Cột        | Kiểu Dữ liệu  | Mô tả                                                    | Mặc định            |
| :------------- | :------------ | :------------------------------------------------------- | :------------------ |
| `id`           | `UUID`        | Khóa chính.                                              | `gen_random_uuid()` |
| `player_id`    | `UUID`        | Foreign Key trỏ về `profiles(id)`.                       | -                   |
| `case_id`      | `UUID`        | Foreign Key trỏ về `cases(id)`.                          | -                   |
| `status`       | `TEXT`        | Trạng thái phá án (`PLAYING`, `COMPLETED`, `ABANDONED`). | `'PLAYING'`         |
| `score`        | `INT`         | Điểm số tổng kết sau khi nộp hồ sơ.                      | `0`                 |
| `started_at`   | `TIMESTAMPTZ` | Thời điểm bắt đầu chơi.                                  | `NOW()`             |
| `completed_at` | `TIMESTAMPTZ` | Thời điểm hoàn thành vụ án.                              | -                   |

---

## 3. Operations & System Settings (Vận hành & Phản hồi)

### Table: `feedbacks`

Lưu trữ góp ý, báo lỗi và đánh giá được người chơi gửi trực tiếp từ modal feedback trong game.

| Tên Cột        | Kiểu Dữ liệu  | Mô tả                                                           | Mặc định            |
| :------------- | :------------ | :-------------------------------------------------------------- | :------------------ |
| `id`           | `UUID`        | Khóa chính.                                                     | `gen_random_uuid()` |
| `case_id`      | `TEXT`        | Mã định danh vụ án (VD: `case_000`).                            | -                   |
| `type`         | `TEXT`        | Phân loại (`BUG`, `TYPO`, `FEEDBACK`, `RATING`, `OTHER`).       | `'FEEDBACK'`        |
| `rating_score` | `INT`         | Số sao đánh giá (1 đến 5 sao).                                  | -                   |
| `content`      | `TEXT`        | Nội dung phản hồi / mô tả lỗi.                                  | -                   |
| `contact_info` | `TEXT`        | Email hoặc SĐT người chơi để lại.                               | -                   |
| `status`       | `TEXT`        | Trạng thái xử lý (`NEW`, `IN_PROGRESS`, `RESOLVED`, `IGNORED`). | `'NEW'`             |
| `created_at`   | `TIMESTAMPTZ` | Thời điểm gửi.                                                  | `NOW()`             |
| `resolved_at`  | `TIMESTAMPTZ` | Thời điểm hoàn tất xử lý.                                       | -                   |

### Table: `app_settings`

Cấu hình vận hành toàn cục của ứng dụng (Hiển thị và chỉnh sửa tại `/studio/settings`).

| Tên Cột            | Kiểu Dữ liệu  | Mô tả                                              | Mặc định |
| :----------------- | :------------ | :------------------------------------------------- | :------- |
| `id`               | `INT`         | Khóa chính (Cố định `1` cho toàn hệ thống).        | `1`      |
| `maintenance_mode` | `BOOLEAN`     | Bật/tắt chế độ bảo trì hệ thống.                   | `false`  |
| `banner_active`    | `BOOLEAN`     | Bật/tắt dải băng thông báo vàng trên Landing Page. | `true`   |
| `banner_text`      | `TEXT`        | Nội dung hiển thị trên Banner thông báo.           | -        |
| `updated_at`       | `TIMESTAMPTZ` | Thời điểm cập nhật cấu hình gần nhất.              | `NOW()`  |

---

## 4. Investigation Board Layout (Lưu vết Layout Ghim & Dây Chỉ Đỏ Admin Setup)

### Table: `boardgame_pins`

Lưu trữ vị trí, nhãn, màu sắc và góc xoay/tỉ lệ transform của các Ghim do Admin bố trí.

| Tên Cột        | Kiểu Dữ liệu  | Mô tả                                                | Mặc định |
| :------------- | :------------ | :--------------------------------------------------- | :------- |
| `id`           | `TEXT`        | Khóa chính (VD: `c0-pin-evidence`, `admin-pin-123`). | -        |
| `case_id`      | `TEXT`        | Mã vụ án (VD: `case-000`).                           | -        |
| `position_x`   | `FLOAT8`      | Tọa độ X tương đối (0.0 - 1.0).                      | -        |
| `position_y`   | `FLOAT8`      | Tọa độ Y tương đối (0.0 - 1.0).                      | -        |
| `label`        | `TEXT`        | Tiêu đề ghim.                                        | -        |
| `detail`       | `TEXT`        | Mô tả chi tiết ghim.                                 | -        |
| `color`        | `TEXT`        | Màu ghim/thẻ.                                        | -        |
| `note_color`   | `TEXT`        | Màu nốt giấy dính (`yellow`, `white`, ...).          | -        |
| `pin_color`    | `TEXT`        | Màu ghim nhựa.                                       | -        |
| `photo_url`    | `TEXT`        | Đổ ảnh polaroid/vật chứng.                           | -        |
| `is_locked`    | `BOOLEAN`     | Trạng thái khóa.                                     | `false`  |
| `is_solved`    | `BOOLEAN`     | Trạng thái đã giải.                                  | `false`  |
| `pulse_border` | `BOOLEAN`     | Viền nhấp nháy chú ý.                                | `false`  |
| `rotation`     | `FLOAT8`      | Góc xoay (độ, -45 đến 45).                           | `0`      |
| `scale`        | `FLOAT8`      | Tỉ lệ phóng to (0.3 đến 2.5).                        | `1.0`    |
| `updated_at`   | `TIMESTAMPTZ` | Thời điểm cập nhật.                                  | `NOW()`  |

### Table: `boardgame_connections`

Lưu vết các sợi dây chỉ đỏ nối giữa 2 ghim do Admin cài đặt thủ công.

| Tên Cột       | Kiểu Dữ liệu  | Mô tả                                    | Mặc định |
| :------------ | :------------ | :--------------------------------------- | :------- |
| `id`          | `TEXT`        | Khóa chính (VD: `admin-conn-pin1-pin2`). | -        |
| `case_id`     | `TEXT`        | Mã vụ án.                                | -        |
| `from_pin_id` | `TEXT`        | ID ghim nguồn.                           | -        |
| `to_pin_id`   | `TEXT`        | ID ghim đích.                            | -        |
| `updated_at`  | `TIMESTAMPTZ` | Thời điểm cập nhật.                      | `NOW()`  |

---

## 5. Runtime Data Tables (Dữ liệu Runtime Đã Chuyển Từ File Sang Supabase — Migration 24)

Nhằm đảm bảo dữ liệu không bị mất khi deploy container Docker (không gắn volume), các dữ liệu runtime trước đây ghi vào file JSON trong `data/` đã được chuyển sang Supabase:

### Table: `map_vectors`

Bản đồ vector thế giới mở rộng dùng chung duy nhất (`data/maps/world_vector_map.json`).

| Tên Cột      | Kiểu Dữ liệu  | Mô tả                                                        | Mặc định  |
| :----------- | :------------ | :----------------------------------------------------------- | :-------- |
| `id`         | `TEXT`        | Khóa chính định danh bản đồ (`world`).                       | `'world'` |
| `data`       | `JSONB`       | Dữ liệu hình học vector (water, roads, buildings, pois,...). | -         |
| `updated_at` | `TIMESTAMPTZ` | Thời điểm cập nhật cấu hình bản đồ.                          | `NOW()`   |

RLS: Đọc công khai (`anon`, `authenticated`), Ghi chỉ admin (`private.is_admin()`).

### Table: `reinvestigation_hotspots`

Danh sách điểm khám xét lại hiện trường (hotspots 2D / 360) theo từng vụ án (`data/<case_slug>_hotspots.json`).

| Tên Cột      | Kiểu Dữ liệu  | Mô tả                                                      | Mặc định |
| :----------- | :------------ | :--------------------------------------------------------- | :------- |
| `case_slug`  | `TEXT`        | Khóa chính, FK `cases.slug` (CASCADE/RESTRICT).            | -        |
| `hotspots`   | `JSONB`       | Mảng đối tượng điểm tương tác (tọa độ, ảnh gán, âm thanh). | -        |
| `updated_at` | `TIMESTAMPTZ` | Thời điểm lưu cấu hình gần nhất.                           | `NOW()`  |

RLS: Đọc công khai (`anon`, `authenticated`), Ghi chỉ admin (`private.is_admin()`).

### Table: `waitlist_entries`

Danh sách email đăng ký nhận thông tin sớm (`data/waitlist_pending.json`).

| Tên Cột      | Kiểu Dữ liệu  | Mô tả                                                      | Mặc định            |
| :----------- | :------------ | :--------------------------------------------------------- | :------------------ |
| `id`         | `UUID`        | Khóa chính.                                                | `gen_random_uuid()` |
| `email`      | `TEXT`        | Địa chỉ email hợp lệ.                                      | -                   |
| `source`     | `TEXT`        | Nguồn đăng ký (VD: `landing_hero`).                        | `'landing_hero'`    |
| `ip`         | `TEXT`        | IP người đăng ký (ghi nhận phục vụ rate-limit/chống spam). | -                   |
| `created_at` | `TIMESTAMPTZ` | Thời điểm đăng ký.                                         | `NOW()`             |

Ràng buộc: `UNIQUE(email, source)`.  
RLS: Thêm công khai (`anon`, `authenticated`), Đọc/sửa/xóa chỉ admin (`private.is_admin()`).

---

## 📌 Ghi Chú Chuyển Đổi Kiến Trúc (Architecture Note)

Toàn bộ các bảng sau trong phiên bản thử nghiệm ban đầu **đã được lược bỏ và dọn sạch khỏi database**:

- `characters`, `relationships`, `timeline_events`, `locations`: thay bằng `case_characters` và dữ liệu Studio trên Supabase.
- `evidence_nodes`, `evidence_edges`: Đã gộp vào `boardgame_pins` & `boardgame_connections` cho bảng canvas trinh thám.
- `player_answers`: Lưu vết cục bộ qua Client State và LocalStorage theo nguyên tắc Zero-Black-Screen / Online-First.

---

## 4. Bảng điều tra động (Board Nodes & Config)

### Table: `case_board_nodes` (`db/schema/39_board_nodes.sql`)

Lưu trữ các node cố định và ghi chú bổ sung theo từng vụ án:

| Tên Cột | Kiểu Dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `TEXT` | Khóa chính dạng `${caseSlug}:${nodeKind}:${slotIndex}` |
| `case_id` | `TEXT` | FK `cases.slug` |
| `node_kind` | `TEXT` | `victim`, `victim_phone`, `reinvestigate`, `suspects_hub`, `evidence_hub`, `custom_note` |
| `title` | `TEXT` | Nhãn hiển thị trên node ghi chú |
| `slot_index` | `INTEGER` | Thứ tự hiển thị |
| `config` | `JSONB` | Tọa độ x, y, note_style, photo_url, connections |

### Table: `case_checkpoints` bổ sung `board_config` (`JSONB`)

Cột `board_config` lưu trữ tọa độ tùy chỉnh `{ "position": { "x": 0.42, "y": 0.27 } }` cho từng checkpoint khi hiển thị trên bàn điều tra.
