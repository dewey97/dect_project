
<!-- START OF MERGED FILE: 06_UX_UI/06_ux_ui_design_system.md -->

---
# HỆ THỐNG THIẾT KẾ GIAO DIỆN (DESIGN SYSTEM OVERVIEW) — VERITAS OS

> **Aesthetic Cốt lõi:** Giao diện tối hiện đại (Modern Forensic Workstation), kết hợp kính mờ (Glassmorphism), hiệu ứng phát sáng nhẹ và mật độ hiển thị dữ liệu cao.

---

## 01. 3 Nguyên Tắc Giao Diện Cốt Lõi

1. **Dark Mode First:** Tông màu tối chủ đạo (Slate/Obsidian) giảm mỏi mắt cho người chơi khi phân tích tài liệu văn bản trong thời gian dài.
2. **Data-Density Balance:** Tối ưu khoảng cách hiển thị (spacing & padding) để vừa chứa được nhiều dữ liệu pháp y vừa giữ nhịp đọc dễ nhìn.
3. **Collapsible Workspace Panels:** Thanh danh mục bên trái và thanh trợ lý bên phải có thể thu gọn linh hoạt để nhường 80% diện tích màn hình cho khung phân tích chính.
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 06_UX_UI/06_ux_ui_design_system.md -->

---
# BẢNG MÀU, PHÔNG CHỮ & BIỂU TƯỢNG (DESIGN TOKENS) — VERITAS OS

---

## 01. Phông Chữ (Typography)
* **Primary Sans:** `Inter` / `Outfit` (Văn bản kịch bản & UI).
* **Monospace:** `JetBrains Mono` (Mã SHA-256, mốc thời gian ISO, tháp sóng).

---

## 02. Bảng Mã Màu Standard (Color Palette)
* **Obsidian Base:** `#090d16`
* **Card Zinc:** `#121824`
* **Cyan Accent:** `#06b6d4`
* **Alibi Clash Red:** `#ef4444`
* **Proof Emerald:** `#10b981`

---

## 03. Thư Viện Lucide Icons
* 📱 `Smartphone`, 📄 `FileText`, 🎙️ `Mic`, 📍 `MapPin`, 🚨 `AlertTriangle`, 🛡️ `ShieldCheck`.

---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 06_UX_UI/06_ux_ui_design_system.md -->

---
# THƯ VIỆN THÀNH PHẦN GIAO DIỆN (COMPONENT LIBRARY) — VERITAS OS

Tài liệu quy định các React Components dùng chung trong hệ thống.

---

## 01. Danh Mục Các Component Chính

* **`SmartHeader`:** Thanh điều hướng tự động trượt ẩn/hiện khi cuộn chuột.
* **`PhoneSimulator`:** Khung mô phỏng điện thoại di động Nokia cổ điển tích hợp SMS, Call logs, Gallery.
* **`WebDialPadWidget`:** Bộ quay số tự động mô phỏng cuộc gọi. Người chơi tìm thấy SĐT ngoài đời $\rightarrow$ Bấm số trên Web $\rightarrow$ Kích hoạt Voicemail hộp thư thoại hoặc AI nhân vật trả lời.
* **`CaseBoardWidget`:** Bảng bản đồ thành phố vĩ mô kết hợp Thẻ chứng cứ ghim chỉ đỏ nối mối quan hệ nghi phạm xuyên suốt nhiều vụ án.
* **`TimelineBuilder`:** Khung kéo-thả dựng mốc thời gian di chuyển của nghi phạm.
* **`EvidenceCard`:** Thẻ hiển thị tang vật kèm nút bật/tắt chi tiết pháp y.
* **`AlibiClashBanner`:** Banner chớp viền đỏ báo động mâu thuẫn ngoại phạm.
* **`HQReportModal`:** Khung biểu mẫu nộp báo cáo điều tra và đính kèm mã chứng cứ.
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 06_UX_UI/06_ux_ui_design_system.md -->

---
# THIẾT KẾ RESPONSIVE & MOBILE-FIRST — VERITAS OS

---

## 01. Quy Tắc Mobile-First (Companion Mode)
* Nút bấm có chiều cao tối thiểu `48px` cho thao tác cảm ứng.
* Sử dụng Bottom Sheet Drawers trượt lên từ đáy màn hình.

---

## 02. Responsive Breakpoints
* `sm` (640px) $\rightarrow$ `md` (768px - Tablet) $\rightarrow$ `lg` (1024px - Desktop Workstation) $\rightarrow$ `2xl` (1536px - 4K Data Density).

---

<!-- END OF MERGED FILE: {src} -->
