# Detective Case System (dect_project) — Documentation Map

> **Chỉ mục tài liệu dự án được chuẩn hóa theo 2 tầng: Kỹ thuật (Technical) & Nghiệp vụ Vụ án (Domain).**

---

## ⚙️ 1. Tầng Kỹ Thuật (Technical Specs)

Tài liệu về kiến trúc kỹ thuật, cơ sở dữ liệu, quy trình xuất bản PDF, hệ thống Live CMS và triển khai:

| Tài Liệu | Nội Dung / Phạm Vi | Đường Dẫn |
| :--- | :--- | :--- |
| **01. Technical Guide** | Hướng dẫn setup, cấu trúc mã nguồn Next.js 16, Zero-gate protocol và quy chuẩn bản địa hóa | [`core_specs/01_technical_guide.md`](core_specs/01_technical_guide.md) |
| **02. Database Schema** | Cấu trúc dữ liệu PostgreSQL / Supabase, 14 bảng DDL và chính sách bảo mật RLS | [`core_specs/02_database_schema.md`](core_specs/02_database_schema.md) |
| **03. Google Sheets Live CMS** | Đặc tả hệ thống Google Sheets CMS realtime, cấu trúc bảng và quy trình biên kịch | [`core_specs/03_google_sheets_cms.md`](core_specs/03_google_sheets_cms.md) |
| **04. Design System & UI/UX** | Hệ thống màu sắc Neo-noir, typography, token và mobile-first focus guidelines | [`core_specs/04_ux_ui_design_system.md`](core_specs/04_ux_ui_design_system.md) |
| **05. Analytics & Tracking Spec** | Đặc tả hệ thống đo lường Firebase Analytics/GA4, danh mục sự kiện và KPI game | [`core_specs/05_analytics_tracking_spec.md`](core_specs/05_analytics_tracking_spec.md) |
| **06. CI/CD & VPS Deployment** | Hướng dẫn kiến trúc CI/CD tự động hóa qua GitHub Actions, GHCR và Docker VPS | [`core_specs/06_cicd_deployment_guide.md`](core_specs/06_cicd_deployment_guide.md) |
| **07. License & Access Control** | Đặc tả nghiệp vụ mô hình cấp quyền Board Game / Online, chính sách bảo vệ tài liệu | [`core_specs/07_license_access_system.md`](core_specs/07_license_access_system.md) |
| **08. License Technical Spec** | Đặc tả kỹ thuật mã hóa RSA JWT, keypair management và RLS policy cho License | [`core_specs/08_license_technical_spec.md`](core_specs/08_license_technical_spec.md) |
| **09. Business, Financial & Founder Model** | Mô hình kinh doanh Boardgame / Online, bảng tính chi phí in ấn, điểm hòa vốn và thỏa thuận phân bổ 3 founder | [`core_specs/09_business_financial_model.md`](core_specs/09_business_financial_model.md) |
| **10. Figma Design Workflow** | Quy trình kết nối Figma, cấu hình MCP, trích xuất asset @3x, interactive hotspots và thiết kế UI | [`core_specs/10_figma_design_workflow.md`](core_specs/10_figma_design_workflow.md) |

---

## 🧠 2. Tầng Nghiệp Vụ & Hồ Sơ Vụ Án (Domain & Case Docs)

Tài liệu về bối cảnh cốt truyện, ma trận giải đố, cơ chế điều tra và hành trình trải nghiệm Vụ án #000:

| Tài Liệu | Nội Dung / Phạm Vi | Đường Dẫn |
| :--- | :--- | :--- |
| **Case #000: Master Storyline** | Tổng quan thiết kế, bối cảnh thế giới, ma trận nghi phạm & logic cốt truyện Vụ án #000 | [`cases/case_000/01_design/case_design.md`](cases/case_000/01_design/case_design.md) |
| **Case #000: Gameplay & Checkpoints** | Sơ đồ luồng điều tra, điều kiện mở khóa tuyến A/B/C và ma trận bằng chứng | [`cases/case_000/01_design/gameplay_design.md`](cases/case_000/01_design/gameplay_design.md) |
| **Case #000: Re-investigation Hotspots** | Đặc tả 8 điểm tương tác khám xét lại (Point-and-Click 2D, hiệu ứng SFX & zoom) | [`cases/case_000/01_design/reinvestigation_hotspots.md`](cases/case_000/01_design/reinvestigation_hotspots.md) |
| **Case #000: Figma Handover Spec** | Thông số AST, Node IDs (22:389, 22:453, 22:582, 22:755), màn hình iPhone tang vật & lộ trình bàn giao | [`cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md`](cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md) |

---

## 📁 3. Thư Mục Tài Nguyên Thiết Kế Vụ Án (`docs/cases/case_000/`)

- `01_design/`: Tài liệu kịch bản, gameplay, tọa độ khám xét lại hiện trường và thông số bàn giao Figma (`FIGMA_HANDOVER_SPEC.md`, `figma_refs/`).
- `02_photos/`: Ảnh nhân vật, sơ đồ phấn hiện trường, tài liệu đồ họa gốc và [**Danh mục quy hoạch tài nguyên hình ảnh (`ASSET_CATALOG.md`)**](cases/case_000/02_photos/ASSET_CATALOG.md).
- `03_audio/`: File thoại nhân vật (Khang, Vy, Hà) và hiệu ứng âm thanh môi trường.
- `04_3d/`: Mô hình 3D Glb đồ đạc hiện trường phòng khách/phòng ngủ.
- `05_reinvestigation/`: Dữ liệu ảnh 360 panorama, âm thanh tương tác và video hiện trường.
