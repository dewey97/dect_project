# Plan thực thi v6 — nhánh `main` (2026-10-28)

> Bản duy nhất còn hiệu lực. Các bước B0–B25 đã xong và đã bỏ khỏi file này; nội dung cũ xem bằng `git show 1179a99:docs/WORKTREE_PLAN.md`, báo cáo cũ trong lịch sử git của `docs/reports/`.
> Quy ước chung: `AGENTS.md` (global + dự án). Studio và trường dữ liệu: `docs/core_specs/21_studio_authoring_guide.md`. Nợ kỹ thuật: `docs/TECHDEBT.md`.

---

## Trạng thái (2026-10-28)

- **Đã xong B0–B25:** chuyển toàn bộ dữ liệu vụ án từ Google Sheets sang Supabase + Studio; tạo vụ mới từ số 0 chỉ bằng Studio rồi chơi tới hậu án (spec `e2e/case-v2-from-studio.spec.ts`); gộp Flow + Board dùng chung `useBoardModel` (B23/B24, merge `3ae0db2`); một canvas gameplay, `case-000` pass (B25).
- **Sau B25, chủ dự án chốt trong code:** giữ Flow view làm sơ đồ logic, gộp Studio nhân vật vào Checkpoint Studio, Evidence Studio vào Dossier Studio, thẩm tra 2 lớp.
- **B26 đang làm** (bảng dưới). Dọn code chết, gỡ Sheets CMS, gộp helper, xóa asset thừa: xong ở `1bbfc00..1179a99`.
- `main` hơn `origin/main` **75 commit, chưa push**. E2E sau đợt dọn chưa xác nhận (Supabase Auth timeout) → chạy lại trước khi push.

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

Nguồn: `docs/reports/AUDIT_2026-10-28_DB_STUDIO_STRUCTURE.md`. Làm trên `main`, mỗi mục 1 commit, không push.

| #     | Mức     | Việc                                                                                                                                                                                                                                                                                                                         | Tiêu chí done                                                                         | Trạng thái                                                                                  |
| ----- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| B26-1 | 🔴      | Bản đồ: nạp `world_vector_map.json` vào `map_vectors`, xóa dữ liệu tĩnh và file trùng                                                                                                                                                                                                                                        | —                                                                                     | ⏭ Chuyển `docs/TECHDEBT.md` #18, chủ dự án tự xử lý                                         |
| B26-2 | 🔴 Cao  | `app/api/test-scan-answer/route.ts`: bắt buộc đăng nhập (401 nếu chưa), giới hạn tần suất theo user (vd 20 lần/phút, dùng `lib/security/rate-limiter.ts`). Đổi tên route thành `/api/scan-answer`, sửa chỗ gọi trong `add-suspect-modal.tsx`                                                                                 | `curl -X POST /api/scan-answer` không cookie → 401; `case-000` pass                   | ✅ `7462ebd`: không bắt đăng nhập (người chơi ẩn danh), thay bằng giới hạn 10 lần/phút/IP + giới hạn độ dài input; đổi tên `/api/scan-answer`. Backlog: chuyển bối cảnh chấm lên server, client chỉ gửi câu trả lời |
| B26-3 | 🟠      | Flow view                                                                                                                                                                                                                                                                                                                    | —                                                                                     | ✅ Chốt giữ Flow; `off-board-tray.tsx` đã xóa                                               |
| B26-4 | 🟠      | Xóa code chết                                                                                                                                                                                                                                                                                                                | —                                                                                     | ✅ 14 file (`1bbfc00`); giữ `lib/case-locations-data.ts`, `data/maps/`, `archive_3d_vault/` |
| B26-5 | 🟠 TB   | `case_checkpoints`: bỏ `unlocked_evidence_id`, `suspect_label`, `evidence_step_label`; đổi mọi chỗ đọc `type` sang `question_type` (`mcq` → `choice`), rồi bỏ cột `type`. Code trước (sửa `app/api/checkpoints/route.ts`, `lib/types/database.ts`, `lib/types/checkpoint-studio.ts`), migration 46 **sau khi push + deploy** | `information_schema.columns` không còn 4 cột; `case-000` + `case-v2-from-studio` pass | 🟡 `a99c2d5`: code không còn đọc/ghi 3 cột rỗng; `db/schema/46_drop_empty_checkpoint_columns.sql` viết sẵn, **chạy sau push + deploy**. Cột `type` giữ (còn dữ liệu, nhiều logic `evidence_picker`) → backlog |
| B26-6 | 🟡 Thấp | DB nhỏ: bỏ unique thừa `dossier_documents_case_id_mode_tag_code_key`; bỏ `case_dossiers.flow_position`, `case_board_nodes.checkpoint_id`; chuyển nhân vật thiếu `avatar_url` rồi bỏ `case_characters.avatar_code`; xóa `boardgame_pins_backup_b23` sau smoke test production. Cùng quy tắc thứ tự migration như B26-5        | Truy vấn đếm cột/ràng buộc khớp                                                       | ⏳                                                                                          |
| B26-7 | 🟡      | Gộp helper trùng, gỡ Sheets CMS                                                                                                                                                                                                                                                                                              | —                                                                                     | ✅ `0145ecc`, `37b23d8`; giữ `export:docs-pdf` và `/api/waitlist`                           |
| B26-8 | 🟡 Thấp | Asset: còn nén `public/images/cases/case_000/PANORAMA.png` (10 MB) sang JPG/WebP ≤ 2 MB, sửa đường dẫn trong `cases.panorama_url`/code                                                                                                                                                                                       | Khám xét lại hiện trường vẫn mở ảnh 360                                               | ✅ `af234f3`: `cases.panorama_url` case_000 → `PANORAMA.webp` (480 KB, đã có trên production), xóa `PANORAMA.png` 10 MB |
| B26-9 | 🔴 Cao  | Chạy lại E2E sau đợt dọn: `case-000`, `studio-ux`, rồi `pnpm test:e2e` 1 lần. Spec `case-000` chờ 10 nhân vật nhưng production có 9: xác định spec sai hay dữ liệu thiếu, sửa đúng bên                                                                                                                                       | Dòng tổng kết 0 fail                                                                  | 🟡 `2ba1992`: `case-000` 10/10, `studio-ux` 6/6. Cả bộ: `40 passed / 7 failed (9.5m)` — 7 fail do spec còn kiểm UI Studio cũ → B27 |
| B27 | 🔴 Cao | Cập nhật 5 spec theo UI Studio mới (sau `c2a125d`, `846b056`, `8cc6616`): `case-v2-from-studio` (tạo nhân vật trong Checkpoint Studio thay vì `/studio/characters`), `character-avatar` (tải ảnh trong form nhân vật), `evidence-studio` (vật chứng trong Dossier Studio), `board-flow-unified` + `board-studio` (bảng nổi, bỏ khay Ngoài bảng). Cấm skip/nới expect | `pnpm test:e2e` 0 fail | ⏳ Chặn push |

