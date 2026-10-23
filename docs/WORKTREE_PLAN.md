# Worktree Plan — Chạy song song phần việc còn lại

> Mục tiêu: chia việc còn lại thành 5 worktree độc lập, mỗi worktree một nhánh, một model.
> Xong thì merge lần lượt về `main`. Mỗi worktree chỉ sửa file trong **vùng sở hữu** của nó.
>
> Đọc trước: `AGENTS.md` (global + dự án), `docs/HANDOFF_ROADMAP.md` mục 2–3, `docs/PHONE_STUDIO_PLAN.md` mục "Tiến độ".

---

## 0. Tổng quan

| WT   | Nhánh             | Nội dung                                                     | Ước lượng | Migration    |
| ---- | ----------------- | ------------------------------------------------------------ | --------- | ------------ |
| WT-1 | `wt/phone-finish` | Phone Studio phần cuối: E2E auth, P28, P29, fallback app     | 1–2 ngày  | —            |
| WT-2 | `wt/evidence-db`  | Hệ thống chứng cứ per-case: M1, M2, M3, M10, M12             | 5–7 ngày  | 35           |
| WT-3 | `wt/narrative-ai` | Bỏ hardcode dẫn truyện, AI criteria, file case_000: M4 M5 M8 | 4–5 ngày  | 36 (nếu cần) |
| WT-4 | `wt/pin-photos`   | M9 ảnh ghim đọc Supabase + giảm `any` trong hero-interactive | 1–2 ngày  | —            |
| WT-5 | `wt/any-batch-2`  | D7 đợt 2: giảm `any` ở admin studio, API, lib                | 1–2 ngày  | —            |

Bỏ khỏi plan (YAGNI): **M11** nền bảng điều tra per-case. `board-stage` đã cho người chơi chọn nền cork chung, không phải dữ liệu vụ án.

Thứ tự merge đề xuất: **WT-5 → WT-1 → WT-4 → WT-2 → WT-3**, sau đó bước tích hợp (mục 7).
Lý do: WT-5 chỉ đổi type, rủi ro thấp nhất. WT-3 sửa nhiều file gameplay nhất, merge cuối để rebase một lần.

---

## 1. Quy tắc chung cho mọi worktree

### 1.1. Tạo worktree

```bash
git worktree add ../dect_wt1 -b wt/phone-finish main
```

Thay `wt1`/nhánh theo bảng trên. Trong worktree:

```bash
pnpm install
```

- Chỉ dùng **pnpm**. Không chạy `npm install`.
- Copy `.env` từ thư mục gốc sang worktree (`cp ../.env .env`). Không commit file env.
- Mỗi worktree chạy dev server/E2E trên **cổng riêng**: WT-1 `3101`, WT-2 `3102`, WT-3 `3103`, WT-4 `3104`, WT-5 `3105` (`PORT=310x pnpm dev`, `PORT=310x pnpm test:e2e`).

### 1.2. Vùng sở hữu

- Chỉ sửa file trong cột "Sở hữu" của worktree mình.
- Cần sửa file ngoài vùng: **không sửa**, ghi vào mục "Việc tích hợp" trong báo cáo bàn giao.
- File dùng chung có quy tắc riêng:

| File                                                          | Quy tắc                                                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `lib/types/database.ts`                                       | Chỉ **thêm** interface mới ở **cuối file**, trong block có comment `// WT-x`. Không sửa interface cũ. |
| `components/admin/admin-sidebar.tsx`                          | Chỉ WT-2 được thêm 1 mục menu.                                                                        |
| `CHANGELOG.md`, `docs/HANDOFF_ROADMAP.md`, `docs/TECHDEBT.md` | **Không worktree nào sửa.** Người tích hợp cập nhật sau merge.                                        |
| `db/schema/*.sql`                                             | Chỉ dùng số migration đã cấp ở bảng mục 0.                                                            |
| `e2e/*`                                                       | Mỗi worktree tạo file spec riêng. Chỉ WT-1 sửa `playwright.config.ts`.                                |

