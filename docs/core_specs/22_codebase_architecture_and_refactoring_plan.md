# Đặc Tả Kiến Trúc Codebase & Kế Hoạch Tái Cấu Trúc (Bản Final)

> **Mã tài liệu**: `SPEC-22`
> **Trạng thái**: Bản final — chờ chủ dự án duyệt từng giai đoạn trước khi thực thi
> **Ngày rà soát**: 2026-10-28
> **Thay thế**: bản SPEC-22 trước (audit do AI khác viết). Bản trước có lỗi nghiêm trọng ở mục "dead code", xem §2.

---

## 1. Kết Luận Ngắn

- Codebase ~80.000 dòng TS/TSX (`components/` 59,5k, `lib/` 12,8k, `app/` 6,9k).
- **Dead code thật rất ít**: quét đồ thị import từ mọi `page/layout/route` chỉ ra ~1.800 dòng không ai chạm tới, gần hết là `archive_3d_vault/` (đóng băng theo AGENTS.md §8) và `followup-config-form.tsx`.
- **Độ phức tạp thừa nằm bên trong file đang chạy**, không nằm ở file mồ côi. Bốn nguồn chính:
  1. Mô hình checkpoint bị biểu diễn 3 lần, với alias legacy chồng chéo.
  2. Chấm điểm "server-side" chỉ là hình thức: đáp án vẫn gửi xuống client, client tự chấm đè kết quả server.
  3. Logic riêng Case #000 (tên nhân vật, key storage, pin `c0-*`) vẫn nằm trong engine chung.
  4. Hai chế độ workspace song song (`single` / `canvas`) và ba route gameplay, mỗi chế độ có bộ state riêng.
- Đổi tên thư mục / gộp `types/` (trọng tâm bản audit cũ) là việc mỹ quan, rủi ro thấp, giá trị thấp. Đặt cuối lộ trình.

---

## 2. Đối Chiếu Bản Audit Cũ

| Khẳng định của bản cũ                                                                                                                                  | Kiểm chứng thực tế                                                                                                                                                                               | Kết luận                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| `hero-interactive/` + `hero-interactive.tsx` là dead code, không ai render                                                                             | `main-investigation-canvas.tsx:865` render `<HeroInteractive>`. Đây là renderer Canvas 2D của bảng điều tra đang chạy. Admin board editor cũng import type từ đây.                               | **SAI. Xóa sẽ làm sập bảng điều tra.**                                 |
| 7 modal trong `mindmap/` mồ côi (`culprit-epilogue`, `dossier-e`, `dossier-result`, `phone-lookup`, `phone-narrative`, `gameplay-guide`, `custom-pin`) | Cả 7 được `canvas/canvas-modals.tsx` render, có setter mở thật (`use-investigation-state.ts`, `main-investigation-canvas.tsx`). `phone-lookup-modal` và `custom-pin-modal` còn được Studio dùng. | **SAI.** Vấn đề thật là trùng chức năng (xem §3.5), không phải mồ côi. |
| `google-sheets-presence-bar.tsx` không dùng                                                                                                            | Render tại `game-desktop-header.tsx:174`. Đây là thanh presence của phòng chơi nhóm, chỉ đặt tên sai.                                                                                            | **SAI.** Chỉ cần đổi tên.                                              |
| `lib/google/auth.ts` không dùng                                                                                                                        | `app/api/waitlist/route.ts` import nó.                                                                                                                                                           | **SAI.**                                                               |
| `viewers/` chỉ phục vụ `/evidence/[id]`                                                                                                                | Đúng, nhưng route này được link từ `phone-modal` và 2 workspace (`/evidence/victim-phone`).                                                                                                      | Đúng mô tả, nhưng không phải dead code.                                |
| Gộp `types/` vào `lib/types/`                                                                                                                          | Đúng. 3 file.                                                                                                                                                                                    | Giữ, ưu tiên thấp.                                                     |
| Gộp `evidence-studio` vào `dossier-studio`, xóa 2 route redirect Studio                                                                                | Hợp lý.                                                                                                                                                                                          | Giữ, ưu tiên thấp.                                                     |
| Gom `lib/map-*` vào `lib/maps/`                                                                                                                        | Hợp lý.                                                                                                                                                                                          | Giữ, ưu tiên thấp.                                                     |
| Đổi `mindmap/` → `board/`                                                                                                                              | Hợp lý về ngữ nghĩa, nhưng đụng nhiều import và E2E selector.                                                                                                                                    | Giữ, làm sau khi logic đã gọn.                                         |
| Không nhắc tới                                                                                                                                         | `followup-config-form.tsx` thật sự không ai import.                                                                                                                                              | Thêm vào danh sách xóa.                                                |

