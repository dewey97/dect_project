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
| **02** | **Tính năng Chơi Nhóm Realtime (Group Play)** | Giao diện đã có nút chuyển đổi chế độ nhưng backend đồng bộ phòng chơi 4 chữ cái chưa kích hoạt. | Chờ triển khai Supabase Realtime theo tài liệu [`core_specs/11_group_play_realtime_spec.md`](core_specs/11_group_play_realtime_spec.md). | Menu điều hướng phòng chơi nhóm. |
| **03** | **Khám xét lại hiện trường 360 Panorama** | Toàn bộ phân hệ 3D/360 hiện đóng băng an toàn trong `archive_3d_vault/`; giao diện đang dùng 2D Point-and-Click. | Giữ nguyên 2D Point-and-Click cho đến khi có ảnh panorama 360 render hoàn thiện và User ra lệnh mở lại. | Khám xét lại hiện trường (`reinvestigation_hotspots.md`). |

---

## 🛠️ Phần 2 — Nợ Tối Ưu Hóa & Công Cụ (Codebase & Tooling Debt)

| # | Hạng Mục | Hiện Trạng Trong Mã Nguồn | Giải Pháp Kỹ Thuật Dự Kiến | Trạng Thái |
|---|:---|:---|:---|:---|
| **04** | **Defensive Cache-Control trên API lỗi** | Đã xây dựng `lib/security/defensive-cache.ts` đè `no-store` và `must-revalidate` cho response lỗi và dynamic CMS. | Hoàn thành | ✅ Đã hoàn thành (Pha 3) |
| **05** | **Rate Limiting Endpoint Nhập Mật Mã & AI Suy Luận** | Đã xây dựng `lib/security/rate-limiter.ts` với IPv6 `/64` grouping và bọc cho API suy luận `app/api/verify-finding/route.ts` & `reinvestigation`. | Hoàn thành | ✅ Đã hoàn thành (Pha 3) |
| **06** | **Script Tự Động Dọn Đĩa VPS (`docker-reclaim`)** | Đã viết `scripts/vps-docker-reclaim.sh` với cơ chế kiểm tra container running trước khi dọn và bảo vệ image `:previous`. | Hoàn thành | ✅ Đã hoàn thành (Pha 4) |
| **07** | **Chuẩn Hóa Type-Only Imports** | Một số component vẫn còn import lẫn lộn value và type (nguy cơ dính lỗi Next.js 16 Silent 404). | Rà soát `import type` trên toàn bộ các route `app/**/page.tsx` theo quy tắc dự án. | 🔄 Đang rà soát |
