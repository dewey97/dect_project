import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("WT-3 Studio UX & Form Polish", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("1. Checkpoint Studio loads and contains no forbidden technical labels", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");

    // Header should be visible
    await expect(page.getByText("Checkpoint Studio")).toBeVisible({
      timeout: 15_000,
    });

    // Content should not show raw technical database keys as labels
    const content = await page.textContent("body");
    expect(content).not.toBeNull();

    // Verify forbidden labels are not present in visible text
    expect(content).not.toMatch(/\bslot_index\b/i);
    expect(content).not.toMatch(/\bsubjectKey\b/);
    expect(content).not.toMatch(/\bfollowupOf\b/);
    expect(content).not.toMatch(/\bID:\s+[a-z0-9_-]+/i);
  });

  test("2. All input and textarea placeholders in studio are concise (<= 60 chars)", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(page.getByText("Checkpoint Studio")).toBeVisible({
      timeout: 15_000,
    });

    // Collect all inputs and textareas with placeholder
    const inputs = page.locator("input[placeholder], textarea[placeholder]");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const placeholder = await inputs.nth(i).getAttribute("placeholder");
      if (placeholder) {
        expect(
          placeholder.length,
          `Placeholder "${placeholder}" is too long (${placeholder.length} chars > 60 chars)`,
        ).toBeLessThanOrEqual(60);
      }
    }
  });

  test("3. Auto-grow textarea expands height when multiple lines are typed", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(page.getByText("Checkpoint Studio")).toBeVisible({
      timeout: 15_000,
    });

    // Locate the first editable textarea in the form
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();

    const initialBox = await textarea.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialHeight = initialBox!.height;

    // Type 6 lines of text
    const multilineText = "Dòng 1\nDòng 2\nDòng 3\nDòng 4\nDòng 5\nDòng 6";
    await textarea.fill(multilineText);

    // Height should expand
    const expandedBox = await textarea.boundingBox();
    expect(expandedBox).not.toBeNull();
    expect(expandedBox!.height).toBeGreaterThan(initialHeight);
  });

  test("4. chọn nghi phạm trong dropdown nhân vật mở form thẩm tra gắn với nhân vật đó", async ({
    page,
  }) => {
    await page.goto("/studio/checkpoints?case=case_000");
    await expect(
      page.locator('[data-studio-ready="true"]').first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    // Thẩm tra gắn với nhân vật (subject_key = key nhân vật), không còn ô chọn
    // "Nhân vật liên quan" trong form checkpoint.
    await page.getByRole("button", { name: /^Nhân vật \(\d+\)$/ }).click();
    const picker = page.getByTitle("Chọn nhân vật để điều chỉnh");
    await expect(picker).toBeVisible();
    const suspectValue = await picker
      .locator("option", { hasText: "(Nghi phạm)" })
      .first()
      .getAttribute("value");
    expect(suspectValue).toBeTruthy();
    await picker.selectOption(suspectValue!);
    await expect(picker).toHaveValue(suspectValue!);

    await expect(
      page.getByText("Vật chứng bắt buộc (chứng minh động cơ)").first(),
    ).toBeVisible();
    // Form thẩm tra 2 lớp: chuyển sang tab "Mâu thuẫn lời khai".
    await page.getByRole("button", { name: "Mâu thuẫn lời khai" }).first().click();
    await expect(
      page.getByText("Vật chứng bắt buộc (chứng minh mâu thuẫn)").first(),
    ).toBeVisible();
  });

  test("5. Cases list does not render raw 'ID: ' prefix", async ({ page }) => {
    await page.goto("/studio/cases");
    await expect(page.getByRole("heading", { name: "Cases" })).toBeVisible({
      timeout: 15_000,
    });

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toBeNull();
    expect(bodyText).not.toMatch(/\bID:\s+[a-z0-9_-]+/i);
  });
});
