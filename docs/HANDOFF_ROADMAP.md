# Handoff Roadmap — quy ước, kiểm tra, bàn giao

> Tài liệu cho người làm tiếp (người hoặc AI agent). Viết lại gọn 2026-10-28; bản cũ (nhóm A–E, B1–B7, thiết kế bỏ hardcode) đã xong, xem bằng `git show 8a5a7d8:docs/HANDOFF_ROADMAP.md`.
>
> **Đọc theo thứ tự:** mục 1 (trạng thái) → mục 2 (quy ước) → mục 3 (điều kiện done) → việc cụ thể trong [`WORKTREE_PLAN.md`](WORKTREE_PLAN.md).
>
> Liên quan: [`AGENTS.md`](../AGENTS.md), [`docs/core_specs/21_studio_authoring_guide.md`](core_specs/21_studio_authoring_guide.md), [`docs/core_specs/02_database_schema.md`](core_specs/02_database_schema.md), [`docs/TECHDEBT.md`](TECHDEBT.md), [`CHANGELOG.md`](../CHANGELOG.md).

---

## 1. Trạng thái

Tiến độ (2026-10-28): B0–B25 xong; dữ liệu vụ án 100% trên Supabase, biên tập qua Studio; tạo vụ mới từ số 0 bằng Studio đã có spec E2E. B26 (dọn sau audit) đang làm. B26/B27 xong, `pnpm test:e2e` 47/47 pass; `main` chưa push (84 commit), đủ điều kiện push. Bản đồ (`map_vectors` rỗng) là `TECHDEBT.md` #18, chủ dự án giữ. Chi tiết và thứ tự việc: [`WORKTREE_PLAN.md`](WORKTREE_PLAN.md) mục "Việc tiếp theo".

---

## 2. Quy ước bắt buộc

### 2.1. Quy tắc dự án

- Tiếng Việt cho tài liệu và trao đổi. Đọc `AGENTS.md` (global + dự án) trước khi làm.
- **Không tự `git push`.** Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`).
- **Migration production:** chỉ theo [`WORKTREE_PLAN.md`](WORKTREE_PLAN.md) mục "Truy cập Supabase production" (backup trước, báo chủ dự án). Bỏ cột chỉ sau khi đã push + deploy code không còn đọc cột đó.
- Chỉ dùng **pnpm**.
- Không `next/font/google` (§11); `import type` cho type (§12); không `autoFocus`/`.focus()` khi mở modal (§3).
- Không sửa dữ liệu vụ án bằng SQL tay; dùng Studio.

### 2.2. Lệnh kiểm tra

| Mục đích          | Lệnh                                                          | Lưu ý                                                                                                                   |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Typecheck         | `pnpm lint` (`tsc --noEmit -p tsconfig.typecheck.json`)       | 1 lần ở cuối việc                                                                                                       |
| E2E               | `pnpm test:e2e` hoặc `npx playwright test e2e/<spec>.spec.ts` | Dev server tự chạy cổng 3101 (`E2E_PORT` để đổi). Ghi production với slug `e2e_`, tự dọn. Ngân sách: `WORKTREE_PLAN.md` |
| Build             | `NEXT_DIST_DIR=.next_dev npx next build`                      | Khi đổi cấu hình Next, routing, server action                                                                           |
| Sau khi chạy Next | `git checkout -- tsconfig.json next-env.d.ts`                 | Next tự sửa 2 file này                                                                                                  |

- Không build vào thư mục không gitignore khi dev server đang chạy (Tailwind quét cả repo, cache CSS sai). Chỉ dùng `.next` / `.next_dev`.
- Cổng: chủ dự án dev 3000; preview reviewer 3100; E2E 3101; worktree 3112/3113.

### 2.3. Kiến trúc cần nắm

- **Mã vụ án:** luôn qua `normalizeCaseId()` (`lib/cases/case-id.ts`) → dạng `case_000`. Gameplay `/evidence/web?case_id=<slug>`; Studio `?case=<slug>`.
- **Storage tiến trình:** `caseStorageKey(caseId, key)`. case_000 giữ key không tiền tố; vụ khác `<slug>::<key>`.
- **Nhân vật:** `CaseCharactersProvider` nạp `/api/characters` trước khi render bàn điều tra.
- **Quyền admin:** `requireAdminAuth()` / `checkIsAdmin()` ở `lib/auth/admin.ts` (server-only). Route Handler dùng `denyIfNotAdmin()` (`lib/security/admin-route-guard.ts`). RLS dùng `private.is_admin()`.
- **Bảng điều tra:** `useBoardModel` (`components/investigation/mindmap/canvas/use-board-model.ts`) dùng chung cho Studio và gameplay; vị trí ở `boardgame_pins` (desktop + `mobile_x/mobile_y`). Danh sách nút ghim ẩn `[data-pin-id]` phục vụ bàn phím, trình đọc màn hình và E2E — **không xóa**.
- **Chấm điểm:** server (`lib/checkpoints/server-grader.ts`, `/api/checkpoints/verify`), so đáp án theo giá trị đã normalize.
- **Sẵn sàng cho test:** trang Studio gắn `data-studio-ready="true"` khi tải xong và không đang lưu; bảng gameplay gắn `data-board-ready`.

---

## 3. Điều kiện "done" cho mọi việc

1. `pnpm lint` sạch.
2. Spec liên quan pass; trước báo cáo/push: `pnpm test:e2e` 1 lần, 0 fail, không skip mới.
3. Đổi cấu hình Next/routing: `next build` pass.
4. **Diff tối thiểu:** không viết lại cả file; không đổi hành vi ngoài phạm vi.
5. Đổi UI người chơi thấy → kiểm trên trình duyệt (1440×900 và 375×812).
6. Cập nhật tài liệu theo ma trận Code-Doc Sync (`AGENTS.md` global §5), `CHANGELOG.md` khi đổi tính năng.
7. Commit, **không push**. Báo cáo theo mẫu ở `WORKTREE_PLAN.md`.

---

## 4. Review khi AI khác bàn giao

1. `git log --oneline <base>..HEAD`, `git diff <base>..HEAD --stat`: chặn diff phình bất thường.
2. Đọc diff + grep + `pnpm lint` trước; chỉ chạy spec bị đụng; cả bộ 1 lần trước push.
3. Kiểm báo cáo với bằng chứng thật: hash có trong `git log`, dòng tổng kết Playwright có thật, không `test.skip` mới (`git diff <base> -- e2e | grep -n "skip\|fixme"`).
4. Đọc theo thứ tự rủi ro: ranh giới server/client → API route → RLS/migration → gameplay → UI.
5. Việc ngoài phạm vi thì hoàn tác. Ghi bài học mới vào 4.1.

### 4.1. Bài học (tránh lặp lại)

| Sai lầm                                                                                                        | Hậu quả                                                            | Cách tránh                                                                          |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Báo cáo ghi "đạt" khi chưa chạy, hash tự bịa, `isHa = false` / `data-studio-ready="true"` gắn cứng để lọt grep | Lỗi thật bị che                                                    | Tiêu chí done phải grep/chạy được; reviewer tự chạy lại                             |
| Đổi `test(...)` thành `test.skip(...)` để bộ test xanh (`dac5891`)                                             | Mất bằng chứng chính của mục tiêu                                  | Cấm skip/fixme/nới expect; review grep `skip` trong diff `e2e/`                     |
| Mount cả workspace mobile (ẩn bằng `lg:hidden`) và desktop (`99bdaa4`)                                         | 2 canvas trong DOM, `strict mode violation`, test click vào bản ẩn | Chọn 1 bản theo `isMobile` sau mount, không dùng CSS để giấu bản thứ 2              |
| Worktree dùng junction `node_modules` trỏ sang `main`                                                          | Turbopack: `Symlink … points out of the filesystem root`           | `pnpm install` thật trong worktree; gỡ junction bằng `cmd /c rmdir`, không `rm -rf` |
| Chạy E2E ngay sau khi xóa `.next`                                                                              | Mọi trang 404 lần đầu (cache Turbopack nguội)                      | Chạy 1 lần làm nóng, bỏ qua kết quả                                                 |
| Bỏ cột DB trước khi deploy code mới                                                                            | Production (code cũ còn `select` cột) lỗi                          | Push + deploy trước, migration bỏ cột sau                                           |
| Bỏ `'use server'` khỏi module client còn import                                                                | Build hỏng                                                         | `grep -rn "<module>" app components` trước khi đổi ranh giới server/client          |
| Grader dò chuỗi id để quyết định đúng/sai                                                                      | Chấm sai                                                           | So đáp án theo giá trị normalize                                                    |
| Fallback `SUPABASE_SERVICE_ROLE_KEY` → anon key                                                                | Mất tác dụng ẩn đáp án                                             | Throw khi thiếu env                                                                 |
| Upsert `onConflict` khi RLS anon chỉ cho INSERT                                                                | Lỗi RLS 42501                                                      | `ignoreDuplicates: true` hoặc INSERT thuần                                          |
| Playwright so chữ chính xác trên nút CSS `uppercase`                                                           | Không tìm thấy nút                                                 | Regex không phân biệt hoa thường                                                    |
| Chặn open redirect chỉ kiểm `//`                                                                               | `/\evil.com` lọt                                                   | Chặn mọi dấu `\`                                                                    |

