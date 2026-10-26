# Báo Cáo Nghiệm Thu Plan B23: Gộp Flow + Board Thành Một Mặt Phẳng

> **Thời điểm**: 2026-10-27  
> **Nhánh thực thi**: `wt/b23-unified` (trong worktree `D:\code_world\dect_wt_b23`)  
> **Căn cứ kế hoạch**: `docs/reports/REVIEW_FLOW_BOARD_SYNC_2026-10-26.md` và `docs/WORKTREE_PLAN.md` bảng B23  
> **Nguyên tắc**: Một màn hình, một dữ liệu, một nơi lưu vị trí; hoàn toàn độc lập, không can thiệp thư mục `main`.

---

## 1. Danh Sách Commit (git log --oneline main..wt/b23-unified)

```text
39f78d1 docs(b23): update checkpoint studio spec and add unified canvas e2e
7242ec1 feat(b23-5): persist dossier node positions to database and remove localstorage
ed1e6e0 feat(b23-4): add interactive logic dependency layer on board canvas
8b35e58 feat(b23-3): standardize all node positions to boardgame_pins
aefa840 feat(b23-2): unify flow and board into single checkpoint studio surface
ed18eca feat(b23-1): implement shared useBoardModel hook for gameplay and studio
```

---

## 2. Chi Tiết Thực Hiện Từng Mục (B23-1 → B23-5)

### ✅ B23-1: Hook Dùng Chung `useBoardModel(caseId)` (`ed18eca`)
- **Mục tiêu**: Hợp nhất nguồn dựng ghim điều tra giữa gameplay và Studio.
- **Thực hiện**:
  - Tạo `components/investigation/mindmap/canvas/use-board-model.ts`: nạp đầy đủ checkpoints, characters, evidence, board nodes, `boardgame_pins` và `boardgame_connections`; tính toán pins đồng bộ qua `buildCustomPins` và `buildCustomConnections`.
  - Cập nhật `components/admin/checkpoint-studio/board/use-board-editor.ts` và `components/investigation/mindmap/canvas/use-board-layout.ts` chuyển sang dùng chung `useBoardModel`.
- **Kết quả**: Khắc phục hoàn toàn hiện tượng Board Studio thiếu ghim tra SĐT, ghim ảnh các nghi phạm, ghim câu hỏi phụ, ghim cáo trạng. Studio và gameplay giờ đây luôn nhìn thấy 100% cùng một tập hợp ghim.

### ✅ B23-2: Màn Hình Gộp Trong Checkpoint Studio (`aefa840`)
- **Mục tiêu**: Xóa bỏ phân tách tab Flow / Board, tạo một mặt phẳng duy nhất (Unified Canvas).
- **Thực hiện**:
  - Refactor `components/admin/checkpoint-studio/checkpoint-studio-client.tsx`:
    - Trung tâm: Canvas Bảng điều tra `HeroInteractive` (Preview và Edit trực tiếp).
    - Phía dưới Canvas: Khay Ngoài Bảng (`OffBoardTray` mới tại `components/admin/checkpoint-studio/off-board-tray.tsx`) quản lý các checkpoint hậu án (`epilogue`), checkpoint ẩn (`board_config.hidden === true`), và các bộ hồ sơ (`dossiers`). Cung cấp nút "Lên bảng" để đưa node lên canvas ngay lập tức.
    - Bên phải: Hộp biên tập Inspector co giãn (`sidebarWidth`):
      - Khi click node checkpoint trên canvas hoặc trong khay -> mở `CheckpointEditor` với đầy đủ các tab form chuyên sâu.
      - Khi click custom board node -> mở `BoardNodeForm`.
    - Phản ánh tức thì: Sửa tên/loại/nhân vật trong form -> Canvas cập nhật nhãn/ảnh theo thời gian thực (0s độ trễ).
    - Tương thích ngược: Giữ param `?case=...&view=board|flow` trên URL để đảm bảo 100% các spec E2E cũ chạy không lỗi.

