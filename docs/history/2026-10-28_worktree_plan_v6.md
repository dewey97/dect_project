# Plan thực thi v6 — nhánh `main` (2026-10-28)

> **Lưu trữ (2026-10-29).** Plan B26/B27 đã xong. Quy ước, ngân sách kiểm thử, mẫu worktree/báo cáo chuyển sang [`../process/workflow.md`](../process/workflow.md); việc tiếp theo sang [`../ROADMAP.md`](../ROADMAP.md).

> Bản duy nhất còn hiệu lực. Các bước B0–B25 đã xong và đã bỏ khỏi file này; nội dung cũ xem bằng `git show 1179a99:docs/ROADMAP.md`, báo cáo cũ trong lịch sử git của `docs/reports/`.
> Quy ước chung: `AGENTS.md` (global + dự án). Studio và trường dữ liệu: `docs/studio/authoring_guide.md`. Nợ kỹ thuật: `docs/TECHDEBT.md`.

---

## Trạng thái (2026-10-28)

- **Đã xong B0–B25:** chuyển toàn bộ dữ liệu vụ án từ Google Sheets sang Supabase + Studio; tạo vụ mới từ số 0 chỉ bằng Studio rồi chơi tới hậu án (spec `e2e/case-v2-from-studio.spec.ts`); gộp Flow + Board dùng chung `useBoardModel` (B23/B24, merge `3ae0db2`); một canvas gameplay, `case-000` pass (B25).
- **Sau B25, chủ dự án chốt trong code:** giữ Flow view làm sơ đồ logic, gộp Studio nhân vật vào Checkpoint Studio, Evidence Studio vào Dossier Studio, thẩm tra 2 lớp.
- **B26 đang làm** (bảng dưới). Dọn code chết, gỡ Sheets CMS, gộp helper, xóa asset thừa: xong ở `1bbfc00..1179a99`.
- Đã push `b0fd1f3` (2026-10-28); GitHub Actions xanh 3 job (lint, build GHCR, deploy VPS + healthcheck). Chưa kiểm được trang public: `xplore.vn` chưa có DNS, IP VPS trả `404 page not found` (không phải Caddyfile trong repo) → A10.

---

## Truy cập Supabase production

- Key nằm ở `.env.local` (gitignore): `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN` (`sbp_…`), `SUPABASE_SERVICE_ROLE_KEY`, `ALLOW_E2E_PRODUCTION_SEED=true`.
- Không ghi key vào `.env` (đang bị track — A6), docs, code, commit, log, báo cáo. Không `cat` `.env.local`.
- Chạy SQL: `node scripts/ops/run-sql.mjs <file.sql>` (tự nạp `.env.local`, trả `201` khi thành công).
- Quy trình migration: (1) backup bảng bị đụng; (2) báo chủ dự án trước khi chạy; (3) chạy file; (4) truy vấn kiểm; (5) ghi lệnh + kết quả vào báo cáo. Lỗi → dừng, không sửa tay trên production.
- **Thứ tự migration bỏ cột:** production chạy code của `origin/main`. Chỉ bỏ cột **sau khi** đã push và deploy code không còn đọc cột đó.
- E2E ghi production chỉ với slug `e2e_`, globalSetup/teardown dọn DB + Storage `e2e/`.

---

## Ngân sách kiểm thử cho AI thực thi

| Khi nào                    | Chạy gì                                                                                               | Không chạy                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Trong lúc sửa code         | `pnpm lint` 1 lần khi xong một mục + **chỉ spec liên quan**: `npx playwright test e2e/<spec>.spec.ts` | Cả bộ `pnpm test:e2e`                |
| Kiểm 1 đoạn trong spec dài | `-g "<tên test>"`                                                                                     | Chạy lại cả spec nhiều lần để dò lỗi |
| Bước yêu cầu "ổn định"     | `--repeat-each` đúng số plan ghi, 1 lần                                                               | Lặp thêm "cho chắc"                  |
| Hết bước B                 | `pnpm test:e2e` 1 lần (chạy 1 lần làm nóng trước nếu `.next` vừa xóa)                                 | Chạy 2–3 lần cả bộ                   |
| Spec fail                  | Đọc lỗi + trace, sửa nguyên nhân, chạy lại **chỉ spec đó**                                            | Chạy lại cả bộ "xem có tự hết không" |

- Tìm lỗi bằng đọc code / grep / lint trước; Playwright chỉ để xác nhận.
- Không chạy E2E song song với người khác trên cùng cổng (3101): `scripts/ops/ensure-e2e-port.mjs` sẽ kill tiến trình bên kia.
- Tổng thời gian Playwright cho một bước B ≤ 20 phút; vượt thì dừng, ghi lý do, hỏi chủ dự án.
- Báo cáo: dán dòng tổng kết thật của mỗi lần chạy, kể cả lần fail. Không ghi "đạt" khi chưa chạy. Cấm `test.skip`/`fixme`/nới `expect` để test xanh.

---

## B26 — dọn sau audit DB/Studio/cấu trúc (2026-10-28)

Nguồn: `docs/history/2026-10-28_audit_db_studio_structure.md`. Làm trên `main`, mỗi mục 1 commit, không push.

