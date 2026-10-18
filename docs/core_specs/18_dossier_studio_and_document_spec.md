# ĐẶC TẢ KỸ THUẬT: HỆ THỐNG BIÊN SOẠN HỒ SƠ HÀNH CHÍNH & DOSSIER STUDIO
# (DOSSIER STUDIO & ADMINISTRATIVE DOCUMENT SPECIFICATION)

> **Mã tài liệu:** `CORE-SPEC-018`  
> **Phiên bản:** `1.0.0`  
> **Trạng thái:** `Active / Implemented`  
> **Phạm vi áp dụng:** Bộ công cụ thiết kế hồ sơ (`/admin/dossier-studio`), Pipeline xuất bản tài liệu PDF in ấn (`public/documents/`), và Bàn điều tra trinh thám (`evidence/web`).

---

## 📑 1. Tổng Quan & Động Lực Phát Triển

Trong các vụ án trinh thám hình sự, tài liệu hành chính (biên bản lấy lời khai, lý lịch can phạm, kết quả khám nghiệm tử thi) là **"trái tim" của trải nghiệm phá án**. Để tạo ra cảm giác nhập vai chân thực tuyệt đối (Diegetic Immersion), các văn bản này không thể chỉ là văn bản thô (plain text) đơn điệu, mà phải sở hữu đầy đủ quy chuẩn thể thức văn bản hành chính Việt Nam kết hợp phong cách tài liệu lưu trữ vụ án cổ điển.

**Dossier Studio (`/admin/dossier-studio`)** là công cụ trực quan trên nền web cho phép đội ngũ biên kịch và thiết kế:
1. **Thiết kế & Biên soạn trực quan theo chuẩn in ấn**: Hỗ trợ chuẩn hóa khổ giấy A4 ($210 \times 297\text{ mm}$) và A5 ($148 \times 210\text{ mm}$), sẵn sàng in offset cho hộp Board Game vật lý hoặc xuất bản PDF cho bản Web App.
2. **Khớp nối 1:1 với Figma Master File**: Tái hiện toàn bộ bố cục, khung viền, con dấu tròn/vuông, và tem hồ sơ từ file thiết kế Figma gốc.
3. **Hiệu ứng vết tích điều tra (Investigative Artifacts)**: Tự do gắn con dấu "MẬT", "TỐI MẬT", gạch bút dạ quang vàng/đỏ (Highlighter), đính ảnh chân dung kẹp ghim và dấu vân tay lăn mực.

---

## 🏛️ 2. Các Chế Độ Biên Soạn Chuẩn (Dossier Modes)

### 2.1. Biên Bản Lấy Lời Khai (`loi_khai`)
Dành cho việc ghi nhận lời khai nhân chứng, người có quyền lợi liên quan và các nghi phạm bị triệu tập:
- **Tiêu đề hành chính**: Quốc hiệu, tiêu ngữ, tên cơ quan cảnh sát điều tra, số thụ lý vụ án.
- **Phần mở đầu tố tụng**: Thời gian, địa điểm, thành phần tiến hành lấy lời khai (Điều tra viên, Cán bộ ghi chép), người được lấy lời khai (Họ tên, năm sinh, nghề nghiệp, nơi cư trú).
- **Thân biên bản (Khối Q&A tuần tự)**: Các câu hỏi của điều tra viên (`Hỏi: ...`) và lời đáp của đối tượng (`Đáp: ...`).
  - Hỗ trợ đánh dấu cờ **Manh mối then chốt (`isClue: true`)**: Tự động hiển thị nét bút dạ quang vàng làm nổi bật mâu thuẫn trong lời khai.
- **Phần kết thúc biên bản**: Đọc lại biên bản, xác nhận tính trung thực, chữ ký tươi viết tay của cán bộ và người khai.

