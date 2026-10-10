# HƯỚNG DẪN KỸ THUẬT HỆ THỐNG (TECHNICAL GUIDE) — DECT PROJECT

> **Phạm vi:** Tài liệu hướng dẫn kỹ thuật toàn diện cho hệ thống web trinh thám điều tra tương tác (Next.js 16 App Router, Supabase, Google Docs/Sheets CMS, React Flow, 3D Canvas và Docker VPS CI/CD).

---

## 🏗️ 1. Cấu Trúc Mã Nguồn Dự Án (Project Directory Structure)

```
d:\code_world\dect_project/
├── app/                            # Next.js 16 App Router
│   ├── (admin)/                    # Phân hệ Quản trị Studio (/studio)
│   │   └── studio/                 # Quản lý vụ án, người chơi, phản hồi, cài đặt
│   ├── (investigation)/            # Không gian điều tra & Bàn phá án
│   │   ├── evidence/               # Danh sách & Trình duyệt hồ sơ vật chứng
│   │   │   ├── [id]/               # Soi chi tiết tang vật / Giả lập thiết bị
│   │   │   ├── boardgame/          # Bảng điều tra dạng Ghim án (Boardgame Pins)
│   │   │   └── web/                # Bảng sơ đồ nơ-ron mạng nhện (React Flow)
│   │   └── cabinet-demo/           # Demo ngăn kéo / tủ hồ sơ vật lý
│   ├── activate/                   # Cổng nhập mã kích hoạt vụ án
│   ├── auth/                       # Xử lý xác thực OAuth / Supabase Callback
│   ├── cases/                      # Danh sách hồ sơ vụ án
│   ├── login/                      # Đăng nhập điều tra viên / Quản trị viên
│   ├── api/                        # Next.js Serverless Route Handlers
│   │   ├── phone/                  # API trích xuất dữ liệu điện thoại tang vật
│   │   └── verify-finding/         # API xác thực lập luận & nghiệm thu manh mối
│   ├── layout.tsx                  # Root Layout & Theme Providers
│   └── page.tsx                    # Trang chủ & Story Hook
├── components/                     # React UI Components
│   ├── ui/                         # Base Radix / Tailwind / shadcn UI components
│   ├── evidence/                   # Evidence Cards, Forensic Viewer, PDF Reader
│   ├── investigation/              # Bàn điều tra, Audio Player, Narrative Stepper
│   └── simulator/                  # Trình giả lập điện thoại nghi phạm (SMS, Call, Photos)
├── lib/                            # Shared Utilities & Business Logic
│   ├── actions/                    # Server Actions
│   ├── cms/                        # Trình kết nối Google Sheets Live CMS & Cache
│   ├── investigation/              # Logic điều tra, Context & Hook quản lý tiến trình
│   ├── supabase/                   # Supabase Client, Server & SSR Config
│   ├── analytics.ts                # Tracking Firebase / GA4
│   ├── storage.ts                  # Safe Storage Utility (Chống lỗi Incognito/Sandbox)
│   └── utils.ts                    # Classnames merger & Helpers
├── db/                             # SQL Migrations & Database DDL
│   └── schema/                     # 14 tệp SQL định nghĩa schema chuẩn Supabase
├── public/                         # Client Production Runtime Assets
│   ├── brand/                      # Logo, favicon, icon hệ thống
│   ├── documents/                  # File PDF xuất bản cho người chơi (`case_000/...`)
│   ├── images/                     # Ảnh UI runtime (`cases/`, `landing/`, `hero/`, `pins/`)
│   ├── models/                     # Mô hình 3D (.glb)
│   ├── audio/                      # Hiệu ứng âm thanh & voice
│   └── fonts/                      # Phông chữ viết tay
├── scripts/                        # Automation & CMS Sync Scripts
│   ├── export-docs-to-pdf.js       # Xuất bản Master Google Docs thành PDF tĩnh
│   ├── sync-docs-to-sheet.js       # Đồng bộ metadata từ Docs sang Sheets
│   └── sync-testimonies-from-sheet.js # Đồng bộ lời khai từ Google Sheets
└── docs/                           # Hệ thống tài liệu 2 tầng (Technical & Domain)
    └── cases/case_000/             # Tư liệu gốc vụ án (kịch bản, source photos, audio gốc)
```

---

## 🚀 2. Môi Trường Phát Triển & Vận Hành Cục Bộ

Hệ thống hỗ trợ quản lý gói qua `npm` hoặc `pnpm` (sử dụng scripts chuẩn hóa trong `package.json`):

```bash
# 1. Cài đặt thư viện phụ thuộc
npm install   # hoặc: pnpm install

# 2. Khởi chạy máy chủ Dev
npm run dev   # hoặc: pnpm dev

# 3. Kiểm tra kiểu tĩnh TypeScript & Linting
npm run lint  # chạy: tsc --noEmit

# 4. Biên dịch thử nghiệm bản Production
npm run build
```

---

## 📑 3. Quy Trình Xuất Bản Tài Liệu PDF & Live CMS

Hệ thống sử dụng cơ chế **Google Docs / Google Sheets Live CMS** để biên kịch không cần can thiệp trực tiếp vào mã nguồn:

1. **Biên soạn văn bản**: Chỉnh sửa trực tiếp trên từng tab của **Master Google Docs** (ID: `1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc`).
2. **Xuất bản PDF về Web**:
   ```bash
   npm run export:docs-pdf
   ```
   Lệnh sẽ kết xuất các file PDF vào thư mục `public/documents/case_000/<phase>/` để Viewer trên web tải trực tiếp.
