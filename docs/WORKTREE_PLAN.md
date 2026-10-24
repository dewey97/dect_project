# Worktree Plan v2 — Tách việc song song (2026-10-24)

> Bản kế hoạch thay thế toàn bộ Worktree Plan cũ. Mọi worktree nhánh từ `main` tại commit base của Bước 0 (sau khi commit thay đổi gỡ fallback evidence).
> Quy ước chung, ràng buộc dự án và điều kiện done giữ nguyên như `AGENTS.md` (global + dự án) và `docs/HANDOFF_ROADMAP.md` mục 2–3.
>
> Tài liệu liên quan: `docs/TECHDEBT.md`, `docs/HANDOFF_ROADMAP.md`, `docs/core_specs/13_architecture_hardening_and_roadmap.md`, `docs/core_specs/20_phone_studio.md`.

---

## 0. Trạng thái xuất phát

- `main` đã có các commit tài liệu mới nhất; working tree còn thay đổi code gỡ fallback evidence (xem Bước 0).
- Build production (`NEXT_DIST_DIR=.next_dev npx next build`) đã pass sau merge 4 worktree.
- E2E: 13 pass, 2 skip, 1 fail do `e2e/evidence-studio.spec.ts` thiếu auth admin — đã sửa spec, chưa chạy lại.
- Migration production: **21–37 đã chạy**. Migration 37 reseed toàn bộ case_000 từ Google Sheets (54 evidence, 39 contacts, 89 messages, 21 calls, 2 notes, 4 safari, 6 bank; junk apps xóa). Số migration còn trống bắt đầu từ **38**.
- 4 commits chưa push: worktree plan v2, board editor doc, evidence base doc, ops hardening.
- Kết quả khảo sát nguồn dữ liệu và hardcode: xem mục 11 (phụ lục).
- **Không có worktree nào đang active** (tất cả WT cũ đã merge vào main, nhánh đã dọn). 7 local branches cũ đã merged — có thể xóa.
- 6 remote branches cũ (`2d`, `feature/finding-matcher`, `master`, `worktree-ldp-flashlight-split`) — có thể dọn.

### Trả lời nhanh câu hỏi "đã chuyển hết từ Google Sheets sang chưa?"

**Chưa.** Còn 4 nhóm Sheet-only hoặc còn fallback Sheets:

1. Tab `evidences` — 7 consumer (`main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal`, `admin-create-pin-modal`, `photos-app`, `reinvestigation-modal`, `use-case-checkpoints`). Route `/api/phone-data/evidences` không tồn tại (trả 400) nên **luôn** rơi về Sheets, dù bảng `case_evidence` đã có dữ liệu.
2. Ghi pin ảnh/dossier/note vào Sheet `evidences!A:I` tại `app/api/admin/pins/route.ts`.
3. `usePhoneData` fallback Sheets cho `photos`, `contacts`, `calls`, `messages` mỗi khi bảng Supabase rỗng/lỗi.
4. `useLivePinPhotos` (hero board) fallback ảnh Sheets khi `phone_photos` rỗng.

Đã migrate xong, không còn Sheets: checkpoints, characters, apps launcher, trang evidence (`case_evidence`).

Lệch pha cần sửa: `notes-app`, `safari-app`, `banking-app`, `photos-app` đang đọc sai nguồn (xem WT-6).

---

## 1. Quy tắc chung cho mọi worktree

### 1.1. Tạo worktree

```bash
git worktree add ../dect_wt_<ten> -b wt/<ten> main
cd ../dect_wt_<ten>
pnpm install
cp ../dect_project/.env .env
```

- Chỉ dùng **pnpm**.
- Dev/E2E cổng riêng: WT-1 `3111`, WT-2 `3112`, WT-3 `3113`, WT-4 `3114`, WT-5 `3115`, WT-6 `3116`, WT-7 `3117` (`PORT=311x pnpm dev`, `PORT=311x pnpm test:e2e`).
- Không `git push`. Commit khi xong trọn một đơn vị việc.
- Không chạy migration production. Viết SQL, chủ dự án duyệt.
- `import type` cho mọi type (AGENTS.md §12). Không `next/font/google` (§11). Không `autoFocus`/`.focus()` khi mở modal (§3).
- Không thêm mock/fallback nội dung vụ án (§6). Fallback chỉ được là trạng thái rỗng/đang tải.
- Không đụng `components/investigation/archive_3d_vault/`, `landing-hero.tsx` (§8, §9).

### 1.2. Vùng sở hữu và file dùng chung

| File dùng chung                                                                        | Quy tắc                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `lib/types/database.ts`                                                                | Chỉ **thêm** interface/field ở cuối file trong block `// WT-x`. Không sửa interface cũ.    |
| `components/ui/*`                                                                      | WT-3 tạo primitive mới; worktree khác chỉ import, không sửa.                               |
| `components/admin/admin-sidebar.tsx`                                                   | Không worktree nào sửa; integrator thêm menu nếu cần.                                      |
| `CHANGELOG.md`, `docs/HANDOFF_ROADMAP.md`, `docs/TECHDEBT.md`, `docs/WORKTREE_PLAN.md` | Không worktree nào sửa; integrator cập nhật sau merge.                                     |
| `db/schema/*.sql`                                                                      | Chỉ dùng số migration được cấp: WT-4 → `38`, WT-1 → `39`. Các WT khác không tạo migration. |
| `e2e/*`                                                                                | Mỗi worktree tạo spec riêng; không sửa spec của worktree khác.                             |
| `package.json`, `pnpm-lock.yaml`                                                       | Không thêm dependency nếu chưa được duyệt.                                                 |

### 1.3. Ma trận sở hữu file (chống conflict)

