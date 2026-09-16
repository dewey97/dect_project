import { test, expect } from '@playwright/test';

test('Test Desktop Phone Layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/evidence');
  await page.waitForTimeout(1500);

  // Click web mode if modal is open
  const webBtn = page.locator('button:has-text("TRẢI NGHIỆM TRÊN WEB")');
  if (await webBtn.isVisible()) {
    await webBtn.click();
    await page.waitForTimeout(500);
  }

  // Open FAB menu and click phone
  const fabBtn = page.locator('button[title="Menu thao tác nhanh"]');
  if (await fabBtn.isVisible()) {
    await fabBtn.click();
    await page.waitForTimeout(300);
    const phoneBtn = page.locator('text=Điện thoại nạn nhân');
    if (await phoneBtn.isVisible()) {
      await phoneBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  await page.screenshot({ path: 'C:/Users/Dell/.gemini/antigravity/brain/82554124-5d67-4512-ad90-d4c4e06c78b7/desktop_layout.png' });
});

test('Test Mobile Phone Layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000/evidence');
  await page.waitForTimeout(1500);

  // Click web mode if modal is open
  const webBtn = page.locator('button:has-text("TRẢI NGHIỆM TRÊN WEB")');
  if (await webBtn.isVisible()) {
    await webBtn.click();
    await page.waitForTimeout(500);
  }

  // Open FAB menu and click phone
  const fabBtn = page.locator('button[title="Menu thao tác nhanh"]');
  if (await fabBtn.isVisible()) {
    await fabBtn.click();
    await page.waitForTimeout(300);
    const phoneBtn = page.locator('text=Điện thoại nạn nhân');
    if (await phoneBtn.isVisible()) {
      await phoneBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  await page.screenshot({ path: 'C:/Users/Dell/.gemini/antigravity/brain/82554124-5d67-4512-ad90-d4c4e06c78b7/mobile_layout.png' });
});
