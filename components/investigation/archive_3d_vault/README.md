# 🧊 Kho Lưu Trữ 3D (3D Vault — Inactive / Archived)

> **TRẠNG THÁI: TẠM KHÓA / ĐÓNG BĂNG TOÀN PHẦN (DISABLED)**
> Theo chỉ thị từ người dùng (User Directive — Oct 2026), toàn bộ các thành phần 3D WebGL / Three.js được tập hợp về đây và ngắt hoàn toàn khỏi UI hoạt động của ứng dụng.

---

## 📦 Danh Mục Thành Phần Trong Kho:

1. **`crime-scene-3d/` & `crime-scene-room-3d.tsx`**:
   - Hiện trường 3D căn phòng án mạng (Three.js canvas, procedural textures sàn gạch/gỗ, chalk outline thi thể, camera controller, hotspot pins).
2. **`3d-cabinet/` & `file_cabinet_3d.tsx`**:
   - Tủ hồ sơ ngăn kéo kim loại 3D tương tác (Three.js, đèn trần dao động, kéo mở ngăn tủ, dossier slide-over).
3. **`scene-360-viewer.tsx`**:
   - Trình xem ảnh toàn cảnh Panorama 360 hình cầu (Three.js equirectangular sphere).

---

## 🔒 Quy Tắc Vận Hành & Bảo Mật (Agent Rules)

* **TUYỆT ĐỐI KHÔNG TỰ Ý KÍCH HOẠT**: Không import, render hay đưa bất kỳ component nào trong kho này ra các màn hình người chơi/điều tra.
* **ĐIỀU KIỆN KÍCH HOẠT DUY NHẤT**: Chỉ mở lại hoặc can thiệp khi và chỉ khi **Người Dùng (USER) trực tiếp nhắc lại bằng văn bản**.
