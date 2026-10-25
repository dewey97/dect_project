# Báo Cáo Nghiệm Thu B18: Rào Chắn Sản Xuất, Ổn Định E2E & Nghiệm Thu Trốn Tìm v2

- **Ngày thực hiện**: 2026-10-26
- **Môi trường**: Windows Local / Node v24.19.0 / Next.js 16 (Turbopack) / Supabase Cloud Production
- **Branch**: `main` (không push theo quy tắc)
- **Base commit**: `1fbd029` (`docs(report): step 17 - record B17 verification and test execution report`)
- **Tình trạng tổng quan**:
  - Đã thực hiện đầy đủ theo thứ tự: **B18-4 → B18-5 → B18-6 → B18-3** (B18-2 đã chốt bỏ màn lệnh khám xét Hà: ghi nhận 1 dòng trong `CHANGELOG.md`).
  - Phương án C đã chốt: E2E chạy trực tiếp trên Supabase Production thông qua biến `ALLOW_E2E_PRODUCTION_SEED=true` và `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`.
  - Typecheck `pnpm lint` (`tsc --noEmit -p tsconfig.typecheck.json`): 0 lỗi.
  - Playwright E2E suite chạy 2 lần liên tiếp đạt **0 fail, 45 pass, 0 skip**.
  - Nghiệm thu Trốn Tìm v2 (`e2e/case-v2-from-studio.spec.ts`) tạo vụ hoàn toàn qua giao diện Studio UI, không SQL tay, không seed, xác thực gameplay trọn vẹn từ bảng điều tra tới hậu án. Sau mỗi lần chạy dọn sạch 100% database và storage rác tiền tố `e2e_` / `e2e/`.

---

## 1. Bảng Commit Thực Tế (Dán Nguyên Văn Từ `git log --oneline 1fbd029..HEAD`)

```text
35bb36f test(studio): step 18-3 - complete v2 end-to-end studio authoring and gameplay verification
f5b78ca fix(e2e): step 18-6 - align seedTestCase schema fields with production cases and case_checkpoints tables
d6a5c7d test(e2e): step 18-6 - add dossier_documents to cascade cleanup in db-admin
7ff8467 test(e2e): step 18-6 - implement comprehensive e2e database and storage guardrails and teardown
03b2aa4 docs(roadmap): step 18-5 - record working tree cleanup and report commit rules in roadmap and changelog
2381383 test(e2e): step 18-4 - health check supabase connectivity in globalSetup before running suite
424d54d docs(plan): record decision to drop the Ha warrant screen
ca51308 docs(plan): record decision to run E2E against production with guardrails
f7fe9f3 docs(review): independent review of B17 and B18 actions
```

> **Ghi chú**: Bảng trên tuyệt đối không liệt kê commit của chính báo cáo này và không amend sau khi ghi nhận hash.

### Chi tiết các cam kết thực hiện:

