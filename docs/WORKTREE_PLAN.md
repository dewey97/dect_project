# Worktree Plan v4 (2026-10-24)

> Bản duy nhất còn hiệu lực. Thay v1–v3. Số liệu file:dòng khảo sát trên `main` tại `3a476f4`.
> **Số dòng sẽ trôi** khi Phần A hoặc bước trước đã sửa file → trước mỗi bước, chạy lại lệnh grep ở cột "Vấn đề"/"Hardcode" để định vị, không sửa mù theo số dòng.
> Người làm: đọc mục 1 → phần được giao → brief ở mục 8. Báo cáo theo mẫu mục 9.
> Quy ước chung: `AGENTS.md` (global + dự án), `docs/HANDOFF_ROADMAP.md` mục 2–3.
>
> Cấu trúc: **Phần A** dọn nhanh trực tiếp trên `main` (không tách worktree) → **3 worktree**: WT-1 board, WT-5 evidence, WT-3 studio.

---

## Tiến độ thực thi (cập nhật 2026-10-25)

| Phần | Nhánh / worktree                         | Commit                                   | Trạng thái                                                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | `main`                                   | `16cb60c`                                | ✅ A1–A7, A9 xong (xóa `/api/phone`, icon → `public/images/phone/icons/`, fallback apps theo slug, `scripts/ops/backfill-character-avatars.mjs`). ⛔ **A8 chưa làm**: production chưa có cột `case_characters.avatar_url` và policy admin `avatars` (kiểm 2026-10-25). A10 chưa xác nhận. |
| WT-1 | `wt/board-dynamic` (`../dect_wt_board`)  | `04527de` 1A, `218836f` 1B, `7946aad` 1C | 🟡 3/8 bước. Còn 1D–1H. Migration 39 viết xong, chưa chạy (đúng quy trình).                                                                                                                                                                                                               |
| WT-5 | `wt/evidence-ux` (`../dect_wt_evidence`) | chưa có                                  | 🟡 8 file sửa **chưa commit**: đang làm ý 1 (metadata) + ý 3 (dossier tray, `use-case-dossiers`). Còn sót: `page.tsx:272-273`, `integrity-indicator.tsx`, `device-simulator-client.tsx`; chưa có `isDossierUnlocked`; chưa có E2E.                                                        |
| WT-3 | `wt/studio-ux` (`../dect_wt_studio`)     | chưa có                                  | 🟡 18 file sửa **chưa commit**: ý 1–3 gần xong (`components/ui/field.tsx`, 0 `Field` cục bộ, xóa `auto-expanding-textarea`, select `subjectKey` có option giữ key lạ, bỏ `ID: {slug}`), `e2e/studio-ux.spec.ts` đã viết. Chưa xác nhận E2E/tsc.                                           |

**Lệch khỏi plan cần xử lý:**

1. **WT-1 giữ id cũ làm tương thích:** `pin-builder.ts` sinh `legacyId: "c0-pin-*"` (195–367, 501, 548, 675); `render-scene.ts` vẫn 25+ nhánh `pin.id === "c0-pin-*"` / `includes("khang")` (271–573); fallback `"Nguyễn Văn Khang"` (`pin-builder.ts:189, 322`); `hasVu/TungFollowup` (470–471, 635–636). Chấp nhận tạm trong lúc 1D–1G; **bước 1H phải xóa hết** — điều kiện done WT-1 bổ sung: `grep -rE 'c0-pin-|"khang"|Nguyễn Văn Khang|hasVuFollowup' components/investigation` = 0.
2. **WT-5, WT-3 chưa commit theo bước** như brief → yêu cầu commit ngay phần đã xong trước khi làm tiếp (tránh mất việc, dễ review).
3. **WT-3 sửa `checkpoint-editor.tsx` + `checkpoint-studio-client.tsx`** (chỉ thêm prop `characters`/`checkpoints`, +32/−7). Vùng khác với tab "Bảng điều tra" của WT-1 → rủi ro conflict thấp; vẫn merge WT-3 sau WT-1.

**Việc chủ dự án đang chặn:**

- Chạy migration 38 (A8) — WT-1 bước 1B/1D cần `avatar_url` để hiển thị ảnh thật; script A9 cần cột này.
- Push `main` (đang ahead `origin/main` 3 commit: `3a476f4`, `5cb1c69`, `16cb60c`) khi muốn deploy Phần A.

---

## 0. Trạng thái thật sau khảo sát

| Track cũ (v3)  | Trạng thái thật | Bằng chứng                                                                                                                                                                            |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WT-2 phone     | ~90%            | Đã có `savePhoneMessagesBatch` (`lib/actions/phone-actions.ts:337`), `model_id` + preset (`lib/phone/devices.ts`), `ResizeObserver` (`device-chassis.tsx:88`); `messages_text` đã hết |
| WT-4 character | ~85%            | Đã có `uploadCharacterAvatar` (`lib/actions/character-actions.ts:128`), migration 38 có policy admin, avatar trong `phone-app.tsx:457-662` và `suspect-evaluation-modal.tsx:41`       |
| WT-6 cms       | ~95%            | `usePhoneData("evidences")` = 0 chỗ; tab `evidences` có (`phone-data/[tab]/route.ts:18`); `/api/phone` đã trả 410; pins ghi Supabase (`admin/pins/route.ts:98`)                       |
| WT-7 ops       | Code 100%       | HSTS (`deploy/caddy/Caddyfile:22`), che log (`:68`), `X-Real-IP` (`:79`), timer 03:00 (`deploy/systemd/docker-reclaim.timer:6`), cổng `127.0.0.1:3000`                                |
| WT-1 board     | ~5%             | 89 chỗ hardcode / 9 file; chưa có migration 39; chưa có `checkpoint-studio/board/`                                                                                                    |
| WT-5 evidence  | ~25%            | 53 chỗ metadata rác / 8 file; chip phase cứng `dossier-tray.tsx:205-209`                                                                                                              |
| WT-3 studio    | 0%              | 7 bản `Field` cục bộ trùng lặp; 2 component textarea tự giãn trùng chức năng                                                                                                          |

