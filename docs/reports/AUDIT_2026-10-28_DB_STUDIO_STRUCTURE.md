# Audit DB, Studio, cấu trúc thư mục — 2026-10-28

> Reviewer: Claude. Cách làm: truy vấn trực tiếp DB production (`scripts/ops/run-sql.mjs`: số dòng, số ô có dữ liệu từng cột, khóa), grep code, quét file không được import ở đâu. Không chạy Playwright. HEAD `5522d73` (đã có B25 và 17 commit UI/Studio sau `db95875`).

## 0. Tóm tắt

| Mức | Số mục | Nổi bật                                                                                                                                                                            |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴  | 2      | App Bản đồ trả 404 trên production vì bảng `map_vectors` rỗng; `/api/test-scan-answer` gọi Gemini bằng key server mà không kiểm tra đăng nhập                                      |
| 🟠  | 6      | Flow view quay lại, có lại 2 nơi lưu vị trí; `case_checkpoints` có 3 cột "loại" và 3 cột rỗng; ~3.500 dòng code chết; dữ liệu bản đồ tĩnh trái quy tắc §14; code Sheets cũ còn sót |
| 🟡  | 9      | Đặt tên `case_id`/`case_slug` lẫn lộn, 3 cột avatar, ràng buộc unique trùng, file > 1.000 dòng, helper trùng, asset nặng trong `public/`                                           |

Kết luận: cấu trúc chung (1 bảng `cases` + bảng con theo `case_slug` có FK, Studio theo từng mảng) đã hợp lý cho việc dựng vụ mới từ số 0. Phần cần dọn chủ yếu là **cột/bảng thừa sau đợt chuyển Sheets→Studio** và **code chết sau khi gộp Studio**, không cần thiết kế lại.

## 1. Database (production, 26 bảng)

### 1.1. Đang ổn

- Mọi bảng nội dung vụ án có FK tới `cases.slug`; có unique theo vụ (`case_characters(case_slug,key)`, `case_checkpoints(case_id,checkpoint_id)`, `case_evidence(case_slug,code)`, `case_phone_apps(case_slug,app_type)`).
- Id pin trên bảng đã kèm tiền tố vụ (`case_000:suspect:vu`) → hai vụ không đè pin của nhau dù PK chỉ là `id`.
- Production sạch dữ liệu E2E (0 vụ `e2e%`).

### 1.2. Vấn đề

| #   | Mức | Vấn đề                                                                                                                                                                                                                                                                      | Bằng chứng                                                                                                         | Đề xuất                                                                                                                                          |
| --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | 🔴  | **`map_vectors` có 0 dòng** → `/api/map-vector` trả 404 "Unified world vector map data not found" → app Bản đồ trên điện thoại trống. Dữ liệu chỉ nằm ở `data/maps/world_vector_map.json` trong git                                                                         | `select count(*) from map_vectors` = 0; `app/api/map-vector/route.ts:38-42`                                        | Nạp `world_vector_map.json` vào `map_vectors` (id `world`) bằng script 1 lần, rồi Map Studio là nơi sửa duy nhất                                 |
| D2  | 🟠  | `case_checkpoints` 26 cột. 3 cột **0 dữ liệu**: `unlocked_evidence_id`, `suspect_label`, `evidence_step_label`. 3 cột cùng nói "loại": `type` (`mcq`, `text`…), `question_type` (`choice`, `text`… — trùng nghĩa `type`), `kind` (`phone_lookup`, `suspect_interrogation`…) | Đếm ô có dữ liệu: 0/9, 0/9, 0/9; `lib/types/checkpoint-studio.ts:328` ghi `question_type = questionType \|\| type` | Bỏ 3 cột rỗng. Giữ `kind` (nghiệp vụ) + `question_type` (dạng form), bỏ `type` sau khi đổi chỗ đọc sang `question_type`                          |
| D3  | 🟡  | `case_dossiers.flow_position` 0/5 dòng có dữ liệu; `case_board_nodes.checkpoint_id` 0/5                                                                                                                                                                                     | truy vấn đếm                                                                                                       | Bỏ nếu B26-3 chốt không dùng Flow cho hồ sơ                                                                                                      |
| D4  | 🟡  | `boardgame_pins` vừa giữ vị trí vừa giữ nội dung (`label`, `detail`, `photo_url`, `color`, `is_solved`, `pulse_border`…). Với pin sinh từ nhân vật/checkpoint, nội dung này là bản sao, dễ lệch khi sửa tên/ảnh nhân vật                                                    | 18 cột; 11/11 pin có `label`                                                                                       | Pin sinh tự động: chỉ đọc vị trí/xoay/tỉ lệ từ `boardgame_pins`, nội dung lấy từ nguồn gốc. Cột nội dung chỉ dùng cho pin tự tạo (`custom-pin-`) |
| D5  | 🟡  | 3 cột avatar ở `case_characters`: `avatar_code` (9/9, mã kiểu Sheets cũ), `avatar_url` (8/9), `avatar_asset_path` (0/9, đường dẫn Storage để xóa file)                                                                                                                      | đếm ô                                                                                                              | Giữ `avatar_url` + `avatar_asset_path`. Chuyển nhân vật còn thiếu `avatar_url` rồi bỏ `avatar_code`                                              |
| D6  | 🟡  | `cases` có `panorama_url`, `scene_360_url`, `reinvestigation_bg_url`: hai cột đầu cùng chỉ ảnh 360                                                                                                                                                                          | `case-detail-client.tsx:289-332` có 2 ô nhập riêng                                                                 | Chủ dự án chốt ý nghĩa; nếu cùng là ảnh 360 thì gộp còn 1                                                                                        |
| D7  | 🟡  | Tên khóa vụ lẫn lộn: 5 bảng dùng `case_id` (text, thực chất là slug: `case_checkpoints`, `case_dossiers`, `dossier_documents`, `boardgame_pins`, `boardgame_connections`), 15 bảng dùng `case_slug`; riêng `play_sessions.case_id` là uuid                                  | `information_schema.columns`; tên FK đều là `*_case_slug_fkey`                                                     | **Không đổi tên ngay** (đụng nhiều code, lợi ích thấp). Ghi quy ước: bảng mới dùng `case_slug`                                                   |
| D8  | 🟡  | `dossier_documents` có 2 unique: `(case_id, tag_code)` và `(case_id, mode, tag_code)`; cái thứ 2 thừa                                                                                                                                                                       | `pg_get_constraintdef`                                                                                             | Bỏ `dossier_documents_case_id_mode_tag_code_key`                                                                                                 |
| D9  | 🟡  | Bảng không dùng/không dữ liệu: `boardgame_pins_backup_b23` (backup B23), `play_sessions` (0 dòng), `app_settings` (0), `phone_photos` (0 — app có nhưng chưa biên tập)                                                                                                      | `pg_stat_user_tables`                                                                                              | Xóa backup sau smoke test production. `play_sessions`: giữ nếu sẽ làm bảng xếp hạng (spec 16), không thì bỏ                                      |

