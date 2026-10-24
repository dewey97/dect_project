# Worktree Plan v3 — Trạng thái sau base commits (2026-10-24)

> Bản duy nhất còn hiệu lực (v1, v2 đã gỡ). Base work cho 7 track đã commit lên `main` (`a8d23de`, `aeca38c`→`9687ff5`).
> Quy ước chung giữ nguyên: `AGENTS.md` (global + dự án), `docs/HANDOFF_ROADMAP.md` mục 2–3.
>
> Tài liệu liên quan: `docs/TECHDEBT.md`, `docs/HANDOFF_ROADMAP.md`, `docs/core_specs/13_architecture_hardening_and_roadmap.md`, `docs/core_specs/20_phone_studio.md`.

---

## 0. Trạng thái xuất phát (sau push `9687ff5`)

- **main** đã push toàn bộ. Working tree sạch (chỉ `data/_review/sheet-data-dump.json` untracked).
- Migration production: **21–37** đã chạy. Migration **38** (character avatar) đã có file SQL, **chưa chạy production**.
- Data production (case_000): 54 evidence, 39 contacts, 89 messages, 21 calls, 2 notes, 4 safari, 6 bank.
- Typecheck: sạch (0 lỗi). E2E: chưa chạy lại sau batch commit.
- **Không có worktree nào đang active.**

### Base commits đã có trên main

| Commit    | Track  | Nội dung chính                                                         |
| --------- | ------ | ---------------------------------------------------------------------- |
| `aeca38c` | WT-5   | Xóa `evidence-data.ts`, wire dossier/inspector/page sang Supabase      |
| `104d855` | WT-2   | `device-chassis.tsx`, messages-editor, phone-devices e2e, `lib/phone/` |
| `ad6ab5f` | WT-4   | Migration 38 SQL, character-studio avatar, suspect-evaluation-modal    |
| `0e1d52f` | WT-1   | Mindmap modals consume Supabase evidence                               |
| `b34e021` | WT-6   | Phone apps đọc Supabase, hooks updated, no-sheets e2e                  |
| `9687ff5` | Shared | `database.ts`, `.env.example`, docs, `next-env.d.ts`                   |
| `a8d23de` | WT-7   | Port binding `127.0.0.1`, caddy edge proxy, docker reclaim timer       |

---

## 1. Quy tắc chung

### 1.1. Tạo worktree

```bash
git worktree add ../dect_wt_<ten> -b wt/<ten> main
cd ../dect_wt_<ten>
pnpm install
cp ../dect_project/.env .env
```

- Chỉ dùng **pnpm**.
- Cổng dev/E2E riêng: WT-1 `3111`, WT-2 `3112`, WT-3 `3113`, WT-4 `3114`, WT-5 `3115`, WT-6 `3116`, WT-7 `3117` (`PORT=311x pnpm dev`, `PORT=311x pnpm test:e2e`).
- Không `git push`. Commit khi xong trọn một đơn vị việc.
- Không chạy migration production. Viết SQL, chủ dự án duyệt.
- `import type` cho mọi type (AGENTS.md §12). Không `next/font/google` (§11). Không `autoFocus`/`.focus()` khi mở modal (§3).
- Không thêm mock/fallback nội dung vụ án (§6). Fallback chỉ là trạng thái rỗng/đang tải.
- Không đụng `components/investigation/archive_3d_vault/`, `landing-hero.tsx` (§8, §9).

### 1.2. File dùng chung

| File                                                                                   | Quy tắc                                                                     |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `lib/types/database.ts`                                                                | Chỉ **thêm** interface/field ở cuối file trong block `// WT-x`.             |
| `components/ui/*`                                                                      | WT-3 tạo primitive mới; worktree khác chỉ import.                           |
| `components/admin/admin-sidebar.tsx`                                                   | Không worktree nào sửa; integrator thêm menu.                               |
| `CHANGELOG.md`, `docs/HANDOFF_ROADMAP.md`, `docs/TECHDEBT.md`, `docs/WORKTREE_PLAN.md` | Không worktree nào sửa; integrator cập nhật sau merge.                      |
| `db/schema/*.sql`                                                                      | Số migration được cấp: WT-4 → `38` (đã có), WT-1 → `39`. WT khác không tạo. |
| `e2e/*`                                                                                | Mỗi worktree tạo spec riêng; không sửa spec của worktree khác.              |
| `package.json`, `pnpm-lock.yaml`                                                       | Không thêm dependency khi chưa duyệt.                                       |