3. **Đồng bộ Metadata**:
   ```bash
   npm run sync:docs-to-sheet   # Đồng bộ chỉ mục Docs -> Sheets
   npm run sync:testimonies     # Cập nhật lời khai từ Sheets
   ```

---

## 🌐 4. Quy Ước Bản Địa Hóa Tiếng Việt (Localization Rules)

Để giữ đúng tinh thần **Noir** u tối, kỳ bí và chuẩn ngôn ngữ pháp y / hành chính:

1. **Thuật ngữ kỹ thuật / Pháp y**:
   * *Burner phone* $\rightarrow$ Điện thoại phụ / Điện thoại tang vật
   * *Evidence Locker / Forensics Hub* $\rightarrow$ Hồ sơ tang vật / Không gian pháp y
   * *Chain of Custody* $\rightarrow$ Nhật ký giám sát tang vật
   * *Integrity secured* $\rightarrow$ Toàn vẹn dữ liệu: An toàn
   * *Seizure status* $\rightarrow$ Trạng thái khi thu giữ
   * *Decrypt / Chip-off extraction* $\rightarrow$ Giải mã / Trích xuất phần cứng

2. **Cách xưng hô Trợ lý Điều phối (Minh)**:
   * Minh là điều phối viên từ tổng cục, sắc sảo, nghiêm túc.
   * Xưng hô: **Minh** (hoặc *Tôi*) và gọi người chơi là **Thám tử** (hoặc *Bạn*).

3. **Thông báo hệ điều hành retro**:
   * Sử dụng chữ in hoa kèm dấu gạch dưới (VD: `YÊU_CẦU_MÃ_PIN`, `LỖI_TÍNH_TOÀN_VẸN`, `ĐANG_GIẢI_MÃ_...`).

---

## 🛡️ 5. Nguyên Tắc Trải Nghiệm & Cổng Giao Diện (Zero-Gate Protocol)

* **Zero-Gate Async Blocking**: Tuyệt đối không bọc nút tương tác mở màn (như `[ TRỐN TÌM ]`, nút vào game) vào điều kiện async đang tải. Giao diện phải tương tác được ngay lập tức.
* **Static Fallback cho Dẫn truyện**: Mọi hook dữ liệu động (`useCaseNarratives`, Google Sheets) phải có sẵn `DEFAULT_NARRATIVES` dự phòng để tránh trắng/đen màn hình khi mất mạng hoặc API chậm.
* **Safe LocalStorage Wrapper**: Mọi thao tác đọc/ghi Storage phải đi qua `lib/storage.ts` để tránh lỗi khi người chơi duyệt web ở chế độ ẩn danh (Incognito), Safari ITP hoặc Webview nhúng.
* **Mobile Focus Rule**: Không sử dụng `autoFocus` hoặc `.focus()` tự động khi mở Modal/Dialog nhằm tránh bật bàn phím ảo che khuất nội dung trên di động.
* **No Inactive Component State Pollution (Cô lập Side-Effect Modal Khi Đóng)**: Tuyệt đối CẤM các component Modal/Walkthrough/Overlay thực thi reset state toàn cục (như `onStepChange?.(null)`) bên trong `useEffect` khi component đang ở trạng thái đóng (`!isOpen`). Mọi callback giao tiếp giữa canvas và modal con bắt buộc phải ổn định tham chiếu (`useCallback`), tránh truyền inline arrow functions làm kích hoạt effect ma dập tắt state của người dùng.
* **Asset Storage Boundary Rule**: Toàn bộ tư liệu gốc, ảnh tài liệu, moodboard, storyboard, test renders phải lưu tại `docs/cases/<case_id>/`. Thư mục `public/` chỉ chứa tài nguyên runtime production đang hoạt động trực tiếp trên web app. Chi tiết xem tại [`docs/cases/case_000/02_photos/ASSET_CATALOG.md`](../cases/case_000/02_photos/ASSET_CATALOG.md).

---

## 🔒 6. Bảo Mật & Xác Thực Lập Luận (Anti-Spoiler)

* **Server-side Verification**: Đáp án giải mã, logic nút thắt không nạp nguyên bản về client. Mọi hành động nghiệm thu giả thuyết và mở khóa chứng cứ đi qua Route Handler (`/api/verify-finding`).
* **Supabase Row Level Security (RLS)**: Mọi bảng dữ liệu người chơi, phiên lưu trữ và phản hồi được bảo vệ bằng chính sách RLS theo từng `auth.uid()`.
* **Tra cứu cấu trúc CSDL chi tiết**: Xem tại [`docs/core_specs/02_database_schema.md`](02_database_schema.md) và các file DDL tại `db/schema/`.

---

## 🚀 7. Kiến Trúc Hạ Tầng & CI/CD Deployment

* **Production Server**: Máy chủ VPS (`72.62.199.110`) vận hành độc lập qua Docker Container (`dect_project_app`).
* **Vercel Status**: Đã ngắt kết nối / không sử dụng cho Production.
* **Tự động hóa CI/CD**:
  - `git push origin main` kích hoạt **GitHub Actions**.
  - Pipeline tự động build Docker Image, đẩy lên **GitHub Container Registry (GHCR)** (`ghcr.io/dewey97/dect_project:latest`).
  - SSH vào VPS, kéo image mới và restart container không gián đoạn trong ~10s.
  - Chi tiết quy trình triển khai xem tại [`docs/core_specs/06_cicd_deployment_guide.md`](06_cicd_deployment_guide.md).
