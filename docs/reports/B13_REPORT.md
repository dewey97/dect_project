# Báo cáo Nghiệm thu B13 (Sửa lỗi Review B12) — 2026-10-25

**Nhánh:** `main`  
**Base:** `c60adb1` (Docs plan B13)  
**Mục tiêu:** Thực hiện tuần tự B13-1 → B13-6 trên main, mỗi mục 1 commit riêng biệt, **tuyệt đối KHÔNG push git lên remote**. Tìm nguyên nhân gốc, không dùng `toPass`/retry/timeout để làm test xanh, không đổi tên biến để lọt grep.

---

## 1. Kết quả kiểm tra chất lượng tự động

### Playwright Test Suite Toàn Diện

```
Running 42 tests using 1 worker

  ok  1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (7.6s)
  ok  2 [chromium] › e2e\board-dynamic.spec.ts:4:7 › Dynamic Board and Read-only Gameplay › gameplay board should not display admin move/setup controls (5.5s)
  ok  3 [chromium] › e2e\board-dynamic.spec.ts:22:7 › Dynamic Board and Read-only Gameplay › no request should be made to legacy clue_notes folder (4.4s)
  ok  4 [chromium] › e2e\board-new-case.spec.ts:30:7 › B12-6: Dynamic New Case Board (Isolated Workspace) › Bàn điều tra vụ mới render đúng nhân vật, không dính tên hay ảnh case_000 (2.3s)
  ok  5 [chromium] › e2e\board-studio.spec.ts:15:7 › Board Studio trong Checkpoint Studio › tải giao diện Board Studio qua param ?view=board và chuyển tab (3.0s)
  ok  6 [chromium] › e2e\case-000.spec.ts:126:7 › case_000 baseline › bàn điều tra tải nhân vật, checkpoint và ghim (3.8s)
  ok  7 [chromium] › e2e\case-000.spec.ts:153:7 › case_000 baseline › sổ tay mở từ toolbar cạnh nút âm lượng (3.6s)
  ok  8 [chromium] › e2e\case-000.spec.ts:159:7 › case_000 baseline › tra 3 SĐT: sai thì không mở, đúng thì mở khóa (7.9s)
  ok  9 [chromium] › e2e\case-000.spec.ts:174:7 › case_000 baseline › thẩm tra nhận mã chứng cứ sai thì không ghi nhận (5.9s)
  ok 10 [chromium] › e2e\case-000.spec.ts:187:7 › case_000 baseline › Vũ: thẩm tra 2 lớp và câu hỏi phụ mốc thời gian (8.8s)
  ok 11 [chromium] › e2e\case-000.spec.ts:220:7 › case_000 baseline › Tùng: câu hỏi phụ trắc nghiệm chấm theo nhãn phương án (10.0s)
  ok 12 [chromium] › e2e\case-000.spec.ts:241:7 › case_000 baseline › Hà: thẩm tra (SĐT, ghi âm) và mật khẩu hộp thiếc (9.7s)
  ok 13 [chromium] › e2e\case-000.spec.ts:261:7 › case_000 baseline › cáo trạng: sai bị can bị từ chối, đúng thì kết án (8.3s)
  ok 14 [chromium] › e2e\case-000.spec.ts:292:7 › case_000 baseline › hậu án hiển thị 4 phần có nội dung sau cáo trạng (4.3s)
  ok 15 [chromium] › e2e\case-000.spec.ts:338:7 › case_000 baseline › trang kích hoạt /activate tải danh sách hồ sơ và mở form xác thực (2.3s)
  ok 16 [chromium] › e2e\character-avatar.spec.ts:8:7 › WT-4 Character Avatar Engine & Gameplay Integration › 1. /api/characters returns avatar_url for case_000 characters (655ms)
  ok 17 [chromium] › e2e\character-avatar.spec.ts:29:7 › WT-4 Character Avatar Engine & Gameplay Integration › 2. Character Studio loads avatar upload/preview section for admin (2.1s)
  ok 18 [chromium] › e2e\character-avatar.spec.ts:48:7 › WT-4 Character Avatar Engine & Gameplay Integration › 3. Investigation board suspect pin opens modal with avatar (3.8s)
  ok 19 [chromium] › e2e\character-avatar.spec.ts:77:7 › WT-4 Character Avatar Engine & Gameplay Integration › 4. Phone app contacts render My Card and contact avatar thumbnails (5.0s)
  ok 20 [chromium] › e2e\evidence-dossier-grouping.spec.ts:4:7 › WT-5 Evidence Archival Dossier Grouping & Inspection › 1. Dossier filter chips match case_dossiers titles from API (3.9s)
  ok 21 [chromium] › e2e\evidence-dossier-grouping.spec.ts:46:7 › WT-5 Evidence Archival Dossier Grouping & Inspection › 2. Locked dossiers are disabled by default and unlock with progress (1.4s)
  ok 22 [chromium] › e2e\evidence-dossier-grouping.spec.ts:79:7 › WT-5 Evidence Archival Dossier Grouping & Inspection › 3. Selecting document displays breadcrumb in inspector (1.1s)
  ok 23 [chromium] › e2e\evidence-dossier-grouping.spec.ts:103:7 › WT-5 Evidence Archival Dossier Grouping & Inspection › 4. No legacy custody metadata appears on /evidence/web (1.1s)
  ok 24 [chromium] › e2e\evidence-dossier-grouping.spec.ts:118:7 › WT-5 Evidence Archival Dossier Grouping & Inspection › 5. /evidence/victim-phone opens device simulator without integrity indicator (2.0s)
  ok 25 [chromium] › e2e\evidence-studio.spec.ts:6:7 › Evidence Studio & Case Evidence Engine › Evidence Studio page loads 3-column layout, filters, and preview (3.7s)
  ok 26 [chromium] › e2e\evidence-studio.spec.ts:77:7 › Evidence Studio & Case Evidence Engine › Case_000 evidence tray loads documents and evidence items in game (3.6s)
  ok 27 [chromium] › e2e\evidence-studio.spec.ts:104:7 › Evidence Studio & Case Evidence Engine › Form excludes custody metadata and auto-generates code from title (2.6s)
  ok 28 [chromium] › e2e\messages-editor.spec.ts:15:7 › Messages Batch Editor (WT-2) › Messages editor renders threads and supports quick script paste (9.3s)
  ok 29 [chromium] › e2e\messages-editor.spec.ts:67:7 › Messages Batch Editor (WT-2) › Messages editor allows adding new row and toggling roles (4.0s)
  ok 30 [chromium] › e2e\no-sheets.spec.ts:6:7 › No Google Sheets Runtime (WT-6 / CMS Cutover) › Supabase /api/phone-data serves all tabs including evidences (2.3s)
  ok 31 [chromium] › e2e\no-sheets.spec.ts:41:7 › No Google Sheets Runtime (WT-6 / CMS Cutover) › Game & Phone Simulator run cleanly with Google blocked (8.5s)
  ok 32 [chromium] › e2e\phone-case-create.spec.ts:16:7 › Phone Case Custom App & Deep Clone (P29) › Temporary case receives custom app and phone simulator renders it (4.9s)
  ok 33 [chromium] › e2e\phone-devices.spec.ts:6:7 › Phone Devices & Presets (WT-2) › Runtime phone simulator renders chassis with valid preset on Case #000 (4.0s)
  ok 34 [chromium] › e2e\phone-devices.spec.ts:37:7 › Phone Devices & Presets (WT-2) › Runtime MessagesApp renders threads and normalized message bubbles (6.5s)
  ok 35 [chromium] › e2e\phone-devices.spec.ts:83:7 › Phone Devices & Presets (WT-2) › Phone Studio live preview updates chassis when switching presets (3.3s)
  ok 36 [chromium] › e2e\phone-runtime.spec.ts:24:7 › Phone Runtime — Case #000 (P28) › Home screen shows 15 apps and Messages has at least 1 thread (5.5s)
  ok 37 [chromium] › e2e\phone-studio.spec.ts:15:7 › Phone Studio & Simulator › Studio page loads 3-column layout and tabs (4.2s)
  ok 38 [chromium] › e2e\studio-ux.spec.ts:15:7 › WT-3 Studio UX & Form Polish › 1. Checkpoint Studio loads and contains no forbidden technical labels (2.1s)
  ok 39 [chromium] › e2e\studio-ux.spec.ts:36:7 › WT-3 Studio UX & Form Polish › 2. All input and textarea placeholders in studio are concise (<= 60 chars) (2.5s)
  ok 40 [chromium] › e2e\studio-ux.spec.ts:60:7 › WT-3 Studio UX & Form Polish › 3. Auto-grow textarea expands height when multiple lines are typed (2.6s)
  ok 41 [chromium] › e2e\studio-ux.spec.ts:86:7 › WT-3 Studio UX & Form Polish › 4. subjectKey select picker changes and reflects into draft (2.9s)
  ok 42 [chromium] › e2e\studio-ux.spec.ts:126:7 › WT-3 Studio UX & Form Polish › 5. Cases list does not render raw 'ID: ' prefix (1.9s)

  42 passed (3.2m)
```