### 1.3. Ràng buộc dự án (nhắc lại)

- Không `git push`. Commit một lần khi xong trọn task (Conventional Commits).
- Không chạy migration lên production. Viết SQL, chủ dự án duyệt.
- `import type` cho mọi interface/type (AGENTS.md §12).
- Không `autoFocus` / `.focus()` khi mở modal (AGENTS.md §3).
- Không `next/font/google` (AGENTS.md §11).
- Không thêm mock/fallback nội dung vụ án tĩnh (AGENTS.md §6). Fallback chỉ được là trạng thái rỗng/đang tải.
- Không đụng `components/investigation/archive_3d_vault/` và `landing-hero.tsx` (AGENTS.md §8, §9).

### 1.4. Điều kiện "done" của một worktree

1. `npx tsc --noEmit --incremental false` sạch (chạy 1 lần ở cuối).
2. `pnpm test:e2e` pass toàn bộ, gồm spec mới của worktree.
3. Case_000 chơi được như trước (không regression).
4. Báo cáo bàn giao gồm: danh sách file đã sửa, migration cần chạy, việc tích hợp còn lại.

---

## 2. WT-1 — `wt/phone-finish`

**Sở hữu:** `e2e/**`, `playwright.config.ts`, `app/api/phone-data/**`, `components/phone-engine/**`, `lib/hooks/use-phone-data.ts`, `lib/hooks/use-phone-apps.ts`, `components/admin/phone-studio/**`, `docs/core_specs/20_phone_studio.md`, `.env.example`.

| #   | Việc                                                                                                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Thêm Playwright project `setup`: đăng nhập `/login` bằng `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`, lưu `storageState` vào `e2e/.auth/admin.json` (gitignore). Spec admin dùng storageState này. Thêm 2 biến vào `.env.example`. Thiếu biến thì `test.skip` spec admin, không fail. |
| 1.2 | Sửa `e2e/phone-studio.spec.ts` dùng storageState admin.                                                                                                                                                                                                                            |
| 1.3 | P28: spec `e2e/phone-runtime.spec.ts` — mở phone case_000, kiểm tra home screen đủ 15 app, mở Tin nhắn thấy ít nhất 1 thread.                                                                                                                                                      |
| 1.4 | P29: spec tạo case tạm qua `duplicateCase` hoặc Studio, thêm 1 app, phone render app đó. Dọn dữ liệu sau test. Nếu cần DB đã migrate 30–34 thì `test.skip` khi bảng chưa có.                                                                                                       |
| 1.5 | `app/api/phone-data/apps/route.ts`: bỏ fallback 15 app icon case_000 cho vụ khác case_000. Vụ chưa cấu hình trả `data: []`, `source: "empty"`. Case_000 vẫn giữ fallback tới khi migration 33 chạy.                                                                                |
| 1.6 | Giảm `any` trong `components/phone-engine/**` (12 chỗ: banking 2, notes 3, photos 4, safari 2, phone-context 1) và `lib/hooks/use-phone-data.ts` (1 chỗ). Tổng 13.                                                                                                                 |

---

## 3. WT-2 — `wt/evidence-db`

**Sở hữu:** `components/investigation/evidence/**`, `components/investigation/scene-360-viewer.tsx`, `app/(investigation)/evidence/**`, `app/(investigation)/board-stage/**`, `app/(admin)/studio/evidence/**` (mới), `components/admin/evidence-studio/**` (mới), `lib/actions/evidence-actions.ts` (mới), `lib/hooks/use-case-evidence.ts` (mới), `db/schema/35_*.sql`, `docs/core_specs/21_evidence_studio.md` (mới), 1 mục trong `admin-sidebar.tsx`.

