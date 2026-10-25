# Báo Cáo Nghiệm Thu B15: Khắc Phục Lỗi Review B14 & Nghiệm Thu Hệ Thống

- **Ngày thực hiện**: 2026-10-25
- **Môi trường**: Windows Local / Node v24.19.0 / Next.js 16 (Turbopack) / Supabase Cloud
- **Branch**: `main` (không push theo quy định nghiêm ngặt)
- **Tình trạng tổng quan**: 11/11 mục kỹ thuật hoàn thành theo từng commit độc lập. `tsc` sạch 100% (0 errors). E2E Playwright chạy 2 lần liên tiếp đạt **0 fail, 42 pass, 3 skip an toàn** (do chưa có Supabase test branch riêng biệt).

---

## 1. Bảng Đối Chiếu Commit Thực Tế (Dán Trực Tiếp Từ `git log --oneline`)

Toàn bộ mã hash dưới đây được trích xuất trực tiếp từ nhật ký git log (`git log --oneline`), mỗi bước đúng 1 commit:

| Bước | Commit | Thông điệp commit (`git log --oneline`) | Nội dung chi tiết |
| :--- | :--- | :--- | :--- |
| **B15-0** | `04aade2` | `docs: step 15-0 - correct B14 report commit hashes and plan status based on independent review` | Sửa lại báo cáo B14 với 8 hash thật (`fa45732`..`d7fecc8`), cập nhật bảng tiến độ plan B14 thành chưa hoàn thành trung thực theo review. |
| **B15-1** | `ae3a1c5` | `fix(gameplay): step 15-1 - restore Ky Su Hau An heading in epilogue modal to fix end game flow` | Tìm nguyên nhân gốc bằng git bisect: commit `54c3f75` đổi heading sang "HẬU ÁN — TỔNG KẾT CHUYÊN ÁN". Khôi phục heading `KÝ SỰ HẬU ÁN — TỔNG KẾT CHUYÊN ÁN` trong `epilogue-modal.tsx`. Sửa code, không sửa test. |
| **B15-2** | `6523be3` | `fix(indictment): step 15-2 - match suspect accurately against characters without ha default and add e2e spec` | Loại bỏ so khớp chuỗi con lỏng lẻo và mặc định `"ha"` trong `indictment-modal.tsx`. Chuẩn hóa so khớp chính xác với danh sách `case_characters`. Thêm spec `e2e/indictment-suspect-match.spec.ts` (test case nghi phạm "Phạm Mai Lan" `lan`). |
| **B15-3** | `4a4d32f` | `refactor(core): step 15-3 - eliminate character keys and cp-000 identifiers from core gameplay` | Dọn sạch logic theo `"vu"\|"tung"\|"ha"` và mã `cp-000-*` trong canvas, modal và audio. Xóa dead file `ha-discovered-photos-popup.tsx`. Quét grep chỉ còn 2 placeholder trong `components/admin/**`. |
| **B15-4** | `a081aef` | `test(phone): step 15-4 - update phone-case-create spec to use supabase admin client` | Thay thế hàm `executeSql` không tồn tại ở dòng 40 bằng `getAdminClient()` và guard `isE2EDbAvailable()`. |
| **B15-5** | `cd6b739` | `test(avatar): step 15-5 - use strict heading locator for suspect interrogation modal` | Khắc phục locator mơ hồ dòng 68 trong `character-avatar.spec.ts`: chuyển sang `page.getByRole("heading", { name: "THẨM TRA ĐỐI TƯỢNG" })`. |
| **B15-6** | `3b80305` | `docs(plan): step 15-6 - record test branch status and safe skip rationale` | Ghi nhận trong kế hoạch: Môi trường chưa cấu hình Supabase test branch (`E2E_SUPABASE_URL`), các spec ghi DB tự động skip an toàn để bảo vệ DB production. |
| **B15-7** | `5e895b3` | `test(studio): step 15-7 - rewrite v2 verification via studio ui and remove seedCaseTronTimV2 sql helper` | Xóa hoàn toàn helper `seedCaseTronTimV2` (hơn 400 dòng SQL seed code) khỏi `e2e/helpers/db-admin.ts`. Viết lại spec `e2e/case-v2-from-studio.spec.ts` thao tác trực tiếp qua Studio UI. |
| **B15-8** | `654d269` | `fix(activation): step 15-8 - remove case_000 slug special casing in activation page and rely on published status` | Cập nhật `case_000` thành `PUBLISHED` trong cơ sở dữ liệu `cases`. Loại bỏ hoàn toàn đặc cách theo slug `"case_000"` trên trang `/activate`. |
| **B15-9** | `6ac351f` | `refactor(checkpoints): step 15-9 - remove case_000 specific fallback branch in isConclusionUnlocked` | Xóa nhánh fallback riêng biệt cho `case_000` trong `isConclusionUnlocked` (`checkpoints-context.tsx`). Mở khóa cáo trạng 100% dựa trên đồ thị `depends_on`. |
| **B15-10** | `dafd531` | `docs(changelog): step 15-10 - document unbacked migration 43 drop and enforce in-file backup policy` | Ghi trung thực vào `CHANGELOG.md` việc migration 43 drop `evidence_nodes/edges` mà chưa backup. Thiết lập quy tắc bắt buộc sao lưu snapshot trước mọi lệnh destructive DDL từ nay về sau. |
| **B15-11** | `44e1c0e` | `docs(report): step 15-11 - verify final e2e suite and publish b15 verification report` | Chạy typecheck và Playwright E2E 2 lần liên tiếp đạt 0 fail, 42 pass, 3 skip an toàn; xuất bản báo cáo nghiệm thu chi tiết B15. |

