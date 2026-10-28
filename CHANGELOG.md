# Changelog

All notable changes to the Detective Case System (dect_project) will be documented in this file.

## [2026-10-28]

### Server-only checkpoint grading (SPEC-22 GĐ1–3A)

- Gameplay không còn nhận đáp án: `/api/checkpoints` đọc bằng service role và lọc `answer_config` theo allowlist (`lib/checkpoints/public-checkpoint.ts`).
- Mọi modal (follow-up, tra cứu SĐT, thẩm tra nghi phạm, cáo trạng, pin tùy chỉnh) chấm qua `/api/checkpoints/verify`; bỏ toàn bộ fallback chấm ở client.
- `/api/scan-answer` nhận `{ caseId, checkpointId, category, suspect, answer }` và tự dựng tiêu chí AI ở server.
- Grader dùng một parser (`lib/checkpoints/kinds.ts`) và một hàm so khớp tên; bỏ tầng Alibi khỏi code.
- Migration `48_checkpoint_answers_server_only.sql`: bỏ policy public read và view `case_checkpoints_public` (chạy sau deploy).
- Xóa route `/board-stage`, cờ `REQUIRE_REINVESTIGATION_APPROVAL`, prefix localStorage cũ; đổi tên `GoogleSheetsPresenceBar` thành `RoomPresenceBar`.

### Checkpoint Studio & Investigation Board Unified Architecture

- **Unified Character Management into Checkpoint Studio**:
  - Tích hợp toàn diện quản lý nhân vật vào Checkpoint Studio (`/studio/checkpoints`): bổ sung tab Segmented *Mục tiêu* & *Nhân vật*, component `CharacterEditor` với preview avatar, vai trò (`suspect` vs `witness` / `related`), biệt danh và liên kết câu hỏi thẩm tra.
  - Ngừng sử dụng Standalone Characters Studio (`/studio/characters`), gỡ bỏ khỏi Admin Sidebar và tự động redirect sang `/studio/checkpoints`.
  - Khay ngoài bảng (`OffBoardTray`): hiển thị và quản lý trực quan các nhân vật ngoài bảng (nhân chứng / liên quan), hỗ trợ nút "Lên bảng" để đưa nhanh nhân vật thành nghi phạm trên bảng điều tra.
- **Live Reactive In-Memory Synchronization**:
  - Đồng bộ tức thì 0s độ trễ giữa Inspector, Flow View (Sơ đồ luồng), và Board (Bảng điều tra): khi chỉnh sửa tên, vai trò nhân vật hay nội dung câu hỏi checkpoint, cả sơ đồ Flow và Bảng điều tra tự động cập nhật ngay trên giao diện mà không cần chờ lưu.
  - Hiển thị đầy đủ tất cả các node được cấu hình cho bảng điều tra trong Checkpoint Studio (`isStudioMode: true`) để GM dễ dàng sắp đặt, căn chỉnh tọa độ và nối dây.
- **Unified Single [LƯU] Button**:
  - Gộp toàn bộ các nút lưu lẻ tẻ (`Lưu Checkpoint`, `Lưu Nhân Vật`, `Lưu Bố Cục`) thành **1 nút [LƯU] duy nhất** trên Top Header, hỗ trợ phím tắt toàn cục `Ctrl+S`.
- **UI Clutter Cleanup & 2-Tier Interrogation Standardization**:
  - Dọn sạch các nút và nhãn thừa trên header: gỡ bỏ badge Dual-View, 2 nút Undo thừa, phụ đề và bộ đếm node, nút Sắp xếp và nút Zoom ở góc Flow View. Sửa triệt để lỗi hiển thị 2 dấu cộng `++` trên các nút tạo mới.
  - Ẩn toàn bộ các trường kỹ thuật không cần thiết đối với người dùng (mã định danh, ID, key, số điện thoại) khỏi giao diện, hệ thống tự động sinh slug và quản lý an toàn trong database.
  - Chuẩn hóa 100% mô hình Thẩm tra nghi phạm 2 lớp (**Động cơ** & **Mâu thuẫn lời khai**), loại bỏ hoàn toàn các cấu hình và tài liệu cũ liên quan đến tầng Xác minh ngoại phạm (Alibi).
- **Gameplay Canvas Board Parity**:
  - Lọc bỏ các ảnh vật chứng chưa ghim và ảnh đại diện trùng lặp khỏi canvas gameplay; chỉ hiển thị các nhân vật có vai trò nghi phạm (`role === 'suspect'`) trên bàn phá án.

## [2026-10-26]

### B18 Review & Decision Records (B18-2 & B18-5)

- **B18-2 (Kịch bản kết án Hà & Lệnh khám xét)**: Đã chốt chính thức bỏ hẳn màn "Lệnh khám xét khẩn cấp đối với Trần Thị Hà..." trong `culprit-epilogue-modal.tsx`. Ý kịch bản khám xét đã được thể hiện đầy đủ trong dẫn truyện của checkpoint `cp-000-1c` và kết quả mở khóa Hồ Sơ C; việc gỡ bỏ màn trung gian này giúp tinh gọn luồng kết án sang `indictment_modal` mà không làm mất bất kỳ đầu mối chứng cứ nào.

## [2026-10-25]

### B15 Review & Parity Hardening (B15-0 → B15-11)

- **B15-10 (Migration 43 Drop Audit & Future Backup Policy)**:
  - **Ghi nhận trung thực**: Migration `43_drop_legacy_evidence_board.sql` đã thực thi `DROP TABLE IF EXISTS public.evidence_edges CASCADE` và `DROP TABLE IF EXISTS public.evidence_nodes CASCADE` mà không tạo bảng snapshot backup trước; số dòng dữ liệu tại thời điểm drop không rõ (hệ thống điều tra đã chuyển toàn bộ sang `case_board_nodes` và `boardgame_pins` từ migration 39).
  - **Quy tắc bắt buộc từ nay**: Mọi migration thực hiện thao tác DROP hoặc thay đổi phá hủy dữ liệu (destructive DDL) **BẮT BUỘC** phải kèm theo câu lệnh sao lưu dữ liệu snapshot (`CREATE TABLE IF NOT EXISTS <table_name>_backup_<YYYYMMDD> AS TABLE <table_name>`) ngay trong cùng file migration trước khi drop.

