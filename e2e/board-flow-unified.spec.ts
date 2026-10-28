import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

/**
 * Checkpoint Studio: sơ đồ Flow ở vùng chính + bảng điều tra nổi
 * (floating-board-panel) dùng chung dữ liệu với gameplay.
 */
test.describe("Checkpoint Studio: Flow + bảng điều tra nổi", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("1. Mở Studio thấy header, sơ đồ Flow và bảng điều tra nổi", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(
      page.locator('[data-studio-ready="true"]').first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByText("Checkpoint Studio").first()).toBeVisible();
    for (const title of [
      "Tạo checkpoint mới",
      "Tạo nhân vật mới",
      "Chơi thử vụ án",
      "Bật/Tắt Cửa sổ Bảng điều tra nổi",
      "Lưu tất cả thay đổi (Ctrl+S)",
      "Kiểm tra logic vụ án (Case Linter)",
    ]) {
      await expect(page.getByTitle(title)).toBeVisible();
    }

    // Sơ đồ Flow: mỗi checkpoint một node
    await expect(page.locator(".react-flow").first()).toBeVisible();
    await expect(page.locator(".react-flow__node").first()).toBeVisible();

    // Bảng điều tra nổi mở sẵn, có canvas
    await expect(
      page.getByTitle("Kéo để di chuyển bảng điều tra"),
    ).toBeVisible();
    await expect(page.locator("canvas").first()).toBeAttached();
  });

  test("2. Bật/tắt bảng nổi và chuyển chế độ Chỉnh sửa / Test bảng", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(
      page.locator('[data-studio-ready="true"]').first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    const toggle = page.getByTitle("Bật/Tắt Cửa sổ Bảng điều tra nổi");
    const dragHandle = page.getByTitle("Kéo để di chuyển bảng điều tra");
    await expect(dragHandle).toBeVisible();

    await toggle.click();
    await expect(dragHandle).toHaveCount(0);
    await toggle.click();
    await expect(dragHandle).toBeVisible();

    await page.getByTitle(/^Chế độ Test bảng/).click();
    await page.getByTitle("Chế độ Chỉnh sửa").click();
    await expect(dragHandle).toBeVisible();
  });
});