### 1.3. Ma trận sở hữu file

| Nhóm file                                                                                                                                                                                                                                                                                             | Chủ sở hữu |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `components/investigation/mindmap/**` (trừ `suspect/suspect-evaluation-modal.tsx`), `components/admin/checkpoint-studio/board/**` (mới), tab "Bảng điều tra" trong `checkpoint-editor.tsx`                                                                                                            | WT-1       |
| `components/phone-engine/**` (trừ `apps/{notes,safari,banking,photos,phone}-app.tsx`), `components/admin/phone-studio/**`, `lib/phone/**`, `lib/types/phone.ts`, `lib/actions/phone-actions.ts`                                                                                                       | WT-2       |
| `components/admin/checkpoint-studio/**` (trừ phần WT-1), `components/admin/dossier-studio/**`, `app/(admin)/studio/{cases,settings,players,feedbacks}/**`, `components/ui/field.tsx`                                                                                                                  | WT-3       |
| `components/admin/character-studio/**`, `lib/actions/character-actions.ts`, `lib/cases/{characters,case-characters}.ts`, `app/api/characters/route.ts`, `case-characters-context.tsx`, `suspect/suspect-evaluation-modal.tsx`, `apps/phone-app.tsx`                                                   | WT-4       |
| `components/admin/evidence-studio/**`, `components/investigation/evidence/**` (trừ `reinvestigation-modal.tsx`), `app/(investigation)/evidence/**` (trừ dòng import evidences), `lib/hooks/use-case-evidence.ts`, `lib/hooks/use-case-dossiers.ts`, `lib/actions/evidence-actions.ts`                 | WT-5       |
| `app/api/phone/**`, `app/api/phone-data/**`, `app/api/admin/pins/route.ts`, `lib/hooks/use-phone-data.ts`, `lib/hooks/use-case-checkpoints.ts`, `lib/google/**`, `apps/{notes,safari,banking,photos}-app.tsx`, `hero-interactive/use-live-pin-photos.ts`, `reinvestigation-modal.tsx`, `.env.example` | WT-6       |
| `docker-compose.yml`, `deploy/**`, `scripts/ops/vps-*`, `docs/core_specs/06_cicd_deployment_guide.md`                                                                                                                                                                                                 | WT-7       |

> **R1:** Việc thay `usePhoneData("evidences")` → `useCaseEvidence` trên 7 consumer (`main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal`, `admin-create-pin-modal`, `reinvestigation-modal`, `evidence/web/page.tsx`, `use-case-checkpoints`) thuộc **WT-6**, chỉ chạm dòng import + lời gọi hook. Logic nghiệp vụ trong `mindmap/**` vẫn thuộc WT-1.

### 1.4. Điều kiện done

1. `npx tsc --noEmit --incremental false` sạch.
2. `pnpm test:e2e` pass.
3. Case_000 chơi được (desktop 1440×900 + mobile 375×812).
4. Báo cáo bàn giao.

---

## 2. WT-1 — `wt/board-dynamic` (Bảng điều tra dữ liệu hóa)

**Đã có trên main:** mindmap modals (`add-suspect`, `admin-create-pin`, `followup-question`, `main-investigation-canvas`, `pin-builder`) đã update import Supabase evidence.

**Còn lại (scope chính):**

1. **Migration 39 — `39_board_nodes.sql`:**
   - `ALTER TABLE case_checkpoints ADD COLUMN board_config JSONB DEFAULT '{}'`
   - Bảng `case_board_nodes` cho node hệ thống + ghim tự do
   - Backfill case_000 node không gắn checkpoint
   - RLS: đọc public, ghi admin
