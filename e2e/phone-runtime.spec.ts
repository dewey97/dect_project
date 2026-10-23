import { expect, test } from "@playwright/test";

const CASE_URL = "/evidence/web?case_id=case_000";

const EXPECTED_APPS = [
  "Ảnh",
  "Camera",
  "Bản đồ",
  "Ghi chú",
  "Ngân hàng",
  "Flappy Bird",
  "Xếp Gạch",
  "Snake '97",
  "2048",
  "Dò Mìn",
  "Cài đặt",
  "Điện thoại",
  "Tin nhắn",
  "Danh bạ",
  "Safari",
];

test.describe("Phone Runtime — Case #000 (P28)", () => {
  test("Home screen shows 15 apps and Messages has at least 1 thread", async ({
    page,
  }) => {
    // Skip intro dialog
    await page.addInitScript(() => {
      if (!localStorage.getItem("intro_seen")) {
        localStorage.setItem("intro_seen", "true");
      }
    });

    await page.goto(CASE_URL);

    // Wait for investigation canvas to be ready
    const phonePin = page.locator('[data-pin-id="c0-pin-victim-phone"]');
    await expect(phonePin).toBeAttached({ timeout: 20_000 });
    await phonePin.evaluate((el: HTMLElement) => el.click());

    // Check phone simulator title in Zone 3
    await expect(page.getByText("Điện thoại nạn nhân").first()).toBeVisible({
      timeout: 10_000,
    });

    const activePhoneScreen = page
      .locator('[data-phone-screen="true"]')
      .filter({ visible: true })
      .first();

    // If lock screen is shown, click to unlock
    const lockClock = activePhoneScreen.getByText("21:30");
    if (await lockClock.isVisible().catch(() => false)) {
      await lockClock.click();
    }

    // Verify all 15 apps are rendered on home screen
    for (const appName of EXPECTED_APPS) {
      const appBtn = activePhoneScreen.locator(`button[title="${appName}"]`);
      await expect(appBtn).toBeVisible({ timeout: 5_000 });
    }

    // Open Messages app
    await activePhoneScreen.locator('button[title="Tin nhắn"]').click();

    // Verify Messages header
    await expect(activePhoneScreen.getByText("Tin nhắn").first()).toBeVisible();

    // Verify at least 1 message thread row exists
    await expect(
      activePhoneScreen.locator('[data-evidence-code^="MSG-"]').first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
