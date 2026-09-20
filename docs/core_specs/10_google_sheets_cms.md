# Google Sheets Live CMS (Đặc Tả Hệ Thống Live CMS)

Tài liệu này mô tả kiến trúc kết nối trực tiếp đến **Google Sheets API v4 (Live CMS)** của dự án Detective Game, cho phép biên tập kịch bản vụ án, danh bạ, cuộc gọi, tin nhắn, hình ảnh và gợi ý theo thời gian thực mà không cần rebuild code hay redeploy app.

---

## 📜 1. Google Sheet ID & Authentication
* **Google Sheet ID**: `1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q`
* **Xác thực**: Google Service Account (`google-service-account.json` & `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
* **API Route xử lý**: [`/api/phone/route.ts`](file:///d:/code_world/dect_project/app/api/phone/route.ts)
* **Custom Hook UI**: [`usePhoneData`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) (Tự động bypass cache HTTP và Next.js Data Cache với header `no-store` & tham số `_t=timestamp`).

---

## 📑 2. Danh Mục 11 Tab Tiêu Chuẩn Trong Google Sheet

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
| **`notes_and_browser`** | Safari & Ghi chú (`SafariApp`, `NotesApp`) | `case_id`, `type`, `title_or_domain`, `content_or_url`, `timestamp`, `category`, `clue_tag` | Quản lý tập trung cả Lịch sử duyệt web Safari (`type=SAFARI`) và Ghi chú cá nhân (`type=NOTE`). |
| **`hints`** | Hệ thống Gợi ý (Hint System) | `case_id`, `hint_id`, `checkpoint_id`, `level`, `hint_text`, `cost_penalty` | Các cấp độ gợi ý giải đố hỗ trợ người chơi khi bị tắc suy luận. |
