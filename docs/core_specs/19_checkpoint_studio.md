# 19. Checkpoint Studio & Structured Checkpoint Authoring

> **Phạm vi:** Module quản trị `/studio/checkpoints` cho phép biên tập checkpoint, đáp án, gợi ý đa cấp, narrative và cấu hình AI check bằng form có cấu trúc, lưu vào Supabase.
>
> **Trạng thái:** Runtime đọc checkpoint trực tiếp từ Supabase (`case_checkpoints`) qua `/api/checkpoints`. Google Sheets chỉ còn quản lý `evidences`.

---

## 1. Bối cảnh

Trước đây, toàn bộ đáp án checkpoint được mã hóa trong cột `answers` / `answers_id` của Google Sheets bằng DSL nhiều dòng:

```text
[ĐỘNG CƠ]
13
0988.200.991
Optional
42
```

Cách nhập này dễ sai cú pháp, khó rà soát chéo và phụ thuộc vào thứ tự dòng. Parser [`lib/cms/checkpoint-cms.ts`](../lib/cms/checkpoint-cms.ts) phải duy trì nhiều alias key để tương thích ngược.

Checkpoint Studio thay thế thao tác biên tập bằng form:

- Mỗi mã chứng cứ là một chip riêng, có nhóm bắt buộc / tùy chọn.
- Gợi ý được quản lý theo cấp và theo nhóm.
- Narrative và cấu hình AI check nằm cùng một nơi.

---

## 2. Nguồn dữ liệu Runtime (Quan trọng)

| Thành phần        | Nguồn dữ liệu                                                                                             |
| :---------------- | :-------------------------------------------------------------------------------------------------------- |
| Gameplay          | Supabase `public.case_checkpoints` → `/api/checkpoints` → `useStudioCheckpoints` → `toRuntimeCheckpoints` |
| Checkpoint Studio | Supabase — cùng bảng, đọc/ghi qua server actions admin                                                    |
| Vật chứng         | Google Sheets tab `evidences`                                                                             |

Luồng runtime:

```
app/api/checkpoints/route.ts
  → lib/hooks/use-studio-checkpoints.ts   (memory cache 30s + dedupe request)
  → lib/cms/checkpoint-runtime.ts         (map row DB → Checkpoint runtime)
  → lib/hooks/use-case-checkpoints.ts     (ghép checkpoint với evidences)
  → components/investigation/*
```

- API route dùng `force-dynamic`, `cache: no-store`, trả `{ success, caseId, totalCount, data }`.
- `caseId` chuẩn hóa `case-000` → `case_000`.
- Không còn đọc tab `checkpoints` từ Google Sheets ở runtime.
- RLS cho phép `anon` đọc `case_checkpoints`; ghi vẫn chỉ admin.

---

## 3. Database

Schema: [`db/schema/16_case_checkpoints.sql`](../db/schema/16_case_checkpoints.sql) và [`db/schema/20_case_dossiers.sql`](../db/schema/20_case_dossiers.sql)

| Cột                                                | Kiểu       | Ghi chú                                                         |
| :------------------------------------------------- | :--------- | :-------------------------------------------------------------- |
| `id`                                               | UUID       | Khóa chính                                                      |
| `case_id`                                          | TEXT       | Mã vụ án (`case_000`), không phải UUID của bảng `cases`         |
| `checkpoint_id`                                    | TEXT       | Khóa kỹ thuật, duy nhất theo `(case_id, checkpoint_id)`         |
| `node_id`                                          | TEXT       | Định danh người biên tập quản lý, mặc định dùng `checkpoint_id` |
| `dossier`                                          | TEXT       | Ban Đầu / Bộ A / Bộ B / Bộ C                                    |
| `title`, `question`                                | TEXT       | Nội dung hiển thị                                               |
| `type`                                             | TEXT       | Loại gốc khi import; hỗ trợ `evidence_picker`, `epilogue`, ...  |
| `kind`                                             | TEXT       | 9 loại có cấu trúc: `phone_lookup`, `suspect_interrogation`, `followup`, `indictment`, `epilogue`, `evidence_picker`, `text`, `code`, `multiple_choice` (Migration 26) |
| `subject_key`                                      | TEXT       | Khóa đối tượng liên kết tới `case_characters.key` (Migration 26)|
| `question_type`                                    | TEXT       | Mặc định `evidence_picker`                                      |
| `unlocked_evidence_id`, `followup_of`              | TEXT       | Liên kết tiến trình; `followup_of` là khóa tham chiếu tự do     |
| `suspect_label`, `evidence_step_label`             | TEXT       | Nhãn bước thẩm tra                                              |
| `depends_on`                                       | TEXT[]     | Danh sách `checkpoint_id` phải hoàn thành trước                 |
| `flow_position`                                    | JSONB      | Vị trí node Flow view `{ x, y }`; NULL dùng auto-layout          |
| `answer_config`                                    | JSONB      | Cấu hình đáp án chuẩn hóa theo `kind` (Migration 27 & 28)       |
| `hints`                                            | JSONB      | Mảng `{ group, text }`, giữ thứ tự cấp                          |
| `narrative`                                        | TEXT       | Độc thoại dẫn truyện                                            |
| `ai_context`, `ai_valid_cases`, `ai_invalid_cases` | TEXT/JSONB | Cấu hình chấm AI                                                |