| Nhóm file                                                                                                                                                                                                                    | WT-1 board |                        WT-2 phone                        | WT-3 studio ux |                WT-4 character                | WT-5 evidence |                   WT-6 cms                   | WT-7 ops |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: | :------------------------------------------------------: | :------------: | :------------------------------------------: | :-----------: | :------------------------------------------: | :------: |
| `components/investigation/mindmap/**`                                                                                                                                                                                        |   **X**    |                                                          |                | riêng `suspect/suspect-evaluation-modal.tsx` |               |                                              |          |
| `components/phone-engine/**`                                                                                                                                                                                                 |            | **X** (trừ `apps/{notes,safari,banking,photos}-app.tsx`) |                |    `apps/phone-app.tsx` (avatar liên hệ)     |               | `apps/{notes,safari,banking,photos}-app.tsx` |          |
| `components/admin/phone-studio/**`                                                                                                                                                                                           |            |                          **X**                           |                |                                              |               |                                              |          |
| `components/admin/checkpoint-studio/**` (trừ `board/**` và tab bảng trong `checkpoint-editor.tsx`), `dossier-studio/**`, `app/(admin)/studio/cases/**`                                                                       |            |                                                          |     **X**      |                                              |               |                                              |          |
| `components/admin/checkpoint-studio/board/**` (mới), tab "Bảng điều tra" trong `checkpoint-editor.tsx`, `components/investigation/mindmap/admin-create-pin-modal.tsx`                                                        |   **X**    |                                                          |                |                                              |               |                                              |          |
| `components/admin/character-studio/**`, `lib/actions/character-actions.ts`, `lib/cases/characters.ts`, `lib/cases/case-characters.ts`, `app/api/characters/route.ts`, `components/investigation/case-characters-context.tsx` |            |                                                          |                |                    **X**                     |               |                                              |          |
| `components/admin/evidence-studio/**`, `components/investigation/evidence/**`, `app/(investigation)/evidence/**`, `lib/hooks/use-case-evidence.ts`, `lib/actions/evidence-actions.ts`                                        |            |                                                          |                |                                              |     **X**     |                                              |          |
| `app/api/phone/**`, `app/api/phone-data/**`, `app/api/admin/pins/route.ts`, `lib/hooks/use-phone-data.ts`, `lib/google/**`, `lib/hooks/use-case-checkpoints.ts`                                                              |            |                                                          |                |                                              |               |                    **X**                     |          |
| `components/investigation/hero-interactive/**`                                                                                                                                                                               |            |                                                          |                |            (chỉ đọc `avatarUrl`)             |               |       **X** (`use-live-pin-photos.ts`)       |          |
| `docker-compose.yml`, `deploy/**`, `scripts/ops/vps-*`                                                                                                                                                                       |            |                                                          |                |                                              |               |                                              |  **X**   |

> ~~WT-1 được phép sửa `main-investigation-canvas.tsx` (chuyển nguồn evidences sang `useCaseEvidence`) — WT-6 **không** sửa file này.~~
>
> **Điều chỉnh (2026-10-24 review):** Việc thay `usePhoneData("evidences")` → `useCaseEvidence` cho **tất cả** 7 consumer (`main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal`, `admin-create-pin-modal`, `reinvestigation-modal`, `evidence/web/page.tsx`, `use-case-checkpoints`) chuyển **hoàn toàn sang WT-6**. WT-1 chỉ import `useCaseEvidence` (đã có sẵn sau merge WT-6). Lý do: tránh 2 worktree cùng sửa nguồn evidences trên cùng file, giảm xung đột merge.

### 1.4. Điều kiện "done" của một worktree

1. `npx tsc --noEmit --incremental false` sạch (chạy 1 lần ở cuối).
2. `pnpm test:e2e` pass toàn bộ trên cổng riêng, gồm spec mới của worktree.
3. Case_000 chơi được như trước (không regression), kiểm tra desktop 1440×900 + mobile 375×812.
4. Báo cáo bàn giao: file đã sửa, migration cần chạy, việc tích hợp còn lại, rủi ro.

---

## 2. Bước 0 — Chốt base (làm trước khi tách worktree)

Đang có thay đổi dở trong `main` từ việc gỡ fallback evidence (chưa commit). Đây là phần việc **WT-5 làm sẵn trước khi tách nhánh**:

- Đã xóa `components/investigation/evidence/evidence-data.ts` (`CASE_000_PDFS`, `CASE_000_EVIDENCE`).
- `lib/hooks/use-case-evidence.ts`: bỏ import hằng số tĩnh + nhánh fallback; chỉ map `rawEvidence` từ `getCaseEvidence`; fetch rỗng/lỗi giữ danh sách rỗng + trạng thái lỗi.
- `app/(investigation)/evidence/web/page.tsx`: bỏ import `CASE_000_PDFS`; `selectedView` chuyển sang nullable; `PDFViewerModal` nhận `pdfUrl={selectedView?.type === "pdf" ? selectedView.data.url : null}`.
- `components/investigation/evidence/dossier-tray.tsx`: prop `selectedView: SelectedView | null`; so khớp lựa chọn dùng optional chaining.
- `components/investigation/evidence/evidence-detail-inspector.tsx`: `selectedView` nullable, trả `null` khi chưa chọn.
- `e2e/evidence-studio.spec.ts`: thêm `test.use({ storageState: "e2e/.auth/admin.json" })` + skip guard khi thiếu `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` (trước đó fail vì admin layout redirect `/login`).
- `npx tsc --noEmit --incremental false`: **sạch** (sau khi xử lý `selectedView` nullable).
- `pnpm test:e2e`: chưa chạy lại sau thay đổi.

Việc cần làm khi bắt đầu đợt code (khoảng 15 phút):

1. `pnpm test:e2e` pass (spec evidence studio sẽ skip nếu thiếu `E2E_ADMIN_*`; ghi rõ trong báo cáo).
2. Commit `refactor(evidence): remove static case_000 fallback data` (không push).
3. Tách các worktree từ commit này.

Trong lúc chưa chốt base, working tree giữ nguyên, **không commit code**; chỉ commit tài liệu kế hoạch.

Nếu chủ dự án muốn bỏ thay đổi dở: `git checkout -- .` và `git clean -fd components/investigation/evidence`, rồi chuyển toàn bộ việc trên vào WT-5 (mục 1 giữ nguyên mô tả).

---

## 3. WT-1 — `wt/board-dynamic` (Bảng điều tra dữ liệu hóa + chuyển editor về Checkpoint Studio)

**Mục tiêu:** mọi node trên bảng điều tra đến từ dữ liệu (Supabase), không còn id/tọa độ/tên/mã chứng cứ gắn cứng case_000. **Toàn bộ chế độ admin trên bảng gameplay (kéo thả, xem toàn bộ, tạo node) chuyển vào Checkpoint Studio**; bảng trong gameplay chỉ còn vai trò hiển thị/playtest.

