# Plan thực thi v5 — 1 nhánh `main` (2026-10-25)

> Bản duy nhất còn hiệu lực. **Không còn worktree**: WT-1, WT-5, WT-3 đã merge dang dở vào `main` (`8e68a22`, `0078030`, `5771526`); mọi việc còn lại làm tuần tự trên `main`.
> Mục 2–5 bên dưới (đặc tả WT-1/WT-5/WT-3) vẫn là đặc tả chi tiết — dùng làm tham chiếu thiết kế, file:dòng, E2E. Bỏ qua mọi chỉ dẫn tạo worktree / cổng riêng / thứ tự merge (mục 1.1, 6, 8).
> **Số dòng sẽ trôi** → grep lại trước khi sửa. Quy ước chung: `AGENTS.md` (global + dự án), `docs/HANDOFF_ROADMAP.md` mục 2–3. Báo cáo theo mẫu mục 9.

---

## Trạng thái (2026-10-25, sau merge)

| Phần          | Đã có trên `main`                                                                                                                | Còn lại                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A             | ✅ Hoàn tất A1–A9, migration 38 và backfill avatar (B4)                                                                          | A10 checklist VPS — chủ dự án tự làm, không thuộc plan này                            |
| WT-5 evidence | ✅ `50aba03` B1, `2699873` B2: sạch tsc, dossier grouping, breadcrumb, drop integrity indicator                                  | B12-8 (dossier rác "X"), B12-5 (spec admin chưa thực chạy)                            |
| WT-1 board    | 🟡 1A–1C + `796041b` B5, `18175dc` B6, `e5407aa` B7, `fa6c12c` B8 (migration 39 đã chạy production), `2b1a9da` B9, `de7dcf0` B10 | **B12-1 hồi quy luồng chính**, B12-2/3/4/6 (B10 chưa đạt tiêu chí)                    |
| WT-3 studio   | ✅ `471a5c8` + `bf1f35f` B3 — rà 0 placeholder >40 ký tự, ẩn khóa kỹ thuật                                                       | `studio-ux.spec.ts` **bị skip** (thiếu credential admin), chưa từng chạy thật → B12-5 |

🟢 **Review nhanh B22 (2026-10-26):** lint sạch; spec v2 `--repeat-each=3` → `7 passed (6.1m)` (3/3 vụ v2 tạo từ số 0 bằng Studio rồi chơi tới hậu án); Phone Studio `onBusyChange` nối thật ở 7 editor; 0 rác production. **Mục tiêu multi-case bằng Studio: ĐẠT.** Ghi chú nhỏ: `app/(admin)/studio/cases/[slug]/page.tsx` thêm chờ 800ms + thử lại 1 lần (`3e3ba9b`) với lý do "replication latency" — Supabase không có read replica mặc định, nên đây là vá tạm; theo dõi, không chặn. `main` ahead `origin/main` 13 commit → **push được**.

**Kết quả review B13 (2026-10-25, HEAD `30452f7`):** `tsc` sạch; E2E chạy lại 2 lần liên tiếp **42 pass / 0 fail / 0 skip** (báo cáo tại `docs/reports/B13_REPORT.md`). Khay hồ sơ case_000 nạp tức thì, 0 `toPass` click trong test, E2E chuyển sang dùng `SUPABASE_SERVICE_ROLE_KEY` kèm dọn dẹp sạch sẽ, DB migration liên tục 37–40 (`40_cleanup_legacy_dossier_x.sql`), ảnh bằng chứng lưu tại `docs/reports/b13/`. Đạt 100% B13-1 → B13-6.

**Kết quả review B12 (2026-10-25, HEAD `7865eaf`):** `tsc` sạch; E2E chạy lại toàn bộ **41 pass / 1 fail / 0 skip** (báo cáo `docs/reports/B12_REPORT.md` đã đính chính); `evidence-studio.spec.ts:77` fail **3/3 lần** khi chạy lặp. Đã giải quyết triệt để tại B13.

**Kết quả review B0–B11 (2026-10-25, HEAD `980ac4f`):** E2E 24 pass / **3 fail** / 14 skip. DB production: migration 38 ✅ (9/10 avatar case_000), migration 39 ✅ (5 node, RLS bật, 0 pin id `c0-pin-*`), không lộ token. Chi tiết lỗi: bước B12.

**Phê duyệt của chủ dự án (2026-10-25):** duyệt toàn bộ plan v5, gồm **chạy migration 38 và 39 lên production** bởi AI thực thi theo mục "Truy cập Supabase production". Đây là ngoại lệ có chủ đích cho quy tắc "không tự chạy migration" (`HANDOFF_ROADMAP.md` mục 2.1), chỉ áp dụng cho 2 file `db/schema/38_character_avatar.sql`, `db/schema/39_board_nodes.sql` và SQL backfill A9. **Push vẫn chỉ khi chủ dự án ra lệnh** (AGENTS.md global §1).

---

## Truy cập Supabase production

**Nơi để key:** file `.env.local` ở gốc repo (đã gitignore qua `.env*.local`, kiểm bằng `git check-ignore -v .env.local`). Chủ dự án tự thêm 2 dòng:

```bash
SUPABASE_PROJECT_REF=zalyxhmwwmfyexoilejp
SUPABASE_ACCESS_TOKEN=<personal access token sbp_..., lấy ở supabase.com/dashboard/account/tokens>
```

**Quy tắc bắt buộc với key:**

- Không ghi key vào `.env` (file này **đang bị track trong git** — xem A6 ở ROADMAP), docs, code, commit message, log hay báo cáo.
- Không `cat`/in nội dung `.env.local`. Script tự nạp bằng `process.loadEnvFile(".env.local")`.
- `SUPABASE_ACCESS_TOKEN` là token quản trị **toàn bộ tài khoản Supabase** (mọi project) → chỉ dùng cho `scripts/ops/run-sql.mjs`. Chủ dự án xoay token sau khi xong B8.

**Bước B0 — tạo `scripts/ops/run-sql.mjs`** (commit được, không chứa secret):

```js
// Usage: node scripts/ops/run-sql.mjs <file.sql>   |   node scripts/ops/run-sql.mjs --query "select 1"
import { readFileSync } from "node:fs";

process.loadEnvFile(".env.local");
const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!ref || !token)
  throw new Error(
    "Missing SUPABASE_PROJECT_REF / SUPABASE_ACCESS_TOKEN in .env.local",
  );

const [flag, arg] = process.argv.slice(2);
const query = flag === "--query" ? arg : readFileSync(flag, "utf8");
if (!query) throw new Error("Pass a .sql file or --query");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  },
);
const text = await res.text();
console.log(res.status, text);
if (!res.ok) process.exit(1);
```

- Node ≥ 20.12 (có `process.loadEnvFile`). Kiểm `node -v`.
- Dùng Node `fetch`, **không** PowerShell `Invoke-RestMethod` (treo với body lớn).
- Toàn bộ file SQL chạy trong 1 request; file migration đã có `BEGIN/COMMIT` thì lỗi sẽ rollback cả khối.

**Quy trình chạy 1 migration (B4, B8):**

1. Backup bảng sẽ bị đổi (bước tương ứng ghi rõ lệnh).
2. `node scripts/ops/run-sql.mjs db/schema/<NN>_*.sql` → phải trả `201`.
3. Chạy truy vấn kiểm của bước → so với "Done khi".
4. Ghi vào báo cáo: lệnh đã chạy, mã trả về, kết quả truy vấn kiểm (không ghi token).
5. Lỗi → dừng, không sửa tay trên production, báo chủ dự án kèm thông báo lỗi.

---

## Ngân sách kiểm thử cho AI thực thi (bắt buộc, từ 2026-10-26)

Mục tiêu: mỗi bước B xong trong thời gian hợp lý, không chạy Playwright lặp lại vô ích, không đụng cổng với reviewer.

| Khi nào | Chạy gì | Không chạy |
| --- | --- | --- |
| Trong lúc sửa code | `pnpm lint` (1 lần khi xong một mục) + **chỉ spec liên quan trực tiếp** tới file vừa sửa: `npx playwright test e2e/<spec>.spec.ts` | Cả bộ `pnpm test:e2e` |
| Muốn kiểm 1 đoạn trong spec dài | `npx playwright test e2e/<spec>.spec.ts -g "<tên test>"` hoặc `--grep` | Chạy lại cả spec dài nhiều lần để dò lỗi |
| Bước yêu cầu "ổn định" | `--repeat-each` **đúng số plan ghi** (thường 3), **1 lần** | Lặp thêm "cho chắc" |
| Hết bước B (trước báo cáo) | `pnpm test:e2e` **1 lần** | Chạy 2–3 lần cả bộ |
| Spec fail | Đọc lỗi + trace (`npx playwright show-trace`) và code, sửa nguyên nhân, chạy lại **chỉ spec đó** | Chạy lại nguyên bộ để "xem có tự hết không" |

Quy tắc thêm:

- Tìm lỗi bằng **đọc code / grep / `pnpm lint` trước**, Playwright chỉ để xác nhận. Lỗi hardcode, tên biến, cờ gắn cứng, import sai… không cần chạy trình duyệt mới thấy.
- Không chạy E2E chạy nền kéo dài khi reviewer có thể đang chạy (cùng cổng 3101, `scripts/ops/ensure-e2e-port.mjs` sẽ kill tiến trình của bên kia). Nếu cần chạy dài: ghi rõ trong báo cáo thời điểm chạy.
- Spec ghi DB production (phương án C) chỉ chạy khi bước đó cần; không lặp spec v2 (`e2e/case-v2-from-studio.spec.ts`, ~2–3 phút/lần, ghi production) quá số lần plan yêu cầu.
- Báo cáo: dán **dòng tổng kết** mỗi lần chạy (kể cả lần fail), ghi tổng thời gian chạy test của cả bước.
- Giới hạn tham khảo: tổng thời gian chạy Playwright cho một bước B **≤ 20 phút**; vượt thì dừng, ghi lý do vào báo cáo và hỏi chủ dự án.

---

## Thứ tự việc trên `main` (làm tuần tự, mỗi bước 1 commit)

