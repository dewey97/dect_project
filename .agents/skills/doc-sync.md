# Skill: Doc Sync — Tự động kiểm tra tài liệu sau khi sửa code

Khi sử dụng skill này, kiểm tra xem docs có còn chính xác sau khi code thay đổi.

## Trigger

- Sau khi sửa file trong `lib/`, `components/`, `types/`
- Sau khi thêm/sửa Server Action
- Trước khi commit (nhắc nhở review docs)
- Khi user yêu cầu: `/doc-sync`

## Quy trình kiểm tra

### Step 1: Phát hiện thay đổi

```bash
git diff --name-only HEAD~1
```

Xác định file nào đã thay đổi → map sang docs cần update.

### Step 2: Map code → docs

| Code file changed | Docs cần update |
|---|---|
| `lib/store/slices/*.ts` | `docs/api/store-api.md` |
| `lib/offline/sync-engine.ts` | `docs/api/sync-engine-api.md` |
| `lib/offline/repositories.ts` | `docs/api/repositories-api.md` |
| `lib/offline/local-db.ts` | `docs/database.md` |
| `app/(dashboard)/*/actions.ts` | `docs/api/server-actions.md` |
| `types/index.ts` | `docs/reference/types.md` |
| `components/**/*.tsx` | `docs/reference/components.md` |
| `lib/*.ts` | `docs/reference/utilities.md` |
| `lib/store/slices/hooks.ts` | `docs/reference/hooks.md` |

### Step 3: Đọc docs hiện tại, so sánh với code mới

Đọc từng file docs và source code tương ứng:
- **API signature thay đổi** → Update signature trong docs
- **Function mới được thêm** → Thêm vào docs
- **Function bị xóa** → Xóa khỏi docs
- **Parameter thay đổi** → Update parameter docs
- **Behaviour mới** → Thêm vào examples hoặc notes
- **File path mới** → Thêm vào docs

### Step 4: Cập nhật docs

Dùng `Edit` tool để cập nhật trực tiếp file docs. Chỉ update phần thay đổi, KHÔNG rewrite toàn bộ file.

### Step 5: Validate

```bash
grep -c "##" docs/api/*.md docs/reference/*.md
```

Verify docs vẫn có cấu trúc đúng (headers, code blocks, links).

## Rules

1. **Không tạo docs mới** — chỉ update docs hiện có
2. **Không xóa section** — chỉ update nội dung
3. **Code block phải match code thực** — copy-paste, không paraphrase
4. **Giữ nguyên markdown format** — ## headers, ``` code blocks, - lists
5. **Update docs/index.md** nếu thêm docs mới hoặc thay đổi structure
6. **Log thay đổi** — thông báo cho user docs nào đã được update
