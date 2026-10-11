# Detective Case System (dect_project) — Workspace Agent Guidelines

> **Dự án: dect_project** — Hệ thống game trinh thám điều tra tương tác, tài liệu chứng cứ vụ án và hồ sơ Google Docs / Live CMS.
> _Kế thừa toàn bộ quy tắc Global từ `D:\code_world\AGENTS.md` (Strict Git Commit, Proposal-First, Code-Doc Sync)._

---

## 📚 Documentation Map (Bản Đồ Tài Liệu 2 Tầng)

Xem chi tiết danh mục đầy đủ tại [`docs/README.md`](docs/README.md):

- **⚙️ Technical Docs (Kỹ thuật hệ thống)**:
  - Hướng dẫn kỹ thuật hệ thống: [`docs/core_specs/01_technical_guide.md`](docs/core_specs/01_technical_guide.md)
  - Cơ sở dữ liệu: [`docs/core_specs/02_database_schema.md`](docs/core_specs/02_database_schema.md)
  - Google Sheets Live CMS: [`docs/core_specs/03_google_sheets_cms.md`](docs/core_specs/03_google_sheets_cms.md)
  - Design System & UI/UX: [`docs/core_specs/04_ux_ui_design_system.md`](docs/core_specs/04_ux_ui_design_system.md)
  - Analytics & Tracking: [`docs/core_specs/05_analytics_tracking_spec.md`](docs/core_specs/05_analytics_tracking_spec.md)
  - CI/CD & VPS Deployment: [`docs/core_specs/06_cicd_deployment_guide.md`](docs/core_specs/06_cicd_deployment_guide.md)
  - License & Access Control: [`docs/core_specs/07_license_access_system.md`](docs/core_specs/07_license_access_system.md)
  - License Technical Spec: [`docs/core_specs/08_license_technical_spec.md`](docs/core_specs/08_license_technical_spec.md)
  - Business, Financial & Founder Model: [`docs/core_specs/09_business_financial_model.md`](docs/core_specs/09_business_financial_model.md)
  - Figma Design Workflow & Integration: [`docs/core_specs/10_figma_design_workflow.md`](docs/core_specs/10_figma_design_workflow.md)
- **🧠 Domain & Case Docs (Nghiệp vụ & Hồ sơ vụ án)**:
  - Bối cảnh & Cốt truyện Master Case #000: [`docs/cases/case_000/01_design/case_design.md`](docs/cases/case_000/01_design/case_design.md)
  - Gameplay & Hành trình điều tra: [`docs/cases/case_000/01_design/gameplay_design.md`](docs/cases/case_000/01_design/gameplay_design.md)
  - Điểm khám xét lại hiện trường: [`docs/cases/case_000/01_design/reinvestigation_hotspots.md`](docs/cases/case_000/01_design/reinvestigation_hotspots.md)
  - Hồ sơ bàn giao thiết kế Figma Case #000: [`docs/cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md`](docs/cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md)

---

## 🕵️ 1. Cấu trúc Kiến trúc & Tính Nhất Quán của Dự Án

Mọi sửa đổi liên quan đến nội dung vụ án phải đảm bảo tính đồng bộ 100% giữa 4 lớp tài liệu:

- **Cốt truyện & Dòng thời gian**: Sự thật vụ án, timeline các nhân vật.
- **Cơ chế giải đố & Checkpoints**: Luồng suy luận, điều kiện mở khóa manh mối trên Google Sheets.
- **Danh mục tổng thể vật chứng & Master Asset Table**: Đường dẫn tài liệu, mã chứng cứ, ảnh và file thoại.
- **Bộ tài liệu Google Docs Master & PDF xuất bản (`public/documents/`)**: Hồ sơ pháp y, lời khai nhân chứng, lý lịch nghi phạm và biên bản hiện trường được xuất bản trực tiếp từ Google Docs vào web app.

---

## 📑 2. Quy Trình Biên Soạn Google Docs & Xuất Bản PDF (Google Docs Live CMS Protocol)

Toàn bộ nội dung văn bản hành chính, lời khai chi tiết và biên bản hiện trường được quản lý tại **Master Google Doc**:

1. **Biên soạn & Cập nhật nội dung**:
   - Chỉnh sửa trực tiếp trên Document Tab tương ứng của file Master Google Docs (ID: `1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc`).
   - Cập nhật các điểm nút logic, tóm tắt manh mối cốt lõi (`core_content`) trên Google Sheets (không lưu trữ văn bản dài tràn lan trên Sheet).