---

## 2. Kết Quả Kiểm Thử Toàn Diện (Playwright E2E Suite)

Kiểm thử được thực hiện qua lệnh `pnpm test:e2e` hai lần liên tiếp theo đúng yêu cầu nghiệm thu:

### Lần chạy 1 (`pnpm test:e2e`):
```text
  3 skipped
  42 passed (3.5m)
```

### Lần chạy 2 (`pnpm test:e2e`):
```text
  3 skipped
  42 passed (3.3m)
```

### Chi tiết 3 test case skipped an toàn (theo B15-6):
1. `e2e/board-new-case.spec.ts:33`: Yêu cầu ghi vụ án mẫu cô lập vào database.
2. `e2e/case-v2-from-studio.spec.ts:31`: Yêu cầu thao tác tạo vụ án mới qua Studio vào database.
3. `e2e/phone-case-create.spec.ts:16`: Yêu cầu tạo và ghi app tùy biến vào database.
> **Lý do**: Cả 3 test case trên tự động nhận diện `isE2EDbAvailable() === false` và skip an toàn vì chưa được chủ dự án cấp Supabase test branch (`E2E_SUPABASE_URL`). Việc này đảm bảo không ghi dữ liệu rác hay làm sai lệch cơ sở dữ liệu production đang chạy.

---

## 3. Kiểm Tra Biên Dịch Typecheck (`npx tsc`)

```bash
npx tsc --noEmit --incremental false
```
- **Kết quả**: Exit code 0, 0 lỗi TypeScript trên toàn bộ codebase.

---

## 4. Bằng Chứng Hình Ảnh Nghiệm Thu (`docs/reports/b15/`)

- `docs/reports/b15/b15-7-studio-cases-list.png`: Giao diện danh sách vụ án tại Studio (`/studio/cases`) render độc lập, sẵn sàng cho Game Master tạo và quản trị vụ án.

---

## 5. Kết Luận & Đề Xuất Cho Chủ Dự Án

1. **Hoàn thành kỹ thuật B15**:
   - Khắc phục triệt để lỗi luồng kết game (hậu án case_000 mở mượt mà sau khi tuyên án).
   - Loại bỏ toàn bộ hardcode nhân vật, mã `cp-000-*` và các quy ước slug riêng biệt.
   - Codebase hoàn toàn sạch sẽ, typecheck 0 lỗi, 42 tests E2E pass ổn định qua 2 lần chạy liên tiếp.
2. **Hành động cần chủ dự án quyết định**:
   - **B15-6**: Nếu muốn chạy 100% 45/45 test case không skip, vui lòng tạo Supabase Test Branch (hoặc project staging riêng) và điền `E2E_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY` vào `.env.local`.
   - **B15-12**: Quyết định giữ hay ẩn 6 vụ án tĩnh "locked" tại trang `/activate` (phục vụ marketing giới thiệu tính năng hay chỉ hiển thị các vụ án thực tế từ database).
