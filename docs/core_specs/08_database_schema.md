# Cấu trúc Cơ sở dữ liệu (Database Architecture)

Tài liệu này mô tả chi tiết toàn bộ các Table (Bảng) trong cơ sở dữ liệu Supabase (PostgreSQL) của hệ thống Detective Game. Hệ thống được chia thành 3 nhóm dữ liệu chính.

---

## 1. Core (Quản lý Vụ án)
Nhóm này chứa thông tin bao quát của một vụ án mạng/kịch bản.

### Table: `cases`
Lưu trữ thông tin metadata của Vụ án.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính (Primary Key). | `gen_random_uuid()` |
| `title` | `TEXT` | Tên vụ án (VD: Lời nguyền Huyết nguyệt). | - |
| `synopsis` | `TEXT` | Tóm tắt ngắn gọn dành cho người chơi. | - |
| `full_story` | `TEXT` | Cốt truyện chi tiết ẩn (Dành riêng cho Game Master). | - |
| `difficulty` | `SMALLINT` | Độ khó (Từ 1 đến 5 sao). | `1` |
| `status` | `TEXT` | Trạng thái hiển thị (`DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED`). | `DRAFT` |
| `cover_image_url`| `TEXT` | Đường dẫn CDN trỏ tới ảnh bìa lưu trên Supabase Storage. | - |
| `created_at` | `TIMESTAMPTZ`| Thời gian tạo. | `NOW()` |
| `updated_at` | `TIMESTAMPTZ`| Thời gian cập nhật gần nhất. | `NOW()` |

---

## 2. Game Data (Dữ liệu thành phần)
Chứa nội dung cấu thành nên vụ án (Thẻ bằng chứng, dòng thời gian, tọa độ bản đồ). Mọi bảng ở đây đều liên kết chặt chẽ với bảng `cases` qua `case_id`.

### Table: `evidence_nodes`
Lưu trữ toàn bộ các Thẻ (Node) xuất hiện trên Evidence Board (Bảng điều tra).
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. Cần khớp với ID sinh ra bởi React Flow. | `gen_random_uuid()` |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. Bị xóa tự động nếu case bị xóa. | - |
| `type` | `TEXT` | Loại thẻ (`evidence` hoặc `question`). | - |
| `position_x` | `FLOAT8` | Tọa độ X trên bảng mạch. | - |
| `position_y` | `FLOAT8` | Tọa độ Y trên bảng mạch. | - |
| `label` | `TEXT` | Tiêu đề hiển thị trên thẻ. | - |
| `description` | `TEXT` | Mô tả chi tiết của Bằng chứng/Câu hỏi. | - |
| `category` | `TEXT` | Nhãn tag (VD: CLUE, FORENSIC, PERSON). | - |
| `logic_data` | `JSONB` | Chứa dữ liệu linh hoạt: Danh sách đáp án, Câu trả lời đúng, Phân loại trắc nghiệm. | `{}` |

### Table: `evidence_edges`
Lưu trữ các sợi dây (chỉ đỏ) nối giữa các Thẻ trên Evidence Board.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. | - |
| `source_node_id` | `TEXT` | ID của thẻ điểm xuất phát. | - |
| `target_node_id` | `TEXT` | ID của thẻ điểm đến. | - |

### Table: `timeline_events`
Lưu trữ các mảnh sự kiện để xây dựng Dòng thời gian.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. | - |
| `character_name` | `TEXT` | Tên nhân vật thực hiện sự kiện. | - |
| `event_title` | `TEXT` | Tên sự kiện (VD: Ăn tối, Đi dạo). | - |
| `location` | `TEXT` | Địa điểm diễn ra sự kiện. | - |
| `start_min` | `INT` | Phút bắt đầu tính từ lúc mở màn (Mở màn = 0). | - |
| `end_min` | `INT` | Phút kết thúc. | - |
| `is_truth` | `BOOLEAN` | Sự kiện thật hay lời khai giả dối. | `true` |
| `is_fatal` | `BOOLEAN` | Đánh dấu sự kiện tử vong (Hiển thị biểu tượng xương sọ). | `false` |

