# Detective Case System (dect_project) — Workspace Agent Guidelines

> **Dự án: dect_project** — Hệ thống game trinh thám điều tra tương tác, tài liệu chứng cứ vụ án và hồ sơ Google Docs / Live CMS.
> _Kế thừa toàn bộ quy tắc Global từ `D:\code_world\AGENTS.md` (Strict Git Commit, Proposal-First, Code-Doc Sync)._

---

## 📚 Documentation Map (Bản Đồ Tài Liệu 2 Tầng)

Xem chi tiết danh mục đầy đủ tại [`docs/README.md`](docs/README.md):

- **⚙️ Technical Docs (Kỹ thuật hệ thống)**:
  - CI/CD & VPS Deployment: [`docs/core_specs/12_cicd_deployment_guide.md`](docs/core_specs/12_cicd_deployment_guide.md)
  - Google Sheets Live CMS: [`docs/core_specs/10_google_sheets_cms.md`](docs/core_specs/10_google_sheets_cms.md)
  - Hướng dẫn kỹ thuật hệ thống: [`docs/core_specs/07_technical_guide.md`](docs/core_specs/07_technical_guide.md)
  - Cơ sở dữ liệu: [`docs/core_specs/08_database_schema.md`](docs/core_specs/08_database_schema.md)
  - Design System & UI/UX: [`docs/core_specs/06_ux_ui_design_system.md`](docs/core_specs/06_ux_ui_design_system.md)
- **🧠 Domain & Case Docs (Nghiệp vụ & Hồ sơ vụ án)**:
  - Bối cảnh thế giới: [`docs/core_specs/02_world_building.md`](docs/core_specs/02_world_building.md)
  - Thiết kế & Ma trận Vụ án Case #000: [`docs/cases/case_000/01_design/case_design.md`](docs/cases/case_000/01_design/case_design.md)
  - Ma trận chứng cứ & Suy luận: [`docs/cases/case_000/01_design/evidence_matrix.md`](docs/cases/case_000/01_design/evidence_matrix.md)
  - Gameplay & Hành trình người chơi: [`docs/cases/case_000/01_design/gameplay_design.md`](docs/cases/case_000/01_design/gameplay_design.md)

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