| #   | Việc                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **M3** Migration 35: bảng `case_evidence` (`id`, `case_slug` FK `cases.slug`, `code` unique theo case, `title`, `kind` pdf/image/audio/object, `file_url`, `thumb_url`, `phase`, `description`, `slot_index`, timestamps). RLS: đọc public, ghi `private.is_admin()`. Bucket `evidence-assets` (đọc public, ghi admin). Thêm `cases.panorama_url`, `cases.scene_360_url` (TEXT NULL). Seed case_000 từ `CASE_000_PDFS` + `CASE_000_EVIDENCE`. |
| 2.2 | Server actions CRUD + upload (`requireAdminAuth`), mở rộng `duplicatePhoneData`-style: export `duplicateEvidenceData(from, to)` — **không** sửa `case-actions.ts`, ghi vào việc tích hợp.                                                                                                                                                                                                                                                     |
| 2.3 | **M1** Hook `useCaseEvidence(caseId)` đọc Supabase. `evidence-data.ts` giữ nguyên tên export cũ (`CASE_000_PDFS`, `CASE_000_EVIDENCE`) để file mindmap của WT-3 không vỡ; đánh dấu `@deprecated`. Các trang `evidence/**`, `board-stage` chuyển sang hook.                                                                                                                                                                                    |
| 2.4 | **M2 + M10** Evidence Studio `/studio/evidence`: danh sách chứng cứ theo case, upload PDF/ảnh vào bucket, sửa metadata, sắp xếp. Giao diện theo Phone Studio (form + preview), không kiểu bảng tính.                                                                                                                                                                                                                                          |
| 2.5 | **M12** `reinvestigation-modal.tsx` và `scene-360-viewer.tsx` đọc `cases.panorama_url` / `scene_360_url`; bỏ path cứng `/images/cases/case_000/...`. Thiếu URL thì hiện trạng thái "Chưa có ảnh hiện trường".                                                                                                                                                                                                                                 |
| 2.6 | Spec `e2e/evidence-studio.spec.ts` + kiểm tra bàn chứng cứ case_000 vẫn đủ tài liệu.                                                                                                                                                                                                                                                                                                                                                          |

---

## 4. WT-3 — `wt/narrative-ai`

**Sở hữu:** `components/investigation/mindmap/**`, `components/investigation/hint-modal.tsx`, `components/investigation/epilogue-modal.tsx`, `components/investigation/checkpoints-context.tsx`, `lib/hooks/use-case-narratives.ts`, `lib/ai/**`, `lib/cases/case-000-*.ts`, `lib/checkpoints/server-grader.ts`, `components/admin/checkpoint-studio/sections/**`, `db/schema/36_*.sql`.

| #   | Việc                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | Thống kê 66 chỗ `cp-000-*` trong 11 file mindmap + 31 chỗ ngoài mindmap (hint-modal, epilogue, checkpoints-context, narratives). Phân loại: (a) id checkpoint thật đọc được từ DB, (b) id cố định cho logic chung, (c) dữ liệu chết. Ghi bảng vào báo cáo.                                                                                                                                                |
| 3.2 | **M5** `use-case-narratives.ts`: đọc `case_checkpoints.narrative` theo `kind`/`depends_on`, bỏ map phase → `cp-000-*`. Giữ baseline narrative ngay lập tức (AGENTS.md §6 Zero-Black-Screen).                                                                                                                                                                                                              |
| 3.3 | **M4** `CASE_000_INTERROGATION_CRITERIA` → đọc `case_checkpoints.ai_context` / `ai_valid_cases` / `ai_invalid_cases` của checkpoint `kind` thẩm tra theo `subject_key`. Nếu thiếu cột thì viết migration 36.                                                                                                                                                                                              |
| 3.4 | **M8** Gỡ `lib/cases/case-000-suspects.ts`, `case-000-clues.ts`: chuyển sang `case_characters` + `case_checkpoints`. Xóa file khi không còn import. `server-grader.ts`: bỏ `DEFAULT_CASE_000_PHONE_INPUTS` hardcode, đọc config từ checkpoint `answer_config`.                                                                                                                                            |
| 3.5 | Bỏ `cp-000-*` trong **11 file**: `main-investigation-canvas.tsx` (12), `admin-create-pin-modal.tsx` (22), `custom-pin-modal.tsx` (10), `culprit-epilogue-modal.tsx` (7), `add-suspect-modal.tsx` (6), `phone-lookup-modal.tsx` (3), `indictment-modal.tsx` (2), `phone-narrative-modal.tsx` (1), `followup-choice-form.tsx` (1), `followup-code-form.tsx` (1), `followup-time-form.tsx` (1). Tổng 66 chỗ. |
| 3.6 | **Không** sửa dòng import `CASE_000_EVIDENCE` / `CASE_000_PDFS` trong mindmap (WT-2 đổi nguồn). Ghi vào việc tích hợp. Lưu ý: mindmap hiện **không import** `CASE_000_EVIDENCE`/`CASE_000_PDFS`, chỉ có trong `evidence/**` và `board-stage` (thuộc WT-2).                                                                                                                                                |
| 3.7 | Spec `e2e/case-000.spec.ts` phải pass nguyên vẹn. Thêm spec chơi thử 1 vụ duplicate từ case_000 (slug khác) qua được checkpoint đầu. **Lưu ý:** E2E admin spec cần Playwright auth setup từ WT-1; nếu WT-1 chưa merge, dùng `test.skip` hoặc chỉ test route công khai.                                                                                                                                    |

