# Báo cáo B22 — Chốt ổn định Spec v2 & Bộ kiểm thử E2E

> **Ngày thực hiện:** 2026-10-26  
> **Môi trường:** Production Database (Phương án C: `ALLOW_E2E_PRODUCTION_SEED=true`, slug `e2e_`, dọn sạch sau mỗi lượt test)  
> **HEAD trước báo cáo:** `3e3ba9b`

---

## 1. Bảng commit thực hiện

Trích xuất nguyên văn từ `git log --oneline 9f80665..HEAD`:

```text
3e3ba9b fix(studio): absorb read-after-write replication latency on case detail page
74fdbe8 test(studio): step 22-2 - stabilize step 3 character save and defend actions
fe55b02 feat(studio): step 22-1 - wire real busy state in phone studio editors
f1462a7 docs(review): fast review of B21 and B22 stabilization items
```

---

## 2. Nguyên nhân gốc B22-2 & Giải pháp xử lý

### 2.1. Phân tích nguyên nhân gốc từ trace

Qua việc mở và phân tích trace lần fail (`.tmp/trace_fail/1-trace.trace`, `.tmp/trace_fail/1-trace.network`, screencast frames):
1. **Layout Shift & Race Condition trong Form**: Khi spec chọn vai trò `"victim"` (`selectOption("victim")`), component React re-render và chèn thêm khối fieldset *"Điện thoại tang vật (Nạn nhân)"* ngay phía trên nút lưu. Nút submit bị đẩy dịch chuyển xuống dưới ngay trong khoảnh khắc Playwright click (`call@116`).
2. **Thiếu rào chắn tín hiệu hoàn thành**: Trước B22, spec sau khi click lưu nhân vật đã ngay lập tức assert `locator('aside').getByText(char.name)` mà không chờ `saveBtn` chuyển trạng thái hoặc chờ `data-studio-ready="true"`. Khi mạng tới Supabase Cloud có độ trễ hoặc server action đang trong transaction, timeout 15s bị kích hoạt trước khi state `characters` kịp hydrate.
3. **Phòng vệ thuộc tính undefined trong `saveCharacter`**: `saveCharacter` được bổ sung phòng thủ `(draft.description || "").trim()`, `(draft.avatarCode || "").trim()`, `draft.phones || []`, `draft.aliases || []` để triệt tiêu mọi khả năng văng TypeError ngầm khi gọi action.

### 2.2. Khắc phục
- **Phone Studio (B22-1)**: Nối toàn bộ 7 editor con (`device-form`, `app-launcher-editor`, `messages-editor`, `calls-editor`, `contacts-editor`, `photos-editor`, `misc-editors`) với `onBusyChange` và `setIsBusy` của `PhoneStudioClient`. Khi đang lưu, `data-studio-ready="false"`.
- **Character Studio (B22-2)**:
  - Thêm trạng thái `isPending ? "Đang lưu..." : ...` và disable nút submit khi đang bận.
  - Spec chờ nút lưu `toBeEnabled()` trước khi click, sau đó chờ `data-studio-ready="true"`, tên nhân vật trong `aside` và nút lưu `toBeEnabled()` trở lại.
- **Case Detail Page**: Bổ sung cơ chế retry nhẹ (800ms) tại `app/(admin)/studio/cases/[slug]/page.tsx` nhằm hấp thu độ trễ đồng bộ read-after-write của Supabase Cloud sau khi tạo vụ mới, xóa bỏ hoàn toàn hiện tượng 404 thoáng qua khi chuyển trang.

---

## 3. Dòng tổng kết các lần chạy kiểm thử

### 3.1. Spec v2 kiểm tra độ ổn định (`--repeat-each=3`)

```text
Running 7 tests using 1 worker

  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (9.4s)
  ok 2 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (3.8s)
  ok 3 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (1.9m)
  ok 4 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (3.0s)
  ok 5 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (1.9m)
  ok 6 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (5.3s)
  ok 7 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (2.0m)

  7 passed (6.6m)
```

### 3.2. Toàn bộ test suite E2E (`pnpm test:e2e`)

```text
$ node scripts/ops/ensure-e2e-port.mjs && playwright test

Running 45 tests using 1 worker

  45 passed (6.4m)
```

- **Kết quả:** 45/45 tests passed (0 failed, 0 skipped).
- **Tổng thời gian chạy test:** ~15.4 phút (nằm trong giới hạn ngân sách ≤ 20 phút).
- **Typecheck (`pnpm lint`):** `npx tsc --noEmit -p tsconfig.typecheck.json` exit code 0, không có lỗi TypeScript.
- **Rác database production:** Đã dọn sạch 100%, không còn vụ án `e2e_%` hay file rác trong Storage.
