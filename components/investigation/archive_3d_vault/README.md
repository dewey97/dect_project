# 🧊 Kho Lưu Trữ 3D (3D Vault — Inactive / Archived)

> **TRẠNG THÁI: TẠM KHÓA / ĐÓNG BĂNG TOÀN PHẦN (DISABLED)**
> Theo chỉ thị từ người dùng (User Directive — Oct 2026), toàn bộ các thành phần 3D WebGL / Three.js được tập hợp về đây và ngắt hoàn toàn khỏi UI hoạt động của ứng dụng.

---

## 📦 Danh Mục Thành Phần Trong Kho:

1. **`scene-360-viewer.tsx`**:
   - Trình xem ảnh toàn cảnh Panorama 360 hình cầu (Three.js equirectangular sphere). Sẵn sàng kích hoạt lại khi có ảnh 360 hiện trường.
2. **`3d-cabinet/` & `file_cabinet_3d.tsx`**:
   - Tủ hồ sơ ngăn kéo kim loại 3D tương tác (Three.js, đèn trần dao động, kéo mở ngăn tủ, dossier slide-over).

*(Lưu ý: Phân hệ dựng phòng 3D hình học WebGL `crime-scene-3d/` và các model `.glb` đã được dọn sạch hoàn toàn theo chỉ thị của người dùng vào tháng 10/2026 để chuyển hẳn sang giải pháp ảnh Panorama 360 tối ưu hơn).*

---

## 🔒 Quy Tắc Vận Hành & Bảo Mật (Agent Rules)

* **TUYỆT ĐỐI KHÔNG TỰ Ý KÍCH HOẠT**: Không import, render hay đưa bất kỳ component nào trong kho này ra các màn hình người chơi/điều tra.
* **ĐIỀU KIỆN KÍCH HOẠT DUY NHẤT**: Chỉ mở lại hoặc can thiệp khi và chỉ khi **Người Dùng (USER) trực tiếp nhắc lại bằng văn bản**.