2. **Xuất bản PDF tự động vào Web App**:
   - Chạy lệnh xuất bản PDF từ Google Docs về thư mục tĩnh của Web:
     ```bash
     npm run export:docs-pdf
     ```
   - Tự động tải và đồng bộ các file PDF tạo thành vào đúng thư mục đích: `public/documents/case_000/<phase>/`.
3. **Đồng bộ hóa 2 chiều**:
   - Dùng `npm run sync:docs-to-sheet` để đồng bộ metadata từ Google Docs về Google Sheets khi cần.

---

## 🎨 3. Tiêu chuẩn Giao diện Trinh Thám & Thẩm mỹ

- Giao diện phong cách hồ sơ trinh thám cổ điển/tối giản: Sử dụng typography sắc nét, màu sắc tài liệu cũ/chính luận.
- Áp dụng nguyên tắc **`/taste`**: Không lạm dụng hiệu ứng neon sặc sỡ, đảm bảo trải nghiệm đọc hồ sơ chân thực trên cả Mobile và Desktop.
- **Quy tắc Bàn phím & Focus Modal (Mobile UX Rule)**: Tuyệt đối **CẤM** sử dụng thuộc tính `autoFocus` hoặc gọi lệnh `.focus()` tự động khi mở bất kỳ Modal, Dialog, Popup hay Slide-over nào. Bàn phím ảo trên di động chỉ được phép bật lên khi người chơi chủ động chạm ngón tay vào ô nhập liệu (`<input>`, `<textarea>`), tránh che khuất nội dung và giật lag giao diện.

---

## 🚀 4. Kiến trúc Triển khai & CI/CD (VPS Docker & GitHub Actions)

- **Môi trường Production duy nhất**: Máy chủ VPS (`72.62.199.110`) chạy Docker container `dect_project_app`.
- **Ngắt liên kết Vercel (Vercel Disconnected / Paused)**: Dự án **KHÔNG** sử dụng hoặc hậu kiểm Vercel. Sau khi `git push origin main`, Agent không kích hoạt Vercel build inspection mà theo dõi tiến trình GitHub Actions và container trên VPS.
- **Quy trình CI/CD tự động 100%**:
  - `git push origin main` ➔ GitHub Actions build Docker image và đẩy lên GHCR (`ghcr.io/dewey97/dect_project:latest`).
  - GitHub Actions SSH vào VPS, pull image mới và restart container trong vòng ~10 giây.

---

## 📁 5. Quy Tắc Phân Định Ranh Giới Tài Nguyên: `docs/` vs. `public/` (Asset Storage Boundary Rule)

- **`docs/cases/<case_id>/...` (Nơi lưu trữ tư liệu gốc & thiết kế vụ án)**:
  - Toàn bộ ảnh tài liệu gốc, ảnh minh họa biên bản, storyboard, moodboard, ảnh tham khảo điều tra, file âm thanh gốc, bản nháp, test renders (ví dụ: `test_notes_archive/`) **BẮT BUỘC PHẢI ĐƯỢC LƯU TRONG `docs/cases/<case_id>/`**.
  - **Tuyệt đối CẤM** đẩy các tài liệu nghiên cứu, file ảnh nháp hoặc asset thô chưa qua tối ưu vào `public/`.
- **`public/` (Chỉ dành riêng cho Client Production Runtime)**:
  - Thư mục `public/` chỉ chứa các file tĩnh được client app tải trực tiếp khi chạy game (đã tối ưu dung lượng, đặt đúng danh mục: `public/brand/`, `public/images/cases/<case_id>/`, `public/documents/<case_id>/`, `public/models/`, `public/audio/`).
  - Mọi asset mới đưa vào `public/` phải có mục đích sử dụng cụ thể trong mã nguồn UI và được đăng ký trong [`docs/cases/case_000/02_photos/ASSET_CATALOG.md`](docs/cases/case_000/02_photos/ASSET_CATALOG.md).

---

## 🌐 6. Nguyên Tắc Trực Tuyến & Bộ Nhớ Đệm (Live-First & Cache Policy — No Static Hardcoded Fallback Rule)