### 2.2. Bản Lý Lịch Bị Can (`ly_lich`)
Dành cho hồ sơ nhân thân và trích lục tư pháp của các đối tượng tình nghi:
- **Khung ảnh can phạm (Mugshot Frame)**: Đặt ở góc phải trên cùng, mô phỏng ảnh chụp nhận dạng có kẹp ghim bấm kim loại (`paperclip`).
- **Bảng dữ liệu nhân thân**: Bố cục dạng bảng lưới gồm Họ tên khai sinh, Bí danh, Số CCCD/CMND, Ngày cấp, Dân tộc, Trình độ văn hóa, Tiền án tiền sự.
- **Hộp vân tay lăn mực (Fingerprint Box)**: Khung lấy dấu vân tay ngón trỏ phải có vân chỉ tay mô phỏng mực lăn thực tế.
- **Kết luận xác minh sơ bộ**: Đánh giá tính cách, mối quan hệ xã hội và nguy cơ tẩu thoát.

---

## 🎨 3. Quy Chuẩn Đồ Họa & Thẩm Mỹ Diegetic

### 3.1. Hệ thống Con Dấu Nghiệp Vụ (Official Investigative Stamps)
- **Dấu MẬT / TỐI MẬT**: Hình chữ nhật viền kép màu đỏ son (`#A82020`), góc nghiêng ngẫu nhiên $2^\circ - 5^\circ$ như đóng tay thực tế.
- **Dấu Tròn Cơ Quan Điều Tra**: Con dấu tròn có quốc huy và tên đơn vị, độ trong suốt $0.85$ với hiệu ứng mực lem trên thớ giấy.
- **Dấu TEM HỒ SƠ (`Tag Code`)**: Khối mã số hồ sơ góc trái trên (ví dụ: `A-19`, `B-04`) in font Mono đậm nét.

### 3.2. Hiệu ứng Bút Dạ Quang (Highlighter Marks)
Các câu trả lời có mâu thuẫn hoặc manh mối quan trọng được tô nền bằng bút dạ quang:
- Nền vàng hổ phách (`rgba(251, 191, 36, 0.35)`) hoặc vàng neon dịu (`rgba(250, 204, 21, 0.4)`).
- Đường viền gợn sóng nhẹ tự nhiên, không che lấp chữ in phía dưới.

### 3.3. Typography & Màu Nền Giấy
- **Font máy đánh chữ cơ học**: `Courier Prime` và `Special Elite` dành cho các dòng văn bản đánh máy của điều tra viên.
- **Font hành chính chính quy**: `EB Garamond` và `Inter` cho phần tiêu đề văn bản và quy chuẩn văn phạm.
- **Font chữ ký viết tay**: `Dancing Script` và `Caveat` cho các chữ ký xác nhận của nhân vật.
- **Chất liệu giấy (Paper Texture)**: Màu vàng kem hoài cổ (`#FDFBF7` đến `#F4EFE6`) với viền mỏng và đổ bóng nhẹ.

---

## 🖨️ 4. Động Cơ In Ấn & Xuất Bản PDF (Print Engine)

Dossier Studio được tích hợp CSS `@media print` đạt chuẩn chuyên nghiệp:
- Tự động ẩn toàn bộ thanh công cụ điều khiển, sidebar và header khi ấn lệnh in (`window.print()`).
- Thiết lập kích thước trang tuyệt đối:
  ```css
  @page {
    size: A4 portrait;
    margin: 12mm 15mm 12mm 15mm;
  }
  ```
- Khử vỡ trang bất thường (`break-inside: avoid` trên từng khối hỏi đáp Q&A).
- Màu sắc và con dấu tự động chuyển sang cấu hình CMYK-friendly để khi xuất file PDF từ trình duyệt đạt chất lượng in ấn sắc nét nhất.

---

## 💾 5. Quản Lý Dữ Liệu & Sao Lưu (Data Contracts)

Dossier Studio hỗ trợ lưu trữ trạng thái hai chiều:
1. **Lưu nhanh vào LocalStorage**: Tự động lưu tiến độ chỉnh sửa của GM chống mất dữ liệu khi vô tình reload trang.
2. **Xuất file JSON kịch bản**: Tải file cấu trúc dữ liệu `.json` của toàn bộ hồ sơ để chia sẻ trong đội ngũ biên kịch.
3. **Nạp file JSON**: Khôi phục lại trạng thái thiết kế từ bản sao lưu chỉ với 1 click.
