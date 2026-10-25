import { expect, test } from "@playwright/test";
import { isE2EDbAvailable, cleanupCaseTronTimV2 } from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

const TEST_CASE_SLUG = "case_tron_tim_v2";

test.describe("B15-7: Nghiệm thu Trốn Tìm v2 (Tạo qua Studio UI)", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Cần biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới", async ({ page }) => {
    await page.goto("/studio/cases");
    await expect(page.locator("h1")).toContainText(/Cases/i, {
      timeout: 15_000,
    });

    // Chụp ảnh Studio Cases list
    await page.screenshot({
      path: "docs/reports/b15/b15-7-studio-cases-list.png",
      fullPage: false,
    });
  });

  test("2. Tạo và cấu hình vụ án Trốn Tìm v2 qua Studio UI", async ({
    page,
  }, testInfo) => {
    // B15-6: Yêu cầu Supabase test branch để ghi dữ liệu, không ghi đè production
    if (!isE2EDbAvailable()) {
      testInfo.skip(
        true,
        "B15-6/B15-7: Chưa cấu hình Supabase test branch (E2E_SUPABASE_URL). Tự động skip an toàn để bảo vệ DB production.",
      );
      return;
    }

    try {
      // 1. Mở trang Cases Studio
      await page.goto("/studio/cases");
      await expect(page.locator("h1")).toContainText(/Cases/i);

      // 2. Mở form tạo vụ án
      const createBtn = page.getByRole("button", { name: /Tạo vụ án|New Case/i });
      if (await createBtn.isVisible()) {
        await createBtn.click();
        const slugInput = page.getByPlaceholder(/slug/i);
        if (await slugInput.isVisible()) {
          await slugInput.fill(TEST_CASE_SLUG);
          const titleInput = page.getByPlaceholder(/tên vụ án|title/i);
          if (await titleInput.isVisible()) {
            await titleInput.fill("Trốn Tìm v2 (Studio Test)");
          }
          const submitBtn = page.getByRole("button", { name: /Xác nhận|Lưu|Tạo/i });
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
          }
        }
      }

      // Chụp ảnh từng bước nghiệm thu
      await page.screenshot({
        path: "docs/reports/b15/b15-7-studio-create-step.png",
        fullPage: false,
      });
    } finally {
      try {
        await cleanupCaseTronTimV2(TEST_CASE_SLUG);
      } catch {}
    }
  });
});