- **Mô hình Trực tuyến (Online-First)**: Hệ thống game hoạt động với giả định người chơi có kết nối internet để nạp vụ án và đồng bộ tiến độ.
- **Tuyệt đối không nhồi nhét Mock/Hardcoded Fallback tĩnh**: Dữ liệu kịch bản, lời khai, dẫn truyện (narratives/epilogues), đáp án và sự kiện do Google Sheets Live CMS quản lý 100%. Không duy trì các mảng text cố định lỗi thời trong code vì sẽ gây lệch pha logic với kịch bản biên soạn của GM.
- **Cơ chế Chống gián đoạn (In-memory & Client Cache)**: Khi đã fetch thành công một lần từ Live CMS, dữ liệu được giữ trong memory cache / client state. Trường hợp mạng chập chờn sau khi đã vào game, hệ thống tận dụng cache có sẵn. Nếu chưa có dữ liệu và lỗi mạng, hiển thị trạng thái đang đồng bộ/thử lại thay vì hiển thị kịch bản giả lập cũ.
- **Quy Tắc Chống Màn Hình Đen Khi Render Bất Đồng Bộ (Zero-Black-Screen / Immediate-Transition Rule)**:
  - Khi người chơi ấn các nút bắt đầu / chuyển cảnh (ví dụ: `[ TRỐN TÌM ]`, mở Phase mới, xem Epilogue), giao diện **BẮT BUỘC PHẢI PHẢN HỒI VÀ RENDER NGAY LẬP TỨC** (`activeNarrative` / baseline monologue).
  - **Tuyệt đối CẤM** render `null` hoặc để trống toàn bộ khung nhìn modal khi dữ liệu Live CMS đang trong trạng thái nạp ngầm (in-flight fetch) hoặc mạng có độ trễ.
  - Phải luôn có baseline narrative fallback đồng bộ hoặc trạng thái typing tức thì, sau đó Live CMS tự động hydrate/cập nhật đè lên khi có dữ liệu mới từ GM.

---

## 🏷️ 7. Quy Chuẩn Tên Thương Hiệu & Quy Ước Tài Liệu (Brand Naming & Minimal Mention Rule)

- **Quy chuẩn tên thương hiệu**: Tên thương hiệu viết liền không bao giờ có dấu gạch nối: **XPLORE** (hoặc `xplore` khi viết thường). **TUYỆT ĐỐI CẤM** dùng `X-PLORE`.
- **Hạn chế nhắc tên trong tài liệu**: Trong các tài liệu kỹ thuật, đặc tả nghiệp vụ (`docs/`), tập trung vào thông số kỹ thuật, logic hệ thống và cơ chế vụ án; không chèn tên thương hiệu tràn lan nếu không cần thiết. Chỉ giữ tên thương hiệu ở một số vị trí định danh cố định (như `AGENTS.md`, metadata layout, component `BrandMark`, bảng nhận diện thương hiệu).

---

## 🧊 8. Quy Tắc Đóng Băng & Lưu Trữ Phân Hệ 3D (3D Vault Freeze & Inactivity Rule)

- **Trạng thái đóng băng toàn diện**: Toàn bộ hệ thống 3D Three.js WebGL (bao gồm hiện trường 3D `crime-scene-3d`, tủ hồ sơ 3D `3d-cabinet`, `file_cabinet_3d`, trình xem ảnh 360 `scene-360-viewer` và các model `.glb`) đã được cách ly, vô hiệu hóa và gom vào kho lưu trữ an toàn `components/investigation/archive_3d_vault/`.
- **Cấm tự ý kích hoạt hoặc can thiệp**: Agent tuyệt đối **KHÔNG ĐƯỢC PHÉP** tự ý import, render, chỉnh sửa, mở lại hoặc nhúng bất kỳ thành phần 3D nào ra giao diện người dùng.
- **Điều kiện kích hoạt duy nhất**: Phân hệ này **CHỈ ĐƯỢC PHÉP MỞ LẠI HOẶC CHẠM VÀO KHI VÀ CHỈ KHI NGƯỜI DÙNG (USER) TRỰC TIẾP RA LỆNH NHẮC LẠI**.

---

## 🔒 9. Quy Tắc Cách Ly Bảng Landing Page (LDP) vs Bảng Điều Tra Game (Board Separation Rule)

- **Bảng Landing Page (`landing-hero.tsx`) — Cố định & Độc lập**:
  - Bảng ghim trên Landing Page là visual showcase trưng bày cố định (dùng demo các case `case-01`, `case-02`, `case-03` với `evidence-board-bg.png`... hoặc mock tĩnh).
  - Bảng này **CÁCH LY HOÀN TOÀN** khỏi state, tiến trình phá án, modal nghiệp vụ và các node tương tác của gameplay thực tế (`MainInvestigationCanvas`).
  - **Tuyệt đối CẤM** gán nhầm hoặc kết nối logic game, ghim node tang vật động của Case #000 vào bảng Landing Page.
