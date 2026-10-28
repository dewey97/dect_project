# 21. Studio: chức năng, trường thông tin và lý do thiết kế

> Tài liệu mô tả bộ Studio tại `/studio/*` như hiện có trên `main` (HEAD `5522d73`, 2026-10-28). Nguồn: đọc code `components/admin/**`, `app/(admin)/studio/**`, `lib/checkpoints/**`, `lib/types/checkpoint-studio.ts` và lịch sử commit. Toàn bộ dữ liệu vụ án nằm trong Supabase; Studio là nơi biên tập duy nhất. Google Sheets không còn là CMS.

## 1. Vì sao Studio được sửa theo hướng này

Các thay đổi gần đây của chủ dự án đi theo 6 ý. Mỗi ý kèm commit làm bằng chứng.

| #   | Ý thiết kế                                                                                                                                                                                                                       | Đã làm                                                                                                                       | Commit                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **Biên tập ở nơi dữ liệu được dùng.** Nhân vật là chủ thể của checkpoint (thẩm tra, câu hỏi phụ, cáo trạng), nên sửa nhân vật cùng màn hình với checkpoint. Vật chứng nằm trong bộ hồ sơ, nên sửa vật chứng trong Dossier Studio | Bỏ Studio nhân vật riêng, gộp vào Checkpoint Studio; `/studio/characters` và `/studio/evidence` chuyển hướng                 | `7a04bc7`, `c2a125d`, `846b056`, `d7fa9c7`, `35db1da` |
| 2   | **Thấy ngay kết quả (WYSIWYG).** Sửa ô nhập là bảng điều tra và sơ đồ Flow đổi ngay, không phải lưu rồi tải lại. Có chế độ "Test bảng" để bấm ghim như người chơi                                                                | Cập nhật live vào state (0 s), bảng nổi kéo/thu phóng/xoay, chế độ Test, nút Chơi thử                                        | `8cc6616`, `7a04bc7`, `0ca0b08`                       |
| 3   | **Chọn từ dữ liệu có sẵn thay vì gõ mã.** Giảm lỗi chính tả mã nhân vật, mã checkpoint                                                                                                                                           | Dropdown chọn nhân vật, dropdown phụ thuộc (`depends_on`), dropdown động                                                     | `3a6c7ba`, `03688fb`                                  |
| 4   | **Một loại câu hỏi, một form.** Người biên tập không phải biết cấu trúc JSON `answer_config`                                                                                                                                     | Chuẩn hóa `kind`, form riêng cho từng loại, gợi ý gắn vào phần câu hỏi                                                       | `5522d73`, `9507871`                                  |
| 5   | **Không còn dữ liệu cứng của case_000 trong code.** Vụ mới tạo từ số 0 không bị dính tên, ảnh, node của vụ mẫu                                                                                                                   | Ảnh nạn nhân lấy từ nhân vật; bỏ node hướng dẫn evidence hub cứng; bỏ mã `cp-000` và key nhân vật cứng                       | `1765a88`, `6268d92`, `4a4d32f`, `a7b03ec`            |
| 6   | **Thao tác nhanh như công cụ thiết kế.** Ít cuộn, nút quan trọng ở header, một nút lưu chung, phím tắt                                                                                                                           | Nút lên header, lưu chung, `Ctrl+S`, `Ctrl+Z`, `Ctrl+Y`/`Ctrl+Shift+Z`, cảnh báo khi rời trang chưa lưu, kéo đổi độ rộng cột | `0be0237`, `8cc6616`, `7a04bc7`                       |

Thêm: thẩm tra nghi phạm rút từ 3 lớp còn **2 lớp** (Động cơ, Mâu thuẫn), bỏ Ngoại phạm cho gọn (`142b922`, AGENTS.md §13).

## 2. Luồng dựng một vụ mới từ số 0