Phần còn lại của WT-2/4/6/7 nhỏ → gom vào **Phần A**. Đánh số WT-1/3/5 giữ nguyên để khớp lịch sử commit.

---

## 1. Quy tắc chung

### 1.1. Tạo worktree

```bash
git worktree add ../dect_wt_<ten> -b wt/<ten> main
cd ../dect_wt_<ten>
pnpm install
cp ../dect_project/.env .env
```

- Chỉ **pnpm**. Cổng riêng: WT-1 `3111`, WT-5 `3115`, WT-3 `3113` (`PORT=311x pnpm dev`; E2E: `E2E_PORT=311x pnpm test:e2e` — `playwright.config.ts:3` đọc `E2E_PORT || PORT`, mặc định `3101`).
- E2E admin: `e2e/auth.setup.ts` đăng nhập bằng `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` trong `.env`, lưu `e2e/.auth/admin.json`. Thiếu biến → spec admin tự skip; ghi rõ trong báo cáo.
- Không `git push`. Commit theo từng bước con (mỗi bước một commit, E2E xanh).
- Không chạy migration production. Viết SQL, chủ dự án duyệt.
- `import type` cho type (AGENTS.md §12). Không `next/font/google` (§11). Không `autoFocus`/`.focus()` khi mở modal (§3).
- Không thêm mock/fallback nội dung vụ án (§6). Thiếu dữ liệu → trạng thái rỗng, không dùng tên/ảnh case_000.
- Không đụng `archive_3d_vault/`, `landing-hero.tsx` (§8, §9).
- Asset mới trong `public/` phải đăng ký `docs/cases/case_000/02_photos/ASSET_CATALOG.md` (§5).

### 1.2. Ma trận sở hữu file

| Nhóm file                                                                                                                                                                                                                                                                                                                                                     | Chủ                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `components/investigation/mindmap/**` (trừ `suspect/**`), `components/investigation/hero-interactive/**`, `components/investigation/hero-interactive.tsx`, `components/admin/checkpoint-studio/board/**` (mới), `lib/guides/**`, `db/schema/39_board_nodes.sql`, `lib/actions/board-actions.ts`                                                               | WT-1                                                                           |
| `components/admin/checkpoint-studio/checkpoint-editor.tsx`, `checkpoint-studio-client.tsx`                                                                                                                                                                                                                                                                    | WT-1 chỉ thêm tab/route "Bảng điều tra"; WT-3 sửa phần form. WT-1 merge trước. |
| `components/investigation/evidence/**`, `app/(investigation)/evidence/**`, `components/admin/evidence-studio/**`, `components/investigation/viewers/**`, `components/investigation/device-simulator-client.tsx`, `components/investigation/pdf-viewer-modal.tsx`, `lib/hooks/use-case-evidence.ts`, `lib/hooks/use-case-dossiers.ts`, `lib/types/evidence.ts` | WT-5                                                                           |
| `components/admin/checkpoint-studio/sections/**`, `dossier-config-modal.tsx`, `dossier-editor.tsx`, `auto-expanding-textarea.tsx`, `components/admin/dossier-studio/**`, `app/(admin)/studio/{cases,settings,players,feedbacks}/**`, `components/ui/field.tsx` (mới)                                                                                          | WT-3                                                                           |
| `CHANGELOG.md`, `docs/HANDOFF_ROADMAP.md`, `docs/TECHDEBT.md`, `docs/WORKTREE_PLAN.md`, `lib/types/database.ts` (chỉ thêm cuối file)                                                                                                                                                                                                                          | Integrator                                                                     |

### 1.3. Điều kiện done mỗi worktree

1. `npx tsc --noEmit --incremental false` sạch (chạy 1 lần cuối).
2. `pnpm test:e2e` pass toàn bộ, gồm spec mới.
3. Case_000 chơi trọn luồng (desktop 1440×900 + mobile 375×812), ảnh chụp trước/sau.
4. Báo cáo bàn giao: commit, file đổi, migration cần chạy, rủi ro.

---

## 2. Phần A — Dọn nhanh trên `main` (~0.5 ngày, không worktree)

Làm **trước** khi tách worktree để 3 worktree cùng base.

