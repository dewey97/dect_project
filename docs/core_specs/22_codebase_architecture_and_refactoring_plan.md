# Đặc Tả Kiến Trúc Codebase & Kế Hoạch Quy Hoạch Tái Cấu Trúc (Codebase Architecture & Refactoring Plan)

> **Mã tài liệu**: `SPEC-22`  
> **Trạng thái**: Đã phê duyệt đề xuất (Ready for Execution)  
> **Phạm vi**: Toàn bộ codebase `dect_project` (App router, Components, Lib, Types)

---

## 1. Bối Cảnh & Mục Tiêu Quy Hoạch

Trải qua quá trình phát triển nhanh các tính năng cốt lõi (Live CMS Studio, Phone Simulator, Vector Map Engine, Re-investigation 360, Dossier System), codebase của dự án đã mở rộng đáng kể. Một số thành phần thử nghiệm ban đầu (legacy canvas, mockup Google Sheets, các modal cũ dạng bản nháp) hiện không còn được render nhưng vẫn nằm rải rác, gây ra hiện tượng:
1. **Phân mảnh vị trí định nghĩa Type** (`/types/` ở thư mục gốc vs `/lib/types/` trong thư mục lib).
2. **File rác / Dead code (Zombie components)**: Các modal và module cũ không được import ở bất kỳ đâu nhưng vẫn chiếm dung lượng và gây phân tâm khi bảo trì.
3. **Sự nhập nhằng giữa các Studio**: Thư mục `components/admin/evidence-studio` chỉ có 2 file và chỉ phục vụ cho Dossier Studio.
4. **Tên gọi chưa chuẩn hóa ngữ nghĩa**: Thư mục `components/investigation/mindmap/` thực chất là không gian **Bảng ghim điều tra án** (`Investigation Board Canvas` + các modal giải checkpoint/thẩm tra), không phải sơ đồ tư duy (mindmap) đơn thuần.

**Mục tiêu quy hoạch**:
- Tinh gọn cây thư mục, đảm bảo nguyên tắc Single Source of Truth cho Types.
- Loại bỏ 100% dead code và component mồ côi.
- Quy hoạch ranh giới module rõ ràng giữa Game Client (`components/investigation/`) và CMS Studio (`components/admin/`).
- Đảm bảo 100% tính tương thích ngược, không gây break build hay lỗi CI/CD Docker VPS.

---

## 2. Báo Cáo Rà Soát Chi Tiết Hiện Trạng Codebase

### 2.1. Đánh giá Cây Thư mục Hiện tại

| Phân hệ / Thư mục | Trạng thái hiện tại | Mức độ hợp lý | Đánh giá chính |
| :--- | :--- | :---: | :--- |
| **`app/(admin)/studio`** | 10 sub-routes Studio | 🟡 **Khá** | Còn 2 route redirect thừa (`characters/`, `evidence/`) do đã được gộp vào Checkpoint Studio và Dossier Studio. |
| **`app/(investigation)`** | 4 sub-routes (`board-stage`, `evidence/web`, `boardgame`, `cabinet-demo`) | 🟡 **Khá** | Trang `cabinet-demo` đã đóng băng nhưng vẫn mở route public; luồng trải nghiệm chính cần được định danh rõ. |
| **`components/admin`** | 5 folder Studio + shell/sidebar | 🟢 **Tốt** | `evidence-studio` chỉ có 2 file và đang được dùng bên trong `dossier-studio`. |
| **`components/investigation`** | 5 sub-folders + 20+ root modals | 🔴 **Cần quy hoạch** | Chứa nhiều file dead code (zombie modals), `hero-interactive/` cũ không ai render, tên `mindmap/` lệch ngữ nghĩa. |
| **`components/phone-engine`** | 4 sub-folders (`apps`, `chassis`, `core`, `system`) | 🟢 **Rất tốt** | Rất module hóa, clean, chuẩn kiến trúc vi mô giả lập OS độc lập. |
| **`components/public`** | Các section Landing page & Showcase | 🟢 **Rất tốt** | Tách bạch hoàn toàn khỏi gameplay theo đúng Rule 9. |
| **`types/` vs `lib/types/`** | 2 nơi chứa file Type độc lập | 🔴 **Cần gộp** | Gây nhầm lẫn; `types/` chỉ có 3 file, toàn bộ type chính nằm ở `lib/types/`. |
| **`lib/`** | 15 sub-folders + 13 file loose ở root | 🟡 **Cần tinh gọn** | Các file map engine (`map-vector-*`, `map-routing`) nằm rải rác ngoài root. |

---

### 2.2. Danh Mục Mã Nguồn Zombie Cần Thanh Lọc (100% Dead Code)