**Sở hữu:** `components/investigation/mindmap/**` (trừ `suspect/suspect-evaluation-modal.tsx`), `components/admin/checkpoint-studio/board/**` (mới), `components/admin/checkpoint-studio/checkpoint-editor.tsx` (chỉ phần tab/shell), `lib/guides/interactive-walkthrough-data.ts`, `db/schema/39_board_nodes.sql`, `e2e/board-dynamic.spec.ts`, `e2e/board-studio.spec.ts`.

> WT-3 **không** sửa `components/admin/checkpoint-studio/board/**` và `checkpoint-editor.tsx`; WT-3 chỉ sở hữu `sections/**` và các form config.

**Hiện trạng (khảo sát):** 101 dòng khớp nhóm case/id và 130 dòng khớp nhóm tên/suspect key trên 18 file. Nặng nhất:

- `canvas/pin-builder.ts`: `DESKTOP_SUSPECT_SLOTS`, `MOBILE_SUSPECT_SLOTS`, `DYNAMIC_PHOTO_SLOTS`, 5 pin nền `c0-pin-*` với tọa độ cứng, `c0-pin-followup-vu/tung/ha`, fallback tên "Nguyễn Văn Khang", connection id `c0-conn-*`.
- `main-investigation-canvas.tsx`: map phase `cp-000-1a/1b/1c/0/2b`, map avatar `avatar_vu/tung/ha/...`, nhận diện nạn nhân theo `khang`, fallback tên.
- `admin-create-pin-modal.tsx`: `PRESET_CASE_PHOTOS`, `PRESET_STICKY_TEMPLATES`, `PRESET_DOSSIER_TEMPLATES`, default `cp-000-0`, map `vu→cp-000-1a`. Đây là UI admin đang nằm trong gameplay.
- `use-board-layout.ts` + `main-investigation-canvas.tsx`: chế độ admin kéo thả/tạo node ngay trên bảng gameplay.
- Các modal còn fallback key/tên/mã: `add-suspect-modal`, `indictment-modal`, `followup-question-modal`, `culprit-epilogue-modal`, `canvas-modals`, `dossier-result-modal`, `phone-lookup-modal`, `interactive-walkthrough`.

**Thiết kế:**

1. **Migration 39 — `39_board_nodes.sql`** (chủ dự án duyệt trước khi chạy):
   - `ALTER TABLE case_checkpoints ADD COLUMN board_config JSONB NOT NULL DEFAULT '{}'::jsonb` — cấu hình hiển thị node gắn checkpoint: `pin_title`, `icon`, `photo_url`, `style`, `position {mobile,desktop}`, `connections[]`, `hidden`, `locked_until`.
   - Bảng `case_board_nodes` **chỉ cho node không gắn checkpoint** (node hệ thống + ghim tự do): `id TEXT PRIMARY KEY`, `case_slug TEXT NOT NULL REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE CASCADE`, `node_kind TEXT NOT NULL` (`victim_phone | reinvestigate | suspects_hub | evidence_hub | note | photo | dossier | custom`), `title`, `subject_key`, `checkpoint_id TEXT NULL REFERENCES case_checkpoints(id) ON DELETE CASCADE` (cho phép ghim thêm một checkpoint ở vị trí khác), `slot_index`, `config JSONB` (`icon`, `photo_url`, `style`, `position`, `connections`), timestamps.
   - Backfill case_000: chỉ các node không gắn checkpoint (`victim_phone`, `reinvestigate`, `suspects_hub`, `evidence_hub`). Node checkpoint (`phone_lookup`, nghi phạm, followup, indictment) **không** backfill vào bảng — dẫn xuất trực tiếp và đọc `board_config`.
   - RLS: đọc public, ghi `private.is_admin()`.
   - `boardgame_pins` giữ nguyên vai trò lưu vị trí kéo tay; thứ tự ưu tiên vị trí: `boardgame_pins` → `board_config.position`/`case_board_nodes.config.position` → layout tự tính.
2. **Node dẫn xuất, không nhân bản:** `pin-builder.ts` dựng node từ:
   - `case_checkpoints` (kind `phone_lookup`, `followup`, `indictment`, `choice/code/time/text`) + `board_config`;
   - `case_characters` role victim/suspect (nạn nhân, hub nghi phạm);
   - `case_evidence` (hub vật chứng);
   - `cases.scene_360_url`/`panorama_url` (node khám xét lại);
   - `case_board_nodes` (node hệ thống còn lại + ghim tự do).
     Bỏ 3 mảng slot tĩnh và 5 pin nền cứng; nếu vụ chưa cấu hình thì tính layout xác định từ danh sách, không dùng id case_000.
3. **Chuyển editor bảng sang Checkpoint Studio:**
   - Trang mới trong Checkpoint Studio: tab "Bảng điều tra" (route `/studio/checkpoints?case=<slug>&view=board` hoặc panel toàn màn hình), dùng lại renderer canvas nhưng có overlay chỉnh sửa: kéo thả node, nối dây, tạo node, sửa `board_config`/`case_board_nodes`, bật/tắt hiển thị, đặt điều kiện mở.
   - Di chuyển logic của `admin-create-pin-modal.tsx` và chế độ admin trong `use-board-layout.ts` vào `components/admin/checkpoint-studio/board/**`; xóa nhánh admin khỏi bảng gameplay.
   - Nút "Chơi thử" trong editor bảng gọi `lib/checkpoints/case-playtest.ts` (đã có ở C4) để mở gameplay từ trạng thái hiện tại — giữ playtest trong Studio.