---

## 5. Deploy và smoke test (chủ dự án)

1. Env VPS có `SUPABASE_SERVICE_ROLE_KEY` (`docker compose exec app env | grep SUPABASE`).
2. `git push origin main` → GitHub Actions (`preflight`, `build-and-push`) → VPS pull image, restart container.
3. Smoke test production:
   - `/evidence/web?case_id=case_000`: intro → bàn điều tra → tra SĐT → mở điện thoại nạn nhân.
   - Thẩm tra 2 lớp một nghi phạm → câu hỏi phụ → `/api/checkpoints/verify` trả 200.
   - Cáo trạng sai bị từ chối, đúng thì kết án; hậu án có nội dung.
   - `/studio/checkpoints?case=case_000`: chọn checkpoint, sửa thử rồi hoàn tác; bảng nổi hiện đúng.
   - `/studio/cases`: nhân bản `case_000` → vụ mới đủ nhân vật, checkpoint, hồ sơ; xóa vụ nhân bản.
   - `POST /api/admin/map-vector` chưa đăng nhập → 401.
4. CI lỗi pnpm: kiểm `packageManager` trong `package.json`, `pnpm-workspace.yaml`.

---

## 6. Việc chỉ chủ dự án làm được

1. Ra lệnh push và theo dõi deploy (mục 5).
2. A6: xoay toàn bộ key trong `.env` (Supabase, Gemini, Google service account, Firebase), rồi cho phép `git rm --cached .env`.
3. A10: checklist VPS `deploy/INFRA_HANDOFF_CHECKLIST.md`; bật Leaked Password Protection (Supabase → Auth → Password security).
4. Bản đồ thế giới (`TECHDEBT.md` #18).
5. Xác nhận gói Supabase (Free/Pro) trước khi giao live cursor.
6. Quyết `archive_3d_vault/` + `/cabinet-demo` (AGENTS.md §8); 6 vụ tĩnh trên `/activate`; gộp `panorama_url`/`scene_360_url`.
