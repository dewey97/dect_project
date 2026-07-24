# Các Tính Năng Hiện Có Trên Hệ Thống VERITAS OS

Tài liệu này thuyết minh chi tiết cách vận hành và mã nguồn của từng tính năng chính trong hệ thống máy trạm điều tra VERITAS OS.

---

## 1. Trang Chủ & Smart Sticky Header (`/`)
* **Smart Sticky Navigation**: Thanh điều hướng tự động ẩn đi khi người chơi cuộn chuột xuống dưới đọc nội dung để nhường tầm mắt cho bối cảnh truyện, và tự trượt xuất hiện trở lại khi người dùng cuộn nhẹ chuột lên trên.
* **Story Hook (NX-4471)**: Phân đoạn giới thiệu bối cảnh vụ án mạng tại Cầu cảng số 9, tạo bối cảnh thám tử nhập vai hấp dẫn.
* **Interactive Product Showcase**: Trình diễn so sánh 2 cột động giữa Hiện vật vật lý ngoài đời (Dossier giấy, Burner Phone thật, Chìa khóa đồng đúc) và Trình xử lý kỹ thuật tương ứng trên Web.
* **FAQ Accordion**: Câu hỏi thường gặp có khả năng sụp/mở mượt mà bằng CSS.

---

## 2. Cổng Kích Hoạt Vụ Án (`/activate`)
* **Diagnostic Boot Sequence**: Khi người dùng nhấn nút chạy máy trạm, giao diện mô phỏng một dòng lệnh boot khởi động quét hệ thống phần cứng.
* **Unlock Input**: Nhập mã số in trong hộp game vật lý (mã demo: `NX-4471`) để kích hoạt vụ án và mở khóa truy cập vào `/dashboard`.

---

## 3. Không Gian Làm Việc Pháp Y (`/evidence`)
* **Phân Loại Danh Mục Tang Vật**: Tự động nhóm các bằng chứng thu thập được thành 4 nhóm trực quan:
  1. *Digital Devices* (Thiết bị số: Điện thoại, Laptop)
  2. *Documents* (Tài liệu: Hợp đồng, Email, Tin nhắn)
  3. *Audio Evidence* (Ghi âm tang vật)
  4. *Location Evidence* (Dữ liệu định vị GPS)
* **Phone Simulator (`/evidence/[id]`)**:
  * Trình giả lập điện thoại di động Nokia/Burner phone cổ điển với các ứng dụng:
    * *Tin nhắn*: Trích xuất các cuộc đối thoại, hiển thị tin nhắn chưa đọc hoặc tin nhắn mã khóa.
    * *Lịch sử duyệt web*: Xem các đường link trang nội bộ bến cảng mà nạn nhân đã truy cập trước khi mất tích.
    * *Thư viện ảnh*: Phục hồi các file ảnh chụp thực địa.
    * *Danh sách cuộc gọi*: Nhật ký cuộc gọi và ghi nhận cell tower.

---

## 4. Công Cụ Chuỗi Thời Gian Ngoại Phạm (`/trace`)
* **Suspect Filters**: Hỗ trợ chọn xem và so sánh dòng thời gian di chuyển/lời khai của 3 nhân vật: nạn nhân Thomas Vance, quản lý V. Marsh, và Quản đốc.
* **Clash Detection (Phát hiện Mâu Thuẫn)**: Người chơi lấy các mảnh ghép bằng chứng từ Deck bên phải thả vào các ô trống trên trục dọc. Nếu lời khai ngoại phạm của nghi phạm mâu thuẫn trực tiếp với định vị GPS hay file ghi âm thực tế, hệ thống sẽ chớp đỏ báo động **Alibi Clash** kèm gợi ý cảnh báo từ Trợ lý Minh.
* **Solved State**: Khi hoàn thành đúng toàn bộ chuỗi thời gian, dòng thời gian sẽ tự động khóa và đồng bộ với hệ thống.

---

## 5. Tối Giản Hóa Giao Diện & Tắt Chi Tiết Pháp Y
* **Collapsible Sidebars**: Trên giao diện máy tính Desktop, người chơi có thể bấm hai nút đầu trang để thu gọn thanh danh sách tang vật bên trái và thanh Trợ lý điều phối bên phải để tối ưu hóa không gian làm việc.
* **Forensic Detail Toggle**: Khi chuyển trạng thái sang **Tắt**, toàn bộ mã băm SHA-256 phức tạp, bảng thông số IMEI/OS/SIM của thiết bị, và nhật ký giám sát tang vật rườm rà sẽ được giấu kín khỏi màn hình của người chơi để chống ngợp thông tin, chỉ hiện lại khi bấm **Bật**.