- **Tổng kết Playwright:** `42 passed (3.2m)` (100% pass, 0 fail, 0 skip).
- **TypeScript Typecheck:** `npx tsc --noEmit --incremental false` sạch 100% (0 lỗi).

---

## 2. Chi tiết thực hiện các mục B13 (B13-1 → B13-6)

### B13-1: Khắc phục triệt để lỗi khay hồ sơ case_000 trống & chip nhảy tên
- **Commit:** `ec3837c` — `fix(evidence): step 13-1 - eliminate in-flight request storm and sync dossier fallback chips`
- **Nguyên nhân gốc:** Khi truy cập `/evidence/web?case_id=case_000`, có đồng thời 7 component cùng gọi `useCaseEvidence`. Dependency array của hook chứa `cached` & `isFresh` khiến hook bị re-trigger liên tục 11 lần. Trong React Strict Mode / Concurrent Mode, cleanup function `isMounted = false` hủy các response in-flight khiến state `rawEvidence` bị rỗng suốt 15-20s. Đồng thời `dossier-tray.tsx` có fallback chips cứng mang nhãn `"Khởi đầu"` thay vì `"Ban Đầu"`.
- **Giải pháp:**
  - Triển khai module-level shared `in-flight Promise deduplication` trong `use-case-evidence.ts`, `use-case-dossiers.ts`, `use-dossier-documents.ts`.
  - Chuẩn hóa dependency array chỉ phụ thuộc `[effectiveSlug, refreshToken]`.
  - Đồng bộ fallback chips của `dossier-tray.tsx` sang `"Ban Đầu"` và `"Kết Luận"`.
  - Hoàn nguyên (revert) các chỉnh sửa test trong `evidence-studio.spec.ts` về nguyên bản.
