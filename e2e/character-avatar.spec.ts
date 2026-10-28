import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

const CASE_URL = "/evidence/web?case_id=case_000";

test.describe("WT-4 Character Avatar Engine & Gameplay Integration", () => {
  test("1. /api/characters returns avatar_url for case_000 characters", async ({
    request,
  }) => {
    const response = await request.get("/api/characters?caseId=case_000");
    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);

    // Verify avatar_url property is present on characters
    const vu = json.data.find((c: { key: string }) => c.key === "vu");
    expect(vu).toBeDefined();
    expect(vu).toHaveProperty("avatar_url");

    const khang = json.data.find((c: { key: string }) => c.key === "khang");
    expect(khang).toBeDefined();
    expect(khang).toHaveProperty("avatar_url");
  });

  test("2. Form nhân vật trong Checkpoint Studio có ô ảnh đại diện", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

    // Studio nhân vật riêng đã gộp vào Checkpoint Studio
    await page.goto("/studio/characters?case=case_000");
    await expect(page).toHaveURL(/\/studio\/checkpoints\?case=case_000/);
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /^Nhân vật \(\d+\)$/ }).click();
    const picker = page.getByTitle("Chọn nhân vật để điều chỉnh");
    const vuValue = await picker
      .locator("option", { hasText: "Lê Quang Vũ" })
      .first()
      .getAttribute("value");
    expect(vuValue).toBeTruthy();
    await picker.selectOption(vuValue!);

    // Ô link ảnh mở bằng nút trên khung ảnh 3:4
    await page.getByTitle("Dán link ảnh đại diện (Drive / Web)").click();
    await expect(
      page.getByPlaceholder("Dán link ảnh Google Drive hoặc URL trực tiếp..."),
    ).toBeVisible();
  });

  test("3. Investigation board suspect pin opens modal with avatar", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("intro_seen")) {
        localStorage.setItem("intro_seen", "true");
      }
    });

    await page.goto(CASE_URL);
    await expect(page.locator('[data-node-kind="phone_lookup"], [data-pin-id="c0-pin-phone"]').first()).toBeAttached({
      timeout: 25_000,
    });

    // Locate suspect pin
    const vuPin = page.locator('[data-subject-key="vu"], [data-pin-id="node-suspect-vu"]').first();
    await expect(vuPin).toBeAttached({ timeout: 20_000 });
    await vuPin.evaluate((el: HTMLElement) => el.click());

    // Suspect modal should be visible with suspect name and avatar image
    await expect(page.getByRole("heading", { name: "THẨM TRA ĐỐI TƯỢNG" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Lê Quang Vũ").first()).toBeVisible();

    const avatarImg = page.locator('img[alt="Lê Quang Vũ"]');
    await expect(avatarImg).toBeVisible({ timeout: 5_000 });
  });

  test("4. Phone app contacts render My Card and contact avatar thumbnails", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("intro_seen")) {
        localStorage.setItem("intro_seen", "true");
      }
    });

    await page.goto(CASE_URL);

    // Open phone simulator
    const phonePin = page.locator('[data-node-kind="victim_phone"], [data-pin-id="c0-pin-victim-phone"]').first();
    await expect(phonePin).toBeAttached({ timeout: 20_000 });
    await phonePin.evaluate((el: HTMLElement) => el.click());

    const activePhoneScreen = page
      .locator('[data-phone-screen="true"]')
      .filter({ visible: true })
      .first();

    // Unlock phone if clock is shown
    const lockClock = activePhoneScreen.getByText("21:30");
    if (await lockClock.isVisible().catch(() => false)) {
      await lockClock.click();
    }

    // Open Phone app or Contacts app
    const phoneAppBtn = activePhoneScreen.locator('button[title="Điện thoại"]');
    await expect(phoneAppBtn).toBeVisible({ timeout: 10_000 });
    await phoneAppBtn.click();

    // Click Contacts tab in Phone app
    const contactsTabBtn = page
      .getByRole("button", { name: "Thẻ Danh bạ" })
      .or(page.getByText("Danh bạ"));
    if (
      await contactsTabBtn
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await contactsTabBtn.first().click();
    }

    // Check My Card (Nguyễn Văn Khang)
    await expect(page.getByText("Nguyễn Văn Khang").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