4. **Bảng gameplay chỉ đọc:** `MainInvestigationCanvas` bỏ toggle admin, bỏ tạo/kéo node, bỏ `admin-create-pin-modal`. Vẫn render đủ node, hover/click mở modal nghiệp vụ. Kiểm tra không còn nút admin nào lộ cho người chơi.
5. **Bỏ map key/tên**: `findFollowupCulprit` mặc định `vu/ha/tung`, `detectCheckpointForPin` suy `cp-${key}-followup`, `hasVu/Tung/HaFollowup`, tên "Lê Quang Vũ/Nguyễn Thanh Tùng/Trần Thị Hà", nạn nhân "Nguyễn Văn Khang" → lấy từ `CaseCharactersProvider` + `checkpoint.subjectKey` + `device.label`.
6. **Click handler**: nhận node theo `node_kind`/`checkpoint_id`, không so id chữ cứng.
7. **Modal**:
   - `add-suspect-modal`: bỏ chặn `khang`, mã admin `"000"/"00"`, `isVu/isTung/isHa`; nghi phạm lấy từ `case_characters` role suspect.
   - `indictment-modal`: bỏ `isCulpritValid` cứng và mã chứng cứ fallback; giữ `validSuspects/validMotives/requiredEvidenceIds`; thông tin vụ án (tội danh, thời gian, địa điểm, hung khí) đọc từ checkpoint/case metadata — nếu chưa có nguồn, ghi vào `case_checkpoints.answer_config` hoặc `cases.metadata`, **không** hardcode.
   - `followup-question-modal`: bỏ fallback `vu→time/tung→choice/ha→code`, tên cứng, `TARGET_CODES` D-04..D-06; chỉ dùng `inputType`, `photoCodes`, `subjectKey`; storage key `followup_${subjectKey}`.
   - `culprit-epilogue-modal`: bỏ `cp-epilogue-ha`, nhánh `isHaBoxSolved`.
   - `phone-lookup-modal`, `canvas-modals`, `dossier-result-modal`: bỏ fallback key/tên/mã; nội dung Hồ sơ A/B/C đọc từ dossier/checkpoint.
8. **Nguồn evidences**: ~~thay `usePhoneData("evidences")` trong `main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal` bằng `useCaseEvidence(caseId)`.~~ **Đã chuyển sang WT-6 (Điều chỉnh 1).** WT-1 chỉ import `useCaseEvidence` (đã có sẵn sau merge WT-6), không tự thay thế `usePhoneData`.
9. **Walkthrough**: dữ liệu bước điều tra lấy `targetPinId` từ node DB theo `node_kind`; bỏ danh sách id cứng.

**Kiểm tra:**

- `board-dynamic.spec.ts`: đếm node render = số node dữ liệu; click 5 node chính mở đúng modal; bảng gameplay **không** có nút chế độ admin; tạo case mới không seed vẫn thấy node theo dữ liệu.
- `board-studio.spec.ts` (admin): mở tab "Bảng điều tra", kéo node → lưu vị trí → mở gameplay thấy vị trí mới; tạo node note → xuất hiện ở gameplay; bấm "Chơi thử" mở gameplay đúng case.
- Case_000 E2E cũ pass.

**Rủi ro:** migration 39 là thay đổi schema lõi; `board_config` mặc định `{}` nên checkpoint cũ vẫn render bằng layout tự tính. Phương án lùi: nếu chưa muốn bảng `case_board_nodes`, node hệ thống suy từ `cases`/`case_characters` và ghim tự do tạm giữ trong `boardgame_pins` — nhưng sẽ không đáp ứng yêu cầu "mọi node custom".

---

## 4. WT-2 — `wt/phone-devices` (Nhiều dòng iPhone + sửa tin nhắn hàng loạt)

**Mục tiêu:** (a) khung điện thoại theo nhiều model/kích thước; (b) soạn/sửa tin nhắn nhanh, không thêm từng tin.

**Sở hữu:** `components/phone-engine/**` trừ `apps/{notes,safari,banking,photos}-app.tsx`, `components/admin/phone-studio/**`, `lib/types/phone.ts`, `lib/actions/phone-actions.ts`, `e2e/phone-devices.spec.ts`, `e2e/messages-editor.spec.ts`, `docs/core_specs/20_phone_studio.md`.

**A. Khung thiết bị nhiều model**

Hiện trạng: chỉ `chassis: "iphone_classic" | "iphone_modern" | "android_vintage"`; kích thước cứng 415×768 và 390×780; `android_vintage` không có renderer; "đời máy" chỉ là chuỗi hiển thị; app bên trong thiết kế cứng 375×600.

1. `lib/phone/devices.ts`: bảng preset (id, tên, logicalW/logicalH, screenW/screenH, bezel, radius, notch/dynamic island, home indicator):

   | id                          | Tên               | Khung   | Màn hình                |
   | --------------------------- | ----------------- | ------- | ----------------------- |
   | `iphone_se`                 | iPhone SE (2020)  | 375×667 | 375×667, viền trên/dưới |
   | `iphone_8_plus`             | iPhone 8 Plus     | 414×736 | 414×736                 |
   | `iphone_classic` (alias cũ) | iPhone 6s Plus    | 415×768 | 375×600                 |
   | `iphone_12_mini`            | iPhone 12 mini    | 375×812 | 375×812, notch          |
   | `iphone_13`                 | iPhone 13         | 390×844 | 390×844, notch          |
   | `iphone_15`                 | iPhone 15         | 393×852 | 393×852, dynamic island |
   | `iphone_15_pro_max`         | iPhone 15 Pro Max | 430×932 | 430×932, dynamic island |

   Preset có thể chỉnh trong file; GM chọn ở Device Form. `android_vintage` ẩn khỏi select (không có renderer).

2. Gộp `iphone-classic-chassis.tsx` + `modern-phone-chassis.tsx` thành `device-chassis.tsx` nhận preset; giữ export cũ để không vỡ import.
3. Scale: dùng `ResizeObserver` trên container (thay vì chỉ `window.resize`), clamp theo preset; thêm test cho split-pane resize.
4. Bên trong màn hình: giữ viewport logic cố định 375×600 scale theo khung để app không vỡ layout; nếu màn hình cao hơn (812–932), cho nền/chrome giãn (`h-full`) và app giữ tỉ lệ. Ghi rõ giới hạn này trong spec 20.
5. `device.model` / `model_id` lưu trong `case_characters.device` JSONB — **không cần migration**; `device-form.tsx` select preset + hiển thị kích thước; `phone-simulator.tsx` đọc `model_id`, fallback `chassis`.
6. Bỏ hardcode wallpaper case_000 trong chassis; thiếu ảnh thì nền trung tính.

**B. Soạn tin nhắn hàng loạt**

Hiện trạng: mỗi tin một form; luôn tạo tin mồi "Xin chào..."; không sửa tin đã tạo; `role` không nhất quán (`me|them` vs `sent|received`); `slot_index` mỗi thread tự đếm nên trùng toàn cục; Supabase trả row phẳng nhưng `MessagesApp` chỉ hiểu thread row kiểu Sheets.