### B13 Bug Fixes & Robustness Verification (B13-1 → B13-6)

- **B13-1 (Evidence In-Flight Deduplication)**: Khắc phục triệt để lỗi khay hồ sơ `case_000` bị trống khi load trang (`0 tài liệu / 0 vật chứng`) do 11 request Server Action dồn dập khiến React cleanup hủy kết quả fetch. Triển khai shared module-level in-flight Promise deduplication và đồng bộ fallback chips sang `"Ban Đầu"`. Khôi phục nguyên bản test `evidence-studio.spec.ts`, pass 100% với `--repeat-each=3`.
- **B13-2 (Reinvestigate Hotspots DB)**: Nạp 4 hotspots của `case_000` vào bảng `reinvestigation_hotspots` trên production (`db/schema/seed_case_000_hotspots.sql`). Xóa bỏ hoàn toàn hằng số `HOTSPOTS_2D_LIST` và cờ `isDefaultCase` trong `reinvestigation-modal.tsx`.
- **B13-3 (Board Ready & No toPass)**: Bổ sung tín hiệu `isBoardReady` (`isProgressLoaded && !isCheckpointsLoading && !isEvidenceLoading && displayPins.length > 0`) và thuộc tính `data-board-ready="true"`. Xóa bỏ toàn bộ `toPass` trong `case-000.spec.ts`. Toàn bộ 11 tests pass chỉ bằng 1 lần click duy nhất.
- **B13-4 (E2E Service Role Key & Cleanup)**: Thay thế hoàn toàn `SUPABASE_ACCESS_TOKEN` (`sbp_`) trong E2E helper bằng `SUPABASE_SERVICE_ROLE_KEY`. Tạo slug ngẫu nhiên `e2e_<timestamp>`, tự động dọn sạch trong `afterAll` và `globalSetup` (`cleanupE2ECases`), đảm bảo 0 rác trên database.
- **B13-5 (Report Verification & Local Paths)**: Lưu trữ và chuyển `docs/B12_REPORT.md` vào `docs/reports/B12_REPORT.md` với ghi chú chạy lại 41/1 thật; toàn bộ ảnh bằng chứng lưu trong repo (`docs/reports/b13/`). Viết `docs/reports/B13_REPORT.md` với log tổng kết Playwright `42 passed (3.2m)`.
- **B13-6 (Contiguous Migration Sequence)**: Đổi tên migration `41_cleanup_legacy_dossier_x.sql` thành `40_cleanup_legacy_dossier_x.sql` với chú thích "data fix một lần, chạy lại vô hại". Chuỗi migration trong `db/schema` liên tục 37–40.

### B12 Review & Bug Fixes (B12-1 → B12-10)

- **B12-1 (Gameplay)**: Khắc phục nguyên nhân gốc khởi tạo state tra SĐT (`use-investigation-state.ts`); dọn metadata Supabase trả `mai/dat/vy` về đúng vai trò witness; khôi phục hiển thị nghi phạm theo tiến trình điều tra; `case-000.spec.ts` 11/11 pass.
- **B12-2 (Board)**: Xóa toàn bộ `legacyId` (`c0-pin-*`) và các hardcode tên nhân vật `khang` trong canvas và modal (`add-suspect`, `card-composite`, `reinvestigation`, `dossier-result`, `walkthrough`). Grep kiểm tra đạt 0 dòng.
- **B12-3 (Board)**: Xóa nút ghim ẩn legacy nhân đôi trong `hero-interactive.tsx`, tránh vi phạm Playwright strict mode. Đổi selector clickPin sang `[data-node-kind]` và `[data-subject-key]`.
- **B12-4 (Phone)**: Đọc cấu hình `textMatchInputs` trực tiếp từ DB checkpoint (`phone-lookup-modal.tsx`), xóa `DEFAULT_PHONE_INPUTS` (grep = 0), thêm empty state khi checkpoint chưa cấu hình.
- **B12-5 (Admin E2E)**: Nạp credential admin qua `.env.local` trong `playwright.config.ts` và `auth.setup.ts`. Chạy thật 100% các spec admin (`board-studio`, `studio-ux`, `evidence-studio`, `phone-studio`, `messages-editor`, `phone-devices`, `phone-case-create`, `character-avatar`), khắc phục các lỗi strict mode và placeholder; 21/21 passed (0 skip, 0 fail).
- **B12-6 (Board New Case)**: Bổ sung `e2e/board-new-case.spec.ts` seed vụ án cô lập `e2e_board_test`, xác nhận render bàn điều tra động không chứa bất kỳ tên/ảnh nào của `case_000`. Dọn dẹp sạch trong `afterAll`.
- **B12-7 (No Sheets E2E)**: Thu hẹp interceptor của `no-sheets.spec.ts` sang `sheets.googleapis.com` và `docs.google.com/spreadsheets`, không còn chặn nhầm Firebase network requests.
- **B12-8 (Dossier DB)**: Dọn dẹp dossier rác `x` trên Supabase production (file migration `db/schema/40_cleanup_legacy_dossier_x.sql`). Khay hồ sơ `case_000` trở về 5 dossier chuẩn.
- **B12-9 (API Enforcement)**: Yêu cầu bắt buộc tham số `case` (hoặc `case_id` / `caseId`) tại `/api/board-nodes` và `/api/case-dossiers`, trả HTTP 400 nếu thiếu. Bỏ nuốt lỗi `42P01` trong `board-nodes`.
- **B12-10 (Docs & Backup Transparency)**: Ghi nhận trung thực: tại bước B8 trước đây, migration 39 được áp dụng trực tiếp lên production mà chưa tạo bảng snapshot `boardgame_pins_backup_20261025`; toàn bộ dữ liệu boardgame pins đã được migrate an toàn vào `case_board_nodes`. Cập nhật `HANDOFF_ROADMAP.md` phản ánh đầy đủ thực tế sau B12.