| #     | Mức     | Việc                                                                                                                                                                                                                                                                                                                         | Tiêu chí done                                                                         | Trạng thái                                                                                  |
| ----- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| B26-1 | 🔴      | Bản đồ: nạp `world_vector_map.json` vào `map_vectors`, xóa dữ liệu tĩnh và file trùng                                                                                                                                                                                                                                        | —                                                                                     | ⏭ Chuyển `docs/TECHDEBT.md` #18, chủ dự án tự xử lý                                         |
| B26-2 | 🔴 Cao  | `app/api/test-scan-answer/route.ts`: bắt buộc đăng nhập (401 nếu chưa), giới hạn tần suất theo user (vd 20 lần/phút, dùng `lib/security/rate-limiter.ts`). Đổi tên route thành `/api/scan-answer`, sửa chỗ gọi trong `add-suspect-modal.tsx`                                                                                 | `curl -X POST /api/scan-answer` không cookie → 401; `case-000` pass                   | ✅ `7462ebd`: không bắt đăng nhập (người chơi ẩn danh), thay bằng giới hạn 10 lần/phút/IP + giới hạn độ dài input; đổi tên `/api/scan-answer`. Backlog: chuyển bối cảnh chấm lên server, client chỉ gửi câu trả lời |
| B26-3 | 🟠      | Flow view                                                                                                                                                                                                                                                                                                                    | —                                                                                     | ✅ Chốt giữ Flow; `off-board-tray.tsx` đã xóa                                               |
| B26-4 | 🟠      | Xóa code chết                                                                                                                                                                                                                                                                                                                | —                                                                                     | ✅ 14 file (`1bbfc00`); giữ `lib/case-locations-data.ts`, `data/maps/`, `archive_3d_vault/` |
| B26-5 | 🟠 TB   | `case_checkpoints`: bỏ `unlocked_evidence_id`, `suspect_label`, `evidence_step_label`; đổi mọi chỗ đọc `type` sang `question_type` (`mcq` → `choice`), rồi bỏ cột `type`. Code trước (sửa `app/api/checkpoints/route.ts`, `lib/types/database.ts`, `lib/types/checkpoint-studio.ts`), migration 46 **sau khi push + deploy** | `information_schema.columns` không còn 4 cột; `case-000` + `case-v2-from-studio` pass | ✅ Code `a99c2d5`; migration 46 đã chạy production 2026-10-28 sau deploy `b0fd1f3` (tạo lại view `case_checkpoints_public` không có 3 cột, giữ `security_invoker`, quyền anon). Không backup (3 cột rỗng, kiểm 0 dòng trước khi chạy). Cột `type` giữ → backlog |
| B26-6 | 🟡 Thấp | DB nhỏ: bỏ unique thừa `dossier_documents_case_id_mode_tag_code_key`; bỏ `case_dossiers.flow_position`, `case_board_nodes.checkpoint_id`; chuyển nhân vật thiếu `avatar_url` rồi bỏ `case_characters.avatar_code`; xóa `boardgame_pins_backup_b23` sau smoke test production. Cùng quy tắc thứ tự migration như B26-5        | Truy vấn đếm cột/ràng buộc khớp                                                       | ⏳                                                                                          |
| B26-7 | 🟡      | Gộp helper trùng, gỡ Sheets CMS                                                                                                                                                                                                                                                                                              | —                                                                                     | ✅ `0145ecc`, `37b23d8`; giữ `export:docs-pdf` và `/api/waitlist`                           |
| B26-8 | 🟡 Thấp | Asset: còn nén `public/images/cases/case_000/PANORAMA.png` (10 MB) sang JPG/WebP ≤ 2 MB, sửa đường dẫn trong `cases.panorama_url`/code                                                                                                                                                                                       | Khám xét lại hiện trường vẫn mở ảnh 360                                               | ✅ `af234f3`: `cases.panorama_url` case_000 → `PANORAMA.webp` (480 KB, đã có trên production), xóa `PANORAMA.png` 10 MB |
| B26-9 | 🔴 Cao  | Chạy lại E2E sau đợt dọn: `case-000`, `studio-ux`, rồi `pnpm test:e2e` 1 lần. Spec `case-000` chờ 10 nhân vật nhưng production có 9: xác định spec sai hay dữ liệu thiếu, sửa đúng bên                                                                                                                                       | Dòng tổng kết 0 fail                                                                  | ✅ `2ba1992` + B27 |
| B27 | 🔴 Cao | Cập nhật 5 spec theo UI Studio mới (sau `c2a125d`, `846b056`, `8cc6616`): `case-v2-from-studio` (tạo nhân vật trong Checkpoint Studio thay vì `/studio/characters`), `character-avatar` (tải ảnh trong form nhân vật), `evidence-studio` (vật chứng trong Dossier Studio), `board-flow-unified` + `board-studio` (bảng nổi, bỏ khay Ngoài bảng). Cấm skip/nới expect | `pnpm test:e2e` 0 fail | ✅ `6b0b029`, `f862ffa`: `pnpm test:e2e` **47 passed / 0 failed (6.3m)**. Sửa 3 lỗi Studio lộ ra khi chạy spec v2: (1) thẩm tra của nghi phạm mới không lưu (id tạm `temp_…` gây lỗi uuid, bị nuốt im lặng); (2) "Thêm Checkpoint" không chuyển inspector sang tab Checkpoint; (3) câu hỏi phụ tạo trong Studio (không có `subject_key`) mở nhầm checkpoint thẩm tra khi chơi |