1. Sửa `MessagesApp` đọc đúng row phẳng `phone_messages` (group theo `thread_key`, sort theo `slot_index`), chuẩn hóa role `sent|received`; bỏ parse `messages_json`/`messages_text`. Đồng bộ Studio preview dùng cùng logic.
2. `MessagesEditor` viết lại theo hướng bảng:
   - Chọn thread → danh sách tin dạng dòng inline-edit (thời gian, người gửi, nội dung, đính kèm, cờ manh mối).
   - Thêm nhiều dòng cùng lúc; dán khối text (mỗi dòng `Tên: nội dung`, hỗ trợ `[20:15]`) hoặc JSON.
   - Lưu một lần (`savePhoneMessagesBatch`) thay vì gọi action mỗi tin; xóa/sửa/đổi thứ tự trong batch.
   - Tạo thread mới không kèm tin mồi; `thread_key` tự sinh từ tên.
   - `slot_index` đánh lại tuần tự trong thread khi lưu.
3. `phone-actions.ts`: thêm `savePhoneMessagesBatch(caseSlug, threadKey, messages[])` (validate role, upsert theo id, delete thiếu), giữ action cũ cho tương thích.
4. E2E: dán 5 dòng → lưu → mở Messages trong simulator thấy đúng 5 tin, đúng thứ tự/role; sửa nội dung 1 tin → preview cập nhật.

**Rủi ro:** đổi shape dữ liệu Messages ảnh hưởng case_000 đang chạy; phải test với 89 tin/16 thread đã seed.

---

## 5. WT-3 — `wt/studio-ux` (Dọn UI/UX Studio)

**Mục tiêu:** bớt thông tin thừa, bớt mô tả/placeholder dài, trường kỹ thuật ẩn/tự sinh, ô nhập 1 dòng + tự giãn khi cần.

**Sở hữu:** `components/admin/checkpoint-studio/**` (trừ `board/**` và tab "Bảng điều tra" trong `checkpoint-editor.tsx` — WT-1 giữ), `components/admin/dossier-studio/**`, `app/(admin)/studio/cases/**`, `app/(admin)/studio/settings/**`, `app/(admin)/studio/players/**`, `app/(admin)/studio/feedbacks/**`, `components/ui/field.tsx` (mới), `e2e/studio-ux.spec.ts`.

**Không sở hữu** (đã chia): board editor trong checkpoint studio (WT-1), evidence studio (WT-5), phone studio (WT-2), character studio (WT-4).

**Nguyên tắc chung:**

1. Tạo `components/ui/field.tsx`: `Field({label, hint?, children})` + `AutoGrowTextarea` mặc định `rows=1` cho mọi trường văn bản dài. Thay các `Field` cục bộ trùng lặp trong checkpoint studio.
2. **Bỏ khỏi UI chính** (vẫn tự sinh ngầm): `key`/`slug`, `tag_code`, `id` nội bộ (`cp-epilogue-N`, `lookup_<timestamp>`), `slot_index`, `phase`, `followupOf` nhập tay → chuyển sang select checkpoint; `subject_key` nhập tay → select nhân vật cùng vụ; mã chứng cứ nhập tay → picker.
3. Trường kỹ thuật buộc phải còn (ví dụ `valid_suspects`): đặt trong khối "Nâng cao" thu gọn, mặc định đóng.
4. **Xóa placeholder/helper dài** dạng mô tả quy trình; giữ label ngắn. Danh sách cụ thể: `checkpoint-identity-form.tsx:120-127`, `suspect-interrogation-config-form.tsx:136,186,236`, `phone-lookup-config-form.tsx:65-85`, `followup-config-form.tsx:100-108`, `indictment-config-form.tsx` (4 placeholder), `dossier-config-modal.tsx:205-227`, `dossier-studio-sidebar.tsx:181-289`.
5. Dossier: ẩn "Khóa kỹ thuật", ghi chú dùng textarea auto-grow; giữ mã tag vì dùng liên kết chứng cứ.
6. Cases: bỏ hiển thị `ID: {slug}`; giữ search theo slug ngầm.
7. Settings/Players/Feedbacks: rà placeholder dài, bảng không cần thiết.

**Kiểm tra:** spec `studio-ux.spec.ts` (skip khi thiếu credential admin): mở từng trang studio, không còn text placeholder dài được liệt kê, các trường auto-grow tăng chiều cao khi nhập nhiều dòng, không có trường `key`/`slug`/`slot_index` hiển thị ở form chính.

---

## 6. WT-4 — `wt/character-assets` (Gắn ảnh vào nhân vật)

**Mục tiêu:** GM tải ảnh trực tiếp cho từng nhân vật; ảnh hiển thị ở bảng điều tra, modal thẩm tra, danh bạ điện thoại.

**Sở hữu:** `db/schema/38_character_avatar.sql`, `lib/actions/character-actions.ts`, `components/admin/character-studio/**`, `app/api/characters/route.ts`, `lib/cases/characters.ts`, `lib/cases/case-characters.ts`, `components/investigation/case-characters-context.tsx`, `components/phone-engine/apps/phone-app.tsx`, `components/investigation/mindmap/suspect/suspect-evaluation-modal.tsx`, `e2e/character-avatar.spec.ts`.

**Hiện trạng:** `case_characters` chỉ có `avatar_code TEXT`; ảnh thật nằm ở evidence/phone photo mã `avatar_*`; Characters Studio chỉ nhập mã; bucket `avatars` tồn tại nhưng policy cho phép ghi công khai và không được dùng; gameplay hiển thị placeholder nếu không có ảnh evidence.

**Thiết kế:**

1. Migration 38:
   - `ALTER TABLE case_characters ADD COLUMN avatar_url TEXT`, `avatar_asset_path TEXT`.
   - Siết policy bucket `avatars`: đọc public, ghi/xóa chỉ `private.is_admin()` (hiện `13_storage_buckets.sql` cho phép public insert/update/delete — rủi ro bảo mật).
   - Không backfill ảnh từ Sheet trong SQL; nếu muốn giữ ảnh cũ, script ops một lần đọc `case_evidence` code `avatar_*` rồi `UPDATE` (chủ dự án chạy).
