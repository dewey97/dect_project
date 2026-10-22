# Handoff Roadmap — Multi-case, Security & Tech Debt

> Tài liệu bàn giao cho người làm tiếp (người hoặc AI agent). Viết 2026-10-22, cập nhật sau commit `7d20787`.
>
> **Đọc theo thứ tự:** mục 1 (trạng thái) → mục 2 (quy ước) → mục 3 (điều kiện done) → mục 4 (phân công & brief) → nhóm việc được giao (mục 6–10).
>
> Tài liệu liên quan: [`AGENTS.md`](../AGENTS.md), [`docs/TECHDEBT.md`](TECHDEBT.md), [`docs/core_specs/02_database_schema.md`](core_specs/02_database_schema.md), [`docs/core_specs/19_checkpoint_studio.md`](core_specs/19_checkpoint_studio.md), [`CHANGELOG.md`](../CHANGELOG.md).

---

## 1. Trạng thái hiện tại

### 1.1. Commit trên `main`, CHƯA push

| Commit    | Nội dung                                                                                                                              | Ghi chú                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `979b1e0` | refactor: xóa 14 file dead code, gỡ 7 dependency thừa                                                                                 |                                         |
| `e2da1e9` | fix(security): `requireAdminAuth` chặn user không có `profiles`; guard 15 server action + 3 API admin; migration 21 RLS               | Migration **đã chạy production**        |
| `d83f402` | feat(multi-case): `cases.slug`, `case_characters`, Studio `/studio/characters`, provider nạp nhân vật                                 | Migration 22, 23 **đã chạy production** |
| `09ee212` | fix(security): A1–A4, A7, A10, A11; xóa `/api/verify-finding`; chặn open redirect; CI/Docker chuyển `pnpm@11.25.0`                    | Lần đầu CI chạy pnpm                    |
| `db73360` | refactor: D5 `lib/google/auth.ts`; D6 `import type` 13 chỗ; E bỏ track dump `scripts/*.json`, `__pycache__`, map backup               |                                         |
| `cc8ab02` | perf: A8 `middleware.ts` → `proxy.ts`; D1/D2 tải lười three.js và modal 360; D4 hydration; D9 dispose 360; D10                        |                                         |
| `1efcf33` | UI: ô lý do thẩm tra tự giãn từ 1 dòng; nút "GỢI Ý n" giữa "Quay lại"/"Xác nhận"; nhãn "Bằng chứng đã chọn"; Sổ tay cạnh nút âm lượng | Chủ dự án yêu cầu                       |
| `7d20787` | test(e2e): baseline 8 kịch bản case_000; sửa lỗi chấm câu hỏi phụ trắc nghiệm                                                         |                                         |

### 1.2. Kiểm tra gần nhất (sau `7d20787`)

| Lệnh                                     | Kết quả            |
| ---------------------------------------- | ------------------ |
| `npx tsc --noEmit --incremental false`   | Sạch               |
| `NEXT_DIST_DIR=.next_dev npx next build` | Pass               |
| `pnpm test:e2e`                          | 8/8 pass (~1 phút) |

### 1.3. Database production (Supabase project `zalyxhmwwmfyexoilejp`)

- Migration đã chạy: `21_security_hardening_rls.sql`, `22_case_slug.sql`, `23_case_characters.sql`.
- `cases`: `case_000` ("TRỐN TÌM"), `case_001` ("test"). Slug do trigger `assign_case_slug` cấp.
- `case_characters`: 10 nhân vật case_000 (1 nạn nhân, 6 nghi phạm, 1 nhân chứng, 2 liên quan).
- `case_checkpoints`: 9 checkpoint case_000 (`cp-000-0`, `cp-000-1a/1b/1c`, 3 follow-up, `cp-000-2b`, `cp-000-epilogue`).
- Admin: 2 tài khoản có `app_metadata.role` admin/super_admin và `profiles.role = 'admin'`.
- Security advisors còn 2 WARN rủi ro thấp: `rls_auto_enable()` gọi được qua RPC; Leaked Password Protection tắt. (`is_admin()` đã chuyển sang schema `private` — migration 25.)

### 1.4. Rủi ro đang mở

1. **Production chạy code cũ trên DB đã migrate.** Tương thích, trừ `createNewCase` cũ tự đếm mã vụ (`case_003`) trong khi DB cấp `case_002` → FK chặn tạo 2 node khởi đầu cho vụ mới. **Push sớm.**
2. **Lần push đầu thay đổi hạ tầng build:** CI chuyển sang pnpm (`pnpm/action-setup` đọc `packageManager` trong `package.json`), Docker cài `pnpm@11.25.0` bằng `npm install -g`, `middleware.ts` đổi tên `proxy.ts` (Next 16 chạy proxy ở runtime Node). Theo dõi job `preflight` và `build-and-push`, sau đó smoke test production.
3. **Dev server cổng 3000 của chủ dự án** có thể còn lỗi CSS `Can't resolve '&#x27;/textures/kraft_paper_texture_large.png'` (cache Turbopack quét thư mục build tạm cũ). Sửa: tắt server, `rm -rf .next/dev/cache`, chạy lại `pnpm dev`.
4. **Chấm điểm vẫn chạy ở client và đáp án lộ qua `/api/checkpoints`** — xử lý ở nhóm B (B5).
5. **Dữ liệu ghi file trong container mất khi redeploy** (map vector, hotspots, waitlist) — A5.

