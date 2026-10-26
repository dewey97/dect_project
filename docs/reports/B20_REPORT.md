# B20 Verification Report: Ổn Định Suite E2E & Triệt Tiêu Flakiness (Studio Ready & Port Auto-Recovery)

> **Ngày thực hiện:** 26/10/2026  
> **Môi trường:** Production DB (Phương án C via ALLOW_E2E_PRODUCTION_SEED=true), Supabase Storage  
> **Người thực hiện:** Antigravity (AI Assistant)

---

## 1. Bảng Danh Sách Commit (git log --oneline b99c057..HEAD)

*Lưu ý: Không liệt kê commit của chính file báo cáo này.*

| Commit Hash | Message |
| :--- | :--- |
| `8a11ae9` | `fix(e2e): step 20-2 - resolve webServer startup timeout and ensure port cleanup` |
| `8ad12e0` | `test(studio): step 20-1 - add data-studio-ready signals and stabilize v2 test` |
| `26d1d46` | `docs(review): independent review of B19 and B20 stabilization steps` |

---

## 2. B20-1: Đánh Dấu Sẵn Sàng Giao Diện Studio (`data-studio-ready`) & Ổn Định Spec v2

### 2.1. Cải tiến kỹ thuật
1. **Bổ sung tín hiệu sẵn sàng `data-studio-ready="true"`:**
   - Đã gắn thuộc tính vào container gốc của toàn bộ 7 phân hệ Studio:
     - Cases (`app/(admin)/studio/cases/cases-client.tsx`)
     - Characters (`app/(admin)/studio/characters/characters-client.tsx`)
     - Dossier (`app/(admin)/studio/dossier/dossier-client.tsx`)
     - Evidence (`app/(admin)/studio/evidence/evidence-client.tsx`)
     - Checkpoints (`app/(admin)/studio/checkpoints/checkpoint-studio-client.tsx`)
     - Board (`components/investigation/board-editor.tsx`)
     - Phone (`app/(admin)/studio/phone/phone-studio-client.tsx`)
2. **Khắc phục lỗi SSR Hydration Mismatch tại Checkpoint Studio:**
   - Server Component `app/(admin)/studio/checkpoints/page.tsx` đọc `searchParams.view` và truyền xuống `initialView` cho `CheckpointStudioClient`, ngăn chặn hiện tượng flash layout client/server khác nhau làm trễ render form.
3. **Chống race condition tại Board Studio:**
   - Trong `board-editor.tsx`, vô hiệu hóa nút "Thêm Node" khi `isLoading || isCreatingNode` và đặt `data-studio-ready={isLoading ? "false" : "true"}` để test runner đợi load xong dữ liệu graph trước khi tương tác.
4. **Ổn định spec v2 (`e2e/case-v2-from-studio.spec.ts`):**
   - Chờ `[data-studio-ready="true"]` hiển thị ở mọi bước chuyển trang Studio.
   - Chờ modal/drawer biến mất (`toBeHidden`) sau khi bấm Lưu thay vì chỉ phụ thuộc vào Toast notification.
   - Luôn điều hướng về `about:blank` trong khối `finally` trước khi gọi `deleteTestCase` nhằm ngắt các Realtime channel và fetch in-flight còn sót lại.
   - Trong `e2e/helpers/db-admin.ts`, bắt và throw lỗi rõ ràng trong `deleteTestCase(slug)`.

### 2.2. Kết quả chạy `--repeat-each=5` (Nguyên văn)

**Lệnh thực thi:**
```bash
npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=5
```

**Dòng tổng kết nguyên văn:**
```
  11 passed (11.9m)
```
*(Bao gồm: 1 lần chạy `[setup]` xác thực admin + 5 lần lặp Test 1 + 5 lần lặp toàn trình Test 2 tạo vụ và nghiệm thu gameplay. Tỉ lệ đạt: 5/5 lần chạy v2 đều pass hoàn hảo).*

---

