# Google Sheets Live CMS (Đặc Tả Hệ Thống Live CMS)

Tài liệu này mô tả kiến trúc kết nối trực tiếp đến **Google Sheets API v4 (Live CMS)** của dự án Detective Game, cho phép biên tập kịch bản vụ án, danh bạ, cuộc gọi, tin nhắn, hình ảnh, gợi ý và **bảng đáp án phá án** theo thời gian thực mà không cần rebuild code hay redeploy app.

---

## 📜 1. Google Sheet ID & Authentication

- **Google Sheet ID**: `1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q`
- **Xác thực**: Google Service Account (`google-service-account.json` & `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
- **API Route xử lý**: [`/api/phone/route.ts`](file:///d:/code_world/dect_project/app/api/phone/route.ts)
- **Custom Hook UI**: [`usePhoneData`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) (Tự động bypass cache HTTP và Next.js Data Cache với header `no-store` & tham số `_t=timestamp`).

---

## 📑 2. Danh Mục 14 Tab Tiêu Chuẩn Trong Google Sheet

| Tên Tab Sheet           | Đối Tượng / Ứng Dụng UI                    | Các Cột Dữ Liệu Tiêu Chuẩn (Headers)                                                                                                                                                                               | Mô Tả & Phạm Vi Sử Dụng                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`contacts`**          | Ứng dụng Danh Bạ (`ContactsApp`)           | `case_id`, `contact_id`, `name`, `phone_number`, `is_saved`, `category`, `note`                                                                                                                                    | Lưu trữ toàn bộ danh bạ điện thoại nạn nhân Khang (mối quan hệ, ghi chú cá nhân).                                                                                                                                                                        |
| **`calls`**             | Ứng dụng Nhật Ký Cuộc Gọi (`VoicemailApp`) | `case_id`, `call_id`, `contact_name`, `phone_number`, `call_type`, `timestamp`, `duration`, `is_missed`                                                                                                            | Nhật ký cuộc gọi đi, gọi đến và cuộc gọi nhỡ (`INCOMING`, `OUTGOING`, `INCOMING_MISSED`).                                                                                                                                                                |
| **`messages`**          | Ứng dụng Tin Nhắn (`MessagesApp`)          | `case_id`, `message_id`, `contact_name`, `phone_number`, `direction`, `content`, `timestamp`, `is_clue`, `clue_title`, `clue_analysis`                                                                             | Chuỗi hội thoại SMS giữa Khang và các nhân vật, hỗ trợ cờ đánh dấu Manh mối & Báo cáo suy luận.                                                                                                                                                          |
| **`photos`**            | Ứng dụng Thư Viện Ảnh (`PhotosApp`)        | `case_id`, `photo_id`, `filename`, `drive_url`, `timestamp`, `location`, `description`, `size`                                                                                                                     | Thư viện ảnh vật chứng, hỗ trợ load ảnh trực tiếp từ **URL Google Drive**.                                                                                                                                                                               |
| **`banking`**           | Ứng dụng Ngân Hàng (`BankingApp`)          | `case_id`, `tx_id`, `ref_id`, `title`, `receiver`, `account_no`, `amount`, `timestamp`, `category`, `note`, `is_evidence`                                                                                          | Sao kê giao dịch tài khoản nạn nhân. `amount` âm = tiền ra, dương = tiền vào. `is_evidence=true` sẽ ghim viền xanh trên UI.                                                                                                                              |
| **`audios`**            | Trình phát ghi âm & Thư thoại              | `case_id`, `audio_id`, `title`, `duration`, `speaker`, `audio_url`, `transcript`, `timestamp`                                                                                                                      | Danh sách các file ghi âm cuộc gọi và băng thư thoại trích xuất.                                                                                                                                                                                         |
| **`characters`**        | Hồ sơ Nhân vật & Nghi phạm                 | `case_id`, `character_id`, `name`, `gender`, `age`, `weight_kg`, `role`, `occupation`, `relation_to_victim`, `alibi`, `motive`                                                                                     | Hồ sơ chi tiết các nhân vật (bao gồm thông tin chiều cao, cân nặng `weight_kg` chuẩn pháp y).                                                                                                                                                            |
| **`locations`**         | Bản đồ Hiện trường                         | `case_id`, `location_id`, `name`, `address`, `description`, `position_x`, `position_y`, `source_type`                                                                                                              | Tọa độ và thông tin không gian xuất hiện trên React Flow Board & 3D Viewer.                                                                                                                                                                              |
| **`relations`**         | Mạng lưới Quan hệ                          | `case_id`, `relation_id`, `from_character`, `to_character`, `relation_type`, `description`                                                                                                                         | Mối quan hệ giữa các đối tượng để dựng sơ đồ tư duy (Mindmap).                                                                                                                                                                                           |
| **`evidences`**         | Danh mục Vật chứng                         | `case_id`, `evidence_id`, `title`, `category`, `found_at_location`, `description`, `dossier_code`                                                                                                                  | Danh mục tài liệu hồ sơ LaTeX, biên bản khám xét và vật chứng vụ án.                                                                                                                                                                                     |
| **`timeline`**          | Dòng thời gian vụ án                       | `case_id`, `event_id`, `time`, `character`, `action`, `location`, `is_key_event`                                                                                                                                   | Mốc sự kiện phục vụ tính năng Alibi Clash và đối chiếu lời khai.                                                                                                                                                                                         |
| **`notes_and_browser`** | Safari & Ghi chú (`SafariApp`, `NotesApp`) | `case_id`, `type`, `title_or_domain`, `content_or_url`, `timestamp`, `category`, `clue_tag`                                                                                                                        | Quản lý tập trung cả Lịch sử duyệt web Safari (`type=SAFARI`) và Ghi chú cá nhân (`type=NOTE`).                                                                                                                                                          |
| **`checkpoints`**       | Câu Hỏi, Đáp Án & Hệ Thống Gợi ý           | `case_id`, `checkpoint_id`, `phase`, `title`, `question`, `type`, `options`, `correct_answer`, `valid_suspects`, `required_evidences`, `unlocked_evidence_id`, `level_1_hint`, `level_2_hint`, ..., `level_N_hint` | **Tab hợp nhất** câu hỏi trắc nghiệm/chọn số, đáp án từng checkpoint và toàn bộ tầng gợi ý. Số tầng gợi ý **không giới hạn** — thêm cột `level_4_hint`, `level_5_hint`... là UI tự nhận. Đã gộp và loại bỏ tab `hints` riêng để tránh phân mảnh dữ liệu. |
| **`evaluations`**       | Bảng Đáp Án & Chấm Điểm Kết Luận           | `case_id`, `culprit_name`, `motive_title`, `method_title`, `critical_evidences`, `correct_timeline`, `strengths`, `weaknesses`, `missed_evidence`, `radar_scores`                                                  | **Bảng đáp án chuẩn của vụ án**. Quyết định hung thủ thực sự, động cơ, phương thức gây án, bộ chứng cứ chí mạng và trục thời gian đúng.                                                                                                                  |

---

## 🎯 3. Đặc Tả Chi Tiết Tab `evaluations` (Bảng Đáp Án)

Tab `evaluations` là **nguồn chân lý (Source of Truth)** cho toàn bộ logic chấm điểm và phục dựng lời giải vụ án. Game Master có thể đổi hung thủ, động cơ hoặc trục thời gian chuẩn trực tiếp trên Sheet mà không cần sửa code.

| Cột                  | Kiểu | Bắt buộc | Mô Tả                                                                                                                |
| -------------------- | ---- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `case_id`            | TEXT | ✅       | Mã vụ án, khớp với `caseId` trong code (`case_000`).                                                                 |
| `culprit_name`       | TEXT | ✅       | Tên hung thủ thực sự. Dùng để đối chiếu khi người chơi chỉ danh thủ phạm.                                            |
| `motive_title`       | TEXT | ✅       | Động cơ gây án chuẩn (hiển thị ở màn hình kết luận).                                                                 |
| `method_title`       | TEXT | ✅       | Phương thức gây án chuẩn.                                                                                            |
| `critical_evidences` | TEXT | ✅       | Danh sách mã vật chứng chí mạng, phân tách bằng dấu phẩy. VD: `EV-HAIR-DNA, EV-VOICEMAIL-TRAIN`.                     |
| `correct_timeline`   | TEXT | ✅       | Trục thời gian đúng, **mỗi mốc 1 dòng** (dùng phím `Alt+Enter` trong ô Sheet). VD: `19:00 — Mai ném đơn rồi rời đi`. |
| `strengths`          | TEXT | ⬜       | Nhận xét điểm mạnh của người chơi khi phá án thành công.                                                             |
| `weaknesses`         | TEXT | ⬜       | Nhận xét điểm yếu / bẫy Red Herring người chơi đã tránh hoặc mắc phải.                                               |
| `missed_evidence`    | TEXT | ⬜       | Danh sách vật chứng người chơi bỏ sót.                                                                               |
| `radar_scores`       | TEXT | ⬜       | Điểm radar biểu đồ, mỗi dòng 1 tiêu chí theo định dạng `tên tiêu chí \| điểm \| mô tả`.                              |

### Quy Tắc Fallback (Bắt Buộc)

> Nếu tab `evaluations` **chưa tồn tại** hoặc **rỗng**, hệ thống tự động fallback về dữ liệu đáp án cục bộ trong [`content/cases/<caseId>/evaluation.ts`](file:///d:/code_world/dect_project/content/cases/case-000/evaluation.ts). Ứng dụng **không bao giờ crash** vì thiếu Sheet.

### Parse Helper

Hàm [`lib/cms/evaluation-cms.ts`](file:///d:/code_world/dect_project/lib/cms/evaluation-cms.ts) chịu trách nhiệm:

1. Gọi `usePhoneData('evaluations')` để lấy dòng dữ liệu của vụ án đang chơi.
2. Parse các cột text đa dòng (`correct_timeline`, `radar_scores`) thành mảng có cấu trúc.
3. Trả về object `{ evaluation, source: 'sheet' | 'local' }` để UI biết đang chạy trên nguồn nào.