2. `lib/actions/character-actions.ts`: thêm `uploadCharacterAvatar(caseSlug, key, file)` — upload bucket `avatars` path `cases/{slug}/characters/{key}.{ext}`, lưu `avatar_url`/`avatar_asset_path`; xóa file cũ khi thay.
3. Characters Studio: khối ảnh chân dung có preview + nút tải/xóa, thay ô `Mã ảnh trên tab evidences`; giữ trường device nạn nhân nhưng thu gọn.
4. `/api/characters` trả `avatar_url`; `CaseCharactersProvider` map `avatarUrl = avatar_url || ảnh evidence legacy || placeholder`. `lib/cases/characters.ts` ưu tiên cột mới, bỏ map tên `vu/tung/ha/khang` (dùng `key`/aliases).
5. Render:
   - `pin-builder` dùng `avatarUrl` (hợp đồng đã có, không cần chờ WT-1).
   - `suspect-evaluation-modal` hiển thị avatar + tên.
   - `phone-app` danh bạ: nếu contact khớp alias/phone với character thì dùng `avatar_url`, fallback chữ cái đầu; "My Card" dùng ảnh nạn nhân.
6. E2E: admin upload ảnh → API trả URL → pin bảng điều tra và modal thẩm tra có `<img>` đúng nguồn.

**Phụ thuộc:** WT-1 có thể dùng `avatarUrl` ngay; sau merge, ảnh thật xuất hiện mà không cần sửa thêm.

---

## 7. WT-5 — `wt/evidence-ux` (Chứng cứ: preview theo bộ hồ sơ, bỏ metadata rác)

**Mục tiêu:** tài liệu xem theo bộ hồ sơ; bỏ các trường "thời điểm thu thập / niêm phong / người thu thập" vô nghĩa; form gọn.

**Sở hữu:** `components/investigation/evidence/**`, `app/(investigation)/evidence/**`, `components/admin/evidence-studio/**`, `lib/hooks/use-case-evidence.ts`, `lib/actions/evidence-actions.ts`, `e2e/evidence-studio.spec.ts`, `e2e/evidence-dossier-grouping.spec.ts`.

**Nhiệm vụ:**

1. Nhận base từ Bước 0 (fallback removal + spec auth). Base này **đã implement sẵn** trên working tree `main`: xóa `evidence-data.ts`, `use-case-evidence.ts` chỉ map DB, `selectedView` nullable ở `page.tsx`/`dossier-tray.tsx`/`evidence-detail-inspector.tsx`, spec evidence dùng admin `storageState` + skip guard. Còn lại: chạy `pnpm test:e2e` rồi commit base trước khi tách nhánh; WT-5 không làm lại các bước này.
2. **Bỏ metadata rác khỏi UI**: `timestamp`, `recoveredBy`, `integrityStatus`, `chainOfCustody`, `evidenceId` trong `components/admin/evidence-studio/evidence-form.tsx:467-533`, `evidence-preview.tsx:204-245`; bỏ fallback tương ứng trong `use-case-evidence.ts:33-53` và hardcode trong `page.tsx:271-276`.
   - Giữ `code` (khóa tham chiếu checkpoint) nhưng tự sinh từ tiêu đề, ẩn trong "Nâng cao"; bỏ hiển thị `#code`, `P{phase}`, `S{slot}` trong danh sách studio.
   - `chainOfCustody` đang không có input nhưng vẫn ghi payload — xóa khỏi state/payload.
3. **Preview theo bộ hồ sơ**:
   - `dossier-tray.tsx`: nhóm tài liệu theo `case_dossiers` (`title`, `document_codes`) thay chip phase cứng "Khởi đầu/Bộ A/B/C"; nhóm "Vật chứng" riêng; nhóm chưa gán bộ.
   - `use-case-dossiers.ts` bổ sung map `code → dossier{key,title}` (đã có `codeMap`, cần trả metadata).
   - Inspector hiển thị breadcrumb "Bộ hồ sơ: <tên>" + preview PDF `DiegeticDossierSheet` khi khớp dossier; ảnh vẫn `EvidencePhotoAnnotator` nhưng bỏ badge `VẬT CHỨNG [evidenceId]` (dùng tiêu đề).
   - `page.tsx`: truyền `dossierKey/title` vào item; không suy phase theo chữ cái khi dossier đã khai báo.
4. **Form gọn**: placeholder ngắn; `description` dùng `AutoGrowTextarea` (`components/ui/auto-grow-textarea.tsx` **đã tồn tại sẵn**, không phụ thuộc WT-3); upload file giữ nguyên.
5. E2E: mở khay hồ sơ case_000, thấy group theo tên bộ; click tài liệu thuộc bộ A → inspector hiện đúng bộ + sheet; studio form không còn 4 trường metadata.

**Lưu ý dữ liệu:** xóa field khỏi payload nhưng **không** xóa cột `metadata` trong DB (tránh migration không cần thiết). Dữ liệu cũ vẫn nằm trong JSONB, UI bỏ qua.

---

## 8. WT-6 — `wt/cms-cutover` (Cắt hoàn toàn Google Sheets khỏi runtime)

**Mục tiêu:** mọi dữ liệu runtime đọc Supabase; Sheets chỉ còn ở script ops một lần.

**Sở hữu:** `app/api/phone/**`, `app/api/phone-data/**`, `app/api/admin/pins/route.ts`, `lib/hooks/use-phone-data.ts`, `lib/google/**`, `lib/hooks/use-case-checkpoints.ts`, `components/phone-engine/apps/{notes,safari,banking,photos}-app.tsx`, `components/investigation/hero-interactive/use-live-pin-photos.ts`, `scripts/ops/*sync*` (chỉ nhãn/đường dẫn), `.env.example`, `e2e/no-sheets.spec.ts`.

> **[Điều chỉnh 1]** WT-6 cũng sở hữu việc thay `usePhoneData("evidences")` → `useCaseEvidence` trên các file gameplay: `main-investigation-canvas.tsx`, `add-suspect-modal.tsx`, `followup-question-modal.tsx`, `admin-create-pin-modal.tsx`, `reinvestigation-modal.tsx`, `evidence/web/page.tsx`, `use-case-checkpoints.ts`. Phạm vi chạm các file thuộc `mindmap/**` chỉ giới hạn ở **dòng import và lời gọi `usePhoneData`** — không sửa logic nghiệp vụ (đó là WT-1).

**Nhiệm vụ:**

1. Thêm `evidences` vào `app/api/phone-data/[tab]/route.ts` map `case_evidence`; giữ alias `code/photo_code`, `label/title`, `thumb_url/url` để `PhotosApp` và modal không vỡ; lọc `case_slug`.
2. Sửa app đọc đúng bảng:
   - `notes-app` → `phone_notes` (tab `notes`).
   - `safari-app` → `phone_browser_history` (tab `browser`).
   - `banking-app` → `phone_bank_transactions` (tab `bank`).
   - `photos-app` → `phone_photos` (tab `photos`), bỏ fallback prop.
   - Kiểm tra `MiscEditors` ghi đúng các bảng này (đang ghi đúng).
