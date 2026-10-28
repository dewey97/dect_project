# Quy trình làm việc — quy ước, kiểm tra, bàn giao

> Cho người làm tiếp (người hoặc AI agent). Gộp từ `HANDOFF_ROADMAP.md` và `WORKTREE_PLAN.md` (bản cũ: [`../history/2026-10-28_worktree_plan_v6.md`](../history/2026-10-28_worktree_plan_v6.md), `git log -- docs/process/workflow.md`).
>
> Đọc trước: [`AGENTS.md`](../../AGENTS.md) (global + dự án), [`../ROADMAP.md`](../ROADMAP.md) (trạng thái, việc tiếp theo), [`../architecture/codebase_architecture.md`](../architecture/codebase_architecture.md).

---

## 1. Quy ước bắt buộc

- Tiếng Việt cho tài liệu và trao đổi.
- **Không tự `git push`.** Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`).
- Chỉ dùng **pnpm**.
- Không `next/font/google` (§11); `import type` cho type (§12); không `autoFocus` / `.focus()` khi mở modal (§3).
- Không sửa dữ liệu vụ án bằng SQL tay; dùng Studio.
- Đáp án checkpoint không bao giờ gửi xuống client. Chấm điểm mới đi qua `/api/checkpoints/verify`.

---

## 2. Lệnh kiểm tra

| Mục đích          | Lệnh                                                          | Lưu ý                                                                                    |
| ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Typecheck         | `pnpm lint` (`tsc --noEmit -p tsconfig.typecheck.json`)       | 1 lần ở cuối việc                                                                        |
| E2E               | `pnpm test:e2e` hoặc `npx playwright test e2e/<spec>.spec.ts` | Dev server tự chạy cổng 3101 (`E2E_PORT` để đổi). Ghi production với slug `e2e_`, tự dọn |
| Build             | `NEXT_DIST_DIR=.next_dev npx next build`                      | Khi đổi cấu hình Next, routing, server action                                            |
| Sau khi chạy Next | `git checkout -- tsconfig.json next-env.d.ts`                 | Next tự sửa 2 file này                                                                   |

- Next 16 chỉ cho **một** dev server mỗi thư mục. Dừng preview (cổng 3100) trước khi chạy E2E.
- Đổi tên / xóa route hoặc thư mục: xóa `.next` và `.next_dev`. Cache Turbopack cũ làm mọi route trả 404.
- Không build vào thư mục không gitignore khi dev server đang chạy (Tailwind quét cả repo).
- Cổng: chủ dự án 3000; preview 3100; E2E 3101; worktree 3112/3113.

### 2.1. Ngân sách kiểm thử

| Khi nào                    | Chạy gì                                                         | Không chạy                     |
| -------------------------- | --------------------------------------------------------------- | ------------------------------ |
| Trong lúc sửa              | `pnpm lint` khi xong một mục + chỉ spec liên quan               | Cả bộ `pnpm test:e2e`          |
| Kiểm 1 đoạn trong spec dài | `-g "<tên test>"`                                               | Chạy lại cả spec nhiều lần     |
| Trước khi push             | `pnpm test:e2e` 1 lần (chạy làm nóng trước nếu `.next` vừa xóa) | Chạy 2–3 lần cả bộ             |
| Spec fail                  | Đọc lỗi + trace, sửa nguyên nhân, chạy lại chỉ spec đó          | Chạy lại "xem có tự hết không" |

- Tìm lỗi bằng đọc code / grep / lint trước; Playwright để xác nhận.
- Spec fail: chạy cùng spec trên commit trước (`git stash`) để tách lỗi do code mới hay do dữ liệu production.
- Không chạy E2E song song trên cùng cổng: `scripts/ops/ensure-e2e-port.mjs` kill tiến trình bên kia.
- Cấm `test.skip` / `fixme` / nới `expect` để test xanh.

---

## 3. Điều kiện "done"

1. `pnpm lint` sạch.
2. Spec liên quan pass; trước push: `pnpm test:e2e` 1 lần, không fail mới, không skip mới.
3. Đổi cấu hình Next / routing: `next build` pass.
4. Diff tối thiểu; không đổi hành vi ngoài phạm vi.
5. Đổi UI người chơi thấy → kiểm trên trình duyệt (1440×900 và 375×812).
6. Cập nhật tài liệu theo ma trận Code-Doc Sync (`AGENTS.md` global §5) và `CHANGELOG.md`.
7. Commit, không push. Báo cáo theo mẫu mục 8.

---

## 4. Supabase production

- Key ở `.env.local` (gitignore): `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOW_E2E_PRODUCTION_SEED=true`. Không ghi key vào docs, code, commit, log. Không `cat` `.env.local`.
- Chạy SQL: `node scripts/ops/run-sql.mjs <file.sql>`.
- Migration: (1) backup bảng bị đụng; (2) báo chủ dự án; (3) chạy; (4) truy vấn kiểm; (5) ghi lệnh + kết quả vào báo cáo. Lỗi → dừng.
- **Thứ tự:** production chạy code `origin/main`. Migration bỏ cột / bỏ quyền chỉ chạy **sau khi** đã push và deploy code không còn cần cột / quyền đó (ví dụ migration 46, 48).
- `/api/checkpoints` và `/api/checkpoints/verify` cần `SUPABASE_SERVICE_ROLE_KEY`. Thiếu ở local thì dùng anon key và, sau migration 48, nhận 0 checkpoint.

---

## 5. Review khi AI khác bàn giao

1. `git log --oneline <base>..HEAD`, `git diff <base>..HEAD --stat`: chặn diff phình bất thường.
2. Đọc diff + grep + `pnpm lint` trước; chỉ chạy spec bị đụng; cả bộ 1 lần trước push.
3. Kiểm bằng chứng thật: hash có trong `git log`, dòng tổng kết Playwright có thật, không `test.skip` mới (`git diff <base> -- e2e | grep -n "skip\|fixme"`).
4. Đọc theo thứ tự rủi ro: ranh giới server/client → API route → RLS/migration → gameplay → UI.
5. Khẳng định "dead code": kiểm bằng đồ thị import từ route entry, không bằng grep tên. Bản audit SPEC-22 đầu tiên đề xuất xóa `hero-interactive/` đang chạy.

### 5.1. Bài học

| Sai lầm                                                                            | Hậu quả                                                                   | Cách tránh                                                          |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Báo cáo ghi "đạt" khi chưa chạy, hash tự bịa, cờ ready gắn cứng                    | Lỗi thật bị che                                                           | Tiêu chí done phải chạy được; reviewer tự chạy lại                  |
| Đổi `test(...)` thành `test.skip(...)`                                             | Mất bằng chứng chính                                                      | Cấm skip; review grep `skip` trong diff `e2e/`                      |
| Mount cả workspace mobile và desktop, giấu bằng CSS                                | 2 canvas trong DOM, test click bản ẩn                                     | Chọn 1 bản theo `isMobile` sau mount                                |
| Worktree dùng junction `node_modules`                                              | Turbopack: `Symlink … points out of the filesystem root`                  | `pnpm install` thật trong worktree                                  |
| Chạy E2E ngay sau khi xóa `.next`                                                  | Mọi trang 404 lần đầu                                                     | Chạy 1 lần làm nóng                                                 |
| Bỏ cột DB trước khi deploy code mới                                                | Production lỗi                                                            | Push + deploy trước, migration sau                                  |
| Bỏ `'use server'` khỏi module client còn import                                    | Build hỏng                                                                | `grep -rn "<module>" app components` trước khi đổi ranh giới        |
| "Chấm server" nhưng API vẫn gửi `answer_config`, client chấm đè khi server nói sai | Đáp án lộ, đáp án sai vẫn qua                                             | Lọc allowlist ở API; client không giữ đáp án, không chấm            |
| Route AI nhận tiêu chí chấm từ client                                              | Proxy LLM mở cho mọi prompt                                               | Server tự đọc tiêu chí theo `checkpointId`                          |
| Default prop `caseId = "case_000"`                                                 | Trang quên truyền `caseId` âm thầm đọc case_000 (`/evidence/boardgame`)   | `caseId` bắt buộc; chỉ route entry fallback                         |
| Mã bypass chấp nhận ở mọi môi trường                                               | Người chơi gõ `000` là qua                                                | Chỉ dev hoặc session admin                                          |
| Sửa file bằng script đọc/ghi mặc định                                              | File `\r\r\n` bị giãn dòng; chuỗi `\b` trong Python thành ký tự backspace | Đọc/ghi bytes khi file có line ending lạ; dùng raw string cho regex |
| Upsert `onConflict` khi RLS anon chỉ cho INSERT                                    | Lỗi RLS 42501                                                             | `ignoreDuplicates: true` hoặc INSERT thuần                          |
| Playwright so chữ chính xác trên nút CSS `uppercase`                               | Không tìm thấy nút                                                        | Regex không phân biệt hoa thường                                    |
| Spec chọn ô nhập theo placeholder                                                  | Studio đổi placeholder, spec gãy                                          | Gắn `aria-label`, spec dùng `getByRole`                             |

---

## 6. Deploy và smoke test (chủ dự án)

1. Env VPS có `SUPABASE_SERVICE_ROLE_KEY` (`docker compose exec app env | grep SUPABASE`).
2. `git push origin main` → GitHub Actions (`preflight`, `build-and-push`) → VPS pull image, restart container ([`../ops/cicd_deployment.md`](../ops/cicd_deployment.md)).
3. Chạy migration đang chờ (xem [`../ROADMAP.md`](../ROADMAP.md)).
4. Smoke test production:
   - `/evidence/web?case_id=case_000`: intro → bàn điều tra → tra SĐT → mở điện thoại nạn nhân.
   - Thẩm tra 2 lớp một nghi phạm → câu hỏi phụ → bộ hồ sơ tương ứng mở trong khay.
   - Cáo trạng sai bị từ chối, đúng thì kết án; hậu án có nội dung.
   - Gõ `000` vào ô trả lời khi chưa đăng nhập admin → bị từ chối.
   - `GET /api/checkpoints?caseId=case_000` không chứa `correctAnswer`, `validAnswers`, `validSuspects`, `ai_context`.
   - `/studio/checkpoints?case=case_000`: chọn checkpoint, sửa thử rồi hoàn tác.
   - `/studio/cases`: nhân bản `case_000` → vụ mới đủ dữ liệu; xóa vụ nhân bản.
   - `POST /api/admin/map-vector` chưa đăng nhập → 401.
5. CI lỗi pnpm: kiểm `packageManager` trong `package.json`, `pnpm-workspace.yaml`.

---

## 7. Mẫu worktree

| Mục         | Giá trị                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Tạo         | `git worktree add ../dect_wt_<tên> -b wt/<tên> main`; `pnpm install`; copy `.env`, `.env.local` (không commit) |
| Cổng        | dev 3112, E2E 3113                                                                                             |
| Commit      | chỉ vào nhánh `wt/<tên>`, không push                                                                           |
| Vùng sở hữu | Liệt kê file/thư mục; chạm ngoài vùng → ghi trong báo cáo                                                      |
| Bàn giao    | merge `main` mới nhất vào nhánh, chạy spec liên quan + `pnpm test:e2e` 1 lần (cổng 3113)                       |
| Dọn         | Reviewer merge, `git worktree remove`, `git branch -d`; xóa thư mục sót bằng `cmd /c rmdir /s /q`              |

---

## 8. Mẫu báo cáo

```md
## Báo cáo <việc> — <ngày>

**Commit:** <git log --oneline <base>..HEAD>

### Kiểm tra

| Lệnh | Dòng tổng kết thật |
| `pnpm lint` | exit 0 / lỗi |
| `npx playwright test …` | X passed / Y failed / Z skipped (thời gian) |

### Migration / việc chủ dự án cần làm

### Chạm ngoài vùng / lệch khỏi plan

### Còn lại / rủi ro
```