| Bước | Studio                         | Tạo ra                                                                                              | Bảng DB                                                       |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1    | Cases → "Tạo vụ"               | Vụ trống với `slug`                                                                                 | `cases`                                                       |
| 2    | Cases → chi tiết vụ            | Tiêu đề, tóm tắt, cốt truyện, ảnh bìa, ảnh 360                                                      | `cases`                                                       |
| 3    | Checkpoints                    | Nhân vật (nạn nhân, nghi phạm, nhân chứng)                                                          | `case_characters`                                             |
| 4    | Checkpoints                    | Checkpoint (câu hỏi, đáp án, gợi ý, lời dẫn, hậu án), quan hệ phụ thuộc                             | `case_checkpoints`                                            |
| 5    | Checkpoints → Bảng điều tra    | Vị trí ghim, xoay, tỉ lệ, dây nối, node tự tạo                                                      | `boardgame_pins`, `boardgame_connections`, `case_board_nodes` |
| 6    | Dossier                        | Bộ hồ sơ, tài liệu (lý lịch, lời khai), vật chứng, ảnh/PDF                                          | `case_dossiers`, `dossier_documents`, `case_evidence`         |
| 7    | Dossier → Hiện Trường 360      | Ảnh 360, panorama, hotspot khám xét lại                                                             | `cases`, `reinvestigation_hotspots`                           |
| 8    | Phone                          | Máy nạn nhân: thiết bị, ứng dụng, danh bạ, tin nhắn, cuộc gọi, ảnh, ghi chú, lịch sử web, giao dịch | `case_phone_apps`, `phone_*`, `case_characters.device`        |
| 9    | Map                            | Địa điểm (POI) gắn `caseId` trên bản đồ thế giới chung                                              | `map_vectors`                                                 |
| 10   | Checkpoints → Linter, Chơi thử | Kiểm logic, chơi thử từ một checkpoint                                                              | —                                                             |
| 11   | Cases                          | Đổi trạng thái `DRAFT` → `PUBLISHED`                                                                | `cases.status`                                                |

Có thể nhân bản cả vụ (gồm nhân vật, checkpoint, bảng, hotspot, metadata) để làm mẫu: nút "Duplicate" ở danh sách Cases (`ba30c99`, `cd2d979`).

## 3. Cases — `/studio/cases`

**Chức năng:** danh sách vụ (tìm theo tiêu đề/ID), tạo vụ, nhân bản vụ, xóa vụ, mở trang chi tiết.

**Trang chi tiết `/studio/cases/[slug]`:**

| Trường              | Cột DB                   | Ghi chú                                                                                                                |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Tiêu đề             | `title`                  |                                                                                                                        |
| Tóm tắt             | `synopsis`               | Bối cảnh ngắn, hiện ở danh sách vụ                                                                                     |
| Cốt truyện đầy đủ   | `full_story`             | Dòng thời gian, sự thật vụ án (cho GM)                                                                                 |
| Trạng thái          | `status`                 | `DRAFT` / `PUBLISHED`                                                                                                  |
| Ảnh bìa             | `cover_image_url`        | Đường dẫn `/images/...` hoặc URL, có nút tải lên                                                                       |
| Ảnh 360 hiện trường | `scene_360_url`          | Ảnh cầu equirectangular cho `Scene360Viewer`                                                                           |
| Ảnh panorama        | `panorama_url`           | Ảnh toàn cảnh dự phòng; gameplay dùng `scene_360_url` trước, thiếu thì dùng panorama (`reinvestigation-modal.tsx:233`) |
| Nền khám xét lại    | `reinvestigation_bg_url` |                                                                                                                        |

## 4. Checkpoints — `/studio/checkpoints?case=<slug>`

Màn hình chính để dựng logic vụ án. Gồm 3 vùng:

- **Cột trái:** danh sách checkpoint và nhân vật, dropdown chọn nhanh, nút "Thêm Checkpoint", "Thêm Nhân vật".
- **Giữa:** sơ đồ **Flow** (`?view=flow`, mặc định): mỗi checkpoint là một node, mũi tên `depends_on` dạng smoothstep. Kéo node để sắp xếp; vị trí lưu ở `case_checkpoints.flow_position`. Có thể chuyển sang **Bảng điều tra** (`?view=board`).
- **Cột phải (inspector, bật/tắt được):** form của checkpoint hoặc nhân vật đang chọn.

**Header:** Bảng điều tra (bật bảng nổi), Chơi thử, Linter, Lưu (`Ctrl+S`).

**Bảng điều tra nổi (`floating-board-panel.tsx`):** kéo di chuyển; phóng to/thu nhỏ từng 0,1×; xoay ghim ±2°; 2 chế độ: **Chỉnh sửa** (kéo ghim) và **Test bảng** (bấm ghim mở câu hỏi/hồ sơ như người chơi). Bật "Lớp logic" để vẽ và sửa quan hệ `depends_on` bằng mũi tên trực tiếp trên bảng.

**Lưu:** một nút lưu ghi theo thứ tự: checkpoint đã sửa → nhân vật → cấu hình thẩm tra gắn liền → bố cục bảng (ghim, xoay, tỉ lệ, dây nối). Gõ phím được debounce để bảng không giật.

