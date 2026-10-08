import { test, expect } from "@playwright/test";
import path from "path";

const testResultsDir = path.resolve(process.cwd(), "test-results");

test("Test Desktop Phone Layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.addInitScript(() => {
    localStorage.setItem("play_experience", "web");
    localStorage.setItem("investigation_mode", "casual");
    localStorage.setItem(
      "completed_checkpoints",
      JSON.stringify(["cp-01-01"]),
    );
  });

  await page.goto("http://localhost:3000/evidence");
  await page.waitForTimeout(1000);

  // Click on "CHƠI HOÀN TOÀN TRÊN WEB" if PlayModeModal is open
  const webModeBtn = page.locator('button:has-text("CHƠI HOÀN TOÀN TRÊN WEB")');
  if (await webModeBtn.isVisible()) {
    await webModeBtn.click();
    await page.waitForTimeout(500);
  }

  // Close PhaseUnlockedModal if open
  const closePhaseBtn = page.locator(
    'button:has-text("BẮT ĐẦU ĐIỀU TRA GIAI ĐOẠN 0")',
  );
  if (await closePhaseBtn.isVisible()) {
    await closePhaseBtn.click();
    await page.waitForTimeout(500);
  }

  // Directly trigger open-phone-modal event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("open-phone-modal"));
  });

  await page.waitForTimeout(1500);

  // Take screenshot of desktop phone modal into local test-results
  await page.screenshot({
    path: path.join(testResultsDir, "desktop_layout.png"),
  });
});

test("Test Mobile Phone Layout", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.addInitScript(() => {
    localStorage.setItem("play_experience", "web");
    localStorage.setItem("investigation_mode", "casual");
    localStorage.setItem(
      "completed_checkpoints",
      JSON.stringify(["cp-01-01"]),
    );
  });

  await page.goto("http://localhost:3000/evidence");
  await page.waitForTimeout(1000);

  // Click on "CHƠI HOÀN TOÀN TRÊN WEB" if PlayModeModal is open
  const webModeBtn = page.locator('button:has-text("CHƠI HOÀN TOÀN TRÊN WEB")');
  if (await webModeBtn.isVisible()) {
    await webModeBtn.click();
    await page.waitForTimeout(500);
  }

  // Close PhaseUnlockedModal if open
  const closePhaseBtn = page.locator(
    'button:has-text("BẮT ĐẦU ĐIỀU TRA GIAI ĐOẠN 0")',
  );
  if (await closePhaseBtn.isVisible()) {
    await closePhaseBtn.click();
    await page.waitForTimeout(500);
  }

  // Directly trigger open-phone-modal event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("open-phone-modal"));
  });

  await page.waitForTimeout(1500);

  // Take screenshot of mobile phone layout into local test-results
  await page.screenshot({
    path: path.join(testResultsDir, "mobile_layout.png"),
  });
});