2. **Pin-builder data-driven:** bỏ `DESKTOP_SUSPECT_SLOTS`, `MOBILE_SUSPECT_SLOTS`, `DYNAMIC_PHOTO_SLOTS`, 5 pin nền cứng `c0-pin-*`. Node dẫn xuất từ `case_checkpoints` + `case_characters` + `case_board_nodes`.
3. **Chuyển board editor sang Checkpoint Studio:**
   - Tab "Bảng điều tra" trong `/studio/checkpoints`
   - Di chuyển `admin-create-pin-modal` logic + admin mode khỏi gameplay canvas
   - Nút "Chơi thử" gọi `case-playtest.ts`
4. **Bảng gameplay chỉ đọc:** bỏ toggle admin, nút tạo/kéo node trong `MainInvestigationCanvas`.
5. **Bỏ hardcode tên/key:** `findFollowupCulprit` mặc định `vu/tung/ha`, `detectCheckpointForPin`, tên "Khang"/"Vũ"/"Tùng"/"Hà" → lấy từ `CaseCharactersProvider`.
6. **Modal cleanup:** `indictment-modal` dropdown nhân vật, `culprit-epilogue-modal` bỏ gating, `dossier-result-modal` đọc từ checkpoint, `phone-lookup-modal` đọc config.
7. **Walkthrough:** target pin id từ DB.
8. **E2E:** `board-dynamic.spec.ts`, `board-studio.spec.ts`.

**Phụ thuộc:** merge sau WT-6 (evidences source) và WT-4 (avatar).

---

## 3. WT-2 — `wt/phone-devices` (Nhiều dòng iPhone + editor tin nhắn)

**Đã có trên main:** `device-chassis.tsx` abstraction, chassis refactor, `messages-editor.tsx`, `lib/phone/devices.ts` preset table, e2e specs.

**Còn lại:**

1. **Multi-device hoàn thiện:** `phone-simulator.tsx` đọc `model_id` từ `case_characters.device` JSONB → chọn preset → render chassis đúng. Bỏ hardcode wallpaper case_000. Scale với `ResizeObserver`.
2. **MessagesApp flat row:** đọc `phone_messages` row phẳng (group `thread_key`, sort `slot_index`), chuẩn hóa role `sent|received`. Bỏ parse `messages_json`/`messages_text`.
3. **Batch save:** `savePhoneMessagesBatch(caseSlug, threadKey, messages[])` trong `phone-actions.ts`. Upsert theo id, delete thiếu, `slot_index` đánh lại tuần tự.
4. **MessagesEditor batch:** dán khối text, sửa/xóa nhiều tin, tạo thread không kèm tin mồi.
5. **E2E verify:** dán 5 dòng → lưu → Messages simulator đúng 5 tin.

**Không phụ thuộc** worktree khác.

---

## 4. WT-3 — `wt/studio-ux` (Dọn UI/UX Studio)

**Chưa có gì trên main.**

**Scope đầy đủ:**

1. `components/ui/field.tsx`: `Field({label, hint?, children})` + `AutoGrowTextarea` mặc định `rows=1`.
2. **Ẩn khỏi UI:** `key`/`slug`, `tag_code`, `id` nội bộ, `slot_index`, `phase` → tự sinh ngầm. `followupOf` → select checkpoint. `subject_key` → select nhân vật. Mã chứng cứ → picker.
3. **Trường kỹ thuật** buộc phải còn: đặt trong "Nâng cao" thu gọn.
4. **Xóa placeholder/helper dài:** danh sách cụ thể trong checkpoint-identity-form, suspect-interrogation-config, phone-lookup-config, followup-config, indictment-config, dossier-config, dossier-studio-sidebar.
5. Dossier: ẩn "Khóa kỹ thuật", textarea auto-grow.
6. Cases: bỏ hiển thị `ID: {slug}`.
7. Settings/Players/Feedbacks: rà placeholder.
8. **E2E:** `studio-ux.spec.ts`.

**Merge cuối cùng** (sau tất cả track khác).