### 3.1. Bảng `case_dossiers` (Quản lý Hồ sơ Vụ án)

Migration: [`db/schema/20_case_dossiers.sql`](../db/schema/20_case_dossiers.sql)

- Quản lý các tập hồ sơ (Bộ Ban Đầu, Bộ A, Bộ B, Bộ C, ...) và danh sách tài liệu/vật chứng thuộc mỗi bộ (`document_codes: TEXT[]`).
- Lưu vị trí node dossier trên Canvas (`flow_position: JSONB`).
- Hiển thị trực quan dạng **Dossier Node** trên React Flow, tự động nối cạnh từ checkpoint mở khóa (`unlocksDossier`) đến Dossier Node tương ứng.

### 3.2. Shape `answer_config`

```json
{
  "validSuspects": [],
  "validMotives": [],
  "requiredEvidenceIds": [],
  "optionalEvidenceIds": [],
  "motiveEvidenceIds": [],
  "optionalMotiveIds": [],
  "contradictionEvidenceIds": [],
  "optionalContradictionIds": [],
  "unlocksDossier": "bo_a",
  "epilogueStories": [
    { "id": "epilogue-1", "title": "Phần 1: Sự Thật", "monologue": "..." }
  ]
}
```

Studio áp dụng mô hình thẩm tra 2 lớp cốt lõi: **Động cơ** và **Mâu thuẫn lời khai** (đã loại bỏ tầng alibi theo quy chuẩn thiết kế tinh gọn). Với checkpoint loại `epilogue`, `answer_config` chứa mảng `epilogueStories` phục vụ màn hình hậu án đa chương.

### 3.2. Shape `hints`

```json
[
  { "group": "motive", "text": "Gợi ý cấp 1..." },
  { "group": "motive", "text": "Gợi ý cấp 2..." },
  { "group": "contradiction", "text": "Gợi ý cấp 1..." }
]
```

`group` nhận một trong `general | motive | alibi | contradiction`.

### 3.3. Đồ thị phụ thuộc (`depends_on`)

Migration: [`db/schema/17_case_checkpoint_dependencies.sql`](../db/schema/17_case_checkpoint_dependencies.sql)

- Cạnh có hướng: prerequisite (`source`) → checkpoint phụ thuộc (`target`).
- `depends_on` lưu mảng `checkpoint_id`; GIN index `idx_case_checkpoints_depends_on`.
- Quan hệ do Flow view quản lý, **không** do form ghi. `CaseCheckpointPayload` loại bỏ `depends_on` để lần lưu form không ghi đè sơ đồ.
- Server action `updateCheckpointDependencies()` validate batch: checkpoint cùng vụ án, không self-edge, không tham chiếu thiếu, không cycle.
- Xóa checkpoint sẽ tự dọn `checkpoint_id` khỏi `depends_on` của các row cùng vụ án.
- `checkpoint_id` bị khóa sau khi tạo vì các cạnh đang tham chiếu mã đó.
- UI quản lý theo `node_id`: sidebar, node flow và nhãn cạnh hiển thị `node_id`, không hiển thị `checkpoint_id`. `checkpoint_id` chỉ là khóa kỹ thuật nội bộ của graph.
- Danh sách node nằm bên phải, không hiển thị badge hay bộ lọc bộ hồ sơ. Bộ hồ sơ chỉ thể hiện bằng lane nền trên Flow view.
- Kéo node trên Flow view rồi bấm **Lưu sơ đồ** để ghi `flow_position`; **Tự sắp xếp** cũng ghi vị trí mới vào batch chờ lưu.
- Migration vị trí: [`db/schema/19_case_checkpoint_flow_positions.sql`](../db/schema/19_case_checkpoint_flow_positions.sql).