### 4.1. Nhân vật (`character-editor.tsx`)

| Trường        | Cột `case_characters`                                    | Ghi chú                                                             |
| ------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Mã nhân vật   | `key`                                                    | Duy nhất trong vụ; dùng làm `subject_key` của checkpoint            |
| Họ tên        | `name`                                                   |                                                                     |
| Tên gọi khác  | `aliases[]`                                              | Người chơi gõ tên gọi khác vẫn được chấp nhận                       |
| Vai trò       | `role`                                                   | `victim`, `suspect`, `witness`                                      |
| Mô tả         | `description`                                            | Nghề nghiệp, tính cách, quan hệ                                     |
| Số điện thoại | `phones[]`                                               | Dùng cho tra cứu SĐT                                                |
| Ảnh đại diện  | `avatar_url` (+ `avatar_asset_path` khi tải lên Storage) | Dán link Drive/URL hoặc tải file; ảnh nạn nhân trên bảng lấy từ đây |
| Thiết bị      | `device` (JSON)                                          | Cấu hình điện thoại của nhân vật, sửa ở Phone Studio                |

### 4.2. Checkpoint — phần chung (`checkpoint-identity-form.tsx` và các section)

| Phần      | Trường                                                                  | Cột `case_checkpoints`                             |
| --------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Định danh | Mã checkpoint                                                           | `checkpoint_id` (duy nhất trong vụ)                |
|           | Tiêu đề                                                                 | `title`                                            |
|           | Loại                                                                    | `kind`                                             |
|           | Dạng ô trả lời                                                          | `question_type`                                    |
|           | Câu hỏi                                                                 | `question`                                         |
| | Nhân vật liên quan | `subject_key`: không chọn trong form checkpoint. Checkpoint thẩm tra được tạo/mở từ form nhân vật (chọn nghi phạm ở tab "Nhân vật"), `subject_key` = mã nhân vật |
|           | Phụ thuộc                                                               | `depends_on[]` (chọn checkpoint phải xong trước)   |
|           | Mở bộ hồ sơ khi xong                                                    | `answer_config.unlocksDossier`                     |
|           | Hiện trên bảng / vị trí bảng                                            | `board_config`                                     |
| Đáp án    | Theo loại, xem 4.3                                                      | `answer_config`                                    |
| Gợi ý     | Danh sách gợi ý theo nhóm, có tiêu đề nhóm (`[động cơ]`, `[mâu thuẫn]`) | `hints`                                            |
| Lời dẫn   | Đoạn kể chuyện khi mở khóa                                              | `narrative`                                        |
| AI check  | Bối cảnh, mẫu ĐẠT, mẫu TRƯỢT để AI chấm câu trả lời tự do               | `ai_context`, `ai_valid_cases`, `ai_invalid_cases` |

### 4.3. Checkpoint — theo loại (`kind`)

| `kind`                  | Dùng cho                       | Trường trong form                                                                                                 | `answer_config`                                                                                                                           |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `phone_lookup`          | Tra số điện thoại ra tên người | Danh sách ô: nhãn, placeholder, các đáp án đúng                                                                   | `textMatchInputs[]`                                                                                                                       |
| `suspect_interrogation` | Thẩm tra nghi phạm 2 lớp       | **Động cơ:** vật chứng bắt buộc, vật chứng tùy chọn, bối cảnh, mẫu đúng/sai, gợi ý riêng. **Mâu thuẫn:** tương tự | `motiveEvidenceIds`, `optionalMotiveIds`, `motiveContext`, `contradictionEvidenceIds`, `optionalContradictionIds`, `contradictionContext` |
| `followup`              | Câu hỏi phụ sau thẩm tra       | Loại câu hỏi phụ (giờ, trắc nghiệm, mã, chữ), phương án, đáp án, ảnh kèm                                          | `questionType`, `options`, `correctAnswer`, `photoCodes`                                                                                  |
| `indictment`            | Cáo trạng kết án               | Bị can đúng (tên hoặc mã), động cơ chấp nhận, chứng cứ bắt buộc, chứng cứ bổ trợ                                  | `validSuspects`, `validMotives`, `requiredEvidenceIds`, `optionalEvidenceIds`                                                             |
| `epilogue`              | Hậu án                         | Danh sách phần: tiêu đề + độc thoại; thêm/xóa phần                                                                | `epilogueStories[]`                                                                                                                       |
| `choice`                | Trắc nghiệm                    | Phương án, đáp án đúng                                                                                            | `options`, `correctAnswer`                                                                                                                |
| `code`                  | Mã / mật khẩu                  | Đáp án đúng                                                                                                       | `correctAnswer`                                                                                                                           |
| `time`                  | Mốc thời gian                  | Đáp án đúng                                                                                                       | `correctAnswer`                                                                                                                           |
| `text`                  | Trả lời tự do                  | Đáp án (tùy chọn) + AI check                                                                                      | `correctAnswer`                                                                                                                           |