## 2. Studio và luồng dựng vụ từ số 0

Luồng hiện tại: **Cases** (meta, ảnh bìa, 360) → **Checkpoints** (nhân vật + checkpoint + bảng) → **Dossier** (tài liệu + vật chứng + hiện trường) → **Phone** → **Map**. Route `/studio/characters` và `/studio/evidence` đã chuyển hướng sang Checkpoints/Dossier. Có `case-lint-modal.tsx` để kiểm vụ.

| #   | Mức | Vấn đề                                                                                                                                                                                                                                                                                                  | Bằng chứng                                                             | Đề xuất                                                                                                                                                                                             |
| --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | 🟠  | **Flow view quay lại**: `checkpoint-studio-client.tsx:42,1520` import và render `CheckpointFlowView`, kéo node ghi `case_checkpoints.flow_position` (`:989`). Bảng ghi `boardgame_pins`. → lại có 2 bố cục cho cùng tập checkpoint, đúng điều B23 muốn bỏ. `off-board-tray.tsx` (B23) giờ không ai dùng | `git log -- checkpoint-flow-view.tsx`: `7a04bc7`, `50dbb8b`, `5522d73` | Chủ dự án chốt: (a) Flow chỉ là sơ đồ logic, vị trí riêng, chấp nhận 2 bố cục; hoặc (b) bỏ Flow, dùng "Lớp logic" trên bảng như B23                                                                 |
| S2  | 🟡  | Không có chỗ nhìn "vụ này đã đủ gì": người biên tập phải mở từng Studio                                                                                                                                                                                                                                 | —                                                                      | Trên `/studio/cases/[slug]`: danh sách 5 bước, mỗi bước hiện số dòng (nhân vật, checkpoint, tài liệu, vật chứng, app điện thoại, POI) + nút mở Studio + kết quả case-lint. Chỉ đọc, không thêm bảng |
| S3  | 🟡  | Còn mẹo chờ 800 ms rồi thử lại ở trang chi tiết vụ                                                                                                                                                                                                                                                      | `app/(admin)/studio/cases/[slug]/page.tsx:17-18`                       | Tìm nguyên nhân gốc (đọc sau ghi) — backlog                                                                                                                                                         |

## 3. Cấu trúc thư mục và code

### 3.1. Code chết (không được import ở đâu) — ~3.500 dòng

