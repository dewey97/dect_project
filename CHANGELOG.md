# Changelog

All notable changes to the Detective Case System (dect_project) will be documented in this file.

## [2026-10-22]

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