| Bước | Commit | Nội dung kỹ thuật |
| :--- | :--- | :--- |
| **B18-4** | `2381383` | `test(e2e): step 18-4 - health check supabase connectivity in globalSetup before running suite`<br>Triển khai `checkSupabaseHealth` trong `e2e/helpers/global-setup.ts`: kiểm tra kết nối REST `/rest/v1/cases` và Auth `/auth/v1/health` trước khi chạy toàn bộ test suite. Nếu Supabase không phản hồi hoặc mất mạng, suite lập tức dừng với thông báo rõ ràng thay vì fail âm thầm 40+ spec. |
| **B18-5** | `03b2aa4` | `docs(roadmap): step 18-5 - record working tree cleanup and report commit rules in roadmap and changelog`<br>Ghi nhận quy tắc dọn dẹp working tree (`git checkout -- tsconfig.json next-env.d.ts`) và quy tắc trung thực commit hash trong báo cáo vào `docs/HANDOFF_ROADMAP.md` và `CHANGELOG.md`. Đồng thời ghi nhận quyết định **B18-2**: chính thức loại bỏ màn lệnh khám xét khẩn cấp Hà theo định hướng kịch bản tinh gọn. |
| **B18-6** | `7ff8467`<br>`d6a5c7d`<br>`f5b78ca` | `test(e2e): step 18-6 - implement comprehensive e2e database and storage guardrails and teardown`<br>(1) Xây dựng rào chắn nghiêm ngặt: cấm chạy ghi dữ liệu nếu slug không có tiền tố `e2e_`.<br>(2) Hàm `cleanupE2ECases` và `deleteTestCase` thực hiện cascade dọn dẹp triệt để 11 bảng dữ liệu liên quan (`cases`, `case_characters`, `case_checkpoints`, `case_dossiers`, `dossier_documents`, `case_evidence`, `phone_conversations`, `phone_call_logs`, `boardgame_pins`, `boardgame_connections`, `reinvestigation_hotspots`).<br>(3) Tự động dọn sạch tệp Storage dưới thư mục `e2e/` của 3 bucket: `avatars`, `phone-assets`, `evidence-photos`.<br>(4) Chạy tự động trong cả `globalSetup` và `globalTeardown`. Khắc phục bất đồng bộ tên cột FK (`case_id` vs `case_slug`) và kiểm tra an toàn schema `depends_on`. |
| **B18-3** | `35bb36f` | `test(studio): step 18-3 - complete v2 end-to-end studio authoring and gameplay verification`<br>Hiện thực hóa trọn vẹn kịch bản Trốn Tìm v2 bằng Studio UI (`e2e/case-v2-from-studio.spec.ts`):<br>- Tạo vụ án mới tại `/studio/cases`, cập nhật metadata, thử trạng thái `PUBLISHED` rồi trả về `DRAFT` ngay lập tức để không lộ cho người dùng thật.<br>- Tạo nạn nhân & 3 nghi phạm kèm avatar.<br>- Tạo bộ hồ sơ & tải tài liệu nghiệp vụ qua Dossier Studio.<br>- Tạo vật chứng hiện trường qua Evidence Studio.<br>- Tạo chuỗi checkpoint (`phone_lookup`, `suspect_interrogation`, `indictment`, `epilogue`) với quan hệ đồ thị `depends_on`.<br>- Cấu hình danh bạ và nhật ký cuộc gọi qua Phone Studio.<br>- Thiết lập điểm khám xét hiện trường 2D/360.<br>- Khởi chạy gameplay tại `/evidence/web?case_id=e2e_v2_...`: xác thực bảng điều tra, mở tài liệu khay hồ sơ ban đầu, tra cứu điện thoại, thẩm tra nghi phạm, lập cáo trạng đúng thủ phạm và mở hậu án epilogue thành công 100%. |

---

## 2. Kết Quả Kiểm Thử Toàn Diện (Playwright E2E Suite)

Chạy 2 lần liên tiếp trên database Production với cấu hình `ALLOW_E2E_PRODUCTION_SEED=true`:

### Lần chạy 1:
```text
  45 passed (4.5m)
```

### Lần chạy 2:
```text
  45 passed (4.5m)
```

- **Tổng số test pass**: 45/45 (đạt 100%).
- **Số test fail**: 0.
- **Số test skip**: 0 (3 bài test trước đây bị skip do thiếu DB test là `board-new-case.spec.ts`, `case-v2-from-studio.spec.ts`, `phone-case-create.spec.ts` nay đều đã kích hoạt và pass 100%).
- **Trạng thái dọn rác sau test**: Kiểm tra `SELECT count(*) FROM cases WHERE slug LIKE 'e2e_%'` trả về 0. Thư mục `e2e/` trên Supabase Storage hoàn toàn sạch sẽ.

---

## 3. Kiểm Tra Biên Dịch Typecheck (`pnpm lint`)

```bash
pnpm lint
```
(tương đương `tsc --noEmit -p tsconfig.typecheck.json`)

- **Kết quả**: Exit code 0, 0 lỗi TypeScript trên toàn bộ codebase.

---

## 4. Bằng Chứng Hình Ảnh Nghiệm Thu (`docs/reports/b18/`)

1. **`docs/reports/b18/01_studio_cases_list.png`**:
   - Giao diện `/studio/cases` hiển thị danh sách vụ án, bao gồm vụ án v2 được tạo tự động với đầy đủ metadata và nhãn trạng thái.
2. **`docs/reports/b18/02_v2_gameplay_board.png`**:
   - Giao diện bảng điều tra gameplay `/evidence/web?case_id=e2e_v2_...` hiển thị đầy đủ các pin node ban đầu, khay hồ sơ và thanh điều hướng nghiệp vụ.

---

## 5. Kết Luận & Bàn Giao

- Hệ thống Multi-Case Engine đã vượt qua kiểm thử tích hợp toàn diện từ khâu biên soạn trên Studio (Cases, Dossier, Evidence, Checkpoint, Phone, Scene) đến khâu runtime người chơi (bảng điều tra, khám xét, thẩm tra, cáo trạng, hậu án).
- Toàn bộ cơ chế kiểm thử E2E trên cơ sở dữ liệu thật đã được trang bị rào chắn an toàn tuyệt đối (slug validation, isolated storage, pre-run health check, teardown cascade).
- Hoàn tất mục tiêu giai đoạn B18.
