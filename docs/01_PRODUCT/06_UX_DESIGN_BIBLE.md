# NGUYÊN TẮC THIẾT KẾ GIAO DIỆN (UX DESIGN BIBLE) — VERITAS

> **Triết lý Thiết kế:** **Information Over Spectacle (Thông tin quan trọng hơn hiệu ứng).** Giao diện của VERITAS phục vụ việc đọc, đối chiếu và phân tích dữ liệu mượt mà nhất.

> ⚠️ Tài liệu này định nghĩa UX principles cấp sản phẩm. Xem thêm **[06_UX_UI/DESIGN_SYSTEM.md](../06_UX_UI/DESIGN_SYSTEM.md)** cho UI implementation tokens và component guidelines.

---

## 01. 3 Nguyên Tắc UX Bất Biến

1. **Dark Mode & Workstation Aesthetic:** Giao diện tông màu tối cao cấp (Slate/Zinc/Obsidian) mô phỏng máy trạm phân tích pháp y hiện đại. Tránh màu sặc sỡ không cần thiết.
2. **Focus & Space Control (Thu gọn giao diện):**
   * Cho phép thu gọn thanh danh mục bằng chứng bên trái và thanh Trợ lý Minh bên phải.
   * Dành 80% tầm mắt trung tâm cho văn bản, tài liệu và hình ảnh điều tra.
3. **Forensic Detail Toggle (Tắt/Bật chi tiết pháp y):**
   * Cho phép ẩn các thông số kỹ thuật sâu (Mã SHA-256, IMEI, nhật ký giám sát) khi không cần thiết để chống ngợp thông tin cho người chơi mới.

---

## 02. Quy Tắc Phản Hồi Tương Tác (Interactive Micro-Animations)

* **Alibi Clash Alert:** Khi người chơi ghép thành công 2 manh mối mâu thuẫn vào Timeline, giao diện chớp hiệu ứng viền đỏ báo động chuyên nghiệp kèm âm thanh xác thực nhẹ.
* **Smart Navigation Header:** Thanh điều hướng tự động trượt ẩn khi cuộn xuống đọc tài liệu và xuất hiện trở lại khi cuộn nhẹ lên trên.
* **Responsive Layout:** Tự động co giãn mượt mà từ màn hình di động 375px (Companion UI) đến màn hình máy tính 4K (OS Workstation).