| #   | Việc                                                                                                                                                                                                                                                                                                                                                                                                        | File:dòng                                                                                                       | Người làm                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| A1  | Chạy `pnpm test:e2e` toàn bộ trên `main`, ghi baseline (số pass/skip/fail) vào báo cáo. Fail có sẵn → ghi lại, không sửa trong Phần A trừ khi do A2–A6 gây ra.                                                                                                                                                                                                                                              | `e2e/*.spec.ts` (10 spec)                                                                                       | Dev                      |
| A2  | Xóa route `/api/phone` (đã 410, không còn consumer runtime). `no-sheets.spec.ts`: bỏ URL `/api/phone?...` khỏi danh sách (dòng 8), giữ kiểm tra "không request `/api/phone?`" (dòng 70).                                                                                                                                                                                                                    | `app/api/phone/route.ts`; `e2e/no-sheets.spec.ts:8`, `:70`                                                      | Dev                      |
| A3  | Icon app hệ thống dùng chung: `git mv public/images/cases/case_000/phone/icons public/images/phone/icons`; cập nhật mọi tham chiếu (`grep -rn "case_000/phone/icons" app components lib data` → 30 chỗ); đăng ký ASSET_CATALOG.                                                                                                                                                                             | `components/phone-engine/system/home-screen.tsx:20-36`, `app/api/phone-data/apps/route.ts:9-…`                  | Dev                      |
| A4  | `/api/phone-data/apps` fallback: vụ chưa cấu hình trả danh sách app hệ thống (settings/phone/messages/contacts/safari/photos/camera/notes), `case_slug` = slug đang hỏi, **không** `"case_000"`.                                                                                                                                                                                                            | `app/api/phone-data/apps/route.ts:9-16`                                                                         | Dev                      |
| A5  | Bỏ ảnh selfie case_000 làm mặc định: thiếu `selfieUrl` thì không hiện easter egg (không render khối 238–248).                                                                                                                                                                                                                                                                                               | `components/phone-engine/apps/camera-app.tsx:244`                                                               | Dev                      |
| A6  | `usePhoneApps` bỏ default `"case_000"` (tham số bắt buộc); sửa caller nếu `tsc` báo thiếu.                                                                                                                                                                                                                                                                                                                  | `lib/hooks/use-phone-apps.ts:18`                                                                                | Dev                      |
| A7  | Thêm `data/_review/` vào `.gitignore` (file dump review).                                                                                                                                                                                                                                                                                                                                                   | `.gitignore`                                                                                                    | Dev                      |
| A8  | **Chạy migration 38** production; kiểm `case_characters.avatar_url` tồn tại và policy bucket `avatars` chỉ admin ghi.                                                                                                                                                                                                                                                                                       | `db/schema/38_character_avatar.sql`                                                                             | Chủ dự án                |
| A9  | Backfill avatar một lần: đọc `case_evidence` có `code` dạng `avatar_<x>` (không phân biệt hoa thường) → khớp `case_characters` cùng `case_slug` theo `key = <x>`, nếu không có thì theo `aliases` chứa `<x>` → sinh `UPDATE case_characters SET avatar_url = <file_url> WHERE case_slug = … AND key = … AND avatar_url IS NULL;`. Ghi `.tmp/backfill_avatars.sql` + in danh sách không khớp. Không tự chạy. | `scripts/ops/backfill-character-avatars.mjs` (mới; mẫu đọc dữ liệu: `scripts/ops/gen-full-seed-from-sheet.mjs`) | Dev viết, chủ dự án chạy |
| A10 | Checklist VPS: deploy Caddy + timer theo `deploy/INFRA_HANDOFF_CHECKLIST.md`; đặt `SUPABASE_SERVICE_ROLE_KEY`; bật Leaked Password Protection; xoay key `.env` + `git rm --cached .env`.                                                                                                                                                                                                                    | `deploy/**`                                                                                                     | Chủ dự án                |

Commit: `chore: phase A cleanup before worktree split` (A2–A7, A9). Sau đó tách 3 worktree từ commit này.

---

## 3. WT-1 — `wt/board-dynamic` (Bảng điều tra dữ liệu hóa) — 3–4 ngày

**Mục tiêu:** mọi node trên bảng đến từ dữ liệu; không còn id `c0-pin-*`, key `vu/tung/ha/khang`, mã `cp-000-*`, tên nhân vật hay ảnh `case_000` trong code. Chế độ admin (kéo thả, tạo node, nối dây) chuyển vào Checkpoint Studio; bảng gameplay chỉ đọc.

### 3.1. Hiện trạng (file:dòng)

| File                                          | Dòng                                    | Hardcode                                                                                                        |
| --------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `mindmap/canvas/pin-builder.ts` (656 dòng)    | 15, 26, 37                              | `DESKTOP_SUSPECT_SLOTS`, `MOBILE_SUSPECT_SLOTS`, `DYNAMIC_PHOTO_SLOTS` tọa độ cứng                              |
|                                               | 215–247                                 | `c0-pin-followup-vu/tung/ha` + câu mô tả tên nhân vật                                                           |
|                                               | 323–324, 575–576                        | `hasVuFollowup`/`hasTungFollowup` → `activeFollowupSet.add("vu"/"tung")`                                        |
|                                               | 334                                     | fallback `"Nguyễn Văn Khang"`                                                                                   |
|                                               | 361–477                                 | 5 pin nền cứng (`c0-pin-phone`, `-victim-phone`, `-reinvestigate`, `-suspects`, `-indictment`) × desktop/mobile |
|                                               | 526–540                                 | avatar qua `sheetPhotoMap[avatar_*]` thay vì `character.avatarUrl`                                              |
|                                               | 592–602, 633–652                        | connection `c0-conn-*`; suy key từ id (`id.includes("vu")`, mặc định `"vu"`); `cp-${key}-followup`              |
| `mindmap/main-investigation-canvas.tsx` (888) | 147–192, 635–639                        | map `vu/tung → cp-000-1a/1b/1c`, `cp-000-0`, `cp-000-2b`; `last_viewed_suspect`                                 |
|                                               | 227, 245, 296, 418, 779–780             | nhận nạn nhân theo `"khang"`; fallback `"Nguyễn Văn Khang"`                                                     |
|                                               | 276–281                                 | map avatar theo `rawCode === "vu"/"tung"`                                                                       |
|                                               | 463–488                                 | `hasVu/TungFollowup`, `isShowAllPinsPreview`                                                                    |
|                                               | 673–741                                 | click handler so id chữ `c0-pin-*`                                                                              |
|                                               | 754–765                                 | `c === "vu" ? "21:15"`                                                                                          |
| `mindmap/admin-create-pin-modal.tsx` (1174)   | 35, 61, 99, 115                         | `PRESET_CASE_PHOTOS`, `PRESET_STICKY_TEMPLATES`, `PRESET_DOSSIER_TEMPLATES`, `PRESET_SHEET_CHECKPOINTS`         |
|                                               | 83, 89, 171, 269–304, 335, 353, 675–679 | default `vu/tung`, `cp-000-0/1a/1b/1c/2a/2b`, dò `khang`                                                        |
| `mindmap/add-suspect-modal.tsx`               | 46, 593–595, 623–624, 653, 699–708, 746 | union `"vu"\|"tung"\|"ha"`, chặn `khang`, `isAdmin000 → "vu"`, `isVu/isTung`                                    |
| `mindmap/indictment-modal.tsx`                | 21, 54–61, 209                          | union + `norm.includes("vu"/"lequangvu")`, fallback `["Trần Thị Hà","ha"]`                                      |
| `mindmap/followup-question-modal.tsx`         | 135–149, 396, 453                       | `vu→time`, `tung→choice`; tên cứng 3 nghi phạm                                                                  |
| `mindmap/culprit-epilogue-modal.tsx`          | 13–19, 78–79, 108–112                   | union, `isVu/isTung`, tên cứng                                                                                  |
| `mindmap/dossier-result-modal.tsx`            | 34, 117–125                             | tên + toàn văn Hồ sơ A/B/C                                                                                      |
| `mindmap/phone-lookup-modal.tsx`              | 66, 72                                  | `validAnswers` cứng Vũ/Tùng                                                                                     |
| `mindmap/canvas/canvas-modals.tsx`            | 178, 198, 232–234, 245–258              | fallback `suspects[0]?.id \|\| "vu"`, `"tung"`                                                                  |
| `mindmap/interactive-walkthrough.tsx`         | 107–111                                 | `targetPinId === 'c0-pin-*'` + dò `khang`                                                                       |
| `mindmap/custom-pin-modal.tsx`                | 390                                     | placeholder "Lê Quang Vũ"                                                                                       |
| `hero-interactive/render-scene.ts` (1281)     | 270–397                                 | phân loại vẽ theo `pin.id === "c0-pin-*"` + `includes("khang")`                                                 |
|                                               | 498–526, 538–623                        | ảnh note `/images/cases/case_000/clue_notes/*` theo id pin                                                      |
| `hero-interactive/utils.ts`                   | 132–150                                 | như trên                                                                                                        |
| `hero-interactive/use-live-pin-photos.ts`     | 33, 92–96                               | default `"case_000"`; map avatar theo tên `khang/vu/tung/ha`                                                    |
| `mindmap/canvas/use-board-layout.ts`          | 36–48, 155–185, 480                     | state admin (`isAdmin`, `isEditMode`, undo/redo, localStorage `admin_custom_pins_*`)                            |
| `mindmap/canvas/canvas-toolbar.tsx`           | 145–171, 218, 313                       | nút "Bật chế độ di chuyển & setup node" trong gameplay                                                          |
| `mindmap/canvas/use-investigation-state.ts`   | 83, 399–420                             | `isShowAllPinsPreview` + cờ admin                                                                               |

