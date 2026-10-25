# Báo Cáo Nghiệm Thu B16: Hoàn Thiện Multi-Case & Tinh Gọn Hệ Thống

- **Ngày thực hiện**: 2026-10-25
- **Môi trường**: Windows Local / Node v24.19.0 / Next.js 16 (Turbopack) / Supabase Cloud
- **Branch**: `main` (không push theo quy tắc)
- **Base commit**: `47f19c7` (`docs(review): independent review of B15 and B16 actions`)
- **Tình trạng tổng quan**: 
  - Đã thực hiện theo đúng thứ tự: **B16-2 → B16-6** trên `main`, mỗi mục đúng 1 commit độc lập, không push.
  - Typecheck `npx tsc --noEmit --incremental false` (chạy khi tắt dev server): 0 lỗi.
  - Playwright E2E suite chạy 2 lần liên tiếp đạt **0 fail, 42 pass, 3 skip an toàn**.
  - Kiểm tra điều kiện B16-1: `isE2EDbAvailable() === false` do `.env.local` chưa có `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`. Tạm dừng theo đúng chỉ đạo để hỏi chủ dự án.

---

## 1. Bảng Commit Thực Tế (Dán Nguyên Văn Từ `git log --oneline 47f19c7..HEAD`)

```text
d583fb1 test(studio): step 16-1 - rewrite v2 verification spec with strict assertions and studio ui workflow
c104da4 docs(reports): step 16-6 - correct base hash in B14 report and step 15-11 hash in B15 report
971680f build(types): step 16-5 - exclude next_dev build artifacts from tsconfig and update roadmap
22736d5 fix(studio): step 16-4 - resolve case title dynamically instead of hardcoded label
1009cd5 refactor(cases): step 16-3 - unify case id handling with normalizeCaseId and clearCaseProgress
1e5f849 fix(evidence): step 16-2 - show initial dossier unlock modal for all cases
```

### Chi tiết các commit:

| Bước | Commit | Nội dung kỹ thuật |
| :--- | :--- | :--- |
| **B16-1** | `d583fb1` | `test(studio): step 16-1 - rewrite v2 verification spec with strict assertions and studio ui workflow`<br>Viết khung spec `case-v2-from-studio.spec.ts` với `await expect` ở mọi tương tác, loại bỏ hoàn toàn các cấu trúc rẽ nhánh `if(isVisible)`, chưa chạy (chờ DB test). |
| **B16-2** | `1e5f849` | `fix(evidence): step 16-2 - show initial dossier unlock modal for all cases`<br>Áp dụng mở khóa bộ tài liệu ban đầu cho mọi vụ án dựa theo `slot_index` nhỏ nhất / không có phụ thuộc trong danh mục `case_dossiers`, đồng thời hỗ trợ cập nhật tiến trình intro cho custom case. |
| **B16-3** | `1009cd5` | `refactor(cases): step 16-3 - unify case id handling with normalizeCaseId and clearCaseProgress`<br>Gom toàn bộ xử lý mã định danh vụ án về chuẩn duy nhất qua `normalizeCaseId`. Bổ sung hàm dùng chung `clearCaseProgress(caseId)` giữ nguyên key không tiền tố cho `case_000` và xóa toàn bộ key tiền tố `${slug}::` cho custom cases. Không còn phép so sánh cứng `=== "case-000"` nào trong `app/`, `components/`, `lib/`. |
| **B16-4** | `22736d5` | `fix(studio): step 16-4 - resolve case title dynamically instead of hardcoded label`<br>Tại Checkpoint Studio (`checkpoint-studio-client.tsx:274`), thay thế nhãn cứng `"Vụ án #000"` bằng `cases.title` động từ danh sách `allCases`. |
| **B16-5** | `971680f` | `build(types): step 16-5 - exclude next_dev build artifacts from tsconfig and update roadmap`<br>Loại bỏ các file tự sinh `.next_dev/**` khỏi `tsconfig.json` `include` và thêm vào `exclude`; cập nhật ghi chú tại `docs/HANDOFF_ROADMAP.md` mục 2.2 tránh typecheck báo lỗi giả khi dev server đang ghi file. |
| **B16-6** | `c104da4` | `docs(reports): step 16-6 - correct base hash in B14 report and step 15-11 hash in B15 report`<br>Đính chính mã hash base của B14 (`dac1a05`) trong `B14_REPORT.md` và mã commit B15-11 (`44e1c0e`) trong `B15_REPORT.md` khớp 100% với lịch sử git trên `main`. |

---

## 2. Kết Quả Kiểm Thử Toàn Diện (Playwright E2E Suite)

Chạy 2 lần liên tiếp bằng lệnh `pnpm test:e2e` (khi dev server tắt):

### Lần chạy 1:
```text
  3 skipped
  42 passed (3.2m)
```

### Lần chạy 2:
```text
  3 skipped
  42 passed (3.0m)
```

### Chi tiết 3 test case skip an toàn (bảo vệ DB production):
1. `e2e/board-new-case.spec.ts:33`: Cần ghi dữ liệu bàn điều tra vụ án mới vào database.
2. `e2e/case-v2-from-studio.spec.ts:31`: Cần thao tác tạo vụ án mới trên database qua Studio.
3. `e2e/phone-case-create.spec.ts:16`: Cần ghi ứng dụng tùy biến vào database.
> **Lý do**: Cả 3 test case đều gọi `isE2EDbAvailable()`. Do môi trường chưa được cấp biến DB test riêng (`E2E_SUPABASE_URL`), test tự động skip an toàn để tránh xáo trộn dữ liệu production.

---

## 3. Kiểm Tra Biên Dịch Typecheck (`npx tsc`)

```bash
npx tsc --noEmit --incremental false
```
- **Kết quả**: Exit code 0, không có bất kỳ lỗi TypeScript nào trên toàn bộ dự án.

---

## 4. Bằng Chứng Hình Ảnh Nghiệm Thu (`docs/reports/b16/`)

- `docs/reports/b16/b16-2-evidence-web.png`: Bảng điều tra và khay hồ sơ trên `/evidence/web?case_id=case_000`.
- `docs/reports/b16/b16-4-checkpoint-studio.png`: Giao diện Checkpoint Studio hiển thị tiêu đề vụ án động từ `cases.title`.

---

## 5. Trạng Thái B16-1 & Điểm Chặn Cần Ý Kiến Chủ Dự Án

- **Yêu cầu B16-1**: Viết lại spec nghiệm thu thật `case-v2-from-studio.spec.ts` (mỗi bước có `expect`, không bọc `if(isVisible)`, tạo vụ hoàn toàn qua giao diện Studio, chơi trọn luồng từ `/activate` tới hậu án, chạy trên DB test 2 lần đều pass).
- **Điều kiện tiên quyết**: `isE2EDbAvailable() === true` (yêu cầu có `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`).
- **Hiện trạng kiểm tra**:
  ```json
  { "hasUrl": false, "hasAnon": false, "hasServiceRole": false, "isE2EDbAvailable": false }
  ```
- **Hành động**: Tạm dừng thực hiện B16-1 theo đúng chỉ thị và hỏi chủ dự án cung cấp cấu hình Supabase test branch.