### Features

- **Full Multi-case Architecture & Checkpoint Studio Board Editor (B0-B11)**:
  - **Migration 38 (`38_character_avatar.sql`)**: Thêm cột `avatar_url` cho `case_characters`, RLS admin write và backfill avatar production.
  - **Migration 39 (`39_board_nodes.sql`)**: Tạo bảng `case_board_nodes` và cột `board_config` (JSONB) trong `case_checkpoints` cho phép cấu hình động 100% bàn điều tra. Dọn và migrate dữ liệu từ `boardgame_pins`.
  - **Board Studio (`components/admin/checkpoint-studio/board/`)**: Biên tập trực quan các node trên bảng điều tra (`HeroInteractive` preview mode), cấu hình ghi chú, kết nối dây và vị trí, tích hợp switcher tab (`?view=board` & `?view=flow`).
  - **Evidence Archival Dossier Grouping (WT-5 / B2)**: Grouping chứng cứ theo hồ sơ (`case_dossiers`), loại bỏ `integrity-indicator` và các trường rác metadata custody.
  - **Read-only Gameplay (WT-1 1H / B10)**: Chuyển toàn bộ canvas gameplay sang chế độ chỉ đọc, dọn sạch nút edit/setup node, bỏ các so khớp hardcode `c0-pin-*` và tên nhân vật tĩnh `Nguyễn Văn Khang`.
  - **Dynamic Modals**: Toàn bộ modal (`add-suspect-modal`, `indictment-modal`, `followup-question-modal`, `culprit-epilogue-modal`, `phone-lookup-modal`) hoạt động theo contract dữ liệu động từ provider/CMS.

### Database & Schema

- Migration 38: `avatar_url` trên `case_characters`.
- Migration 39: `case_board_nodes` table + `case_checkpoints.board_config` column.
- Backup và dọn dẹp hoàn tất trên Supabase production.

## [2026-10-24]

### Features

- **Evidence Studio & Chứng Cứ Per-Case (M1-M3, M10, M12)**:
  - Migration 35: Bảng `case_evidence` (RLS public read, admin write), bucket `evidence-assets`, seed 8 record case_000.
  - 6 server actions trong `evidence-actions.ts` (`requireAdminAuth` toàn bộ write).
  - Hook `useCaseEvidence(caseId)`: dual-source Supabase → fallback `CASE_000_PDFS`/`CASE_000_EVIDENCE` cho case_000 khi DB rỗng.
  - `duplicateEvidenceData` tích hợp vào `duplicateCase` — clone chứng cứ khi nhân bản vụ án.
  - Các trang `evidence/web`, `board-stage`, `evidence/boardgame` chuyển sang hook.

- **Dynamic Checkpoint Narratives (M4-M5, M8)**:
  - Bỏ `PHASE_TO_CHECKPOINT` map cứng, dùng `resolveCheckpointForPhase` generic (match by dossier key, root checkpoint, subjectKey).
  - Migration 36: Backfill `textMatchInputs`, `motiveContext`, `alibiContext`, `contradictionContext` vào `answer_config`.
  - `case-000-clues.ts`, `case-000-suspects.ts` gutted to `@deprecated` stubs. Logic chuyển sang generic `clues.ts`, `characters.ts`.

- **Pin Photos Dual-Source (M9)**:
  - `use-live-pin-photos.ts`: Supabase `photos` tab first, fallback Google Sheets.
  - `PinPhotoItem` interface, `UnifiedPin` extending `PinPoint` trong `render-scene.ts`.

- **Phone Studio (WT-1, absorbed into WT-5)**:
  - E2E auth setup, P28 phone runtime spec, P29 case create spec.
  - `auth.setup.ts` graceful skip khi thiếu env.

### Refactor

- **Type Reduction D7 Batch 2 (WT-5)**:
  - 44 file: `any` → typed interfaces/`unknown` trong admin studio, API routes, phone engine.
  - `usePhoneData` giữ default generic `any` (backward compat); callers truyền explicit generic.
  - `PresencePayload[]` thay `any[]` trong `room-sync-context.tsx`.

- **Post-Merge Type Alignment**:
  - `depends_on` → `dependsOn`, `subject_key` → `subjectKey` trên 5 components.
  - Thêm `narrative`, `dependsOn` vào `Checkpoint` interface.

### Database & Schema

- Migration 29–34: boardgame FK normalization, phone tables (apps, contacts, calls, messages, photos, notes, bank, browser), storage bucket.
- Migration 35: `case_evidence` table + `evidence-assets` bucket + seed data.
- Migration 36: Backfill checkpoint `answer_config` fields.
- Migration 37: **Reseed toàn bộ case_000 từ Google Sheets Live CMS** — thay thế hardcoded data.
  - Evidence: 8 → 54 records (đầy đủ từ Sheet tab `evidences`).
  - Contacts: 39 records (3 bỏ do thiếu tên trên Sheet).
  - Calls: 21 records với `date_str`, `time_str`, `display_name` từ Sheet.
  - Messages: 89 rows parsed từ 16 threads (format `>` = sent, không `>` = received, timestamp riêng từng tin).
  - Notes: 2, Safari: 4, Bank: 6 (từ Sheet tab `apps` phân loại NOTE/SAFARI/BANK).
  - Junk apps (`app_0`..`app_11`) xóa sạch.
- Tất cả migration 21–37 **đã chạy production**.

---

## [2026-10-23]

### Features