### 3.2. Thiết kế

**Migration 39 — `db/schema/39_board_nodes.sql`** (chủ dự án duyệt):

```sql
ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS board_config JSONB NOT NULL DEFAULT '{}'::jsonb;
-- board_config: { pin_title, icon, photo_url, note_style, position:{desktop:{x,y},mobile:{x,y}},
--                 connections:[node_id], hidden, locked_until_checkpoint }

CREATE TABLE IF NOT EXISTS public.case_board_nodes (
  id            TEXT PRIMARY KEY,
  case_slug     TEXT NOT NULL REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  node_kind     TEXT NOT NULL CHECK (node_kind IN
                  ('victim','victim_phone','reinvestigate','suspects_hub','evidence_hub',
                   'note','photo','dossier','custom')),
  title         TEXT,
  subject_key   TEXT,
  checkpoint_id TEXT REFERENCES public.case_checkpoints(id) ON DELETE CASCADE,
  slot_index    INT NOT NULL DEFAULT 0,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- icon, photo_url, note_style, position, connections
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS: SELECT public; INSERT/UPDATE/DELETE (SELECT private.is_admin())
-- Backfill case_000: victim, victim_phone, reinvestigate, suspects_hub, evidence_hub
--   với position lấy đúng tọa độ hiện tại ở pin-builder.ts:361-477 (không đổi bố cục).
-- Backfill board_config.position cho checkpoint phone_lookup / followup / indictment
--   từ tọa độ hiện tại.
```

- Node checkpoint (`phone_lookup`, `suspect_interrogation`, `followup`, `indictment`) **không** nhân bản vào `case_board_nodes`; dựng trực tiếp từ `case_checkpoints` + `board_config`.
- `boardgame_pins` giữ vai trò vị trí kéo tay. Thứ tự vị trí: `boardgame_pins` → `board_config.position` / `case_board_nodes.config.position` → layout tự tính.
- Kiểu `DbCaseBoardNode`, `BoardConfig` thêm cuối `lib/types/database.ts` trong block `// WT-1`.

**Model runtime:** thêm `nodeKind` + `subjectKey` + `checkpointId` (optional) vào `PinPoint` (`components/investigation/hero-interactive/types.ts:30`). Mọi nhánh renderer/click dựa trên `nodeKind`, không so `pin.id`.

**Điểm tựa có sẵn (đã xác minh):**

- `HeroInteractive` đã có prop `isEditMode` (`hero-interactive.tsx:57`) + con trỏ kéo (`:506`) → Board Studio dùng lại renderer, không viết canvas mới.
- Playtest: `launchPlaytestFromCheckpoint({...})` (`lib/checkpoints/case-playtest.ts:40`), `getPrerequisiteCheckpoints` (`:10`).
- Nhân vật: client dùng `useCaseCharacters()` / `useOptionalCaseCharacters()` (`components/investigation/case-characters-context.tsx`); server dùng `getCharactersByCase` (`lib/actions/character-actions.ts:42`).
- `boardgame_pins` đã có FK `case_slug` → `cases.slug` (migration 29).

**Id node mới:** `${caseSlug}:${nodeKind}:${subjectKey|checkpointId|uuid}` — ổn định, không chứa `c0`. Giữ alias id cũ cho case_000 trong `boardgame_pins` qua script migrate vị trí (cùng migration 39: `UPDATE boardgame_pins SET id = …` theo bảng map 5 id nền).

**Ảnh note:** chuyển `clue_notes/*` (render-scene.ts:498–623) thành asset dùng chung `public/images/board/notes/*`; chọn theo `node_kind` + `config.note_style`. Ảnh riêng vụ đặt qua `config.photo_url`.

**Avatar:** `pin-builder` lấy `character.avatarUrl` từ `CaseCharactersProvider`; bỏ `sheetPhotoMap[avatar_*]` và map tên trong `use-live-pin-photos.ts:92-96`. Thiếu ảnh → `/images/avatar_placeholder.svg`.

### 3.3. Bước làm (mỗi bước 1 commit)