---

## 5. WT-4 — `wt/character-assets` (Gắn ảnh nhân vật)

**Đã có trên main:** migration 38 SQL file, character-studio client cập nhật, case-characters-context, suspect-evaluation-modal, character-actions, API route, e2e spec.

**Còn lại:**

1. **Chạy migration 38 production** (chủ dự án duyệt).
2. **Siết policy bucket `avatars`:** đọc public, ghi/xóa chỉ `private.is_admin()`.
3. **Upload flow:** `uploadCharacterAvatar(caseSlug, key, file)` → bucket `avatars` path `cases/{slug}/characters/{key}.{ext}`, lưu `avatar_url`/`avatar_asset_path`.
4. **Characters Studio UI:** preview ảnh + nút tải/xóa thay ô "Mã ảnh".
5. **Render avatar:**
   - `pin-builder` dùng `avatarUrl` (contract đã có).
   - `suspect-evaluation-modal` hiển thị avatar.
   - `phone-app` danh bạ: khớp alias/phone → `avatar_url`.
6. **Backfill script** (ops, một lần): đọc `case_evidence` code `avatar_*` → UPDATE.

**Không phụ thuộc** worktree khác. Merge sớm nhất.

---

## 6. WT-5 — `wt/evidence-ux` (Preview theo bộ hồ sơ, bỏ metadata rác)

**Đã có trên main:** xóa `evidence-data.ts`, `use-case-evidence.ts` chỉ map DB, `selectedView` nullable, e2e spec auth guard.

**Còn lại:**

1. **Bỏ metadata rác khỏi UI:** `timestamp`, `recoveredBy`, `integrityStatus`, `chainOfCustody` trong evidence-form, evidence-preview. Bỏ fallback tương ứng trong hook. `code` tự sinh, ẩn trong "Nâng cao".
2. **Preview theo bộ hồ sơ:**
   - `dossier-tray.tsx` nhóm tài liệu theo `case_dossiers` thay chip phase cứng.
   - `use-case-dossiers.ts` bổ sung map `code → dossier{key,title}`.
   - Inspector breadcrumb "Bộ hồ sơ: <tên>" + preview PDF `DiegeticDossierSheet`.
3. **Form gọn:** placeholder ngắn, `description` dùng `AutoGrowTextarea` (đã có sẵn).
4. **E2E:** `evidence-dossier-grouping.spec.ts`.

**Merge sau WT-1** (tránh đổi cấu trúc item cùng lúc).

---

## 7. WT-6 — `wt/cms-cutover` (Cắt Google Sheets khỏi runtime)

**Đã có trên main:** 4 phone apps (notes/safari/banking/photos) đọc Supabase, `use-phone-data` + `use-case-checkpoints` + `use-live-pin-photos` updated, admin pins route updated, `phone-data/[tab]` route updated, `no-sheets.spec.ts`.

**Còn lại:**

1. **Tab `evidences` cho API:** thêm `evidences` vào `phone-data/[tab]/route.ts` → map `case_evidence`. Giữ alias `code/photo_code`, `label/title` cho `PhotosApp` và modal không vỡ.
2. **Thay `usePhoneData("evidences")` → `useCaseEvidence`** trên 7 consumer: `main-investigation-canvas`, `add-suspect-modal`, `followup-question-modal`, `admin-create-pin-modal`, `reinvestigation-modal`, `evidence/web/page.tsx`, `use-case-checkpoints`.
3. **Bỏ nhánh fallback Sheets** trong `usePhoneData`: lỗi/rỗng → trạng thái lỗi + nút thử lại.
4. **Admin pins:** bỏ ghi Sheet `evidences!A:I` → ghi Supabase.
5. **Xóa/deprecate `/api/phone`:** trả 410 hoặc xóa sau grep sạch consumer.
6. **Gỡ `lib/google/auth.ts` khỏi runtime:** chuyển vào `scripts/ops/lib`.
7. **`.env.example`:** đánh dấu `GOOGLE_*` chỉ dùng script.
8. **E2E verify:** `no-sheets.spec.ts` chặn request tới `sheets.googleapis.com`.