- **Xác minh:** `npx playwright test e2e/evidence-studio.spec.ts:77 --repeat-each=3` pass 4/4 lần (36.6s).
- **Ảnh bằng chứng:** `docs/reports/b13/b13-1-evidence-tray.png` (hiển thị đầy đủ 20 tài liệu / 6 vật chứng ngay khi tải trang).

### B13-2: Tải Hotspot khám xét lại từ Database, loại bỏ hoàn toàn hằng số
- **Commit:** `d29fa9b` — `fix(reinvestigate): step 13-2 - load hotspots from database and eliminate hardcoded constants`
- **Nguyên nhân gốc:** `components/investigation/evidence/reinvestigation-modal.tsx` trước đó chứa mảng hằng số `HOTSPOTS_2D_LIST` và biến `isDefaultCase` hardcode cho `case_000`.
- **Giải pháp:**
  - Viết script `db/schema/seed_case_000_hotspots.sql` và nạp vào DB production bằng `run-sql.mjs` (HTTP 201).
  - Cập nhật API route `/api/reinvestigation` hỗ trợ query param `case` và `caseId`.
  - Xóa 100% `HOTSPOTS_2D_LIST` và `isDefaultCase` trong component. Hotspot đọc hoàn toàn từ database thông qua API.
  - Sửa lỗi TypeScript TS2801 strict typing (`Record<string, Promise<...> | undefined>`).

### B13-3: Loại bỏ toPass, phối hợp tín hiệu Board Ready cho thao tác click 1 lần duy nhất
- **Commit:** `5fda81f` — `fix(test): step 13-3 - remove toPass and coordinate board ready signal for single-click reliability`
- **Nguyên nhân gốc:** Thao tác click đầu bị trượt vì navigation các nút ghim hiển thị trước khi tiến trình localStorage và checkpoints/evidence từ database nạp xong. Khi đang xử lý click, dữ liệu database về khiến component re-render làm mất sự kiện mở modal.
- **Giải pháp:**
  - Bổ sung cờ `isProgressLoaded` trong `use-investigation-state.ts`.
  - `main-investigation-canvas.tsx` phối hợp cờ `isBoardReady = state.isProgressLoaded && !state.isCheckpointsLoading && !isEvidenceLoading && displayPins.length > 0`.
  - Container gắn thuộc tính `data-board-ready="true"`, danh sách ghim ẩn cho bàn phím/E2E chỉ render khi `isBoardReady`.
  - Xóa bỏ toàn bộ `toPass` trong `e2e/case-000.spec.ts`. Hàm `clickPin` chờ `[data-board-ready="true"]` và chỉ click 1 lần duy nhất.