### 1.5. Việc còn lại — tổng quan

| Nhóm   | Mục                                                                   | Người làm đề xuất                   | Ước lượng  |
| ------ | --------------------------------------------------------------------- | ----------------------------------- | ---------- |
| Bước 0 | Push 8 commit, theo dõi CI, smoke test production                     | Chủ dự án                           | 30 phút    |
| A      | A5 dữ liệu ghi file → Supabase                                        | Model khác viết, chủ dự án chạy SQL | 0.5–1 ngày |
| A      | A6 rotate key `.env`, `git rm --cached .env`                          | Chủ dự án                           | 30 phút    |
| A      | A9 `is_admin()` sang schema `private`                                 | Claude                              | 1 giờ      |
| Lỗi    | L1 Hậu án hiển thị rỗng (`epilogueStories` bị rơi)                    | ✅ `079af56`                        | —          |
| Lỗi    | L2 font tiêu đề Hậu án sai dấu tiếng Việt                             | Model khác                          | 1 giờ      |
| B      | B2–B3 checkpoint kind schema + types                                  | ✅ `079af56`                        | —          |
| B      | B4–B7 Studio editor theo kind, chấm điểm server, refactor runtime     | Claude                              | 4–5 ngày   |
| C      | Tiến trình theo đồ thị, case lint, template vụ án                     | Claude (sau B)                      | 4–5 ngày   |
| D      | D3 nén ảnh, D7 giảm `any`, D8 tách god-component, D11                 | Model khác                          | 1–3 ngày   |
| E      | Chia `scripts/ops` / `scripts/archive`; quyết định `archive_3d_vault` | Model khác + chủ dự án              | 0.5 ngày   |

---

## 2. Quy ước bắt buộc

### 2.1. Quy tắc dự án

