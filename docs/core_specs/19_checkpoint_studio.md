# 19. Checkpoint Studio & Structured Checkpoint Authoring

> **Phạm vi:** Module quản trị `/studio/checkpoints` cho phép biên tập checkpoint, đáp án, gợi ý đa cấp, narrative và cấu hình AI check bằng form có cấu trúc, lưu vào Supabase.
>
> **Trạng thái:** V1 — dữ liệu Studio **chưa nối vào runtime**. Gameplay vẫn đọc tab `checkpoints` từ Google Sheets Live CMS.

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

## 2. Ranh giới Runtime (Quan trọng)

| Thành phần        | Nguồn dữ liệu                                                                                |
| :---------------- | :------------------------------------------------------------------------------------------- |
| Gameplay hiện tại | Google Sheets — `app/api/phone/route.ts` → `useCaseCheckpoints` → `transformSheetCheckpoint` |
| Checkpoint Studio | Supabase — bảng `public.case_checkpoints`                                                    |

V1 **không** sửa các file runtime sau:

- `app/api/phone/route.ts`
- `lib/hooks/use-case-checkpoints.ts`
- `lib/cms/checkpoint-cms.ts`
- Các component gameplay trong `components/investigation/*`

Do đó, chỉnh sửa trong Studio **chưa thay đổi game đang chạy**. UI hiển thị badge `SUPABASE ONLY` để tránh nhầm lẫn.

---

## 3. Database

Schema: [`db/schema/16_case_checkpoints.sql`](../db/schema/16_case_checkpoints.sql)

| Cột                                                | Kiểu       | Ghi chú                                                   |
| :------------------------------------------------- | :--------- | :-------------------------------------------------------- |
| `id`                                               | UUID       | Khóa chính                                                |
| `case_id`                                          | TEXT       | Khóa Sheet (`case_000`), không phải UUID của bảng `cases` |
| `checkpoint_id`                                    | TEXT       | Duy nhất theo `(case_id, checkpoint_id)`                  |
| `node_id`                                          | TEXT       | Tùy chọn, mặc định dùng `checkpoint_id`                   |
| `dossier`                                          | TEXT       | Ban Đầu / Bộ A / Bộ B / Bộ C                              |
| `title`, `question`                                | TEXT       | Nội dung hiển thị                                         |
| `type`                                             | TEXT       | Loại gốc từ Sheet; V1 chỉ biên tập `evidence_picker`      |
| `question_type`                                    | TEXT       | Mặc định `evidence_picker`                                |
| `unlocked_evidence_id`, `followup_of`              | TEXT       | Liên kết tiến trình                                       |
| `suspect_label`, `evidence_step_label`             | TEXT       | Nhãn bước thẩm tra                                        |
| `answer_config`                                    | JSONB      | Mã chứng cứ theo 3 lớp                                    |
| `hints`                                            | JSONB      | Mảng `{ group, text }`, giữ thứ tự cấp                    |
| `narrative`                                        | TEXT       | Độc thoại dẫn truyện                                      |
| `ai_context`, `ai_valid_cases`, `ai_invalid_cases` | TEXT/JSONB | Cấu hình chấm AI                                          |

### 3.1. Shape `answer_config`

```json
{
  "validSuspects": [],
  "validMotives": [],
  "requiredEvidenceIds": [],
  "optionalEvidenceIds": [],
  "motiveEvidenceIds": [],
  "optionalMotiveIds": [],
  "alibiEvidenceIds": [],
  "optionalAlibiIds": [],
  "contradictionEvidenceIds": [],
  "optionalContradictionIds": []
}
```

Dữ liệu import từ Sheet có thể kèm các khóa phục vụ loại checkpoint khác:
`options`, `correctAnswer`, `textMatchInputs`, `photoCodes`, `availableEvidences`, `rawAnswers`.
Studio V1 giữ nguyên các khóa này; form chỉ đọc/ghi 10 mảng `evidence_picker`.

### 3.2. Shape `hints`

```json
[
  { "group": "motive", "text": "Gợi ý cấp 1..." },
  { "group": "motive", "text": "Gợi ý cấp 2..." },
  { "group": "contradiction", "text": "Gợi ý cấp 1..." }
]
```

`group` nhận một trong `general | motive | alibi | contradiction`.

### 3.3. RLS

- Chỉ admin đọc/ghi.
- Policy chấp nhận `service_role`, JWT `app_metadata.role` là `admin`/`super_admin`, hoặc `profiles.role = 'admin'`.
- Runtime hiện không đọc bảng này, nên chưa cần policy public.

---

## 4. Kiến trúc mã nguồn

```
app/(admin)/studio/checkpoints/page.tsx          # Server component, force-dynamic
components/admin/checkpoint-studio/
  checkpoint-studio-client.tsx                   # State, dirty tracking, CRUD
  checkpoint-list-sidebar.tsx                    # Danh sách + search + filter dossier
  checkpoint-editor.tsx                          # Header + các section
  code-chip-input.tsx                            # Nhập mã chứng cứ dạng chip
  sections/
    checkpoint-identity-form.tsx
    evidence-picker-config-form.tsx
    checkpoint-hints-form.tsx
    checkpoint-narrative-form.tsx
    checkpoint-ai-check-form.tsx
lib/actions/checkpoint-actions.ts                # Server actions CRUD
lib/types/checkpoint-studio.ts                   # Draft model + mapping
lib/types/database.ts                            # DbCaseCheckpoint
```

### 4.1. Server actions

| Action                         | Mô tả                                  |
| :----------------------------- | :------------------------------------- |
| `getCheckpointsByCase(caseId)` | Đọc danh sách theo vụ án               |
| `saveCheckpoint(draft)`        | Insert nếu chưa có `id`, update nếu có |
| `deleteCheckpoint(id)`         | Xóa theo UUID                          |

Mọi action gọi `requireAdminAuth()` trước khi thao tác Supabase.
`saveCheckpoint` từ chối mọi draft có `type !== 'evidence_picker'` để tránh ghi đè dữ liệu loại khác.

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
- Script chỉ đọc Sheet, không sửa runtime và không ghi ngược Google Sheets.

### 4.3. Quy tắc UX

- Master-detail: danh sách bên trái, form bên phải; mobile xếp dọc.
- Dirty tracking bằng so sánh JSON draft với baseline; cảnh báo khi đổi row / đổi vụ án / đóng tab.
- Không `autoFocus`, không gọi `.focus()` tự động khi mở form (quy tắc mobile của dự án).
- Mã chứng cứ nhập tự do dạng chip; V1 chưa đọc danh mục từ tab `evidences`.
- Checkpoint không phải `evidence_picker` hiển thị banner cảnh báo và toàn bộ form ở trạng thái disabled.

---

## 5. Lộ trình tiếp theo

1. Bổ sung editor cho `text_match_3`, `mcq`, `time`, `code`, `text`.
2. Viết exporter Supabase → `SheetCheckpointRow` để đồng bộ ngược hoặc chuyển runtime sang Supabase.
3. Đọc danh mục vật chứng từ Live CMS để gợi ý mã (vẫn giữ khả năng nhập tự do).
4. Nối runtime: thay `useCaseCheckpoints` bằng nguồn Supabase sau khi dữ liệu đã được kiểm chứng song song.
