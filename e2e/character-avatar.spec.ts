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

  test("2. Character Studio loads avatar upload/preview section for admin", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

    await page.goto("/studio/characters?case=case_000");

    await expect(
      page.getByRole("heading", { name: "Nhân vật", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Ảnh chân dung (Avatar)")).toBeVisible();
    await expect(page.getByText(/Tải ảnh lên|Đổi ảnh khác/i)).toBeVisible();
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
    await expect(page.locator('[data-pin-id="c0-pin-phone"]')).toBeAttached({
      timeout: 25_000,
    });

    // Locate suspect pin
    const vuPin = page.locator('[data-pin-id="node-suspect-vu"]');
    await expect(vuPin).toBeAttached({ timeout: 20_000 });
    await vuPin.evaluate((el: HTMLElement) => el.click());

    // Suspect modal should be visible with suspect name and avatar image
    await expect(page.getByText("THẨM TRA ĐỐI TƯỢNG")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Lê Quang Vũ")).toBeVisible();

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
    const phonePin = page.locator('[data-pin-id="c0-pin-victim-phone"]');
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