- **Trang Kích Hoạt Vụ Án `/activate` Đọc Động Từ Supabase (C7)**:
  - `lib/actions/case-actions.ts`: thêm server action `getPublicCases()` truy vấn danh mục vụ án từ bảng `cases` Supabase theo quyền công khai RLS.
  - `components/investigation/case-activation.tsx`: thêm `mapDbCasesToCatalog()` để map danh sách vụ án động vào giao diện tủ hồ sơ Kraft, tự động sinh mã `CASE #...`, độ khó, năm lưu trữ và mã kích hoạt cho phép. Giữ `FALLBACK_CASES_CATALOG` an toàn khi DB chưa nạp.
  - `app/activate/page.tsx`: SSR nạp `getPublicCases()` truyền vào `CaseActivation initialCases={...}` với `force-dynamic`.
  - `e2e/case-000.spec.ts`: bổ sung kiểm thử E2E trang `/activate` tải danh mục hồ sơ và mở form kích hoạt.

### Database & Schema

- **Migration 29: Khóa Ngoại Boardgame Pins & Connections (`29_boardgame_pins_case_slug_fk.sql`) (C5)**:
  - Chuẩn hóa toàn bộ `case_id` dạng cũ có dấu gạch ngang (`case-000`) sang gạch dưới chuẩn (`case_000`).
  - Thiết lập khóa ngoại `FOREIGN KEY (case_id) REFERENCES public.cases(slug) ON UPDATE CASCADE ON DELETE RESTRICT` trên 2 bảng `boardgame_pins` và `boardgame_connections`.
  - Refactor `lib/actions/board-actions.ts`: gỡ bỏ hàm biến thể `caseIdVariants()`, sử dụng `normalizeCaseId()` trực tiếp với query `.eq('case_id', ...)`.

### Refactor

- **Phổ Quát Hóa Tài Nguyên Đa Vụ Án & Tách Khám Xét Hiện Trường 360 (C6)**:
  - `components/investigation/evidence/reinvestigation-modal.tsx`: `Scene360Viewer` tải động ảnh 360 equirectangular theo vụ án (`/images/cases/${normalizeCaseId(caseId)}/crime_scene_360.jpg` và `PANORAMA.png`). Vụ án mới không bị ép nạp 4 hotspot tĩnh của `case_000`.
  - `components/investigation/mindmap/canvas/pin-builder.ts`: ghim khám xét hiện trường (`c0-pin-reinvestigate`) nạp `photoUrl` và mô tả chi tiết động theo `input.caseId`.
  - `app/(investigation)/evidence/web/page.tsx`, `board-stage/page.tsx`, `evidence/boardgame/page.tsx`: tách biệt `CASE_000_PDFS` và `CASE_000_EVIDENCE` fallback tĩnh, chỉ nạp cho `case_000`, ngăn chặn hiển thị nhầm vào các vụ án mới.

- **Dọn dẹp Fallback Legacy & Chuẩn Hóa Lựa Chọn Trắc Nghiệm (B6-cleanup)**:
  - `lib/checkpoints/server-grader.ts`: `inferCheckpointKind` đọc trực tiếp `checkpoint.kind` (NOT NULL); loại bỏ hoàn toàn các nhánh dò id cứng `-1a/-1b/-1c`, `endsWith("-0")`, `includes("indictment")`, `cleanCorrect === "21:15"` và `cleanCorrect === "120713"`.
  - `components/investigation/mindmap/canvas/pin-builder.ts`: xóa bỏ `SUSPECT_CHECKPOINT_MAP` tĩnh và các nhánh dò id `cp-000-*`. Ghim nghi phạm và câu hỏi đào sâu khớp 100% qua `kind` và `subject_key`.
  - `components/investigation/mindmap/followup-question-modal.tsx`: loại bỏ 3 nhánh fallback id `cp-000-1a/1b/1c-followup`; chuẩn hóa `DEFAULT_CHOICE_OPTIONS` và form trắc nghiệm submit trực tiếp nhãn hiển thị thay vì id ẩn ("khong_tin"/"tin").
  - `components/investigation/mindmap/culprit-epilogue-modal.tsx`: hỗ trợ trực tiếp nhãn trắc nghiệm cho đối tượng sau điều tra.
  - `e2e/case-000.spec.ts`: cập nhật kiểm tra tiến trình `followup_tung` lưu đúng nhãn "KHÔNG".

## [2026-10-22]

### Refactor

- **Phổ Quát Hóa Thiết Bị & Cách Ly Vụ Án (C5, C6)**:
  - **Bỏ hardcode tên nạn nhân**: `messages-app.tsx`, `phone-app.tsx`, `phone-simulator.tsx` không còn gán cứng tên "Khang" hay "Nguyễn Văn Khang", tự động lấy tên chủ thiết bị động qua `device.owner` hoặc `getActiveVictim()` của vụ án đang chơi.
  - **Phân tách theo `case_id` trên toàn bộ màn hình điều tra**: Các route `board-stage`, `evidence/boardgame`, `evidence/[id]` nhận `case_id` từ URL query (`useSearchParams()` bọc `<Suspense>`), đồng bộ truyền `caseId` xuống `MainInvestigationCanvas`, `useCaseCheckpoints`, và `EpilogueModal`.
  - **Ngăn chặn rò rỉ dữ liệu Google Sheets (`/api/phone`)**: Các hàng không có `case_id` trên Google Sheets chỉ trả về cho vụ án mặc định `case_000`, tuyệt đối không rò rỉ sang các vụ án mới.
  - Verification: `npx tsc --noEmit --incremental false` pass 100%, `pnpm test:e2e` **9/9 PASS** (1.1m).

### Added

