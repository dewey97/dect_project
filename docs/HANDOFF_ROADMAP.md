# Handoff Roadmap — Multi-case, Security & Tech Debt

> Tài liệu bàn giao cho người làm tiếp. Viết ngày 2026-10-22.
> Đọc kèm: [`AGENTS.md`](../AGENTS.md), [`docs/TECHDEBT.md`](TECHDEBT.md), [`docs/core_specs/02_database_schema.md`](core_specs/02_database_schema.md), [`docs/core_specs/19_checkpoint_studio.md`](core_specs/19_checkpoint_studio.md).

---

## 1. Trạng thái hiện tại

### Đã commit (chưa push)

| Commit    | Nội dung                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `979b1e0` | refactor: xóa 14 file dead code, gỡ 7 dependency thừa, đồng bộ `pnpm-lock.yaml` + `package-lock.json`                   |
| `e2da1e9` | fix(security): `requireAdminAuth` chặn user không có profile; 15 server action + 3 API admin có guard; migration 21 RLS |
| `d83f402` | feat(multi-case): `cases.slug`, `case_characters`, Studio Nhân vật (giai đoạn 0+1, migration 22/23 đã chạy production) |
| `09ee212` | fix(security): nhóm A — A1, A2, A3, A4, A7, A8 (một phần), A10, A11; xóa `/api/verify-finding`; login redirect |
| `db73360` | D5 `lib/google/auth.ts`, D6 `import type` 13 chỗ, E bỏ track dump `scripts/*.json`, `__pycache__`, `case_000_vector.backup_old.json` |
| _(commit kế)_ | A8 `middleware.ts` → `proxy.ts`; D1 landing tải three.js lười (`landing-keyhole-geometry.ts` tách hằng số); D2 `ReinvestigationModal` qua `next/dynamic` (4 chỗ); D4 đọc localStorage sau mount ở Checkpoint Studio; D9 dispose texture/material 360; D10 `user-nav` memo Supabase client |

**Còn lại theo nhóm:** A5 (dữ liệu ghi file → Supabase), A6 (rotate `.env` — chủ dự án), A9 (`is_admin` sang schema `private`); toàn bộ B, C; D3 (nén ảnh), D7 (`any`), D8 (tách god-component), D11; D2 phần `recharts`/`@xyflow` (chỉ trang admin, ưu tiên thấp); E phần chia `scripts/ops` / `scripts/archive` và quyết định `archive_3d_vault`.

> Ghi chú review 2026-10-22: bản sửa `/api/phone` của agent trước đã bị **hoàn tác** vì bỏ fallback gviz công khai, bỏ chuỗi tab dự phòng (`photos_old`, `evidences_old`) và bỏ lọc emoji ở header. Chỉ giữ phần bảo mật (whitelist tab, refresh chỉ admin, cache giới hạn). Docker/CI cài `pnpm@11.25.0` bằng `npm install -g` (không dùng corepack vì có thể lỗi khóa chữ ký với pnpm mới); `package.json` có `packageManager` cho `pnpm/action-setup`.

### Giai đoạn 0+1 multi-case (đã commit `d83f402`)

- Migration **đã chạy trên production**: `db/schema/22_case_slug.sql`, `db/schema/23_case_characters.sql`.
- Code mới: `lib/cases/case-id.ts`, `lib/cases/case-characters.ts`, `components/investigation/case-characters-context.tsx`, `app/api/characters/route.ts`, `lib/actions/character-actions.ts`, `app/(admin)/studio/characters/page.tsx`, `components/admin/character-studio/characters-studio-client.tsx`.
- Sửa ~30 file (studio dùng `?case=`, storage key theo slug, gameplay đọc nhân vật từ DB). Xem `git status`.
- `tsc --noEmit` và `next build` pass. Script kiểm registry 12/12 PASS trên dữ liệu thật. Đã chạy thử `/evidence/web?case_id=case_000`: provider nạp nhân vật OK, bàn điều tra render.
- **Chưa test**: Studio `/studio/characters` (cần đăng nhập admin), bấm tay luồng thêm nghi phạm / mở điện thoại.

