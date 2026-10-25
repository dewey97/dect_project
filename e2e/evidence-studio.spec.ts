import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Evidence Studio & Case Evidence Engine", () => {
  test("Evidence Studio page loads 3-column layout, filters, and preview", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

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
    const col1 = page.locator(".col-span-12.lg\\:col-span-4");
    await expect(
      col1.getByPlaceholder("Tìm theo mã, tên chứng cứ..."),
    ).toBeVisible();
    await expect(col1.getByRole("button", { name: "Tất cả", exact: true }).first()).toBeVisible();
    await expect(col1.getByRole("button", { name: "Ảnh", exact: true }).first()).toBeVisible();
    await expect(col1.getByRole("button", { name: "PDF", exact: true }).first()).toBeVisible();

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
      page.getByRole("button", { name: "Hiện trường 360", exact: true }),
    ).toBeVisible();

    // Toggle to 360 Scene preview
    await page.getByRole("button", { name: "Hiện trường 360", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Hiện trường 360", exact: true }),
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
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
      localStorage.setItem("case_000:intro_seen", "true");
    });

    await page.route("**/api/test-scan-answer", (route) =>
      route.fulfill({
        json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
      }),
    );

    await page.goto("/evidence/web?case_id=case_000");

    // Board canvas should attach
    await expect(page.locator('[data-pin-id="c0-pin-phone"], [data-node-kind="phone_lookup"]').first()).toBeAttached();

    // Ensure Ban Đầu or Tất cả dossier chip is active
    const banDauChip = page.getByRole("button", { name: "Ban Đầu", exact: true });
    if (await banDauChip.isVisible().catch(() => false)) {
      await banDauChip.click();
    }

    // Check evidence header / tray has document items
    await expect(page.locator("body")).toContainText(
      "Cẩm nang hướng dẫn điều tra ban đầu",
      { timeout: 20_000 },
    );
  });

  test("Form excludes custody metadata and auto-generates code from title", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

    await page.goto("/studio/evidence?case=case_000");

    // Click Thêm Chứng Cứ
    await page.getByRole("button", { name: /Thêm Chứng Cứ/i }).click();

    // Verify 4 legacy metadata fields are NOT in the form
    await expect(page.getByText("Mã vật chứng pháp lý")).toHaveCount(0);
    await expect(page.getByText("Thời điểm ghi nhận")).toHaveCount(0);
    await expect(page.getByText("Người thu thập")).toHaveCount(0);
    await expect(page.getByText("Trạng thái niêm phong")).toHaveCount(0);

    // Fill title
    const titleInput = page.getByPlaceholder("VD: Ảnh hiện trường phòng khách");
    await titleInput.fill("Dấu vân tay trên cốc cà phê");

    // Open advanced details and check auto-generated code
    const advancedDetails = page.locator("details");
    if (await advancedDetails.count()) {
      await advancedDetails.click();
      const codeInput = page.getByPlaceholder("Tự sinh từ tiêu đề (VD: p1)");
      await expect(codeInput).toHaveValue(/dau[-_]van[-_]tay[-_]tren[-_]coc[-_]ca[-_]phe/);
    }
  });
});