- Tiếng Việt cho tài liệu và trao đổi. Đọc `AGENTS.md` (global + dự án) trước khi làm.
- **Không tự `git push`.** Commit khi hoàn thành trọn một đơn vị việc; Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`).
- **Không tự chạy migration lên production.** Viết file `db/schema/NN_*.sql`, chủ dự án duyệt rồi mới chạy.
- Chỉ dùng **pnpm** ở local (trộn npm làm pnpm relink `node_modules`).
- Không dùng `next/font/google` (AGENTS.md §11); font nạp qua `@import` trong `app/globals.css`.
- Import type phải dùng `import type` (AGENTS.md §12, tránh silent 404 Turbopack).
- Không `autoFocus` / `.focus()` khi mở modal (AGENTS.md §3).

### 2.2. Lệnh kiểm tra

| Mục đích                 | Lệnh                                               | Lưu ý                                                                                                           |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Typecheck                | `npx tsc --noEmit --incremental false`             | Lỗi trong `.next/types/*` cũ là file sinh tự động; xóa file đó nếu nó chặn build                                |
| E2E                      | `pnpm test:e2e`                                    | Playwright tự chạy dev server cổng 3100 với `NEXT_DIST_DIR=.next_dev`                                           |
| Build                    | `NEXT_DIST_DIR=.next_dev npx next build`           | Sau khi build: `git checkout -- next-env.d.ts tsconfig.json` (Next tự sửa 2 file theo distDir); xóa `.next_dev` |
| Chạy Next không qua pnpm | `node node_modules/next/dist/bin/next dev -p 3100` | Dùng khi `pnpm exec` bị chặn bởi kiểm tra dependency                                                            |

- **Không build vào thư mục không gitignore** khi dev server đang chạy: Tailwind v4 quét toàn repo (trừ file gitignore) và cache sai CSS. Chỉ dùng `.next_dev` (đã gitignore).
- Không chạy `next build` vào `.next_dev` trong khi E2E/dev server cổng 3100 đang dùng thư mục đó.

### 2.3. Kiến trúc cần nắm

- **Mã vụ án:** luôn qua `normalizeCaseId()` (`lib/cases/case-id.ts`) → dạng `case_000`. URL gameplay `/evidence/web?case_id=<slug>`; Studio `?case=<slug>`.
- **Storage:** key tiến trình qua `caseStorageKey(caseId, key)`. case_000 giữ key không tiền tố để không mất tiến trình người chơi cũ; vụ khác dùng `<slug>::<key>`.
- **Nhân vật:** `CaseCharactersProvider` (`components/investigation/case-characters-context.tsx`) nạp `/api/characters` trước khi render bàn điều tra, ghi vào registry `lib/cases/case-characters.ts`. Hàm so khớp tên/SĐT (`lib/cases/case-000-suspects.ts`, `case-000-clues.ts`) đọc registry. Registry là giải pháp tạm; B6 thay bằng context.
- **Quyền admin:** `requireAdminAuth()` / `checkIsAdmin()` ở `lib/auth/admin.ts` (server-only). Client gọi `checkIsAdmin` qua server action `lib/actions/auth-guard.ts`. Route Handler dùng `denyIfNotAdmin()` (`lib/security/admin-route-guard.ts`). RLS dùng `private.is_admin()` (migration 25).
- **Google Sheets:** `createGoogleAuth(scope)` ở `lib/google/auth.ts`. `/api/phone` chỉ cho tab `evidences, photos, contacts, calls, messages, apps`; `refresh=true` chỉ admin.
- **Bàn điều tra:** vẽ bằng canvas (`components/investigation/hero-interactive.tsx`). Danh sách nút ghim ẩn `[data-pin-id]` dùng cho bàn phím, trình đọc màn hình và E2E — **không xóa**.

---

## 3. Điều kiện "done" cho mọi việc

1. `npx tsc --noEmit --incremental false` sạch.
2. `pnpm test:e2e` 8/8 pass. Đổi hành vi gameplay thì thêm/sửa test tương ứng.
3. `NEXT_DIST_DIR=.next_dev npx next build` pass; khôi phục `next-env.d.ts`, `tsconfig.json`; xóa `.next_dev`.
4. **Diff tối thiểu:** không viết lại cả file; không đổi hành vi ngoài phạm vi; không xóa fallback, tab dự phòng hay dữ liệu cũ khi chưa được yêu cầu.
5. Đổi UI người chơi thấy được → kiểm tra trên trình duyệt (desktop 1440×900 và mobile 375×812), chụp ảnh trước/sau.
6. Cập nhật `CHANGELOG.md` và mục tương ứng trong file này (đánh dấu ✅, ghi việc còn lại).
7. Commit theo Conventional Commits. **Không push.**

**Báo cáo bàn giao** gồm: danh sách commit, file đã đổi, kết quả 3 lệnh kiểm tra, việc chưa làm và lý do, rủi ro cần chủ dự án biết.

---

## 4. Phân công & quy trình giao việc

### 4.1. Nguyên tắc chia việc (tiết kiệm quota)

| Loại việc                                                                 | Giao cho            | Lý do                                        |
| ------------------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| Cơ học, mô tả rõ, phạm vi nhỏ, có test bảo vệ (nhóm D, E, A5, L2)         | Model khác (rẻ hơn) | Review diff rẻ hơn tự viết                   |
| Quyết định thiết kế (schema `kind`, chấm điểm server, RLS, migration lõi) | Claude              | Sai thiết kế thì sửa tốn hơn làm đúng từ đầu |
| Refactor lõi gameplay (B6, C)                                             | Claude              | Model khác dễ viết lại quá tay               |
| Review bàn giao của model khác                                            | Claude, phiên ngắn  | Chỉ đọc diff, có thể dùng `/code-review low` |

- **Mỗi nhóm việc một phiên mới**, chỉ nạp file này + file liên quan. Phiên dài làm mỗi lượt gửi lại toàn bộ lịch sử → tốn quota.
- **Gom yêu cầu chỉnh UI vào một tin nhắn**; mỗi tin chen giữa là một lượt xử lý.
- Thứ tự: Bước 0 → (song song) nhóm D/E/A5/L2 cho model khác và B2–B3 cho Claude → B4–B6 → C.

### 4.2. Quy trình review khi model khác bàn giao

1. `git log --oneline <commit-trước>..HEAD` và `git diff <commit-trước>..HEAD --stat`: chặn diff phình bất thường (file bị viết lại toàn bộ là dấu hiệu đỏ).
2. **Chạy lại mục 3**, không tin báo cáo.
3. Đọc diff theo thứ tự rủi ro: ranh giới server/client (`'use server'`, import `@/lib/supabase/server` từ client) → API route → RLS/migration → gameplay → UI.
4. Đối chiếu brief: việc ngoài phạm vi thì hoàn tác.
5. Ghi bài học mới vào mục 4.3.

### 4.3. Bài học từ các lần review (tránh lặp lại)

| Sai lầm                                                                                                                                       | Hậu quả                                                                                                                     | Cách tránh                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Bỏ `'use server'` khỏi `lib/actions/auth-guard.ts` trong khi client component (`use-board-layout.ts`, `reinvestigation-modal.tsx`) còn import | Build hỏng (module server lọt vào bundle client)                                                                            | `grep -rn "<module>" app components` trước khi đổi ranh giới server/client        |
| Viết lại toàn bộ `app/api/phone/route.ts`                                                                                                     | Mất fallback gviz công khai, chuỗi tab dự phòng (`photos_old`, `evidences_old`), lọc emoji tên cột → vật chứng có thể trống | Chỉ sửa đúng phần được giao                                                       |
| Chặn open redirect chỉ kiểm tra `//`                                                                                                          | `/\evil.com` vẫn lọt (trình duyệt hiểu là `//evil.com`)                                                                     | Chặn mọi dấu `\`                                                                  |
| CI dùng `pnpm/action-setup` không khai báo version; Docker `corepack prepare pnpm@latest`                                                     | CI lỗi; version pnpm trôi                                                                                                   | Giữ `packageManager` trong `package.json`; Docker `npm install -g pnpm@<version>` |
| Build vào thư mục tạm không gitignore khi dev server đang chạy                                                                                | Tailwind cache CSS sai, dev server lỗi                                                                                      | Chỉ dùng `.next_dev`                                                              |
| Playwright so chữ chính xác trên nút có CSS `uppercase`                                                                                       | Không tìm thấy nút                                                                                                          | Dùng helper `tap()` (regex không phân biệt hoa thường, chỉ phần tử hiển thị)      |
| Bấm Enter trong ô mã chứng cứ cáo trạng                                                                                                       | Form bị nộp sớm                                                                                                             | Nhập nhiều mã phân tách dấu phẩy rồi bấm "ĐỀ NGHỊ TRUY TỐ"                        |

### 4.4. Brief mẫu — dán nguyên văn vào phiên mới

Mỗi brief đã kèm phạm vi, file, ràng buộc và điều kiện done. Người làm phải đọc mục 1–3 của file này trước.

#### Brief L2 — font tiêu đề Hậu án sai dấu (model khác, ~1 giờ)

> Dự án `D:\code_world\dect_project` (Next.js 16, pnpm). Đọc `AGENTS.md` và `docs/HANDOFF_ROADMAP.md` mục 1–3.
>
> **Lỗi:** trong modal Hậu án (`components/investigation/epilogue-modal.tsx`), danh sách tiêu đề bên phải hiển thị sai dấu tiếng Việt (ví dụ "Trần" hiện thành "Trầ`n", "Đất" thành "Đấ´t"). Khả năng cao font serif đang dùng thiếu glyph tiếng Việt dựng sẵn nên dấu tổ hợp bị tách.
>
> **Việc:**
>
> 1. Xác định font thực tế của tiêu đề trong danh sách Hậu án (DevTools → Computed → font-family).
> 2. Đổi sang font đã nạp trong `app/globals.css` có hỗ trợ tiếng Việt (ví dụ `Courier Prime` hoặc `Inter`), hoặc thêm subset `vietnamese` vào `@import` Google Fonts. **Không dùng `next/font/google`.**
> 3. Rà các chỗ khác dùng cùng font (grep tên font), liệt kê trong báo cáo; chỉ sửa trong Hậu án.
>
> **Kiểm tra:** mở Hậu án (giải cáo trạng: bị can "Trần Thị Hà", động cơ "Mâu thuẫn tình cảm", mã `C-02, D-04, D-05`), chụp ảnh trước/sau. Done: mục 3.

#### Brief D3 — nén ảnh runtime (model khác, ~0.5 ngày)

> Đọc `AGENTS.md` (§5 ranh giới `docs/` vs `public/`) và `docs/HANDOFF_ROADMAP.md` mục 1–3, 9 (D3).
>
> **Việc:**
>
> 1. Liệt kê ảnh > 1MB trong `public/` (`find public -size +1M -name "*.png"`). Ưu tiên `public/images/cases/case_000/` (`9.png`–`18.png`, `phone/*_exact.png`, `poster_c0.png`).
> 2. Chuyển sang WebP chất lượng ~80 (giữ kích thước pixel), cùng tên khác đuôi; cập nhật mọi tham chiếu trong `app/`, `components/`, `lib/`, `data/` (grep tên file).
> 3. **Không đổi** `PANORAMA.png` (dùng cho `Scene360Viewer` 360) trừ khi kiểm tra hiển thị 360 vẫn đúng; landing đã dùng `PANORAMA.webp`.
> 4. Xóa PNG gốc khỏi `public/` khi không còn tham chiếu (bản gốc chất lượng cao đã có trong `docs/cases/case_000/`).
> 5. Cập nhật `docs/cases/case_000/02_photos/ASSET_CATALOG.md`.
>
> **Kiểm tra:** bảng dung lượng trước/sau; E2E pass; mở thử khám xét hiện trường 2D và điện thoại nạn nhân. Done: mục 3.

#### Brief D8 — tách `hero-interactive.tsx` (model khác, ~1 ngày)

> Đọc `docs/HANDOFF_ROADMAP.md` mục 1–3 và 9 (D8).
>
> **Bối cảnh:** `components/investigation/hero-interactive.tsx` ~2.500 dòng, 47 `useRef`, hàm vẽ canvas ~1.350 dòng trong một `useEffect`.
>
> **Việc (không đổi hành vi):**
>
> 1. Hàm vẽ cảnh → module thuần `components/investigation/hero-interactive/render-scene.ts` (nhận canvas context + state, không dùng React).
> 2. Xử lý con trỏ (pointer down/move/up, kéo nối dây, chọn ghim) → hook `useBoardPointer`.
> 3. Nạp ảnh ghim từ Google Sheets → hook `useLivePinPhotos`.
> 4. Zoom/pan → hook `useBoardZoom`.
> 5. **Giữ nguyên** danh sách nút ghim `[data-pin-id]` và props công khai của `HeroInteractive`.
>
> **Kiểm tra:** E2E 8/8 là điều kiện tiên quyết; thử tay chế độ admin "Bật chế độ di chuyển & setup node" (kéo ghim, nối dây). Done: mục 3.

#### Brief D7 — giảm `any` (model khác, chia nhiều lần)

> Hiện ~226 chỗ `any`. Mỗi lần làm 1–3 file, ưu tiên: `lib/actions/*.ts`, `components/investigation/hero-interactive.tsx`, `components/phone-engine/apps/phone-app.tsx`, `messages-app.tsx`, `main-investigation-canvas.tsx`. Dùng type có sẵn trong `lib/types/database.ts`, `lib/types/case.ts`; `catch (error: unknown)` + thu hẹp kiểu. Không đổi logic. Done: mục 3.

#### Brief D11 — gộp hàm bỏ dấu tiếng Việt (model khác, ~1 giờ)

> Có ~11 chỗ tự viết `normalize('NFD').replace(...)`: `lib/finding-matcher.ts`, `lib/cases/case-000-suspects.ts`, `lib/cases/case-characters.ts`, `lib/cms/checkpoint-graph.ts`, `indictment-modal.tsx`, `lib/types/checkpoint-studio.ts`, `phone-lookup-modal.tsx`, `checkpoint-studio-client.tsx`, `dossier-config-modal.tsx`, `dossier-editor.tsx`. Tạo `lib/text.ts` (`stripVietnameseDiacritics`, `normalizeForMatch`) và thay thế, giữ nguyên hành vi từng chỗ (có chỗ bỏ ký tự đặc biệt, có chỗ không). Done: mục 3.

#### Brief A5 — dữ liệu ghi file sang Supabase (model khác viết, chủ dự án chạy SQL, ~1 ngày)

> Đọc `docs/HANDOFF_ROADMAP.md` mục 1–3, 6 (A5) và `docs/core_specs/02_database_schema.md` (mục RLS).
>
> **Vấn đề:** 3 route ghi file trong container Docker (không có volume) → mất dữ liệu mỗi lần deploy:
>
> - `app/api/admin/map-vector/route.ts` → `data/maps/world_vector_map.json` (+ bản legacy `case_000_vector.json`)
> - `app/api/reinvestigation/route.ts` → `data/<case>_hotspots.json`
> - `app/api/waitlist/route.ts` → `data/waitlist_pending.json` (dự phòng khi chưa có Sheet)
>
> **Việc:**
>
> 1. Viết `db/schema/24_runtime_data_tables.sql`:
>    - `map_vectors (id TEXT PRIMARY KEY DEFAULT 'world', data JSONB NOT NULL, updated_at TIMESTAMPTZ)` — đọc công khai, ghi `public.is_admin()`.
>    - `reinvestigation_hotspots (case_slug TEXT PRIMARY KEY REFERENCES cases(slug) ON UPDATE CASCADE ON DELETE RESTRICT, hotspots JSONB NOT NULL, updated_at TIMESTAMPTZ)` — đọc công khai, ghi admin.
>    - `waitlist_entries (id UUID, email TEXT, source TEXT, ip TEXT, created_at TIMESTAMPTZ, UNIQUE(email, source))` — insert công khai, đọc admin.
> 2. Đổi 3 route đọc/ghi Supabase; **giữ nguyên API contract** (request/response) và guard `denyIfNotAdmin()`; giữ cache in-process của map-vector (vô hiệu khi POST).
> 3. Script một lần `scripts/import-runtime-data.mjs` đọc file `data/` hiện có và sinh SQL upsert vào `.tmp/` (không tự chạy).
> 4. Bỏ ghi `case_000_vector.json` legacy.
>
> **Không tự chạy migration.** Done: mục 3; báo cáo kèm thứ tự chạy: migration → import → deploy.

#### Brief E — dọn `scripts/` (model khác, ~0.5 ngày)

> 78 file trong `scripts/`. Chia: `scripts/ops/` (script còn dùng trong `package.json` và tài liệu: export/sync/import), `scripts/archive/` (inspect/test chạy một lần, ví dụ `inspect_*`, `test_*`, `download_sfx2.py`, `fetch-figma-tree.js`). Cập nhật đường dẫn trong `package.json` và tài liệu (grep tên script trong `docs/`, `AGENTS.md`). Không xóa file. `archive_3d_vault/` + `/cabinet-demo`: chỉ liệt kê, chờ chủ dự án quyết (AGENTS.md §8). Done: mục 3.

#### Brief A9 — `is_admin()` sang schema `private` (Claude, ~1 giờ)

> Migration `db/schema/25_private_is_admin.sql`: tạo schema `private` (không expose qua PostgREST), chuyển hàm `is_admin()` sang đó (`SECURITY DEFINER`, `search_path = public`), `GRANT USAGE ON SCHEMA private` và `GRANT EXECUTE` cho `anon, authenticated`, cập nhật **mọi** policy đang gọi `public.is_admin()` (tra `pg_policies`), rồi `DROP FUNCTION public.is_admin()`. Smoke test bằng `SET LOCAL ROLE` như migration 21 (anon/player/admin, kết thúc bằng rollback). Chạy security advisors sau khi chủ dự án duyệt và chạy migration.

#### Brief B2–B3 + L1 Hậu án (Claude, ~2 ngày)

> Đọc mục 1–3, 7 (B2, B3) và `docs/core_specs/19_checkpoint_studio.md`.
>
> 1. Migration `26_checkpoint_kind.sql`: cột `kind` (`phone_lookup | suspect_interrogation | followup | indictment | choice | code | time | text | epilogue`), `subject_key TEXT` (tham chiếu `case_characters.key` cùng vụ); backfill 9 checkpoint case_000 (`cp-000-0` → `phone_lookup`; `1a/1b/1c` → `suspect_interrogation` + `vu/tung/ha`; follow-up → `followup` + subject; `2b` → `indictment`; `epilogue` → `epilogue`).
> 2. `lib/checkpoints/kinds.ts`: discriminated union theo `kind`, `parseCheckpointConfig(kind, answer_config)` + `validateCheckpointConfig`.
> 3. `lib/cms/checkpoint-runtime.ts`: dùng `kind`; **map `epilogueStories`** để Hậu án hiển thị (sửa L1).
> 4. E2E: thêm test Hậu án (sau cáo trạng, 4 phần Hậu án có nội dung).
> 5. Chưa đổi gameplay modal (đó là B6). Done: mục 3.

---

## 5. Bước 0 — Chốt và deploy (chủ dự án, ~30 phút)

1. `git push origin main`.
2. Theo dõi GitHub Actions: job `preflight` (pnpm install + `pnpm run lint`), `build-and-push` (Docker), bước deploy VPS.
3. Smoke test production:
   - `/evidence/web?case_id=case_000`: intro → bàn điều tra → tra SĐT (Vũ, Tùng, Đạt) → mở điện thoại nạn nhân (chủ máy "Nguyễn Văn Khang").
   - `/studio/characters` (đăng nhập admin): sửa thử mô tả một nhân vật rồi hoàn tác.
   - `/studio/checkpoints?case=case_001`, nút Playtest ở `/studio/cases`.
   - `POST /api/admin/map-vector` khi chưa đăng nhập → 401.
4. Nếu CI lỗi ở pnpm: kiểm tra `packageManager` trong `package.json`, `pnpm-workspace.yaml` (`allowBuilds`).

---

## 6. Nhóm A — Bảo mật & hạ tầng

| #   | Việc                                                                                    | Trạng thái                                                                    |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| A1  | `image-proxy` / `audio-proxy` chỉ host Google + Drive id, cache LRU giới hạn            | ✅ `09ee212`                                                                  |
| A2  | Rate limiter ưu tiên `X-Real-IP` (Traefik), phần tử cuối `X-Forwarded-For`              | ✅ `09ee212`                                                                  |
| A3  | `/api/phone` whitelist tab, `refresh=true` chỉ admin, cache giới hạn                    | ✅ `09ee212` (bản sửa lại)                                                    |
| A4  | Ghi Sheet `RAW`; validate `source` waitlist                                             | ✅ `09ee212`                                                                  |
| A5  | Dữ liệu ghi file → Supabase                                                             | ⏳ brief mục 4.4                                                              |
| A6  | Rotate key `.env`, `git rm --cached .env`, thêm `.env` vào `.gitignore`/`.dockerignore` | ⏳ chủ dự án                                                                  |
| A7  | CI/Docker pnpm pinned, bỏ `package-lock.json`                                           | ✅ `09ee212`                                                                  |
| A8  | `middleware.ts` → `proxy.ts`, bỏ qua file tĩnh và proxy media                           | ✅ `cc8ab02`                                                                  |
| A9  | `is_admin()` sang schema `private`                                                      | ✅ migration `25_private_is_admin.sql` viết xong, chờ chủ dự án duyệt và chạy |
| A10 | Room sync đóng channel/timer khi unmount, auto-connect một lần                          | ✅ `09ee212`                                                                  |
| A11 | `requireAdminAuth` không còn là server action công khai                                 | ✅ `09ee212` (bản sửa lại)                                                    |

Ghi chú bảo mật còn lại (ưu tiên thấp):

- `docker-compose.yml` publish cổng `3000:3000` ra ngoài → có thể gọi app bỏ qua Traefik và giả `X-Real-IP`. Cân nhắc `127.0.0.1:3000:3000`.
- Bucket `avatars` chỉ admin ghi (migration 21); app chưa có luồng upload avatar.
- Bật Leaked Password Protection trên Supabase Dashboard → Auth.

---

## 7. Nhóm B — Checkpoint theo `kind` + chấm điểm trên server

Gộp với "ẩn đáp án": hiện `/api/checkpoints` trả `answer_config`, `ai_*` cho mọi người; RLS cho anon SELECT `case_checkpoints`; client tự so đáp án.

### B1. Baseline E2E — ✅ `7d20787`

`e2e/case-000.spec.ts`, 8 kịch bản (`pnpm test:e2e`, ~1 phút):

1. Bàn điều tra tải `/api/characters` (10 nhân vật), `/api/checkpoints`, các ghim chính.
2. Sổ tay mở từ toolbar.
3. Tra 3 SĐT: sai (Mai/Hà/Vy) không mở; đúng (Vũ/Tùng/Đạt) → `phone_solved`.
4. Thẩm tra mã sai (`B-99`) không được ghi nhận.
5. Vũ: động cơ `A-12`, `0988200991`; mâu thuẫn `A-18`; câu hỏi phụ `21:15` (sai `20:00` bị từ chối).
6. Tùng: động cơ `A-10`, `A-11`; mâu thuẫn `A-09`; trắc nghiệm "KHÔNG" đúng, "CÓ" sai.
7. Hà: động cơ `0978552109`, `0984112568`; mâu thuẫn `voice_phone_0984112568`, `C-01`, `A-23`; mật khẩu `120713` (sai `000000` bị từ chối).
8. Cáo trạng: "Lê Quang Vũ" bị từ chối; "Trần Thị Hà" + "Mâu thuẫn tình cảm" + `C-02, D-04, D-05` → `indictment_solved`, culprit `ha`.

Ghi chú:

- Mock `/api/test-scan-answer` (không gọi Gemini). Chưa phủ: Hậu án (L1), chơi nhóm, khám xét 360, điện thoại nạn nhân.
- Lỗi phát hiện khi viết baseline: (1) ✅ trắc nghiệm so id `khong_tin` với nhãn "KHÔNG"; (2) L1 Hậu án rỗng; (3) L2 font sai dấu.

### B2. Schema — ✅ `079af56`

Cột `kind`, `subject_key` (`db/schema/26_checkpoint_kind.sql`). Đã cập nhật `createNewCase` seed node theo `kind`. Query route `/api/checkpoints` có fallback khi DB chưa chạy migration.

### B3. Kiểu cấu hình theo kind — ✅ `079af56`

`lib/checkpoints/kinds.ts`: discriminated union theo `kind`, `parseCheckpointConfig`, `validateCheckpointConfig`. Mapper `lib/cms/checkpoint-runtime.ts` đã map `epilogueStories`, `kind`, `subjectKey`. Sửa L1 (Hậu án hiển thị 4 phần đầy đủ). E2E baseline 9/9 pass.

### B4. Editor Studio theo kind — ⏳

Thư mục `components/admin/checkpoint-studio/sections/`:

- `phone_lookup`: danh sách ô `textMatchInputs` (label, placeholder, validAnswers).
- `suspect_interrogation`: chọn nghi phạm từ `case_characters` (role `suspect`); chọn mã chứng cứ từ tab `evidences` (`/api/phone?tab=evidences&caseId=`), nhóm bắt buộc/tùy chọn; context AI.
- `followup`: checkpoint cha (nối trên Flow view), dạng time/choice/code/text, `correctAnswer`, `options`, `photoCodes`.
- `indictment`: `validSuspects` từ nhân vật, `requiredEvidenceIds`, phương án động cơ (`validMotives`, `options`).
- `epilogue`: danh sách `epilogueStories` (title, monologue).

### B5. Chấm điểm trên server — ⏳

- Env server-only `SUPABASE_SERVICE_ROLE_KEY` (`.env.example`, README, VPS); `lib/supabase/admin.ts` (không import vào client).
- View `case_checkpoints_public` (không có `answer_config`, `ai_*`), GRANT anon; bỏ policy anon SELECT bảng gốc (`db/schema/18_...`); `/api/checkpoints` đọc view.
- `POST /api/checkpoints/verify` `{caseId, checkpointId, answer | selectedCodes | inputs}` → chấm theo kind trên server, rate limit, trả `{correct, feedback, unlocks}`.
- `/api/test-scan-answer` nhận `checkpointId`, đọc `ai_context` từ DB, không nhận `context` từ client; giới hạn độ dài; lỗi AI → chấm sai (hiện `add-suspect-modal.tsx` chấm đúng khi lỗi).

### B6. Refactor runtime gameplay — ⏳

File: `canvas/pin-builder.ts`, `main-investigation-canvas.tsx`, `canvas/use-investigation-state.ts`, `add-suspect-modal.tsx`, `followup-question-modal.tsx` (+ `followup/*`), `indictment-modal.tsx`, `phone-lookup-modal.tsx`, `phone-narrative-modal.tsx`, `culprit-epilogue-modal.tsx`, `custom-pin-modal.tsx`, `hint-modal.tsx`, `dossier-result-modal.tsx`, `lib/hooks/use-case-narratives.ts`.

- Tìm checkpoint theo `kind` + `subject_key`, bỏ dò chuỗi ID (`-0`, `phone`, `-2b`, `cp-000-*`).
- Xóa đáp án hardcode: `'21:15'`, `'120713'` (fallback trong `followup-question-modal.tsx`), `"VALID_ANSWER"` (`app/(investigation)/board-stage/page.tsx`), mã case_000 tự cộng vào cáo trạng (`indictment-modal.tsx`), `DEFAULT_PHONE_INPUTS`, `DEFAULT_NARRATIVES`.
- `CulpritKey "vu"|"tung"|"ha"` → `character.key`; gating `isVu/isTung/isHa` → theo checkpoint.
- Bỏ registry `lib/cases/case-characters.ts` → `useCaseCharacters()`; đổi tên `case-000-suspects.ts` / `case-000-clues.ts` → `characters.ts` / `clues.ts`.
- `lib/ai/suspect-interrogation-context.ts` (`CASE_000_INTERROGATION_CRITERIA`) → dùng `ai_context` của checkpoint.
- E2E phải giữ 8/8 (sửa locator nếu đổi chữ nút, không đổi kịch bản).

### B7. Docs — ⏳

`19_checkpoint_studio.md`, `02_database_schema.md`, `CHANGELOG.md`, `TECHDEBT.md` #14.

---

## 8. Nhóm C — Tiến trình theo đồ thị & công cụ biên tập (sau B)

1. **Mở khóa theo đồ thị:** runtime đọc `depends_on`, `unlocksDossier`, `case_dossiers.document_codes`; bỏ suy phase từ chữ cái đầu mã tài liệu (`app/(investigation)/evidence/web/page.tsx`).
2. **Case lint** trong Studio: node không tới được, cycle, checkpoint thiếu đáp án, mã chứng cứ không có trên `evidences`, nghi phạm chưa có checkpoint thẩm tra, vụ thiếu nạn nhân.
3. **Nhân bản vụ án làm template:** `duplicateCase` copy cả `case_checkpoints`, `case_dossiers`, `case_characters`, `dossier_documents` (hiện chỉ metadata).
4. **Chơi thử từ node X:** Studio ghi tiến trình giả theo `caseStorageKey` rồi mở `/evidence/web?case_id=`.
5. **Bàn điều tra theo vụ:** `pin-builder` dựng pin gốc từ nhân vật + checkpoint; `board-stage`, `evidence/boardgame`, `evidence/[id]` nhận `case_id`; ghi lại `boardgame_pins` dạng `case_000` rồi thêm FK → `cases.slug`.
6. **Tài nguyên theo vụ:** bỏ `CASE_000_PDFS`/`CASE_000_EVIDENCE` (`components/investigation/evidence/evidence-data.ts`) → `dossier_documents`; ảnh 360/hotspots theo slug; bỏ chữ "Khang" trong `messages-app.tsx`, `phone-app.tsx`, `photos-app.tsx`; dời asset dùng chung khỏi `public/images/cases/case_000/`; `/api/phone` không trả row thiếu `case_id` cho mọi vụ.
7. **`/activate` đọc bảng `cases`** (bỏ `CASES_CATALOG` tĩnh và luật "mã ≥ 4 ký tự là hợp lệ") — làm cùng License (`TECHDEBT.md` #09).

---

## 9. Nhóm D — Hiệu năng & chất lượng code

| #   | Việc                                                                                         | Trạng thái       |
| --- | -------------------------------------------------------------------------------------------- | ---------------- |
| D1  | Landing tải lười R3F (`landing-keyhole-geometry.ts` tách hằng số)                            | ✅ `cc8ab02`     |
| D2  | `ReinvestigationModal` qua `next/dynamic` (4 chỗ). `recharts`/`@xyflow` chỉ ở admin → bỏ qua | ✅ `cc8ab02`     |
| D3  | Nén ảnh PNG lớn → WebP                                                                       | ⏳ brief mục 4.4 |
| D4  | Đọc localStorage sau mount (Checkpoint Studio)                                               | ✅ `cc8ab02`     |
| D5  | `lib/google/auth.ts` gộp 3 bản `createGoogleAuth`                                            | ✅ `db73360`     |
| D6  | `import type` 13 chỗ                                                                         | ✅ `db73360`     |
| D7  | Giảm `any` (~226)                                                                            | ⏳ brief mục 4.4 |
| D8  | Tách `hero-interactive.tsx`, `map-studio-client.tsx`                                         | ⏳ brief mục 4.4 |
| D9  | `Scene360Viewer` dispose texture/material                                                    | ✅ `cc8ab02`     |
| D10 | `user-nav` memo Supabase client                                                              | ✅ `cc8ab02`     |
| D11 | Gộp hàm bỏ dấu tiếng Việt (~11 chỗ) → `lib/text.ts`                                          | ⏳ brief mục 4.4 |

`map-studio-client.tsx` (1.500 dòng) điểm tách: `useMapDraft` (autosave localStorage), `useHistory` (undo/redo), tiện ích lưới snap + đổi tọa độ, `useMapTools` (pointer/vẽ), phím tắt, `useViewportCulling`.

---

## 10. Nhóm E — Dọn repo

- ✅ Bỏ track `scripts/*.json`, `scripts/__pycache__/`, `data/maps/*.backup*.json` (`db73360`).
- ⏳ Chia `scripts/` → `ops/` và `archive/` (brief mục 4.4).
- ⏳ `world_vector_map.json` và `case_000_vector.json` trùng hoàn toàn; bỏ bản legacy khi xong A5.
- ⏳ `archive_3d_vault/` + `/cabinet-demo`: chủ dự án quyết (AGENTS.md §8).
- ⏳ `components/investigation/evidence/evidence-theme-context.tsx` chưa có ai dùng → hỏi chủ dự án.

---

## 11. Việc chỉ chủ dự án làm được

1. Push và theo dõi deploy (mục 5).
2. Rotate toàn bộ key trong `.env` (Supabase, Gemini, Google service account, Firebase...), sau đó cho phép `git rm --cached .env`.
3. Bật Leaked Password Protection (Supabase Dashboard → Auth → Password security).
4. Duyệt và chạy migration 24 (A5), 25 (A9), 26 (B2).
5. Quyết định `archive_3d_vault`, `evidence-theme-context.tsx`.
6. Restart dev server cổng 3000 (`rm -rf .next/dev/cache`).
