import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Phone Studio & Simulator", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("Studio page loads 3-column layout and tabs", async ({ page }) => {
    await page.goto("/studio/phone?case=case_000");

    // Case picker and header
    await expect(page.getByText("Phone Studio")).toBeVisible();
    await expect(page.getByText("Case đang biên soạn:")).toBeVisible();

    // 7 editor navigation tabs
    await expect(page.getByRole("tab", { name: /Thiết bị/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Ứng dụng/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tin nhắn/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Cuộc gọi/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Danh bạ/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Thư viện ảnh/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Ghi chú & Khác/i }),
    ).toBeVisible();

    // Live phone preview container
    await expect(page.getByText("Mô phỏng Trực tiếp (WYSIWYG)")).toBeVisible();

    // Switch to Apps tab
    await page.getByRole("tab", { name: /Ứng dụng/i }).click();
    await expect(
      page.getByText("Trình quản lý Ứng dụng (App Launcher)"),
    ).toBeVisible();

    // Switch to Messages tab
    await page.getByRole("tab", { name: /Tin nhắn/i }).click();
    await expect(page.getByText("Tin nhắn & Hội thoại")).toBeVisible();

    // Switch to Contacts tab
    await page.getByRole("tab", { name: /Danh bạ/i }).click();
    await expect(page.getByText("Danh bạ Điện thoại")).toBeVisible();
  });
});
