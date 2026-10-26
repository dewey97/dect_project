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

  test("tải giao diện Board Studio qua param ?view=board và chuyển tab", async ({
    page,
  }) => {
    // 1. Mở trang Checkpoint Studio với view=board
    await page.goto("/studio/checkpoints?case=case_000&view=board");

    // 2. Kiểm tra header và toolbar của Board Studio
    await expect(
      page.getByText("Bảng điều tra (Board Studio)"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Thêm Node" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lưu Bố Cục" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Chơi Thử", exact: true })).toBeVisible();

    // 3. Canvas bảng điều tra render
    const canvas = page.locator("canvas");
    await expect(canvas).toBeAttached();

    // 4. Chuyển tab sang Sơ đồ luồng (Flow)
    await page.getByRole("button", { name: "Sơ đồ luồng (Flow)" }).click();
    await expect(page).toHaveURL(/view=flow|^(?!.*view=board).*$/);

    // 5. Chuyển lại sang Bảng điều tra (Board)
    await page.getByRole("button", { name: "Bảng điều tra (Board)" }).click();
    await expect(page).toHaveURL(/view=board/);
    await expect(
      page.getByText("Bảng điều tra (Board Studio)"),
    ).toBeVisible();
  });
});