| Bước | Việc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1A   | Migration 39 + types + `lib/actions/board-actions.ts` CRUD `case_board_nodes`/`board_config` (guard `requireAdminAuth`). Route đọc `/api/board-nodes?case=` (public, `force-dynamic`).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1B   | `pin-builder.ts` viết lại phần dựng node: input = `{characters, checkpoints, boardNodes, evidence, positions}`; bỏ 3 mảng slot + 5 pin nền; layout tự tính xác định (lưới theo `slot_index`) khi thiếu `position`. Thêm `nodeKind`.                                                                                                                                                                                                                                                                                                                                                                      |
| 1C   | `render-scene.ts`, `utils.ts`: phân loại theo `nodeKind`; ảnh note theo `note_style`. `use-live-pin-photos.ts`: bỏ default case_000 + map tên.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1D   | `main-investigation-canvas.tsx`: click handler `switch (pin.nodeKind)`; bỏ map `cp-000-*`, `last_viewed_suspect` lưu `subjectKey`; nạn nhân lấy `role === "victim"`; bỏ `hasVu/TungFollowup` (dùng tập `subjectKey` có followup).                                                                                                                                                                                                                                                                                                                                                                        |
| 1E   | Modal: `add-suspect` (union → `string`, chặn theo `role === "victim"`, bỏ `isAdmin000`, `isVu/isTung`); `indictment` (dropdown `useCaseCharacters()` role suspect, so `key`); `followup-question` (chỉ `inputType`, tên từ provider); `culprit-epilogue` (bỏ `isVu/isTung`, tên từ provider); `phone-lookup` (`validAnswers` từ `answer_config.text_match_inputs`); `canvas-modals` (bỏ fallback `"vu"/"tung"`); `dossier-result` (nội dung từ `case_dossiers` / `checkpoint.narrative`); `custom-pin-modal:390` placeholder trung tính.                                                                 |
| 1F   | `interactive-walkthrough.tsx`: bước walkthrough chỉ định `targetNodeKind`; tìm pin theo `nodeKind`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1G   | **Board Studio:** `components/admin/checkpoint-studio/board/` — `board-editor.tsx` (dùng lại `HeroInteractive` renderer + overlay sửa), `board-node-form.tsx`, `use-board-editor.ts` (chuyển logic undo/redo, kéo thả, nối dây từ `use-board-layout.ts`). Tab "Bảng điều tra" trong `checkpoint-editor.tsx` (route `/studio/checkpoints?case=<slug>&view=board`). Nút "Chơi thử" gọi `launchPlaytestFromCheckpoint` (`lib/checkpoints/case-playtest.ts:40`). Trang Studio đã được `app/(admin)/layout.tsx` chặn bằng `requireAdminAuth`. Lưu vào `case_board_nodes` / `board_config` / `boardgame_pins`. |
| 1H   | **Gameplay chỉ đọc:** xóa nút edit (`canvas-toolbar.tsx:145-171,218,313`), nhánh admin trong `use-board-layout.ts` (36–48, 155–185, 480), `isShowAllPinsPreview` admin trong `use-investigation-state.ts`; xóa `admin-create-pin-modal.tsx` (logic đã sang 1G, bỏ 4 mảng PRESET).                                                                                                                                                                                                                                                                                                                        |

### 3.4. E2E

- `e2e/board-dynamic.spec.ts` (người chơi):
  - Số node render (`[data-pin-id]`) = số node dữ liệu từ `/api/board-nodes` + checkpoint có `board_config`.
  - Click node `victim_phone`, `suspects_hub`, `reinvestigate`, `phone_lookup`, `indictment` → mở đúng modal.
  - Không tồn tại nút "Bật chế độ di chuyển" trên `/evidence/web`.
  - Grep runtime: không request ảnh `/images/cases/case_000/clue_notes/`.
- `e2e/board-studio.spec.ts` (admin, skip khi thiếu `E2E_ADMIN_*`):
  - Mở tab "Bảng điều tra" → kéo node → Lưu → mở gameplay thấy vị trí mới.
  - Tạo node `note` → xuất hiện ở gameplay; xóa node → biến mất.
  - "Chơi thử" mở `/evidence/web?case_id=<slug>`.
- `e2e/board-new-case.spec.ts`: vụ test slug `e2e_board_test` có 1 victim + 2 suspect + 1 checkpoint `indictment`. Seed trong `beforeAll` bằng `@supabase/supabase-js` với `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` từ `.env` (insert `cases`, `case_characters`, `case_checkpoints`); `afterAll` xóa dòng `cases` (FK cascade dọn phần còn lại — kiểm cascade trước, thiếu thì xóa từng bảng). Skip khi thiếu service role key. Kiểm: bảng hiển thị đủ node, không có chữ "Khang/Vũ/Tùng/Hà", không request ảnh `case_000`.
- `e2e/case-000.spec.ts` 9 kịch bản cũ pass (locator dùng `[data-pin-id]` mới — cập nhật selector, không đổi kịch bản).

### 3.5. Rủi ro

- Đổi id pin làm mất vị trí kéo tay đã lưu → migration 39 phải map id cũ → mới trong `boardgame_pins`.
- `render-scene.ts` 1281 dòng: chỉ đổi điều kiện phân loại + nguồn ảnh, không tái cấu trúc vẽ.
- Tiến trình người chơi lưu `last_viewed_suspect` = `"vu"` vẫn hợp lệ vì `subjectKey` case_000 chính là `vu/tung/ha`.

---

## 4. WT-5 — `wt/evidence-ux` (Bỏ metadata rác, xem theo bộ hồ sơ) — 1–2 ngày

### 4.1. Hiện trạng (file:dòng)

