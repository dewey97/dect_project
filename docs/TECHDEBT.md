# Danh Mục Nợ Kỹ Thuật (Tech Debt Ledger)

> **Quản lý Nợ Kỹ Thuật Dự Án XPLORE (dect_project)**
> Học tập theo tiêu chuẩn quản trị từ hệ thống Lendi: Gán mã số bất biến (`#ID`) cho từng hạng mục để dẫn xuất trực tiếp từ mã nguồn (`// docs/TECHDEBT.md #ID`), xóa bỏ hoàn toàn các `TODO` trôi nổi không rõ nguồn gốc.

---

## 📑 Mục Lục & Cấu Trúc 2 Tầng

- **[Phần 1 — Nghẽn do Dữ liệu / Live CMS / Backend](#phần-1--nghẽn-do-dữ-liệu--live-cms--backend)**: Các thành phần giao diện hiện đang hiển thị dạng **Mock / Trang trí (Decorative) / Fallback tĩnh**, chỉ có thể kích hoạt hoàn chỉnh khi có dữ liệu thật từ Google Sheets Live CMS hoặc Backend.
- **[Phần 2 — Nợ Tối Ưu Hóa & Công Cụ (Codebase & Tooling Debt)](#phần-2--nợ-tối-ưu-hóa--công-cụ-codebase--tooling-debt)**: Các tính năng đã hoạt động được; phần việc còn lại là refactor mã nguồn, dọn dẹp import, tối ưu bundle hoặc bổ sung kiểm thử tự động.

> [!IMPORTANT]
> **Quy ước Mã Số Bất Biến (`#ID`)**: Mã số dòng được đánh tăng dần và **không bao giờ tái sử dụng khi xóa dòng**. Điều này đảm bảo các comment trong mã nguồn (`// docs/TECHDEBT.md #01`) luôn giữ nguyên ngữ nghĩa lịch sử.

---

## 🧩 Phần 1 — Nghẽn do Dữ liệu / Live CMS / Backend

| # | Hạng Mục | Hiện Trạng Trong Mã Nguồn | Điều Kiện Tháo Gỡ (Unblock Requirement) | Vị Trí Hiển Thị UI Hiện Tại |
|---|:---|:---|:---|:---|
| **01** | **File ghi âm giọng nói nhân chứng phụ (Voice Acting)** | Một số lời khai chưa có file thoại thật (`.mp3`), hiện hiển thị text kèm hiệu ứng sóng âm tượng trưng. | Cần file thu âm diễn viên lồng tiếng (Khang, Vy, Hà) đưa vào `public/audio/`. | Modal lời khai nhân chứng (`testimony-modal.tsx`). |
| **02** | **Tính năng Chơi Nhóm Realtime (Group Play)** | Đã kích hoạt hoàn chỉnh phòng chơi 4 ký tự Crockford Base32, Supabase Realtime Broadcast đồng bộ tiến trình giải checkpoint và chỉ điểm tài liệu/vật chứng giữa các thám tử. | ✅ Đã hoàn thành | Menu phòng chơi nhóm & Header (`room-sync-context.tsx`). |
| **03** | **Khám xét hiện trường 360 Panorama (Mở ngay từ đầu)** | Chế độ khám xét hiện trường được mở ngay từ đầu vụ án (không yêu cầu mở khóa muộn). Sử dụng `Scene360Viewer` (Three.js WebGL equirectangular sphere) nhúng vào `reinvestigation-modal.tsx` cùng ảnh 360 `PANORAMA.png`. | ✅ Đã hoàn thành | Thanh công cụ phá án (`reinvestigation-modal.tsx`). |
| **08** | **Liên kết Google Sheet cho Waitlist Landing Page** | Giao diện và API `/api/waitlist` đã dựng xong với rate-limit và local backup `data/waitlist_pending.json`. | Cung cấp ID Google Sheet vào biến môi trường `WAITLIST_SHEET_ID` để kích hoạt ghi realtime vào Sheet. | Landing Hero, Case Dispatch Section, Landing Footer. |
| **09** | **Hệ thống Quản lý Lượt Chơi & Thanh Toán License (Credit / PayOS / VietQR)** | Logic game và tạo phòng hiện đang mở tự do (Open Access). Cần bảng `licenses` trong Supabase để trừ lượt tạo phòng của Host (`group_credits`) và tích hợp cổng thanh toán VietQR / SePay để mua thêm lượt. | Tạo bảng `licenses` và webhook thanh toán theo [`core_specs/08_license_technical_spec.md`](core_specs/08_license_technical_spec.md). | Header Host & Modal tạo phòng nhóm. |

---

## 🛠️ Phần 2 — Nợ Tối Ưu Hóa & Công Cụ (Codebase & Tooling Debt)

| # | Hạng Mục | Hiện Trạng Trong Mã Nguồn | Giải Pháp Kỹ Thuật Dự Kiến | Trạng Thái |
|---|:---|:---|:---|:---|
| **04** | **Defensive Cache-Control trên API lỗi** | Đã xây dựng `lib/security/defensive-cache.ts` đè `no-store` và `must-revalidate` cho response lỗi và dynamic CMS. | Hoàn thành | ✅ Đã hoàn thành (Pha 3) |
| **05** | **Rate Limiting Endpoint Nhập Mật Mã & AI Suy Luận** | Đã xây dựng `lib/security/rate-limiter.ts` với IPv6 `/64` grouping và bọc cho API suy luận `app/api/verify-finding/route.ts` & `reinvestigation`. | Hoàn thành | ✅ Đã hoàn thành (Pha 3) |
| **06** | **Script Tự Động Dọn Đĩa VPS (`docker-reclaim`)** | Đã viết `scripts/vps-docker-reclaim.sh` với cơ chế kiểm tra container running trước khi dọn và bảo vệ image `:previous`. | Hoàn thành | ✅ Đã hoàn thành (Pha 4) |
| **07** | **Chuẩn Hóa Type-Only Imports** | Đã rà soát và áp dụng cú pháp `import type` trên toàn bộ các route và components chính nhằm triệt tiêu nguy cơ lỗi Next.js 16 Silent 404 Turbopack. | Hoàn thành | ✅ Đã hoàn thành |
| **10** | **Quy hoạch & Khử Trùng Lặp Thư Mục iPhone Simulator** | Đã xóa sổ hoàn toàn thư mục rác `components/investigation/iphone/` (hơn 3,500 dòng code trùng lặp), thống nhất duy nhất về `components/phone-engine/`. | Hoàn thành | ✅ Đã hoàn thành |
| **11** | **Module Hóa Các Modal & Page Monolithic Lớn** | Đã chia nhỏ các tệp >1,000 dòng: tách `add-suspect-modal.tsx` (thành `SuspectEvaluationModal`, `SuspectExitConfirmModal`, `InterrogationClueStep`), tách `evidence/web/page.tsx` (thành `DossierTray`, `InvestigationMobileNav`), tách `followup-question-modal.tsx` (thành các form Vũ, Hà, Tùng, Custom và `HaDiscoveredPhotosPopup`). | Hoàn thành | ✅ Đã hoàn thành |
| **12** | **Tối Ưu Hóa Độ Trễ Vẽ Bản Đồ Vector (Map Studio & Engine)** | Tích hợp thuật toán Ramer-Douglas-Peucker (RDP) rút gọn điểm vẽ, bộ lọc khoảng cách tối thiểu (min-distance click filter), Spatial Grid Snapping và Canvas 2D Direct DOM. | Hoàn thành | ✅ Đã hoàn thành |
| **13** | **Dọn Dead Code & Dependency Thừa** | Đã xóa 14 file không còn importer (UI primitive `progress`/`scroll-area`/`separator`, `noir-*`, `contacts-app`, `voicemail-app`, `cinematic-investigation-scroll`, `suspect-exit-confirm-modal`, `use-phone-engine`, `use-active-checkpoint-hints`, `default-map-vector-seed`, adapter `investigation/phone-simulator` + barrel `phone-engine/index.ts`). Gỡ `pdfkit`, `pdf-lib`, `leaflet`, `@types/leaflet`, `shadcn`, `@playwright/test`, `@vercel/analytics`; chuyển `@types/three` sang devDependencies. Giữ `react-is` (peer dep của `recharts`). | Còn lại: `archive_3d_vault/` + `/cabinet-demo` (đóng băng theo AGENTS.md §8), `evidence-theme-context.tsx` (chưa có importer), static data trong `lib/case-locations-data.ts`. | 🟡 Một phần |
| **14** | **Multi-case: mã vụ án & nhân vật (GĐ 0+1)** | Đã có `cases.slug`, `case_characters`, Studio Nhân vật, provider nạp nhân vật cho gameplay. | Còn lại (GĐ 2–3): `board-stage` / `evidence/boardgame` / `evidence/[id]` vẫn cố định case_000; `CASES_CATALOG` tĩnh ở `/activate` (chờ License #09); FK cho `boardgame_pins` sau khi dữ liệu `case-000` được ghi lại; text "Khang" trong phone apps; luồng vu/tung/ha và `cp-000-*` trong modal gameplay. | 🟡 Một phần |