Backlog (không làm trong B26): đổi tên `case_id` → `case_slug`; tách nội dung khỏi `boardgame_pins`; gộp `panorama_url`/`scene_360_url` (chờ chủ dự án); tách file > 1.000 dòng; trang tiến độ vụ trên `/studio/cases/[slug]`; mẹo chờ 800 ms ở `app/(admin)/studio/cases/[slug]/page.tsx`.

**Prompt giao việc B26 (phần còn lại):**

```
Đọc docs/history/2026-10-28_audit_db_studio_structure.md, docs/ROADMAP.md mục "Truy cập Supabase production", "Ngân sách kiểm thử cho AI thực thi" và bảng "B26". Làm trên main.
Làm B26-9 trước, rồi B26-2, phần code của B26-5, B26-8; mỗi mục 1 commit, không push.
KHÔNG chạy migration bỏ cột (B26-5, B26-6) khi chưa push và deploy: chỉ viết file db/schema/46_*.sql, ghi lệnh backup + kiểm vào báo cáo.
Báo cáo docs/reports/B26_REPORT.md: git log --oneline 1179a99..HEAD, dòng tổng kết Playwright thật. Không làm live cursor, không đụng dữ liệu bản đồ.
```

---

## Việc tiếp theo

| #   | Việc                                                                                     | Ai                | Ghi chú                                                                |
| --- | ---------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| 1 | Chỗ hở Studio: không còn giao diện đặt hotspot khám xét hiện trường (editor cũ nằm trong Evidence Studio đã gỡ; `saveReinvestigationHotspots` vẫn còn) và không còn nút tạo ghim tự do (`handleCreateNewCustomNode` không ai gọi) | Chủ dự án quyết | Vụ mới hiện không đặt được hotspot / ghim tự do |
| 2   | Review B26                                                                               | Reviewer          |                                                                        |
| 3 | DNS `xplore.vn` + edge proxy trên VPS (IP trả `404 page not found`), rồi smoke test public | Chủ dự án | Thuộc A10 |
| 4 | Migration B26-6 (bỏ cột/ràng buộc nhỏ, xóa `boardgame_pins_backup_b23`) | AI thực thi | B26-5 đã chạy |
| 5   | Bản đồ (`TECHDEBT.md` #18)                                                               | Chủ dự án         | Bảng `map_vectors` production đang rỗng → app Bản đồ trống             |
| 6   | A6: xoay key trong `.env`, `git rm --cached .env`, thêm vào `.gitignore`/`.dockerignore` | Chủ dự án         | `.env` đang bị track                                                   |
| 7   | A10: checklist VPS `deploy/INFRA_HANDOFF_CHECKLIST.md`                                   | Chủ dự án         | Cần quyền VPS                                                          |
| 8   | B15-12: giữ hay bỏ 6 vụ tĩnh trên `/activate`                                            | Chủ dự án         |                                                                        |
| 9   | **Live cursor** — `docs/plans/2026-10-25_live_cursor_group_play.md`          | AI thực thi       | ⛔ Chưa giao: cần push + smoke test + xác nhận gói Supabase (Free/Pro) |

---

## Mẫu worktree (khi cần làm song song với chủ dự án)

| Mục         | Giá trị                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tạo         | `git worktree add ../dect_wt_<tên> -b wt/<tên> main`; `pnpm install` (không dùng junction `node_modules`); copy `.env`, `.env.local` (không commit) |
| Cổng        | dev 3112, E2E 3113 (không dùng 3000/3100/3101)                                                                                                      |
| Commit      | chỉ vào nhánh `wt/<tên>`, không push                                                                                                                |
| Vùng sở hữu | Liệt kê file/thư mục trong plan; chạm ngoài vùng → ghi mục "Chạm ngoài vùng" trong báo cáo                                                          |
| Bàn giao    | merge `main` mới nhất vào nhánh, chạy spec liên quan + `pnpm test:e2e` 1 lần (cổng 3113)                                                            |
| Dọn         | Reviewer merge, rồi `git worktree remove`, `git branch -d`. Xóa thư mục còn sót bằng `cmd /c rmdir /s /q` sau khi kiểm không có junction            |

---

## Mẫu báo cáo

```md
## Báo cáo B<N> — <ngày>

**Commit:** <dán git log --oneline <base>..HEAD>

### Kiểm tra

| Lệnh | Dòng tổng kết thật |
| `pnpm lint` | exit 0 / lỗi |
| `npx playwright test …` | X passed / Y failed / Z skipped (thời gian) |

### Migration / việc chủ dự án cần làm

### Chạm ngoài vùng / lệch khỏi plan

### Còn lại / rủi ro
```