| File                                                                   | Dòng                                  | Vấn đề                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `components/admin/evidence-studio/evidence-form.tsx` (536)             | 60–70, 92–95                          | state `evidenceId`, `recoveredBy`, `chainOfCustody`, `integrityStatus` + default giả             |
|                                                                        | 175–178                               | ghi 4 field vào payload `metadata`                                                               |
|                                                                        | 478–533                               | 4 ô nhập "Mã vật chứng pháp lý", "Thời điểm ghi nhận", "Người thu thập", "Trạng thái niêm phong" |
| `components/admin/evidence-studio/evidence-preview.tsx`                | 40–44, 204–241                        | fallback giả + hiển thị "Thời điểm / người / chain / integrity / REF"                            |
| `components/admin/evidence-studio/evidence-studio-client.tsx`          | 123–125                               | default `recoveredBy/chainOfCustody/integrityStatus` khi tạo mới                                 |
| `app/(investigation)/evidence/web/page.tsx` (870)                      | 269–275                               | gán cứng `evidenceId/recoveredBy/integrityStatus/chainOfCustody`                                 |
|                                                                        | 177, 249 (`getPhaseForCode`), 349–397 | suy phase theo mã + `unlockedDossiers.includes("phase_N")`                                       |
| `lib/hooks/use-case-evidence.ts`                                       | 4 chỗ                                 | map 4 field metadata                                                                             |
| `lib/types/evidence.ts`                                                | 21, 52–55                             | type `evidenceId`, `recoveredBy`, `integrityStatus`, `chainOfCustody`                            |
| `components/investigation/viewers/integrity-indicator.tsx`             | toàn file                             | component hiển thị 4 field                                                                       |
| `components/investigation/device-simulator-client.tsx`                 | 11, 142–146                           | dùng `IntegrityIndicator` với chuỗi cứng                                                         |
| `components/investigation/pdf-viewer-modal.tsx`                        | 40, 100                               | dùng `evidenceId` làm id ảnh                                                                     |
| `components/investigation/evidence/dossier-tray.tsx` (470)             | 205–209                               | chip cứng "Tất cả / Khởi đầu / Bộ A / Bộ B / Bộ C"                                               |
| `lib/hooks/use-case-dossiers.ts`                                       | 66–127                                | có `codeMap` nhưng không trả `{key,title}` cho UI                                                |
| `components/investigation/evidence/evidence-detail-inspector.tsx` (68) | —                                     | chưa có breadcrumb bộ hồ sơ                                                                      |

### 4.2. Thiết kế

1. **Bỏ 4 field metadata khỏi UI + payload** (D3: giữ cột `metadata` DB, không migration):
   - `evidence-form.tsx`: xóa state 60–70/92–95, payload 175–178, khối input 478–533.
   - `evidence-preview.tsx`: xóa 40–44, khối 204–241; hiển thị tiêu đề + mô tả + bộ hồ sơ.
   - `evidence-studio-client.tsx:123-125`: xóa default.
   - `page.tsx:269-275`: xóa gán cứng.
   - `lib/types/evidence.ts:52-55`: xóa field; `evidenceId` (21) thay bằng `code`.
   - Xóa `integrity-indicator.tsx`; `device-simulator-client.tsx:142-146` bỏ khối; `pdf-viewer-modal.tsx:40,100` dùng `code`.
   - `app/(investigation)/evidence/[id]/page.tsx:25` `evidenceId` → `code`.
2. **`code` tự sinh:** slug từ tiêu đề (`stripVietnameseDiacritics` trong `lib/text.ts`) khi tạo mới; ô `code` vào khối "Nâng cao" thu gọn. Bỏ hiển thị `#code`, `P{phase}`, `S{slot}` trong danh sách studio.
3. **Nhóm theo bộ hồ sơ:**
   - `use-case-dossiers.ts`: trả thêm `dossierOf(code) → {key, title, slotIndex} | null` và `dossiers` đã sắp theo `slot_index`.
   - `dossier-tray.tsx:205-209`: chip sinh từ `dossiers` (`Tất cả` + mỗi bộ theo `title` + `Vật chứng` + `Chưa gán bộ`); khóa chip theo `isDossierUnlocked(key)` thay vì `isPhaseUnlocked(phase)` (prop `dossier-tray.tsx:27`).
   - `isDossierUnlocked(key)` **chưa tồn tại** — viết mới trong `page.tsx` cạnh `isPhaseUnlocked` (`page.tsx:502`). Nguồn mở khóa hiện trộn 2 dạng khóa: `ban_dau` / `bo_a` / `ket_luan` (`lib/checkpoints/case-playtest.ts:56,84`) và `phase_2/3/4` (`page.tsx:388-397`). Quy ước mới: so `case_dossiers.key`; giữ bảng chuyển `phase_N` → dossier có `slot_index = N` cho tiến trình cũ.
   - `page.tsx`: item mang `dossierKey/dossierTitle`; bỏ `getPhaseForCode` khi dossier khai báo `document_codes`; giữ `phase` chỉ làm khóa sắp xếp.
   - `evidence-detail-inspector.tsx`: breadcrumb "Bộ hồ sơ: <title>"; PDF thuộc dossier → `DiegeticDossierSheet`; ảnh giữ `EvidencePhotoAnnotator`, bỏ badge `VẬT CHỨNG [evidenceId]`.
4. **Form gọn:** placeholder ≤ 40 ký tự; `description` dùng `components/ui/auto-grow-textarea.tsx` (có sẵn).

### 4.3. E2E

- `e2e/evidence-dossier-grouping.spec.ts`:
  - Mở khay hồ sơ case_000 → chip khớp danh sách `case_dossiers.title` (đọc từ API trong test, không hardcode tên).
  - Bộ chưa mở khóa → chip khóa; sau khi set tiến trình mở bộ → chip mở.
  - Click tài liệu thuộc bộ → inspector hiện breadcrumb đúng `title`.
  - Không còn text "Người thu thập", "niêm phong", "VERIFIED" trên `/evidence/web`.
- `e2e/evidence-studio.spec.ts` (sửa): form không còn 4 ô metadata; tạo evidence mới không nhập `code` → `code` tự sinh, lưu được.

### 4.4. Rủi ro

- Tiến trình người chơi lưu `unlockedDossiers` dạng `phase_N` → giữ hàm chuyển `phase_N` ↔ dossier `slot_index` cho dữ liệu cũ.
- `device-simulator-client.tsx` **đang được dùng**: `components/investigation/evidence/phone-modal.tsx:49` link tới `/evidence/victim-phone` → route `evidence/[id]`. Chỉ xóa khối `IntegrityIndicator` (142–146), giữ trang; kiểm thử mở `/evidence/victim-phone` sau khi sửa.

---

