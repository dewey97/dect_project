# Detective Case System (dect_project) — Documentation Map

> **Chỉ mục tài liệu dự án được chuẩn hóa theo 2 tầng: Kỹ thuật (Technical) & Nghiệp vụ Vụ án (Domain).**

---

## ⚙️ 1. Tầng Kỹ Thuật (Technical Specs)

Tài liệu về kiến trúc kỹ thuật, cơ sở dữ liệu, quy trình xuất bản PDF, hệ thống Live CMS và triển khai:

| Tài Liệu                                         | Nội Dung / Phạm Vi                                                                                                              | Đường Dẫn                                                                                                            |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------- |
| **01. Technical Guide**                          | Hướng dẫn setup, cấu trúc mã nguồn Next.js 16, Zero-gate protocol và quy chuẩn bản địa hóa                                      | [`core_specs/01_technical_guide.md`](core_specs/01_technical_guide.md)                                               |
| **02. Database Schema**                          | Cấu trúc dữ liệu PostgreSQL / Supabase, 14 bảng DDL và chính sách bảo mật RLS                                                   | [`core_specs/02_database_schema.md`](core_specs/02_database_schema.md)                                               |
| **03. Google Sheets Live CMS**                   | Đặc tả hệ thống Google Sheets CMS realtime, cấu trúc bảng và quy trình biên kịch                                                | [`core_specs/03_google_sheets_cms.md`](core_specs/03_google_sheets_cms.md)                                           |
| **04. Design System & UI/UX**                    | Hệ thống màu sắc Neo-noir, typography, token và mobile-first focus guidelines                                                   | [`core_specs/04_ux_ui_design_system.md`](core_specs/04_ux_ui_design_system.md)                                       |
| **05. Analytics & Tracking Spec**                | Đặc tả hệ thống đo lường Firebase Analytics/GA4, danh mục sự kiện và KPI game                                                   | [`core_specs/05_analytics_tracking_spec.md`](core_specs/05_analytics_tracking_spec.md)                               |
| **06. CI/CD & VPS Deployment**                   | Hướng dẫn kiến trúc CI/CD tự động hóa qua GitHub Actions, GHCR và Docker VPS                                                    | [`core_specs/06_cicd_deployment_guide.md`](core_specs/06_cicd_deployment_guide.md)                                   |
| **07. License & Access Control**                 | Đặc tả nghiệp vụ mô hình cấp quyền Board Game / Online, chính sách bảo vệ tài liệu                                              | [`core_specs/07_license_access_system.md`](core_specs/07_license_access_system.md)                                   |
| **08. License Technical Spec**                   | Đặc tả kỹ thuật mã hóa RSA JWT, keypair management và RLS policy cho License                                                    | [`core_specs/08_license_technical_spec.md`](core_specs/08_license_technical_spec.md)                                 |
| **09. Business Model Spec**                      | Mô hình kinh doanh chi tiết 9 trụ cột Canvas: phân khúc khách hàng, giá trị cốt lõi, kênh tiếp thị, dòng doanh thu              | [`core_specs/09_business_model_spec.md`](core_specs/09_business_model_spec.md)                                       |
| **10. Financial & Founder Model**                | Bóc tách chi phí in ấn Boardgame, điểm hòa vốn, thỏa thuận phân bổ 3 founder (All-in vs Part-time) và định hướng pháp lý        | [`core_specs/10_financial_founder_model.md`](core_specs/10_financial_founder_model.md)                               |
| **11. Figma Design Workflow**                    | Quy trình kết nối Figma, cấu hình MCP, trích xuất asset @3x, interactive hotspots và thiết kế UI                                | [`core_specs/10_figma_design_workflow.md`](core_specs/10_figma_design_workflow.md)                                   |
| **11. Group Play Realtime Spec**                 | Đặc tả kiến trúc đồng bộ chơi nhóm qua Supabase Realtime, phòng 4 chữ cái và chống race condition                               | [`core_specs/11_group_play_realtime_spec.md`](core_specs/11_group_play_realtime_spec.md)                             |
| **12. Group Play Plan**                          | Kế hoạch triển khai kỹ thuật chi tiết theo 4 giai đoạn, schema và kịch bản kiểm thử                                             | [`core_specs/12_group_play_implementation_plan.md`](core_specs/12_group_play_implementation_plan.md)                 |
| **13. Architecture Hardening & Roadmap**         | Đúc kết tinh hoa hệ thống Lendi: CI/CD phòng thủ, tự động rollback, dọn đĩa VPS và rate limit                                   | [`core_specs/13_architecture_hardening_and_roadmap.md`](core_specs/13_architecture_hardening_and_roadmap.md)         |
| **14. Multi-Case Engine & Hybrid CMS**           | Chuẩn hóa kiến trúc đa vụ án, Figma Document Pipeline, chống leak kịch bản và 1-Click Sync Database                             | [`core_specs/14_multi_case_engine_and_cms_architecture.md`](core_specs/14_multi_case_engine_and_cms_architecture.md) |
| **15. Cross-Case Phone Simulator Spec**          | Đặc tả kiến trúc Module Điện Thoại & Bằng chứng số dùng chung cho mọi vụ án, Plug & Play Apps                                   | [`core_specs/15_cross_case_phone_simulator_spec.md`](core_specs/15_cross_case_phone_simulator_spec.md)               |
| **16. Detective Rating & Leaderboard**           | Đặc tả hệ thống điểm nghiệp vụ, ma trận trừ điểm gợi ý, xếp hạng Rank S/A/B/C và Bảng xếp hạng                                  | [`core_specs/16_detective_rating_and_leaderboard_spec.md`](core_specs/16_detective_rating_and_leaderboard_spec.md)   |
| **17. Vector Map Engine & Studio**               | Đặc tả bản đồ vector SVG đa lớp, Map Studio trực quan, nắn đường Catmull-Rom và tích hợp iPhone Maps                            | [`core_specs/17_vector_map_engine_and_studio_spec.md`](core_specs/17_vector_map_engine_and_studio_spec.md)           |
| **18. Dossier Studio & Document Spec**           | Đặc tả hệ thống biên soạn hồ sơ hành chính, lời khai, lý lịch bị can, con dấu nghiệp vụ và in ấn A4/A5                          | [`core_specs/18_dossier_studio_and_document_spec.md`](core_specs/18_dossier_studio_and_document_spec.md)             |
| **19. Checkpoint Studio & Structured Authoring** | Đặc tả module biên tập checkpoint, bảng `case_checkpoints`, runtime Supabase, đồ thị phụ thuộc và lưu vị trí node | [`core_specs/19_checkpoint_studio.md`](core_specs/19_checkpoint_studio.md)                                           |
| **Nợ Kỹ Thuật (Tech Debt)**                      | Sổ cái quản lý nợ kỹ thuật 2 tầng, danh mục mock UI và mã số bất biến `#ID`                                                     | [`TECHDEBT.md`](TECHDEBT.md)                                                                                         |

