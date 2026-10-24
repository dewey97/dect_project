import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Phone Devices & Presets (WT-2)", () => {
  test("Runtime phone simulator renders chassis with valid preset on Case #000", async ({
    page,
  }) => {
    // Skip intro modal
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.goto("/evidence/web?case_id=case_000");

    // Click phone pin
    const phonePin = page.locator('[data-pin-id="c0-pin-victim-phone"]');
    await expect(phonePin).toBeAttached({ timeout: 20_000 });
    await phonePin.evaluate((el: HTMLElement) => el.click());

    // Verify phone frame renders
    const frame = page.locator('[data-iphone-frame="true"]').first();
    await expect(frame).toBeVisible({ timeout: 15_000 });

    // Chassis should have data-model-id and valid bezel
    const modelId = await frame.getAttribute("data-model-id");
    expect(modelId).toBeTruthy();

    const bezelKind = await frame.getAttribute("data-bezel-kind");
    expect(["touch_id", "notch", "dynamic_island"]).toContain(bezelKind);
  });

  test("Runtime MessagesApp renders threads and normalized message bubbles", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.goto("/evidence/web?case_id=case_000");

    const phonePin = page.locator('[data-pin-id="c0-pin-victim-phone"]');
    await expect(phonePin).toBeAttached({ timeout: 20_000 });
    await phonePin.evaluate((el: HTMLElement) => el.click());

    const activePhoneScreen = page
      .locator('[data-phone-screen="true"]')
      .filter({ visible: true })
      .first();
    await expect(activePhoneScreen).toBeVisible({ timeout: 15_000 });

    // Unlock if lock screen clock visible
    const lockClock = activePhoneScreen.getByText("21:30");
    if (await lockClock.isVisible().catch(() => false)) {
      await lockClock.click();
    }

    // Open Messages app
    const msgAppBtn = activePhoneScreen.locator('button[title="Tin nhắn"]');
    await expect(msgAppBtn).toBeVisible({ timeout: 5_000 });
    await msgAppBtn.click();

    // Verify messages header and thread list
    await expect(activePhoneScreen.getByText("Tin nhắn").first()).toBeVisible();

    // Verify at least 1 message thread row exists
    const threadRow = activePhoneScreen
      .locator(
        '[data-evidence-code^="MSG-"], button:has-text("Khang"), button:has-text("Hà"), button:has-text("Tùng"), button:has-text("Vũ")',
      )
      .first();
    await expect(threadRow).toBeVisible({ timeout: 15_000 });
  });

  test("Phone Studio live preview updates chassis when switching presets", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Cần biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
      return;
    }

    await page.goto("/studio/phone?case=case_000");

    // Make sure Thiết bị tab is active
    const deviceTab = page.getByRole("tab", { name: /Thiết bị/i });
    if (await deviceTab.isVisible()) {
      await deviceTab.click();
    }

    const select = page.locator('[data-testid="device-preset-select"]');
    await expect(select).toBeVisible({ timeout: 10_000 });

    // 1. Switch to iPhone 15 (Dynamic Island)
    await select.selectOption("iphone_15");
    const previewFrame = page
      .locator('[data-iphone-frame="true"]')
      .filter({ visible: true })
      .first();
    await expect(previewFrame).toHaveAttribute("data-model-id", "iphone_15", {
      timeout: 5_000,
    });
    await expect(previewFrame).toHaveAttribute(
      "data-bezel-kind",
      "dynamic_island",
    );
    await expect(
      previewFrame.locator('[data-dynamic-island="true"]'),
    ).toBeVisible();

    // 2. Switch to iPhone 13 (Notch)
    await select.selectOption("iphone_13");
    await expect(previewFrame).toHaveAttribute("data-model-id", "iphone_13");
    await expect(previewFrame).toHaveAttribute("data-bezel-kind", "notch");
    await expect(previewFrame.locator('[data-notch="true"]')).toBeVisible();

    // 3. Switch to iPhone SE (Touch ID)
    await select.selectOption("iphone_se");
    await expect(previewFrame).toHaveAttribute("data-model-id", "iphone_se");
    await expect(previewFrame).toHaveAttribute("data-bezel-kind", "touch_id");
    await expect(
      previewFrame.locator('[data-touch-id-btn="true"]'),
    ).toBeVisible();
  });
});