- **Tiến Trình Theo Đồ Thị & Công Cụ Biên Tập Vụ Án (Nhóm C: C1 - C4)**:
  - **Mở khóa theo đồ thị (C1)**: Tạo hook `useCaseDossiers` nạp danh mục các bộ hồ sơ từ bảng `case_dossiers`. Ánh xạ mã tài liệu/vật chứng sang Phase trực tiếp từ `document_codes` và `unlocksDossier`, loại bỏ hoàn toàn việc suy đoán phase từ chữ cái đầu tiên trong `app/(investigation)/evidence/web/page.tsx`.
  - **Case Linter cho Checkpoint Studio (C2)**: Xây dựng module `lib/checkpoints/case-linter.ts` và component `CaseLintModal` (`case-lint-modal.tsx`). Tích hợp nút kiểm tra kịch bản trên toolbar Checkpoint Flow: phát hiện chu trình phụ thuộc (cycles), node không tới được (unreachable), phụ thuộc không tồn tại, checkpoint thiếu cấu hình đáp án, nghi phạm thiếu thẩm tra, vụ thiếu nạn nhân, và mã chứng cứ lạ. Hỗ trợ bấm chuyển nhanh tới node lỗi trên canvas.
  - **Nhân bản Vụ Án toàn diện (C3)**: Nâng cấp server action `duplicateCase` trong `lib/actions/case-actions.ts`, tự động sao chép đồng bộ toàn bộ `case_checkpoints`, `case_dossiers`, `case_characters`, và `dossier_documents` sang vụ án mới.
  - **Chơi thử từ Node X (C4)**: Xây dựng module `lib/checkpoints/case-playtest.ts` và nút "Chơi thử" trên thanh tiêu đề `CheckpointEditor`. Tự động truy vết và mở khóa toàn bộ các checkpoint tiên quyết (ancestors), ghi tiến trình giả lập vào `localStorage` theo `caseStorageKey`, và mở ngay trang gameplay `/evidence/web?case_id=`.
  - Verification: `npx tsc --noEmit --incremental false` pass 100%, `pnpm test:e2e` **9/9 PASS** (1.1m).

### Added

- **Multi-Case Checkpoint Engine & Dynamic Gameplay (B6)**:
  - Khởi tạo migration `28_checkpoint_config_normalize.sql` chuẩn hóa `input_type` cho câu hỏi đào sâu (`time`, `choice`, `code`, `text`) và `valid_suspects` cho cáo trạng.
  - Hỗ trợ `subject_key` liên kết trực tiếp tới `case_characters.key`, xóa bỏ hardcode `CulpritKey "vu" | "tung" | "ha"` trong `use-investigation-state.ts`.
  - Khám nghiệm & thẩm tra động: `FollowupQuestionModal`, `IndictmentModal`, và `CulpritEpilogueModal` tự động nạp ảnh, tên nhân vật và độc thoại từ Checkpoint Studio qua `useOptionalCaseCharacters()`.
  - Loại bỏ hoàn toàn việc tự động nối ghép mã chứng cứ cứng case_000 trong `IndictmentModal`.
  - Hỗ trợ 2 chiều `snake_case` và `camelCase` cho `pickerConfig` và `answer_config` trong `lib/cms/checkpoint-runtime.ts`.
  - Thêm cấu hình warm-up route `/evidence/web?case_id=case_000` trong `playwright.config.ts`, giải quyết triệt để lỗi Turbopack 404 race condition khi dev server khởi động.
  - Verification: `npx tsc --noEmit --incremental false` pass 100%, `pnpm test:e2e` **9/9 PASS** (1.4m).

### Fixed

- **Typography & Font Tiếng Việt Hậu Án (L2)**: Chuyển class tiêu đề danh sách Hậu Án (`epilogue-modal.tsx`) từ `font-serif` (`EB Garamond` thiếu glyph tổ hợp) sang `font-mono leading-relaxed` (`Roboto Mono`), khắc phục triệt để lỗi tách dấu tiếng Việt ("Trần", "Đất", "Hà").
- **Grader trắc nghiệm & Chấm điểm Server (B5-fix)**: Chuẩn hóa so khớp đáp án trắc nghiệm theo nhãn ("KHÔNG") và id nội bộ ("khong_tin"); hỗ trợ định dạng thời gian và mật khẩu linh hoạt. Toàn bộ 9/9 kịch bản E2E baseline case_000 pass 100%.
- **Bảo mật Admin Client**: `lib/supabase/admin.ts` ném lỗi rõ ràng trên production khi thiếu `SUPABASE_SERVICE_ROLE_KEY`.

### Added

- **Client Verification Helper**: Thêm `lib/checkpoints/client-verify.ts` gửi bài giải tới `/api/checkpoints/verify` với cơ chế fallback offline cho các modal điều tra.

### Refactor

- **Giảm `any` types (D7)**: Chuẩn hóa bắt lỗi `error: unknown` và interface đầu vào cho toàn bộ server actions tại `lib/actions/*`, `messages-app.tsx` và `phone-app.tsx`.

### Refactor

- **Quy hoạch thư mục `scripts/` (E)**: Phân tách toàn bộ script thành 2 thư mục rõ ràng: `scripts/ops/` (10 script còn đang dùng cho export, sync, scan map, import data, docker reclaim) và `scripts/archive/` (68 script inspect, test, download một lần). Cập nhật toàn bộ đường dẫn trong `package.json`, tài liệu kỹ thuật và `.gitignore`.

### Added

- **Checkpoint Kind Schema (B2)** — migration `26_checkpoint_kind.sql`: cột `kind` (`phone_lookup | suspect_interrogation | followup | indictment | epilogue | choice | code | time | text`) và `subject_key`, backfill 9 checkpoint case_000.
- **Discriminated Union Types (B3)** — `lib/checkpoints/kinds.ts`: union type, `parseCheckpointConfig`, `validateCheckpointConfig`.

### Performance

- **Nén ảnh PNG lớn sang WebP (D3)**: Chuyển đổi 19 ảnh PNG dung lượng > 1MB trong `public/` sang định dạng WebP (chất lượng 80), giảm từ 62.4MB xuống 3.5MB (~94.4% dung lượng). Xóa các file PNG gốc không còn tham chiếu, cập nhật code và tài liệu.

### Fixed

- **Hậu án hiển thị rỗng (L1)**: `toRuntimeCheckpoint()` parse và map `epilogueStories` vào runtime Checkpoint; `epilogue-modal.tsx` đọc trực tiếp từ thuộc tính thay vì fallback metadata rỗng.
- `/api/checkpoints` query fallback cho database production chưa chạy migration 26.

### Testing