### Rủi ro đang mở

- **Production chạy code cũ trên DB mới.** Tương thích, trừ `createNewCase` cũ tự đặt mã bằng cách đếm → FK chặn insert 2 node khởi đầu cho vụ mới. Cần push code giai đoạn 0+1 sớm.
- **Dev server cổng 3000** của chủ dự án đang lỗi CSS `Can't resolve '&#x27;/textures/kraft_paper_texture_large.png'` do cache Turbopack quét thư mục build tạm (đã xóa). Sửa: tắt server, `rm -rf .next/dev/cache`, chạy lại `pnpm dev`.
- **Không build vào thư mục không gitignore** khi dev server đang chạy (Tailwind v4 quét toàn repo trừ file gitignore). Dùng `NEXT_DIST_DIR=.next_dev`.

---

## 2. Quy ước bắt buộc

- Trả lời / tài liệu bằng tiếng Việt. Không tự commit/push trừ khi chủ dự án yêu cầu (xem `AGENTS.md`). Commit theo Conventional Commits.
- Chỉ dùng **pnpm** ở local (trộn npm làm pnpm relink). `pnpm exec` đang lỗi do placeholder trong `pnpm-workspace.yaml` (mục A7) — tạm chạy `node node_modules/next/dist/bin/next ...`.
- Typecheck: `npx tsc --noEmit --incremental false` (không ghi tsbuildinfo).
- Build kiểm tra: `NEXT_DIST_DIR=.next_dev npx next build`; build xong khôi phục `next-env.d.ts` và `tsconfig.json` (Next tự sửa 2 file này theo distDir).
- Repo có hook formatter chạy sau mỗi Edit/Write → khi sửa nhiều chỗ trong 1 file, sửa tuần tự hoặc dùng script.
- Mã vụ án luôn qua `normalizeCaseId()` (`lib/cases/case-id.ts`). Key localStorage qua `caseStorageKey()` (case_000 giữ key không tiền tố để không mất tiến trình người chơi).
- Supabase project: `zalyxhmwwmfyexoilejp`. Admin hiện tại: 2 tài khoản có `app_metadata.role` admin/super_admin.

---

## 3. Bước 0 — Chốt giai đoạn 0+1 (khẩn, ~30 phút)

1. Commit riêng giai đoạn 0+1. Gợi ý message: `feat(multi-case): add case slug and per-case characters`.
2. Push `main` → GitHub Actions build Docker → VPS. Theo dõi Actions + container `dect_project_app` (không dùng Vercel).
3. Smoke test production: `/evidence/web?case_id=case_000` (intro → bàn điều tra → thêm nghi phạm "Vũ" → tra SĐT 991 → mở điện thoại: chủ máy "Nguyễn Văn Khang"), `/studio/characters`, `/studio/checkpoints?case=case_001`, nút Playtest ở `/studio/cases`.

---

## 4. Nhóm A — Bảo mật & hạ tầng (độc lập, ~1–2 ngày)

