# Kiến trúc codebase

> Trạng thái code trên `main` sau đợt refactor SPEC-22 (2026-10-29). Kế hoạch và nhật ký đợt đó: [`history/2026-10-28_spec22_refactor_plan.md`](../history/2026-10-28_spec22_refactor_plan.md).
> Setup, lệnh, quy ước: [`technical_guide.md`](technical_guide.md), [`../process/workflow.md`](../process/workflow.md). Bảng DB: [`database_schema.md`](database_schema.md).

---

## 1. Cây thư mục

```
app/
  (admin)/studio/        Studio: cases, checkpoints, dossier, phone, map, feedbacks, players, settings
  (investigation)/       Gameplay: evidence/web (chính), evidence/boardgame, evidence/[id] (điện thoại), cabinet-demo (đóng băng)
  api/                   Route Handler (bảng mục 2)
  activate/ brand/ how-to-play/ login/ auth/   Trang công khai
components/
  admin/                 UI Studio: checkpoint-studio/, dossier-studio/ (+ evidence/), phone-studio/, map-studio/
  investigation/
    board/               Bảng điều tra: main-investigation-canvas, canvas/ (state, model, pin-builder), modal giải đố
    evidence/            Khay hồ sơ, workspace single / canvas / mobile, trình đọc tài liệu, khám xét 360
    hero-interactive/    Renderer Canvas 2D của bảng điều tra
    archive_3d_vault/    [ĐÓNG BĂNG] 3D cũ, AGENTS.md §8
  phone-engine/          Hệ điều hành điện thoại giả lập: apps/, chassis/, core/, system/
  public/                Landing page (cách ly gameplay, AGENTS.md §9)
  ui/                    Primitive dùng chung
lib/
  actions/               Server Action (ghi Supabase, yêu cầu admin)
  checkpoints/           Mô hình checkpoint, chấm điểm, runtime, đồ thị, linter, chơi thử
  progress/              Tiến độ mở bộ hồ sơ
  cases/                 Mã vụ án, nhân vật, mã chứng cứ, mã bypass
  hooks/                 Hook nạp dữ liệu (checkpoint, hồ sơ, vật chứng, điện thoại)
  maps/                  Engine bản đồ vector
  ai/                    Tiêu chí chấm lập luận AI (chỉ server)
  security/ supabase/ auth/   Rate limit, client Supabase, kiểm quyền admin
  types/                 Nguồn type duy nhất
db/schema/               Migration SQL đánh số
e2e/                     Playwright
```

---

## 2. Route API

| Route                                                                                                   | Quyền                     | Vai trò                                             |
| :------------------------------------------------------------------------------------------------------ | :------------------------ | :-------------------------------------------------- |
| `GET /api/checkpoints?caseId=`                                                                          | Công khai                 | Checkpoint đã lọc đáp án (service role + allowlist) |
| `POST /api/checkpoints/verify`                                                                          | Công khai, 30 lần/phút/IP | Chấm một bài giải                                   |
| `POST /api/scan-answer`                                                                                 | Công khai, 10 lần/phút/IP | Chấm lập luận bằng Gemini; tiêu chí đọc ở server    |
| `GET /api/characters`, `/api/case-dossiers`, `/api/board-nodes`, `/api/phone-data/*`, `/api/map-vector` | Công khai                 | Dữ liệu vụ án đọc từ Supabase                       |
| `POST /api/admin/map-vector`                                                                            | Admin                     | Lưu bản đồ                                          |
| `/api/reinvestigation`, `/api/waitlist`, `/api/image-proxy`, `/api/audio-proxy`, `/api/health`          | Công khai                 | Khám xét 360, waitlist, proxy media, healthcheck    |

---

## 3. Luồng dữ liệu vụ án

```
Studio (/studio/*) ──Server Action (admin)──► Supabase (cases, case_checkpoints, case_dossiers, case_evidence, case_characters, phone tables, boardgame_pins)
                                                   │
Gameplay ◄── /api/* (Route Handler) ◄──────────────┘
   hooks: useCaseCheckpoints, useCaseDossiers, useCaseEvidence, usePhoneData, CaseCharactersProvider
```

- Mã vụ án luôn qua `normalizeCaseId()` (`lib/cases/case-id.ts`), dạng `case_000`.
- Component và hook nhận `caseId` bắt buộc. Chỉ route entry được fallback `case_000` khi URL thiếu tham số.
- Không có dữ liệu kịch bản tĩnh trong code (AGENTS.md §6).

---

## 4. Checkpoint

### 4.1. Mô hình

- Bảng `case_checkpoints`; `kind` quyết định shape của `answer_config` (JSONB).
- Parser duy nhất: `parseCheckpointConfig()` trong [`lib/checkpoints/kinds.ts`](../../lib/checkpoints/kinds.ts). Studio validate, server chấm đều dùng parser này.
- Kind: `phone_lookup`, `suspect_interrogation` (2 lớp: động cơ, mâu thuẫn), `indictment`, `epilogue`, và nhóm câu hỏi một đáp án `followup | choice | code | time | text` (`isAnswerKind()`).
- Model runtime phía client: `Checkpoint` (`lib/types/case.ts`), tạo bởi `toRuntimeCheckpoint()` (`lib/checkpoints/runtime.ts`). Model này **không có đáp án**.

### 4.2. Chấm điểm (chỉ server)

```
Modal ──verifyCheckpointOnServer()──► POST /api/checkpoints/verify ──► gradeCheckpoint() (server-grader.ts)
  │                                                                       đọc case_checkpoints bằng service role
  └── lỗi mạng: báo "thử lại", không tự chấm
```