**Không phụ thuộc** worktree khác. Merge trước WT-1.

---

## 8. WT-7 — `wt/ops-hardening` (Hạ tầng)

**Đã có trên main (`a8d23de`):** port binding `127.0.0.1:3000:3000`, caddy edge proxy config, docker reclaim timer.

**Còn lại:**

1. HSTS `max-age=31536000` trên Caddy.
2. Access-log redaction query string.
3. Chuyển tiếp `X-Real-IP` đúng chuỗi.
4. Systemd timer mẫu 03:00 cho `vps-docker-reclaim.sh`.
5. Checklist thủ công: Leaked Password Protection, xác nhận `SUPABASE_SERVICE_ROLE_KEY`, xoay key `.env` + `git rm --cached .env`.

**Không đụng code app.** Merge bất kỳ lúc nào.

---

## 9. Thứ tự tích hợp (cập nhật)

| Bước | Việc                    | Lý do                                           |
| ---- | ----------------------- | ----------------------------------------------- |
| 1    | WT-4 (character assets) | Cung cấp `avatar_url` cho pin/modal             |
| 2    | WT-2 (phone devices)    | Độc lập                                         |
| 3    | WT-6 (cms cutover)      | Sau WT-2 tránh trùng `messages-app`/`phone-app` |
| 4    | WT-7 (ops)              | Không xung đột                                  |
| 5    | WT-1 (board dynamic)    | Phụ thuộc WT-4 (avatar), WT-6 (evidences)       |
| 6    | WT-5 (evidence ux)      | Sau WT-1 tránh đổi item cấu trúc                |
| 7    | WT-3 (studio ux)        | Cuối, áp primitive lên bản đã merge             |
| 8    | Integrator verify       | `tsc`, `e2e`, build, docs                       |

**Song song đợt 1:** WT-4 + WT-2 + WT-6 + WT-7 (4 track).
**Song song đợt 2:** WT-1 + WT-5 (sau merge đợt 1).
**Cuối:** WT-3.

---

## 10. Quyết định đã chốt

| #   | Quyết định                                             | Kết quả                                               |
| --- | ------------------------------------------------------ | ----------------------------------------------------- |
| D1  | Tạo `case_board_nodes` (migration 39)                  | **Có**, thu hẹp: node checkpoint trong `board_config` |
| D2  | Danh sách model iPhone                                 | **7 preset** (SE → 15 Pro Max)                        |
| D3  | Xóa metadata khỏi DB hay chỉ ẩn UI?                    | **Chỉ bỏ UI/payload**, giữ cột `metadata`             |
| D4  | Xóa `/api/phone` sau cutover?                          | Giữ route, xóa sau grep sạch consumer                 |
| D5  | Đợt song song 1                                        | WT-4, WT-2, WT-6, WT-7                                |
| R1  | `usePhoneData("evidences")` → `useCaseEvidence` 7 file | Toàn bộ sang WT-6                                     |

---

## 11. Tóm tắt tiến độ

| WT   | Base trên main | Còn lại chính                                        | Ước lượng |
| ---- | -------------- | ---------------------------------------------------- | --------- |
| WT-1 | 30%            | Migration 39, pin-builder data-driven, board studio  | 3–4 ngày  |
| WT-2 | 40%            | Multi-device E2E, MessagesApp flat row, batch save   | 1–2 ngày  |
| WT-3 | 0%             | Toàn bộ: Field, ẩn trường, bỏ placeholder            | 1–2 ngày  |
| WT-4 | 50%            | Chạy migration 38, upload flow, render avatar        | 1–2 ngày  |
| WT-5 | 40%            | Bỏ metadata UI, preview theo bộ hồ sơ                | 1–2 ngày  |
| WT-6 | 50%            | Tab evidences API, bỏ Sheets fallback, gỡ google lib | 1–2 ngày  |
| WT-7 | 70%            | HSTS, log redaction, systemd timer                   | 0.5 ngày  |