1. **Phân hệ Canvas cũ `components/investigation/hero-interactive/` + `hero-interactive.tsx` (~18KB)**:
   - Bao gồm component chính và 8 file tiện ích: `card-composite.ts`, `render-scene.ts`, `use-board-zoom.ts`, `use-board-pointer.ts`, `use-live-pin-photos.ts`, `constants.ts`, `types.ts`, `utils.ts`.
   - **Tình trạng**: Không có bất kỳ page hay component nào render. `lib/actions/board-actions.ts` chỉ mượn tạm 2 interface `PinPoint`, `CaseConnection`.
2. **7 Modal cũ mồ côi trong `components/investigation/mindmap/`**:
   - `culprit-epilogue-modal.tsx`: Đã được thay thế hoàn toàn bằng `components/investigation/epilogue-modal.tsx`.
   - `dossier-e-modal.tsx`: Đã được thay thế bằng `diegetic-document-reader.tsx`.
   - `dossier-result-modal.tsx`: Đã được thay thế bằng `phase-unlocked-modal.tsx`.
   - `phone-lookup-modal.tsx` & `phone-narrative-modal.tsx`: Đã tích hợp trực tiếp vào luồng giải đố trên bảng điều tra.
   - `gameplay-guide-modal.tsx`: Không còn import ở đâu.
   - `custom-pin-modal.tsx`: Không còn import ở đâu.
3. **Tàn dư Google Sheets CMS cũ**:
   - `components/investigation/google-sheets-presence-bar.tsx`: Không sử dụng.
   - `lib/google/auth.ts`: Không sử dụng (dự án chuyển sang Supabase 100% theo Rule 2).
4. **Phân hệ `viewers/` phụ**:
   - `components/investigation/viewers/` (`evidence-header.tsx`, `metadata-panel.tsx`, `recovery-status-panel.tsx`): Chỉ phục vụ cho `device-simulator-client.tsx` (trang cũ `/evidence/[id]`).

---

## 3. Kiến Trúc Mục Tiêu (Target Architecture)

```
dect_project/
├── app/
│   ├── (admin)/studio/          # 8 Studio chính thức:
│   │   ├── cases/               # Quản lý danh sách & trạng thái vụ án
│   │   ├── checkpoints/         # Biên soạn Checkpoint, Nhân vật, Kết luận & Hậu án
│   │   ├── dossier/             # Biên soạn Hồ sơ, Tài liệu PDF & Hiện trường 360
│   │   ├── phone/               # Cấu hình danh bạ, tin nhắn, apps điện thoại tang vật
│   │   ├── map/                 # Biên vẽ bản đồ vector & điểm POI
│   │   ├── feedbacks/           # Quản lý phản hồi người chơi
│   │   ├── players/             # Danh sách người chơi & tiến độ
│   │   └── settings/            # Cấu hình hệ thống & API Keys
│   ├── (investigation)/         # Game Client Runtime:
│   │   ├── board-stage/         # Bảng điều tra án mạng chính (Investigation Board)
│   │   ├── evidence/            # Không gian đọc tài liệu chứng cứ:
│   │   │   ├── web/             # Bàn làm việc số (Digital Evidence Desk)
│   │   │   └── boardgame/       # Màn hình trợ lý vụ án (Boardgame Companion)
│   │   └── layout.tsx
│   ├── api/                     # Supabase & Runtime APIs
│   ├── page.tsx                 # Landing Page giới thiệu (Marketing)
│   └── layout.tsx
├── components/
│   ├── admin/                   # UI Modules phục vụ CMS Studio:
│   │   ├── checkpoint-studio/   # Checkpoint, Characters, Indictment, Epilogue, Board Pins
│   │   ├── dossier-studio/      # Dossier Documents, Evidence & 360 Scene Config
│   │   │   └── evidence/        # Form vật chứng & cấu hình 360 hotspot
│   │   ├── map-studio/          # Vector Map & POI Editor
│   │   ├── phone-studio/        # Phone Simulator CMS
│   │   └── admin-shell.tsx
│   ├── investigation/           # Core Gameplay Client:
│   │   ├── board/               # Bảng án (Main Canvas, Pins, Layout, Interrogation & Indictment modals)
│   │   ├── evidence/            # Hồ sơ chứng cứ (Diegetic Reader, Dossier Sheet, Workspaces)
│   │   ├── viewers/             # 360 Panorama Viewer & Audio Narrator
│   │   └── archive_3d_vault/    # [FROZEN] Phân hệ 3D WebGL cũ theo Rule 8
│   ├── phone-engine/            # Phone Simulator OS (Apps, Chassis, System)
│   ├── public/                  # Landing page Showcase & Sections (Tách biệt khỏi game - Rule 9)
│   └── ui/                      # Base primitives (Button, Field, Input, Toast...)
├── lib/
│   ├── actions/                 # Next.js Server Actions (Supabase mutations)
│   ├── hooks/                   # Custom React Hooks
│   ├── maps/                    # Vector Map Engine (Routing, Canvas Renderer, Utils)
│   ├── supabase/                # Supabase Client & Server Helpers
│   ├── types/                   # NGUỒN TYPE DUY NHẤT TOÀN DỰ ÁN
│   └── ...                      # Core helpers (audio, storage, analytics)
```