## 5. WT-3 — `wt/studio-ux` (Dọn UI/UX Studio) — 1–2 ngày

### 5.1. Hiện trạng (file:dòng)

| File                                                      | Dòng              | Vấn đề                                       |
| --------------------------------------------------------- | ----------------- | -------------------------------------------- |
| `checkpoint-studio/sections/checkpoint-ai-check-form.tsx` | 11                | `Field` cục bộ                               |
| `sections/checkpoint-identity-form.tsx`                   | 28                | `Field` cục bộ                               |
|                                                           | 120–121           | `subjectKey` nhập tay (`<Input>`)            |
| `sections/evidence-picker-config-form.tsx`                | 178               | `Field` cục bộ                               |
| `sections/followup-config-form.tsx`                       | 113               | `Field` cục bộ                               |
|                                                           | 103–104           | `followupOf` nhập tay                        |
| `sections/indictment-config-form.tsx`                     | 66                | `Field` cục bộ                               |
| `sections/simple-answer-config-form.tsx`                  | 14                | `Field` cục bộ                               |
| `sections/suspect-interrogation-config-form.tsx`          | 257               | `Field` cục bộ                               |
|                                                           | 136, 186, 236     | placeholder mô tả dài                        |
| `checkpoint-studio/dossier-config-modal.tsx`              | 281               | placeholder dài                              |
| `checkpoint-studio/auto-expanding-textarea.tsx`           | toàn file         | trùng `components/ui/auto-grow-textarea.tsx` |
| `app/(admin)/studio/cases/cases-client.tsx`               | 94                | hiển thị `ID: {slug}`                        |
| `app/(admin)/studio/settings/settings-client.tsx`         | 129               | placeholder dài                              |
| `dossier-studio/dossier-studio-sidebar.tsx`               | rà bằng lệnh dưới | helper text quy trình dài, "Khóa kỹ thuật"   |

Lệnh rà placeholder/helper dài còn sót (chạy ở đầu WT-3, liệt kê kết quả vào báo cáo):