| File                                                                                     | Dòng | Ghi chú                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/admin/character-studio/characters-studio-client.tsx`                         | 546  | Studio nhân vật đã gộp vào Checkpoints                                                                                                        |
| `components/admin/dossier-studio/evidence/evidence-studio-client.tsx`                            | 500  | Route đã chuyển sang Dossier (các file khác trong thư mục vẫn dùng)                                                                           |
| `components/investigation/evidence/native-pdf-annotator.tsx`                             | 535  |                                                                                                                                               |
| `components/admin/dossier-studio/dossier-editor.tsx`                                     | 371  |                                                                                                                                               |
| `components/admin/checkpoint-studio/board/board-editor.tsx`                              | 259  |                                                                                                                                               |
| `components/admin/checkpoint-studio/off-board-tray.tsx`                                  | 216  | Xem S1                                                                                                                                        |
| `components/admin/checkpoint-studio/sections/evidence-picker-config-form.tsx`            | 154  |                                                                                                                                               |
| `components/investigation/teammate-presence-cluster.tsx`                                 | 138  |                                                                                                                                               |
| `components/investigation/evidence/evidence-theme-context.tsx`                           | 131  |                                                                                                                                               |
| `lib/actions/auth-guard.ts`                                                              | 13   | Trùng `checkIsAdmin` ở `lib/auth/admin.ts`                                                                                                    |
| `components/phone-engine/chassis/iphone-classic-chassis.tsx`, `modern-phone-chassis.tsx` | 13   |                                                                                                                                               |
| `lib/case-locations-data.ts` (phần dữ liệu)                                              | ~500 | `ROAD_NODES`, `ROAD_EDGES`, `LOCATION_METAS`, `CASE_LOCATIONS`, `DEFAULT_CASE_LOCATIONS` không ai import; chỉ type được dùng. Trái AGENTS §14 |

Cách tìm: script quét mọi file trong `components/`, `lib/`, `hooks/`, coi là chết nếu không file nào import theo `@/…` hoặc đường dẫn tương đối.

### 3.2. File quá to (> 1.000 dòng)

| File                                                                              | Dòng  |
| --------------------------------------------------------------------------------- | ----- |
| `components/investigation/evidence/dossier-canvas-board.tsx`                      | 3.182 |
| `components/admin/checkpoint-studio/checkpoint-studio-client.tsx`                 | 1.779 |
| `components/admin/map-studio/map-studio-client.tsx`                               | 1.700 |
| `components/admin/dossier-studio/dossier-studio-client.tsx`                       | 1.375 |
| `components/investigation/evidence/workspaces/canvas-investigation-workspace.tsx` | 1.326 |
| `components/investigation/hero-interactive/render-scene.ts`                       | 1.241 |
| `components/admin/phone-studio/messages-editor.tsx`                               | 1.100 |
| `components/investigation/board/add-suspect-modal.tsx`                          | 1.063 |

`dossier-canvas-board.tsx` là chỗ đáng tách nhất (3.182 dòng, vừa sửa nhiều). Tách khi sắp sửa lớn tiếp, không tách chỉ để tách.

### 3.3. Trùng lặp

- `asString`, `asStringArray`: 3 bản (`lib/checkpoints/kinds.ts`, `lib/cms/checkpoint-runtime.ts`, `lib/types/checkpoint-studio.ts`).
- `checkIsAdmin`: 2 bản (`lib/actions/auth-guard.ts` chết, `lib/auth/admin.ts`).
- `cleanList` (`character-actions.ts`, `checkpoint-studio.ts`), `toWords` (`phone-lookup-modal.tsx`, `server-grader.ts`).
- `data/maps/case_000_vector.json` giống hệt kích thước `world_vector_map.json` (718.893 byte), cộng 2 file `*.backup*.json` (~1,4 MB) — trái quy tắc 1 bản đồ (§14).
- `tiktok_source.wav` (9 MB) có ở cả `public/audio/sfx/` và `docs/cases/…`; bản trong `public/` không được code nào dùng.

### 3.4. Sót lại từ thời Google Sheets

- `lib/cms/checkpoint-cms.ts` (891 dòng): bảng alias cột Sheet (`kieu`, `kieu_cau_hoi`…). Chỉ còn `parseAnswersColumn` được `custom-pin-modal.tsx` dùng.
- `syncEvidenceFromGoogleSheet` (`lib/actions/evidence-actions.ts:313`).
- Script `sync:docs-to-sheet`, `sync:gdocs`, `sync:testimonies`, `import:checkpoints` trong `package.json`.
- `AGENTS.md` §2, §6 vẫn mô tả Google Sheets là CMS → tài liệu lệch với hệ thống (DB + Studio).

### 3.5. Bảo mật và code bẩn

| #   | Mức | Vấn đề                                                                                                                                                                                                           | Bằng chứng                                     |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| C1  | 🔴  | `POST /api/test-scan-answer` gọi Gemini bằng key server, không thấy kiểm tra đăng nhập hay giới hạn tần suất; tên "test" nhưng gameplay dùng thật (`add-suspect-modal.tsx:369`) → ai cũng gọi được, tốn tiền key | `app/api/test-scan-answer/route.ts:17,100,116` |
| C2  | 🟡  | 118 chỗ `any` trong 32 file; 6 `eslint-disable`/`ts-ignore`; 3 `console.log`                                                                                                                                     | grep                                           |
| C3  | 🟡  | Asset nặng: `public/keyhole.glb` 6,7 MB không ai dùng (3D đã đóng băng); `PANORAMA.png` 10 MB chưa nén (§5 yêu cầu tối ưu)                                                                                       | `git ls-files public \| du`                    |
| C4  | 🟡  | `scripts/archive/` 61 file (có Python) vẫn được commit                                                                                                                                                           | `git ls-files scripts/archive`                 |

## 4. Việc tiếp theo

→ `docs/WORKTREE_PLAN.md` bảng **B26**.