**Bài học**: không xóa file dựa trên grep tên component. Phải quét đồ thị import từ entry route. Script quét đã dùng: xem Phụ lục A.

---

## 3. Phát Hiện Chính (Độ Phức Tạp Thừa Thật)

### 3.1. Mô hình checkpoint bị biểu diễn 3 lần

Cùng một row `case_checkpoints.answer_config` được parse ở 3 nơi, mỗi nơi một shape:

| File                                                                         | Vai trò                                                        | Shape                                                                                                                                                          |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`lib/checkpoints/kinds.ts`](../../lib/checkpoints/kinds.ts)                 | Discriminated union theo `kind`, parser + validator cho Studio | Typed, sạch                                                                                                                                                    |
| [`lib/cms/checkpoint-runtime.ts`](../../lib/cms/checkpoint-runtime.ts)       | Chuyển row sang `Checkpoint` cho gameplay                      | Phẳng, legacy: `type` + `questionType` + `inputType`, `pickerConfig` gom mọi field, suy luận `questionType` qua 6 nhánh (`text_match_3`, `evidence_picker`...) |
| [`lib/checkpoints/server-grader.ts`](../../lib/checkpoints/server-grader.ts) | Chấm điểm                                                      | Không dùng parser của `kinds.ts`. Đọc thẳng `cfg as Record<string, any>`                                                                                       |

Hệ quả:

- Alias trùng nghĩa trong model runtime: `inputType = questionType`, `suspectId = followupOf`, `rawAnswersId = rawAnswers`, `hint = hintsList[0]`.
- Fallback snake_case (`correct_answer`, `valid_suspects`, `motive_evidence_ids`...) ở cả 3 file, dù migration 28 (`checkpoint_config_normalize`) đã chuẩn hóa dữ liệu.
- `kind` có 9 giá trị, nhưng `followup` lại có `inputType` con là `choice | code | time | text`, trùng với 4 kind riêng `choice`, `code`, `time`, `text`. Grader chấm `choice`/`time`/`code` hai lần bằng hai đoạn code gần giống nhau (nhánh `followup` và nhánh chung).
- Tầng **Alibi** đã bỏ theo AGENTS.md §13, nhưng còn trong 15 file: `kinds.ts`, `server-grader.ts`, `client-verify.ts`, `checkpoint-runtime.ts`, `verify/route.ts`, `types/*`, `hint-modal.tsx`, `checkpoint-hint-section.tsx`, `use-investigation-state.ts`...
- `app/api/checkpoints/route.ts` còn nhánh fallback "DB chưa chạy migration 26" (lỗi `42703`). Migration 26 đã chạy production.

### 3.2. Chấm điểm server-side chỉ là hình thức

- Gameplay gọi `/api/checkpoints?caseId=...` **không có** `mode=public` ([`use-studio-checkpoints.ts:30`](../../lib/hooks/use-studio-checkpoints.ts)). Route trả nguyên `answer_config` (đáp án, `validAnswers`, `correctAnswer`) xuống trình duyệt.
- Policy `18_case_checkpoints_public_read.sql` cho `anon` đọc thẳng bảng `case_checkpoints`. View `case_checkpoints_public` tồn tại nhưng không ai dùng.
- Client tự chấm lại sau server:
  - [`followup-question-modal.tsx`](../../components/investigation/mindmap/followup-question-modal.tsx) (~dòng 321–352): khi server trả `correct: false`, client **vẫn thử so khớp `activeCheckpoint.correctAnswer`** và có thể chấp nhận. Client ghi đè quyết định của server.
  - [`phone-lookup-modal.tsx`](../../components/investigation/mindmap/phone-lookup-modal.tsx) (~dòng 152–185): server sai thì client chấm lại bằng `isPhoneMatch`.
  - [`custom-pin-modal.tsx`](../../components/investigation/mindmap/custom-pin-modal.tsx) (~dòng 223): chấm hoàn toàn client bằng `isVietnameseTextMatch`.
