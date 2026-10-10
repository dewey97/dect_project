# Figma Design Workflow & Integration Guide (dect_project)

> **Mã tài liệu**: `docs/core_specs/10_figma_design_workflow.md`  
> **Phiên bản**: v1.0.0 — Ngày ban hành: 10/10/2026  
> **Phạm vi áp dụng**: Toàn bộ UI/UX vụ án, màn hình điều tra thiết bị (Phone/PC), bảng chứng cứ, hiện trường và landing page.

---

## 📌 1. Tổng Quan & Triết Lý Tích Hợp

Trong dự án **Detective Case System (`dect_project`)**, giao diện người dùng trinh thám đòi hỏi tính xác thực thị giác cực cao (Authentic Forensic & OS Simulation). Mọi chi tiết đồ họa từ màn hình hệ điều hành (iOS 9, Windows XP/7), giao diện ứng dụng con (Notes, Maps, Messages, Banking) đến hồ sơ tang vật đều bắt nguồn từ thiết kế trên **Figma Master**.

### 🎯 Nguyên tắc vàng: "Exact Asset First, Zero Pseudo-Mimicry"
1. **Không code giả lập CSS/SVG vu vơ**: Không tự chế icon, bố cục hoặc font chữ sai lệch khi đã có bản thiết kế chính thức trên Figma.
2. **Khai thác trực tiếp Asset Render từ Figma API**: Xuất ảnh độ phân giải cao (`@3x` / `@4x` PNG hoặc SVG gốc) từ Frame Figma để làm visual layer nền, sau đó phủ các vùng tương tác (**Interactive Hotspots**) hoặc form nhập liệu lên trên.
3. **Đồng bộ hóa 2 chiều Token & Content**: Màu sắc, khoảng cách, thông số kỹ thuật và ID bằng chứng phải khớp 100% giữa Figma, Google Sheets CMS và Codebase.

---

## 🔑 2. Cấu Hình Kết Nối & Thông Số Figma Dự Án

### 2.1. File Master Design & Access Token
- **Tên dự án Figma**: `XPLORE`
- **File Key**: `sIAYKRy84xtmgGs7oAqxg6`
- **URL Master File**: `https://www.figma.com/design/sIAYKRy84xtmgGs7oAqxg6/XPLORE`
- **Figma Personal Access Token (PAT)**: `<YOUR_FIGMA_ACCESS_TOKEN>`

### 2.2. Danh Mục Các Page & Frame Trọng Tâm Hiện Tại
 
| Phân Vùng | Page ID | Frame ID | Tên Node / Mục Đích | Kích Thước Viewport | Trạng Thái Codebase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phone Master** | `92:2` | `92:300` | iPhone Shell Container (Springboard iOS 9) | `375 x 667 pt` (Tỷ lệ 9:16) | ✅ Đã tích hợp (`iphone-frame.tsx`) |
| **Lock Screen** | `22:389` | `22:389` / `22:393` | Màn hình khóa (Lockscreen + Music Player + Slide to unlock) | `375 x 667 pt` | ✅ Đã đồng bộ pixel-perfect (`iphone-frame.tsx`) |
| **Phone Keypad** | `22:453` | `22:453` | Bàn phím quay số tròn 75px & Nút gọi xanh | `375 x 667 pt` | ✅ Đã triển khai (`phone-app.tsx`) |
| **Recents** | `22:582` | `22:582` | Nhật ký cuộc gọi & Hộp thư thoại ghi âm | `375 x 667 pt` | ✅ Đã triển khai (`phone-app.tsx`) |
| **Messages App** | `22:755` | `22:755` | Danh sách hội thoại SMS & tin nhắn chưa đọc | `375 x 667 pt` | ✅ Đã đồng bộ layout 86px (`messages-app.tsx`) |
| **Notes App** | `92:2` | `92:550` | Giao diện ghi chú giấy vàng-kem iOS 9 | `375 x 667 pt` | ✅ Đã tích hợp (`notes-app.tsx`) |
| **Maps App** | `92:2` | `92:623` | Bản đồ điều tra hiện trường vụ án | `375 x 667 pt` | ✅ Đã tích hợp (`maps-app.tsx`) |
| **Hanoi Map Data** | `92:2` | `96:9215` | Vector / Graphic Bản đồ Hà Nội chi tiết | Scale canvas | ✅ Đã xuất bản (`hanoi_master_map.png`) |

---

## 🛠️ 3. Kiến Trúc Kết Nối MCP Server (`figma-mcp-server`)

Hệ thống AI Agent trong dự án được tích hợp trực tiếp công cụ `figma` thông qua giao thức MCP (Model Context Protocol).

### 3.1. Cấu hình MCP Client (`mcp_config.json`)
Vị trí file cấu hình: `C:/Users/Dell/.gemini/config/mcp_config.json`
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "@tothienbao6a0/figma-mcp-server",
        "--figma-api-key=<YOUR_FIGMA_ACCESS_TOKEN>",
        "--stdio"
      ]
    }
  }
}
```

### 3.2. Bộ Công Cụ Hỗ Trợ (Figma MCP Tools)
Khi làm việc với Figma qua Agent, các tool khả dụng gồm:
- `get_figma_data`: Lấy cấu trúc DOM tree JSON của toàn bộ file hoặc node cụ thể (`nodeId`).
- `download_figma_images`: Tự động tải hình ảnh render của các frame/vector theo `nodeId` với định dạng `png` / `svg` / `jpg` và tỷ lệ `scale` (1x, 2x, 3x).
- `get_figma_variables`: Trích xuất danh sách Design Tokens / Variables (màu sắc, spacing, radii).
- `check_design_code_sync`: Đối chiếu sự sai lệch giữa mã nguồn CSS/Tailwind và file thiết kế.

---

## ⚡ 4. Quy Trình Xuất Bản & Tích Hợp (Step-by-Step Workflow)

Khi cần đưa một màn hình hoặc thành phần đồ họa mới từ Figma vào Web App:

```
[BƯỚC 1: Xác định Frame/Node] ➔ [BƯỚC 2: Export Asset @3x] ➔ [BƯỚC 3: Tối ưu & Lưu vào public/]
                                                                       │