| #   | Việc                                                                                                                                                                                                                                             | File                                                           | Done khi                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------- |
| A1  | `image-proxy`: chỉ fetch host `lh3.googleusercontent.com`, `drive.google.com`, `docs.google.com` (đóng SSRF); cache Map giới hạn (LRU ~200 mục / ~100MB). Tương tự `audio-proxy`                                                                 | `app/api/image-proxy/route.ts`, `app/api/audio-proxy/route.ts` | `?url=http://169.254.169.254/` trả 400       |
| A2  | Rate limiter: IP lấy từ `X-Real-IP` (Traefik) hoặc phần tử **cuối** `X-Forwarded-For`, không lấy phần tử đầu                                                                                                                                     | `lib/security/rate-limiter.ts:68`                              | Giả header không bypass được                 |
| A3  | `/api/phone`: whitelist tab (`evidences`, `photos`, `contacts`, `calls`, `messages`, `apps` + dạng `{case}_{tab}`); `refresh=true` chỉ admin; giới hạn cache                                                                                     | `app/api/phone/route.ts`                                       | `?tab=checkpoints` trả 400                   |
| A4  | Ghi Sheet: `valueInputOption: "RAW"` thay `USER_ENTERED`; validate `source` (độ dài, ký tự)                                                                                                                                                      | `app/api/waitlist/route.ts`, `app/api/admin/pins/route.ts`     | Chuỗi `=HYPERLINK(...)` ghi như text         |
| A5  | Dữ liệu ghi file trong container mất khi deploy (`data/maps/*.json`, `data/*_hotspots.json`, `data/waitlist_pending.json`). Chuyển sang bảng Supabase (`map_vectors`, `reinvestigation_hotspots`, `waitlist`) với RLS                            | 3 route + migration mới                                        | Redeploy không mất dữ liệu                   |
| A6  | `.env` bị commit. **Chủ dự án rotate toàn bộ key trước**, sau đó `git rm --cached .env`, thêm `.env` vào `.gitignore` và `.dockerignore` (cả `google-service-account.json`)                                                                      | —                                                              | `git ls-files .env` rỗng                     |
| A7  | Thống nhất pnpm: Dockerfile + `.github/workflows/deploy.yml` dùng `corepack enable && pnpm install --frozen-lockfile`; xóa `package-lock.json`. Sửa dòng `'@firebase/util': set this to true or false` trong `pnpm-workspace.yaml` thành `false` | Dockerfile, deploy.yml, pnpm-workspace.yaml                    | CI xanh, `pnpm exec next --version` chạy     |
| A8  | Next 16: đổi `middleware.ts` → `proxy.ts` (export `proxy`). Matcher bỏ qua `pdf                                                                                                                                                                  | mp3                                                            | wav                                          | ogg | glb | webp | avif | svg | png | jpg | jpeg | gif | woff2?`và`/api/image-proxy`, `/api/audio-proxy` | `middleware.ts` | Không còn gọi `getUser()` cho file tĩnh |
| A9  | Chuyển `public.is_admin()` sang schema `private` (cập nhật mọi policy), hết cảnh báo advisor. Chủ dự án bật Leaked Password Protection trên dashboard                                                                                            | migration mới                                                  | `get_advisors security` không còn `is_admin` |
| A10 | `room-sync-context`: effect cleanup gọi `supabase.removeChannel`; sửa join 2 lần (effect auto-connect phụ thuộc `joinRoom` ← `nickname`); clear timer khi unmount                                                                                | `components/investigation/room-sync-context.tsx`               | 1 channel / phòng                            |
| A11 | `requireAdminAuth` nằm trong file `'use server'` nên bị lộ thành server action công khai (vô hại nhưng thừa). Tách helper thuần ra `lib/auth/admin.ts`                                                                                           | `lib/actions/auth-guard.ts`                                    | —                                            |

Còn từ audit (P1): `app/api/test-scan-answer` là proxy Gemini công khai (xử lý ở B5); `app/api/verify-finding` có vẻ không còn ai gọi → xác nhận rồi xóa; `app/login/actions.ts:52` `redirect` chưa validate (chỉ cho đường dẫn bắt đầu bằng `/`).

---

## 5. Nhóm B — Giai đoạn 2: checkpoint theo `kind` + chấm điểm trên server (~5–7 ngày)

Gộp với "ẩn đáp án". Hiện đáp án lộ ở: `/api/checkpoints` trả `answer_config`/`ai_*`; RLS `case_checkpoints` cho anon SELECT; client tự so đáp án.

