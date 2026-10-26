# Review: đồng bộ node giữa Flow (Checkpoint Studio) và Board — 2026-10-26

> Reviewer: Claude (đọc code, không sửa). HEAD `16d6edf`.

## 1. Ba nơi đang dựng "node" theo 3 cách khác nhau

| Nơi                                                                                            | Nguồn dữ liệu                                                                                                                                                       | Vị trí lấy từ                                                                                                           | Dây nối                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Flow** — `components/admin/checkpoint-studio/checkpoint-flow-view.tsx`                       | `case_checkpoints` (+ node bộ hồ sơ từ `case_dossiers`)                                                                                                             | `case_checkpoints.flow_position`; node bộ hồ sơ: **`localStorage["checkpoint_studio_dossier_positions"]`** (`:462-490`) | `depends_on` (logic mở khóa)                                            |
| **Board Studio** — `components/admin/checkpoint-studio/board/use-board-editor.ts`              | **chỉ** `case_board_nodes` + `boardgame_pins` (`:50-101`)                                                                                                           | `boardgame_pins` / `case_board_nodes.config.position`                                                                   | `boardgame_connections`                                                 |
| **Bảng gameplay** — `components/investigation/mindmap/canvas/pin-builder.ts` `buildCustomPins` | `case_board_nodes` **+ `case_checkpoints` (phone_lookup, suspect_interrogation, followup, indictment) + `case_characters` (nghi phạm, nạn nhân) + `case_evidence`** | ưu tiên `boardgame_pins` → `board_config.position` / `config.position` → lưới tự tính (`:94-123`)                       | `boardgame_connections` + dây tự sinh (`buildCustomConnections` `:705`) |

## 2. Hệ quả (vì sao "không đồng bộ")

1. **Board Studio không thấy node sinh từ checkpoint/nhân vật.** Ghim "Mở rộng điều tra" (phone_lookup), ảnh nghi phạm, ghim câu hỏi phụ, ghim cáo trạng có trên bảng gameplay nhưng **không có trong Board Studio** → GM không kéo/sửa được các node quan trọng nhất; chúng nằm ở vị trí lưới tự tính.
2. **`board_config` không có ai ghi.** Action `updateCheckpointBoardConfig` (`lib/actions/board-actions.ts:179`) **không có caller** trong UI → cột `case_checkpoints.board_config` (migration 39) chỉ có dữ liệu backfill.
3. **Tạo/sửa/xóa checkpoint trong Flow không phản ánh sang Board Studio** (Board Studio không đọc checkpoint). Ngược lại, node tạo trong Board Studio có `checkpoint_id` tùy chọn nhưng không hiện trong Flow.
4. **Nhãn lệch:** node gắn checkpoint trong Board Studio hiển thị `case_board_nodes.title`, gameplay hiển thị theo checkpoint → đổi tên checkpoint ở Flow, Board Studio không đổi.
5. **Vị trí node bộ hồ sơ trong Flow lưu ở `localStorage` với khóa chung cho mọi vụ** → mất khi đổi máy/trình duyệt, và lẫn giữa các vụ.
6. **Hai loại dây khác bản chất nhưng không có chỗ nào giải thích:** Flow = `depends_on` (điều kiện mở khóa), Board = dây đỏ trang trí/manh mối. Nối dây ở một bên không sinh dây ở bên kia — đúng thiết kế, nhưng GM dễ hiểu nhầm là lỗi.

## 3. Đề xuất (B23)

Nguyên tắc: **một mô hình bảng dùng chung** giữa Studio và gameplay; Flow vẫn là nơi quản lý logic.

1. **`useBoardModel(caseId)` dùng chung** (mới, `components/investigation/mindmap/canvas/use-board-model.ts`): nạp checkpoints, characters, evidence, board nodes, `boardgame_pins/connections` và gọi đúng `buildCustomPins` + `buildCustomConnections`. Board Studio và bảng gameplay **cùng dùng hook này** → Studio thấy đúng y như người chơi.
2. **Một nơi lưu vị trí:** kéo bất kỳ node nào trong Board Studio (kể cả node sinh từ checkpoint/nhân vật) → ghi `boardgame_pins` theo id node ổn định (đây đã là ưu tiên số 1 của gameplay). Ngừng ghi `case_board_nodes.config.position`; `board_config.position` chỉ còn đọc (dữ liệu cũ). Hoặc ngược lại — chọn **một**.
3. **Liên kết hai chiều Flow ↔ Board:**
   - Click node gắn checkpoint trong Board Studio → mở đúng checkpoint đó trong editor (cùng trang Checkpoint Studio).
   - Node Flow có huy hiệu "Trên bảng / Ẩn khỏi bảng"; bật/tắt ghi `board_config.hidden` (dùng `updateCheckpointBoardConfig` đang bị bỏ quên).
   - Nhãn node gắn checkpoint lấy từ `checkpoint.title` (không lưu bản sao trong `case_board_nodes.title`).
4. **Vị trí node bộ hồ sơ trong Flow lưu DB**: cột `case_dossiers.flow_position` (migration mới) thay `localStorage`.
5. **Dây:** giữ tách biệt, ghi chú rõ trên UI ("Dây mở khóa" ở Flow / "Dây manh mối" ở Board); thêm nút tùy chọn "Vẽ dây theo phụ thuộc" trong Board Studio để sinh dây đỏ từ `depends_on` nếu GM muốn.

E2E: tạo checkpoint `phone_lookup` ở Flow → mở Board Studio thấy ghim tương ứng → kéo → mở gameplay thấy đúng vị trí; đổi tên checkpoint → nhãn ghim đổi ở cả Studio và gameplay; ẩn khỏi bảng → gameplay không còn ghim.