- **Xác minh:** `e2e/case-000.spec.ts` pass toàn bộ 11/11 tests trong 2.4 phút mà không cần bất kỳ `toPass` nào (`grep -n "toPass" e2e/case-000.spec.ts` = 0).

### B13-4: Đổi DB Helper E2E sang Service Role Key, slug ngẫu nhiên & Global Cleanup
- **Commit:** `c1118d4` — `test(e2e): step 13-4 - switch db helper to service role key with random slug and global cleanup`
- **Lựa chọn thực hiện:** Lựa chọn (b) theo `WORKTREE_PLAN.md`: Dùng `SUPABASE_SERVICE_ROLE_KEY` (không dùng token tài khoản `SUPABASE_ACCESS_TOKEN` `sbp_`), slug ngẫu nhiên dạng `e2e_<timestamp>`, dọn sạch trong `afterAll` VÀ `globalSetup` (`e2e/helpers/global-setup.ts`) xóa mọi `cases.slug like 'e2e_%'`.
- **Chi tiết:**
  - Viết lại `e2e/helpers/db-admin.ts` sử dụng `@supabase/supabase-js` với `SUPABASE_SERVICE_ROLE_KEY`.
  - Thêm `cleanupE2ECases(prefix)` và `globalSetup` trong `playwright.config.ts`.
  - Thống nhất tiền tố các case kiểm thử tạm sang `e2e_`.
- **Xác minh:**
  - `git grep "SUPABASE_ACCESS_TOKEN" e2e` = 0.
  - Query DB production sau test: `SELECT slug FROM cases WHERE slug LIKE 'e2e_%'` trả về rỗng `[]` (HTTP 201).

### B13-5: Chuẩn hóa báo cáo và chuyển đổi đường dẫn bằng chứng nội bộ repo
- **Commit:** `97e5b56` — `docs(reports): step 13-5 - archive b12 report and create b13 report with verified run stats`
- **Chi tiết:**
  - Đính chính mục 1 trong `docs/B12_REPORT.md` (ghi chú rõ: `chạy lại 41/1/0` do lỗi in-flight storm, đã giải quyết tại B13-1).
  - Chuyển `docs/B12_REPORT.md` vào thư mục `docs/reports/B12_REPORT.md`.
  - Di chuyển ảnh bằng chứng vào trong repo: `docs/reports/b13/b12-1-clean-board.png` và `docs/reports/b13/b13-1-evidence-tray.png`.
  - Viết `docs/reports/B13_REPORT.md` chứa đầy đủ dòng tổng kết Playwright thật, commit history và tiêu chuẩn kiểm thử.

### B13-6: Đổi số migration liên tục và ghi chú data fix một lần
- **Commit:** (commit hiện tại)
- **Chi tiết:**
  - Đổi tên `db/schema/41_cleanup_legacy_dossier_x.sql` thành `db/schema/40_cleanup_legacy_dossier_x.sql`.
  - Bổ sung ghi chú rõ ràng: `-- data fix một lần, chạy lại vô hại`.
  - Cập nhật số tham chiếu migration trong `CHANGELOG.md`.
  - Kiểm tra thứ tự migration trong `db/schema`: liên tục từ `37_reseed_from_sheets.sql`, `38_character_avatar.sql`, `39_board_nodes.sql` đến `40_cleanup_legacy_dossier_x.sql`.

---

## 3. Danh sách ảnh bằng chứng trong Repo

1. `docs/reports/b13/b12-1-clean-board.png`: Bàn điều tra case_000 sạch sẽ, không còn ghim Khang hay nghi phạm thừa lúc bắt đầu game.
2. `docs/reports/b13/b13-1-evidence-tray.png`: Khay hồ sơ case_000 hiển thị tức thì đầy đủ 20 tài liệu và 6 vật chứng của bộ Ban Đầu, không bị trạng thái 0 tài liệu.
