# B21 Verification Report: Tín Hiệu Sẵn Sàng Thật & Tinh Chỉnh Script Dọn Cổng E2E

> **Ngày thực hiện:** 26/10/2026  
> **Môi trường:** Production DB (Phương án C via ALLOW_E2E_PRODUCTION_SEED=true), Supabase Storage  
> **Người thực hiện:** Antigravity (AI Assistant)

---

## 1. Bảng Danh Sách Commit (git log --oneline f4014a5..HEAD)

*Lưu ý: Không liệt kê commit của chính file báo cáo này.*

| Commit Hash | Message |
| :--- | :--- |
| `d9f61c2` | `test(studio): step 21-1 - bind data-studio-ready to real loading state across all studio modules` |
| `b301cd9` | `fix(ops): step 21-2 - precise port matching and log process before kill in ensure-e2e-port` |
| `c331d7b` | `docs(report): step 21-3 - correct file paths in B20 report` |
| `9b5ac1b` | `docs(plan): add Playwright test budget for the executing agent` |
| `4e3086c` | `docs(review): fast review of B20 and B21 readiness fixes` |

---

## 2. Kết Quả Kiểm Tra Grep Tiêu Chí B21-1

### 2.1. Kiểm tra không còn giá trị gán cứng `data-studio-ready="true"`
**Lệnh thực thi:**
```bash
git grep -rn 'data-studio-ready="true"' app components
```
**Kết quả nguyên văn:**
```
(empty - 0 matches, exit code 1)
```

### 2.2. Kiểm tra toàn bộ 8 vị trí gắn `data-studio-ready` động theo state
**Lệnh thực thi:**
```bash
git grep -rn 'data-studio-ready' app components
```
**Kết quả nguyên văn:**
```
app/(admin)/studio/cases/[slug]/case-detail-client.tsx:91:      data-studio-ready={isBusy ? "false" : "true"}
app/(admin)/studio/cases/cases-client.tsx:28:      data-studio-ready={isPending ? "false" : "true"}
components/admin/character-studio/characters-studio-client.tsx:231:      data-studio-ready={isBusy ? "false" : "true"}
components/admin/checkpoint-studio/board/board-editor.tsx:92:      data-studio-ready={isLoading ? "false" : "true"}
components/admin/checkpoint-studio/checkpoint-studio-client.tsx:756:      data-studio-ready={activeView === "flow" ? (isSaving ? "false" : "true") : undefined}
components/admin/dossier-studio/dossier-studio-client.tsx:837:    <div data-studio-ready={isLoadingData ? "false" : "true"} className="h-full w-full bg-[#0a0a0d] text-zinc-100 flex flex-col overflow-hidden font-sans antialiased selection:bg-amber-500/30">
components/admin/evidence-studio/evidence-studio-client.tsx:160:      data-studio-ready={isBusy ? "false" : "true"}
components/admin/phone-studio/phone-studio-client.tsx:269:      data-studio-ready={isBusy ? "false" : "true"}
```

---

## 3. Kết Quả Chạy Spec Bị Đụng (`--repeat-each=3`)

Theo đúng ngân sách kiểm thử, chỉ chạy spec bị đụng:

**Lệnh thực thi:**
```bash
npx playwright test e2e/case-v2-from-studio.spec.ts --repeat-each=3
```

**Dòng tổng kết nguyên văn:**
```
Running 7 tests using 1 worker
  ok 1 [setup] › e2e\auth.setup.ts:13:6 › authenticate as admin (14.2s)
  ok 2 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (6.7s)
  ok 3 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (2.7m)
  ok 4 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (3.5s)
  ok 5 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (2.5m)
  ok 6 [chromium] › e2e\case-v2-from-studio.spec.ts:41:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới (4.6s)
  ok 7 [chromium] › e2e\case-v2-from-studio.spec.ts:59:7 › B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay) › 2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay (2.7m)

  7 passed (9.0m)
```
*(3/3 lần chạy toàn trình spec v2 từ khởi tạo dữ liệu qua Studio UI đến nghiệm thu gameplay đều vượt qua hoàn hảo).*

---

## 4. Kiểm Tra Dọn Sạch Database & Typecheck

- **Số vụ `e2e%` còn tồn tại trong DB:** `0`
- **Kết quả kiểm tra Typecheck (`npm run lint`):**
```
> xplore@0.1.1 lint
> tsc --noEmit -p tsconfig.typecheck.json
(exit code 0 - Clean, no type errors)
```
