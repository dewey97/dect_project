import { expect, test } from "@playwright/test";
import { isE2EDbAvailable, cleanupCaseTronTimV2 } from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("B16-1: Nghiệm thu Trốn Tìm v2 (Tạo qua Studio UI)", () => {
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

    const createBtn = page.getByRole("button", { name: /Create New Case/i });
    await expect(createBtn).toBeVisible();

    // Chụp ảnh Studio Cases list
    await page.screenshot({
      path: "docs/reports/b16/b16-1-studio-cases-list.png",
      fullPage: false,
    });
  });

  test("2. Tạo và cấu hình vụ án Trốn Tìm v2 qua Studio UI và vào game", async ({
    page,
  }, testInfo) => {
    // B16-1: Chỉ chạy khi isE2EDbAvailable() = true (đã có DB test riêng)
    if (!isE2EDbAvailable()) {
      testInfo.skip(
        true,
        "B16-1: Chưa cấu hình Supabase test branch (E2E_SUPABASE_URL, E2E_SUPABASE_SERVICE_ROLE_KEY). Tự động skip an toàn để bảo vệ DB production.",
      );
      return;
    }

    let createdSlug = "";

    try {
      // 1. Mở trang Cases Studio và bấm Tạo Vụ Án mới
      await page.goto("/studio/cases");
      await expect(page.locator("h1")).toContainText(/Cases/i);

      const createBtn = page.getByRole("button", { name: /Create New Case/i });
      await expect(createBtn).toBeVisible();
      await createBtn.click();

      // Đợi chuyển hướng sang trang chi tiết vụ án
      await page.waitForURL(/\/studio\/cases\/case_/, { timeout: 15_000 });
      const currentUrl = page.url();
      createdSlug = currentUrl.split("/").pop()!;
      expect(createdSlug).toMatch(/^case_/);

      // 2. Chỉnh sửa metadata vụ án
      const titleInput = page.locator('input[type="text"]').first();
      await expect(titleInput).toBeVisible();
      await titleInput.fill("Trốn Tìm v2 (Studio Test)");

      const statusSelect = page.locator("select").first();
      await expect(statusSelect).toBeVisible();
      await statusSelect.selectOption("PUBLISHED");

      const saveCaseBtn = page.getByRole("button", { name: /Lưu thay đổi/i });
      await expect(saveCaseBtn).toBeVisible();
      await saveCaseBtn.click();
      await expect(
        page.getByText(/Đã cập nhật metadata vụ án thành công/i),
      ).toBeVisible({ timeout: 10_000 });

      // 3. Chuyển sang Character Studio để thêm nhân vật nạn nhân
      await page.goto(`/studio/characters?case=${createdSlug}`);
      await expect(page.locator("h1")).toContainText(/Nhân vật/i);

      const addCharBtn = page.getByRole("button", { name: /Thêm nhân vật/i });
      await expect(addCharBtn).toBeVisible();
      await addCharBtn.click();

      const nameInput = page.locator('label:has-text("Họ tên") input');
      await expect(nameInput).toBeVisible();
      await nameInput.fill("Nguyễn Văn Khang");

      const keyInput = page.locator('label:has-text("Mã") input');
      await expect(keyInput).toBeVisible();
      await keyInput.fill("khang");

      const roleSelect = page.locator('label:has-text("Vai trò") select');
      await expect(roleSelect).toBeVisible();
      await roleSelect.selectOption("victim");

      const saveCharBtn = page.getByRole("button", { name: /Tạo nhân vật|Lưu thay đổi/i });
      await expect(saveCharBtn).toBeVisible();
      await saveCharBtn.click();

      await expect(page.locator("aside").getByText("Nguyễn Văn Khang")).toBeVisible({
        timeout: 10_000,
      });

      // 4. Kiểm tra vụ án xuất hiện trên trang /activate
      await page.goto("/activate");
      const caseCard = page.getByText("Trốn Tìm v2 (Studio Test)");
      await expect(caseCard).toBeVisible({ timeout: 10_000 });

      // 5. Mở bàn điều tra của vụ án v2
      await page.goto(`/evidence/web?case_id=${createdSlug}`);
      await expect(page.locator('[data-experience-shell="web"]')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('[data-board-ready="true"]')).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      if (createdSlug) {
        try {
          await cleanupCaseTronTimV2(createdSlug);
        } catch {}
      }
    }
  });
});