Gợi ý cạnh (`suggestDependencyEdges`) chỉ đọc dữ liệu CMS: `followup_of` và `requiredEvidenceIds`.
Không hardcode tên nhân vật, tên bộ hồ sơ hay mã vụ án; checkpoint mới có thể dùng khóa tham chiếu tùy ý.
Người dùng phải bấm nhận gợi ý thì cạnh mới được ghi.

### 3.4. RLS

- Ghi: chỉ admin.
- Policy ghi chấp nhận `service_role`, JWT `app_metadata.role` là `admin`/`super_admin`, hoặc `profiles.role = 'admin'`.
- Đọc: policy public (`anon`, `authenticated`) tại [`db/schema/18_case_checkpoints_public_read.sql`](../db/schema/18_case_checkpoints_public_read.sql) để runtime tải checkpoint.

---

## 4. Kiến trúc mã nguồn

```
app/(admin)/studio/checkpoints/page.tsx          # Server component, force-dynamic
components/admin/checkpoint-studio/
  checkpoint-studio-client.tsx                   # State, dirty tracking, CRUD, focus node
  checkpoint-list-sidebar.tsx                    # Danh sách compact + search + hộp biên tập inline
  checkpoint-editor.tsx                          # Hộp biên tập compact dưới danh sách
  checkpoint-flow-view.tsx                       # React Flow: xem/sửa đồ thị phụ thuộc, căn node
  code-chip-input.tsx                            # Nhập mã chứng cứ dạng chip
  sections/
    checkpoint-identity-form.tsx
    evidence-picker-config-form.tsx
    checkpoint-hints-form.tsx
    checkpoint-narrative-form.tsx
    checkpoint-ai-check-form.tsx
lib/actions/checkpoint-actions.ts                # Server actions CRUD + dependencies
lib/cms/checkpoint-graph.ts                      # Graph build/suggest/validate/layout
lib/types/checkpoint-studio.ts                   # Draft model + mapping
lib/types/database.ts                            # DbCaseCheckpoint

app/api/checkpoints/route.ts                     # Runtime API, force-dynamic, no-store
lib/hooks/use-studio-checkpoints.ts              # Fetch + memory cache 30s + dedupe
lib/cms/checkpoint-runtime.ts                    # Map DB row → Checkpoint runtime
lib/hooks/use-case-checkpoints.ts                # Ghép checkpoint Studio + evidences Sheet
```

### 4.1. Server actions

| Action                                          | Mô tả                                         |
| :---------------------------------------------- | :-------------------------------------------- |
| `getCheckpointsByCase(caseId)`                  | Đọc danh sách theo vụ án                      |
| `saveCheckpoint(draft)`                         | Insert nếu chưa có `id`, update nếu có        |
| `deleteCheckpoint(id)`                          | Xóa theo UUID + dọn cạnh tham chiếu           |
| `updateCheckpointDependencies(caseId, updates)` | Ghi batch `depends_on` sau khi validate cycle |
| `updateCheckpointPositions(caseId, updates)`    | Ghi batch `flow_position` cho Flow view       |

Mọi action gọi `requireAdminAuth()` trước khi thao tác Supabase.
`saveCheckpoint` từ chối mọi draft có `type !== 'evidence_picker'` để tránh ghi đè dữ liệu loại khác.
Update cũng từ chối đổi `checkpoint_id` và `case_id` của row đã tạo.

### 4.2. Import dữ liệu Google Sheets

Script [`scripts/import-checkpoints-to-supabase.mjs`](../scripts/import-checkpoints-to-supabase.mjs) đọc tab
`<case_id>_checkpoints` (fallback `checkpoints`), bóc DSL bằng chính parser runtime, rồi sinh SQL upsert:

```bash
pnpm import:checkpoints
# hoặc chọn vụ án khác (Node >= 22.6):
node --experimental-strip-types scripts/import-checkpoints-to-supabase.mjs --case=case_001
```

- Kết quả ghi vào `.tmp/checkpoints-import.sql`; áp dụng bằng Supabase MCP `execute_sql` hoặc `psql`.
- Upsert theo `(case_id, checkpoint_id)`, chạy lại nhiều lần không tạo bản ghi trùng.
- Import **tất cả** loại checkpoint. Loại chưa có editor (`text_match_3`, `mcq`, `text`, ...) được lưu read-only:
  form hiển thị dữ liệu nhưng khóa toàn bộ field và nút Lưu.