Backlog (không làm trong B26): đổi tên `case_id` → `case_slug`; tách nội dung khỏi `boardgame_pins`; gộp `panorama_url`/`scene_360_url` (chờ chủ dự án); tách file > 1.000 dòng; trang tiến độ vụ trên `/studio/cases/[slug]`; mẹo chờ 800 ms ở `app/(admin)/studio/cases/[slug]/page.tsx`.

**Prompt giao việc B26 (phần còn lại):**

```
Đọc docs/reports/AUDIT_2026-10-28_DB_STUDIO_STRUCTURE.md, docs/WORKTREE_PLAN.md mục "Truy cập Supabase production", "Ngân sách kiểm thử cho AI thực thi" và bảng "B26". Làm trên main.
Làm B26-9 trước, rồi B26-2, phần code của B26-5, B26-8; mỗi mục 1 commit, không push.
KHÔNG chạy migration bỏ cột (B26-5, B26-6) khi chưa push và deploy: chỉ viết file db/schema/46_*.sql, ghi lệnh backup + kiểm vào báo cáo.
Báo cáo docs/reports/B26_REPORT.md: git log --oneline 1179a99..HEAD, dòng tổng kết Playwright thật. Không làm live cursor, không đụng dữ liệu bản đồ.
```

---

## Việc tiếp theo

| #   | Việc                                                                                     | Ai                | Ghi chú                                                                |
| --- | ---------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| 1 | B27: cập nhật 5 spec theo UI Studio mới | AI thực thi / reviewer | Chặn push |
| 2   | Review B26                                                                               | Reviewer          |                                                                        |
| 3   | **Push** `main`, theo dõi GitHub Actions → deploy VPS → smoke test production            | Chủ dự án ra lệnh | Sau bước 2                                                             |
| 4   | Migration B26-5, B26-6 (bỏ cột)                                                          | AI thực thi       | Chỉ sau bước 3                                                         |
| 5   | Bản đồ (`TECHDEBT.md` #18)                                                               | Chủ dự án         | Bảng `map_vectors` production đang rỗng → app Bản đồ trống             |
| 6   | A6: xoay key trong `.env`, `git rm --cached .env`, thêm vào `.gitignore`/`.dockerignore` | Chủ dự án         | `.env` đang bị track                                                   |
| 7   | A10: checklist VPS `deploy/INFRA_HANDOFF_CHECKLIST.md`                                   | Chủ dự án         | Cần quyền VPS                                                          |
| 8   | B15-12: giữ hay bỏ 6 vụ tĩnh trên `/activate`                                            | Chủ dự án         |                                                                        |
| 9   | **Live cursor** — `docs/superpowers/plans/2026-10-25-live-cursor-group-play.md`          | AI thực thi       | ⛔ Chưa giao: cần push + smoke test + xác nhận gói Supabase (Free/Pro) |

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
