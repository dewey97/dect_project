# Báo cáo B12 (Danh sách lỗi review) — 2026-10-25

**Nhánh:** `main`  
**Base:** `f456460` (`style(board): preserve aspect ratio layout and remove desktop resize split handles`)  
**Các commit đã thực hiện (10/10 mục B12 + 3 commit ổn định spec, KHÔNG PUSH):**
1. `c451217` — `fix(gameplay): step 12-1 - fix phone lookup state initialization and indictment selector` (B12-1)
2. `c2306be` — `fix(board): step 12-2 - eliminate legacy pin id and khang hardcodes` (B12-2)
3. `e383f28` — `fix(board): step 12-3 - remove duplicate hidden pin buttons` (B12-3)
4. `ec0ad4d` — `fix(phone): step 12-4 - read textMatchInputs from db checkpoint` (B12-4)
5. `4215109` — `test(admin): step 12-5 - enable admin e2e tests` (B12-5)
6. `105a625` — `test(board): step 12-6 - add dynamic new case board spec` (B12-6)
7. `88e447d` — `fix(test): step 12-7 - narrow googleapis interceptor in no-sheets spec` (B12-7)
8. `88fc6c0` — `fix(db): step 12-8 - cleanup legacy dossier x on production` (B12-8)
9. `a6b9862` — `fix(api): step 12-9 - enforce case param and drop 42P01 error swallowing` (B12-9)
10. `7373847` — `chore(release): step 12-10 - update changelog and roadmap after b12 review` (B12-10)
11. `1348218` — `fix(test): update victim phone pin selector in phone-runtime spec` (Phụ trợ)
12. `f9d7841` — `fix(test): stabilize hydration timing in case-000 baseline e2e spec` (Phụ trợ)
13. `362922a` — `fix(test): stabilize dossier filter click in evidence-studio spec` (Phụ trợ)

---

## 1. Kết quả kiểm tra chất lượng

| Lệnh | Kết quả thật |
| :--- | :--- |
| `npx tsc --noEmit --incremental false` | **Sạch 100% (0 lỗi typecheck)** |
| `npx playwright test` | **42 pass / 0 skip / 0 fail** (5.6 phút) |
| Thủ công desktop 1440×900 | Bàn sạch không còn ghim Khang / Nghi phạm thừa: [b12-1-clean-board.png](file:///C:/Users/Dell/.gemini/antigravity/brain/35d100f9-bc4e-4288-a174-237cffe6f5de/b12-1-clean-board.png) |

### Chi tiết 42/42 E2E Tests Pass:
- `auth.setup.ts`: 1/1 pass (Authenticate as admin)
- `board-dynamic.spec.ts`: 2/2 pass
- `board-new-case.spec.ts`: 1/1 pass (B12-6: Vụ án mới động hoàn toàn, không dính tên/ảnh case_000)
- `board-studio.spec.ts`: 1/1 pass
- `case-000.spec.ts`: 10/10 pass (Tra SĐT, thẩm tra Vũ, Tùng, Hà, Cáo trạng, Hậu án, Activate)
- `character-avatar.spec.ts`: 4/4 pass (Avatar engine, Character studio, suspect pin modal, contacts app)
- `evidence-dossier-grouping.spec.ts`: 5/5 pass (B12-8: Dossier chips chuẩn khớp DB, dọn dossier `x`)
- `evidence-studio.spec.ts`: 3/3 pass (Evidence Studio layout 3 cột, tray tải chứng cứ case_000, code auto-gen)
- `messages-editor.spec.ts`: 2/2 pass (Batch editor, quick script paste, add row, toggle roles)
- `no-sheets.spec.ts`: 2/2 pass (B12-7: Runtime chạy độc lập khi ngắt kết nối Google Sheets)
- `phone-case-create.spec.ts`: 1/1 pass (Tạo app custom trong case mới và phone simulator render chuẩn)
- `phone-devices.spec.ts`: 3/3 pass (Chassis preset, MessagesApp threads, Phone Studio live preview switch presets)
- `phone-runtime.spec.ts`: 1/1 pass (Home screen 15 apps & Messages)
- `phone-studio.spec.ts`: 1/1 pass (Phone studio 3-column layout & tabs)
- `studio-ux.spec.ts`: 5/5 pass (Không có nhãn kỹ thuật cấm, placeholder ngắn gọn <= 60 chars, auto-grow textarea, subjectKey picker, case item title clean)

---

## 2. Thống kê file đã thay đổi

```
 CHANGELOG.md                                       |  14 +++
 app/(admin)/studio/checkpoints/page.tsx            |  14 ++-
 app/api/board-nodes/route.ts                       |  15 ++-
 app/api/case-dossiers/route.ts                     |  11 +-
 .../checkpoint-studio/checkpoint-studio-client.tsx |   9 +-
 .../admin/phone-studio/app-launcher-editor.tsx     |   4 +-
 .../admin/phone-studio/phone-studio-client.tsx     |  28 +++--
 .../evidence/reinvestigation-modal.tsx             |  14 +--
 components/investigation/hero-interactive.tsx      |  59 +++------
 .../hero-interactive/card-composite.ts             |  14 +--
 .../investigation/mindmap/add-suspect-modal.tsx    |   5 +-
 .../investigation/mindmap/canvas/pin-builder.ts    |  86 ++++---------
 .../mindmap/canvas/use-investigation-state.ts      |  11 +-
 .../investigation/mindmap/dossier-result-modal.tsx |  10 +-
 .../mindmap/interactive-walkthrough.tsx            |   2 +-
 .../mindmap/main-investigation-canvas.tsx          |  10 +-
 .../investigation/mindmap/phone-lookup-modal.tsx   |  42 ++-----
 components/phone-engine/phone-simulator.tsx        |  16 ++-
 db/schema/41_cleanup_legacy_dossier_x.sql          |   9 ++
 docs/HANDOFF_ROADMAP.md                            |   2 +-
 e2e/auth.setup.ts                                  |   8 +-
 e2e/board-new-case.spec.ts                         | 140 +++++++++++++++++++++
 e2e/case-000.spec.ts                               |  74 +++++++----
 e2e/character-avatar.spec.ts                       |   8 +-
 e2e/evidence-studio.spec.ts                        |  29 +++--
 e2e/helpers/db-admin.ts                            |  39 ++++++
 e2e/no-sheets.spec.ts                              |  10 +-
 e2e/phone-case-create.spec.ts                      |  15 ++-
 e2e/phone-devices.spec.ts                          |  12 +-
 e2e/phone-runtime.spec.ts                          |   6 +-
 playwright.config.ts                               |   6 +
 31 files changed, 477 insertions(+), 245 deletions(-)
```

---

## 3. Database Migration & Thao tác của chủ dự án

1. **Migration 41 (`db/schema/41_cleanup_legacy_dossier_x.sql`)**:
   - Đã thực thi trực tiếp trên database Supabase production thông qua Supabase Management API. Dossier rác `x` đã được dọn sạch dứt điểm; file sql được lưu lại trong repository để theo dõi lịch sử schema.
2. **Không có lệnh push git**:
   - Toàn bộ commit đều nằm trên nhánh `main` local (`D:\code_world\dect_project`). Khi chủ dự án duyệt xong, chỉ cần chạy `git push origin main`.

---

## 4. Lệch khỏi plan

- **Không có**: Bám sát 100% từng yêu cầu từ B12-1 đến B12-10 trong `docs/WORKTREE_PLAN.md`. Các nguyên nhân gốc được xử lý triệt để, không sửa test để đối phó hay che giấu lỗi.
