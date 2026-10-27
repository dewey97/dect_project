import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("B23: Gộp Flow + Board thành một mặt phẳng duy nhất trong Checkpoint Studio", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("1. Mở Checkpoint Studio thấy Canvas thống nhất và Khay Ngoài Bảng", async ({
    page,
  }) => {
    // 1. Mở trang Checkpoint Studio
    await page.goto("/studio/checkpoints?case=case_000");

    // 2. Chờ tín hiệu sẵn sàng
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
      timeout: 15_000,
    });

    // 3. Kiểm tra Header gộp
    await expect(page.getByText("Checkpoint Studio")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Bảng điều tra (Board Studio)")).toBeVisible();

    // 4. Các nút thao tác chính
    await expect(page.getByRole("button", { name: "+ Checkpoint" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Thêm Node" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lưu Bố Cục" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Chơi Thử", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lớp logic" })).toBeVisible();

    // 5. Canvas bảng điều tra render
    const canvas = page.locator("canvas");
    await expect(canvas).toBeAttached();

    // 6. Khay Ngoài Bảng hiển thị
    await expect(page.getByText("Khay Ngoài Bảng")).toBeVisible();
  });

  test("2. Bật tắt Lớp logic và tương tác", async ({ page }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
      timeout: 15_000,
    });

    // Bấm bật Lớp logic
    const logicBtn = page.getByRole("button", { name: "Lớp logic" });
    await logicBtn.click();

    // Nút "Sắp tự động" xuất hiện khi Lớp logic bật
    const autoLayoutBtn = page.getByRole("button", { name: "Sắp tự động" });
    await expect(autoLayoutBtn).toBeVisible();

    // Bấm sắp xếp tự động lớp logic
    await autoLayoutBtn.click();
    await expect(
      page.getByText(/Đã sắp xếp tự động lớp logic/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
