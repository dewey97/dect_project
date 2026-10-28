# Roadmap — trạng thái và việc tiếp theo

> Bản duy nhất còn hiệu lực về tiến độ. Quy trình: [`process/workflow.md`](process/workflow.md). Nợ kỹ thuật: [`TECHDEBT.md`](TECHDEBT.md). Lịch sử: [`history/`](history/).

---

## 1. Trạng thái (2026-10-29)

- Dữ liệu vụ án 100% trên Supabase, biên tập qua Studio. Tạo vụ mới từ số 0 bằng Studio có spec E2E (`e2e/case-v2-from-studio.spec.ts`).
- B0–B27 xong ([`history/2026-10-28_worktree_plan_v6.md`](history/2026-10-28_worktree_plan_v6.md)). Push gần nhất: `b0fd1f3` (2026-10-28).
- Refactor SPEC-22 xong trên `main`, **chưa push**: `630a6f9`..`2c9c010` và commit tài liệu sau đó ([`history/2026-10-28_spec22_refactor_plan.md`](history/2026-10-28_spec22_refactor_plan.md)):
  - Chấm điểm chỉ ở server; API không gửi đáp án; `/api/scan-answer` tự đọc tiêu chí.
  - Mã bypass chỉ có hiệu lực ở dev hoặc với admin.
  - Bộ hồ sơ mở theo `unlocksDossier` của checkpoint.
  - Gỡ hardcode Case #000; `caseId` bắt buộc; cây thư mục gom lại.
- E2E lần cuối: 2 test `case-000` fail do dữ liệu production (`TECHDEBT.md` #20), các spec còn lại đã chạy đều qua. Chưa chạy full suite.

---

## 2. Việc tiếp theo

| #   | Việc                                                                                                                                                                  | Ai                           | Ghi chú                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------- |
| 1   | Sửa dữ liệu `cp-000-0` (tra SĐT không nhận tên nào) và `cp-000-2b` (cáo trạng thiếu `validSuspects`) trong Checkpoint Studio, chạy Linter                             | Chủ dự án                    | `TECHDEBT.md` #20. Production hiện không giải được bước tra SĐT |
| 2   | `pnpm test:e2e` 1 lần, rồi push và smoke test                                                                                                                         | Chủ dự án ra lệnh            | [`process/workflow.md`](process/workflow.md) mục 6              |
| 3   | Chạy migration 48 (`db/schema/48_checkpoint_answers_server_only.sql`) **sau** deploy, khi VPS có `SUPABASE_SERVICE_ROLE_KEY`                                          | AI thực thi, chủ dự án duyệt | Bỏ quyền anon đọc `case_checkpoints`                            |
| 4   | Migration B26-6: bỏ unique thừa, `case_dossiers.flow_position`, `case_board_nodes.checkpoint_id`, `case_characters.avatar_code`; xóa `boardgame_pins_backup_b23`      | AI thực thi                  | Sau deploy                                                      |
| 5   | Gộp kind DB `followup/choice/code/time/text` → `question`                                                                                                             | AI thực thi                  | Cần đọc production trước; code đã xử lý chung                   |
| 6   | Gỡ so khớp key bố cục cũ `c0-pin-*` trong `pin-builder.ts`                                                                                                            | AI thực thi                  | Cần kiểm `boardgame_pins` / `case_board_nodes` production       |
| 7   | Tách file > 1.000 dòng ([`architecture/codebase_architecture.md`](architecture/codebase_architecture.md) mục 7)                                                       | AI thực thi                  |                                                                 |
| 8   | Studio: không còn giao diện đặt hotspot khám xét hiện trường (`saveReinvestigationHotspots` vẫn còn) và nút tạo ghim tự do (`handleCreateNewCustomNode` không ai gọi) | Chủ dự án quyết              | Vụ mới không đặt được hotspot / ghim tự do                      |
| 9   | Bản đồ thế giới: nạp `data/maps/world_vector_map.json` vào `map_vectors`                                                                                              | Chủ dự án                    | `TECHDEBT.md` #18                                               |
| 10  | A6: xoay key trong `.env`, `git rm --cached .env`, thêm vào `.gitignore` / `.dockerignore`                                                                            | Chủ dự án                    | `.env` đang bị track                                            |
| 11  | A10: DNS `xplore.vn` + edge proxy VPS, checklist `deploy/INFRA_HANDOFF_CHECKLIST.md`, bật Leaked Password Protection                                                  | Chủ dự án                    | IP VPS trả `404 page not found`                                 |
| 12  | Live cursor ([`plans/2026-10-25_live_cursor_group_play.md`](plans/2026-10-25_live_cursor_group_play.md))                                                              | AI thực thi                  | Chờ push + smoke test + xác nhận gói Supabase                   |
| 13  | Quyết `archive_3d_vault/` + `/cabinet-demo` (AGENTS.md §8); 6 vụ tĩnh trên `/activate`; gộp `panorama_url` / `scene_360_url`                                          | Chủ dự án                    |                                                                 |

Backlog: đổi tên `case_id` → `case_slug`; tách nội dung khỏi `boardgame_pins`; trang tiến độ vụ trên `/studio/cases/[slug]`; gom ~25 key tiến độ `localStorage` về một object.