### Table: `locations`
Lưu trữ các địa điểm và tọa độ hiển thị trên Bản đồ tương tác (Interactive Map).
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. | - |
| `title` | `TEXT` | Tên địa điểm/căn phòng. | - |
| `type` | `TEXT` | Phân loại (`CASE`, `LOCATION`, `EVIDENCE`). | - |
| `details` | `TEXT` | Mô tả chi tiết về địa điểm. | - |
| `position_x` | `FLOAT8` | Tọa độ X trên Map. | - |
| `position_y` | `FLOAT8` | Tọa độ Y trên Map. | - |

---

## 3. Players & Progression (Dữ liệu Người chơi)
Hệ thống quản lý người dùng và lưu trữ tiến trình phá án (Game Save).

### Table: `profiles`
Mở rộng thêm thông tin từ bảng `auth.users` mặc định của Supabase.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Bằng với User ID của Supabase Auth. | - |
| `display_name` | `TEXT` | Tên hiển thị trong game. | - |
| `avatar_url` | `TEXT` | Ảnh đại diện. | - |
| `role` | `TEXT` | Chức vụ (`player`, `admin`). Hệ thống dùng biến này để chặn/mở quyền vào Studio. | `player` |

### Table: `play_sessions`
Lưu lại "File Save" của người chơi. Bất kỳ ai bắt đầu chơi 1 vụ án đều tạo ra 1 dòng ở đây.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `player_id` | `UUID` | Foreign Key trỏ về `profiles(id)`. | - |
| `case_id` | `UUID` | Foreign Key trỏ về `cases(id)`. | - |
| `status` | `TEXT` | Trạng thái phá án (`PLAYING`, `COMPLETED`, `ABANDONED`). | `PLAYING` |
| `score` | `INT` | Điểm số tổng kết (nếu trả lời đúng nhiều sẽ cao). | `0` |
| `started_at` | `TIMESTAMPTZ`| Thời điểm bắt đầu chơi. | `NOW()` |
| `completed_at` | `TIMESTAMPTZ`| Thời điểm nộp đáp án cuối cùng. | - |

### Table: `player_answers`
Lưu vết chi tiết tiến trình mở khóa từng thẻ Bằng chứng hoặc lịch sử trả lời Câu hỏi.
| Tên Cột | Kiểu Dữ liệu | Mô tả | Mặc định |
|---|---|---|---|
| `id` | `UUID` | Khóa chính. | `gen_random_uuid()` |
| `session_id` | `UUID` | Trỏ về phiên chơi của user `play_sessions(id)`. | - |
| `player_id` | `UUID` | Trỏ về `profiles(id)`. | - |
| `case_id` | `UUID` | Trỏ về `cases(id)`. | - |
| `node_id` | `UUID` | ID của thẻ Câu hỏi / Bằng chứng được giải mã. | - |
| `submitted_answer` | `TEXT` | Nội dung câu trả lời user nhập vào. | - |
| `is_correct` | `BOOLEAN` | Nhập đúng hay sai (True nếu thẻ đã mở khóa). | `false` |
| `unlocked_at` | `TIMESTAMPTZ`| Thời điểm giải mã thành công thẻ này. | `NOW()` |

> Mọi bảng đều đã được kích hoạt tính năng **Row Level Security (RLS)** để đảm bảo dữ liệu của vụ án chưa xuất bản sẽ không bị rò rỉ ra ngoài qua API, và người chơi không thể sửa điểm số của người khác.

---

## 4. Google Sheets Live CMS (Hệ Thống Quản Trị Nội Dung Live)

Song song với cơ sở dữ liệu Supabase, dự án tích hợp hệ thống **Google Sheets Live CMS** để cho phép biên tập kịch bản vụ án, danh bạ, nhật ký cuộc gọi, tin nhắn, hình ảnh và gợi ý theo thời gian thực mà không cần rebuild code hay redeploy app.