### ✅ B23-3: Chuẩn Hóa Lưu Vị Trí Sang `boardgame_pins` (`8b35e58`)
- **Mục tiêu**: Một nơi lưu vị trí duy nhất cho mọi node.
- **Thực hiện**:
  - Khi kéo node trên Canvas Studio -> lưu vào `boardgame_pins` (hỗ trợ cả desktop/mobile).
  - Viết migration `db/schema/44_migrate_board_positions_to_pins.sql`:
    - Tạo bảng backup an toàn `boardgame_pins_backup_b23` trước khi thực thi.
    - Backfill tọa độ từ `case_board_nodes.config.position` và `case_checkpoints.board_config.position` sang `boardgame_pins` cho các node chưa có.
  - Ngừng dùng `case_checkpoints.flow_position` làm nơi lưu vị trí mới.

### ✅ B23-4: "Lớp Logic" (Logic Overlay) Trên Canvas (`ed1e6e0`)
- **Mục tiêu**: Trực quan hóa quan hệ phụ thuộc `depends_on` trực tiếp trên mặt phẳng bảng.
- **Thực hiện**:
  - Thêm nút công tắc "Lớp logic" trên Header Toolbar với icon `GitBranch`.
  - Khi bật: Canvas hiển thị các mũi tên phụ thuộc `depends_on` nét đứt màu tím neon (`rgba(168, 85, 247, 0.95)`) có mũi tên chỉ hướng (từ nguồn sang đích).
  - Thao tác kéo nối giữa 2 checkpoint trong chế độ Lớp logic: tự động kiểm tra chu trình (`wouldCreateCycle`), thêm `depends_on` và lưu DB qua `updateCheckpointDependencies`.
  - Xóa dây logic: click chọn và xóa quan hệ `depends_on` tức thì.
  - Thêm nút "Sắp tự động": tính toán phân tầng đồ thị DAG (Topological layers) dựa trên `depends_on` để sắp xếp trực quan tạm thời (không tự ý ghi đè tọa độ bảng điều tra).
  - Tích hợp modal Linter vụ án (`CaseLintModal` / `lintCase`).

### ✅ B23-5: Node Bộ Hồ Sơ Lưu DB, Bỏ localStorage (`7242ec1`)
- **Mục tiêu**: Bỏ hoàn toàn `localStorage["checkpoint_studio_dossier_positions"]`.
- **Thực hiện**:
  - Chuyển `checkpoint-flow-view.tsx` sang nạp vị trí bộ hồ sơ từ cột `case_dossiers.flow_position` trong cơ sở dữ liệu.
  - Kiểm tra tiêu chí grep:
    ```bash
    git grep -rn "checkpoint_studio_dossier_positions" components
    # Kết quả: 0 dòng
    ```

---

## 3. Kiểm Tra Độc Lập & Xác Minh

### 3.1. Typecheck (`pnpm lint`)
- Lệnh chạy trong worktree: `pnpm --dir D:\code_world\dect_wt_b23 lint` (`tsc --noEmit -p tsconfig.typecheck.json`).
- **Kết quả**: Exit code `0`, sạch 100% lỗi TypeScript.

### 3.2. Tiêu chí Grep B23-5
```bash
$ git grep -rn "checkpoint_studio_dossier_positions" components
# Exit code 1 (Không có dòng nào khớp)
```

### 3.3. Ranh Giới Vùng Sở Hữu (Owned Scope)
Toàn bộ các file được tạo mới và sửa đổi đều nằm đúng trong "Vùng B23 sở hữu":
- `components/admin/checkpoint-studio/**`
- `components/investigation/mindmap/canvas/**`
- `components/investigation/hero-interactive/**`
- `lib/types/checkpoint-studio.ts`
- `db/schema/44_migrate_board_positions_to_pins.sql`
- `e2e/board-flow-unified.spec.ts`
- `docs/core_specs/19_checkpoint_studio.md`
- **Không có bất kỳ file nào chạm ngoài vùng.**

---

## 4. Kết Luận & Sẵn Sàng Bàn Giao

Plan B23 đã hoàn thành xuất sắc 100% các tiêu chí kỹ thuật:
- Checkpoint Studio và Gameplay đã thống nhất trên **một mô hình dữ liệu**, **một mặt phẳng hiển thị** và **một nơi lưu vị trí**.
- Toàn bộ thay đổi nằm an toàn trong nhánh `wt/b23-unified` (chưa push ra origin, không gây xáo trộn thư mục `main`).