---

## 4. Phương Án Quy Hoạch Từng Phân Hệ

### 4.1. Hợp Nhất Phân Hệ Types về `lib/types/`
- Chuyển `types/dossier.ts` ➔ `lib/types/dossier.ts`.
- Chuyển `types/map-vector.ts` ➔ `lib/types/map-vector.ts`.
- Chuyển `types/pdfjs-dist.d.ts` ➔ `lib/types/pdfjs-dist.d.ts` (hoặc root `next-env.d.ts`).
- Cập nhật các câu lệnh `import ... from "@/types/..."` thành `@/lib/types/...`.
- Xóa thư mục gốc `/types/`.

### 4.2. Gom `evidence-studio` vào `dossier-studio`
- Di chuyển `components/admin/evidence-studio/evidence-form.tsx` ➔ `components/admin/dossier-studio/evidence/evidence-form.tsx`.
- Di chuyển `components/admin/evidence-studio/scene-360-config-modal.tsx` ➔ `components/admin/dossier-studio/evidence/scene-360-config-modal.tsx`.
- Cập nhật import trong `dossier-studio-client.tsx` và `dossier-studio-sidebar.tsx`.
- Xóa thư mục `components/admin/evidence-studio/`.
- Xóa 2 route redirect thừa `app/(admin)/studio/characters/page.tsx` và `app/(admin)/studio/evidence/page.tsx`, thay thế bằng cấu hình chuyển hướng trong `next.config.ts` (nếu cần tương thích bookmark cũ).

### 4.3. Thanh Lọc & Tinh Gọn `components/investigation/`
- Chuyển các type `PinPoint`, `CaseConnection` từ `hero-interactive` sang `lib/types/database.ts`.
- Xóa hoàn toàn `components/investigation/hero-interactive/` và `hero-interactive.tsx`.
- Xóa 7 modal zombie trong `components/investigation/mindmap/` (`culprit-epilogue-modal.tsx`, `dossier-e-modal.tsx`, `dossier-result-modal.tsx`, `phone-lookup-modal.tsx`, `phone-narrative-modal.tsx`, `gameplay-guide-modal.tsx`, `custom-pin-modal.tsx`).
- Xóa `components/investigation/google-sheets-presence-bar.tsx` và `lib/google/auth.ts`.
- Đổi tên thư mục `components/investigation/mindmap/` ➔ `components/investigation/board/`:
  - `main-investigation-canvas.tsx` ➔ `investigation-board.tsx`.
  - Gom các modal thẩm tra/kết luận vào `components/investigation/board/modals/`.

### 4.4. Module Hóa Tiện Ích Bản Đồ trong `lib/`
- Tạo thư mục `lib/maps/`:
  - Chuyển `lib/map-routing-engine.ts` ➔ `lib/maps/routing-engine.ts`.
  - Chuyển `lib/map-vector-canvas-renderer.ts` ➔ `lib/maps/canvas-renderer.ts`.
  - Chuyển `lib/map-vector-utils.ts` ➔ `lib/maps/vector-utils.ts`.
  - Chuyển `lib/geometry/simplify-polyline.ts` ➔ `lib/maps/simplify-polyline.ts` (xóa thư mục `lib/geometry/`).

---

## 5. Lộ Trình Triển Khai Từng Bước (Safe Execution Protocol)

Để bảo đảm an toàn 100%, việc thực thi tuân theo 4 giai đoạn độc lập:

1. **Giai đoạn 1: Dọn rác Zombie & Code thừa an toàn**:
   - Xóa các file không có import phụ thuộc.
   - Chuyển 2 type interface của canvas cũ sang `lib/types/database.ts` và xóa `hero-interactive/`.
   - *Pre-flight check*: Chạy `npm run lint` (`tsc --noEmit`) xác nhận 0 lỗi.
2. **Giai đoạn 2: Hợp nhất Types**:
   - Chuyển các file trong `/types/` vào `lib/types/`, cập nhật import, xóa folder `/types/`.
   - *Pre-flight check*: Chạy `npm run lint` xác nhận 0 lỗi.
3. **Giai đoạn 3: Gom `evidence-studio` vào `dossier-studio`**:
   - Chuyển 2 component sang `dossier-studio/evidence/`, cập nhật import, xóa `evidence-studio`.
   - *Pre-flight check*: Chạy `npm run lint` xác nhận 0 lỗi.
4. **Giai đoạn 4: Chuẩn hóa ngữ nghĩa `board` và `lib/maps`**:
   - Gom các file bản đồ vào `lib/maps/`.
   - Đổi tên `mindmap` sang `board` và cập nhật import tương ứng.
   - *Final verification*: Chạy `npm run lint` xác nhận toàn bộ hệ thống thông suốt.
