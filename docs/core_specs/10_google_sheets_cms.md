# Google Sheets Live CMS (Đặc Tả Hệ Thống Live CMS)

Tài liệu này mô tả kiến trúc kết nối trực tiếp đến **Google Sheets API v4 (Live CMS)** của dự án Detective Game, cho phép biên tập kịch bản vụ án, danh bạ, cuộc gọi, tin nhắn, hình ảnh, gợi ý và **bảng đáp án phá án** theo thời gian thực mà không cần rebuild code hay redeploy app.

> 💡 **Quy hoạch Admin Studio Hub**: Toàn bộ dữ liệu kịch bản vụ án, nghi phạm, địa điểm, timeline và vật chứng đã được hợp nhất 100% quản lý trực tiếp trên Google Sheets. Hệ thống Admin Studio (`/studio`) chỉ đóng vai trò Operations Hub để theo dõi Analytics, Quản lý Người chơi, Feedbacks và mở nhanh Google Sheet CMS.

---

## 🏷️ Quy Ước Ký Hiệu Phân Loại Cột (Column Status Legend)

Để Biên kịch, Game Designer và Kỹ sư nắm rõ vai trò từng cột khi mở Google Sheet hoặc tài liệu:

|   Ký hiệu   | Tên nhóm            | Ý nghĩa đối với Hệ thống Next.js                                         | Hành vi khi sửa trên Sheet                                            |
| :---------: | :------------------ | :----------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| 🔴 **`🔑`** | **Core Identifier** | Khóa router / Logic ID bắt buộc (`case_id`, `checkpoint_id`, `type`...). | ⚠️ Không sửa bừa, code dùng để định tuyến dữ liệu & LocalStorage.     |
| 🟢 **`⚡`** | **Live Reactive**   | Nội dung hiển thị & logic chấm điểm fetch trực tiếp runtime qua API.     | ✅ Sửa trên Sheet là giao diện/đáp án web đổi tức thì (bypass cache). |
| ⚪ **`📝`** | **Editorial Note**  | Ghi chú nghiệp vụ phân loại dành riêng cho Biên kịch/GM.                 | ℹ️ Code bỏ qua hoàn toàn, không ảnh hưởng logic game.                 |

---

## 📜 1. Google Sheet ID & Authentication