- Hai hàm so khớp tên có ngữ nghĩa khác nhau: server dùng `toWords` (mọi từ của đáp án phải có trong input), client dùng `isVietnameseTextMatch` (input là tập con của đáp án). Cùng một câu trả lời có thể đúng ở client và sai ở server.

Đây là chỗ **phức tạp thừa lớn nhất**: duy trì hai đường chấm, hai thuật toán so khớp, một view và một endpoint verify, nhưng không đạt mục tiêu giấu đáp án.

**Quyết định (2026-10-28): Phương án A — Server-only.** Hai phương án đã cân nhắc:

- **Phương án A — Server-only (khuyến nghị nếu có leaderboard/rating theo SPEC-16 hoặc bán license)**: client đọc `case_checkpoints_public`, bỏ toàn bộ fallback chấm client, bỏ policy anon đọc bảng gốc. Lỗi mạng hiển thị "đang đồng bộ / thử lại" theo AGENTS.md §6.
- **Phương án B — Client-only (nếu game chỉ là companion offline, gian lận không quan trọng)**: bỏ `/api/checkpoints/verify`, `server-grader.ts`, `client-verify.ts`, view public. Một hàm chấm thuần dùng chung.

### 3.3. Logic riêng Case #000 trong engine chung

- Key storage cứng: `followup_vu`, `followup_tung`, `followup_ha*`, `khang_phone_pinned_clues`, `boardgame_pins_case-000` trong [`lib/storage.ts`](../../lib/storage.ts) (`INVESTIGATION_STORAGE_KEYS`).
- Nhánh theo tên nhân vật: `targetKey === "vu"` / `"tung"` trong `followup-question-modal.tsx:274-281`.
- Fallback nạn nhân `"khang"`, `avatar_khang`, `victim_khang.png` trong `pin-builder.ts`, `use-board-model.ts`, `main-investigation-canvas.tsx`, `card-composite.ts`, `checkpoint-studio-client.tsx`.
- `pin-builder.ts:848–909` so khớp kép key legacy `c0-pin-*` và key mới `:victim_phone:`, `:suspects_hub:`...
- 67 chỗ mặc định `"case_000"` (props mặc định, `searchParams || "case_000"`, API body). Case mới quên truyền `caseId` sẽ âm thầm đọc/ghi dữ liệu Case #000.
- `lib/storage.ts` còn đọc fallback prefix legacy `xplore_`, `veritas_`, `nocturne_`.

TECHDEBT #17 ghi "đã dọn sạch hardcode `c0-pin-*` và tên nhân vật". Thực tế chưa sạch.

### 3.4. Tiến độ ván chơi lưu ở nhiều nơi

- `localStorage` qua ~30 key rời (`caseStorageKey(caseId, ...)`) ghi trực tiếp trong modal.
- `RoomSyncContext` (`room-sync-context.tsx`, 884 dòng): `roomState` đồng bộ qua Supabase Realtime + bảng `game_rooms`.
- Event bus `lib/investigation-events.ts`.
- `use-investigation-state.ts` gom lại, nhưng các modal (`followup-question-modal`, `phone-lookup-modal`...) vẫn tự `setStorageItem` riêng.

Không có một reducer / store duy nhất cho tiến độ. Mỗi checkpoint mới cần sửa nhiều chỗ.

### 3.5. Bề mặt gameplay song song