Chặn chọn bừa: khi người chơi chọn vật chứng, mọi mã đã chọn phải thuộc `bắt buộc + tùy chọn`, và phải đủ mã bắt buộc (`validateEvidenceSelection`, AGENTS.md §13).

### 4.4. Linter và Chơi thử

- **Linter** (`lib/checkpoints/case-linter.ts`, `case-lint-modal.tsx`): báo thiếu nhân vật nạn nhân; nghi phạm chưa có checkpoint thẩm tra; `depends_on` trỏ tới checkpoint không tồn tại; chu trình phụ thuộc vòng; checkpoint không đi tới được từ checkpoint khởi đầu nào; trắc nghiệm dưới 2 phương án; câu hỏi phụ thiếu đáp án; tra cứu SĐT chưa có ô nhập; thẩm tra chưa có mã chứng cứ động cơ/mâu thuẫn; cáo trạng thiếu bị can hoặc chứng cứ bắt buộc; mã chứng cứ không có trong vụ. Nút "Kiểm tra lại".
- **Chơi thử** (`lib/checkpoints/case-playtest.ts`): mở gameplay của vụ, có thể bắt đầu từ checkpoint đang chọn.

### 4.5. Node bảng tự tạo (`board-node-form.tsx`)

| Trường        | Cột `case_board_nodes`                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| Loại node     | `node_kind` (`victim`, `victim_phone`, `suspects_hub`, `evidence_hub`, `reinvestigate`, …) |
| Tiêu đề       | `title`                                                                                    |
| Nhân vật/khóa | `subject_key`                                                                              |
| Ảnh           | `config.image` (đường dẫn `/images/...` hoặc URL)                                          |
| Nhãn hiển thị | `config.label` (trống thì dùng tiêu đề)                                                    |
| Góc xoay      | lưu ở `boardgame_pins.rotation`                                                            |

## 5. Dossier — `/studio/dossier?case=<slug>`

Biên tập hồ sơ giấy như tài liệu thật, trên một mặt bàn có pan/zoom.

**Header:** bật/tắt sửa trực tiếp trên tài liệu, phóng to/thu nhỏ (`Ctrl` + cuộn), đặt lại 100 %, về vị trí gốc, **Hiện Trường 360**, Xuất, Lưu.

**Danh sách bộ hồ sơ (`dossier-list-panel.tsx`, `dossier-config-modal.tsx`):**

| Trường                               | Cột `case_dossiers`                        |
| ------------------------------------ | ------------------------------------------ |
| Mã bộ                                | `dossier_key`                              |
| Tên bộ (VD: Bộ A, Hồ sơ hiện trường) | `title`                                    |
| Mô tả                                | `description`                              |
| Tài liệu trong bộ                    | `document_codes[]` (chọn theo mã hoặc tên) |

Bộ hồ sơ được mở khóa bởi checkpoint qua `answer_config.unlocksDossier`.

**Tài liệu (`dossier_documents`, `mode` = loại):**

| Loại                                    | Trường                                                                                                                            | Lưu ở                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Lý lịch (`dossier-ly-lich-sheet.tsx`)   | Họ tên, tên thường gọi, sinh ngày, giới tính, số CMND, hôn nhân, nghề nghiệp, nơi ĐKHKTT, nơi ở, SĐT, đặc điểm nhận diện, ảnh 3×4 | `subject_name`, `content`  |
| Lời khai (`dossier-loi-khai-sheet.tsx`) | Người được lấy lời khai, điều tra viên, các cặp Hỏi/Đáp (thêm, xóa, đổi thứ tự)                                                   | `content`                  |
| Chung                                   | Mã tag tài liệu, dấu đỏ giáp lai & PC02, độ nghiêng con dấu                                                                       | `tag_code`, `paper_config` |

**Vật chứng (`evidence-form.tsx`):**

