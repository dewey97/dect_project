# Google Sheets Live CMS (Đặc Tả Hệ Thống Live CMS)

Tài liệu này mô tả kiến trúc kết nối trực tiếp đến **Google Sheets API v4 (Live CMS)** của dự án Detective Game, cho phép biên tập kịch bản vụ án, danh bạ, cuộc gọi, tin nhắn, hình ảnh, gợi ý và **bảng đáp án phá án** theo thời gian thực mà không cần rebuild code hay redeploy app.

---

## 📜 1. Google Sheet ID & Authentication

- **Google Sheet ID**: `1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q`
- **Xác thực**: Google Service Account (`google-service-account.json` & `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`)
- **API Route xử lý**: [`/api/phone/route.ts`](file:///d:/code_world/dect_project/app/api/phone/route.ts)
- **Custom Hook UI**: [`usePhoneData`](file:///d:/code_world/dect_project/lib/hooks/use-phone-data.ts) (Tự động bypass cache HTTP và Next.js Data Cache với header `no-store` & tham số `_t=timestamp`).

---

## 📑 2. Danh Mục 13 Tab Tiêu Chuẩn Trong Google Sheet

| Tên Tab Sheet           | Đối Tượng / Ứng Dụng UI                    | Các Cột Dữ Liệu Tiêu Chuẩn (Headers)                                                                                                                                                   | Mô Tả & Phạm Vi Sử Dụng                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`contacts`**          | Ứng dụng Danh Bạ (`ContactsApp`)           | `case_id`, `contact_id`, `name`, `phone_number`, `is_saved`, `category`, `note`                                                                                                        | Lưu trữ toàn bộ danh bạ điện thoại nạn nhân Khang (mối quan hệ, ghi chú cá nhân).                                                                                                                                                            |
| **`calls`**             | Ứng dụng Nhật Ký Cuộc Gọi (`VoicemailApp`) | `case_id`, `call_id`, `contact_name`, `phone_number`, `call_type`, `timestamp`, `duration`, `is_missed`                                                                                | Nhật ký cuộc gọi đi, gọi đến và cuộc gọi nhỡ (`INCOMING`, `OUTGOING`, `INCOMING_MISSED`).                                                                                                                                                    |
| **`messages`**          | Ứng dụng Tin Nhắn (`MessagesApp`)          | `case_id`, `message_id`, `contact_name`, `phone_number`, `direction`, `content`, `timestamp`, `is_clue`, `clue_title`, `clue_analysis`                                                 | Chuỗi hội thoại SMS giữa Khang và các nhân vật, hỗ trợ cờ đánh dấu Manh mối & Báo cáo suy luận.                                                                                                                                              |
| **`photos`**            | Ứng dụng Thư Viện Ảnh (`PhotosApp`)        | `case_id`, `photo_id`, `filename`, `drive_url`, `timestamp`, `location`, `description`, `size`                                                                                         | Thư viện ảnh vật chứng, hỗ trợ load ảnh trực tiếp từ **URL Google Drive**.                                                                                                                                                                   |
| **`banking`**           | Ứng dụng Ngân Hàng (`BankingApp`)          | `case_id`, `tx_id`, `ref_id`, `title`, `receiver`, `account_no`, `amount`, `timestamp`, `category`, `note`, `is_evidence`                                                              | Sao kê giao dịch tài khoản nạn nhân. `amount` âm = tiền ra, dương = tiền vào. `is_evidence=true` sẽ ghim viền xanh trên UI.                                                                                                                  |
| **`audios`**            | Trình phát ghi âm & Thư thoại              | `case_id`, `audio_id`, `title`, `duration`, `speaker`, `audio_url`, `transcript`, `timestamp`                                                                                          | Danh sách các file ghi âm cuộc gọi và băng thư thoại trích xuất.                                                                                                                                                                             |
| **`characters`**        | Hồ sơ Nhân vật & Nghi phạm                 | `case_id`, `character_id`, `name`, `gender`, `age`, `weight_kg`, `role`, `occupation`, `relation_to_victim`, `alibi`, `motive`                                                         | Hồ sơ chi tiết các nhân vật (bao gồm thông tin chiều cao, cân nặng `weight_kg` chuẩn pháp y).                                                                                                                                                |
| **`locations`**         | Bản đồ Hiện trường                         | `case_id`, `location_id`, `name`, `address`, `description`, `position_x`, `position_y`, `source_type`                                                                                  | Tọa độ và thông tin không gian xuất hiện trên React Flow Board & 3D Viewer.                                                                                                                                                                  |
| **`relations`**         | Mạng lưới Quan hệ                          | `case_id`, `relation_id`, `from_character`, `to_character`, `relation_type`, `description`                                                                                             | Mối quan hệ giữa các đối tượng để dựng sơ đồ tư duy (Mindmap).                                                                                                                                                                               |
| **`evidences`**         | Danh mục Vật chứng                         | `case_id`, `code`, `label`, `type`, `category`, `description`, `unlocked_by_phase`, `position_x`, `position_y`, `logic_data`                                                           | **Danh mục gốc (Master Catalog)** của toàn bộ hồ sơ, biên bản và vật chứng. Cột `code` là mã ngắn (`01`, `03a`, `10`, `dev-00`, `p4`, `04_lon_toc`) dùng làm khóa join cho khóa `require` và `show` trong cột `answers` ở tab `checkpoints`. |
| **`timeline`**          | Dòng thời gian vụ án                       | `case_id`, `event_id`, `time`, `character`, `action`, `location`, `is_key_event`                                                                                                       | Mốc sự kiện phục vụ tính năng Alibi Clash và đối chiếu lời khai.                                                                                                                                                                             |
| **`notes_and_browser`** | Safari & Ghi chú (`SafariApp`, `NotesApp`) | `case_id`, `type`, `title_or_domain`, `content_or_url`, `timestamp`, `category`, `clue_tag`                                                                                            | Quản lý tập trung cả Lịch sử duyệt web Safari (`type=SAFARI`) và Ghi chú cá nhân (`type=NOTE`).                                                                                                                                              |
| **`checkpoints`**       | Câu Hỏi, Đáp Án & Hệ Thống Gợi ý           | `case_id`, `checkpoint_id`, `phase`, `title`, `question`, `type`, `unlocked_evidence_id`, `answers`, `suspect_label`, `evidence_step_label`, `motive_label`, `mismatch_label`, `hints` | **Tab hợp nhất** toàn bộ tiến trình giải đố. Mọi đáp án và cấu hình form nằm gọn trong 1 cột `answers` (định dạng `khóa: giá trị`), gợi ý nhiều cấp nằm trong 1 cột `hints` đa dòng `Alt+Enter`.                                             |

---

## 🎯 3. Đặc Tả Chi Tiết Tab `checkpoints` (Cơ Chế Giải Đố & Phân Loại Cột Cho Code)

Tab `checkpoints` điều khiển toàn bộ tiến trình giải đố. Code Next.js phân loại **13 cột** thành 4 nhóm rõ ràng.

### 3.1. Phân Loại Tác Vụ Cột Đối Với Code

1. **🔴 Bắt buộc cho Code (Core Identifier & Router)**:
   - `case_id`: Code dùng để lọc đúng các dòng thuộc vụ án đang mở (`case_000`, `case_001`).
   - `checkpoint_id`: Khóa chính duy nhất để code lưu/đọc trạng thái hoàn thành vào LocalStorage, mở khóa manh mối và tra cứu gợi ý.
   - `type`: Router giao diện. Code đọc cột này để quyết định mount component nào (`mcq`, `text_match_3`, `evidence_picker`, `convergence`, `accusation`).

2. **🟡 Bắt buộc theo từng `type` câu hỏi — nằm trong cột `answers`**:
   - Cột `answers` là **cột đáp án hợp nhất**, chứa toàn bộ dữ liệu chấm điểm và cấu hình form của mọi loại câu hỏi.
   - Khóa nào bắt buộc phụ thuộc vào giá trị cột `type` (xem bảng cú pháp ở mục 3.2).

3. **⚪ Tùy chọn / Nhãn hiển thị (Optional & UI Customization)**:
   - `hints`: Chứa các cấp độ gợi ý (phân cách bằng Alt+Enter). Không bắt buộc — nếu trống thì nút gợi ý sẽ ẩn hoặc lấy từ file code.
   - `unlocked_evidence_id`: ID manh mối mở khóa khi giải đúng.
   - `title`, `question`: Tiêu đề & nội dung câu hỏi (nếu trống code fallback về text mặc định).
   - `suspect_label`, `evidence_step_label`, `motive_label`, `mismatch_label`: Tùy biến nhãn văn bản form trên UI.

4. **⚪ Ghi chú cho Biên kịch (Code không đọc)**:
   - `phase`: **Hoàn toàn không dùng trong code**, chỉ là nhãn ghi chú giúp Biên kịch/Admin phân nhóm trên Sheet.

---

### 3.2. Cú Pháp Cột `answers` (Đáp Án Hợp Nhất)

**Nguyên tắc chung**:

- Mỗi dòng là một cặp `khóa: giá trị`. Xuống dòng trong ô bằng `Alt+Enter`.
- Dấu `:` đầu tiên trên dòng phân tách khóa và giá trị. Giá trị được giữ nguyên văn (kể cả khi chứa dấu `:`).
- Các khóa `option`, `mismatch_option`, `motive_option`, `branch`, `input` được phép **lặp lại nhiều dòng** để tạo danh sách.
- Khóa không nhận diện được sẽ bị **bỏ qua** kèm cảnh báo `console.warn` trong DevTools — dùng để phát hiện lỗi gõ chính tả.
- Chấp nhận bí danh tiếng Việt không dấu: `phuong_an` = `option`, `dap_an` = `correct`, `nghi_pham` = `suspect`, `bat_buoc` = `require`, `hien_thi` = `show`, `dong_co` = `motive`, `mau_thuan` = `mismatch`, `nhanh` = `branch`, `o_nhap` = `input`.

**Bảng khóa hợp lệ**:

| Khóa              | Dùng cho `type`                       | Định dạng giá trị                                                         | Lặp lại |
| :---------------- | :------------------------------------ | :------------------------------------------------------------------------ | :-----: |
| `option`          | `mcq`                                 | Nội dung 1 phương án trả lời                                              |   Có    |
| `correct`         | `mcq`                                 | Nội dung đáp án đúng — phải khớp **nguyên văn** với 1 dòng `option`       |  Không  |
| `input`           | `text_match_3`                        | `id \| Nhãn ô \| Placeholder \| đáp_án_1, đáp_án_2`                       |   Có    |
| `suspect`         | `evidence_picker`, `accusation`       | Danh sách từ khóa tên nghi phạm chấp nhận, cách nhau dấu `,`              |  Không  |
| `require`         | `evidence_picker`, `accusation`       | Danh sách mã vật chứng **bắt buộc** phải chọn đúng, cách nhau dấu `,`     |  Không  |
| `show`            | `evidence_picker`, `accusation`       | Danh sách mã vật chứng **hiển thị** trong bảng chọn, cách nhau dấu `,`    |  Không  |
| `mismatch`        | `evidence_picker` (bẻ gãy ngoại phạm) | Danh sách mã loại mâu thuẫn đúng (`mismatch_location`), cách nhau dấu `,` |  Không  |
| `mismatch_option` | `evidence_picker`                     | Nhãn hiển thị của 1 nút chọn mâu thuẫn                                    |   Có    |
| `branch`          | `convergence`                         | `id \| Tên hiển thị \| id_lý_do_đúng \| Lý do 1 /// Lý do 2 /// Lý do 3`  |   Có    |
| `motive`          | `accusation`                          | Danh sách mã động cơ đúng (`motive_jealousy`), cách nhau dấu `,`          |  Không  |
| `motive_option`   | `accusation`                          | Nhãn hiển thị của 1 nút chọn động cơ                                      |   Có    |

**Ví dụ mẫu theo từng `type`**:

`type=mcq`:

```
option: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.
option: 2. Gửi tin nhắn cho cảnh sát đường sông.
option: 3. Không gửi cho ai.
correct: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.
```

`type=text_match_3`:

```
input: phone_1 | SĐT 0988.200.991: | Nhập tên nghi phạm (VD: Lê Quang Vũ)... | Lê Quang Vũ, Vũ, Le Quang Vu
input: phone_2 | SĐT 0912.331.888: | Nhập tên nghi phạm (VD: Nguyễn Thanh Tùng)... | Nguyễn Thanh Tùng, Tùng
```

`type=evidence_picker` (có kèm bẻ gãy mâu thuẫn):

```
suspect: Trần Thị Hà, Hà, Tran Thi Ha
require: 01_voicemail, 02_vtv3
show: 03a, 04, 06, 10, dev-00, p4, 01_voicemail, 02_vtv3
mismatch: mismatch_location
mismatch_option: 📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng nhà Khang)
mismatch_option: 🕒 Mâu thuẫn Nhân dạng (Khai mặc áo dài nhưng mặc áo bảo hộ)
```

`type=convergence`:

```
branch: mai | 1. Nguyễn Ngọc Mai | mai_alibi_tv | Ngoại phạm xem TV tại nhà lúc 20:10 /// Không có động cơ tranh chấp đất đai
branch: vu | 2. Lê Quang Vũ | vu_alibi_pub | Thanh toán 195k tại Quán Bia 88 lúc 21:15 /// Không có mâu thuẫn tiền bạc
```

`type=accusation`:

```
suspect: Trần Thị Hà, Hà, Tran Thi Ha
require: 04_lon_toc, 03_ao_gio
show: 01, 03_ao_gio, 04_lon_toc, 08_ve_may_bay, dev-00
motive: motive_jealousy
motive_option: Cuồng yêu, ghen tuông bệnh hoạn khi phát hiện Khang định bỏ trốn với bồ mới
motive_option: Tranh chấp quyền thừa kế mảnh đất 200m² của gia đình
```

> ⚠️ **Đánh đổi cần biết**: Gộp 10 cột vào 1 cột `answers` giúp Sheet gọn (22 → 13 cột) nhưng **mất tính năng Data Validation / dropdown gợi ý giá trị** của Google Sheets trên từng cột riêng. Bù lại, code in cảnh báo `console.warn` khi gặp khóa sai chính tả.

**Quy ước nhập đáp án tên người / cụm từ** (khóa `suspect`, `correct`, `input`):

- **Chỉ cần nhập MỘT dạng có dấu.** Code tự chuẩn hoá cả hai phía (bỏ dấu, thường hoá, bỏ ký tự đặc biệt) qua `normalizeVietnameseText`, nên `Lê Quang Vũ` tự khớp `Le Quang Vu`, `le quang vu`, `LÊ QUANG VŨ`.
- **Không cần liệt kê biến thể không dấu** — chúng là dữ liệu dư.
- **Không cần nhập mã bypass.** `00`, `000`, `0`, `admin` đã được code hard-code sẵn cho mọi ô nhập tên.
- **Khớp theo ranh giới từ**, không khớp chuỗi con: gõ `Vũ` đúng cho đáp án `Lê Quang Vũ`, nhưng `Khang` **không** lọt vào đáp án `Hà` và `Vương` **không** lọt vào `Vũ`. Logic nằm ở `isVietnameseTextMatch` trong [`lib/finding-matcher.ts`](file:///d:/code_world/dect_project/lib/finding-matcher.ts), có unit test tại [`scripts/test-fuzzy-matcher.ts`](file:///d:/code_world/dect_project/scripts/test-fuzzy-matcher.ts) (chạy `npx tsx scripts/test-fuzzy-matcher.ts`).

---

### 3.3. Cơ Chế Fallback Của Code (2 Tầng)

Trước khi tra bảng cột, cần nắm rõ **fallback 2 tầng** mà code Next.js đang áp dụng:

1. **Tầng 1 — Fallback theo từng ô (Cell-level)**:
   - Ô trống trên Sheet sẽ lấy giá trị từ checkpoint **cùng `checkpoint_id`** trong file local `content/cases/<caseId>/checkpoints.ts`.
   - Ví dụ: Sheet để trống `hints` cho `cp-000-1a` thì code lấy `hintsList` từ bản ghi local có `id: 'cp-000-1a'`.

2. **Tầng 2 — Fallback theo cả tab (Row-level)**:
   - Nếu tab `checkpoints` **rỗng**, hoặc **không có dòng nào khớp `case_id`**, hook `useCaseCheckpoints` trả về **toàn bộ mảng local** (`checkpoints000` / `checkpoints001`) và gán `source = 'local'`.
   - Ứng dụng không bao giờ crash vì thiếu Sheet.

> ⚠️ **Giới hạn quan trọng**: Fallback tầng 1 **chỉ hoạt động khi `checkpoint_id` khớp chính xác** với `id` trong file local. Nếu bạn tạo checkpoint hoàn toàn mới trên Sheet (VD: `cp-000-3a` chưa từng có trong code) thì mọi ô để trống sẽ nhận **giá trị mặc định cứng**, không lấy từ đâu khác.
>
> Với cột `answers`, fallback hoạt động **theo từng khóa riêng lẻ**: nếu Sheet có `require:` nhưng thiếu `show:` thì `show` lấy từ `fallback.pickerConfig.availableEvidences`, phần `require` vẫn dùng dữ liệu Sheet.

### 3.4. Bảng Tra Cứu 13 Cột: Vai Trò & Fallback

| Tên Cột                    | Kiểu      | Tính Bắt Buộc | Vai Trò Đối Với Code Next.js                                                                                                                     | Fallback Khi Ô Trống                                                                                    |
| :------------------------- | :-------- | :-----------: | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **`case_id`**              | TEXT      |  🔴 Bắt buộc  | **Lọc dữ liệu**: Code gọi `rows.filter(r => r.case_id === currentCaseId)`.                                                                       | ⚠️ Không có. Dòng sai `case_id` bị loại bỏ; nếu không dòng nào khớp → dùng toàn bộ mảng local (tầng 2). |
| **`checkpoint_id`**        | TEXT      |  🔴 Bắt buộc  | **Khóa chính**: Định danh checkpoint, tra cứu bản ghi local tương ứng, quản lý LocalStorage và trạng thái mở khóa.                               | `fallback.id` → nếu cả hai trống: chuỗi mặc định `"cp-dynamic"`.                                        |
| **`type`**                 | ENUM      |  🔴 Bắt buộc  | **Switch layout**: Quyết định render `MCQSection`, `EvidencePickerSection`, `ConvergenceSection` hay `AccusationSection`.                        | `fallback.type` → nếu cả hai trống: `"mcq"`.                                                            |
| **`answers`**              | MULTILINE | 🟡 Theo Type  | **Cột đáp án hợp nhất**: chứa toàn bộ `option`/`correct`/`require`/`show`/`suspect`/`motive`/`mismatch`/`branch`/`input`. Xem cú pháp ở mục 3.2. | Từng khóa riêng lẻ fallback về config tương ứng của checkpoint local cùng `checkpoint_id`.              |
| **`title`**                | TEXT      |  ⚪ Tùy chọn  | Tiêu đề checkpoint hiển thị trên UI.                                                                                                             | `fallback.title` → nếu cả hai trống: chuỗi rỗng `""`.                                                   |
| **`question`**             | TEXT      |  ⚪ Tùy chọn  | Nội dung câu hỏi/yêu cầu hiển thị trên UI.                                                                                                       | `fallback.question` → nếu cả hai trống: chuỗi rỗng `""`.                                                |
| **`phase`**                | TEXT      | ⚪ Ghi chú GM | **Code không đọc cột này**. Chỉ là nhãn giúp Biên kịch/Admin phân nhóm trên Sheet.                                                               | Không áp dụng — cột này không ảnh hưởng logic.                                                          |
| **`unlocked_evidence_id`** | TEXT      |  ⚪ Tùy chọn  | ID hồ sơ/manh mối mở khóa sau khi giải đúng (`onSuccess(unlockedEvidenceId)`).                                                                   | `fallback.unlockedEvidenceId` → nếu cả hai trống: `undefined` (không mở khóa gì).                       |
| **`hints`**                | MULTILINE |  ⚪ Tùy chọn  | Mỗi dòng `Alt+Enter` = 1 cấp gợi ý. Code bóc tách qua `splitLines` thành mảng `hintsList` cho modal gợi ý.                                       | `fallback.hintsList` → nếu trống tiếp: `fallback.hint` → cuối cùng: `""` (modal gợi ý ẩn).              |
| **`suspect_label`**        | TEXT      |  ⚪ Tùy chọn  | Nhãn tùy biến ô nhập tên nghi phạm trên UI.                                                                                                      | `fallback.pickerConfig.suspectLabel`.                                                                   |
| **`evidence_step_label`**  | TEXT      |  ⚪ Tùy chọn  | Nhãn tùy biến danh sách chọn chứng cứ trên UI.                                                                                                   | `fallback.pickerConfig.evidenceStepLabel`.                                                              |
| **`motive_label`**         | TEXT      |  ⚪ Tùy chọn  | Nhãn tùy biến danh mục chọn động cơ trên UI.                                                                                                     | `fallback.pickerConfig.motiveLabel`.                                                                    |
| **`mismatch_label`**       | TEXT      |  ⚪ Tùy chọn  | Nhãn tùy biến danh mục chọn mâu thuẫn trên UI.                                                                                                   | `fallback.pickerConfig.mismatchTypeLabel`.                                                              |

### 3.5. Nguồn Dữ Liệu Fallback Cục Bộ

| Vụ án      | File fallback local                                                                                                 | Hàm xử lý                     |
| :--------- | :------------------------------------------------------------------------------------------------------------------ | :---------------------------- |
| `case-000` | [`content/cases/case-000/checkpoints.ts`](file:///d:/code_world/dect_project/content/cases/case-000/checkpoints.ts) | `transformSheetCheckpoints()` |
| `case-001` | [`content/cases/case-001/checkpoints.ts`](file:///d:/code_world/dect_project/content/cases/case-001/checkpoints.ts) | `transformSheetCheckpoints()` |

### 3.6. Nội Dung Fallback Thực Tế Của Từng Checkpoint (`case-000`)

Bảng dưới liệt kê **giá trị cụ thể** mà code sẽ dùng khi ô tương ứng trên Sheet để trống.

| `checkpoint_id` | `type`            | `title` (fallback)                                  | `unlocked_evidence_id` (fallback) | `hints` (fallback) | `require` (fallback)                                                                 |
| :-------------- | :---------------- | :-------------------------------------------------- | :-------------------------------- | :----------------- | :----------------------------------------------------------------------------------- |
| `cp-000-0`      | `text_match_3`    | Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh          | `f1-all-dossiers`                 | 3 cấp              | Không dùng (dùng khóa `input` với 3 ô `phone_1`, `phone_2`, `phone_3`)               |
| `cp-000-1a`     | `evidence_picker` | _(rỗng — UI hiển thị tiêu đề trống)_                | `f2-loi-khai-2-vu`                | 3 cấp              | `doc_10_so_no`, `sms_dev00`, `p6_anh_vu`, `doc_06_loi_khai_lua`, `p10_app_xe` (5 mã) |
| `cp-000-1b`     | `evidence_picker` | _(rỗng — UI hiển thị tiêu đề trống)_                | `f2-tu-thu-tung`                  | 3 cấp              | `doc_14_loi_khai_tung`, `p4_van_tay`, `p5_manh_bao`, `p4_anh_1996` (4 mã)            |
| `cp-000-2a`     | `evidence_picker` | Bóc Trần Ngoại Phạm Trần Thị Hà                     | `f4-kham-xet-phong-ha`            | 3 cấp              | `doc_voice_coi_tau`, `doc_lich_vtv3` (2 mã)                                          |
| `cp-000-2b`     | `accusation`      | Phase 2 — Bản Cáo Trạng Định Tội & Bắt Giữ Thủ Phạm | `rewards-case-000`                | 3 cấp              | `ev_hair_dna`, `ev_ao_gio_xoan` (2 mã)                                               |

**Nhãn UI fallback tương ứng** (khi các cột `*_label` để trống):

| `checkpoint_id` | `suspect_label`          | `evidence_step_label`                                                | `motive_label` / `mismatch_label`                     |
| :-------------- | :----------------------- | :------------------------------------------------------------------- | :---------------------------------------------------- |
| `cp-000-1a`     | Đối tượng tình nghi:     | Chọn tài liệu & vật chứng chứng minh động cơ & mâu thuẫn ngoại phạm: | —                                                     |
| `cp-000-1b`     | Đối tượng tình nghi:     | Chọn tài liệu & vật chứng bóc trần lời khai chối bỏ:                 | —                                                     |
| `cp-000-2a`     | Đối tượng tình nghi:     | Chọn tài liệu bẻ gãy lời khai ngoại phạm:                            | `mismatch_label`: Chọn loại mâu thuẫn trong lời khai: |
| `cp-000-2b`     | Chỉ danh thủ phạm chính: | Chọn tài liệu & vật chứng buộc tội:                                  | `motive_label`: Xác định động cơ gây án thực sự:      |

> **`case-001`** hiện chỉ có 1 checkpoint local là `cp-001-0` (type `mcq`, `unlockedEvidenceId: 'dev-02'`). Mọi checkpoint khác của vụ này nếu tạo trên Sheet sẽ **không có fallback** — phải nhập đầy đủ cột 🔴 và 🟡.

---

## 4. Kiến Trúc Đồng Bộ Giao Diện Web Mode & Boardgame Mode

- **Quy ước Bộ Hồ Sơ Con (Thay thế khái niệm Phase)**: Game phân chia tài liệu theo các phong bì/tập hồ sơ thực tế:
  - **Hồ Sơ Ban Đầu (Gốc)**: Tài liệu khám nghiệm sơ bộ, cẩm nang, lý lịch nạn nhân và nghi phạm ban đầu.
  - **Bộ Hồ Sơ A**: Lời khai nhân chứng bổ sung, sao kê nợ, tài liệu đối chất Vũ và Tùng.
  - **Bộ Hồ Sơ B**: Lệnh tái khám xét, kết quả khám nghiệm mở rộng hiện trường.
  - **Bộ Hồ Sơ C**: Bằng chứng phòng trọ Hà, định tội và bản cáo trạng bắt giữ thủ phạm.
- **Tối ưu Checkpoints & Cột `answers`**:
  - Web Mode và Boardgame Mode đồng bộ 100% cơ chế Bảng ghim + Nhập mã chứng cứ trực tiếp, **không còn lưới chọn picker cũ**.
  - **Bỏ hoàn toàn dòng `show:`** trong cột `answers` trên Google Sheet (tiết kiệm 80% dung lượng ô, chỉ giữ `suspect:`, `require:`, `mismatch:`, `motive:`, `branch:`, `input:`).
- **Cơ chế đối soát tiếng Việt không dấu (`isVietnameseTextMatch`)**: Người tạo nội dung trên Google Sheets chỉ cần nhập dạng có dấu chuẩn, hệ thống tự chuẩn hóa NFD, đối soát ranh giới từ (word token matching), chấp nhận tên tắt hoặc họ tên đầy đủ, ngăn chặn triệt để lọt chuỗi con.
- **Cấu trúc 2 cột Web Mode (`/evidence/web`)**:
  - **Cột Trái (`lg:w-[58%] xl:w-[60%]` - Bảng Điều Tra Tương Tác)**: Nhúng nguyên bản `MainInvestigationCanvas` tương tác toàn phần (nhập SĐT, bóc trần nghi phạm Vũ/Tùng/Hà, tái khám xét, cáo trạng).
  - **Cột Phải (`flex-1 min-w-0` - Hồ Sơ & Preview Tài Liệu)**:
    - _Nửa trên (`h-[38%]`)_: Danh mục hồ sơ & tang vật lọc theo loại (`all` / `pdf` / `evidence`) và bộ hồ sơ (`Ban Đầu`, `Bộ A`, `Bộ B`, `Bộ C`).
    - _Nửa dưới (`flex-1`)_: Khung xem trước tài liệu trực tiếp `EvidenceDetailInspector` (PDF iframe toolbar-less, ảnh vật chứng kèm chuỗi bảo quản) hoặc `PhoneSimulator` tương tác điện thoại nạn nhân.