- `/api/checkpoints` lọc `answer_config` theo allowlist (`lib/checkpoints/public-checkpoint.ts`): giữ `options`, nhãn ô nhập, `availableEvidences`, `epilogueStories`, `unlocksDossier`, `photoCodes`, cờ `hasMotive` / `hasContradiction`. Bỏ mọi đáp án và cột `ai_*`.
- Thẩm tra nghi phạm gửi từng lớp (`motiveCodes` hoặc `contradictionCodes`); server chỉ chấm lớp được gửi.
- Mã chứng cứ: phải đủ mã bắt buộc và không có mã ngoài tập `bắt buộc + bổ trợ` (AGENTS.md §13).
- So khớp tên tiếng Việt: một hàm `isVietnameseTextMatch()` (`lib/checkpoints/name-match.ts`).
- Lập luận AI: client gửi `{ caseId, checkpointId, category, suspect, answer }`; server dựng tiêu chí ở `lib/ai/suspect-interrogation-context.ts`:
  - Bối cảnh: `motiveContext` / `contradictionContext` theo hạng mục, nếu trống thì `ai_context`.
  - Ví dụ đạt/trượt: `answer_config.motiveValidCases` / `motiveInvalidCases` / `contradictionValidCases` / `contradictionInvalidCases`. Hạng mục chưa có ví dụ riêng thì dùng `ai_valid_cases` / `ai_invalid_cases` cũ dùng chung.
  - Bỏ trống lập luận: trượt nếu checkpoint có bối cảnh do GM biên soạn, đạt nếu không có.
  - Chỉ dẫn chấm gửi qua `systemInstruction`; câu trả lời đi riêng trong `contents`, bọc trong `<cau_tra_loi>`, prompt coi đó là dữ liệu, không phải lệnh.
  - Client chỉ cho qua khi server lỗi 5xx (Gemini hết quota, mạng). Lỗi 429 hoặc 4xx đều tính là trượt.
- Mã bypass (`0`, `000`, `admin`, `doc_000`...): chỉ có hiệu lực khi `NODE_ENV !== "production"` hoặc người gửi có session admin.
- Migration 48 bỏ quyền `anon` đọc bảng gốc `case_checkpoints`. Chạy sau khi deploy code này.

---

## 5. Tiến độ ván chơi

- Lưu ở `localStorage` qua `caseStorageKey(caseId, key)`. `case_000` giữ key không tiền tố; vụ khác `<slug>::<key>`. Reset: `clearCaseProgress()`.
- Key chính: `canvas_suspects`, `investigated_suspects`, `solved_followups`, `followup_<nghi phạm>`, `phone_solved`, `indictment_solved`, `indictment_culprit`, `unlocked_dossiers`.
- Chơi nhóm (hiện trạng): `RoomSyncProvider` (`components/investigation/room/room-sync-context.tsx`) đồng bộ `RoomInvestigationState`. Kênh `room:<mã>`: presence (key = `deviceId`), broadcast `STATE_PATCH` và `DETECTIVE_PING`, cộng `postgres_changes` trên `game_rooms`. Mã phòng sinh ở client (`room-modal.tsx`). Client tự đọc, tạo và ghi `game_rooms`; chưa có Route Handler, phase, Host hay phòng chờ.
- Chơi nhóm (kế hoạch đã chốt 2026-11-05): QR chung → Tạo/Vào phòng → phòng chờ → intro đồng bộ → điều tra → kết luận. Spec và danh sách chỗ code lệch spec: [`group_play_realtime.md`](group_play_realtime.md) Phần 8.2.

### 5.1. Mở bộ hồ sơ

Nguồn: [`lib/progress/case-progress.ts`](../../lib/progress/case-progress.ts).

1. Bộ ở slot 0–1 mở từ đầu.
2. Server chấm đúng một checkpoint có `unlocksDossier` → `client-verify.ts` gọi `unlockDossiers()`. Giá trị khớp `dossier_key` hoặc `title` (không dấu, không phân biệt hoa thường).
3. Cáo trạng đúng → mở mọi bộ còn lại.
4. Phase = slot lớn nhất đang mở (`getUnlockedPhase()`). Khay hồ sơ web và app Ảnh dùng chung.
5. Phòng chơi nhóm đồng bộ `unlockedDossiers`. Tiến độ cũ dựng lại từ câu hỏi phụ / tra SĐT đã giải (`use-investigation-state.ts`).

---

## 6. Bảng điều tra

- `useBoardModel` (`components/investigation/board/canvas/use-board-model.ts`) dùng chung cho Studio và gameplay; `pin-builder.ts` dựng ghim từ `case_board_nodes`, nhân vật và checkpoint.
- Renderer: `HeroInteractive` (`components/investigation/board/renderer/`), Canvas 2D.
- Vị trí ghim: `boardgame_pins` (desktop + `mobile_x/mobile_y`).
- Danh sách nút ẩn `[data-pin-id]` phục vụ bàn phím, trình đọc màn hình và E2E. Không xóa.
- Modal giải đố: `board/canvas/canvas-modals.tsx`. Chế độ `/evidence/web`: `single` (mặc định) hoặc `canvas` (bàn hồ sơ tự do, `dossier-canvas-board.tsx`).

---

## 7. Còn tồn

Xem [`../TECHDEBT.md`](../TECHDEBT.md) và [`../ROADMAP.md`](../ROADMAP.md). Điểm kiến trúc đáng chú ý:

- File > 1.000 dòng: `dossier-canvas-board.tsx`, `checkpoint-studio-client.tsx`, `map-studio-client.tsx`, `dossier-studio-client.tsx`, `canvas-investigation-workspace.tsx`, `add-suspect-modal.tsx`.
- `pin-builder.ts` còn so khớp key bố cục cũ `c0-pin-*`.
- ~25 key tiến độ rời trong `localStorage`; chưa gom về một object.