- E2E Playwright baseline nâng lên 9 kịch bản (thêm kịch bản kiểm tra Hậu án hiển thị 4 phần có nội dung đầy đủ). Pass 9/9.

### Fixed

- Câu hỏi phụ trắc nghiệm (Tùng) luôn báo sai: so nhãn phương án thay vì id nội bộ.

### UI

- Ô lý do thẩm tra bắt đầu 1 dòng, tự giãn theo nội dung (`components/ui/auto-grow-textarea.tsx`, Checkpoint Studio dùng chung).
- Danh sách chứng cứ: nhãn "Bằng chứng đã chọn" (bỏ số đếm), hộp chứa gọn hơn.
- Nút gợi ý nằm giữa "Quay lại" và "Xác nhận", nhãn "GỢI Ý n", vẫn nhấn giữ để mở; bỏ đường kẻ dưới gợi ý.
- Nút Sổ tay chuyển vào toolbar bàn điều tra, cạnh nút âm lượng.
- Bàn điều tra có danh sách nút ghim ẩn (bàn phím / trình đọc màn hình).

### Added

- **Mã vụ án thống nhất (`cases.slug`)** — migration `22_case_slug.sql`: DB tự cấp `case_00N`, nội dung vụ án tham chiếu slug qua FK. Helper `lib/cases/case-id.ts` (`normalizeCaseId`, `caseStorageKey`, `caseIdVariants`) thay 3 bản `normalizeCaseId` trùng lặp.
- **Nhân vật theo vụ án (`case_characters`)** — migration `23_case_characters.sql` (seed case_000), API `GET /api/characters`, Studio `/studio/characters`, `CaseCharactersProvider` nạp nhân vật trước khi render bàn điều tra.

### Changed

- Gameplay đọc nghi phạm, nạn nhân, danh bạ SĐT và thông tin điện thoại tang vật từ `case_characters`; bỏ `VALID_CASE_CHARACTERS`, `KNOWN_CASE_PHONES`, `ALL_CASE_000_SUSPECTS`, `DEFAULT_VICTIM_DEVICE` hardcode.
- Studio Checkpoint/Dossier nhận vụ án từ URL `?case=` và giữ lựa chọn khi tải lại; bỏ alias UUID→`case_000`. Playtest, trang kích hoạt và phòng chơi nhóm dùng slug của vụ án.
- Key localStorage của mọi vụ khác `case_000` luôn có tiền tố `<slug>::` (kể cả `followup_*`, `indictment_*`); case_000 giữ key cũ để không mất tiến trình.

### Security

- **RLS hardening** (`db/schema/21_security_hardening_rls.sql`, đã áp dụng production): chặn leo thang quyền qua `profiles.role` (trước đó anon cũng sửa được); `cases`, `dossier_documents`, `case_dossiers`, `app_settings`, `play_sessions`, bucket `avatars` chỉ admin ghi; `feedbacks` chỉ admin đọc/cập nhật.
- `requireAdminAuth()` chặn user không có row `profiles` (trước đây lọt qua).
- Thêm `requireAdminAuth()` cho 15 server action quản trị; bỏ bypass `NODE_ENV === 'development'` trong `board-actions.ts`.
- `denyIfNotAdmin()` cho POST `/api/admin/map-vector`, `/api/admin/pins`, `/api/reinvestigation`; `/api/reinvestigation` whitelist `caseId` chống path traversal.

### Removed

