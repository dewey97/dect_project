# 📱 HỒ SƠ BÀN GIAO & TỔNG HỢP TOÀN BỘ DỮ LIỆU FIGMA (FIGMA HANDOVER SPEC)

> **Mục đích**: Bàn giao toàn bộ thông số, API Token, Link Figma, Node Tree AST, File hình ảnh Render và Lộ trình code cho Claude / Agent tiếp tục thực hiện mà không cần thao tác thủ công.

---

## 1. 🔑 Thông Tin Kết Nối & Figma API Credentials

- **Figma File URL**: [`https://www.figma.com/design/WzgF9gHuaOKu8te2SV3eEp/LENDI_Web-App?node-id=22-393&m=dev`](https://www.figma.com/design/WzgF9gHuaOKu8te2SV3eEp/LENDI_Web-App?node-id=22-393&m=dev)
- **Figma File Key**: `WzgF9gHuaOKu8te2SV3eEp`
- **Figma File Name**: `LENDI_Web App`
- **Figma Pro API Token**: `<FIGMA_PERSONAL_ACCESS_TOKEN>` (Sử dụng từ biến môi trường `FIGMA_PAT` hoặc MCP config)
- **Headers gọi API**:
  ```http
  X-Figma-Token: <FIGMA_PERSONAL_ACCESS_TOKEN>
  ```

---

## 2. 🗺️ Bản Đồ Cấu Trúc Các Màn Hình Trên Figma (Page 2 [14:29])

Tất cả các màn hình đều thiết kế theo kích thước chuẩn **iPhone (375 x 667 px)**:

| Frame ID | Tên Màn Hình trên Figma | Kích thước | Tệp Render Tham Chiếu (Đã tải về local) |
| :--- | :--- | :--- | :--- |
| **`22:389`** | **Màn hình khóa (Lock Screen)** *(Node 22:393 nằm trong frame này)* | 375 × 667 | `docs/cases/case_000/01_design/figma_refs/lockscreen.png` |
| **`22:453`** | **Điện thoại & Bàn phím (Phone Keypad)** | 375 × 667 | `docs/cases/case_000/01_design/figma_refs/phone_keypad.png` |
| **`22:582`** | **Nhật ký cuộc gọi (Recents)** | 375 × 667 | `docs/cases/case_000/01_design/figma_refs/recents.png` |
| **`22:755`** | **Tin nhắn (Messages)** | 375 × 667 | `docs/cases/case_000/01_design/figma_refs/messages.png` |

> 📌 **Lưu ý về Node `22:393` mà user gửi link**:  
> Node `22:393` là layer phủ mờ `Subtle Optical Vignette & Frosted Gradient for Ultra Legibility` nằm trực tiếp bên trong Frame gốc **`22:389`** (Màn hình khóa). Toàn bộ màn hình cần dựng chính là Frame `22:389`.

---

## 3. 📂 Các Tài Nguyên & File Dữ Liệu Đã Trích Xuất Sẵn Trên Local

Tất cả đã nằm sẵn trong project `d:\code_world\dect_project`:

### A. Dữ liệu AST JSON (Full Cây DOM từ Figma API)
- `scripts/all_frames_full.json`: Toàn bộ cây AST chi tiết của cả 4 frames (`22:389`, `22:453`, `22:582`, `22:755`), bao gồm từng tọa độ, fill gradient, hex color, typography, gap, padding, border radius.
- `scripts/lockscreen_node.json`: Chi tiết riêng của Frame Lock Screen `22:389`.
- `scripts/figma_node_22_393.json`: Chi tiết riêng của Layer Vignette `22:393`.

### B. Hình ảnh Render Pixel-Perfect từ Figma API
Thư mục: `docs/cases/case_000/01_design/figma_refs/`
- `lockscreen.png` (1.2 MB) - Render thực tế màn hình khóa biển iOS 9.
- `phone_keypad.png` (105 KB) - Render thực tế bàn phím số quay số.
- `recents.png` (91 KB) - Render thực tế danh sách nhật ký cuộc gọi.
- `messages.png` (95 KB) - Render thực tế danh sách tin nhắn.

### C. Các Tool Scripts Tự Động Hóa
- `scripts/inspect_all_frames.js`: Script phân tích typography, colors, layout mode của cả 4 frames.
- `scripts/find_parent_frame.js`: Script tra cứu phân cấp cây Frame của file Figma.
- `scripts/download_figma_refs.js`: Script gọi endpoint `/v1/images/` để tải ảnh PNG render trực tiếp từ cloud Figma.

---

## 4. 🎨 Thông Số Thiết Kế Cốt Lõi (Design System Specifications)

### Typography & Fonts
- **Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `SF Pro Text`
- **Kích thước tiêu chuẩn**:
  - Đồng hồ Lock Screen: `78px` / `80px`, Weight `300` (Light)
  - Ngày tháng Lock Screen: `17px`, Weight `400`
  - Tên danh bạ / Người gửi tin nhắn: `17px`, Weight `600` (Semi-bold)
  - Nội dung tin nhắn / ghi chú phụ: `15px`, Weight `400`
  - Ngày giờ phụ / Thời gian: `13px`, Weight `400` / `500`
  - Status bar (Pin, giờ, sóng giffgaff): `12px`, Weight `400` & `700`

### Bảng Màu Chính (Color Palette)
- **Primary Text**: `rgba(26, 27, 31, 1.00)` (`#1A1B1F`)
- **Secondary / Subtext**: `rgba(65, 71, 85, 1.00)` (`#414755`) và `rgba(113, 119, 134, 1.00)` (`#717786`)
- **iOS System Blue**: `rgba(0, 88, 188, 1.00)` (`#0058BC`)
- **Missed Call Red**: `rgba(186, 26, 26, 1.00)` (`#BA1A1A`)
- **Call Button Green**: `#4CD964` / `#2ECC71`
- **Border / Divider**: `rgba(227, 226, 231, 1.00)` (`#E3E2E7`)
- **Search Bar Background**: `rgba(238, 239, 241, 1.00)` (`#EEEFF1`)
- **Keypad Button Background**: `rgba(242, 242, 247, 1.00)` (`#F2F2F7`)

### Kích Thước Khung & Layout Grid (375 × 667)
- **Status Bar**: Cao `20px`, padding `[0, 8px]`
- **Header / Navigation Bar**: Cao `44px` (Tổng Header kèm Status Bar là `64px` hoặc `68px`)
- **Bottom Tab Bar**: Cao `49px` - `54px`, chia đều 4 tabs (`Gần đây`, `Danh bạ`, `Bàn phím`, `Hộp thư thoại`)
- **Row List Items**:
  - Tin nhắn (Messages): Cao `86px`, padding `[12px, 16px, 12px, 24px]`
  - Cuộc gọi (Recents): Padding dọc `10px`, ngang `16px`
  - Keypad nút bấm số: Vòng tròn đường kính `75px`, khoảng cách hàng `16px`, cột `24px`

---

## 5. 🚀 Lộ Trình Triển Khai Cho Claude (Next Action Steps)

1. **Khởi tạo / Tái cấu trúc các Components**:
   - ✅ **Màn hình Khóa (`LockScreen`)**: Đã cập nhật component sử dụng ảnh nền biển sóng, đồng hồ font weight 200 (80px), widget trình phát nhạc mini `Ocean Waves Ambient`, thanh vuốt mở khóa `› slide to unlock`, và lối tắt máy ảnh.
   - ✅ **Ứng dụng Điện thoại (`components/investigation/iphone/apps/phone-app.tsx`)**:
     - Tab 1: **Recents (Nhật ký cuộc gọi)** dựa trên Frame `22:582` với số màu đỏ cho cuộc gọi nhỡ (`#BA1A1A`), danh bạ, thời lượng và ghi chú thoại.
     - Tab 3: **Keypad (Bàn phím số)** dựa trên Frame `22:453` với phím tròn 75px, âm thanh bấm phím và nút gọi xanh (`#34C759`).
   - ✅ **Ứng dụng Tin nhắn (`components/investigation/iphone/apps/messages-app.tsx`)**:
     - Màn hình danh sách hội thoại dựa trên Frame `22:755` với thanh tìm kiếm, row item 86px, badge số tin chưa đọc, mũi tên chevron `>`.
2. **Kiểm tra tỷ lệ responsive**:
   - ✅ Đã sử dụng container tỷ lệ chuẩn `375 / 667` bên trong khung mô phỏng iPhone 6, đảm bảo không bị méo mó trên mọi độ phân giải.
3. **Kiểm tra TypeScript**:
   - ✅ Đã chạy `npx tsc --noEmit` xác nhận 0 lỗi (Exit Code 0).