---

## 5. WT-4 — `wt/pin-photos`

**Sở hữu:** `components/investigation/hero-interactive.tsx`, `components/investigation/hero-interactive/**`.

| #   | Việc                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **M9** `use-live-pin-photos.ts`: đọc ảnh từ `/api/phone-data/photos?caseId=` (Supabase) trước, fallback Sheets như `use-phone-data.ts`. Bỏ phụ thuộc tab Sheets `photos` khi Supabase có dữ liệu. |
| 4.2 | `constants.ts`, `card-composite.ts`: bỏ tham chiếu cứng case_000 nếu có, nhận `caseId` qua props.                                                                                                 |
| 4.3 | Giảm `any` trong `render-scene.ts` (28), `utils.ts` (7). Không đổi hành vi vẽ canvas.                                                                                                             |
| 4.4 | Kiểm tra trực quan bảng điều tra case_000 trước/sau (screenshot so sánh).                                                                                                                         |

---

## 6. WT-5 — `wt/any-batch-2`

**Sở hữu:** `components/admin/checkpoint-studio/*.tsx` (trừ `sections/**`), `components/admin/map-studio/**`, `components/admin/dossier-studio/**`, `app/(admin)/studio/dashboard-client.tsx`, `app/(admin)/studio/players/**`, `app/api/**` (trừ `phone-data/**`), `lib/types/checkpoint-studio.ts`, `lib/cms/**`, `lib/hooks/use-case-checkpoints.ts`, `components/investigation/room-sync-context.tsx`, `components/investigation/feedback-modal.tsx`, `components/auth/user-nav.tsx`, `components/public/waitlist-form.tsx`.

| #   | Việc                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 5.1 | Thay `any` bằng type thật hoặc `unknown` + type guard. Mục tiêu: 0 `any` trong vùng sở hữu. |
| 5.2 | Không đổi hành vi, không đổi API response shape.                                            |
| 5.3 | Ghi số `any` trước/sau vào báo cáo.                                                         |

---

## 7. Bước tích hợp sau merge (người tích hợp)

1. Merge theo thứ tự WT-5 → WT-1 → WT-4 → WT-2 → WT-3. Sau mỗi lần merge chạy `tsc` + `pnpm test:e2e`.
2. Gọi `duplicateEvidenceData` trong `duplicateCase` (`lib/actions/case-actions.ts`).
3. Đổi các import `CASE_000_EVIDENCE` / `CASE_000_PDFS` trong `components/investigation/mindmap/**` và `server-grader.ts` sang `useCaseEvidence` / truy vấn `case_evidence`. Xóa export deprecated.
4. Cập nhật `CHANGELOG.md`, `docs/HANDOFF_ROADMAP.md`, `docs/TECHDEBT.md`, `docs/README.md`.
5. Chủ dự án duyệt và chạy migration 30–36 theo thứ tự, rồi chạy `scripts/ops/migrate-phone-sheets.mjs`.
6. Xóa worktree: `git worktree remove ../dect_wtX`, xóa nhánh `wt/*` đã merge.