- **Dead code**: 14 file không còn importer (xem `docs/TECHDEBT.md` #13). Import `PhoneSimulator` trỏ thẳng `@/components/phone-engine/phone-simulator`.
- **Dependencies**: `pdfkit`, `pdf-lib`, `leaflet`, `@types/leaflet`, `shadcn`, `@playwright/test`, `@vercel/analytics` (app chạy VPS, không còn trên Vercel). `@types/three` chuyển sang devDependencies. Đồng bộ cả `pnpm-lock.yaml` và `package-lock.json` (Docker/CI dùng npm).

## [2026-10-21]

### Fixed

- **Landing 360 keyhole section (`#hien-truong-360`)**:
  - Gốc lỗi: `html, body { overflow-x: hidden }` biến body thành scroll container không cuộn ⇒ `position: sticky` mất tác dụng, section cao `340vh` chỉ dính 1 màn hình đầu rồi để lại 240vh đen. Đổi sang `overflow-x: clip` (giữ chặn tràn ngang, không tạo scroll container).
  - Dựng lại mặt khoá bằng mô hình 3D thật (`LandingKeyholeModel`, React Three Fiber): `ExtrudeGeometry` dày `0.15` đơn vị, bevel siêu nhỏ `0.002` (đủ bắt sáng mép, không tạo vết cắt phẳng) + lỗ xuyên tâm. Silhouette `PLATE_OUTLINE` và lỗ khoá `SLOT_POINTS` trace trực tiếp từ ảnh chính diện; lỗ được densify + Chaikin để mép cắt sạch bậc thang pixel khi soi gần.
  - Texture `keyhole_plate_albedo.webp` (WebP 120KB, `910×1725`) có alpha cut-out theo silhouette đồng thau, nên mép mô hình không lộ nền xám studio.
  - Scroll 2 pha: camera xoay từ góc nhìn trên xuống về chính diện, rồi dolly xuyên qua lỗ khoá. Mặt nạ SVG che ngoài lỗ được chiếu qua đúng camera nên mép khít ở mọi góc; khi camera vào tới lỗ, mặt khoá mờ dần và khẩu độ mở rộng để không còn mảng đồng thau nhoè ở góc khung.
  - Bỏ hẳn `keyhole.glb` 6.6MB + HDR `Environment` tải từ CDN khỏi landing.
  - Panorama landing dùng `PANORAMA.webp` (`3072×1715`, 0.46MB) thay `PANORAMA.png` 10.1MB; bản PNG giữ nguyên cho `Scene360Viewer`.

### Added

- **Checkpoint dependency graph & Flow view (`/studio/checkpoints`)**:
  - Cột `case_checkpoints.depends_on TEXT[]` + GIN index (`db/schema/17_case_checkpoint_dependencies.sql`).
  - Graph engine `lib/cms/checkpoint-graph.ts`: dựng cạnh, gợi ý từ `followup_of` / `requiredEvidenceIds`, chặn cycle, layout theo tầng.
  - React Flow view `components/admin/checkpoint-studio/checkpoint-flow-view.tsx`: kéo nối, xóa cạnh, nhận gợi ý, Fit, tự sắp xếp; mobile read-only.
  - Server action `updateCheckpointDependencies()` validate batch và chỉ ghi `depends_on`.
  - Form/Flow toggle trong Checkpoint Studio; dirty tracking độc lập cho form và sơ đồ.
  - Xóa checkpoint tự dọn tham chiếu trong `depends_on`; khóa đổi `checkpoint_id` sau khi tạo.
  - Gợi ý cạnh không hardcode tên nhân vật/tên bộ hồ sơ, dùng khóa tham chiếu CMS tự do.

### Changed

- **Runtime checkpoint chuyển sang Checkpoint Studio (Supabase)**:
  - Thêm `app/api/checkpoints/route.ts` (`force-dynamic`, `no-store`) và hook `useStudioCheckpoints` (memory cache 30s, dedupe request).
  - Thêm `lib/cms/checkpoint-runtime.ts` map row `case_checkpoints` sang `Checkpoint` runtime.
  - `useCaseCheckpoints` ghép checkpoint từ Studio với evidences từ Google Sheets; không còn đọc tab `checkpoints`.
  - `hint-modal`, `checkpoint-hint-section`, `use-active-checkpoint-hints` đọc dữ liệu Studio.
  - Migration `db/schema/18_case_checkpoints_public_read.sql` mở quyền đọc public cho runtime.
- **UI quản lý checkpoint theo Node ID**:
  - Sidebar, node flow, nhãn cạnh và cảnh báo phụ thuộc hiển thị `node_id` thay vì `checkpoint_id`.
  - Admin pin modal lấy danh sách checkpoint từ Studio/Supabase thay vì preset Sheet.
- **Gỡ checkpoint "Khám xét lại" khỏi bàn điều tra**: xóa base pin `c0-pin-reinvestigate`, fallback hội tụ trong `pin-builder.ts`, pin preset và step walkthrough.
- **Lưu vị trí node trên Flow view**:
  - Thêm cột `case_checkpoints.flow_position JSONB` (`db/schema/19_case_checkpoint_flow_positions.sql`).
  - Server action `updateCheckpointPositions()` ghi batch vị trí.
  - Kéo node hoặc bấm Tự sắp xếp sẽ đánh dấu sơ đồ chưa lưu; nút **Lưu sơ đồ** ghi cả `depends_on` và `flow_position`.
- **Bố cục lại Checkpoint Studio**:
  - Danh sách node chuyển sang bên phải; bỏ bộ lọc và badge bộ hồ sơ khỏi danh sách.
  - Flow view gom node theo lane bộ hồ sơ (`dossier`) để thấy checkpoint thuộc bộ nào.
  - Danh sách node compact: chỉ hiện tiêu đề, phân cách bằng đường mảnh, bỏ Node ID khỏi từng dòng.
  - Bấm node trong danh sách căn node tương ứng vào giữa Flow view và mở hộp biên tập ngay dưới danh sách.
  - Bỏ tab Form/Flow; hộp biên tập compact thay cho trang form cũ, lược mô tả và dùng input nhỏ cho trường ít thông tin.

### Notes

- Google Sheets chỉ còn quản lý tab `evidences`.
- `checkpoint_id` vẫn là khóa kỹ thuật nội bộ của đồ thị phụ thuộc.

## [2026-10-20]

### Added

- **Checkpoint Studio (`/studio/checkpoints`)**:
  - Module master-detail biên tập checkpoint, đáp án, gợi ý đa cấp, narrative và AI check bằng form có cấu trúc.
  - Bảng Supabase mới `case_checkpoints` (`db/schema/16_case_checkpoints.sql`) với RLS chỉ admin.
  - Server actions CRUD `getCheckpointsByCase`, `saveCheckpoint`, `deleteCheckpoint` trong `lib/actions/checkpoint-actions.ts`.
  - Bộ component `components/admin/checkpoint-studio/*` và section form theo 3 lớp Động cơ / Ngoại phạm / Mâu thuẫn.
  - Sidebar Admin Studio bổ sung mục Checkpoint Studio; `AdminShell` mở full-bleed cho route mới.
  - Đặc tả kỹ thuật `docs/core_specs/19_checkpoint_studio.md`.
  - Script `scripts/import-checkpoints-to-supabase.mjs` (`pnpm import:checkpoints`) import toàn bộ tab `checkpoints` vào `case_checkpoints`, upsert theo `(case_id, checkpoint_id)`.
  - Giữ nguyên `type` gốc khi import; checkpoint ngoài `evidence_picker` hiển thị read-only trong Studio V1.

### Notes

- Runtime gameplay **chưa** chuyển nguồn: vẫn đọc tab `checkpoints` từ Google Sheets. Đã import 13 checkpoint của `case_000` vào Supabase nhưng chưa nối `useCaseCheckpoints`.

## [Unreleased] - 2026-10-12

### Added

- **Vertical Corkboard Stage Preview (`/board-stage`)**:
  - Thêm trang stage preview thử nghiệm bảng ghim khổ dọc với các nút ghim và dây chỉ điều tra nối động (`app/(investigation)/board-stage/page.tsx`).
  - Bổ sung 3 ảnh nền texture corkboard dọc (`detective_desk_ambient_vertical.jpg`, `pure_cork_texture_vertical.jpg`, `vintage_framed_corkboard_vertical.jpg`).
- **Default Avatar Placeholder (`/public/images/avatar_placeholder.svg`)**:
  - Bổ sung SVG placeholder hình bóng điều tra trung tính làm fallback chuẩn cho toàn bộ nghi phạm và nhân chứng.
- **Drive PDF URL Normalizer (`lib/utils.ts`)**:
  - Bổ sung hàm `normalizeDrivePdfUrl` tự động chuyển link Google Drive sang `/preview` và gỡ bỏ thanh công cụ PDF iframe `#toolbar=0&navpanes=0`.

### Changed & Enhanced

- **Evidence Workspace Reorganization (`app/(investigation)/evidence/web/page.tsx`)**:
  - Tái cấu trúc không gian phòng lưu trữ vật chứng thành layout 3 vùng độc lập (Dossier Selector ➔ Item List ➔ Full-Viewport Inspector).
  - Tối ưu hóa khung soi vật chứng (`evidence-detail-inspector.tsx`) với chế độ hiển thị tối đa diện tích (Full Viewport Object-Contain), nút mở rộng/thu gọn và iframe tài liệu sạch sẽ.
- **Dynamic Pin Cards & Asset Deprecation (`card-composite.ts`, `hero-interactive.tsx`)**:
  - Gỡ bỏ hoàn toàn 14 file ảnh dán băng dính tĩnh cũ (`pinned_photos_with_tape/*`).
  - Chuyển giao sang công nghệ Dynamic Card Composite dựng khung Polaroid + băng dính giấy răng cưa động trên Canvas 60 FPS.
- **Live Google Sheets CMS Resilience (`app/api/phone/route.ts`)**:
  - Hỗ trợ cơ chế phân giải tab kép: tự động truy vấn tab `evidences` và fallback sang `photos`, `photos_old`, `evidences_old`.
  - Bổ sung ánh xạ 2 chiều (Two-way aliasing) giữa `code` <-> `photo_code` và `label` <-> `title`.
  - Phát hiện lỗi redirect tự động của Google Sheets gviz CSV khi tab không tồn tại.
- **Consolidate iPhone Apps Sheet (`apps` Tab)**:
  - Hợp nhất dữ liệu 3 ứng dụng `banking`, `notes` và `safari` vào chung một tab `apps` duy nhất trên Google Sheets Live CMS (`scripts/migrate-to-apps-sheet.js`, `update-sheet-headers-with-icons.js`).
  - Cập nhật các component `banking-app.tsx`, `notes-app.tsx`, `safari-app.tsx` và `dashboard-client.tsx` đọc trực tiếp từ tab `apps`, tự sinh mã FT tham chiếu ngân hàng.
- **Dynamic Suspect Pool (`lib/cases/case-000-suspects.ts`, `mindmap/add-suspect-modal.tsx`)**:
  - Hỗ trợ nạp nghi phạm mở rộng (`extraCharacters`) từ Live CMS vào hàm nhận diện `findValidCaseCharacter`.
  - Cải tiến tương tác click mở modal chỉnh sửa và zoom ảnh trên Mindmap Canvas.

## [2026-10-10] - 2026-10-10

### Added

- Created `PhoneApp` (`components/investigation/iphone/apps/phone-app.tsx`) covering:
  - **Recents Tab (Figma Frame 22:582)**: Call history list with missed call highlights in red (`#BA1A1A`), contact names, call types, timestamps, call durations, and detail info triggers.
  - **Keypad Tab (Figma Frame 22:453)**: 75px circular keypad buttons with light weight numbers & sub-letter subtitles, numeric input display, green call button (`#34C759`), delete button, and bottom tab bar navigation.
- Added Phone Evidence Node (`c0-pin-victim-phone`) to interactive Canvas & Hero boards (`HeroInteractive` & `MainInvestigationCanvas`) with direct modal click integration.
- Added comprehensive documentation & handover specs (`FIGMA_HANDOVER_SPEC.md`, `10_figma_design_workflow.md`, updated `ASSET_CATALOG.md` & `04_ux_ui_design_system.md`).

### Enhanced

- **Interactive Walkthrough (`interactive-walkthrough.tsx`)**:
  - Implemented SVG cutout masking (`#walkthrough-spotlight-mask`) for sharp, 100% crisp highlight over target pins without muddy backdrop blurring.
  - Added golden ambient illumination border and pulsating radar target indicator.
  - Connected `onStepChange` callback to live canvas state for synchronised pin highlighting.
- **Investigation Board Auto-Sync (`main-investigation-canvas.tsx`)**:
  - Upgraded layout cache version to `2026.10.10_v6_phone_node` to auto-invalidate stale localStorage coordinates for new forensic nodes.
- **Lock Screen (Figma Frame 22:389)**:
  - Aligned time font to 80px font weight 200 (Extra Light) with exact line-height and letter-spacing.
  - Aligned date text font size (17px, Regular) and letter-spacing.
  - Rendered Ocean Waves Ambient music player widget (320x56px, blur 40px, rounded-12px) per Figma specifications.
  - Added Control Center drag indicator (36x4px, blur 12px) and circular camera action shortcut button (44x44px).
  - Shimmering "slide to unlock" action row.
- **Messages App (Figma Frame 22:755)**:
  - Updated conversation thread item list row height to exact 86px with padding `[12px, 16px, 12px, 24px]`.
  - Applied 17px semi-bold sender name typography and 15px subtext preview font size.
- **Phone & Messages Light Theme (100% Figma Spec)**:
  - Converted `PhoneApp` + `MessagesApp` + status bar to exact Light theme: bg `#FAF9FE`/`#FFFFFF`, divider `#E3E2E7`, keypad btn `#E9E7ED` (74px, gap row 14 / col 44), number font 34px light `#1A1B1F`, sub-letter 9px medium `#414755`, call btn `#4CD964`, missed-call red `#FF3B30`, info blue `#007AFF`, tab-active blue `#0058BC`, tab-inactive `#717786`, voicemail badge `#BA1A1A`.
  - Status bar auto-switches to dark text on white bg inside Phone/Messages apps.
  - Fixed 3 stray TS errors: missing `BOARD_FRAME_SRC` import, `threads` prop type on `MessagesApp`.
  - Verified `npx tsc --noEmit` passes clean.
