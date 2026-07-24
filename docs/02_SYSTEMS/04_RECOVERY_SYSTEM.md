# ĐẶC TẢ HỆ THỐNG PHỤC HỒI DỮ LIỆU (RECOVERY SYSTEM) — VERITAS

> **Nhiệm vụ Hệ thống:** Mô phỏng công cụ khôi phục dữ liệu pháp y số, cho phép người chơi giải mã file bị hỏng, khôi phục tin nhắn/ảnh bị xóa từ bộ nhớ thiết bị thu giữ.

---

## 01. Cơ Chế Khôi Phục Dữ Liệu (Data Recovery Mechanics)

1. **Phân Tích File Hỏng (Corrupted Data Scan):** Người chơi phát hiện file ảnh/tin nhắn có trạng thái `corrupted: true`.
2. **Nhập Mã Khôi Phục / Tìm Mảnh Khóa (Decryption Key):** Tìm kiếm mã PIN, mật khẩu hoặc mã SHA đối ứng từ các vật chứng khác để giải mã.
3. **Kết Quả Phục Hồi (Recovered Output):** File hiển thị trạng thái `recovered: true`, mở ra đoạn chat bị ẩn hoặc bức ảnh chụp thực địa quan trọng.

---

## 02. Trình Giả Lập Điện Thoại (Phone Simulator Engine)

Giao diện giả lập điện thoại di động cổ điển (Nokia/Burner Phone) tích hợp 4 ứng dụng cốt lõi:
* 💬 **Tin Nhắn (SMS App):** Xem các hội thoại chưa đọc hoặc mã hóa.
* 🌐 **Nhật Ký Duyệt Web (Browser History):** Trích xuất đường link nội bộ nạn nhân từng truy cập.
* 📷 **Thư Viện Ảnh (Gallery):** Phục hồi các file ảnh chụp thực địa.
* 📞 **Danh Sách Cuộc Gọi (Call Logs):** Xem lịch sử cuộc gọi kèm vị trí tháp sóng (Cell Tower ID).