### 📜 Google Sheet ID & Authentication
* **Google Sheet ID**: `1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q`
* **Xác thực**: Google Service Account (`google-service-account.json` & `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
* **API Route xử lý**: [`/api/phone/route.ts`](file:///d:/code_world/dect_project/app/api/phone/route.ts)
* **Custom Hook UI**: [`usePhoneData`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) (Tự động bypass cache HTTP và Next.js Data Cache với header `no-store` & tham số `_t=timestamp`).

### 📑 Danh Mục 11 Tab Tiêu Chuẩn Trong Google Sheet

| Tên Tab Sheet | Đối Tượng / Ứng Dụng UI | Các Cột Dữ Liệu Tiêu Chuẩn (Headers) | Mô Tả & Phạm Vi Sử Dụng |
|---|---|---|---|
| **`contacts`** | Ứng dụng Danh Bạ (`ContactsApp`) | `case_id`, `contact_id`, `name`, `phone_number`, `is_saved`, `category`, `note` | Lưu trữ toàn bộ danh bạ điện thoại nạn nhân Khang (mối quan hệ, ghi chú cá nhân). |
| **`calls`** | Ứng dụng Nhật Ký Cuộc Gọi (`VoicemailApp`) | `case_id`, `call_id`, `contact_name`, `phone_number`, `call_type`, `timestamp`, `duration`, `is_missed` | Nhật ký cuộc gọi đi, gọi đến và cuộc gọi nhỡ (`INCOMING`, `OUTGOING`, `INCOMING_MISSED`). |
| **`messages`** | Ứng dụng Tin Nhắn (`MessagesApp`) | `case_id`, `message_id`, `contact_name`, `phone_number`, `direction`, `content`, `timestamp`, `is_clue`, `clue_title`, `clue_analysis` | Chuỗi hội thoại SMS giữa Khang và các nhân vật, hỗ trợ cờ đánh dấu Manh mối & Báo cáo suy luận. |
| **`photos`** | Ứng dụng Thư Viện Ảnh (`PhotosApp`) | `case_id`, `photo_id`, `filename`, `drive_url`, `timestamp`, `location`, `description`, `size` | Thư viện ảnh vật chứng, hỗ trợ load ảnh trực tiếp từ **URL Google Drive**. |
| **`audios`** | Trình phát ghi âm & Thư thoại | `case_id`, `audio_id`, `title`, `duration`, `speaker`, `audio_url`, `transcript`, `timestamp` | Danh sách các file ghi âm cuộc gọi và băng thư thoại trích xuất. |
| **`characters`** | Hồ sơ Nhân vật & Nghi phạm | `case_id`, `character_id`, `name`, `gender`, `age`, `weight_kg`, `role`, `occupation`, `relation_to_victim`, `alibi`, `motive` | Hồ sơ chi tiết các nhân vật (bao gồm thông tin chiều cao, cân nặng `weight_kg` chuẩn pháp y). |
| **`locations`** | Bản đồ Hiện trường | `case_id`, `location_id`, `name`, `address`, `description`, `position_x`, `position_y`, `source_type` | Tọa độ và thông tin không gian xuất hiện trên React Flow Board & 3D Viewer. |
| **`relations`** | Mạng lưới Quan hệ | `case_id`, `relation_id`, `from_character`, `to_character`, `relation_type`, `description` | Mối quan hệ giữa các đối tượng để dựng sơ đồ tư duy (Mindmap). |
| **`evidences`** | Danh mục Vật chứng | `case_id`, `evidence_id`, `title`, `category`, `found_at_location`, `description`, `dossier_code` | Danh mục tài liệu hồ sơ LaTeX, biên bản khám xét và vật chứng vụ án. |
| **`timeline`** | Dòng thời gian vụ án | `case_id`, `event_id`, `time`, `character`, `action`, `location`, `is_key_event` | Mốc sự kiện phục vụ tính năng Alibi Clash và đối chiếu lời khai. |
| **`hints`** | Hệ thống Gợi ý (Hint System) | `case_id`, `hint_id`, `checkpoint_id`, `level`, `hint_text`, `cost_penalty` | Các cấp độ gợi ý giải đố hỗ trợ người chơi khi bị tắc suy luận. |

---