3. `usePhoneData`: bỏ nhánh fallback `/api/phone`; lỗi/rỗng trả trạng thái lỗi + nút thử lại (không giả lập nội dung). Giữ cache in-memory 30s.
4. `/api/admin/pins`: bỏ ghi Sheet `evidences!A:I`; ảnh/dossier/note pin ghi Supabase (`case_evidence` metadata hoặc `case_board_nodes` sau WT-1 — trước merge dùng `case_evidence`).
5. `useCaseCheckpoints`: bỏ enrich evidences từ Sheets, dùng `case_evidence`.
6. `use-live-pin-photos`: bỏ fallback Sheets; chỉ `phone_photos`/`case_evidence`.
7. Xóa `app/api/phone/route.ts` (hoặc trả 410 kèm ghi chú) sau khi grep sạch consumer; gỡ `lib/google/auth.ts` khỏi runtime (giữ cho scripts ops nếu cần, chuyển vào `scripts/ops/lib`).
8. `.env.example`: đánh dấu `GOOGLE_*` chỉ dùng cho script export/import một lần; không còn bắt buộc runtime.
9. E2E `no-sheets.spec.ts`: chặn request tới `docs.google.com`/`sheets.googleapis.com`; mở game, phone, evidence, bảng điều tra — không request Sheets, dữ liệu vẫn đủ.

**Rủi ro:** nếu một bảng Supabase rỗng ở production (case mới), UI sẽ trống thay vì rơi về Sheets — đúng chủ trương "Live-First, không fallback tĩnh", nhưng cần thông báo trạng thái rỗng rõ ràng.

---

## 9. WT-7 — `wt/ops-hardening` (Hạ tầng, không đụng code gameplay)

**Sở hữu:** `docker-compose.yml`, `deploy/**`, `scripts/ops/vps-docker-reclaim.sh`, `docs/core_specs/06_cicd_deployment_guide.md`.

1. `docker-compose.yml`: đổi `3000:3000` → `127.0.0.1:3000:3000` để không bypass Traefik/giả `X-Real-IP`.
2. Caddy edge config (Pha 5): HSTS `max-age=31536000`, access-log redaction query string, chuyển tiếp `X-Real-IP` đúng chuỗi.
3. Kiểm tra `vps-docker-reclaim.sh` giữ `:latest` + `:previous`, chỉ chạy khi container `running`; thêm systemd timer mẫu 03:00.
4. Checklist thủ công: bật Leaked Password Protection, xác nhận `SUPABASE_SERVICE_ROLE_KEY` trong container; xoay key `.env` + `git rm --cached .env` (chủ dự án).
5. Không sửa mã app.

---

## 10. Thứ tự tích hợp và xung đột

| Bước | Việc                                                                                                                                                              | Lý do                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0    | Merge Bước 0 (base evidence fix)                                                                                                                                  | Mọi worktree cùng base                                              |
| 1    | Merge WT-4 (character assets)                                                                                                                                     | Cung cấp `avatar_url` thật cho pin/modal                            |
| 2    | Merge WT-2 (phone devices + messages)                                                                                                                             | Độc lập, chạm phone engine                                          |
| 3    | Merge WT-6 (cms cutover)                                                                                                                                          | Sau WT-2 để tránh sửa trùng `messages-app`/`phone-app`              |
| 4    | Merge WT-1 (board dynamic)                                                                                                                                        | Phụ thuộc WT-4 (avatar); WT-6 đã thay evidences → `useCaseEvidence` |
| 5    | Merge WT-5 (evidence ux)                                                                                                                                          | Chạm tray/inspector; sau WT-1 để tránh đổi cấu trúc item            |
| 6    | Merge WT-3 (studio ux)                                                                                                                                            | Chạm form studio; sau cùng để áp primitive lên bản đã merge         |
| 7    | Merge WT-7 (ops)                                                                                                                                                  | Không xung đột                                                      |
| 8    | Integrator: chạy `tsc`, `pnpm test:e2e`, `NEXT_DIST_DIR=.next_dev npx next build`, cập nhật `CHANGELOG.md`, `HANDOFF_ROADMAP.md`, `TECHDEBT.md`, `docs/README.md` | Điều kiện done                                                      |

**Xung đột tiềm ẩn đã xử lý bằng ma trận mục 1.3:**

- `components/phone-engine/apps/phone-app.tsx`: WT-4 (avatar) — WT-2 không chạm.
- `use-case-evidence.ts`: WT-5 — WT-1 chỉ import.
- `lib/cases/characters.ts`: WT-4 — WT-1 dùng `avatarUrl` từ provider.
- `lib/types/database.ts`: WT-4 thêm field `avatar_url` ở cuối file; WT-2 thêm type batch message ở cuối file (nếu cần). Integrator kiểm tra trùng tên.
- `e2e/evidence-studio.spec.ts`: WT-5 sửa; WT-1/WT-6 không chạm.
- **[Điều chỉnh 1]** `usePhoneData("evidences")` → `useCaseEvidence` trên 7 consumer (`main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal`, `admin-create-pin-modal`, `reinvestigation-modal`, `evidence/web/page.tsx`, `use-case-checkpoints`): **WT-6 sở hữu toàn bộ việc thay thế**. WT-1 merge **sau** WT-6 và chỉ import `useCaseEvidence` đã có sẵn — không còn xung đột trên nhóm file này.

**Chạy song song tối đa:** WT-4 + WT-2 + WT-6 + WT-7 (4 worktree). WT-1 và WT-5 chờ WT-4/WT-6 merge nếu muốn tránh rebase; WT-3 chạy cuối.

---

## 11. Phụ lục — Kết quả khảo sát (2026-10-24)

### 11.1. Nguồn dữ liệu còn đọc Google Sheets