- Script chỉ đọc Sheet và ghi SQL vào `.tmp/`; không ghi ngược Google Sheets.
- Sau khi import, runtime đọc trực tiếp Supabase. Script không còn là nguồn runtime.

### 4.3. Quy tắc UX

- Flow view luôn là vùng chính; không còn tab Form/Flow. Rail phải gồm danh sách node phía trên và hộp biên tập ngay bên dưới.
- **Ẩn hoàn toàn ID kỹ thuật**: `Node ID`, `checkpoint_id`, `Khóa` được hệ thống quản lý ngầm trong background (tự sinh slug từ tiêu đề khi tạo mới). Người biên tập chỉ nhìn và quản lý checkpoint theo Tên / Tiêu đề (`title`).
- **Nối liên kết trực quan trên sơ đồ**: Mọi quan hệ phụ thuộc (`depends_on`, follow-up) được kéo nối trực tiếp giữa các cổng node trên canvas React Flow; không nhập thủ công mã liên kết trong form.
- **Ẩn/hiện động theo Loại câu hỏi**:
  - Hỗ trợ chọn loại câu hỏi: `evidence_picker` (Thẩm tra vật chứng 3 lớp), `choice` (Trắc nghiệm), `text` (Nhập văn bản/Tự luận), `code` (Mật mã/Mã số), `time` (Mốc thời gian).
  - Khi chọn `evidence_picker`: hiển thị các thẻ thẩm tra vật chứng (Động cơ, Mâu thuẫn, Ngoại phạm, Bổ sung) và nhãn bước thẩm tra.
  - Khi chọn các loại câu hỏi khác: tự động **ẨN** toàn bộ các mục thẩm tra vật chứng không tương ứng; hiển thị hộp cấu hình đáp án đơn giản (phương án lựa chọn hoặc đáp án chính xác).
- Danh sách node compact: chỉ hiển thị tiêu đề, phân cách bằng đường mảnh, không card padding lớn. Tìm kiếm nội bộ nhận tiêu đề và nội dung câu hỏi.
- Bấm một dòng trong danh sách sẽ chọn checkpoint, mở hộp biên tập dưới rail và căn node tương ứng vào giữa Flow view. Bấm lại vẫn căn lại.
- Hộp biên tập dùng input nhỏ cho trường ít thông tin (bộ hồ sơ, loại câu hỏi); field dài dùng textarea thấp. Không hiển thị mô tả/hint lặp lại.
- Flow view dùng `@xyflow/react`: node = checkpoint, cạnh = `depends_on`.
  - Mỗi bộ hồ sơ là một lane nền có nhãn, gom các node cùng `dossier`.
  - Auto-layout xếp lane theo thứ tự bộ, node trong lane theo tầng phụ thuộc.
  - Kéo node để sắp xếp; vị trí chỉ ghi khi bấm **Lưu sơ đồ**.
  - Kéo từ cổng phải sang node khác để tạo cạnh; click cạnh để chọn rồi xóa.
  - Cạnh nét đứt màu cyan là gợi ý từ CMS, chưa lưu; nhận từng cạnh hoặc nhận tất cả.
  - Toolbar có Fit và Tự sắp xếp theo tầng; node có badge cảnh báo dữ liệu thiếu.
  - Node hiển thị số gợi ý, số mã chứng cứ và badge cảnh báo thiếu dữ liệu.
  - Mobile chỉ xem/pan/zoom; kéo nối và lưu cạnh chỉ bật từ breakpoint `md`.
- Dirty tracking riêng cho form và sơ đồ; cảnh báo khi đổi row / đổi vụ án / đóng tab.
- Không `autoFocus`, không gọi `.focus()` tự động khi mở form (quy tắc mobile của dự án).
- Mã chứng cứ nhập tự do dạng chip; V1 chưa đọc danh mục từ tab `evidences`.

---

## 5. Lộ trình tiếp theo

1. Bổ sung editor cho `text_match_3`, `mcq`, `time`, `code`, `text`.
2. Đọc danh mục vật chứng từ tab `evidences` để gợi ý mã (vẫn giữ khả năng nhập tự do).
3. Bổ sung realtime/subscription nếu cần cập nhật checkpoint ngay khi GM sửa.
4. Loại bỏ hoàn toàn parser `checkpoint-cms.ts` sau khi hết nhu cầu import.