## 3. B20-2: Triệt Tiêu Lỗi Khởi Động WebServer (`Timed out waiting 180000ms`)

### 3.1. Nguyên nhân gốc rễ (Root Cause Analysis)
1. **Hiện tượng Port Conflict (Xung đột cổng 3101):**
   - Khi chạy liên tiếp nhiều phiên test E2E hoặc khi một tiến trình bị ngắt ngang, các tiến trình con `node` hoặc background server Next.js cũ vẫn tiếp tục giữ cổng `3101`.
   - Khi Playwright khởi động lệnh `pnpm dev --port 3101`, Next.js phát hiện cổng `3101` đã bị chiếm dụng nên tự động fallback sang cổng `3102`.
   - Trong khi đó, cấu hình Playwright `webServer.url` vẫn liên tục ping cổng `3101`. Vì cổng `3101` chỉ phản hồi ứng dụng cũ hoặc treo, Playwright đợi đủ 180 giây (180,000ms) rồi báo timeout thất bại.
2. **Hiện tượng Cold Compilation Bottleneck:**
   - Playwright trước đây cấu hình `webServer.url` thăm dò địa chỉ:
     `http://localhost:3101/evidence/web?case_id=case_000`
   - Tuyến `/evidence/web` chứa toàn bộ bundle đồ họa nặng (Three.js, React Three Fiber, Scene360Viewer, Canvas, Texture loader). Khi server vừa bật ở chế độ phát triển (Next.js dev), yêu cầu đầu tiên vào trang này kích hoạt biên dịch tĩnh hàng trăm module JavaScript lớn, gây quá tải CPU và khiến thời gian sẵn sàng kéo dài tới vài phút.

### 3.2. Giải pháp khắc phục triệt để
1. **Endpoint kiểm tra sức khỏe siêu nhẹ (`/api/health`):**
   - Tạo endpoint `app/api/health/route.ts` trả về `{ status: "ok", timestamp: ... }` siêu tốc (< 10ms) mà không nạp bất kỳ module đồ họa Three.js nào.
   - Cập nhật `playwright.config.ts` để `webServer.url` thăm dò `http://localhost:${PORT}/api/health`.
2. **Kịch bản dọn cổng tự động đa nền tảng (`scripts/ops/ensure-e2e-port.mjs`):**
   - Tạo file script `scripts/ops/ensure-e2e-port.mjs` tự động tìm và cưỡng chế tắt (kill PID) bất kỳ tiến trình nào đang lắng nghe trên cổng test (mặc định 3101) trên cả Windows (`netstat -ano`) và Linux/macOS (`lsof` / `fuser`).
   - Cập nhật lệnh npm `"test:e2e": "node scripts/ops/ensure-e2e-port.mjs && playwright test"`.
   - Tích hợp gọi trực tiếp trong `playwright.config.ts`:
     `command: `node scripts/ops/ensure-e2e-port.mjs && pnpm dev --port ${PORT}``

### 3.3. Kết quả chạy Suite Toàn Diện `pnpm test:e2e` (3 Lần Liên Tiếp)

Giữa các lần chạy, cổng được làm sạch hoàn toàn. Kết quả 3 lần chạy liên tiếp:

#### Lần 1:
```
Running 45 tests using 1 worker
...
  45 passed (6.5m)
```

#### Lần 2:
```
Running 45 tests using 1 worker
...
  45 passed (6.1m)
```

#### Lần 3:
```
Running 45 tests using 1 worker
...
  45 passed (8.5m)
```

**Đánh giá:** 100% test cases (45/45) đều vượt qua ở cả 3 lượt chạy liên tiếp, không xảy ra bất kỳ lỗi timeout webServer hay flakiness nào.

---

## 4. Kiểm Tra Typecheck Cuối Cùng (`npm run lint`)

```
> xplore@0.1.1 lint
> tsc --noEmit -p tsconfig.typecheck.json
(exit code 0 - Clean, no type errors)
```