| Trường                                    | Cột `case_evidence`        |
| ----------------------------------------- | -------------------------- |
| Mã (VD: A-01)                             | `code` (duy nhất trong vụ) |
| Tên                                       | `title`                    |
| Loại: ảnh hiện trường/vật phẩm, PDF ngoài | `kind`                     |
| Tệp (tải lên hoặc URL)                    | `file_url`, `thumb_url`    |
| Mô tả                                     | `description`              |

**Hiện Trường 360 (`scene-360-config-modal.tsx`):** tải ảnh 360 và panorama (ghi `cases.scene_360_url`, `cases.panorama_url`), đặt hotspot khám xét lại (ghi `reinvestigation_hotspots.hotspots`).

## 6. Phone — `/studio/phone?case=<slug>`

Dựng điện thoại tang vật, xem mô phỏng trực tiếp bên cạnh (nút "Tải lại mô phỏng"; tóm tắt số cuộc gọi, tin nhắn, ảnh, ứng dụng, manh mối).

| Mục                                                  | Trường                                                                                                                                                 | Bảng                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Thiết bị (`device-form.tsx`)                         | Tên máy, ảnh khung, giờ và ngày trên màn khóa, mật mã (trống = không khóa), nhà mạng, trường tùy biến (tên/giá trị)                                    | `case_characters.device`                                          |
| Ứng dụng (`app-launcher-editor.tsx`)                 | Tạo nhanh 15 app chuẩn, tên hiển thị, thứ tự, đặt ở dock, khóa app, "Mở khi xong" checkpoint                                                           | `case_phone_apps` (`unlock_checkpoint_id`)                        |
| Danh bạ                                              | Tên, tên hiển thị, SĐT, nhóm, ghi chú quan hệ, ảnh, đánh dấu đáng ngờ                                                                                  | `phone_contacts`                                                  |
| Tin nhắn (`messages-editor.tsx`)                     | Cuộc trò chuyện (tên, SĐT), từng dòng: người gửi, nội dung, giờ, mã manh mối (MSG-01), đính kèm ảnh/audio + thời lượng; **dán nhanh cả khối kịch bản** | `phone_messages`                                                  |
| Cuộc gọi                                             | Tên, SĐT, giờ, thời lượng (trống = gọi nhỡ), file ghi âm, phân tích manh mối                                                                           | `phone_calls`                                                     |
| Ảnh                                                  | Mã, ảnh, thời điểm, địa điểm, chú thích                                                                                                                | `phone_photos`                                                    |
| Ghi chú, lịch sử web, giao dịch (`misc-editors.tsx`) | Tiêu đề, nội dung, thời điểm; URL và tiêu đề trang; người nhận, nội dung chuyển khoản, số tiền                                                         | `phone_notes`, `phone_browser_history`, `phone_bank_transactions` |

## 7. Map — `/studio/map`

Biên tập **một** bản đồ vector dùng chung cho mọi vụ (AGENTS.md §14).

- Công cụ (phím tắt): Chọn/sửa đỉnh (V), Vẽ tuyến đường (R), Vẽ đường sắt (T), Vẽ hồ & sông (W), Vẽ phân khu (Z), Cắm địa danh/hotspot (P), Đặt nhãn chữ (L).
- Inspector: đổi tên (nhấp đúp), độ rộng nét, uốn lượn mềm, nổi lên/chìm xuống, xóa (Delete); chọn loại đường, loại địa danh, phân khu.
- Lưu nháp ngầm trên trình duyệt và báo "Tìm thấy bản nháp chưa lưu"; nút LƯU ghi vào `map_vectors` (id `world`) qua `/api/admin/map-vector`.
- Bật khung iPhone để xem bản đồ như trong game.
- POI gắn `caseId`/`caseIds` để chỉ hiện ở vụ tương ứng; POI công cộng không gắn.

## 8. Quản trị khác

| Trang                 | Chức năng                                                    |
| --------------------- | ------------------------------------------------------------ |
| `/studio` (dashboard) | Tổng quan                                                    |
| `/studio/players`     | Danh sách người chơi, tìm theo tên/ID                        |
| `/studio/feedbacks`   | Phản hồi người chơi, trạng thái Mới / Đã xử lý (`feedbacks`) |
| `/studio/settings`    | Thêm email đồng tác giả, thông báo ra mắt                    |

## 9. Tín hiệu cho kiểm thử

Mỗi trang Studio gắn `data-studio-ready="true"` khi đã tải xong và không có thao tác lưu đang chạy. Spec E2E chờ tín hiệu này thay vì chờ cố định (`d9f61c2`, `fe8b006`).