---

## 8. Rủi ro

| Rủi ro                                                | Giảm thiểu                                                                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| WT-2 và WT-3 cùng dùng dữ liệu chứng cứ               | WT-2 giữ export cũ; WT-3 không sửa import đó; nối ở bước tích hợp.                                                                           |
| `main-investigation-canvas.tsx` lớn, dễ conflict      | Chỉ WT-3 sở hữu. WT-4 chỉ sửa `HeroInteractive` bên trong, không đổi props.                                                                  |
| Migration chưa chạy làm E2E fail                      | Spec phụ thuộc bảng mới phải `test.skip` khi bảng chưa tồn tại.                                                                              |
| 5 dev server cùng lúc tốn RAM                         | Chỉ bật dev server khi chạy E2E/kiểm tra UI, tắt sau khi xong.                                                                               |
| `.next` cache lẫn giữa worktree                       | Mỗi worktree có `.next` riêng; không symlink.                                                                                                |
| E2E admin cần auth setup từ WT-1                      | WT-2/WT-3/WT-4 dùng `test.skip` cho spec admin nếu WT-1 chưa merge. Hoặc rebase lên main sau khi WT-1 merge.                                 |
| `CASE_000_EVIDENCE` import chỉ nằm ở WT-2             | Xác nhận: mindmap (WT-3) **không** import `CASE_000_EVIDENCE`/`CASE_000_PDFS`. Chỉ `evidence/**` và `board-stage` (WT-2). Không có xung đột. |
| `server-grader.ts` có `DEFAULT_CASE_000_PHONE_INPUTS` | WT-3 sở hữu file này; cần bỏ hardcode fallback, đọc config từ checkpoint `answer_config`.                                                    |

---

## 9. Trạng thái review code (cập nhật 2026-10-24)

### WT-5 (`wt/any-batch-2`) — 41 file modified + 3 new

**Kết quả:** Pass. Không có lỗi logic, chỉ thay đổi type-level.

- Phone engine (6 file): Tạo interface `BankTransaction`, `PhotoItem`, `RichNote`. Raw CMS data dùng `Record<string, unknown>`. `usePhoneData` default generic đổi từ `any` sang `Record<string, unknown>`.
- API routes (10 file): Tất cả `catch (error: any)` → `catch (error: unknown)` + `String()` extraction. `Record<string, unknown>[]` cho data arrays.
- Checkpoint studio (5 file): `answer_config as Record<string, unknown> | null` thay `as any`.
- Map/Dossier studio: Chủ yếu formatting (Prettier) + vài `any` cast loại bỏ.
- Room-sync-context: `PresencePayload[]` thay `any[]`, error handling đúng.
- user-nav: Import `User as SupabaseUser` thay `any`.
- E2E specs: `auth.setup.ts` đúng pattern (graceful skip khi thiếu env). `phone-runtime.spec.ts` (P28) OK. `phone-case-create.spec.ts` (P29) gọi `/api/admin/clean-temp-case` chưa tồn tại — test skip an toàn nhờ migration guard.

**Lưu ý scope violation:** WT-5 đã làm luôn phần WT-1 (phone engine `any` reduction, E2E auth, phone specs, playwright config). WT-1 worktree không cần tạo riêng nữa.

### WT-2 (`wt/evidence-db`) — 8 modified + 10 new

**Kết quả:** Pass. Kiến trúc tốt, auth đúng.

