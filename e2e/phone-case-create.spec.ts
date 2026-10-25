import { expect, test } from "@playwright/test";
import { executeSql } from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Phone Case Custom App & Deep Clone (P29)", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Cần biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("Temporary case receives custom app and phone simulator renders it", async ({
    page,
    request,
  }, testInfo) => {
    // 1. Kiểm tra xem bảng case_phone_apps (migration 30-34) đã có trên database chưa
    const probeRes = await request.get("/api/phone-data/apps?caseId=case_000");
    if (!probeRes.ok()) {
      testInfo.skip(true, "API phone-data không phản hồi thành công");
      return;
    }
    const probeJson = await probeRes.json();
    // Nếu source là 'default' và bảng DB chưa sẵn sàng cho custom apps
    if (probeJson.source !== "supabase") {
      testInfo.skip(
        true,
        "Database chưa chạy migration 30–34 (case_phone_apps). Bỏ qua test P29.",
      );
      return;
    }

    const tempCaseSlug = `test_temp_${Date.now()}`;

    try {
      // Đảm bảo case tạm tồn tại trong bảng cases để thỏa mãn FK constraint
      await executeSql(
        `INSERT INTO public.cases (slug, title, status) VALUES ('${tempCaseSlug}', 'Vụ Án Tạm E2E', 'DRAFT') ON CONFLICT (slug) DO NOTHING;`,
      );

      // 2. Mở Phone Studio cho case tạm thời
      await page.goto(`/studio/phone?case=${tempCaseSlug}`);

      // 3. Chuyển sang tab Ứng dụng
      const appsTab = page.getByRole("tab", { name: /Ứng dụng/i });
      await expect(appsTab).toBeVisible({ timeout: 10_000 });
      await appsTab.click();

      // 4. Nhập tên app tùy biến và bấm Thêm ứng dụng
      const customAppName = "AppThửNghiệm";
      const nameInput = page.getByPlaceholder("Tên hiển thị (tùy chọn)");
      await nameInput.fill(customAppName);

      const addBtn = page.getByRole("button", { name: /Thêm ứng dụng/i });
      await addBtn.click();

      // 5. Kiểm tra Phone Simulator bên phải đã render app mới
      const renderedApp = page.locator(`button[title*="${customAppName}"]`);
      await expect(renderedApp).toBeVisible({ timeout: 10_000 });
    } finally {
      // Dọn sạch case tạm và các bảng liên quan (ON DELETE CASCADE)
      try {
        await executeSql(
          `DELETE FROM public.cases WHERE slug = '${tempCaseSlug}';`,
        );
      } catch {}
    }
  });
});