### B1. Baseline E2E — ✅ xong
- `e2e/case-000.spec.ts` (8 test, `pnpm test:e2e`, ~1 phút): tải bàn điều tra, sổ tay, tra 3 SĐT, thẩm tra Vũ/Tùng/Hà (động cơ + mâu thuẫn), 3 câu hỏi phụ (21:15 / KHÔNG / 120713), cáo trạng (sai bị can bị từ chối, Trần Thị Hà + C-02, D-04, D-05 được kết án).
- `playwright.config.ts` tự chạy dev server cổng 3100 với `NEXT_DIST_DIR=.next_dev` (không đụng `.next` của dev server cổng 3000).
- Ghim trên canvas có danh sách nút `[data-pin-id]` (sr-only, hiện khi focus) — dùng cho bàn phím, trình đọc màn hình và E2E.
- `/api/test-scan-answer` được mock (không gọi Gemini). Nhiều nút dùng CSS `uppercase` → helper `tap()` so chữ không phân biệt hoa thường.
- Chưa phủ: luồng Hậu án (đang hiển thị rỗng — xem lỗi dưới), chơi nhóm, khám xét hiện trường 360.
- Lỗi phát hiện khi viết baseline: (1) đã sửa — câu hỏi phụ trắc nghiệm so id phương án (`khong_tin`) với nhãn đáp án ("KHÔNG") nên không bao giờ đúng; (2) **chưa sửa** — Hậu án hiện "Hồ sơ hậu án đang được cập nhật" vì runtime làm rơi `epilogueStories` (xử lý ở B3); (3) **chưa sửa** — font tiêu đề Hậu án hiển thị sai dấu tiếng Việt ("Trầ`n").

### B2. Schema

- Thêm `case_checkpoints.kind` (`phone_lookup | suspect_interrogation | followup | indictment | choice | code | time | text | epilogue`), backfill 9 row hiện có (đang có `type`: evidence_picker×4, text×2, text_match_3, epilogue, mcq).
- Thêm `subject_key TEXT` (→ `case_characters.key` cùng vụ) cho checkpoint thẩm tra / follow-up.
- Cập nhật `createNewCase` seed node theo `kind`.

### B3. Kiểu cấu hình theo kind

`lib/checkpoints/kinds.ts`: discriminated union theo `kind`, mỗi kind có type config + hàm validate + parse từ `answer_config`. Thay `EvidencePickerConfig` gộp chung (`lib/types/checkpoint-studio.ts`) và mapper `lib/cms/checkpoint-runtime.ts`. Nhớ map `epilogueStories` (hiện runtime làm rơi mất).

### B4. Editor Studio theo kind (`components/admin/checkpoint-studio/sections/`)

- `phone_lookup`: danh sách ô nhập (`textMatchInputs`: label, placeholder, validAnswers).
- `suspect_interrogation`: chọn nghi phạm từ `case_characters` (role suspect); picker mã chứng cứ động cơ/mâu thuẫn từ tab `evidences` (`/api/phone?tab=evidences&caseId=`), nhóm bắt buộc/tùy chọn; context AI.
- `followup`: checkpoint cha (nối trên Flow view), dạng time/choice/code/text, `correctAnswer`, `options`, `photoCodes`.
- `indictment`: `validSuspects` từ nhân vật, `requiredEvidenceIds`, phương án động cơ.
- `epilogue`: danh sách `epilogueStories`.
- Bỏ chặn chỉ sửa `evidence_picker` trong form.

### B5. Chấm điểm trên server

- Env server-only `SUPABASE_SERVICE_ROLE_KEY` (thêm vào `.env.example`, README, VPS). Tạo `lib/supabase/admin.ts` (không import vào client).
- View `case_checkpoints_public` (không có `answer_config`, `ai_*`) với GRANT anon; bỏ policy anon SELECT trên bảng gốc (`db/schema/18_...`). `/api/checkpoints` đọc view.
- `POST /api/checkpoints/verify` `{caseId, checkpointId, answer | selectedCodes | inputs}` → chạy logic chấm theo kind trên server (`isEvidenceMatching`, `validateEvidenceSelection`, fuzzy text), rate limit, trả `{correct, feedback, unlocks}`.
- `/api/test-scan-answer` nhận `checkpointId`, tự đọc `ai_context`/case mẫu từ DB; không nhận `context` từ client; giới hạn độ dài input; lỗi AI → chấm sai (hiện `add-suspect-modal.tsx:369` chấm đúng khi lỗi).

