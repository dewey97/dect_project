import { expect, test } from "@playwright/test";

test.describe("Evidence Studio & Case Evidence Engine", () => {
  test("Evidence Studio page loads 3-column layout, filters, and preview", async ({
    page,
  }) => {
    await page.goto("/studio/evidence?case=case_000");

    // Header & Brand
    await expect(page.getByText("Evidence Studio")).toBeVisible();
    await expect(page.getByText("M1 / M2 / M3 / M10 / M12")).toBeVisible();

    // Top action buttons
    await expect(page.getByRole("button", { name: /Làm mới/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Cấu hình Hiện Trường 360/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Thêm Chứng Cứ/i }),
    ).toBeVisible();

    // Filters in Column 1
    await expect(
      page.getByPlaceholder("Tìm theo mã, tên chứng cứ..."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Tất cả" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ảnh" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PDF" })).toBeVisible();

    // Column 2: Form Header
    await expect(
      page.getByText(/Chỉnh sửa Chứng Cứ|Thêm Chứng Cứ Mới/i),
    ).toBeVisible();

    // Column 3: Live Preview Header & Toggle Tabs
    await expect(
      page.getByText("Bản Mô Phỏng Thực Tế (Live Preview)"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Hồ sơ tang vật" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Hiện trường 360" }),
    ).toBeVisible();

    // Toggle to 360 Scene preview
    await page.getByRole("button", { name: "Hiện trường 360" }).click();
    await expect(
      page.getByRole("button", { name: "Hiện trường 360" }),
    ).toBeVisible();

    // Open 360 Config Modal
    await page
      .getByRole("button", { name: /Cấu hình Hiện Trường 360/i })
      .click();
    await expect(
      page.getByText("Cấu hình Hiện Trường 360 & Panorama"),
    ).toBeVisible();
    await expect(
      page.getByText("Ảnh cầu 360 độ (Equirectangular Sphere Image)"),
    ).toBeVisible();

    // Close Modal
    await page.getByRole("button", { name: "Đóng" }).click();
  });

  test("Case_000 evidence tray loads documents and evidence items in game", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.route("**/api/test-scan-answer", (route) =>
      route.fulfill({
        json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
      }),
    );

    await page.goto("/evidence/web?case_id=case_000");

    // Board canvas should attach
    await expect(page.locator('[data-pin-id="c0-pin-phone"]')).toBeAttached();

    // Check evidence header / tray has document items
    await expect(page.locator("body")).toContainText(
      "00. Cẩm nang hướng dẫn điều tra ban đầu",
    );
  });
});