- 3 route gameplay: `/evidence/web` (chính), `/board-stage`, `/evidence/boardgame` (+ `/evidence/[id]` cho điện thoại).
- Trong `/evidence/web`: 3 workspace — `single`, `canvas`, `mobile`. Chế độ `canvas` kéo theo `canvas-investigation-workspace.tsx` (1.326 dòng) + `dossier-canvas-board.tsx` (3.183 dòng, file lớn nhất repo). Người chơi chuyển được qua toggle ở `game-desktop-header.tsx`.
- Modal trùng vai: `CulpritEpilogueModal` và `EpilogueModal` (hậu án); `DossierEModal`, `DossierResultModal` và `PhaseUnlockedModal` (mở hồ sơ / mở phase); `GameplayGuideModal`, `InteractiveWalkthrough`, `CanvasGuideModal`, `CanvasWalkthroughTour` (4 hệ hướng dẫn).
- Cờ chết: `REQUIRE_REINVESTIGATION_APPROVAL = false` giữ nguyên nhánh logic không bao giờ chạy.

### 3.6. File monolith

| File                                                                              |  Dòng | Ghi chú                      |
| :-------------------------------------------------------------------------------- | ----: | :--------------------------- |
| `components/investigation/evidence/dossier-canvas-board.tsx`                      | 3.183 | Chỉ dùng cho chế độ `canvas` |
| `components/admin/checkpoint-studio/checkpoint-studio-client.tsx`                 | 1.994 | Studio checkpoint            |
| `components/admin/map-studio/map-studio-client.tsx`                               | 1.700 |                              |
| `components/admin/dossier-studio/dossier-studio-client.tsx`                       | 1.374 |                              |
| `components/investigation/evidence/workspaces/canvas-investigation-workspace.tsx` | 1.326 | Chế độ `canvas`              |
| `components/investigation/mindmap/add-suspect-modal.tsx`                          | 1.063 |                              |
| `lib/actions/phone-actions.ts`                                                    |   975 |                              |

Chia nhỏ file chỉ có giá trị **sau** khi xóa nhánh thừa. Chia trước sẽ nhân bản độ phức tạp ra nhiều file.

### 3.7. Phần đã ổn, không động vào

- `components/phone-engine/` — module rõ ràng.
- `components/public/` — tách biệt landing đúng §9.
- `lib/security/`, `lib/supabase/` — nhỏ, đúng vai.
- Studio routes — đúng thứ tự dựng vụ của AGENTS.md §2.

---

## 4. Kiến Trúc Mục Tiêu (Logic, Không Phải Thư Mục)

```
case_checkpoints.answer_config (JSONB, camelCase duy nhất)
        │
        ▼
lib/checkpoints/kinds.ts  ── parseCheckpointConfig(kind, raw) ── NGUỒN DUY NHẤT
        │                         │
        │                         ├─► Studio: validateCheckpointConfig
        │                         ├─► Grader: gradeCheckpoint(config: CheckpointConfig, sub)
        │                         └─► Runtime: toRuntimeCheckpoint (chỉ field hiển thị, không đáp án)
        ▼
kind ∈ { phone_lookup, suspect_interrogation, question, indictment, epilogue }
        question.inputType ∈ { choice, code, time, text }   (gộp followup + 4 kind lẻ)
        suspect_interrogation: motive + contradiction       (bỏ alibi)

Tiến độ ván chơi:
  useCaseProgress(caseId)  ── 1 object JSON / case trong localStorage
        │                     key: progress:<caseId>, đánh version
        └─► RoomSync chỉ broadcast patch của object này
  Modal chỉ gọi progress.markSolved(checkpointId, answer), không tự ghi storage.

Dữ liệu riêng vụ án (tên nhân vật, nạn nhân, pin đặc biệt) chỉ đến từ Supabase
(case_characters, board_nodes.node_kind / subject_key). Không có chuỗi "khang"/"vu" trong code.
caseId là tham số bắt buộc, không có default "case_000" ngoài trang landing/redirect.
```

---

## 5. Lộ Trình Thực Thi

### Tiến độ (2026-10-28)