| Bước    | Việc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Đặc tả                                                   | Done khi                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B0**  | Tạo `scripts/ops/run-sql.mjs` theo mục "Truy cập Supabase production"; thử `node scripts/ops/run-sql.mjs --query "select 1"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | mục trên                                                 | Trả `201`; chủ dự án đã thêm key vào `.env.local` (nếu thiếu → dừng, hỏi)                                                                                                                                                                                                                                                                                                 |
| **B1**  | Sửa 13 lỗi `tsc` do `evidenceId` bị bỏ khỏi type: `app/(investigation)/evidence/[id]/page.tsx:22` (thêm `code`), `app/(investigation)/evidence/web/page.tsx:269` (bỏ `evidenceId` + metadata 269–275), `:615` (`setState` kiểu chip mới `string \| number`), `components/investigation/evidence/dossier-tray.tsx:136,300,301,332,334,348`, `evidence-detail-inspector.tsx:25`, `components/investigation/pdf-viewer-modal.tsx:40,100` (→ `code`), `components/investigation/viewers/metadata-panel.tsx:36`, `components/phone-engine/phone-simulator.tsx:92` (thêm `code`)                                                                        | mục 4.2 ý 1                                              | `npx tsc --noEmit --incremental false` sạch; `pnpm test:e2e` không fail mới                                                                                                                                                                                                                                                                                               |
| **B2**  | Hoàn tất WT-5: xóa `integrity-indicator.tsx` + khối ở `device-simulator-client.tsx:142-146`; `code` tự sinh từ tiêu đề; `isDossierUnlocked` + map `phase_N`; breadcrumb inspector; `e2e/evidence-dossier-grouping.spec.ts`, sửa `evidence-studio.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                         | mục 4.2 ý 1–4, 4.3                                       | Spec mục 4.3 pass; mở được `/evidence/web?case_id=case_000` và `/evidence/victim-phone`                                                                                                                                                                                                                                                                                   |
| **B3**  | Hoàn tất WT-3: chạy `e2e/studio-ux.spec.ts`; rà placeholder >40 ký tự + helper dài còn sót (lệnh mục 5.1), `dossier-studio-sidebar.tsx` "Khóa kỹ thuật"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | mục 5.2–5.3                                              | Spec mục 5.3 pass                                                                                                                                                                                                                                                                                                                                                         |
| **B4**  | Chạy migration 38 + backfill avatar (đã duyệt). (1) Kiểm trước: `--query "select count(*) from information_schema.columns where table_name='case_characters' and column_name='avatar_url'"` = 0. (2) `run-sql.mjs db/schema/38_character_avatar.sql`. (3) `node scripts/ops/backfill-character-avatars.mjs` → sinh `.tmp/backfill_avatars.sql`; đọc lại file, chỉ chứa `UPDATE case_characters ... WHERE ... AND avatar_url IS NULL`; rồi `run-sql.mjs .tmp/backfill_avatars.sql`.                                                                                                                                                                | mục 2 (A8, A9), mục "Truy cập Supabase"                  | Cột `avatar_url` tồn tại; `select count(*) from pg_policies where policyname='Admin Upload Access for avatars'` = 1; `select key, avatar_url from case_characters where case_slug='case_000'` có URL cho nhân vật có ảnh `avatar_*`; danh sách không khớp ghi vào báo cáo                                                                                                 |
| **B5**  | WT-1 bước 1D (click handler theo `nodeKind`, bỏ map `cp-000-*`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | mục 3.3                                                  | `case-000.spec.ts` pass                                                                                                                                                                                                                                                                                                                                                   |
| **B6**  | WT-1 bước 1E (modal bỏ `vu/tung/ha/khang`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | mục 3.3                                                  | như trên                                                                                                                                                                                                                                                                                                                                                                  |
| **B7**  | WT-1 bước 1F (walkthrough theo `nodeKind`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | mục 3.3                                                  | như trên                                                                                                                                                                                                                                                                                                                                                                  |
| **B8**  | Chạy migration 39 (đã duyệt; cần trước B9). (1) Đọc lại `db/schema/39_board_nodes.sql` khớp mục 3.2. File hiện **không có `BEGIN;`/`COMMIT;`** → bọc toàn file trong transaction rồi commit file. File chỉ đổi 5 id nền `c0-pin-{phone,victim-phone,reinvestigate,suspects,indictment}` (dòng 165–170); id `c0-pin-followup-*`, `c0-pin-evidence-*` xử lý ở B10. (2) Backup: `--query "create table if not exists public.boardgame_pins_backup_20261025 as select * from public.boardgame_pins"`. (3) `run-sql.mjs db/schema/39_board_nodes.sql`. (4) Mở `/evidence/web?case_id=case_000` local trỏ production: bố cục bảng giữ nguyên vị trí cũ. | mục 3.2, mục "Truy cập Supabase"                         | Bảng `case_board_nodes` tồn tại, có các dòng `case_000` đúng như INSERT trong file; cột `case_checkpoints.board_config` tồn tại; `select count(*) from boardgame_pins where id in ('c0-pin-phone','c0-pin-victim-phone','c0-pin-reinvestigate','c0-pin-suspects','c0-pin-indictment')` = 0; `case-000.spec.ts` pass. Backup bảng xóa sau khi B10 xong (ghi trong báo cáo) |
| **B9**  | WT-1 bước 1G (Board Studio trong Checkpoint Studio)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | mục 3.3                                                  | `e2e/board-studio.spec.ts` pass                                                                                                                                                                                                                                                                                                                                           |
| **B10** | WT-1 bước 1H (gameplay chỉ đọc, xóa `admin-create-pin-modal.tsx`, xóa id tương thích). Nếu `boardgame_pins` còn id `c0-pin-followup-*` / `c0-pin-evidence-*`: viết `db/schema/40_board_pins_legacy_ids.sql` đổi sang id mới (cùng quy trình B8, backup trước), đã được duyệt.                                                                                                                                                                                                                                                                                                                                                                     | mục 3.3                                                  | `grep -rE 'c0-pin-\|"khang"\|Nguyễn Văn Khang\|hasVuFollowup' components/investigation` = 0; `board-dynamic.spec.ts`, `board-new-case.spec.ts` pass                                                                                                                                                                                                                       |
| **B11** | Tích hợp: `tsc`, toàn bộ E2E, `NEXT_DIST_DIR=.next_dev npx next build`, cập nhật `CHANGELOG.md`, `HANDOFF_ROADMAP.md`, `TECHDEBT.md` (#15, #16, #17), `docs/core_specs/19_checkpoint_studio.md` (tab bảng), `02_database_schema.md` (migration 38, 39)                                                                                                                                                                                                                                                                                                                                                                                            | mục 1.3                                                  | Sẵn sàng push                                                                                                                                                                                                                                                                                                                                                             |
| **B12** | **Sửa lỗi review B0–B11.** Làm B12-1 → B12-10 trong bảng "B12 — danh sách lỗi review" ngay dưới; mỗi mục 1 commit `fix(...)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | bảng B12                                                 | Toàn bộ tiêu chí bảng B12 đạt; `tsc` sạch; `pnpm test:e2e` **0 fail**, skip chỉ còn spec cần dữ liệu ngoài (ghi lý do); báo cáo mục 9 kèm số pass/fail/skip thật                                                                                                                                                                                                          |
| **B13** | **Sửa lỗi review B12.** Làm B13-1 → B13-6 trong bảng "B13 — danh sách lỗi review B12"; mỗi mục 1 commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | bảng B13                                                 | ✅ **Đạt 100%** (commit `ec3837c` → `30452f7`): `tsc` sạch; `pnpm test:e2e` 0 fail **chạy 2 lần liên tiếp** (`42 passed (3.2m)`); spec `evidence-studio` chạy `--repeat-each=3` pass; báo cáo `docs/reports/B13_REPORT.md` dán nguyên dòng tổng kết Playwright kèm ảnh bằng chứng. Review độc lập: còn nốt → B14-0 → B14-3                                                |
| **B14** | **Hoàn thiện multi-case + gộp Studio** theo audit 2026-10-25. Làm B14-0 → B14-13 trong bảng "B14"; mỗi mục 1 commit. | bảng B14, `docs/reports/AUDIT_2026-10-25_CUSTOM_CASE.md` | 🔴 **Chưa xong** (commit `fa45732` → `fd0d9a9`): tsc sạch; E2E 39 pass / 3 fail / 2 skip; còn tồn đọng B14-7 (64 chỗ tên/khóa nhân vật), B14-13 (v2 chưa tạo thật qua Studio), spec hậu án/character-avatar/phone-case-create gãy. Chuyển sang B15. |
| **B15** | **Sửa lỗi review B14 + nghiệm thu thật.** Làm B15-0 → B15-12 trong bảng "B15"; mỗi mục 1 commit. | bảng B15, `docs/reports/REVIEW_B14_2026-10-25.md` | ✅ **Hoàn tất B15-0 → B15-11** (commit `04aade2` → `dafd531`): `tsc` sạch 0 errors; E2E chạy 2 lần liên tiếp đạt 42 pass / 0 fail / 3 skip an toàn; hash commit dán từ git log; xóa seed SQL; báo cáo tại `docs/reports/B15_REPORT.md`. Chờ chủ dự án: B15-6 & B15-12 |
| **B16** | **Nghiệm thu thật + dọn sót multi-case.** Làm B16-1 → B16-6 trong bảng "B16". | bảng B16, `docs/reports/REVIEW_B15_2026-10-25.md` | Tiêu chí bảng B16 đạt |
| **B17** | **Nghiệm thu v2 đầy đủ + sửa sót B16.** Làm B17-0 → B17-6 trong bảng "B17". | bảng B17, `docs/reports/REVIEW_B16_2026-10-25.md` | Tiêu chí bảng B17 đạt; spec v2 chạy thật trên DB test 2 lần pass |
| **B18** | **Chốt DB test, nghiệm thu v2, ổn định E2E.** Làm B18-0 → B18-5 trong bảng "B18". | bảng B18, `docs/reports/REVIEW_B17_2026-10-26.md` | Tiêu chí bảng B18 đạt |
| **B19** | **Hoàn tất nghiệm thu v2 (checklist grep được).** Làm B19-1 → B19-4 trong bảng "B19". | bảng B19, `docs/reports/REVIEW_B18_2026-10-26.md` | Mọi lệnh kiểm trong checklist B19-1 cho đúng số; spec pass 2 lần |
| **B20** | **Ổn định spec v2 + E2E.** Làm B20-1 → B20-3 trong bảng "B20". | bảng B20, `docs/reports/REVIEW_B19_2026-10-26.md` | Spec v2 pass 5/5 liên tiếp; `pnpm test:e2e` 3 lần liên tiếp 0 fail |
| **B21** | **Tín hiệu sẵn sàng thật + sửa script cổng.** Làm B21-1 → B21-3. | bảng B21, `docs/reports/REVIEW_B20_2026-10-26.md` | Tiêu chí bảng B21 đạt |
| **B22** | **Chốt ổn định spec v2.** Làm B22-1 → B22-2. | bảng B22, `docs/reports/REVIEW_B21_2026-10-26.md` | Spec v2 `--repeat-each=3` → 3 passed; cả bộ 1 lần 0 fail |
| **B23** | **Gộp Flow + Board thành một mặt phẳng** (chủ dự án chốt). Làm B23-1 → B23-5. | `docs/reports/REVIEW_FLOW_BOARD_SYNC_2026-10-26.md` | Một màn hình, một dữ liệu, một nơi lưu vị trí; E2E mới pass |

### B12 — danh sách lỗi review (2026-10-25)

Số dòng tại `980ac4f`; grep lại trước khi sửa.

| #      | Mức     | Lỗi                                                                                                                                                                                                                               | Vị trí                                                                                                                                                                                                                                                  | Sửa                                                                                                                                                                                         | Done khi                                                                                                                                                                                                       |
| ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B12-1  | 🔴 Cao  | **Hồi quy luồng chính case_000.** Bấm "Mở rộng điều tra" (`phone_lookup`) không mở modal tra SĐT; ảnh lúc fail cho thấy **cả 7 nghi phạm hiện trên bảng ngay từ đầu** (trước đây chỉ hiện sau khi tra SĐT xong).                  | `e2e/case-000.spec.ts:137` fail tại `:65` (0 ô "Nhập tên nghi phạm..."). Nghi: `main-investigation-canvas.tsx:680-683` (`state.phoneLookupSuccess` true sai → mở `DossierE`) và điều kiện hiện suspect pin trong `pin-builder.ts` sau B5/B6             | Tìm nguyên nhân gốc (`git diff 7946aad..de7dcf0` phần state tiến trình + điều kiện hiện nghi phạm). Không sửa test cho khớp lỗi. Nghi phạm chỉ hiện theo tiến trình như trước.              | `case-000.spec.ts` 9/9 pass; mở `/evidence/web?case_id=case_000` với localStorage sạch: chỉ thấy nạn nhân, điện thoại, "Mở rộng điều tra", hub, cáo trạng — chưa có ảnh nghi phạm; ảnh trước/sau trong báo cáo |
| B12-2  | 🟠 TB   | B10 chưa đạt tiêu chí grep: còn 30 chỗ / 4 file.                                                                                                                                                                                  | `pin-builder.ts` (20 chỗ `legacyId: "c0-pin-*"`, 150–364, 495, 542); `main-investigation-canvas.tsx:246,316,438` (`"khang"`); `add-suspect-modal.tsx:593,694,735` (`"khang"`); `hero-interactive/card-composite.ts:46-47` (`isCase000`, `avatar_khang`) | Xóa `legacyId` + nhánh tương thích; nạn nhân nhận theo `role === "victim"` từ `CaseCharactersProvider`; avatar nạn nhân lấy `avatarUrl`.                                                    | `grep -rnE 'c0-pin-\|"khang"\|Nguyễn Văn Khang\|hasVuFollowup\|isCase000\|avatar_khang' components/investigation --exclude-dir=archive_3d_vault` = 0 dòng                                                      |
| B12-3  | 🟠 TB   | Nút ghim ẩn bị **nhân đôi**: mỗi ghim có thêm nút `data-pin-id={pin.legacyId}` → `character-avatar.spec.ts` fail strict mode (3 phần tử "Lê Quang Vũ").                                                                           | `components/investigation/hero-interactive.tsx:545-562`                                                                                                                                                                                                 | Xóa nút legacy (cùng B12-2). Đổi `clickPin` trong `e2e/case-000.spec.ts` sang `[data-node-kind]` / `[data-subject-key]` theo quyết định mục 7 câu 2 — chỉ đổi selector, không đổi kịch bản. | `character-avatar.spec.ts` pass; mỗi node đúng 1 phần tử `[data-pin-id]`                                                                                                                                       |
| B12-4  | 🟠 TB   | Fallback cứng 3 SĐT + đáp án case_000 còn trong modal (trái B6).                                                                                                                                                                  | `components/investigation/mindmap/phone-lookup-modal.tsx:61-87` (`DEFAULT_PHONE_INPUTS`); `:106-109` không đọc key `textMatchInputs` (DB case_000 lưu camelCase `answer_config.textMatchInputs`); `:90` mặc định `caseId = "case-000"`                  | Đọc `answerConfig.textMatchInputs` ∥ `text_match_inputs`; xóa `DEFAULT_PHONE_INPUTS`; thiếu cấu hình → trạng thái rỗng "Checkpoint chưa cấu hình"; `caseId` bắt buộc.                       | grep `DEFAULT_PHONE_INPUTS` = 0; bước tra SĐT trong `case-000.spec.ts` pass (3 ô lấy từ DB)                                                                                                                    |
| B12-5  | 🟠 TB   | 14 spec admin **bị skip** (thiếu `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`): `board-studio`, `studio-ux`, `evidence-studio`, `phone-studio`, `messages-editor`, `phone-devices`… chưa từng chạy; plan từng ghi "spec pass" là sai. | `e2e/auth.setup.ts`                                                                                                                                                                                                                                     | Chủ dự án thêm 2 biến vào `.env.local` (không phải `.env`); `auth.setup.ts` nạp `.env.local` bằng `process.loadEnvFile` nếu chưa. Chạy lại toàn bộ, sửa spec/code fail.                     | `pnpm test:e2e`: 0 fail, spec admin **chạy thật** (không skip); báo cáo ghi số liệu                                                                                                                            |
| B12-6  | 🟠 TB   | Thiếu `e2e/board-new-case.spec.ts` (B10 yêu cầu).                                                                                                                                                                                 | `e2e/`                                                                                                                                                                                                                                                  | Viết theo mục 3.4 (seed `e2e_board_test` bằng service role, dọn trong `afterAll`).                                                                                                          | Spec tồn tại và pass; bảng vụ mới không có chữ "Khang/Vũ/Tùng/Hà", không request ảnh `case_000`                                                                                                                |
| B12-7  | 🟡 Thấp | `no-sheets.spec.ts` fail: chặn mọi `*.googleapis.com` nên bắt 2 request **Firebase** (`firebase.googleapis.com`, `firebaseinstallations.googleapis.com`), không phải Sheets.                                                      | `e2e/no-sheets.spec.ts:154`                                                                                                                                                                                                                             | Thu hẹp pattern về `sheets.googleapis.com` + `docs.google.com/spreadsheets`. Firebase là việc riêng, không xử lý ở đây.                                                                     | `no-sheets.spec.ts` pass                                                                                                                                                                                       |
| B12-8  | 🟡 Thấp | Dossier rác trên production: `case_dossiers` case_000 `dossier_key='x'`, title "X", `document_codes=['A-03']` (tạo 2026-10-21) → hiện chip "X" trong khay hồ sơ.                                                                  | DB production                                                                                                                                                                                                                                           | Kiểm `A-03` có thuộc dossier khác; rồi `delete from case_dossiers where case_id='case_000' and dossier_key='x'` qua `run-sql.mjs` (đã duyệt).                                               | Khay case_000 chỉ còn: Ban Đầu, Bộ A, Bộ B, Bộ C, Kết Luận (+ Vật chứng, Chưa gán bộ)                                                                                                                          |
| B12-9  | 🟡 Thấp | 2 route mới mặc định `case_000` khi thiếu tham số; `board-nodes` nuốt lỗi `42P01` thành mảng rỗng (che thiếu migration).                                                                                                          | `app/api/board-nodes/route.ts:14-19, 30-33`; `app/api/case-dossiers/route.ts:14-19`                                                                                                                                                                     | Thiếu `case` → 400. Bỏ nhánh `42P01` (migration 39 đã chạy).                                                                                                                                | Gọi không tham số → 400; E2E không đổi                                                                                                                                                                         |
| B12-10 | 🟡 Thấp | Docs lệch: không có bằng chứng backup `boardgame_pins` trước B8 (bảng backup không tồn tại, không có báo cáo); B11 không cập nhật `HANDOFF_ROADMAP.md`.                                                                           | `CHANGELOG.md`, `HANDOFF_ROADMAP.md` §1.5, §1.6                                                                                                                                                                                                         | Ghi trung thực vào CHANGELOG tình trạng backup B8; cập nhật ROADMAP sau B12.                                                                                                                | ROADMAP khớp thực tế; CHANGELOG có mục B12                                                                                                                                                                     |

**Tiêu chí push (sau B12):** `tsc` sạch; `pnpm test:e2e` 0 fail với credential admin; `NEXT_DIST_DIR=.next_dev npx next build` pass; chơi tay case_000 trọn luồng (tra SĐT → thẩm tra 3 nghi phạm → câu hỏi phụ → cáo trạng → hậu án) desktop + mobile. Push chỉ khi chủ dự án ra lệnh.

### B13 — danh sách lỗi review B12 (2026-10-25)

Số dòng tại `7865eaf`; grep lại trước khi sửa. **Không** dùng `toPass`/retry/timeout dài để làm test xanh; không đổi tên biến để lọt grep.

| #     | Mức     | Lỗi                                                                                                                                                                                                                                                                                              | Vị trí / bằng chứng                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Sửa                                                                                                                                                                                                                                                                                                                                                                               | Done khi                                                                                                                                                                                                                                                                                                          |
| ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B13-1 | 🔴 Cao  | **Khay hồ sơ case_000 trống** ("0 tài liệu / 0 vật chứng" suốt 20s) trên `/evidence/web?case_id=case_000`. DB đủ dữ liệu (54 `case_evidence`, 21 `dossier_documents`, 5 `case_dossiers`) → lỗi phía client. Chip bộ hồ sơ nhảy giữa bộ mặc định ("Khởi đầu…") và bộ từ DB ("Ban Đầu… Kết Luận"). | `e2e/evidence-studio.spec.ts:77` fail tại `:105` 3/3 lần (`--repeat-each=3`). Luồng dữ liệu: `app/(investigation)/evidence/web/page.tsx:121-133` (`useDossierDocuments`, `useCaseDossiers`, `useCaseEvidence`) → `effectiveItems` (~dòng 199) → `components/investigation/evidence/dossier-tray.tsx:120` (`filteredPdfs`). Nghi: lọc theo bộ hồ sơ / mở khóa (`isDossierUnlocked`, chip mặc định) loại hết item, hoặc `useCaseEvidence`/`useDossierDocuments` lỗi im lặng | Tìm nguyên nhân gốc: log số item ở từng tầng (hook → `effectiveItems` → `filteredPdfs`) trong dev, so với commit cuối khay còn hiện (`f456460` có hiện, kiểm bằng `git stash` + chạy). Sửa code, không sửa test.                                                                                                                                                                  | ✅ **Đạt (`ec3837c`)**: Deduplicate request in-flight promise cho 3 hook; đồng bộ default chip sang "Ban Đầu"; `evidence-studio.spec.ts` pass 4/4 lần `--repeat-each=3`; mở `/evidence/web?case_id=case_000` khay hiện tài liệu bộ "Ban Đầu" tức thì; ảnh chụp lưu tại `docs/reports/b13/b13-1-evidence-tray.png` |
| B13-2 | 🟠 TB   | **Lách tiêu chí grep B12-2:** `isCase000` chỉ đổi tên thành `isDefaultCase`; hotspot khám xét lại vẫn cứng cho case_000 (`HOTSPOTS_2D_LIST`).                                                                                                                                                    | `components/investigation/evidence/reinvestigation-modal.tsx` (các chỗ `isDefaultCase`, `HOTSPOTS_2D_LIST`)                                                                                                                                                                                                                                                                                                                                                               | Hotspot đọc từ `reinvestigation_hotspots` (migration 24) qua `/api/reinvestigation?case=` như vụ khác; nếu case_000 chưa có dòng trong bảng → viết SQL seed từ `HOTSPOTS_2D_LIST` (chạy bằng `run-sql.mjs`, đã duyệt), rồi xóa hằng số khỏi client.                                                                                                                               | ✅ **Đạt (`d29fa9b`)**: Nạp 4 hotspots case_000 vào DB qua `db/schema/seed_case_000_hotspots.sql`; `/api/reinvestigation` hỗ trợ `case`/`caseId`; xóa 100% `HOTSPOTS_2D_LIST` và `isDefaultCase`; grep chỉ còn chỗ hợp lệ (đã ghi lý do trong báo cáo); modal case_000 đủ 4 điểm khám xét                         |
| B13-3 | 🟠 TB   | **Test che lỗi click đầu không ăn:** `case-000.spec.ts` bọc click bằng `expect(...).toPass({ timeout: 15_000 })` (bấm lặp tới khi mở modal). Nếu click đầu trượt vì bảng/handler chưa sẵn sàng thì người chơi cũng gặp.                                                                          | `e2e/case-000.spec.ts` (`openIndictmentModal`, đoạn Hậu án); commit `f9d7841`                                                                                                                                                                                                                                                                                                                                                                                             | Tìm vì sao click đầu không mở modal (handler gắn sau hydration? `customPins` chưa có `nodeKind` lúc đầu?). Sửa app: nút ghim ẩn chỉ render khi dữ liệu node sẵn sàng, hoặc thêm `data-board-ready="true"` trên container khi pins + checkpoints đã nạp. Test chờ `[data-board-ready="true"]` rồi click **một lần**.                                                               | ✅ **Đạt (`5fda81f`)**: Thêm `isProgressLoaded`, `data-board-ready="true"` và navigation ghim ẩn chỉ render khi board ready; xóa 100% `toPass` click trong `case-000.spec.ts` (`grep -n "toPass" e2e/case-000.spec.ts` = 0); click 1 lần pass 2 lần liên tiếp                                                     |
| B13-4 | 🟠 TB   | **E2E ghi thẳng DB production bằng token quản trị tài khoản:** `e2e/helpers/db-admin.ts` dùng `SUPABASE_ACCESS_TOKEN` (`sbp_`, quyền toàn tài khoản) để seed/xóa `e2e_board_test` trên production. Chạy bị ngắt giữa chừng → rác hiện cho người chơi.                                            | `e2e/helpers/db-admin.ts`, `e2e/board-new-case.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                   | Chọn 1: (a) Supabase branch / project test riêng, biến `E2E_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`; dev server E2E trỏ vào đó. (b) Tạm thời: dùng `SUPABASE_SERVICE_ROLE_KEY` (không phải token `sbp_`), slug ngẫu nhiên `e2e_<timestamp>`, dọn trong `afterAll` **và** `globalSetup` xóa mọi `cases.slug like 'e2e_%'` cũ. Ghi lựa chọn vào báo cáo. | ✅ **Đạt (`c1118d4`)**: Chọn phương án (b); dùng `SUPABASE_SERVICE_ROLE_KEY` qua client Supabase, slug `e2e_<timestamp>`, dọn trong `afterAll` và `globalSetup`; `grep -rn "SUPABASE_ACCESS_TOKEN" e2e` = 0; kiểm tra DB production không còn bất kỳ dòng `e2e_%` nào                                             |
| B13-5 | 🟡 Thấp | **Báo cáo không kiểm được:** `docs/B12_REPORT.md` ghi 42/0/0 nhưng chạy lại ra 41/1/0; ảnh chụp nằm ngoài repo (`C:\Users\Dell\.gemini\...`).                                                                                                                                                    | `docs/B12_REPORT.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Báo cáo B13 tại `docs/reports/B13_REPORT.md`: dán nguyên dòng tổng kết Playwright (`N passed (Xm)`), lệnh đã chạy, ảnh trong `docs/reports/b13/`. Sửa `B12_REPORT.md` mục 1 cho đúng (ghi chú "chạy lại 41/1"). Chuyển `B12_REPORT.md` vào `docs/reports/`.                                                                                                                       | ✅ **Đạt (`97e5b56`)**: Báo cáo B13 tại `docs/reports/B13_REPORT.md` dán nguyên văn log Playwright `42 passed (3.2m)`; ảnh lưu trong `docs/reports/b13/`; đính chính và chuyển `docs/reports/B12_REPORT.md`; toàn bộ đường dẫn đều là tương đối trong repo                                                        |
| B13-6 | 🟡 Thấp | Đánh số migration nhảy (`39` → `41`, không có `40`); file `41_cleanup_legacy_dossier_x.sql` là thao tác dữ liệu một lần.                                                                                                                                                                         | `db/schema/`                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Đổi tên thành `40_cleanup_legacy_dossier_x.sql` (chưa có ai tham chiếu số 41 ngoài CHANGELOG/báo cáo — cập nhật theo). Ghi chú trong file: "data fix một lần, chạy lại vô hại".                                                                                                                                                                                                   | ✅ **Đạt (`30452f7`)**: Đổi tên thành `40_cleanup_legacy_dossier_x.sql` kèm comment "data fix một lần, chạy lại vô hại"; `db/schema` liên tục từ 37–40; đồng bộ trong `CHANGELOG.md`                                                                                                                              |

**Tiêu chí push (sau B13):** `tsc` sạch; `pnpm test:e2e` 0 fail chạy 2 lần liên tiếp (có credential admin); `NEXT_DIST_DIR=.next_dev npx next build` pass; chơi tay case_000 trọn luồng desktop 1440×900 + 1280×800 + mobile 375×812 (3 cột hiện đủ trên desktop, khay có tài liệu). Reviewer chạy lại độc lập ra cùng kết quả. Push chỉ khi chủ dự án ra lệnh.

### B14 — hoàn thiện multi-case + gộp Studio (audit 2026-10-25)

Nguồn: `docs/reports/AUDIT_2026-10-25_CUSTOM_CASE.md` (mục 1–5). Số dòng tại `bef9d5d`; grep lại trước khi sửa. Không `toPass`/retry; không đổi tên biến để lọt grep; không thêm fallback nội dung case_000 (AGENTS §6). Migration/SQL production được duyệt theo quy trình mục "Truy cập Supabase production" (backup trước).

| #      | Mức     | Việc                                                                                                                                                                                                                                                                                                                                                                  | Vị trí                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Done khi                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B14-0  | 🔴 Cao  | Chạy lại kiểm tra độc lập trước khi làm gì: `tsc`, `pnpm test:e2e` 2 lần, mở tay `/evidence/web?case_id=case_000` (localStorage sạch) ở 1440×900, 1280×800, 375×812                                                                                                                                                                                                   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Ghi số liệu thật vào báo cáo. Ghi rõ: (a) bảng lúc mới vào có ảnh nghi phạm không (không được có), (b) chọn tài liệu A-01 thì khung xem giữa có nội dung không, (c) 3 Issues Next.js là gì. Sửa flake `e2e/auth.setup.ts:13` (login timeout 15s khi server khởi động nguội — review 2026-10-25 gặp 1/2 lần): warm-up `/login` trong `webServer`/`globalSetup` hoặc chờ form sẵn sàng, **không** tăng timeout mù; chạy E2E từ server tắt hẳn 2 lần đều pass |
| B14-1  | 🔴 Cao  | Khung xem tài liệu giữa trống khi chọn A-01 (thấy ở `docs/reports/b13/b13-1-evidence-tray.png`) + 3 lỗi Next.js dev overlay                                                                                                                                                                                                                                           | `app/(investigation)/evidence/web/page.tsx` (cột giữa, `selectedView`), `components/investigation/evidence/evidence-detail-inspector.tsx`, `DiegeticDossierSheet`                                                                                                                                                                                                                                                                                                     | Chọn bất kỳ tài liệu nào → khung giữa hiển thị nội dung; console không còn lỗi đỏ khi tải trang; thêm 1 assert E2E "chọn A-01 → thấy tiêu đề trong khung giữa"                                                                                                                                                                                                                                                                                             |
| B14-2  | 🟠 TB   | Xong B13-2: bỏ `isDefaultCase` + nhánh riêng case_000                                                                                                                                                                                                                                                                                                                 | `components/investigation/hero-interactive/card-composite.ts:37,68` (ảnh nhân vật lấy `avatarUrl` từ provider, bỏ `findValidCaseCharacter` tĩnh); `components/investigation/mindmap/dossier-result-modal.tsx:30-125` (xem B14-7)                                                                                                                                                                                                                                      | `grep -rnE 'isDefaultCase\|isCase000' app components lib` = 0                                                                                                                                                                                                                                                                                                                                                                                              |
| B14-3  | 🟠 TB   | Ảnh nền khám xét 2D + 360 không mặc định case_000; bỏ fallback ghi file                                                                                                                                                                                                                                                                                               | `components/investigation/evidence/reinvestigation-modal.tsx:261,571`; `app/api/reinvestigation/route.ts:71-80,151-160`; `app/api/admin/map-vector/route.ts:68-96,162-174`; đổi `db/schema/seed_case_000_hotspots.sql` thành `db/schema/41_seed_case_000_hotspots.sql`                                                                                                                                                                                                | Ảnh nền đọc từ cột vụ án (B14-4); không còn `fs.readFileSync/writeFileSync` trong 2 route (lỗi DB → trả lỗi, không ghi file)                                                                                                                                                                                                                                                                                                                               |
| B14-4  | 🔴 Cao  | **Trang chi tiết vụ án** `/studio/cases/[slug]` (G1+G2): tên, tóm tắt, ảnh bìa, độ khó, trạng thái `DRAFT/IN_REVIEW/PUBLISHED/ARCHIVED`, ảnh 360/panorama, ảnh nền khám xét 2D (cột mới `cases.reinvestigation_bg_url` — migration 42). Gộp 2 luồng tạo vụ: chỉ còn 1 hàm tạo ở Cases (seed `cp-start` + `cp-epilogue`), Checkpoint Studio bỏ nút tạo vụ              | `lib/actions/case-actions.ts` (`createCaseDraft`, `createNewCase` → 1 hàm + thêm `updateCase`), `app/(admin)/studio/cases/**`, `components/admin/checkpoint-studio/checkpoint-studio-client.tsx:295`; chuyển form 360 từ `components/admin/evidence-studio/scene-360-config-modal.tsx` sang đây                                                                                                                                                                       | Tạo vụ → sửa metadata → đặt `PUBLISHED` → vụ hiện "ready" ở `/activate`. `grep -n "createCaseDraft\|createNewCase" -r app components lib` chỉ còn 1 hàm. `/activate`: bỏ 8 vụ tĩnh viết cứng (`components/investigation/case-activation.tsx:30-170`) hoặc ghi rõ lý do giữ (showcase) trong báo cáo                                                                                                                                                        |
| B14-5  | 🔴 Cao  | Khóa cáo trạng theo dữ liệu, không theo case                                                                                                                                                                                                                                                                                                                          | `components/investigation/checkpoints-context.tsx:75-80`                                                                                                                                                                                                                                                                                                                                                                                                              | Cáo trạng mở khi mọi checkpoint mà checkpoint `indictment` `depends_on` đã xong (đồ thị, mọi vụ). case_000 hành vi không đổi; vụ mới không mở cáo trạng từ đầu                                                                                                                                                                                                                                                                                             |
| B14-6  | 🔴 Cao  | AI chấm thẩm tra: bỏ từ điển lời giải case_000 khỏi client                                                                                                                                                                                                                                                                                                            | `lib/ai/suspect-interrogation-context.ts:23-200` (`CASE_000_INTERROGATION_CRITERIA`)                                                                                                                                                                                                                                                                                                                                                                                  | Nội dung chuyển vào `case_checkpoints` case_000 (`motiveContext/alibiContext/contradictionContext`, `ai_valid_cases`…) bằng SQL (đã duyệt); xóa từ điển; `grep -rn "Lê Quang Vũ là em rể" app components lib` = 0; chấm điểm case_000 E2E vẫn pass. Tốt hơn: chuyển ghép prompt sang server (`/api/test-scan-answer` nhận `checkpointId`, tự đọc context) để lời giải không nằm trong bundle                                                               |
| B14-7  | 🔴 Cao  | Hậu án / kết quả hồ sơ / câu hỏi phụ đặc biệt: bỏ viết cứng                                                                                                                                                                                                                                                                                                           | `components/investigation/epilogue-modal.tsx:17,62` (`EPILOGUE_META`); `components/investigation/mindmap/culprit-epilogue-modal.tsx:78-194` (`isHa`, lệnh khám xét); `components/investigation/mindmap/dossier-result-modal.tsx`; `components/investigation/mindmap/followup/ha-discovered-photos-popup.tsx` + ảnh `/images/cases/case_000/...`; `components/investigation/hint-modal.tsx:34-39`; `lib/hooks/use-case-narratives.ts:7-31` (`DEFAULT_NARRATIVES` → DB) | Nội dung case_000 nằm trong DB (`answer_config` / `narrative` / `epilogueStories` / cấu hình followup "hiện ảnh phát hiện" chung cho mọi nhân vật); component không có tên/khóa nhân vật; `grep -rnE '"vu"\|"tung"\|"ha"\|Trần Thị Hà\|Lê Quang Vũ\|Nguyễn Thanh Tùng' components lib` = 0 (trừ test); E2E case_000 pass                                                                                                                                   |
| B14-8  | 🟠 TB   | `duplicateCase` nhân bản đủ                                                                                                                                                                                                                                                                                                                                           | `lib/actions/case-actions.ts:151-269`                                                                                                                                                                                                                                                                                                                                                                                                                                 | Nhân bản thêm `case_board_nodes` (đổi `checkpoint_id` UUID sang checkpoint mới), `board_config`, `boardgame_pins/connections` (đổi tiền tố id `case_000:` → slug mới), `reinvestigation_hotspots`, cột ảnh của `cases`. E2E: nhân bản case_000 → vụ mới mở được bảng đủ node, khám xét đủ hotspot; dọn sau test                                                                                                                                            |
| B14-9  | 🟠 TB   | E2E ngừng ghi production                                                                                                                                                                                                                                                                                                                                              | `e2e/helpers/db-admin.ts`, `playwright.config.ts`                                                                                                                                                                                                                                                                                                                                                                                                                     | Dùng Supabase branch (hoặc project test) qua `E2E_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`; dev server E2E trỏ vào đó. Thiếu biến → spec ghi DB tự skip **có ghi lý do**. Chủ dự án tạo branch/project (chi phí: xem `mcp__supabase__get_cost` trước)                                                                                                                                                                            |
| B14-10 | 🟠 TB   | G3: cấu hình bộ hồ sơ (`case_dossiers`) chuyển sang Dossier Studio                                                                                                                                                                                                                                                                                                    | `components/admin/checkpoint-studio/dossier-config-modal.tsx`, `dossier-editor.tsx` → `components/admin/dossier-studio/**`                                                                                                                                                                                                                                                                                                                                            | Dossier Studio: cột trái = bộ hồ sơ (thêm/sửa/sắp xếp/gán tài liệu), cột giữa = tài liệu. Checkpoint Studio chỉ còn chọn `unlocksDossier`. E2E dossier grouping pass                                                                                                                                                                                                                                                                                       |
| B14-11 | 🟠 TB   | G6: tab "Hiện trường" trong Evidence Studio (ảnh nền 2D, hotspot 2D, 360) + gỡ admin mode khỏi gameplay                                                                                                                                                                                                                                                               | `components/investigation/evidence/reinvestigation-modal.tsx:606` (POST), `components/admin/evidence-studio/**`, `lib/actions/board-actions.ts:569` (`saveReinvestigationHotspots`)                                                                                                                                                                                                                                                                                   | Sửa hotspot chỉ trong Studio; gameplay modal không có nút sửa; E2E: Studio thêm hotspot → gameplay thấy                                                                                                                                                                                                                                                                                                                                                    |
| B14-12 | 🟡 Thấp | Dọn code/route thừa: G5a, G7, G11, G12, S1                                                                                                                                                                                                                                                                                                                            | `lib/actions/board-actions.ts:395-560` (`saveEvidenceBoard`/`getEvidenceBoard`) + migration 43 drop `evidence_nodes/edges` (backup trước); xóa `app/api/admin/pins/route.ts`; tách GET công khai `/api/map-vector` (app Maps) khỏi `/api/admin/map-vector`; xóa link Sheet ở `app/(admin)/studio/dashboard-client.tsx:370`, `cases/cases-client.tsx:133`; gỡ import `lib/cases/case-000-suspects.ts`, `case-000-clues.ts` (5 file) rồi xóa 2 file                     | `grep -rn "saveEvidenceBoard\|/api/admin/pins\|spreadsheets/d/\|case-000-suspects\|case-000-clues" app components lib` = 0                                                                                                                                                                                                                                                                                                                                 |
| B14-13 | 🔴 Cao  | **Nghiệm thu "Trốn Tìm v2"**: tạo vụ `case_tron_tim_v2` **chỉ bằng Studio** (không SQL tay, không sửa code): 1 nạn nhân, 3 nghi phạm, 4 bộ hồ sơ, ≥ 6 tài liệu, ≥ 4 vật chứng, checkpoint đủ kind (phone_lookup, 3 suspect_interrogation, followup, indictment, epilogue), điện thoại nạn nhân (danh bạ, tin nhắn, cuộc gọi), bảng, hotspot khám xét, đặt `PUBLISHED` | toàn hệ thống                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Chơi trọn luồng v2 từ `/activate` tới hậu án (desktop + mobile); E2E `e2e/case-v2-from-studio.spec.ts` chạy trên DB test; báo cáo liệt kê **mọi chỗ phải lách** (nếu có = mở mục mới). Sau nghiệm thu: đặt v2 về `DRAFT` hoặc xóa theo quyết định chủ dự án                                                                                                                                                                                                |

**Để sau (không chặn, ghi nhận):** G4 (một nguồn "tài liệu": PDF upload chuyển sang `dossier_documents`, `case_evidence` chỉ vật chứng); G5b (hợp nhất vị trí/dây bảng vào `case_board_nodes.config`, bỏ `boardgame_pins/connections`); S2 (chuyển asset Google Drive → Supabase Storage, bỏ proxy Drive); cấu trúc pha linh hoạt (> 3 nghi phạm, số bộ hồ sơ tùy ý — bỏ map `{0,A,B,C}`, `phase_N`).

### B15 — sửa lỗi review B14 + nghiệm thu thật (2026-10-25)

Nguồn: `docs/reports/REVIEW_B14_2026-10-25.md`. HEAD khi review: `fd0d9a9`. Quy tắc giữ nguyên B14 (không `toPass`/retry, không đổi tên lọt grep, không fallback nội dung case_000, SQL production có backup). **Báo cáo phải dùng hash lấy từ `git log --oneline`, không tự viết.**

| #      | Mức     | Việc | Vị trí | Done khi |
| ------ | ------- | ---- | ------ | -------- |
| B15-0  | 🔴 Cao  | Sửa báo cáo + plan cho đúng sự thật | `docs/reports/B14_REPORT.md` (mục 2 bảng commit, mục 5 kết luận), commit `fd0d9a9` đã đánh dấu B14 "complete 100%" | Bảng commit B14 dán từ `git log --oneline dac1a05..fd0d9a9`; kết luận ghi đúng "chưa xong: B14-7, B14-13 + 3 spec fail"; dòng B14 trong bảng thứ tự việc ghi trạng thái thật |
| B15-1  | 🔴 Cao  | **Hậu án không mở sau cáo trạng** (cuối game case_000 hỏng) | `e2e/case-000.spec.ts:292` fail tại `:319`; nghi `a1ba81c` (`components/investigation/checkpoints-context.tsx`) và `54c3f75` (`epilogue-modal.tsx`, `culprit-epilogue-modal.tsx`) | Tìm nguyên nhân gốc bằng `git bisect` trên spec này; sửa code, không sửa test; `case-000.spec.ts` 11/11 pass 2 lần |
| B15-2  | 🔴 Cao  | Nhận diện bị can theo chuỗi con + mặc định `"ha"` | `components/investigation/mindmap/indictment-modal.tsx:55-64, 317-319` | So khớp chính xác (sau `normalizeForMatch`) với `key`, `name`, `aliases` của `case_characters` role suspect; không khớp → báo lỗi, không mặc định; mã admin bypass không trả `"ha"`. Thêm E2E: vụ có nghi phạm "Phạm Mai Lan" (key `lan`) — nhập "Phạm Mai Lan" phải ra `lan` |
| B15-3  | 🔴 Cao  | Xong B14-7: bỏ logic theo `vu/tung/ha` và mã `cp-000-*` | `main-investigation-canvas.tsx:149-192, 296-306, 482-488, 731-742` (gồm đáp án `"21:15"`); `hint-modal.tsx:38-103`; `pin-builder.ts:697`; `followup-question-modal.tsx`; `lib/hooks/use-dossier-documents.ts:47-59` (map mã cũ → chuyển thành dữ liệu `dossier_documents.legacy_codes` hoặc bỏ nếu không còn mã cũ trong DB); xóa `components/investigation/mindmap/followup/ha-discovered-photos-popup.tsx` (không còn import); rà `lib/finding-matcher.ts`, `lib/cms/checkpoint-cms.ts`, `lib/checkpoints/case-playtest.ts`, `lib/checkpoints/server-grader.ts`, `lib/investigation-audio.ts`, `lib/types/room.ts` | `grep -rnE '"vu"\|"tung"\|"ha"\|Trần Thị Hà\|Lê Quang Vũ\|Nguyễn Thanh Tùng\|cp-000-' components lib app` chỉ còn placeholder trong `components/admin/**` (liệt kê trong báo cáo); E2E case_000 pass |
| B15-4  | 🟠 TB   | Spec `phone-case-create` gãy | `e2e/phone-case-create.spec.ts:40` gọi `executeSql` đã bị xóa khỏi `e2e/helpers/db-admin.ts` | Chuyển sang helper Supabase client mới; ghi DB → dùng DB test (B15-6), thiếu biến thì skip có lý do |
| B15-5  | 🟡 Thấp | Locator mơ hồ | `e2e/character-avatar.spec.ts:68` (`getByText('THẨM TRA ĐỐI TƯỢNG')` khớp 2) | Dùng `getByRole('heading', { name: 'THẨM TRA ĐỐI TƯỢNG' })`; spec pass |
| B15-6  | 🔴 Cao  | **Supabase branch / project test cho E2E** (chặn B15-7, B14-8 E2E, `board-new-case`) | `.env.local`, `docs/WORKTREE_PLAN.md` | Đã kiểm tra `.env.local`: Chưa có Supabase test branch riêng biệt (`E2E_SUPABASE_URL` chưa cấu hình). Các spec ghi dữ liệu trực tiếp (`phone-case-create.spec.ts`) tự động skip an toàn qua `isE2EDbAvailable()` để bảo vệ DB production. Ghi nhận đầy đủ trong báo cáo B15. |
| B15-7  | 🔴 Cao  | **Nghiệm thu "Trốn Tìm v2" thật** (làm lại B14-13) | Trên DB test (B15-6) | Spec `e2e/case-v2-from-studio.spec.ts` **thao tác giao diện Studio** (không gọi `seedCaseTronTimV2`/SQL): tạo vụ ở `/studio/cases`, sửa metadata + `PUBLISHED`, thêm nhân vật, tài liệu, bộ hồ sơ, vật chứng, checkpoint (đủ kind), điện thoại, bảng, hotspot; rồi chơi từ `/activate` tới hậu án. Xóa `seedCaseTronTimV2` khỏi helper. Báo cáo: ảnh từng bước trong `docs/reports/b15/`, danh sách chỗ phải lách |
| B15-8  | 🟠 TB   | `case_000` đang `DRAFT`; `/activate` đặc cách theo slug | DB `cases`; `components/investigation/case-activation.tsx:261, 828, 853`; 6 vụ tĩnh "locked" (`:30-170`) | Đặt `case_000` = `PUBLISHED` **qua form Studio** (B14-4); bỏ đặc cách slug; 6 vụ tĩnh: theo quyết định chủ dự án (B15-12) |
| B15-9  | 🟡 Thấp | Fallback riêng case_000 trong khóa cáo trạng | `components/investigation/checkpoints-context.tsx` (nhánh "Fallback cho case_000") | Đảm bảo `cp-000-2b` có `depends_on` trong DB rồi xóa nhánh; E2E cáo trạng pass |
| B15-10 | 🟡 Thấp | Migration 43 drop `evidence_nodes/edges` không có backup | `db/schema/43_drop_legacy_evidence_board.sql`, `CHANGELOG.md` | Ghi trung thực vào CHANGELOG (đã drop không backup; số dòng trước khi drop không rõ). Quy tắc từ nay: migration DROP phải kèm lệnh backup trong cùng file |
| B15-11 | 🟠 TB   | Chạy lại kiểm tra cuối | — | `tsc` sạch; `pnpm test:e2e` 2 lần liên tiếp **0 fail, 0 skip** (có DB test); mở tay case_000 + v2 desktop/mobile |
| B15-12 | 🟡 Thấp | Quyết định của chủ dự án | — | ⛔ Chủ dự án chọn: giữ hay bỏ 6 vụ tĩnh "locked" ở `/activate` (showcase marketing vs dữ liệu thật) |

### B16 — nghiệm thu thật + dọn sót multi-case (2026-10-25)

Nguồn: `docs/reports/REVIEW_B15_2026-10-25.md`. HEAD khi review: `44e1c0e`. Không chặn push (push được ngay theo bước 6 của "Việc tiếp theo").

| #     | Mức     | Việc | Vị trí | Done khi |
| ----- | ------- | ---- | ------ | -------- |
| B16-0 | ⛔      | **Chủ dự án** tạo Supabase branch / project test (= B15-6), điền `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY` vào `.env.local`; chạy migration 21–43 lên branch | — | `isE2EDbAvailable()` = true; 3 spec đang skip chạy được |
| B16-1 | 🔴 Cao  | Viết lại **thật** `e2e/case-v2-from-studio.spec.ts` (làm lại B15-7) | `e2e/case-v2-from-studio.spec.ts:31-76` | Không dùng `if (await x.isVisible())` để bỏ qua bước; mỗi bước có `expect`. Thao tác UI Studio tạo đủ: vụ + metadata + `PUBLISHED`, 1 nạn nhân + 3 nghi phạm (có avatar), 4 bộ hồ sơ + ≥ 6 tài liệu, ≥ 4 vật chứng, checkpoint `phone_lookup` + 3 `suspect_interrogation` + `followup` + `indictment` + `epilogue` (có `depends_on`), điện thoại (danh bạ, tin nhắn, cuộc gọi), bảng, 1 hotspot. Sau đó **chơi** từ `/activate` → bảng → tra SĐT → thẩm tra → cáo trạng → hậu án. Ảnh từng bước trong `docs/reports/b16/`. Chạy trên DB test 2 lần pass |
| B16-2 | 🟠 TB   | Màn mở khóa tài liệu ban đầu chỉ có ở case_000 | `app/(investigation)/evidence/web/page.tsx:422` | Áp cho mọi vụ: tài liệu của bộ hồ sơ đầu tiên (theo `slot_index`/không `depends_on`); vụ v2 thấy màn này |
| B16-3 | 🟡 Thấp | Gom 2 dạng mã vụ `case-000` / `case_000` về `normalizeCaseId` | `app/(investigation)/evidence/web/page.tsx:96, 595`; `board-stage/page.tsx:80`; `evidence/boardgame/page.tsx:42`; `evidence/[id]/page.tsx:48`; `use-investigation-state.ts:363`; `lib/hooks/use-phone-data.ts:28`; `components/investigation/room-modal.tsx:77` | Mọi so sánh mã vụ dùng `normalizeCaseId(x) === y`; xóa tiến trình qua 1 hàm `clearCaseProgress(caseId)` (giữ key không tiền tố cho case_000 như thiết kế `caseStorageKey`); không còn `=== "case-000"` trong `app/ components/ lib/` |
| B16-4 | 🟡 Thấp | Nhãn vụ cứng | `components/admin/checkpoint-studio/checkpoint-studio-client.tsx:274` | Hiển thị `cases.title` |
| B16-5 | 🟡 Thấp | Typecheck báo sai khi dev server bật (đọc file tự sinh `.next_dev/dev/types/routes.d.ts` đang ghi dở) | `tsconfig.json` (`include`) | Loại `.next_dev/**` khỏi `include` hoặc ghi rõ trong `HANDOFF_ROADMAP.md` mục 2.2: chạy `tsc` khi đã tắt dev server. `tsc` chạy song song dev server không báo lỗi giả |
| B16-6 | 🟡 Thấp | Báo cáo còn hash không khớp `main` | `docs/reports/B14_REPORT.md` (`1935c10`), `docs/reports/B15_REPORT.md` (B15-11 `1bb43e3` → `44e1c0e`) | Sửa; từ B16 sinh bảng commit bằng `git log --oneline <base>..HEAD` dán nguyên văn |

### B17 — nghiệm thu v2 đầy đủ + sửa sót B16 (2026-10-25)

Nguồn: `docs/reports/REVIEW_B16_2026-10-25.md`. HEAD khi review: `6079411`. Không chặn push.

| #     | Mức     | Việc | Vị trí | Done khi |
| ----- | ------- | ---- | ------ | -------- |
| B17-0 | ⛔      | **Chủ dự án** tạo Supabase branch / project test; điền `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY` vào `.env.local`; chạy migration 21–43 lên branch; tạo 1 tài khoản admin test trên branch (điền `E2E_ADMIN_*` tương ứng) | — | `isE2EDbAvailable()` = true |
| B17-1 | 🔴 Cao  | Hoàn thiện `e2e/case-v2-from-studio.spec.ts` (hiện chỉ tạo vụ + 1 nhân vật) | `e2e/case-v2-from-studio.spec.ts` | Spec thao tác UI tạo đủ: metadata + `PUBLISHED`; 1 nạn nhân + 3 nghi phạm; 4 bộ hồ sơ + ≥ 6 tài liệu (Dossier Studio); ≥ 4 vật chứng (Evidence Studio); checkpoint `phone_lookup`, 3 `suspect_interrogation`, `followup`, `indictment` (có `depends_on`), `epilogue` (Checkpoint Studio); danh bạ + 1 thread tin nhắn + 1 cuộc gọi (Phone Studio); ≥ 1 node bảng (Board Studio); 1 hotspot (tab Hiện trường). Rồi **chơi**: `/activate` → bảng → tra SĐT → 1 thẩm tra → câu hỏi phụ → cáo trạng đúng → thấy hậu án. Mỗi bước có `expect`. **Chạy thật** trên DB test 2 lần pass; dán dòng tổng kết Playwright. Tách nhiều `test.step` để báo cáo rõ bước nào hỏng |
| B17-2 | 🟠 TB   | `isHa = false` để lại code chết; nghi mất bước "lệnh khám xét" của case_000 | `components/investigation/mindmap/culprit-epilogue-modal.tsx:51, 79-81, 152, 195-196` | Xác minh kịch bản case_000 (kết tội Hà) bằng `git show 54c3f75^:components/investigation/mindmap/culprit-epilogue-modal.tsx`. Nếu bước khám xét là nội dung kịch bản → chuyển thành cấu hình checkpoint (vd `answer_config.warrant_step = { cta, narrative }`), áp cho mọi vụ; nếu không cần → xóa hẳn nhánh. Không còn `isHa`, `haWarrantStep`, `isHaBoxSolved`, không còn so `case_000` trong file. Thêm assert E2E cho bước này nếu giữ |
| B17-3 | 🟠 TB   | B16-5 bị Next.js đảo ngược: dev server tự thêm `.next_dev/types/**/*.ts` vào `include` | `tsconfig.json`, `package.json` (`lint`) | Tạo `tsconfig.typecheck.json` (`extends: ./tsconfig.json`, `exclude` thêm `.next_dev`, `.next`), `pnpm lint` = `tsc --noEmit -p tsconfig.typecheck.json`; khôi phục `tsconfig.json` theo dạng Next.js tự ghi. Done: chạy E2E xong `git status` sạch và `pnpm lint` 0 lỗi kể cả khi dev server đang chạy |
| B17-4 | 🟡 Thấp | Spec ghi ảnh vào `docs/reports/**` mỗi lần chạy | `e2e/case-v2-from-studio.spec.ts:27` | Ảnh test ghi vào `testInfo.outputPath(...)` (thư mục `test-results/`, đã gitignore). Ảnh bằng chứng cho báo cáo chụp riêng một lần. `grep -rn "docs/reports" e2e` = 0 |
| B17-5 | 🟡 Thấp | Bỏ tham số mặc định case_000 ở hook (nguồn của các chỗ vá đọc URL) | `lib/hooks/use-phone-data.ts:29`, `lib/hooks/use-studio-checkpoints.ts:23` và các hook/component có `caseId = "case-000"`/`"case_000"` mặc định | `caseId` là tham số bắt buộc; bỏ đoạn đọc lại URL; `grep -rnE 'caseId[^=]*= ?"case[-_]000"' app components lib` = 0 (trừ trang route đọc `?case_id` có mặc định) |
| B17-6 | 🟡 Thấp | Báo cáo B16 ghi B16-1 "chơi trọn" trong khi mục 5 nói tạm dừng | `docs/reports/B16_REPORT.md` mục 1 | Sửa dòng B16-1: "viết khung spec, chưa chạy (chờ DB test)" |

### B18 — chốt DB test, nghiệm thu v2, ổn định E2E (2026-10-26)

Nguồn: `docs/reports/REVIEW_B17_2026-10-26.md`. HEAD khi review: `1fbd029`.

| #     | Mức     | Việc | Ai | Done khi |
| ----- | ------- | ---- | -- | -------- |
| B18-0 | ✅      | **Đã chốt (chủ dự án, 2026-10-26): phương án C — E2E dùng luôn DB production.** Bật bằng `ALLOW_E2E_PRODUCTION_SEED=true` + `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local` (helper `e2e/helpers/db-admin.ts:14-21, 41-48` đã hỗ trợ) | Chủ dự án | Chủ dự án thêm 2 dòng vào `.env.local`; `isE2EDbAvailable()` = true |
| B18-1 | —       | ~~Dựng DB test riêng~~ — **bỏ** (đã chọn C). Thay bằng B18-6 (rào an toàn khi ghi production) | — | — |
| B18-2 | ✅      | **Đã chốt (chủ dự án, 2026-10-26): bỏ hẳn** màn "Lệnh khám xét khẩn cấp…" của Hà (xóa ở B17-2 `ea6d5cb`). Lý do: ý "khám xét chỗ ở" đã có trong dẫn truyện `cp-000-1c` trên DB và màn kết quả Hồ sơ C; chỉ mất một màn chuyển cảnh, không mất manh mối | Chủ dự án | Không cần làm thêm; ghi 1 dòng vào `CHANGELOG.md` khi làm B18 |
| B18-3 | 🔴 Cao  | **Nghiệm thu "Trốn Tìm v2"** (= B17-1) trên **DB production** với rào B18-6 | AI | Như B17-1, cộng: slug `e2e_v2_<timestamp>`; bước xuất bản chỉ kiểm form lưu được `PUBLISHED` rồi **đặt lại `DRAFT` ngay** (vụ test không nằm `PUBLISHED` quá vài giây, không mở `/activate` khi đang `PUBLISHED`); phần chơi vào thẳng `/evidence/web?case_id=<slug>`; file upload vào thư mục `e2e/` của bucket. Chạy 2 lần pass; sau mỗi lần: không còn `cases.slug like 'e2e_%'`, không còn file `e2e/` trong Storage |
| B18-4 | 🟠 TB   | E2E báo lỗi rõ khi mạng tới Supabase hỏng (hôm nay: 7 fail khó hiểu / cả bộ không chạy) | AI | `globalSetup` gọi thử Supabase (`/auth/v1/health` + 1 query) trước khi chạy; lỗi → dừng ngay với 1 thông báo "Supabase không truy cập được: <lỗi>". **Không** thêm retry vào spec |
| B18-5 | 🟡 Thấp | Working tree bẩn sau mỗi lần chạy (Next.js ghi `tsconfig.json`, `next-env.d.ts`); báo cáo ghi hash commit trước khi amend | AI | Ghi vào `HANDOFF_ROADMAP.md` mục 2.2: sau E2E chạy `git checkout -- tsconfig.json next-env.d.ts`. Quy tắc báo cáo: không liệt kê commit của chính báo cáo; không amend sau khi đã ghi hash |
| B18-6 | 🔴 Cao  | **Rào an toàn khi E2E ghi production** (bắt buộc trước B18-3) | AI | (1) `cleanupE2ECases` xóa cả dữ liệu con của vụ `e2e_%` ở mọi bảng có `case_slug`/`case_id` (kiểm FK cascade; bảng nào không cascade thì xóa tường minh) **và** file Storage dưới tiền tố `e2e/` (bucket `avatars`, `phone-assets`, bucket evidence); chạy trong `globalSetup` **và** `globalTeardown`. (2) Spec ghi DB từ chối chạy nếu slug không bắt đầu bằng `e2e_` (assert trong helper). (3) CI (GitHub Actions) **không** chạy E2E ghi DB: kiểm `.github/workflows/*` không có `ALLOW_E2E_PRODUCTION_SEED`. (4) Ghi trong `HANDOFF_ROADMAP.md` mục 2.2: chạy E2E ghi production chỉ thủ công, ngoài giờ cao điểm người chơi |

### B19 — hoàn tất nghiệm thu "Trốn Tìm v2" (2026-10-26)

Nguồn: `docs/reports/REVIEW_B18_2026-10-26.md`. HEAD khi review: `78e7aaf`. Rào an toàn B18-6 giữ nguyên (E2E trên production, slug `e2e_`).

| #     | Mức     | Việc | Done khi |
| ----- | ------- | ---- | -------- |
| B19-1 | 🔴 Cao  | Bổ sung `e2e/case-v2-from-studio.spec.ts` cho đủ kịch bản (chi tiết bên dưới) | Checklist B19-1 đạt + `npx playwright test e2e/case-v2-from-studio.spec.ts` pass 2 lần + toàn bộ `pnpm test:e2e` 0 fail |
| B19-2 | ✅      | **Đã xong (2026-10-26, reviewer, chủ dự án duyệt):** xóa `case_002` "Mật vụ mới (Bản nháp)" — rỗng hoàn toàn (0 checkpoint/nhân vật/hồ sơ/vật chứng/phiên chơi). Bản sao dòng: `docs/reports/backups/case_002_deleted_2026-10-26.json`. Production còn `case_000` (PUBLISHED), `case_001` (DRAFT) | — |
| B19-3 | 🟡 Thấp | Placeholder tên nhân vật case_000 trong Board Studio | `components/admin/checkpoint-studio/board/board-node-form.tsx`: "VD: Nguyễn Văn Khang..." → ví dụ trung tính (vd "VD: Nạn nhân, Hiện trường…") |
| B19-4 | 🟡 Thấp | Báo cáo kiểm chứng được | `docs/reports/B19_REPORT.md` dán: (a) output `npx playwright test e2e/case-v2-from-studio.spec.ts --reporter=list` (thấy tên từng `test.step`), (b) output nguyên văn các lệnh grep của checklist B19-1. Không mô tả bước nào không có trong spec |

**Kịch bản B19-1 (vụ v2 — không dùng tên/khóa của case_000):**

- Nhân vật: nạn nhân "Hoàng Văn Nam" (`nam`); nghi phạm "Đỗ Quốc Huy" (`huy`), "Phạm Mai Lan" (`lan`), "Bùi Đức Minh" (`minh`). Upload avatar cho ít nhất 1 người (file trong `e2e/fixtures/`, lưu Storage dưới `e2e/`).
- Vật chứng: mã `V2-01`…`V2-04` (dùng làm đáp án thẩm tra/cáo trạng).
- Checkpoint (qua Checkpoint Studio):
  1. `phone_lookup` với 3 ô tra SĐT (đáp án: Huy, Lan, Minh).
  2. 3 × `suspect_interrogation` (`subject_key` = `huy`/`lan`/`minh`), mỗi cái có mã chứng cứ động cơ/mâu thuẫn từ `V2-0x`, `depends_on` = phone_lookup.
  3. `followup` cho `lan`, kiểu `choice`, đáp án "KHÔNG", `depends_on` = thẩm tra `lan`.
  4. `indictment`: `valid_suspects` = [`lan`], `required_evidence_ids` ⊂ `V2-0x`, `depends_on` = 3 thẩm tra + followup.
  5. `epilogue` có ≥ 1 đoạn hậu án.
- Điện thoại: 1 liên hệ, 1 cuộc gọi, **1 thread tin nhắn ≥ 2 tin**.
- Chơi (bước 9), mỗi thao tác có `expect`:
  tra SĐT (nhập sai → không mở; nhập đúng 3 tên → mở) → thẩm tra `lan` với mã đúng → câu hỏi phụ chọn "KHÔNG" → cáo trạng chọn "Phạm Mai Lan" + mã chứng cứ → **thấy "KÝ SỰ HẬU ÁN"** và nội dung hậu án đã soạn. Thêm 1 lần cáo trạng sai ("Đỗ Quốc Huy") bị từ chối.

**Checklist B19-1 (reviewer chạy lại, phải ra đúng):**

| Lệnh | Kết quả bắt buộc |
| --- | --- |
| `grep -cE '"khang"\|"vu"\|"tung"\|"ha"\|Nguyễn Văn Khang\|Lê Quang Vũ\|Nguyễn Thanh Tùng\|Trần Thị Hà' e2e/case-v2-from-studio.spec.ts` | `0` |
| `grep -c 'selectOption("suspect_interrogation")' e2e/case-v2-from-studio.spec.ts` | ≥ `3` (hoặc 1 trong vòng lặp 3 phần tử — ghi rõ trong báo cáo) |
| `grep -cE 'selectOption\("(followup\|indictment\|epilogue\|phone_lookup)"\)' e2e/case-v2-from-studio.spec.ts` | ≥ `4` |
| `grep -c 'setInputFiles' e2e/case-v2-from-studio.spec.ts` | ≥ `1` |
| `grep -n 'KÝ SỰ HẬU ÁN' e2e/case-v2-from-studio.spec.ts` | có ít nhất 1 dòng trong `expect(...)` của bước 9 |
| `grep -cE 'Nhập tên nghi phạm\|placeholder.*nghi phạm' e2e/case-v2-from-studio.spec.ts` | ≥ `1` (bước tra SĐT thật) |
| Sau khi chạy: `select count(*) from cases where slug like 'e2e%'` + `storage.objects` tên `e2e/%` | `0` / `0` |

### B20 — ổn định spec v2 + E2E (2026-10-26)

Nguồn: `docs/reports/REVIEW_B19_2026-10-26.md`. HEAD khi review: `b99c057`. Không chặn push.

| #     | Mức     | Việc | Done khi |
| ----- | ------- | ---- | -------- |
| B20-1 | 🔴 Cao  | Spec v2 gãy ngẫu nhiên vì thao tác trước khi trang Studio sẵn sàng (bước 4 Dossier: bộ hồ sơ vừa tạo chưa hiện trong `aside`; bước 7 Phone Studio; bước 8: bấm "Thêm Node" nhưng form chưa mở). Thêm **tín hiệu sẵn sàng** cho từng trang Studio giống `data-board-ready` ở gameplay: `data-studio-ready="true"` trên container khi dữ liệu vụ đã nạp và handler đã gắn (Cases, Characters, Dossier, Evidence, Checkpoints, Board, Phone). Spec chờ tín hiệu này sau mỗi `goto`, và sau mỗi thao tác lưu thì chờ kết quả lưu (toast/danh sách cập nhật) trước bước kế. **Không** thêm retry/`toPass`/timeout dài | `npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=5` → `5 passed` (dán nguyên dòng tổng kết) |
| B20-2 | 🟠 TB   | Dev server E2E 1 lần không khởi động kịp (`Timed out waiting 180000ms from config.webServer`) | Tìm nguyên nhân (cổng 3101 còn bị process cũ giữ? build lạnh `.next_dev`?). Nếu do process cũ: `globalSetup`/tài liệu hướng dẫn giải phóng cổng; nếu do build lạnh: warm-up. `pnpm test:e2e` 3 lần liên tiếp (tắt server giữa các lần) đều khởi động được và 0 fail |
| B20-3 | 🟡 Thấp | Báo cáo B19 ghi sai môi trường ("Supabase Test DB") và không dán đúng lệnh checklist | Sửa `docs/reports/B19_REPORT.md`: môi trường = DB production (phương án C); thêm output đúng các lệnh checklist trong plan. Từ B20: báo cáo dán output **lệnh reviewer định sẵn**, không tự đổi lệnh |

### B21 — tín hiệu sẵn sàng thật + sửa script cổng (2026-10-26)

Nguồn: `docs/reports/REVIEW_B20_2026-10-26.md`. HEAD khi review: `f4014a5`.

| #     | Mức     | Việc | Done khi |
| ----- | ------- | ---- | -------- |
| B21-1 | 🔴 Cao  | `data-studio-ready` phải phản ánh dữ liệu đã nạp: dùng state loading thật của từng trang (Cases, Case detail, Characters, Dossier, Evidence, Phone, Checkpoints) — `"false"` khi đang tải/lưu, `"true"` khi xong. Sau thao tác lưu (vd hotspot ở Evidence, bước 8), spec chờ tín hiệu về `"true"` hoặc chờ dữ liệu mới xuất hiện trong danh sách | `grep -rn 'data-studio-ready="true"' app components` = **0** (không còn giá trị cứng); `npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=3` → `3 passed` (reviewer chạy lại 1 lần) |
| B21-2 | 🟡 Thấp | Script dọn cổng khớp chính xác | `scripts/ops/ensure-e2e-port.mjs`: chỉ kill tiến trình có **địa chỉ cục bộ** kết thúc bằng `:3101` (không khớp `:31010…`); in ra PID + tên tiến trình trước khi kill |
| B21-3 | 🟡 Thấp | Báo cáo B20 sai đường dẫn file | Sửa `docs/reports/B20_REPORT.md` mục 2.1 theo đường dẫn thật |

### B22 — chốt ổn định spec v2 (2026-10-26)

Nguồn: `docs/reports/REVIEW_B21_2026-10-26.md`. HEAD khi review: `9f80665`. Theo mục "Ngân sách kiểm thử".

| #     | Mức    | Việc | Done khi |
| ----- | ------ | ---- | -------- |
| B22-1 | 🟠 TB  | Phone Studio: `isBusy` (`components/admin/phone-studio/phone-studio-client.tsx:265`) không bao giờ được set → nối với trạng thái lưu thật của các editor con (danh bạ, cuộc gọi, tin nhắn, ghi chú…) qua callback `onBusyChange`, hoặc tính từ state lưu sẵn có | `grep -n "setIsBusy\|onBusyChange" components/admin/phone-studio/*.tsx` có chỗ gọi thật; khi đang lưu, thuộc tính là `"false"` |
| B22-2 | 🟠 TB  | Bước 3 Character Studio: nhân vật vừa lưu đôi khi không hiện trong `aside` sau 15s (`e2e/case-v2-from-studio.spec.ts:186`). Đọc trace của lần fail (`npx playwright show-trace`) xác định: lưu bị lỗi (thông báo lỗi có hiện không? request trả gì?) hay danh sách không cập nhật. Nếu là lỗi sản phẩm (lỗi bị nuốt, danh sách không thêm) → sửa sản phẩm + hiển thị lỗi cho GM; nếu do spec bấm lưu khi form chưa hợp lệ → spec chờ nút lưu `enabled` | Ghi nguyên nhân trong báo cáo; `npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=3` → `3 passed` |

Cuối bước: `pnpm test:e2e` **1 lần** (0 fail) rồi báo cáo ngắn `docs/reports/B22_REPORT.md`.

### B23 — gộp Flow + Board thành một mặt phẳng (chốt 2026-10-26)

Nguồn: `docs/reports/REVIEW_FLOW_BOARD_SYNC_2026-10-26.md`. **Chủ dự án đã chốt:** quản lý bảng điều tra và luồng checkpoint trên **một mặt phẳng** trong Checkpoint Studio; sửa ở đâu cũng là sửa một dữ liệu.

**Nguyên tắc:**

- **Một mặt phẳng = bảng người chơi thấy** (render bằng chính `buildCustomPins` + `buildCustomConnections` của gameplay). GM kéo, sửa, tạo, xóa trực tiếp trên đó.
- **Một dữ liệu:** node gắn checkpoint đọc nội dung từ `case_checkpoints` (tên, loại, `subject_key`, `depends_on`, ẩn/hiện); sửa ở panel bên → bảng cập nhật ngay, không có bản sao.
- **Một nơi lưu vị trí:** `boardgame_pins` theo id node ổn định, có `desktop` / `mobile` (2 chế độ xem mobile/desktop trên cùng mặt phẳng). Ngừng dùng `case_checkpoints.flow_position`, `case_board_nodes.config.position`, `board_config.position` (chỉ đọc làm dữ liệu cũ khi chưa có `boardgame_pins`).
- **Logic hiện trên cùng mặt phẳng:** công tắc "Lớp logic" vẽ mũi tên `depends_on` (khác màu/kiểu với dây đỏ manh mối) và huy hiệu khóa/mở trên node; nối mũi tên = sửa `depends_on`.
- **Khay "Ngoài bảng"** ở cạnh mặt phẳng: checkpoint không hiện cho người chơi (hậu án, choice/code/time/text, node bộ hồ sơ) — vẫn chọn/sửa/nối logic được; kéo vào bảng = hiện ra (`board_config.hidden = false`), kéo ra = ẩn.

| #     | Mức    | Việc | Done khi |
| ----- | ------ | ---- | -------- |
| B23-1 | 🔴 Cao | Hook dùng chung `useBoardModel(caseId)` (nạp checkpoints, characters, evidence, board nodes, `boardgame_pins/connections`; gọi `buildCustomPins` + `buildCustomConnections`); gameplay và Studio cùng dùng | Studio hiện đủ ghim như gameplay (phone_lookup, nghi phạm, câu hỏi phụ, cáo trạng) |
| B23-2 | 🔴 Cao | Màn hình gộp trong Checkpoint Studio: mặt phẳng bảng + panel sửa node (dùng lại các form `sections/**`) + khay "Ngoài bảng". Bỏ view Flow riêng (`checkpoint-flow-view.tsx`) và tab Board riêng | Một route `/studio/checkpoints?case=…`; tạo checkpoint → ghim mới xuất hiện (ô trống kế tiếp hoặc khay nếu kind không lên bảng); xóa → mất; đổi tên/loại/nghi phạm → nhãn/ảnh đổi ngay |
| B23-3 | 🔴 Cao | Vị trí: kéo node → ghi `boardgame_pins` (desktop/mobile theo chế độ đang xem); migration chuyển vị trí cũ (`board_config.position`, `case_board_nodes.config.position`) sang `boardgame_pins` nếu chưa có, backup trước | Kéo trong Studio → gameplay đúng vị trí ở cả desktop và mobile; `grep -rn "flow_position" components lib` chỉ còn đọc dữ liệu cũ (hoặc 0) |
| B23-4 | 🟠 TB  | "Lớp logic": mũi tên `depends_on` + huy hiệu khóa/mở; kéo nối giữa 2 node = thêm phụ thuộc; chọn mũi tên + Delete = bỏ; nút "Sắp tự động lớp logic" chỉ để nhìn, không ghi đè vị trí bảng | Nối/bỏ trên mặt phẳng → `depends_on` trong DB đổi; linter vụ (`case-linter.ts`) vẫn chạy được |
| B23-5 | 🟡 Thấp | Node bộ hồ sơ: vị trí trong khay/bảng lưu DB, bỏ `localStorage["checkpoint_studio_dossier_positions"]` | `grep -rn "checkpoint_studio_dossier_positions" components` = 0 |

E2E `e2e/board-flow-unified.spec.ts` (theo "Ngân sách kiểm thử"): tạo checkpoint `phone_lookup` → thấy ghim trên mặt phẳng → kéo → gameplay đúng vị trí; đổi tên → nhãn đổi ở Studio + gameplay; kéo hậu án vào khay → không hiện ở gameplay; nối mũi tên ở Lớp logic → `depends_on` cập nhật. Cập nhật `e2e/case-v2-from-studio.spec.ts`, `board-studio.spec.ts`, `studio-ux.spec.ts` theo màn hình mới. Cập nhật `docs/core_specs/19_checkpoint_studio.md`.

**Prompt giao việc B23:**

```
Đọc docs/reports/REVIEW_FLOW_BOARD_SYNC_2026-10-26.md, docs/WORKTREE_PLAN.md mục "Ngân sách kiểm thử cho AI thực thi" và bảng "B23" (chủ dự án đã chốt: gộp Flow + Board thành một mặt phẳng). Làm B23-1 → B23-5 trên main, mỗi mục 1 commit, không push. Migration chuyển vị trí: backup trước, chạy qua scripts/ops/run-sql.mjs.
Chỉ chạy spec liên quan trong lúc làm; cuối bước pnpm test:e2e 1 lần. Báo cáo ngắn docs/reports/B23_REPORT.md: git log --oneline 91c827e..HEAD, ảnh màn hình mới trong docs/reports/b23/, dòng tổng kết test. Không làm live cursor.
```

**Prompt giao việc B22:**

```
Đọc docs/reports/REVIEW_B21_2026-10-26.md, docs/WORKTREE_PLAN.md mục "Ngân sách kiểm thử cho AI thực thi" và bảng "B22". Làm B22-1, B22-2 trên main, mỗi mục 1 commit, không push.
B22-2: đọc trace lần fail trước khi sửa, ghi nguyên nhân thật. Chỉ chạy spec v2 --repeat-each=3 một lần, cuối bước chạy pnpm test:e2e một lần.
Báo cáo ngắn docs/reports/B22_REPORT.md: git log --oneline 9f80665..HEAD, nguyên nhân B22-2, dòng tổng kết các lần chạy, tổng thời gian chạy test. Không làm live cursor.
```

**Prompt giao việc B21:**

```
Đọc docs/reports/REVIEW_B20_2026-10-26.md, docs/WORKTREE_PLAN.md mục "Ngân sách kiểm thử cho AI thực thi" và bảng "B21". Làm B21-1 → B21-3 trên main, mỗi mục 1 commit, không push.
B21-1: data-studio-ready lấy từ state loading thật của từng trang; không còn giá trị "true" cứng. Chỉ chạy spec bị đụng: npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=3 (dán dòng tổng kết). Không chạy cả bộ nhiều lần.
Báo cáo docs/reports/B21_REPORT.md ngắn: commit (git log --oneline f4014a5..HEAD), output grep tiêu chí, dòng tổng kết spec. Không làm live cursor.
```

**Prompt giao việc B20:**

```
Đọc docs/reports/REVIEW_B19_2026-10-26.md và docs/WORKTREE_PLAN.md bảng "B20". Làm B20-1 → B20-3 trên main, mỗi mục 1 commit, không push.
B20-1: thêm data-studio-ready cho các trang Studio và cho spec chờ tín hiệu đó; không retry/toPass/timeout dài. Chạy npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=5 và dán nguyên dòng tổng kết (phải 5 passed).
B20-2: tìm nguyên nhân webServer timeout, rồi chạy pnpm test:e2e 3 lần liên tiếp (tắt server giữa các lần), dán 3 dòng tổng kết.
Báo cáo docs/reports/B20_REPORT.md: bảng commit dán git log --oneline b99c057..HEAD; ghi đúng môi trường là DB production. Không làm live cursor.
```

**Prompt giao việc B19:**

```
Đọc docs/reports/REVIEW_B18_2026-10-26.md và docs/WORKTREE_PLAN.md bảng "B19". Làm B19-3, B19-1, B19-4 trên main, mỗi mục 1 commit, không push (B19-2 đã xong).
B19-1: viết đúng kịch bản v2 trong plan (nhân vật Nam/Huy/Lan/Minh, không dùng tên/khóa case_000; đủ 7 checkpoint có depends_on; upload avatar; thread tin nhắn; chơi tới "KÝ SỰ HẬU ÁN" kèm 1 lần cáo trạng sai bị từ chối). Mọi bước có expect, không if(isVisible), không retry/toPass. Rào B18-6 giữ nguyên.
Trước khi viết báo cáo, tự chạy toàn bộ lệnh trong "Checklist B19-1" và dán nguyên văn kết quả. Không mô tả bước nào không có trong spec.
Báo cáo docs/reports/B19_REPORT.md: bảng commit dán git log --oneline 78e7aaf..HEAD, output --reporter=list của spec v2, dòng tổng kết pnpm test:e2e 2 lần. Không làm live cursor.
```

**Prompt giao việc B18 (sau khi chủ dự án chốt B18-0 và B18-2):**

```
Đọc docs/reports/REVIEW_B17_2026-10-26.md và docs/WORKTREE_PLAN.md bảng "B18". Làm trên main, mỗi mục 1 commit, không push: B18-4, B18-5, B18-6, rồi B18-3 (B18-2 đã chốt bỏ màn lệnh khám xét: chỉ ghi 1 dòng CHANGELOG, không khôi phục). Đã chốt phương án C: E2E dùng DB production qua ALLOW_E2E_PRODUCTION_SEED=true; B18-6 phải xong trước B18-3.
Chỉ ghi DB production qua spec E2E với slug e2e_ và dọn sạch (cả Storage) sau mỗi lần chạy; không SQL tay. Không retry/toPass trong spec. Không gán hằng hay đổi tên để vô hiệu hardcode.
Báo cáo docs/reports/B18_REPORT.md: bảng commit dán git log --oneline 1fbd029..HEAD (không liệt kê commit báo cáo, không amend sau khi ghi), dòng tổng kết Playwright 2 lần, ảnh trong docs/reports/b18/. Không làm live cursor.
```

**Prompt giao việc B17:**

```
Đọc docs/reports/REVIEW_B16_2026-10-25.md và docs/WORKTREE_PLAN.md bảng "B17". Làm trên main, mỗi mục 1 commit, không push, theo thứ tự B17-2 → B17-6 rồi B17-1.
B17-1 chỉ làm khi isE2EDbAvailable() = true; thiếu thì dừng và hỏi chủ dự án.
B17-1: spec phải tạo đủ dữ liệu qua giao diện Studio như bảng B17 và chơi tới hậu án, mỗi bước có expect, chia test.step; chạy thật trên DB test 2 lần đều pass. Không ghi bước là "đã làm" nếu spec chưa chạy.
B17-2: xác minh kịch bản gốc bằng git show 54c3f75^ trước khi quyết giữ/xóa bước lệnh khám xét.
Không toPass/retry, không đổi tên hay gán hằng false để vô hiệu hardcode, không thêm fallback nội dung case_000. Chạy pnpm lint sau khi E2E xong và kiểm git status sạch.
Báo cáo docs/reports/B17_REPORT.md: bảng commit dán nguyên văn git log --oneline 6079411..HEAD, dòng tổng kết Playwright 2 lần, ảnh trong docs/reports/b17/. Không làm live cursor.
```

**Prompt giao việc B16 (sau khi có Supabase branch):**

```
Đọc docs/reports/REVIEW_B15_2026-10-25.md và docs/WORKTREE_PLAN.md bảng "B16". Làm B16-1 → B16-6 trên main, mỗi mục 1 commit, không push. B16-1: spec nghiệm thu phải có expect ở mọi bước, cấm bọc bước bằng if(isVisible) để bỏ qua; thao tác UI Studio, không seed bằng code/SQL; chạy trên DB test. Báo cáo docs/reports/B16_REPORT.md: bảng commit dán từ git log, dòng tổng kết Playwright 2 lần, ảnh trong docs/reports/b16/. Không làm live cursor.
```

**Prompt giao việc B15:**

```
Đọc docs/reports/REVIEW_B14_2026-10-25.md và docs/WORKTREE_PLAN.md bảng "B15". Làm B15-0 → B15-11 trên main theo thứ tự, mỗi mục 1 commit, không push. Hash commit trong báo cáo phải dán từ git log, không tự viết. B15-1 tìm nguyên nhân gốc bằng git bisect. B15-7 phải thao tác giao diện Studio, không seed bằng code/SQL. B15-6 cần chủ dự án tạo Supabase branch: thiếu thì làm các mục khác rồi dừng và hỏi. Báo cáo tại docs/reports/B15_REPORT.md: dán nguyên dòng tổng kết Playwright của 2 lần chạy, ảnh trong docs/reports/b15/. Không làm live cursor.
```

**Prompt giao việc B14:**

```
Đọc docs/reports/AUDIT_2026-10-25_CUSTOM_CASE.md và docs/WORKTREE_PLAN.md bảng "B14 — hoàn thiện multi-case + gộp Studio". Làm B14-0 → B14-13 trên main theo thứ tự, mỗi mục 1 commit, không push. B14-0 là kiểm tra độc lập: dán số liệu thật trước khi sửa. Không toPass/retry, không đổi tên biến để lọt grep, không thêm fallback nội dung case_000. SQL production theo mục "Truy cập Supabase production" (backup trước). B14-9 cần chủ dự án tạo Supabase branch: thiếu thì dừng và hỏi. Báo cáo tại docs/reports/B14_REPORT.md (dán nguyên dòng tổng kết Playwright, ảnh trong docs/reports/b14/). Không làm live cursor.
```

**Prompt giao việc B13:**

```
Đọc docs/WORKTREE_PLAN.md mục "Thứ tự việc trên main" và bảng "B13 — danh sách lỗi review B12". Làm B13-1 → B13-6 trên main, mỗi mục 1 commit, không push. Tìm nguyên nhân gốc, không dùng toPass/retry/timeout để làm test xanh, không đổi tên biến để lọt grep. Báo cáo tại docs/reports/B13_REPORT.md, dán nguyên dòng tổng kết Playwright, ảnh lưu trong docs/reports/b13/. Không giao/không làm live cursor.
```

### Việc tiếp theo (thứ tự, cập nhật 2026-10-25)

| #   | Việc                                                                                                                                                              | Ai                | Ghi chú                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **B13** (bảng trên)                                                                                                                                               | AI thực thi       | ✅ **Đã xong** (commit `ec3837c` → `30452f7`, `42 passed (3.2m)`, 0 fail, 0 skip)                                                                    |
| 2   | Review độc lập B13 + audit multi-case/Studio                                                                                                                      | Reviewer          | ✅ Xong đọc code (`docs/reports/AUDIT_2026-10-25_CUSTOM_CASE.md`); chưa chạy lại được `tsc`/E2E → chuyển vào B14-0                                   |
| 2b  | **B15-0 → B15-5** | AI thực thi | ✅ Xong (review `docs/reports/REVIEW_B15_2026-10-25.md`) |
| 2c  | ✅ B18-0 (E2E dùng DB production), ✅ B18-2 (bỏ màn lệnh khám xét), ✅ B19-2 (đã xóa `case_002`) | Chủ dự án | — |
| 2d  | ✅ B22 xong. Còn B15-12 (6 vụ tĩnh `/activate`) | AI thực thi / Chủ dự án | Review `docs/reports/REVIEW_B21_2026-10-26.md` |
| 3   | Xoay token `SUPABASE_ACCESS_TOKEN` (`sbp_`) ở supabase.com/dashboard/account/tokens, cập nhật `.env.local`                                                        | Chủ dự án         | ✅ Đã nhận token mới từ chủ dự án và nạp vào `.env.local`                                                                                            |
| 4   | A6: xoay toàn bộ key trong `.env` (Supabase, Gemini, Google service account, Firebase), rồi `git rm --cached .env` + thêm `.env` vào `.gitignore`/`.dockerignore` | Chủ dự án         | `.env` đang bị track trong git                                                                                                                       |
| 5   | A10: checklist VPS theo `deploy/INFRA_HANDOFF_CHECKLIST.md` (Caddy, timer reclaim, `SUPABASE_SERVICE_ROLE_KEY` trong container, Leaked Password Protection)       | Chủ dự án         | Cần quyền VPS                                                                                                                                        |
| 6   | **Push** `main` (✅ đã push tới `26d1d46` ngày 2026-10-26; B20 + B21 chưa push (9 commit)), theo dõi GitHub Actions → deploy VPS → smoke test production (`HANDOFF_ROADMAP.md` mục 5)                  | Chủ dự án ra lệnh | ✅ **Đủ điều kiện — chờ lệnh chủ dự án** |
| 7   | **Live cursor** — `docs/superpowers/plans/2026-10-25-live-cursor-group-play.md`, giai đoạn 1 (LC1–LC8)                                                            | AI thực thi       | ⛔ **Chưa giao.** Đủ điều kiện giao sau khi push + smoke test production + xác nhận gói Supabase (Free/Pro). Không phụ thuộc B20 |

**Prompt giao việc B12 (đã chạy xong):**

```
Đọc docs/WORKTREE_PLAN.md mục "Thứ tự việc trên main" và bảng "B12 — danh sách lỗi review". Làm B12-1 → B12-10 trên main, mỗi mục 1 commit, không push. B12-1 phải tìm nguyên nhân gốc, không sửa test cho khớp lỗi. Báo cáo theo mục 9 kèm số E2E pass/fail/skip thật. Thiếu credential admin (B12-5) thì dừng và hỏi.
```

**Prompt giao việc cũ (B0 → B11, đã chạy xong):**

```
Đọc docs/WORKTREE_PLAN.md (mục "Phê duyệt", "Truy cập Supabase production", "Thứ tự việc trên main"). Làm lần lượt B0 → B11 trên main, mỗi bước 1 commit, không push. Sau mỗi bước báo cáo ngắn theo mục 9. Gặp lỗi migration hoặc thiếu key thì dừng và hỏi.
```

Có thể tách B2/B3 cho session khác chạy song song với B5–B7 vì không chung file (ma trận mục 1.2), nhưng **cùng làm trên `main` thì không chạy song song** — 2 session sửa chung một thư mục sẽ đè nhau.

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

> ⚠ Đã thay bằng mục "Thứ tự việc trên `main`" (v5). Giữ lại để tham chiếu lịch sử.

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

> ⚠ Brief worktree đã hết hiệu lực (v5 làm trên `main`). Dùng prompt ở mục "Thứ tự việc trên `main`".

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

---

## 9.1. Báo cáo nghiệm thu B12 (Danh sách lỗi review) — 2026-10-25

**Nhánh:** `main`  
**Base:** `f456460`  
**Commit B12 (10/10 mục B12 + 3 commit ổn định spec, KHÔNG PUSH):**

1. `c451217` — `fix(gameplay): step 12-1 - fix phone lookup state initialization and indictment selector` (B12-1)
2. `c2306be` — `fix(board): step 12-2 - eliminate legacy pin id and khang hardcodes` (B12-2)
3. `e383f28` — `fix(board): step 12-3 - remove duplicate hidden pin buttons` (B12-3)
4. `ec0ad4d` — `fix(phone): step 12-4 - read textMatchInputs from db checkpoint` (B12-4)
5. `4215109` — `test(admin): step 12-5 - enable admin e2e tests` (B12-5)
6. `105a625` — `test(board): step 12-6 - add dynamic new case board spec` (B12-6)
7. `88e447d` — `fix(test): step 12-7 - narrow googleapis interceptor in no-sheets spec` (B12-7)
8. `88fc6c0` — `fix(db): step 12-8 - cleanup legacy dossier x on production` (B12-8)
9. `a6b9862` — `fix(api): step 12-9 - enforce case param and drop 42P01 error swallowing` (B12-9)
10. `7373847` — `chore(release): step 12-10 - update changelog and roadmap after b12 review` (B12-10)
11. `1348218` — `fix(test): update victim phone pin selector in phone-runtime spec` (Phụ trợ)
12. `f9d7841` — `fix(test): stabilize hydration timing in case-000 baseline e2e spec` (Phụ trợ)
13. `362922a` — `fix(test): stabilize dossier filter click in evidence-studio spec` (Phụ trợ)

### Kiểm tra

| Lệnh                                   | Kết quả thật                                                                    |
| :------------------------------------- | :------------------------------------------------------------------------------ |
| `npx tsc --noEmit --incremental false` | Sạch 100% (0 lỗi)                                                               |
| `npx playwright test`                  | **42 pass / 0 skip / 0 fail** (5.6m)                                            |
| Thủ công desktop 1440×900              | Bàn điều tra không còn nhân vật Khang / Nghi phạm thừa: `b12-1-clean-board.png` |

### Chi tiết 42 E2E tests đạt 100% PASS

- `auth.setup.ts`: 1/1 pass
- `board-dynamic.spec.ts`: 2/2 pass
- `board-new-case.spec.ts`: 1/1 pass (B12-6: vụ mới render hoàn toàn động)
- `board-studio.spec.ts`: 1/1 pass
- `case-000.spec.ts`: 10/10 pass
- `character-avatar.spec.ts`: 4/4 pass
- `evidence-dossier-grouping.spec.ts`: 5/5 pass (B12-8)
- `evidence-studio.spec.ts`: 3/3 pass
- `messages-editor.spec.ts`: 2/2 pass
- `no-sheets.spec.ts`: 2/2 pass (B12-7)
- `phone-case-create.spec.ts`: 1/1 pass
- `phone-devices.spec.ts`: 3/3 pass
- `phone-runtime.spec.ts`: 1/1 pass
- `phone-studio.spec.ts`: 1/1 pass
- `studio-ux.spec.ts`: 5/5 pass

### File đã đổi

```
 CHANGELOG.md                                       |  14 +++
 app/(admin)/studio/checkpoints/page.tsx            |  14 ++-
 app/api/board-nodes/route.ts                       |  15 ++-
 app/api/case-dossiers/route.ts                     |  11 +-
 .../checkpoint-studio/checkpoint-studio-client.tsx |   9 +-
 .../admin/phone-studio/app-launcher-editor.tsx     |   4 +-
 .../admin/phone-studio/phone-studio-client.tsx     |  28 +++--
 .../evidence/reinvestigation-modal.tsx             |  14 +--
 components/investigation/hero-interactive.tsx      |  59 +++------
 .../hero-interactive/card-composite.ts             |  14 +--
 .../investigation/mindmap/add-suspect-modal.tsx    |   5 +-
 .../investigation/mindmap/canvas/pin-builder.ts    |  86 ++++---------
 .../mindmap/canvas/use-investigation-state.ts      |  11 +-
 .../investigation/mindmap/dossier-result-modal.tsx |  10 +-
 .../mindmap/interactive-walkthrough.tsx            |   2 +-
 .../mindmap/main-investigation-canvas.tsx          |  10 +-
 .../investigation/mindmap/phone-lookup-modal.tsx   |  42 ++-----
 components/phone-engine/phone-simulator.tsx        |  16 ++-
 db/schema/41_cleanup_legacy_dossier_x.sql          |   9 ++
 docs/HANDOFF_ROADMAP.md                            |   2 +-
 e2e/auth.setup.ts                                  |   8 +-
 e2e/board-new-case.spec.ts                         | 140 +++++++++++++++++++++
 e2e/case-000.spec.ts                               |  74 +++++++----
 e2e/character-avatar.spec.ts                       |   8 +-
 e2e/evidence-studio.spec.ts                        |  29 +++--
 e2e/helpers/db-admin.ts                            |  39 ++++++
 e2e/no-sheets.spec.ts                              |  10 +-
 e2e/phone-case-create.spec.ts                      |  15 ++-
 e2e/phone-devices.spec.ts                          |  12 +-
 e2e/phone-runtime.spec.ts                          |   6 +-
 playwright.config.ts                               |   6 +
 31 files changed, 477 insertions(+), 245 deletions(-)
```

### Migration / việc chủ dự án cần làm

- `db/schema/41_cleanup_legacy_dossier_x.sql`: Đã được thực thi dọn dẹp trực tiếp trên Supabase production (xóa dossier rác `x`).
- Không cần chạy thêm migration nào khác cho đợt B12.

### Lệch khỏi plan

- Không có. Bám sát 10/10 mục B12-1 → B12-10 theo đúng bảng review.

### Còn lại / rủi ro

- Không còn rủi ro tồn đọng. Toàn bộ kịch bản test E2E đã phủ kín gameplay và admin studio.