| Consumer                                                          | Tab / dữ liệu                    | Ghi chú                         |
| ----------------------------------------------------------------- | -------------------------------- | ------------------------------- |
| `main-investigation-canvas.tsx:198`                               | `evidences`                      | Danh sách nghi phạm/ảnh         |
| `add-suspect-modal.tsx:121`                                       | `evidences`                      |                                 |
| `followup-question-modal.tsx:70`                                  | `evidences`                      |                                 |
| `admin-create-pin-modal.tsx:191`                                  | `evidences`                      |                                 |
| `components/phone-engine/apps/photos-app.tsx:38`                  | `evidences`                      | Route Supabase không có tab này |
| `components/investigation/evidence/reinvestigation-modal.tsx:234` | `evidences`                      |                                 |
| `lib/hooks/use-case-checkpoints.ts:100`                           | `evidences`                      | Chỉ enrich label/mô tả          |
| `app/api/admin/pins/route.ts:120-157`                             | ghi `evidences!A:I`              | Ảnh/dossier/note pin            |
| `use-phone-data.ts:90-94`                                         | `photos/contacts/calls/messages` | Fallback khi Supabase rỗng      |
| `use-live-pin-photos.ts:32`                                       | `photos`                         | Fallback ảnh bảng hero          |

### 11.2. Hardcode bảng điều tra theo file

| File                                    | Dòng khớp id/case | Dòng khớp tên/key | Chính                                              |
| --------------------------------------- | ----------------: | ----------------: | -------------------------------------------------- |
| `mindmap/main-investigation-canvas.tsx` |                24 |                40 | phase map `cp-000-*`, avatar map, nạn nhân "Khang" |
| `mindmap/canvas/pin-builder.ts`         |                27 |                16 | slot tọa độ, 5 pin nền, followup `vu/tung/ha`      |
| `mindmap/admin-create-pin-modal.tsx`    |                23 |                10 | 3 bộ preset ảnh case_000, `cp-000-0`               |
| `mindmap/add-suspect-modal.tsx`         |                 1 |                16 | chặn "khang", mã `000` → `vu`                      |
| `mindmap/indictment-modal.tsx`          |                 1 |                12 | tên/mã chứng cứ/vụ án tĩnh                         |
| `mindmap/followup-question-modal.tsx`   |                 2 |                 9 | fallback type, `D-04..D-06`                        |
| `mindmap/culprit-epilogue-modal.tsx`    |                 3 |                 9 | `cp-epilogue-ha`                                   |
| `mindmap/canvas/canvas-modals.tsx`      |                 0 |                 8 | index A/B/C → `vu/tung/ha`                         |
| `mindmap/dossier-result-modal.tsx`      |                 3 |                 5 | toàn bộ nội dung Hồ sơ A/B/C                       |
| `mindmap/interactive-walkthrough.tsx`   |                 5 |                 2 | target pin id                                      |
| `mindmap/phone-lookup-modal.tsx`        |                 1 |                 2 | 3 SĐT + đáp án                                     |

### 11.3. Phone engine hiện trạng

- Chỉ 2 renderer thực: classic 415×768 / modern 390×780; `android_vintage` không render.
- App bên trong thiết kế cứng 375×600.
- Messages editor: thêm từng tin, luôn tạo tin mồi, không sửa, role không nhất quán, `slot_index` trùng giữa các thread.
- `notes/safari/banking/photos-app` đọc sai nguồn (tab `apps` hoặc Sheets `evidences`).

### 11.4. Evidence inspector hiện trạng

- Photo chỉ render ảnh + badge `VẬT CHỨNG [evidenceId]`; metadata không hiển thị.
- Không nhóm theo bộ hồ sơ; chip phase cứng "Tất cả / Khởi đầu / Bộ A/B/C".
- Studio form còn 4 trường metadata vô nghĩa + `chainOfCustody` ẩn trong payload.

### 11.5. Character avatar hiện trạng

- Chỉ `avatar_code`; không upload; bucket `avatars` cho phép ghi công khai và không dùng.
- Ảnh thật nằm ở evidence/phone photo mã `avatar_*`.
- Không render avatar trong modal thẩm tra và danh bạ điện thoại.

---

## 12. Quyết định đã chốt (2026-10-24)

| #   | Quyết định                                                                           | Đã chốt                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Có tạo bảng `case_board_nodes` (migration 39) để mọi node đều custom?                | **Có, thu hẹp.** Node gắn checkpoint lưu trong `case_checkpoints.board_config`; `case_board_nodes` chỉ giữ node hệ thống + ghim tự do. Editor bảng chuyển hẳn vào Checkpoint Studio. |
| D2  | Danh sách model iPhone                                                               | **7 preset** ở WT-2 mục A.                                                                                                                                                           |
| D3  | Xóa hẳn trường "thời điểm thu thập/niêm phong/người thu thập" khỏi DB hay chỉ ẩn UI? | **Chỉ bỏ UI/payload**, giữ cột `metadata` trong DB.                                                                                                                                  |
| D4  | Xóa hẳn `/api/phone` (Google Sheets) sau cutover?                                    | **Giữ route nhưng không gọi**, xóa ở bước sau khi grep sạch consumer.                                                                                                                |
| D5  | Ưu tiên chạy song song đợt 1                                                         | **WT-4, WT-2, WT-6, WT-7.** WT-1, WT-5, WT-3 chạy sau theo thứ tự mục 10.                                                                                                            |

### Điều chỉnh (review 2026-10-24)

| #   | Điều chỉnh                                                                                          | Lý do                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| R1  | Thay `usePhoneData("evidences")` → `useCaseEvidence` trên 7 consumer chuyển **hoàn toàn sang WT-6** | WT-1 và WT-6 cùng chạm nhóm file `mindmap/**` trên dòng import evidences — gộp về WT-6 tránh xung đột merge |
| R2  | WT-5 dùng `components/ui/auto-grow-textarea.tsx` (đã tồn tại), **không phụ thuộc WT-3**             | File đã có sẵn trong codebase; WT-3 chỉ tạo thêm `Field` wrapper                                            |
| R3  | Lý do merge WT-1 sau WT-6 cập nhật: WT-6 đã thay evidences source, WT-1 chỉ import                  | Phù hợp thứ tự tích hợp hiện tại, không cần đổi                                                             |
| R4  | `dossier-result-modal.tsx` xác nhận thuộc WT-1 (đã cover bởi `mindmap/**`)                          | Plan mục 7 đã liệt kê; ma trận sở hữu wildcard đã bao gồm — không cần thay đổi                              |
| R5  | `TECHDEBT.md #16` cập nhật: `evidence-data.ts` đã xóa, fallback tĩnh không còn                      | Bước 0 working tree đã xóa file; trạng thái cũ trong TECHDEBT lỗi thời                                      |