---

## 🧠 2. Tầng Nghiệp Vụ & Hồ Sơ Vụ Án (Domain & Case Docs)

Tài liệu về bối cảnh cốt truyện, ma trận giải đố, cơ chế điều tra và hành trình trải nghiệm Vụ án #000:

| Tài Liệu                                 | Nội Dung / Phạm Vi                                                                                    | Đường Dẫn                                                                                                      |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Case #000: Master Storyline**          | Tổng quan thiết kế, bối cảnh thế giới, ma trận nghi phạm & logic cốt truyện Vụ án #000                | [`cases/case_000/01_design/case_design.md`](cases/case_000/01_design/case_design.md)                           |
| **Case #000: Gameplay & Checkpoints**    | Sơ đồ luồng điều tra, điều kiện mở khóa tuyến A/B/C và ma trận bằng chứng                             | [`cases/case_000/01_design/gameplay_design.md`](cases/case_000/01_design/gameplay_design.md)                   |
| **Case #000: Re-investigation Hotspots** | Đặc tả 8 điểm tương tác khám xét lại (Point-and-Click 2D, hiệu ứng SFX & zoom)                        | [`cases/case_000/01_design/reinvestigation_hotspots.md`](cases/case_000/01_design/reinvestigation_hotspots.md) |
| **Case #000: Figma Handover Spec**       | Thông số AST, Node IDs (22:389, 22:453, 22:582, 22:755), màn hình iPhone tang vật & lộ trình bàn giao | [`cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md`](cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md)           |

---

## 📁 3. Thư Mục Tài Nguyên Thiết Kế Vụ Án (`docs/cases/case_000/`)

- `01_design/`: Tài liệu kịch bản, gameplay, tọa độ khám xét lại hiện trường và thông số bàn giao Figma (`FIGMA_HANDOVER_SPEC.md`, `figma_refs/`).
- `02_photos/`: Ảnh nhân vật, sơ đồ phấn hiện trường, tài liệu đồ họa gốc và [**Danh mục quy hoạch tài nguyên hình ảnh (`ASSET_CATALOG.md`)**](cases/case_000/02_photos/ASSET_CATALOG.md).
- `03_audio/`: File thoại nhân vật (Khang, Vy, Hà) và hiệu ứng âm thanh môi trường.
- `04_3d/`: Mô hình 3D Glb đồ đạc hiện trường phòng khách/phòng ngủ.
- `05_reinvestigation/`: Dữ liệu ảnh 360 panorama, âm thanh tương tác và video hiện trường.
