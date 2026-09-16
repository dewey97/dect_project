# Detective Case System (dect_project) — Workspace Agent Guidelines

> **Dự án: dect_project** — Hệ thống game trinh thám điều tra tương tác, tài liệu chứng cứ vụ án và hồ sơ LaTeX.
> *Kế thừa toàn bộ quy tắc Global từ `D:\code_world\AGENTS.md` (Strict Git Commit, Proposal-First, Code-Doc Sync).*

---

## 📚 Documentation Map (Bản Đồ Tài Liệu 2 Tầng)
Xem chi tiết danh mục đầy đủ tại [`docs/README.md`](docs/README.md):

* **⚙️ Technical Docs (Kỹ thuật hệ thống)**:
  * Kiến trúc & Đặc tả: [`docs/core_specs/04_system_specifications.md`](docs/core_specs/04_system_specifications.md)
  * Kỹ thuật & Setup: [`docs/core_specs/07_technical_guide.md`](docs/core_specs/07_technical_guide.md)
  * Cơ sở dữ liệu: [`docs/core_specs/08_database_schema.md`](docs/core_specs/08_database_schema.md)
  * Design System: [`docs/core_specs/06_ux_ui_design_system.md`](docs/core_specs/06_ux_ui_design_system.md)
* **🧠 Domain Docs (Nghiệp vụ trinh thám)**:
  * Game Design: [`docs/core_specs/03_game_design.md`](docs/core_specs/03_game_design.md)
  * Quy tắc manh mối: [`docs/investigation_design/04_clues_and_narrative_rules.md`](docs/investigation_design/04_clues_and_narrative_rules.md)
  * Bối cảnh thế giới: [`docs/core_specs/02_world_building.md`](docs/core_specs/02_world_building.md)
  * Văn phong tài liệu: [`docs/core_specs/05_content_and_writing_guidelines.md`](docs/core_specs/05_content_and_writing_guidelines.md)

---

## 🕵️ 1. Cấu trúc Kiến trúc & Tính Nhất Quán của Dự Án
Mọi sửa đổi liên quan đến nội dung vụ án phải đảm bảo tính đồng bộ 100% giữa 4 lớp tài liệu:
* Cốt truyện thuần túy, mốc thời gian và sự thật vụ án.
* Cơ chế giải đố, luồng suy luận và điều kiện mở khóa manh mối.
* Danh mục tổng thể vật chứng & Master Asset Table (đường dẫn tài liệu, mã chứng cứ).
* **Bộ tài liệu LaTeX (`latex/`) & PDF xuất bản (`public/documents/`)**: Hồ sơ pháp y, lời khai nhân chứng, biên bản hiện trường được hiển thị trong web app.

---

## 📑 2. Quy trình Tự Động Biên Dịch & Dọn Dẹp LaTeX (Automated LaTeX Protocol)

Khi Agent chỉnh sửa hoặc cập nhật nội dung bất kỳ file nguồn `.tex` nào (trong `latex/case_000/...`):

1. **Biên dịch cục bộ đúng file vừa sửa**:
   * Chỉ chạy lệnh biên dịch đối với **chính file `.tex` vừa sửa** thông qua lệnh:
     ```bash
     npm run build:latex -- <tên_file>
     ```
   * Không chạy build lại toàn bộ các file khác để tiết kiệm tài nguyên.
2. **Tự động đồng bộ file PDF**:
   * Đưa file PDF tạo thành vào đúng thư mục đích: `public/documents/case_000/<phase>/` để ứng dụng web hiển thị ngay.
3. **Quản lý Log & Dọn Rác Triệt Để**:
   * Di chuyển file `.log` biên dịch vào `.vscode/latex_logs/` để tra cứu khi cần debug.
   * **Xóa sạch toàn bộ file rác tạm** do LaTeX sinh ra (`.aux`, `.out`, `.fls`, `.fdb_latexmk`, `.synctex.gz`) tại thư mục nguồn. Thư mục `latex/` luôn phải 100% sạch sẽ chỉ chứa file `.tex` và asset gốc.

---

## 🎨 3. Tiêu chuẩn Giao diện Trinh Thám & Thẩm mỹ
* Giao diện phong cách hồ sơ trinh thám cổ điển/tối giản: Sử dụng typography sắc nét, màu sắc tài liệu cũ/chính luận.
* Áp dụng nguyên tắc **`/taste`**: Không lạm dụng hiệu ứng neon sặc sỡ, đảm bảo trải nghiệm đọc hồ sơ chân thực trên cả Mobile và Desktop.