| Giai đoạn | Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| 0 | Phần lớn đã chốt | Còn câu 4 (gộp modal). |
| 1 | Xong | Xóa `/board-stage`, `followup-config-form`, cờ `REQUIRE_REINVESTIGATION_APPROVAL`, prefix storage cũ; đổi tên `RoomPresenceBar`. |
| 2 | Xong phần code | Grader dùng parser duy nhất `kinds.ts`, một hàm `matchAnswer`, một hàm so khớp tên (`isVietnameseTextMatch`). Bỏ alibi toàn bộ. Model runtime bỏ alias (`inputType`, `suspectId`, `rawAnswers`, `correctAnswer`...). **Chưa gộp kind trong DB** (`followup/choice/code/time/text` → `question`): cần truy vấn production trước, grader đã xử lý chung các kind này. |
| 3A | Xong phần code | `/api/checkpoints` dùng service role và lọc allowlist; mọi modal chấm qua `/api/checkpoints/verify`; `/api/scan-answer` tự đọc tiêu chí AI ở server (trước đây client gửi cả tiêu chí, route là proxy LLM mở). Migration `48_checkpoint_answers_server_only.sql` đã viết, **chưa chạy**: chạy sau khi deploy code. |
| 4–6 | Chưa làm | |

Phát hiện thêm khi làm GĐ3A:
- `indictment-modal.tsx` có danh sách mã chứng cứ đáp án Case #000 hardcode trong client (`"53"`, `"c-02"`, `"d-06"`...). Đã xóa.
- Mã bypass admin (`0`, `000`, `admin`...) qua được checkpoint ở production cho mọi người chơi. Ghi nhận `TECHDEBT #19`.
- Mất kết nối server chấm điểm: modal báo "thử lại" thay vì tự chấm. Không còn fallback offline.


Mỗi giai đoạn là một commit/PR riêng. Mỗi giai đoạn chạy `pnpm lint` một lần ở cuối, và E2E đầy đủ một lần trước khi push.

### Giai đoạn 0 — Quyết định sản phẩm (chặn các giai đoạn sau)

Chủ dự án trả lời:

1. ~~Chấm điểm: Phương án A (server-only) hay B (client-only)? §3.2.~~ **Đã chốt: A (server-only), 2026-10-28.**
2. ~~Chế độ `canvas` còn giữ không?~~ **Đã chốt: giữ canvas.** Chỉ dọn logic bên trong.
3. ~~`/board-stage` và `/evidence/boardgame`?~~ **Đã chốt: bỏ `/board-stage`, giữ `/evidence/boardgame`.**
4. Giữ hệ hướng dẫn nào trong 4 hệ? Giữ modal hậu án nào trong 2? **Chờ đề xuất** (đọc luồng kích hoạt từng modal trước khi gộp).

### Giai đoạn 1 — Xóa an toàn (rủi ro thấp)

- Xóa `components/admin/checkpoint-studio/sections/followup-config-form.tsx` (0 importer).
- Xóa cờ `REQUIRE_REINVESTIGATION_APPROVAL` và nhánh `true` của nó.
- Xóa nhánh fallback migration 26 trong `app/api/checkpoints/route.ts`.
- Xóa fallback prefix legacy trong `lib/storage.ts`.
- Đổi tên `google-sheets-presence-bar.tsx` → `room-presence-bar.tsx`.
- Kết quả từ Giai đoạn 0 câu 2–4: xóa workspace / route / modal bị loại.

### Giai đoạn 2 — Hợp nhất mô hình checkpoint (giá trị cao nhất)

1. Kiểm tra DB: không còn key snake_case trong `answer_config` (SQL đếm). Nếu còn: migration chuẩn hóa có backup.
2. Gộp `followup`, `choice`, `code`, `time`, `text` thành `kind = 'question'` + `inputType`. Migration dữ liệu có backup, Studio form cập nhật theo.
3. Xóa toàn bộ alibi (type, grader, hint group, Studio, AI context).
4. `server-grader.ts` nhận `CheckpointConfig` đã parse từ `kinds.ts`. Một hàm `matchAnswer(inputType, user, expected)` dùng chung. Một hàm so khớp tên tiếng Việt duy nhất (giữ `isVietnameseTextMatch`, bỏ `matchPhoneInput`).
5. `checkpoint-runtime.ts` chỉ còn field hiển thị. Xóa alias `inputType`, `suspectId`, `rawAnswersId`, `hint`, logic `resolveQuestionType`.
6. Thêm unit test cho grader (bảng input → kết quả) trước khi sửa, theo TDD.

### Giai đoạn 3 — Thực thi quyết định chấm điểm