- Migration 35: Schema `case_evidence` clean, RLS đúng (`is_admin()` write, public read), storage bucket policies đầy đủ 4 operation, seed case_000 đủ 8 record.
- `evidence-actions.ts`: 6 server actions, tất cả write op có `requireAdminAuth()`. `uploadEvidenceAsset` sanitize filename, `duplicateEvidenceData` strip id/timestamps.
- `use-case-evidence.ts`: Dual-source — Supabase first, fallback `CASE_000_PDFS`/`CASE_000_EVIDENCE` cho case_000 khi DB rỗng. Cache 30s.
- `evidence-data.ts`: `@deprecated` annotation, export giữ nguyên backward compat.
- Investigation pages: Chuyển từ static import sang `useCaseEvidence(caseId)` hook. `useEffect` deps correct.
- Minor: Error branch có `if/else` redundant (cả 2 set `[]`) — cosmetic.

### WT-3 (`wt/narrative-ai`) — 16 modified + 3 new

**Kết quả:** Pass với lưu ý.

- `cp-000-*` removed: 14/16 modified file đã có 0 ref. Strategy: dynamic lookup qua `subject_key` + `kind` trên `case_checkpoints`.
- **Còn lại:** `admin-create-pin-modal.tsx` (11 ref), `main-investigation-canvas.tsx` (12 ref, KHÔNG modified). Đây là checkpoint routing logic case_000 — cần multi-case engine (spec 14) mới dynamic được. Ngoài scope WT-3.
- Migration 36: Backfill `textMatchInputs`, `motiveContext`, `alibiContext`, `contradictionContext` vào `answer_config`. Server-grader đọc từ DB, bỏ `DEFAULT_CASE_000_PHONE_INPUTS`.
- `case-000-clues.ts`, `case-000-suspects.ts`: Gutted to `@deprecated` stubs. Logic chuyển sang generic `clues.ts`, `characters.ts`.
- `use-case-narratives.ts`: Bỏ `PHASE_TO_CHECKPOINT` map cứng, dùng `resolveCheckpointForPhase` generic (match by dossier key, root checkpoint, subject_key).

### WT-4 (`wt/pin-photos`) — 6 modified

**Kết quả:** Pass. Type-level + data source mở rộng.

- `types.ts`: Thêm `isCustomNode`, `isUser`, `caseId` vào `PinPoint`/`HeroInteractiveProps`.
- `use-live-pin-photos.ts`: Tạo `PinPhotoItem` interface. Data source đổi từ `"evidences"` sang `"photos"` tab (Supabase first). Thêm fallback URL fields (`image_url`, `url`, `photo_url`).
- `render-scene.ts`: Tạo `UnifiedPin` extending `PinPoint`. 28 `(pin as any).xxx` → direct property access.
- Không thay đổi hành vi vẽ canvas.

### Việc cần fix khi worktree tiếp tục

| #   | WT   | File                                     | Vấn đề                                                                                                                                                                                                                                                                                         | Mức độ   |
| --- | ---- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| F1  | WT-5 | `e2e/phone-case-create.spec.ts`          | `finally` block gọi `POST /api/admin/clean-temp-case` chưa tồn tại. Khi migration 30-34 chạy thật, test tạo orphan data không dọn được. Sửa: dọn trực tiếp qua Supabase client `supabase.from('case_phone_apps').delete().eq('case_id', tempCaseSlug)` trong `finally`, hoặc tạo API route đó. | Minor    |
| F2  | WT-2 | `lib/hooks/use-case-evidence.ts:100-105` | Error branch `if (effectiveSlug === "case_000") { setRawEvidence([]) } else { setRawEvidence([]) }` — cả 2 nhánh giống nhau. Gộp thành `setRawEvidence([])` không cần `if/else`.                                                                                                               | Cosmetic |
| F3  | WT-3 | `lib/hooks/use-case-narratives.ts`       | `resolveCheckpointForPhase(checkpoints: any[], ...)` vẫn dùng `any[]`. Đổi sang `Checkpoint[]` hoặc `Record<string, unknown>[]`.                                                                                                                                                               | Cosmetic |