[BƯỚC 5: Kiểm tra Type & Commit] 🠔 [BƯỚC 4: Code Hotspots & State] 🠔───┘
```

### Bước 1: Lấy Node ID trên Figma
1. Mở file Figma trên trình duyệt hoặc app.
2. Chọn Frame cần lấy.
3. Sao chép liên kết (Copy link to selection): URL sẽ có dạng `...node-id=92-300...` (Node ID là `92:300`).

### Bước 2: Xuất Asset chất lượng cao (3x PNG / SVG)
Có 2 cách thực hiện:

#### Cách A: Dùng Figma REST API (Tự động hóa qua cURL / Node Script)
```bash
# 1. Gọi lấy Image URL từ Figma REST API
curl -H "X-Figma-Token: <YOUR_FIGMA_ACCESS_TOKEN>" \
  "https://api.figma.com/v1/images/sIAYKRy84xtmgGs7oAqxg6?ids=92:300&scale=3&format=png"

# 2. Tải file từ URL do Figma trả về
curl -o "public/images/cases/case_000/phone/figma_ios9_home_screen.png" "<URL_DOWNLOAD>"
```

> **Lưu ý về Rate Limit**: Figma REST API giới hạn số request/phút. Đối với các file đã tải về local, ưu tiên sử dụng lại asset local, không spam gọi API liên tục.

#### Cách B: Xuất thủ công trên Figma Client
- Chọn Frame ➔ Tab **Export** (bên phải) ➔ Đặt `PNG 3x` hoặc `SVG` ➔ Bấm **Export** ➔ Lưu vào thư mục tương ứng.

### Bước 3: Tuân Thủ Phân Định Lưu Trữ (`Asset Storage Boundary`)
- **Tài nguyên phục vụ runtime game**: Lưu tại `public/images/cases/case_000/phone/` (hoặc `public/images/cases/case_000/...`).
- **Tài nguyên nghiên cứu, nháp, moodboard**: Lưu tại `docs/cases/case_000/02_photos/`.
- Đăng ký asset vào [`docs/cases/case_000/02_photos/ASSET_CATALOG.md`](../cases/case_000/02_photos/ASSET_CATALOG.md).

### Bước 4: Kỹ Thuật "Interactive Hotspots Layer"
Để giao diện giống 100% Figma mà vẫn click chuyển app mượt mà:
1. Render ảnh nền Figma làm background tuyệt đối (`object-cover` hoặc `<img>`).
2. Định vị các nút tương tác tàng hình bằng tỷ lệ phần trăm (`% top/left/width/height`) theo lưới của màn hình:
```tsx
{/* Nền ảnh Figma render 3x */}
<img
  src="/images/cases/case_000/phone/figma_ios9_home_screen.png"
  alt="Figma iOS 9 Springboard"
  className="w-full h-full object-cover select-none pointer-events-none"
/>

{/* Lưới Hotspots tương tác trùng khít tọa độ icon */}
<div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pt-[11.5%] px-[6.5%] gap-x-[7%] gap-y-[4%]">
  <button
    onClick={() => setActiveApp('messages')}
    className="w-full h-full cursor-pointer rounded-2xl hover:bg-white/10 active:scale-90 transition-transform"
    title="Tin nhắn (Messages)"
  />
  {/* Các nút tương tác tiếp theo... */}
</div>
```

---

## 🎨 5. Quy Chuẩn Màu Sắc & Typography Đồng Bộ

Hệ màu và font chữ trích xuất từ Master Figma (`iOS 9 Legacy Design System`):

### 5.1. Bảng màu hệ điều hành iOS 9
- **Messages Green**: `#28CA36` (Gradient: `#60E450` ➔ `#28CA36`)
- **System Blue**: `#0A84FF`
- **Notification Red**: `#FF3B30`
- **Calendar Red Header**: `#FF3B30`
- **Music Fuchsia**: `#FF2D55` ➔ `#FA114F`
- **Notes Yellow/Cream**: Nền kem kẻ sọc cam `#FBF8EB` / Header `#E69138`
- **Frosted Glass Blur**: `bg-white/25 backdrop-blur-md`
- **Dock Translucent Background**: `bg-white/35 backdrop-blur-2xl border-t border-white/20`

### 5.2. Font chữ & Hiệu ứng
- **Font gia đình**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`
- **Số giờ Lockscreen**: Font extralight `text-[64px] tracking-tighter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`
- **Slide to unlock shimmer**: CSS text gradient animation `linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.98), rgba(255,255,255,0.25))`

---

## 📋 6. Checklist Kiểm Thử Trước Khi Hoàn Thành (Definition of Done)

Trước khi commit bất kỳ thay đổi nào liên quan đến Figma:
- [ ] Ảnh asset đã được nén tối ưu (WebP hoặc PNG nén, dung lượng hợp lý < 3MB).
- [ ] Tọa độ hotspot tương tác bấm thử hoạt động chính xác trên cả Mobile và Desktop.
- [ ] Tuân thủ **Mobile UX Rule**: Không sử dụng `autoFocus` tự động bật bàn phím ảo.
- [ ] Kiểm tra lỗi TypeScript: Chạy `npx tsc --noEmit` đạt 0 lỗi.
- [ ] Tạo Git commit theo chuẩn Conventional Commits (ví dụ: `feat(iphone): sync ... with figma design`).
