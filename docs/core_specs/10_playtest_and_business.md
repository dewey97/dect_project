
<!-- START OF MERGED FILE: 09_PLAYTEST/08_playtest_and_business.md -->

---
# QUY TRÌNH KIỂM THỬ & CÂN BẰNG TRẢI NGHIỆM CHƠI (PLAYTEST & BALANCING) — VERITAS

> **Nhiệm vụ Cốt lõi:** Hướng dẫn quy trình 3 giai đoạn để chạy thử (Playtest) và tinh chỉnh độ cân bằng kịch bản trước khi nạp vào môi trường Next.js 16 Web OS chính thức.

---

## 🔬 01. Quy Trình Kiểm Thử 3 Giai Đoạn (Playtest Workflow)

Mỗi vụ án sau khi được viết xong file `storyline.md` và `case.json` bắt buộc phải vượt qua 3 giai đoạn kiểm thử độc lập:

### Giai đoạn 1: Paper Playtest (Đọc Kiểm Thẩm Mỹ & Logic)
- **Hành động:** Cho 2 Biên kịch/Designer đọc trực tiếp file `storyline.md` mà không xem trước phần Lời giải ở cuối.
- **Mục tiêu:** 
  - Phát hiện các điểm phi lý về thuộc tính vật lý chất liệu hoặc pháp y (Đối chiếu `08_PITFALLS_AND_ANTI_PATTERNS.md`).
  - Đảm bảo người chơi có thể tự suy luận ra hướng giải quyết chỉ dựa trên các Manh mối (Clues) được gieo trong văn bản.

### Giai đoạn 2: Alpha Playtest (Kiểm Thử Kỹ Thuật Trạm Máy)
- **Hành động:** Lập trình viên nạp dữ liệu vụ án (`case.json`) vào môi trường Web local để chạy thử.
- **Mục tiêu:**
  - Kiểm tra xem các công cụ tương tác (Soi UV, zoom ảnh EXIF, so mẫu nhớt) hoạt động mượt mà không bị lỗi giao diện.
  - Chạy thuật toán so khớp đồ thị kết án `solution.requiredProofGraph` xem hệ thống có nhận diện chính xác các mã chứng cứ đính kèm của người chơi khi nộp báo cáo.

### Giai đoạn 3: Blind Playtest (Chơi Thử Giấu Đáp Án)
- **Hành động:** Đưa giao diện Web OS cho một nhóm người chơi thử hoàn toàn mới (ít nhất 5 người) chơi tự do mà không nhận được bất kỳ gợi ý ngoài luồng nào.
- **Mục tiêu:**
  - Đo lường cảm xúc thực tế khi phá án (đo mốc thời gian xuất hiện cảm xúc Eureka).
  - Thống kê tỷ lệ phá án thành công trong thời gian dự kiến (Quy chuẩn: 90 - 120 phút).

---

## ⚖️ 02. Kỹ Thuật Cân Bằng Kịch Bản (Difficulty Balancing)

Dựa trên số liệu thu thập từ Giai đoạn 3 (Blind Playtest), Designer thực hiện tinh chỉnh độ khó theo nguyên tắc:

### 1. Nếu Tỷ Lệ Phá Án Thành Công < 70% (Vụ án quá khó/tắc nghẽn)
- **Biện pháp xử lý:**
  - Chuyển 1-2 chứng cứ nhiễu (Red Herrings) sang dạng chứng cứ bối cảnh vô hại (World Building Clues).
  - Bổ sung **Optional Clues** bắc cầu nối logic cho những bước suy luận quá nhảy vọt.
  - Tối ưu hóa lại văn bản gợi ý Tier 1 và Tier 2 của Trợ lý Minh.

### 2. Nếu Tỷ Lệ Phá Án Thành Công > 95% (Vụ án quá dễ/thiếu thử thách)
- **Biện pháp xử lý:**
  - Tăng độ nhiễu (Clue Noise Ratio) lên thêm 10% (gieo thêm hành vi lén lút có động cơ riêng cho nghi phạm phụ).
  - Tăng độ phức tạp Alibi Clash bằng cách chèn thêm mốc thời gian trung gian trong timeline.
  - Giảm độ hiển thị trực diện của các Mandatory Clues (Vd: Thay vì tìm thấy trực tiếp, phải soi đèn Flash mặt sau tờ hóa đơn mới lộ ra).

---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 09_PLAYTEST/08_playtest_and_business.md -->

---
# CƠ SỞ DỮ LIỆU LỖI LOGIC & PHẦN MỀM (BUG DATABASE) — VERITAS

Tài liệu theo dõi các lỗi đứt gãy kịch bản, lỗi gãy đồ thị chứng cứ và lỗi UI.

---

* **Loại lỗi 1 — Logic Plot Holes:** Mâu thuẫn mốc thời gian giữa các tệp kịch bản.
* **Loại lỗi 2 — Graph Mismatch:** Mã bằng chứng trong file JSON Schema không khớp với UI.
* **Loại lỗi 3 — UI Friction:** Lỗi hiển thị Timeline trên màn hình nhỏ.
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 10_BUSINESS/08_playtest_and_business.md -->

---
# CHIẾN LƯỢC TẬP TRUNG THỊ TRƯỜNG & MARKETING (MARKETING PLAN) — VERITAS

> **Kênh tiếp cận:** Tập trung vào cộng đồng người hâm mộ trinh thám, board game suy luận và game thủ trinh thám số (*Her Story, Obra Dinn*).

---

* **Teaser Trailers:** Video mô phỏng màn hình khởi động dòng lệnh máy trạm chuyên nghiệp.
* **Kênh Streamers / Content Creators:** Gửi trước bản dùng thử các vụ án cho các YouTuber/Streamer chuyên giải đố.
* **Cộng đồng Board Game:** Tham gia các hội chợ triển lãm Board Game để giới thiệu trải nghiệm Hybrid (Vật lý + Web Companion).
---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 10_BUSINESS/08_playtest_and_business.md -->

---
# CHIẾN LƯỢC ĐỊNH GIÁ & MÔ HÌNH DÒNG TIỀN (MONETIZATION & PRICING) — VERITAS

---

## 01. Cấu Trúc Bán Vụ Án
* Free Diagnostic Tutorial: $0
* Single Digital Case: $4.99 - $9.99
* Physical Collector Box: $29.99 - $39.99
* Season Pass: $24.99

## 02. Nguyên Tắc Kinh Doanh Đạo Đức
* Tuyệt đối không bán gợi ý hay vật phẩm gian lận. Bán trọn gói nội dung vụ án.

---

<!-- END OF MERGED FILE: {src} -->

---

<!-- START OF MERGED FILE: 10_BUSINESS/08_playtest_and_business.md -->

---
# CHIẾN LƯỢC PHÁT HÀNH STEAM & BOARD GAME (PUBLISHING STRATEGY) — VERITAS

---

## 01. Chiến Lược Steam Release
* Đóng gói Next.js thành app Native (Electron/Tauri) phát hành trên Steam.
* Tích hợp Steam Wishlists & Steam Achievements.

## 02. Chiến Lược Board Game Manufacturing
* Đóng gói bản Collector Box vật lý với tài liệu in giấy Couché 250gsm + Mã kích hoạt Web.

---

<!-- END OF MERGED FILE: {src} -->
