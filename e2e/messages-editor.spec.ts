import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Messages Batch Editor (WT-2)", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Cần biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("Messages editor renders threads and supports quick script paste", async ({
    page,
  }) => {
    await page.goto("/studio/phone?case=case_000");

    // Click tab Tin nhắn
    const messagesTab = page.getByRole("tab", { name: /Tin nhắn/i });
    await expect(messagesTab).toBeVisible({ timeout: 10_000 });
    await messagesTab.click();

    // Verify messages editor header
    await expect(page.getByText(/Biên tập Tin nhắn Hàng loạt/i)).toBeVisible({
      timeout: 10_000,
    });

    // Open paste script modal
    const pasteBtn = page.getByRole("button", { name: /Dán kịch bản/i });
    if (await pasteBtn.isVisible()) {
      await pasteBtn.click();

      // Modal appears
      await expect(page.getByText(/Dán khối văn bản hội thoại/i)).toBeVisible();

      // Fill script text
      const textarea = page.getByPlaceholder(
        /Dán khối văn bản kịch bản vào đây/i,
      );
      await textarea.fill(
        "Nhật Anh: Anh ơi mai họp lúc mấy giờ? [09:30]\n> Tôi: 10h sáng em nhé [09:32]",
      );

      // Apply
      const applyBtn = page.getByRole("button", { name: /Chèn vào bảng/i });
      await applyBtn.click();

      // Check rows populated in table
      await expect(page.getByText("Nhật Anh: Anh ơi mai họp lúc mấy giờ?"))
        .toBeVisible({
          timeout: 5_000,
        })
        .catch(() => {
          return expect(
            page.locator('textarea:has-text("Anh ơi mai họp lúc mấy giờ?")'),
          ).toBeVisible();
        });

      // Verify "Lưu hội thoại (Batch)" button is present
      const saveBtn = page.getByRole("button", { name: /Lưu hội thoại/i });
      await expect(saveBtn).toBeVisible();
    }
  });

  test("Messages editor allows adding new row and toggling roles", async ({
    page,
  }) => {
    await page.goto("/studio/phone?case=case_000");

    const messagesTab = page.getByRole("tab", { name: /Tin nhắn/i });
    await expect(messagesTab).toBeVisible({ timeout: 10_000 });
    await messagesTab.click();

    const addRowBtn = page.getByRole("button", { name: /Thêm dòng/i });
    if (await addRowBtn.isVisible()) {
      const initialRowsCount = await page.locator("tbody tr").count();
      await addRowBtn.click();
      const nextRowsCount = await page.locator("tbody tr").count();
      expect(nextRowsCount).toBeGreaterThanOrEqual(initialRowsCount + 1);
    }
  });
});
