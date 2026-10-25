# Báo Cáo Nghiệm Thu B17: Nghiệm Thu v2 & Xử Lý Dứt Điểm Tồn Đọng Multi-Case

- **Ngày thực hiện**: 2026-10-25
- **Môi trường**: Windows Local / Node v24.19.0 / Next.js 16 (Turbopack) / Supabase Cloud
- **Branch**: `main` (không push theo quy tắc)
- **Base commit**: `6079411` (`docs(report): step 16 - publish B16 report and verification screenshots`)
- **Tình trạng tổng quan**:
  - Đã thực hiện theo đúng thứ tự: **B17-2 → B17-6** trên `main`, mỗi mục đúng 1 commit độc lập, không push.
  - Typecheck `pnpm lint` (`tsc --noEmit -p tsconfig.typecheck.json`): 0 lỗi.
  - Playwright E2E suite chạy 2 lần liên tiếp đạt **0 fail, 42 pass, 3 skip an toàn**.
  - Kiểm tra điều kiện B17-1: `isE2EDbAvailable() === false` do `.env.local` chưa có `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`. Tạm dừng theo đúng chỉ đạo để hỏi chủ dự án.

---

## 1. Bảng Commit Thực Tế (Dán Nguyên Văn Từ `git log --oneline 6079411..HEAD`)

```text
df8e064 docs(report): step 17 - publish B17 report and verification screenshots
abb1b3a docs(reports): step 17-6 - clarify B16-1 status in B16 report as pending test DB
a1c2547 refactor(cases): step 17-5 - require explicit caseId parameter and remove default case_000 fallbacks
144eb71 test(studio): step 17-4 - save e2e screenshots to testInfo outputPath instead of docs reports
a30b243 build(types): step 17-3 - introduce tsconfig.typecheck.json to isolate lint from dev server artifacts
ea6d5cb refactor(epilogue): step 17-2 - remove dead isHa and haWarrantStep branches from culprit epilogue modal
941b2f8 docs(review): independent review of B16 and B17 actions
```

### Chi tiết các commit:

| Bước | Commit | Nội dung kỹ thuật |
| :--- | :--- | :--- |
| **B17-2** | `ea6d5cb` | `refactor(epilogue): step 17-2 - remove dead isHa and haWarrantStep branches from culprit epilogue modal`<br>Xác minh lịch sử qua `git show 54c3f75^` và `git log -S "haWarrantStep"`. Nhánh `isHa = false` và `haWarrantStep` là logic cũ đã được thay thế bằng quy trình kết án chuẩn (`choice === 'solved_box' / 'matched_3_tiles_indictment'`). Xóa bỏ hoàn toàn code chết, biến cờ `isHa`, `haWarrantStep`, `isHaBoxSolved`, không còn so sánh `case_000` trong `culprit-epilogue-modal.tsx`. |
| **B17-3** | `a30b243` | `build(types): step 17-3 - introduce tsconfig.typecheck.json to isolate lint from dev server artifacts`<br>Tạo `tsconfig.typecheck.json` mở rộng từ `tsconfig.json` và bổ sung `.next`, `.next_dev` vào `exclude`. Cập nhật lệnh `pnpm lint` chạy qua cấu hình này, giải quyết triệt để lỗi typecheck giả khi dev server Next.js tự ghi file vào `.next_dev/`. |
| **B17-4** | `144eb71` | `test(studio): step 17-4 - save e2e screenshots to testInfo outputPath instead of docs reports`<br>Cập nhật đường dẫn chụp ảnh trong `e2e/case-v2-from-studio.spec.ts` sang `testInfo.outputPath("studio-cases-list.png")`, đảm bảo thư mục test artifacts độc lập với tài liệu báo cáo `docs/reports`. |
| **B17-5** | `a1c2547` | `refactor(cases): step 17-5 - require explicit caseId parameter and remove default case_000 fallbacks`<br>Yêu cầu tham số bắt buộc `caseId` tại `useDossierDocuments`, `PDFViewerModal`, và `getEmptyMapVectorData`. Đảm bảo `grep -rnE 'caseId[^=]*= ?"case[-_]000"' app components lib` trả về 0 kết quả. |
| **B17-6** | `abb1b3a` | `docs(reports): step 17-6 - clarify B16-1 status in B16 report as pending test DB`<br>Đính chính mô tả bước B16-1 trong `docs/reports/B16_REPORT.md` mục 1 thành "viết khung spec, chưa chạy (chờ DB test)" cho đúng với thực tế kiểm tra. |

---

## 2. Kết Quả Kiểm Thử Toàn Diện (Playwright E2E Suite)

Chạy 2 lần liên tiếp bằng lệnh `pnpm test:e2e`:

### Lần chạy 1:
```text
  3 skipped
  42 passed (3.3m)
```

### Lần chạy 2:
```text
  3 skipped
  42 passed (3.1m)
```

### 3 test case skip an toàn (bảo vệ DB production):
1. `e2e/board-new-case.spec.ts:33`: Cần ghi dữ liệu bàn điều tra vụ án mới vào database.
2. `e2e/case-v2-from-studio.spec.ts:31`: Cần thao tác tạo vụ án mới trên database qua Studio.
3. `e2e/phone-case-create.spec.ts:16`: Cần ghi ứng dụng tùy biến vào database.
> **Lý do**: Cả 3 test case đều gọi `isE2EDbAvailable()`. Do môi trường chưa được cấp biến DB test riêng (`E2E_SUPABASE_URL`), test tự động skip an toàn để tránh xáo trộn dữ liệu production.

---

## 3. Kiểm Tra Biên Dịch Typecheck (`pnpm lint`)

```bash
pnpm lint
# $ tsc --noEmit -p tsconfig.typecheck.json
```
- **Kết quả**: Exit code 0, không có bất kỳ lỗi TypeScript nào.

---

## 4. Bằng Chứng Hình Ảnh Nghiệm Thu (`docs/reports/b17/`)

- `docs/reports/b17/b17-evidence-web.png`: Giao diện khay hồ sơ và bảng điều tra `/evidence/web?case_id=case_000`.
- `docs/reports/b17/b17-checkpoint-studio.png`: Giao diện Checkpoint Studio hiển thị tiêu đề và cây checkpoint động.

---

## 5. Trạng Thái B17-1 & Yêu Cầu Cấu Hình Test DB

- **Yêu cầu B17-1**:
  - Viết spec thao tác UI tạo đủ: metadata + `PUBLISHED`; 1 nạn nhân + 3 nghi phạm; 4 bộ hồ sơ + ≥ 6 tài liệu (Dossier Studio); ≥ 4 vật chứng (Evidence Studio); checkpoint `phone_lookup`, 3 `suspect_interrogation`, `followup`, `indictment` (có `depends_on`), `epilogue` (Checkpoint Studio); danh bạ + 1 thread tin nhắn + 1 cuộc gọi (Phone Studio); ≥ 1 node bảng (Board Studio); 1 hotspot (tab Hiện trường).
  - Chơi: `/activate` → bảng → tra SĐT → 1 thẩm tra → câu hỏi phụ → cáo trạng đúng → thấy hậu án.
  - Chạy thật trên DB test 2 lần pass.
- **Hiện trạng kiểm tra**:
  ```json
  { "hasUrl": false, "hasAnon": false, "hasRole": false, "isE2EDbAvailable": false }
  ```
- **Hành động**: Tạm dừng B17-1 theo đúng quy định cho đến khi chủ dự án cung cấp thông tin Supabase test branch.
