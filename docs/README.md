# Tài liệu dự án — chỉ mục

> Hai tầng theo `AGENTS.md` global §5: **kỹ thuật** (cách hệ thống chạy) và **nghiệp vụ** (vụ án, sản phẩm). Bắt đầu từ [`ROADMAP.md`](ROADMAP.md) và [`process/workflow.md`](process/workflow.md).

```
docs/
  README.md            Chỉ mục (file này)
  ROADMAP.md           Trạng thái hiện tại, việc tiếp theo
  TECHDEBT.md          Sổ nợ kỹ thuật, mã #ID bất biến
  process/             Quy trình làm việc, kiểm tra, bàn giao
  architecture/        Kiến trúc kỹ thuật: codebase, DB, engine
  studio/              Studio biên tập vụ án (/studio/*)
  ops/                 CI/CD, gia cố vận hành, analytics
  design/              Design system, Figma
  product/             License, mô hình kinh doanh, xếp hạng
  cases/<case_id>/     Kịch bản, gameplay, tư liệu gốc của từng vụ
  plans/               Kế hoạch chưa thực hiện
  history/             Kế hoạch đã xong, audit, backup (chỉ đọc)
```

---

## Kỹ thuật

| Tài liệu                                                                         | Nội dung                                                                                                                                        |
| :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`process/workflow.md`](process/workflow.md)                                     | Quy ước, lệnh kiểm tra, ngân sách E2E, điều kiện done, truy cập Supabase production, review, bài học, deploy + smoke test, mẫu worktree/báo cáo |
| [`architecture/codebase_architecture.md`](architecture/codebase_architecture.md) | Cây thư mục, route API, luồng dữ liệu, mô hình checkpoint, chấm điểm server, tiến độ và mở bộ hồ sơ, bảng điều tra                              |
| [`architecture/technical_guide.md`](architecture/technical_guide.md)             | Setup, stack Next.js 16, quy chuẩn code                                                                                                         |
| [`architecture/database_schema.md`](architecture/database_schema.md)             | Bảng Supabase, RLS, migration                                                                                                                   |
| [`architecture/group_play_realtime.md`](architecture/group_play_realtime.md)     | Chơi nhóm qua Supabase Realtime                                                                                                                 |
| [`architecture/phone_engine.md`](architecture/phone_engine.md)                   | Điện thoại giả lập dùng chung mọi vụ                                                                                                            |
| [`architecture/vector_map_engine.md`](architecture/vector_map_engine.md)         | Bản đồ vector thế giới và Map Studio                                                                                                            |
| [`studio/authoring_guide.md`](studio/authoring_guide.md)                         | Chức năng, trường, luồng dựng vụ mới; luật mở bộ hồ sơ                                                                                          |
| [`studio/checkpoint_studio.md`](studio/checkpoint_studio.md)                     | Checkpoint Studio, bảng `case_checkpoints`, đồ thị phụ thuộc                                                                                    |
| [`studio/dossier_studio.md`](studio/dossier_studio.md)                           | Dossier Studio: hồ sơ, lời khai, lý lịch, vật chứng                                                                                             |
| [`studio/phone_studio.md`](studio/phone_studio.md)                               | Phone Studio và bảng dữ liệu điện thoại                                                                                                         |
| [`ops/cicd_deployment.md`](ops/cicd_deployment.md)                               | GitHub Actions, GHCR, Docker VPS                                                                                                                |
| [`ops/hardening.md`](ops/hardening.md)                                           | Rollback, dọn đĩa VPS, rate limit, cache phòng thủ                                                                                              |
| [`ops/analytics_tracking.md`](ops/analytics_tracking.md)                         | Firebase Analytics / GA4, sự kiện, KPI                                                                                                          |
| [`design/design_system.md`](design/design_system.md)                             | Màu, typography, token, quy tắc mobile                                                                                                          |
| [`design/figma_workflow.md`](design/figma_workflow.md)                           | Figma MCP, trích xuất asset                                                                                                                     |
| [`TECHDEBT.md`](TECHDEBT.md)                                                     | Nợ kỹ thuật                                                                                                                                     |

## Nghiệp vụ

| Tài liệu                                                                                                       | Nội dung                                           |
| :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| [`cases/case_000/01_design/case_design.md`](cases/case_000/01_design/case_design.md)                           | Case #000: bối cảnh, nhân vật, sự thật vụ án       |
| [`cases/case_000/01_design/gameplay_design.md`](cases/case_000/01_design/gameplay_design.md)                   | Case #000: luồng điều tra, checkpoint, mở bộ hồ sơ |
| [`cases/case_000/01_design/reinvestigation_hotspots.md`](cases/case_000/01_design/reinvestigation_hotspots.md) | Case #000: điểm khám xét lại hiện trường 360       |
| [`cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md`](cases/case_000/01_design/FIGMA_HANDOVER_SPEC.md)           | Case #000: bàn giao Figma                          |
| [`cases/case_000/02_photos/ASSET_CATALOG.md`](cases/case_000/02_photos/ASSET_CATALOG.md)                       | Danh mục asset `public/` của Case #000             |
| [`product/license_access.md`](product/license_access.md)                                                       | Mô hình cấp quyền Board Game / Online              |
| [`product/license_technical.md`](product/license_technical.md)                                                 | Kỹ thuật license (JWT, RLS)                        |
| [`product/business_model.md`](product/business_model.md)                                                       | Mô hình kinh doanh                                 |
| [`product/financial_founder_model.md`](product/financial_founder_model.md)                                     | Chi phí, hòa vốn, founder                          |
| [`product/rating_leaderboard.md`](product/rating_leaderboard.md)                                               | Điểm thám tử, xếp hạng (chưa triển khai)           |

### Tư liệu gốc vụ án (`cases/<case_id>/`)

- `01_design/`: kịch bản, gameplay, hotspot, bàn giao Figma (`figma_refs/`).
- `02_photos/`: ảnh nhân vật, sơ đồ hiện trường, đồ họa gốc, `ASSET_CATALOG.md`.
- `03_audio/`: thoại nhân vật, âm thanh môi trường.
- `05_reinvestigation/`: ảnh 360, âm thanh, video hiện trường.

Asset dùng lúc chạy game nằm ở `public/` và phải có trong `ASSET_CATALOG.md` (AGENTS.md §5).

## Kế hoạch và lịch sử

| Tài liệu                                                                                             | Trạng thái                 |
| :--------------------------------------------------------------------------------------------------- | :------------------------- |
| [`plans/2026-10-25_live_cursor_group_play.md`](plans/2026-10-25_live_cursor_group_play.md)           | Chưa giao                  |
| [`history/2026-10-28_spec22_refactor_plan.md`](history/2026-10-28_spec22_refactor_plan.md)           | Refactor SPEC-22, đã xong  |
| [`history/2026-10-28_worktree_plan_v6.md`](history/2026-10-28_worktree_plan_v6.md)                   | Plan B26/B27, đã xong      |
| [`history/2026-10-28_audit_db_studio_structure.md`](history/2026-10-28_audit_db_studio_structure.md) | Audit DB/Studio, đã xử lý  |
| `history/backups/`                                                                                   | Backup JSON dữ liệu đã xóa |