```bash
grep -rnoE 'placeholder=\{?["`][^"`]{41,}' components/admin/checkpoint-studio components/admin/dossier-studio "app/(admin)/studio"
grep -rnE '<p[^>]*text-(xs|\[1[01]px\])[^>]*>[^<]{80,}' components/admin/checkpoint-studio components/admin/dossier-studio
```

### 5.2. Thiết kế

1. **`components/ui/field.tsx`** (mới): `Field({ label, hint?, required?, children })` — label 12px, hint ≤ 1 dòng, không mô tả quy trình. Thay 7 bản `Field` cục bộ.
2. **Textarea duy nhất:** giữ `components/ui/auto-grow-textarea.tsx` (mặc định `rows={1}`); thay mọi import `auto-expanding-textarea` (9 file liệt kê ở 5.1 + `dossier-editor.tsx`), rồi xóa file trùng. Không sửa `mindmap/suspect/interrogation-clue-step.tsx` (thuộc gameplay).
3. **Trường kỹ thuật → picker:**
   - `subjectKey` → `<select>` nhân vật cùng vụ (server action `getCharactersByCase` — `lib/actions/character-actions.ts:42`; gọi một lần ở `checkpoint-studio-client.tsx`, truyền xuống form qua prop), hiển thị tên, value = `key`.
   - `followupOf` → `<select>` checkpoint `kind === "suspect_interrogation"` cùng vụ.
   - Mã chứng cứ → giữ `code-chip-input.tsx` (đã là picker).
   - `id`, `slot_index`, `phase`, `tag_code`: ẩn khỏi form chính, tự sinh; nếu buộc phải sửa → khối `<details>` "Nâng cao" mặc định đóng.
4. **Placeholder:** ≤ 40 ký tự, dạng ví dụ ngắn ("VD: A-12"). Hướng dẫn dài → bỏ (đã có ở `docs/core_specs/19_checkpoint_studio.md`).
5. **Cases:** bỏ `ID: {slug}` (94); search slug vẫn hoạt động.
6. **Dossier Studio:** ẩn "Khóa kỹ thuật"; giữ `tag_code` hiển thị nhỏ vì dùng liên kết chứng cứ.

### 5.3. E2E

- `e2e/studio-ux.spec.ts` (admin, skip khi thiếu credential):
  - Mở `/studio/checkpoints`, `/studio/dossiers`, `/studio/cases`, `/studio/settings`.
  - Không có placeholder dài hơn 60 ký tự (`page.$$eval('[placeholder]', …)`).
  - Không có label hiển thị `slot_index`, `subjectKey`, `followupOf`, `ID:`.
  - Ô mô tả: nhập 5 dòng → `clientHeight` tăng.
  - Đổi `subjectKey` qua select → lưu → reload giữ giá trị.

### 5.4. Rủi ro

- `checkpoint-editor.tsx` WT-1 thêm tab → WT-3 rebase sau WT-1, chỉ chạm `sections/**`.
- Select `subjectKey` cần nhân vật đã tạo trước; checkpoint cũ có key không khớp nhân vật → hiển thị option "⚠ <key> (không tìm thấy)" để không mất dữ liệu.

---

## 6. Thứ tự tích hợp

| Bước | Việc                                                                                                                    | Ghi chú                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 0    | Phần A trên `main` + commit                                                                                             | Base chung                                                |
| 1    | Tách WT-1, WT-5, WT-3 song song                                                                                         | Ma trận 1.2 không chồng file                              |
| 2    | Merge WT-5                                                                                                              | Nhỏ, độc lập                                              |
| 3    | Merge WT-1                                                                                                              | Cần migration 39 chạy production trước khi deploy         |
| 4    | Rebase + merge WT-3                                                                                                     | Sau WT-1 vì cùng chạm `checkpoint-editor.tsx` (khác vùng) |
| 5    | Integrator: `tsc`, E2E, `NEXT_DIST_DIR=.next_dev npx next build`, cập nhật CHANGELOG / ROADMAP / TECHDEBT / docs/README | Điều kiện done                                            |

---

## 7. Quyết định đã chốt

| #   | Quyết định                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `case_board_nodes` thu hẹp: node checkpoint lưu `case_checkpoints.board_config`; bảng chỉ giữ node hệ thống + ghim tự do. Editor bảng chuyển vào Checkpoint Studio. |
| D2  | 7 preset iPhone (đã xong).                                                                                                                                          |
| D3  | Metadata evidence: bỏ UI/payload, giữ cột DB.                                                                                                                       |
| D4  | `/api/phone`: xóa ở Phần A (đã 410, không còn consumer).                                                                                                            |
| D6  | Gom phần còn lại WT-2/4/6/7 vào Phần A trên `main`; chỉ tách 3 worktree.                                                                                            |

### Câu hỏi mở (mặc định áp dụng nếu chủ dự án không phản đối trước khi WT-1 bắt đầu)

1. Ảnh note bảng (`clue_notes/*`) chuyển thành asset dùng chung `public/images/board/notes/` (`git mv`, giữ tên file). **Mặc định: làm.**
2. Đổi id pin sang dạng `${caseSlug}:${nodeKind}:…` → `[data-pin-id]` đổi giá trị; E2E sửa selector sang `[data-node-kind="…"]` (thêm attribute này vào danh sách nút ghim ẩn). **Mặc định: làm.**

---

## 8. Brief giao việc (dán nguyên văn cho người làm)

Mỗi brief là một phiên làm việc độc lập. Người làm không cần lịch sử hội thoại; chỉ cần repo + file này.

### 8.1. Brief Phần A

> Repo `dect_project` (Next.js 16, Supabase, pnpm). Đọc `AGENTS.md` (gốc + `D:\code_world\AGENTS.md`), `docs/HANDOFF_ROADMAP.md` mục 2–3, `docs/WORKTREE_PLAN.md` mục 1 và 2.
> Làm A1–A7, A9 trên nhánh `main`. Không làm A8, A10 (chủ dự án). Không chạy migration, không push.
> Mỗi việc định vị lại bằng grep (số dòng có thể trôi). Không sửa ngoài phạm vi bảng mục 2.
> Kết thúc: `npx tsc --noEmit --incremental false` sạch, `pnpm test:e2e` không fail mới so với baseline A1, một commit `chore: phase A cleanup before worktree split`. Báo cáo theo mục 9.

### 8.2. Brief WT-1

> Repo `dect_project`. Đọc `AGENTS.md` (gốc + global), `docs/HANDOFF_ROADMAP.md` mục 2–3, `docs/WORKTREE_PLAN.md` mục 1, 3, 7.
> Tạo worktree `wt/board-dynamic` từ commit Phần A (mục 1.1), cổng 3111.
> Làm tuần tự bước 1A → 1H (mục 3.3), mỗi bước một commit, E2E `case-000.spec.ts` xanh sau mỗi bước. Viết `db/schema/39_board_nodes.sql` nhưng **không chạy**; test local bằng Supabase branch hoặc dừng lại hỏi chủ dự án trước khi bước 1B cần dữ liệu thật.
> Chỉ sửa file thuộc WT-1 trong ma trận 1.2. Không viết lại toàn bộ `render-scene.ts`; chỉ đổi điều kiện phân loại và nguồn ảnh.
> Done: mục 1.3 + 3 spec ở mục 3.4. Báo cáo theo mục 9, kèm thứ tự chạy migration 39 và script map id `boardgame_pins`.

### 8.3. Brief WT-5

> Repo `dect_project`. Đọc `AGENTS.md`, `docs/HANDOFF_ROADMAP.md` mục 2–3, `docs/WORKTREE_PLAN.md` mục 1, 4.
> Tạo worktree `wt/evidence-ux` từ commit Phần A, cổng 3115.
> Commit 1: bỏ 4 field metadata (mục 4.2 ý 1). Commit 2: `code` tự sinh (ý 2). Commit 3: nhóm theo bộ hồ sơ + `isDossierUnlocked` (ý 3). Commit 4: form gọn + E2E (ý 4, mục 4.3).
> Không migration, không xóa cột `metadata` DB. Chỉ sửa file thuộc WT-5.
> Done: mục 1.3; mở thử `/evidence/web?case_id=case_000` và `/evidence/victim-phone`. Báo cáo theo mục 9.

### 8.4. Brief WT-3

> Repo `dect_project`. Đọc `AGENTS.md`, `docs/HANDOFF_ROADMAP.md` mục 2–3, `docs/WORKTREE_PLAN.md` mục 1, 5.
> Tạo worktree `wt/studio-ux` từ commit Phần A, cổng 3113. Nếu WT-1 đã merge trước khi xong, rebase lên `main`.
> Commit 1: `components/ui/field.tsx` + thay 7 `Field` cục bộ. Commit 2: gộp textarea. Commit 3: picker `subjectKey` / `followupOf` + khối "Nâng cao". Commit 4: placeholder/helper + `cases-client.tsx:94` + E2E.
> Không đổi hành vi lưu dữ liệu; chỉ đổi cách nhập. Không chạm `checkpoint-studio/board/**` và vùng tab trong `checkpoint-editor.tsx`.
> Done: mục 1.3 + spec mục 5.3. Báo cáo theo mục 9.

---

## 9. Mẫu báo cáo bàn giao

```md
## Báo cáo <Phần A | WT-x> — <ngày>

**Nhánh / commit:** <branch> — <hash1> <msg>, <hash2> <msg>, …
**Base:** <hash commit Phần A>

### Kiểm tra

| Lệnh | Kết quả |
| `npx tsc --noEmit --incremental false` | sạch / N lỗi |
| `E2E_PORT=311x pnpm test:e2e` | X pass / Y skip / Z fail (liệt kê fail + lý do) |
| Thủ công desktop 1440×900 / mobile 375×812 | ảnh trước/sau: <đường dẫn> |

### File đã đổi

<git diff --stat base..HEAD>

### Migration / việc chủ dự án cần làm

- <file SQL, thứ tự chạy, script phụ>

### Lệch khỏi plan

- <mục nào làm khác plan, lý do>

### Còn lại / rủi ro

- <…>
```