- **Google Sheet ID**: `1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q`
- **Xác thực**: Google Service Account (`google-service-account.json` & `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
- **API Route xử lý**: [`/api/phone/route.ts`](file:///d:/code_world/dect_project/app/api/phone/route.ts)
- **Custom Hook UI**: [`usePhoneData`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) (Tự động bypass cache HTTP và Next.js Data Cache với header `no-store` & tham số `_t=timestamp`).

---

## 📑 2. Danh Mục Tab Trong Google Sheet & Trạng Thái Live CMS

| Tên Tab Sheet           | Đối Tượng / Ứng Dụng UI                    | File Code Đang Đọc                                                                              | Trạng Thái Live CMS | Danh Sách Cột Phân Loại me                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- | :-----------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`contacts`**          | Ứng dụng Danh Bạ (`ContactsApp`)           | [`contacts-app.tsx`](components/investigation/iphone/apps/contacts-app.tsx)                     |     🟢 **Live**     | `🔑 case_id`, `🔑 contact_id`, `⚡ name`, `⚡ phone_number`, `⚡ category`, `⚡ note`                                                                                                                                                                                                                                                                                                                          |
| **`calls`**             | Ứng dụng Nhật Ký Cuộc Gọi (`VoicemailApp`) | [`voicemail-app.tsx`](components/investigation/iphone/apps/voicemail-app.tsx)                   |     🟢 **Live**     | `🔑 case_id`, `🔑 call_id`, `⚡ date_str`, `⚡ time_str`, `⚡ display_name`, `⚡ phone_number`, `⚡ call_type`, `⚡ is_missed`, `⚡ is_key_clue`                                                                                                                                                                                                                                                               |
| **`messages`**          | Ứng dụng Tin Nhắn (`MessagesApp`)          | [`messages-app.tsx`](components/investigation/iphone/apps/messages-app.tsx)                     |     🟢 **Live**     | `🔑 case_id`, `🔑 contact_name`, `⚡ phone_number`, `⚡ avatar_color`, `⚡ unread`, `⚡ timestamp`, `⚡ preview_text`, `⚡ messages_text`                                                                                                                                                                                                                                                                      |
| **`photos`**            | Ứng dụng Thư Viện Ảnh (`PhotosApp`)        | [`photos-app.tsx`](components/investigation/iphone/apps/photos-app.tsx)                         |     🟢 **Live**     | `🔑 case_id`, `🔑 photo_code`, `⚡ title`, `⚡ category`, `⚡ file_name`, `⚡ drive_url`, `⚡ direct_cdn_url`, `⚡ description_prompt`, `⚡ is_key_asset`                                                                                                                                                                                                                                                      |
| **`banking`**           | Ứng dụng Ngân Hàng (`BankingApp`)          | [`banking-app.tsx`](components/investigation/iphone/apps/banking-app.tsx)                       |     🟢 **Live**     | `🔑 case_id`, `🔑 tx_id`, `⚡ ref_id`, `⚡ title`, `⚡ receiver`, `⚡ account_no`, `⚡ amount`, `⚡ timestamp`, `⚡ category`, `⚡ is_evidence`                                                                                                                                                                                                                                                                |
| **`notes_and_browser`** | Safari & Ghi chú (`SafariApp`, `NotesApp`) | [`safari-app.tsx`](components/investigation/iphone/apps/safari-app.tsx), [`notes-app.tsx`](...) |     🟢 **Live**     | `🔑 case_id`, `🔑 type`, `⚡ title_or_domain`, `⚡ content_or_url`, `⚡ timestamp`, `⚡ category`, `⚡ clue_tag`                                                                                                                                                                                                                                                                                               |
| **`checkpoints`**       | Câu Hỏi, Đáp Án & Hệ Thống Gợi Ý           | [`use-case-checkpoints.ts`](lib/hooks/use-case-checkpoints.ts), [`hint-modal.tsx`](...)         |     🟢 **Live**     | `🔑 case_id`, `🔑 checkpoint_id`, `📝 dossier`, `⚡ title`, `⚡ question`, `🔑 type`, `⚡ unlocked_evidence_id`, `⚡ answers`, `⚡ hints`                                                                                                                                                                                                                                                                      |
| **`narratives`**        | Dẫn truyện Cinematic                       | [`use-case-narratives.ts`](lib/hooks/use-case-narratives.ts)                                    |     🟢 **Live**     | `🔑 case_id`, `🔑 phase`, `📝 dossier`, `⚡ date`, `⚡ monologue`                                                                                                                                                                                                                                                                                                                                              |
| **`evidences`**         | Danh mục Vật chứng Master                  | [`use-case-checkpoints.ts`](lib/hooks/use-case-checkpoints.ts)                                  |     🟢 **Live**     | `🔑 case_id`, `🔑 code`, `⚡ label`, `⚡ type`, `⚡ category`, `⚡ description`, `📝 unlocked_by_phase`                                                                                                                                                                                                                                                                                                        |
| **`motive_ideas`**      | Kho Ý Tưởng Động Cơ Gây Án                 | _(Phụ trợ Game Designer / GM sáng tạo kịch bản)_                                                |     ⚪ _Static_     | `🔑 id`, `⚡ category`, `⚡ title`, `⚡ summary`, `⚡ psychological_trigger`, `⚡ victim_relation`, `⚡ evidence_signatures`                                                                                                                                                                                                                                                                                   |
| **`method_ideas`**      | Kho Ý Tưởng Cách Thức Gây Án               | _(Phụ trợ Game Designer / GM sáng tạo kịch bản)_                                                |     ⚪ _Static_     | `🔑 id`, `⚡ category`, `⚡ title`, `⚡ summary`, `⚡ required_tools`, `⚡ forensic_traces`, `⚡ alibi_trick`, `⚡ flaw_counter`                                                                                                                                                                                                                                                                               |
| **`characters`**        | Hồ sơ Nhân vật & Nghi phạm                 | _(Chưa nối — đang dùng `content/cases/` local)_                                                 |     ⚪ _Static_     | `🔑 case_id`, `🔑 code`, `⚡ role`, `⚡ full_name`, `⚡ alias`, `⚡ gender`, `⚡ dob`, `⚡ id_card_no`, `⚡ phone_number`, `⚡ occupation`, `⚡ current_address`, `⚡ height_cm`, `⚡ weight_kg`, `⚡ physical_build`, `⚡ distinguishing_features`, `⚡ psych_classification`, `⚡ motive_type`, `⚡ motive_description`, `⚡ alibi_statement`, `⚡ is_alibi_fake`, `⚡ flaw_in_alibi`, `⚡ key_evidence_ids` |
| **`locations`**         | Bản đồ Hiện trường                         | _(Chưa nối — đang dùng `content/cases/` local)_                                                 |     ⚪ _Static_     | `🔑 case_id`, `🔑 code`, `⚡ title`, `⚡ source_type`, `⚡ category`, `⚡ address`, `⚡ details`, `⚡ distance_from_scene`, `⚡ travel_time_motorbike`, `⚡ travel_time_walk`, `⚡ travel_time_car`, `⚡ position_x`, `⚡ position_y`, `⚡ is_key_location`                                                                                                                                                    |
| **`relations`**         | Mạng lưới Quan hệ                          | _(Chưa nối — đang dùng `content/cases/` local)_                                                 |     ⚪ _Static_     | `🔑 case_id`, `🔑 source_code`, `🔑 target_code`, `⚡ relation_type`, `⚡ description`, `⚡ unlocked_by_evidence`                                                                                                                                                                                                                                                                                              |
| **`timeline`**          | Dòng thời gian vụ án                       | _(Chưa nối — đang dùng `content/cases/` local)_                                                 |     ⚪ _Static_     | `🔑 case_id`, `🔑 time_str`, `⚡ character_name`, `⚡ event_title`, `⚡ location`, `⚡ is_truth`, `⚡ is_fatal`, `⚡ description`                                                                                                                                                                                                                                                                              |

---

## 🎯 3. Đặc Tả Chi Tiết Tab `checkpoints` (9 Cột Tinh Gọn)

Tab `checkpoints` quản lý toàn bộ mốc giải đố, mở khóa hồ sơ và kết án. Tab chỉ gồm **9 cột thiết yếu**:

| STT | Cột                    | Tên tiếng Việt trên Sheet |  Nhóm   | Kiểu dữ liệu | Mô tả & Vai trò                                                                          |
| :-- | :--------------------- | :------------------------ | :-----: | :----------- | :--------------------------------------------------------------------------------------- |
| 1   | `case_id`              | Mã vụ án                  | 🔴 `🔑` | TEXT         | ID vụ án (`case_000`, `case_001`) để lọc dữ liệu.                                        |
| 2   | `checkpoint_id`        | Mã Checkpoint             | 🔴 `🔑` | TEXT         | Khóa chính duy nhất (`cp-000-0`, `cp-000-1a`, `cp-000-1b`, `cp-000-2a`, `cp-000-2b`).    |
| 3   | `dossier`              | Bộ hồ sơ con              | ⚪ `📝` | TEXT         | Nhãn phân nhóm nghiệp vụ (`Ban Đầu`, `Bộ A`, `Bộ B`, `Bộ C`). Code không đọc.            |
| 4   | `title`                | Tiêu đề                   | 🟢 `⚡` | TEXT         | Tiêu đề hiển thị của câu hỏi/checkpoint trên UI.                                         |
| 5   | `question`             | Nội dung yêu cầu          | 🟢 `⚡` | TEXT         | Lời dẫn yêu cầu điều tra.                                                                |
| 6   | `type`                 | Loại dạng bài             | 🔴 `🔑` | ENUM         | Router component: `text_match_3`, `evidence_picker`, `mcq`, `accusation`, `convergence`. |
| 7   | `unlocked_evidence_id` | Mã mở khóa                | 🟢 `⚡` | TEXT         | ID phần thưởng/bộ hồ sơ tiếp theo được mở khóa sau khi giải đúng.                        |
| 8   | `answers`              | Cột đáp án hợp nhất       | 🟢 `⚡` | MULTILINE    | Chứa toàn bộ đáp án theo cú pháp `khóa: giá trị` (Alt+Enter xuống dòng).                 |
| 9   | `hints`                | Gợi ý đa cấp              | 🟢 `⚡` | MULTILINE    | Danh sách gợi ý các cấp (mỗi dòng Alt+Enter = 1 cấp gợi ý).                              |

#### Từ khóa cú pháp tiếng Việt trong cột `answers`:

| Khóa tiếng Việt (Khuyên dùng) | Khóa tương đương tiếng Anh | Dành cho `type`                 | Ý nghĩa & Ví dụ                                           |
| :---------------------------- | :------------------------- | :------------------------------ | :-------------------------------------------------------- |
| `nghi_pham:`                  | `suspect:`                 | `evidence_picker`, `accusation` | `nghi_pham: Lê Quang Vũ`                                  |
| `ma_chung_cu:`                | `require:`                 | `evidence_picker`, `accusation` | `ma_chung_cu: 10, dev-00, p6, 06, p10`                    |
| `mau_thuan:`                  | `mismatch:`                | `evidence_picker`               | `mau_thuan: Mâu thuẫn Địa điểm`                           |
| `dong_co:`                    | `motive:`                  | `accusation`                    | `dong_co: Cuồng yêu ghen tuông`                           |
| `o_nhap:`                     | `input:`                   | `text_match_3`                  | `o_nhap: phone_1 \| SĐT 0988.200.991: \| \| Lê Quang Vũ`  |
| `option:`                     | `phuong_an:`               | `mcq`                           | `option: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám...` |
| `correct:`                    | `dap_an:`                  | `mcq`                           | `correct: 1. Gửi tin nhắn cho đối tượng...`               |

> 💡 **Quy ước nhập tên nghi phạm & mã chứng cứ**:
>
> - **Tên người**: Chỉ cần nhập dạng chuẩn có dấu (`Lê Quang Vũ`). Code tự so khớp có/không dấu/tên tắt qua `isVietnameseTextMatch`.
> - **Mã chứng cứ**: Nhập đúng mã in trên thẻ tài liệu/vật chứng (`10`, `dev-00`, `p6`, `06`, `p10`, `14`, `p4`, `p5`, `01`, `02`...).
> - **Bỏ hoàn toàn dòng `show:`**: Bảng ghim Web & Boardgame tự động nhận mã ghim/nhập trực tiếp.

---

## 🎬 4. Đặc Tả Tab `narratives` (Dẫn Truyện Cinematic)

Tab `narratives` quản lý toàn bộ nội dung độc thoại/dẫn truyện mở đầu và khi mở khóa từng bộ hồ sơ:

| STT | Cột         | Tên tiếng Việt trên Sheet |  Nhóm   | Kiểu dữ liệu | Mô tả & Vai trò                                                                     |
| :-- | :---------- | :------------------------ | :-----: | :----------- | :---------------------------------------------------------------------------------- |
| 1   | `case_id`   | Mã vụ án                  | 🔴 `🔑` | TEXT         | ID vụ án (`case_000`, `case_001`).                                                  |
| 2   | `phase`     | Thứ tự chặng              | 🔴 `🔑` | NUMBER       | `0` = Mở đầu Ban Đầu, `1` = Mở khóa Bộ A, `2` = Mở khóa Bộ B, `3` = Mở khóa Bộ C.   |
| 3   | `dossier`   | Bộ hồ sơ con              | ⚪ `📝` | TEXT         | Nhãn bộ hồ sơ (`Ban Đầu`, `Bộ A`, `Bộ B`, `Bộ C`). Code không đọc.                  |
| 4   | `date`      | Mốc thời gian             | 🟢 `⚡` | TEXT         | Tiêu đề in trên header modal (VD: `Đêm 24/07/2016`, `Sáng 25/07/2016`...).          |
| 5   | `monologue` | Độc thoại dẫn truyện      | 🟢 `⚡` | MULTILINE    | Nội dung máy đánh chữ chạy chữ cinematic (Alt+Enter ngắt dòng, dòng đôi ngắt đoạn). |

---

## ⚙️ 5. Cơ Chế Fallback 2 Tầng Của Code

1. **Tầng 1 — Fallback theo từng ô (Cell-level)**:
   - Ô `⚡ Live` để trống trên Sheet sẽ tự động lấy giá trị từ checkpoint/narrative **cùng ID/phase** trong file local `content/cases/<caseId>/`.
2. **Tầng 2 — Fallback theo cả tab (Row-level)**:
   - Nếu tab trên Sheet bị xóa hoặc rỗng, hook tự động trả về toàn bộ mảng dữ liệu local (`source = 'local'`), ứng dụng không bao giờ bị gián đoạn hay crash.

---

## 💡 6. Kho Ý Tưởng Sáng Tạo Kịch Bản (`motive_ideas` & `method_ideas`)

Hai tab phụ trợ độc lập trên Google Sheet giúp GM / Biên kịch tra cứu và lắp ghép kịch bản vụ án:

- **`motive_ideas`**: 12 mẫu động cơ kinh điển (Tài chính, Tình cảm, Thù hận, Che đậy, Bệnh lý, Danh dự) kèm ngòi nổ tâm lý (`psychological_trigger`), quan hệ nạn nhân (`victim_relation`) và dấu vết nhận diện (`evidence_signatures`).
- **`method_ideas`**: 12 thủ đoạn gây án & tạo chứng cứ ngoại phạm (Độc chất, Tai nạn dàn dựng, Bẫy cơ học, Ngoại phạm Alibi, Vũ khí tự hủy) kèm cơ chế pháp y (`forensic_traces`), mẹo alibi (`alibi_trick`) và lỗ hổng điều tra (`flaw_counter`).