- **A**: `use-studio-checkpoints` đọc `case_checkpoints_public`. Thu hồi policy anon trên bảng gốc (migration). Xóa mọi nhánh chấm client trong `followup-question-modal`, `phone-lookup-modal`, `custom-pin-modal`, `add-suspect-modal`, `indictment-modal`. Studio vẫn đọc bảng gốc qua server action admin.
- **B**: xóa `verify/route.ts`, `server-grader.ts`, `client-verify.ts`, view public. Grader thuần chuyển sang `lib/checkpoints/grade.ts` dùng ở client.

### Giai đoạn 4 — Gỡ logic Case #000 khỏi engine

- Thay key `followup_vu/tung/ha` bằng key theo `checkpointId`. Viết migration đọc key cũ một lần rồi xóa (không giữ fallback vĩnh viễn).
- Xóa fallback `"khang"`, `avatar_khang`, `victim_khang.png`; nạn nhân lấy từ `case_characters` (`getActiveVictim`).
- Xóa so khớp key `c0-pin-*` trong `pin-builder.ts` sau khi xác nhận `board_nodes` đã dùng key mới (SQL kiểm tra).
- Bỏ default `"case_000"` ở props component và hook. Chỉ route entry được fallback/redirect.
- Cập nhật TECHDEBT #17 đúng hiện trạng.

### Giai đoạn 5 — Một store tiến độ

- `useCaseProgress(caseId)`: một object JSON có version, thay ~30 key rời.
- Modal chỉ gọi API của store. RoomSync broadcast patch của store.
- Xóa `INVESTIGATION_STORAGE_KEYS` thủ công; `clearCaseProgress` chỉ xóa một key.

### Giai đoạn 6 — Mỹ quan cấu trúc (từ bản audit cũ, giữ nguyên)

- `types/` → `lib/types/`.
- `components/admin/evidence-studio/` → `components/admin/dossier-studio/evidence/`; xóa route redirect `studio/characters`, `studio/evidence` (thêm `redirects` trong `next.config.mjs` nếu cần bookmark).
- `lib/map-*`, `lib/geometry/` → `lib/maps/`.
- `mindmap/` → `board/`, cập nhật E2E.
- Chia nhỏ các file monolith còn lại (§3.6) — chỉ sau Giai đoạn 1–5.

---

## 6. Rủi Ro & Điểm Gãy

- **Migration dữ liệu checkpoint (GĐ 2)**: sửa `answer_config` production. Bắt buộc backup bảng + chạy Linter/Chơi thử Checkpoint Studio trước khi publish (AGENTS.md §2.3).
- **Tiến độ người chơi đang chơi dở (GĐ 4, 5)**: đổi key storage làm mất tiến độ nếu không có bước chuyển đổi một lần.
- **Thu hồi quyền anon (GĐ 3A)**: Studio hoặc trang nào đó đọc bảng gốc bằng client anon sẽ hỏng. Grep `from("case_checkpoints")` trong code client trước khi chạy migration.
- **E2E selector**: đổi tên thư mục/route (GĐ 6) và xóa workspace (GĐ 1) làm vỡ spec Playwright; cập nhật cùng commit.
- Rà soát này chưa truy vấn được Supabase production (MCP thiếu access token). Các điều kiện "dữ liệu đã chuẩn hóa" ở GĐ 2 và GĐ 4 phải kiểm chứng bằng SQL trước khi xóa fallback.

---

## Phụ lục A — Quét file không tới được từ route

Script Node: lấy `git ls-files app lib components types proxy.ts`, phân giải import `@/` và đường dẫn tương đối (kể cả `import()` động), duyệt BFS từ mọi `app/**/(page|layout|route|actions|loading|error|not-found).tsx?` và `proxy.ts`. Kết quả 2026-10-28:

```
archive_3d_vault/**                 ~1.690 dòng  (đóng băng, AGENTS.md §8)
checkpoint-studio/sections/followup-config-form.tsx   91 dòng
```

Lưu ý: "tới được qua import" chưa chắc "hiển thị được với người chơi". Modal có thể được import nhưng state mở không bao giờ bật. Các modal ở §3.5 đã kiểm tra setter mở và đều có đường kích hoạt.
