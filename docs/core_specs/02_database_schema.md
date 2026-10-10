# Cấu trúc Cơ sở dữ liệu (Database Architecture)

> **Hệ thống Database Supabase (PostgreSQL) — Kiến trúc Tinh gọn (5 Core Tables)**  
> _Toàn bộ nội dung kịch bản, dòng thời gian, nhân vật, đáp án checkpoints và vật chứng vụ án được quản lý trực tiếp qua **Google Sheets Live CMS** (Xem chi tiết tại [`03_google_sheets_cms.md`](03_google_sheets_cms.md)). Database Supabase đóng vai trò lưu trữ User Identity, Session, System Settings và Analytics._

---

## 1. Core Registry (Quản lý Danh mục Vụ án)

### Table: `cases`

Lưu trữ thông tin metadata bao quát của các Vụ án trong hệ thống.

| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính (Primary Key). | `gen_random_uuid()` |
| `title` | `TEXT` | Tên vụ án (VD: TRỐN TÌM). | - |
| `synopsis` | `TEXT` | Tóm tắt ngắn gọn dành cho người chơi. | - |
| `full_story` | `TEXT` | Cốt truyện chi tiết ẩn (Dành riêng cho Game Master). | - |
| `difficulty` | `SMALLINT` | Độ khó (Từ 1 đến 5 sao). | `1` |
| `status` | `TEXT` | Trạng thái hiển thị (`DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED`). | `DRAFT` |
| `cover_image_url` | `TEXT` | Đường dẫn CDN trỏ tới ảnh bìa vụ án. | - |
| `created_at` | `TIMESTAMPTZ` | Thời gian tạo. | `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Thời gian cập nhật gần nhất. | `NOW()` |

---

## 2. Players & Security (Người dùng & Phân quyền)

### Table: `profiles`

Mở rộng thông tin định danh người dùng từ `auth.users` của Supabase.

| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính, khớp với User ID của Supabase Auth. | - |
| `display_name` | `TEXT` | Tên hiển thị của thám tử. | - |
| `avatar_url` | `TEXT` | Ảnh đại diện. | - |
| `role` | `TEXT` | Quyền hạn (`player`, `admin`). Hệ thống dùng biến này để xác thực quyền vào Admin Studio qua `requireAdminAuth()`. | `'player'` |
| `created_at` | `TIMESTAMPTZ` | Thời điểm tham gia. | `NOW()` |

### Table: `play_sessions`

Lưu lại lịch sử phiên chơi và tiến trình của tài khoản.

| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `player_id` | `UUID` | Foreign Key trỏ về `profiles(id)`. | - |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. | - |
| `status` | `TEXT` | Trạng thái phá án (`PLAYING`, `COMPLETED`, `ABANDONED`). | `'PLAYING'` |
| `score` | `INT` | Điểm số tổng kết sau khi nộp hồ sơ. | `0` |
| `started_at` | `TIMESTAMPTZ` | Thời điểm bắt đầu chơi. | `NOW()` |
| `completed_at` | `TIMESTAMPTZ` | Thời điểm hoàn thành vụ án. | - |

---

## 3. Operations & System Settings (Vận hành & Phản hồi)

### Table: `feedbacks`

Lưu trữ góp ý, báo lỗi và đánh giá được người chơi gửi trực tiếp từ modal feedback trong game.

| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `case_id` | `TEXT` | Mã định danh vụ án (VD: `case_000`). | - |
| `type` | `TEXT` | Phân loại (`BUG`, `TYPO`, `FEEDBACK`, `RATING`, `OTHER`). | `'FEEDBACK'` |
| `rating_score` | `INT` | Số sao đánh giá (1 đến 5 sao). | - |
| `content` | `TEXT` | Nội dung phản hồi / mô tả lỗi. | - |
| `contact_info` | `TEXT` | Email hoặc SĐT người chơi để lại. | - |
| `status` | `TEXT` | Trạng thái xử lý (`NEW`, `IN_PROGRESS`, `RESOLVED`, `IGNORED`). | `'NEW'` |
| `created_at` | `TIMESTAMPTZ` | Thời điểm gửi. | `NOW()` |
| `resolved_at` | `TIMESTAMPTZ` | Thời điểm hoàn tất xử lý. | - |

### Table: `app_settings`

Cấu hình vận hành toàn cục của ứng dụng (Hiển thị và chỉnh sửa tại `/studio/settings`).

| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | Khóa chính (Cố định `1` cho toàn hệ thống). | `1` |
| `maintenance_mode` | `BOOLEAN` | Bật/tắt chế độ bảo trì hệ thống. | `false` |
| `banner_active` | `BOOLEAN` | Bật/tắt dải băng thông báo vàng trên Landing Page. | `true` |
| `banner_text` | `TEXT` | Nội dung hiển thị trên Banner thông báo. | - |
| `updated_at` | `TIMESTAMPTZ` | Thời điểm cập nhật cấu hình gần nhất. | `NOW()` |

---

## 📌 Ghi Chú Chuyển Đổi Kiến Trúc (Architecture Note)

Toàn bộ các bảng sau trong phiên bản thử nghiệm ban đầu **đã được lược bỏ và dọn sạch khỏi database**:
- `characters`, `relationships`, `timeline_events`, `locations`: Đã quy hoạch 100% vào **Google Sheets Live CMS**.
- `evidence_nodes`, `evidence_edges`, `boardgame_pins`: Đã chuyển sang cấu trúc Mindmap Canvas tĩnh kết hợp API Google Sheets CSV.
- `player_answers`: Lưu vết cục bộ qua Client State và LocalStorage theo nguyên tắc Zero-Black-Screen / Online-First.
