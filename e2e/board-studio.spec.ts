import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Board Studio trong Checkpoint Studio", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("URL cũ ?view=board vẫn mở Studio kèm bảng điều tra nổi", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000&view=board");
    await expect(
      page.locator('[data-studio-ready="true"]').first(),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/view=board/);
    await expect(
      page.getByTitle("Kéo để di chuyển bảng điều tra"),
    ).toBeVisible();
    await expect(page.locator("canvas").first()).toBeAttached();
  });
});
