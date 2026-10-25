import { expect, test } from "@playwright/test";

const CASE_URL = "/evidence/web?case_id=case_000";

test.describe("No Google Sheets Runtime (WT-6 / CMS Cutover)", () => {
  test("Supabase /api/phone-data serves all tabs including evidences", async ({
    page,
  }) => {
    const tabs = [
      "evidences",
      "notes",
      "browser",
      "bank",
      "photos",
      "messages",
      "calls",
      "contacts",
    ];

    for (const tab of tabs) {
      const res = await page.request.get(
        `/api/phone-data/${tab}?caseId=case_000`,
      );
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.source).toBe("supabase");
      expect(Array.isArray(json.data)).toBe(true);

      if (tab === "evidences") {
        expect(json.data.length).toBeGreaterThan(0);
        const first = json.data[0];
        expect(first).toHaveProperty("code");
        expect(first).toHaveProperty("title");
        expect(first).toHaveProperty("url");
      }
    }
  });

  test("Game & Phone Simulator run cleanly with Google blocked", async ({
    page,
  }) => {
    const interceptedGoogleCalls: string[] = [];
    const interceptedLegacyPhoneCalls: string[] = [];

    // Block Google Sheets APIs and Docs Spreadsheets (B12-7)
    await page.route(
      /.*(sheets\.googleapis\.com|docs\.google\.com\/spreadsheets|spreadsheets\.google\.com).*/,
      (route) => {
        interceptedGoogleCalls.push(route.request().url());
        return route.abort("blockedbyclient");
      },
    );

    // Track any deprecated /api/phone runtime calls
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/phone?")) {
        interceptedLegacyPhoneCalls.push(url);
      }
    });

    // Skip intro modal
    await page.addInitScript(() => {
      if (!localStorage.getItem("intro_seen")) {
        localStorage.setItem("intro_seen", "true");
      }
    });

    await page.goto(CASE_URL);

    // Wait for investigation canvas
    const phonePin = page
      .locator(
        '[data-node-kind="victim_phone"], [data-pin-id="c0-pin-victim-phone"]',
      )
      .first();
    await expect(phonePin).toBeAttached({ timeout: 20_000 });
    await phonePin.evaluate((el: HTMLElement) => el.click());

    // Check phone simulator opens in Zone 3
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

    const homeBtn = page.locator('[data-touch-id-btn="true"]').first();

    // 1. Test Ghi chú (notes-app -> phone_notes)
    const notesAppBtn = activePhoneScreen.locator('button[title="Ghi chú"]');
    await expect(notesAppBtn).toBeVisible({ timeout: 5_000 });
    await notesAppBtn.click();
    await expect(activePhoneScreen.getByText("Ghi chú").first()).toBeVisible({
      timeout: 5_000,
    });
    // Return to home via physical Home button
    if (await homeBtn.isVisible().catch(() => false)) {
      await homeBtn.click();
    }

    // 2. Test Safari (safari-app -> phone_browser_history)
    const safariAppBtn = activePhoneScreen.locator('button[title="Safari"]');
    await expect(safariAppBtn).toBeVisible({ timeout: 5_000 });
    await safariAppBtn.click();
    await expect(
      activePhoneScreen
        .getByText("Lịch sử duyệt web")
        .or(activePhoneScreen.getByText("Lịch sử trống"))
        .first(),
    ).toBeVisible({ timeout: 5_000 });
    // Return to home via physical Home button
    if (await homeBtn.isVisible().catch(() => false)) {
      await homeBtn.click();
    }

    // 3. Test Ngân hàng (banking-app -> phone_bank_transactions)
    const bankAppBtn = activePhoneScreen.locator('button[title="Ngân hàng"]');
    if (await bankAppBtn.isVisible().catch(() => false)) {
      await bankAppBtn.click();
      await expect(
        activePhoneScreen.getByText("DIGIBANK PLUS").first(),
      ).toBeVisible({
        timeout: 5_000,
      });
      if (await homeBtn.isVisible().catch(() => false)) {
        await homeBtn.click();
      }
    }

    // 4. Test Ảnh (photos-app -> phone_photos / case_evidence)
    const photosAppBtn = activePhoneScreen.locator('button[title="Ảnh"]');
    if (await photosAppBtn.isVisible().catch(() => false)) {
      await photosAppBtn.click();
      await expect(
        activePhoneScreen
          .getByText("Ảnh vật chứng")
          .or(activePhoneScreen.getByText("Ảnh"))
          .or(activePhoneScreen.getByText("Thư viện"))
          .first(),
      ).toBeVisible({ timeout: 5_000 });
      if (await homeBtn.isVisible().catch(() => false)) {
        await homeBtn.click();
      }
    }

    // Ensure zero runtime calls were made to Sheets or deprecated /api/phone
    expect(interceptedGoogleCalls).toHaveLength(0);
    expect(interceptedLegacyPhoneCalls).toHaveLength(0);
  });
});