### B6. Refactor runtime gameplay

File: `components/investigation/mindmap/canvas/pin-builder.ts`, `main-investigation-canvas.tsx`, `canvas/use-investigation-state.ts`, `add-suspect-modal.tsx`, `followup-question-modal.tsx` (+ `followup/*`), `indictment-modal.tsx`, `phone-lookup-modal.tsx`, `phone-narrative-modal.tsx`, `culprit-epilogue-modal.tsx`, `custom-pin-modal.tsx`, `hint-modal.tsx`, `dossier-result-modal.tsx`, `lib/hooks/use-case-narratives.ts`.

- Tìm checkpoint theo `kind` + `subject_key`, không dò chuỗi ID (`-0`, `phone`, `-2b`, `cp-000-*`).
- Xóa đáp án hardcode: `'21:15'`, `'120713'` (followup-question-modal ~297/364), `"VALID_ANSWER"` (`app/(investigation)/board-stage/page.tsx:149`), đoạn cộng mã case_000 vào cáo trạng (`indictment-modal.tsx:176`), `DEFAULT_PHONE_INPUTS`, `DEFAULT_NARRATIVES`.
- `CulpritKey "vu"|"tung"|"ha"` → `character.key`; gating `isVu/isTung/isHa` → theo checkpoint.
- Bỏ registry module (`lib/cases/case-characters.ts`) → truyền nhân vật qua `useCaseCharacters()`; đổi tên `case-000-suspects.ts`/`case-000-clues.ts` thành `lib/cases/characters.ts`/`clues.ts`.
- `lib/ai/suspect-interrogation-context.ts` (`CASE_000_INTERROGATION_CRITERIA`) → dùng `ai_context` của checkpoint.

### B7. Docs

Cập nhật `19_checkpoint_studio.md`, `02_database_schema.md`, `CHANGELOG.md`, `TECHDEBT.md` #14.

---

## 6. Nhóm C — Giai đoạn 3: tiến trình theo đồ thị & công cụ biên tập (~4–5 ngày, sau B)

