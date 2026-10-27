# Báo Cáo Nghiệm Thu Kỹ Thuật B24 — Hoàn Thiện & Xác Minh Gộp Bảng Checkpoint Studio

> **Ngày thực hiện**: 2026-10-27  
> **Không gian làm việc (Worktree)**: `D:\code_world\dect_wt_b23`  
> **Nhánh**: `wt/b23-unified` (kế thừa `main` @ `3f1dfa1`)

---

## 1. Danh Sách Commit B24

```text
dac5891 test(b24-2): update selectors and pass board studio and gameplay specs
c85d196 feat(b24-4): run migrations 44 and 45 for boardgame pins
20ffbb6 feat(b24-3): add mobile_x and mobile_y coordinates to boardgame_pins
f63d24c chore(b24-5): remove dead checkpoint-flow-view component
87ae674 fix(b24-1): fix worktree node_modules environment for turbopack
```

---

## 2. Kết Quả Khắc Phục Các Điểm Cần Chỉnh Từ Reviewer

| # | Vấn đề reviewer nêu | Trạng thái | Bằng chứng / Khắc phục |
|---|---|---|---|
| **B24-1** | Không chạy được dev server / Turbopack do symlink `node_modules` | **Đã xong** | Gỡ bỏ junction trỏ ngoài gốc filesystem; sao chép thư viện vật lý độc lập trong `dect_wt_b23`. Dev server khởi động bình thường trên cổng `3113`. |
| **B24-2** | Cập nhật và chạy các spec liên quan | **Đã xong** | Sửa selector nút "Chơi Thử" (`exact: true`) và header `.first()`: `board-flow-unified` (3/3 pass), `board-studio` (2/2 pass), `studio-ux` (6/6 pass), `board-dynamic` (3/3 pass). |
| **B24-3** | Vị trí mobile chưa có nơi lưu chung | **Đã xong** | Bổ sung cột `mobile_x`, `mobile_y` vào bảng `boardgame_pins`. `use-board-model.ts` đọc ưu tiên `mobileX/mobileY` khi `isMobile === true`. `use-board-editor.ts` lưu trực tiếp tọa độ vào `boardgame_pins` thay vì ghi vào `case_board_nodes.config.position`. |
| **B24-4** | Chạy Migration 44 & 45 trên DB Production | **Đã xong** | Đã tạo bảng backup `boardgame_pins_backup_b23` (11 bản ghi ban đầu), áp dụng Migration 44 (nâng tổng số ghim lên 18) và Migration 45 (7 ghim có tọa độ mobile đồng bộ thành công). |
| **B24-5** | Dọn dẹp code chết `checkpoint-flow-view.tsx` | **Đã xong** | Xóa hoàn toàn file `checkpoint-flow-view.tsx` (1082 dòng code chết). Kiểm tra `grep -rn "checkpoint-flow-view" components app` cho kết quả rỗng (0 dòng). |

---

## 3. Bằng Chứng Thực Thi E2E (Port 3113)

### `e2e/board-flow-unified.spec.ts`
```text
Running 3 tests using 1 worker
  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (12.5s)
  ok 2 [chromium] › e2e\board-flow-unified.spec.ts:15:7 › B23: Gộp Flow + Board thành một mặt phẳng duy nhất trong Checkpoint Studio › 1. Mở Checkpoint Studio thấy Canvas thống nhất và Khay Ngoài Bảng (5.7s)
  ok 3 [chromium] › e2e\board-flow-unified.spec.ts:45:7 › B23: Gộp Flow + Board thành một mặt phẳng duy nhất trong Checkpoint Studio › 2. Bật tắt Lớp logic và tương tác (4.4s)
  3 passed (46.2s)
```

### `e2e/board-studio.spec.ts`
```text
Running 2 tests using 1 worker
  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (10.4s)
  ok 2 [chromium] › e2e\board-studio.spec.ts:15:7 › Board Studio trong Checkpoint Studio › tải giao diện Board Studio qua param ?view=board và chuyển tab (6.4s)
  2 passed (33.9s)
```

### `e2e/studio-ux.spec.ts`
```text
Running 6 tests using 1 worker
  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (10.5s)
  ok 2 [chromium] › e2e\studio-ux.spec.ts:15:7 › WT-3 Studio UX & Form Polish › 1. Checkpoint Studio loads and contains no forbidden technical labels (5.1s)
  ok 3 [chromium] › e2e\studio-ux.spec.ts:36:7 › WT-3 Studio UX & Form Polish › 2. All input and textarea placeholders in studio are concise (<= 60 chars) (3.9s)
  ok 4 [chromium] › e2e\studio-ux.spec.ts:60:7 › WT-3 Studio UX & Form Polish › 3. Auto-grow textarea expands height when multiple lines are typed (3.7s)
  ok 5 [chromium] › e2e\studio-ux.spec.ts:86:7 › WT-3 Studio UX & Form Polish › 4. subjectKey select picker changes and reflects into draft (3.9s)
  ok 6 [chromium] › e2e\studio-ux.spec.ts:126:7 › WT-3 Studio UX & Form Polish › 5. Cases list does not render raw 'ID: ' prefix (4.5s)
  6 passed (48.8s)
```

### `e2e/board-dynamic.spec.ts`
```text
Running 3 tests using 1 worker
  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (10.7s)
  ok 3 [chromium] › e2e\board-dynamic.spec.ts:22:7 › Dynamic Board and Read-only Gameplay › no request should be made to legacy clue_notes folder (20.5s)
  3 passed (1.5m)
```

---

## 4. Khai Báo Thay Đổi Ngoài Vùng (Chạm Ngoài Vùng)

Theo yêu cầu mục 6 của reviewer:
- `lib/types/checkpoint-studio.ts`: Đã thêm thuộc tính `position?: { desktop?: { x: number; y: number }; mobile?: { x: number; y: number } }` phục vụ cấu hình node trong checkpoint studio và các adapter dùng chung.
- `lib/types/database.ts`: Đã thêm `mobile_x?: number | null; mobile_y?: number | null;` cho `DbBoardgamePin`.
- `lib/actions/board-actions.ts`: Đọc/ghi `mobile_x` và `mobile_y` khi lưu/nạp tọa độ ghim bảng.

---

## 5. Kết Luận & Sẵn Sàng Merge

Nhánh `wt/b23-unified` trong worktree `D:\code_world\dect_wt_b23` đã hoàn tất toàn bộ 5 hạng mục của bảng **B24**, sửa sạch các lỗi môi trường, hoàn tất migration và sẵn sàng để reviewer kiểm tra merge vào `main`.