- **Bảng Điều Tra Trong Game (`MainInvestigationCanvas`)**:
  - Là không gian phá án chính thức, nhận dữ liệu động từ Google Sheets Live CMS, local state và checkpoint gameplay.
  - Tang vật thiết bị (như túi đựng điện thoại `victim-phone`) hiển thị dưới dạng vật chứng thực tế độc lập: **tuyệt đối KHÔNG ghim đè thêm ghim pushpin 3D hay nối sợi chỉ đỏ** vào thiết bị tang vật. Node `Mở rộng điều tra` (`c0-pin-phone`) là giấy note nghiệp vụ riêng biệt, không được gán nhầm ảnh túi điện thoại vào node này.

---

## ⚖️ 10. Nguyên Tắc Đồng Bộ Tuyệt Đối Local & Production (Local vs. Prod/Docker Parity Protocol)

Mọi tính năng, trang hoặc thành phần mới phải đảm bảo chạy đồng nhất 100% giữa môi trường phát triển máy cá nhân (**Local Dev trên Windows**) và môi trường máy chủ (**Production trong Docker container Linux trên VPS**):

1. **Khớp Tên File & Thư Mục Tuyệt Đối (Zero Case-Mismatch Rule — Windows vs. Linux)**:
   - Hệ điều hành Windows không phân biệt hoa/thường, nhưng Docker / Alpine Linux phân biệt nghiêm ngặt.
   - **Bắt buộc**: Mọi câu lệnh `import` (component, lib, types) và đường dẫn file tài nguyên trong `public/` (ảnh, icon, font, audio, pdf) phải khớp chính xác từng chữ hoa/thường với tên file thực tế trên ổ đĩa.
2. **An Toàn Khởi Tạo & Render Trình Duyệt (Safe Browser API & SSR/SSG Guard)**:
   - Trong Next.js, `npm run build` trên máy chủ sẽ chạy static prerendering (SSG) cho tất cả các trang.
   - **Tuyệt đối CẤM**: Truy cập trực tiếp các biến trình duyệt toàn cục (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `screen`) ở top-level module hoặc trong thân hàm render của Server/Client Components khi chưa mount.
   - **Chuẩn xử lý**: Luôn bọc trong `useEffect`, kiểm tra `typeof window !== 'undefined'`, hoặc sử dụng dynamic import `next/dynamic` với `{ ssr: false }`.
3. **Chống Lệch Pha Hydration (Hydration Mismatch Prevention)**:
   - Đảm bảo HTML render lần đầu trên máy chủ (SSR) khớp hoàn toàn với client DOM.
   - Các giá trị phụ thuộc vào thời gian thực (`Date.now()`, `new Date().toISOString()`), ngẫu nhiên (`Math.random()`), hoặc kích thước màn hình chỉ được khởi tạo/gán state sau khi component đã mount trên client (`useEffect` hoặc cờ `isMounted`).
4. **Không Hardcode URL Môi Trường (Relative Paths & Dynamic Env Rule)**:
   - Tuyệt đối không hardcode domain `http://localhost:3000` hay IP nội bộ trong client-side code hay API calls.
   - Luôn sử dụng đường dẫn tương đối (như `/api/...`, `/images/...`) hoặc biến môi trường `NEXT_PUBLIC_*`.
5. **Đồng Bộ Dữ Liệu Thời Gian Thực & Cache (Consistent Live Fetch Policy)**:
   - Tránh tình trạng local fetch mới nhưng production trả về cache cũ: Các route API đọc dữ liệu động (Google Sheets CMS, Supabase live tables) phải luôn có `export const dynamic = 'force-dynamic'` hoặc gắn headers `cache: 'no-store'`.
6. **Tiền Kiểm Tra Biên Dịch & Typecheck Bắt Buộc (Pre-Flight Verification Protocol)**:
   - Trước khi thông báo hoàn tất bất kỳ tác vụ hoặc xin lệnh commit: Agent bắt buộc phải chạy `npm run lint` (`tsc --noEmit`) để bắt sạch lỗi kiểu dữ liệu TypeScript.
   - Khi có thay đổi lớn liên quan đến cấu hình Next.js, routing, server actions hoặc build scripts: Phải chủ động kiểm tra hoặc khuyến nghị chạy `npm run build` cục bộ trước khi deploy.