1. **Mở khóa theo đồ thị**: runtime đọc `depends_on`, `unlocksDossier`, `case_dossiers.document_codes`. Bỏ suy phase từ chữ cái đầu mã tài liệu (`app/(investigation)/evidence/web/page.tsx` ~156–223, ~351).
2. **Case lint** trong Studio: node không tới được, cycle, checkpoint thiếu đáp án, mã chứng cứ không có trên `evidences`, nghi phạm chưa có checkpoint thẩm tra, vụ thiếu nạn nhân.
3. **Nhân bản vụ án làm template**: `duplicateCase` copy cả `case_checkpoints`, `case_dossiers`, `case_characters`, `dossier_documents` (hiện chỉ copy metadata).
4. **Chơi thử từ node X**: Studio ghi tiến trình giả vào localStorage theo `caseStorageKey` rồi mở `/evidence/web?case_id=`.
5. **Bàn điều tra theo vụ**: `pin-builder` dựng pin gốc từ nhân vật + checkpoint; `board-stage`, `evidence/boardgame`, `evidence/[id]` nhận `case_id`; ghi lại `boardgame_pins` dạng `case_000` rồi thêm FK `→ cases.slug`.
6. **Tài nguyên theo vụ**: bỏ `CASE_000_PDFS`/`CASE_000_EVIDENCE` (`components/investigation/evidence/evidence-data.ts`) → `dossier_documents`; ảnh 360/hotspots theo slug; bỏ chữ "Khang" trong `messages-app.tsx`, `phone-app.tsx`, `photos-app.tsx`; dời asset dùng chung khỏi `public/images/cases/case_000/` (icons điện thoại, clue_notes); `app/api/phone/route.ts` không trả row thiếu `case_id` cho mọi vụ.
7. **`/activate` đọc bảng `cases`** (bỏ `CASES_CATALOG` tĩnh, bỏ luật "mã ≥ 4 ký tự là hợp lệ") — làm cùng License (`TECHDEBT.md` #09).

---

## 7. Nhóm D — Hiệu năng & chất lượng code (xen kẽ)

1. Landing: `components/public/landing-scene-360-showcase.tsx` (kéo three/R3F/drei) load bằng `next/dynamic({ ssr: false })`; bỏ preload model khi import (`landing-magnifier-model.tsx:12`).
2. `next/dynamic` cho `ReinvestigationModal` (4 chỗ import), `recharts` (`app/(admin)/studio/dashboard-client.tsx`), `@xyflow/react` (`checkpoint-flow-view.tsx`).
3. Ảnh PNG 4–10MB ở `public/images/cases/case_000/` (`PANORAMA.png`, `9.png`–`18.png`) → WebP/AVIF; cân nhắc bỏ `images.unoptimized`.
4. Hydration: bỏ đọc `localStorage` trong `useState` initializer ở `checkpoint-studio-client.tsx`, `checkpoint-flow-view.tsx`, `main-investigation-canvas.tsx` → đọc trong `useEffect`.
5. Gom trùng lặp: `createGoogleAuth` (3 route) → `lib/google/auth.ts`; `removeDiacritics`/`normalize('NFD')` (11 chỗ) → `lib/text.ts`.
6. `import type` cho 15 chỗ (rule 12 AGENTS.md): `admin-create-pin-modal.tsx:18`, `custom-pin-modal.tsx:17`, `cases-client.tsx:9`, `feedbacks-client.tsx:5`, `settings-client.tsx:5`, `feedback-modal.tsx:6`, `landing-banner.tsx:5`, `lib/actions/{case,feedback,player,settings}-actions.ts`, `evidence-data.ts:1`, `evidence-detail-inspector.tsx:4`.
7. Giảm `any` (226), ưu tiên `hero-interactive.tsx`, `lib/actions/*`.
8. Tách god-component: `hero-interactive.tsx` (2.500 dòng: `renderScene` → module vẽ canvas; hooks `useBoardPointer`, `useLivePinPhotos`, `useBoardZoom`), `map-studio-client.tsx` (1.500 dòng: `useMapDraft`, `useHistory`, `useMapTools`, `useViewportCulling`).
9. `scene-360-viewer.tsx`: dispose texture/material khi unmount; memo `hotspots` để không dựng lại renderer.
10. `components/auth/user-nav.tsx:15`: `createClient()` trong render → `useMemo`.
11. `evidence-theme-context.tsx` chưa có ai dùng (vừa thêm ở commit `5078f5d`) → hỏi chủ dự án.

---

## 8. Nhóm E — Dọn repo (~nửa ngày)

- Bỏ khỏi git: `scripts/*.json` (dump Figma), `scripts/__pycache__/`, `data/maps/*.backup*.json`; `world_vector_map.json` và `case_000_vector.json` trùng hoàn toàn (route map-vector ghi cả hai — bỏ bản legacy khi xong A5).
- Chia `scripts/` (78 file) → `scripts/ops/` (export/sync/import) và `scripts/archive/` (inspect/test chạy một lần); cập nhật `package.json` scripts.
- `components/investigation/archive_3d_vault/` + `app/(investigation)/cabinet-demo/`: đang đóng băng theo AGENTS.md §8 — chủ dự án quyết giữ hay xóa.

---

## 9. Thứ tự đề xuất

Bước 0 → A1–A4, A7, A8 (nhanh, rủi ro thấp) → B1 → B2–B6 → C. D, E làm xen kẽ. A5, A9, A10 làm khi rảnh.

Việc chủ dự án tự làm: rotate key trong `.env` (A6), bật Leaked Password Protection (A9), quyết định `archive_3d_vault` (E), restart dev server cổng 3000.
