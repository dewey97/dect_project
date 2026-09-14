const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const brainDir = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\82554124-5d67-4512-ad90-d4c4e06c78b7';

  console.log('Testing Desktop Phone Rendering...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  desktopPage.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  desktopPage.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await desktopPage.goto('http://localhost:3000/evidence');
  await desktopPage.waitForTimeout(1000);

  // Click web mode if modal is open
  const webBtn = desktopPage.locator('button:has-text("TRẢI NGHIỆM TRÊN WEB")');
  if (await webBtn.isVisible()) {
    console.log('Clicking Web Experience...');
    await webBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  // Close phase unlocked modal if open
  const startBtn = desktopPage.locator('button:has-text("BẮT ĐẦU ĐIỀU TRA")');
  if (await startBtn.isVisible()) {
    console.log('Clicking Start Investigation...');
    await startBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  // Open FAB menu and click phone
  const fabBtn = desktopPage.locator('button[title="Menu thao tác nhanh"]');
  console.log('FAB button visible:', await fabBtn.isVisible());
  if (await fabBtn.isVisible()) {
    await fabBtn.click();
    await desktopPage.waitForTimeout(400);

    const phoneBtn = desktopPage.locator('text=Điện thoại nạn nhân');
    console.log('Phone option visible:', await phoneBtn.isVisible());
    if (await phoneBtn.isVisible()) {
      await phoneBtn.click();
      await desktopPage.waitForTimeout(1000);
    }
  }

  await desktopPage.screenshot({ path: path.join(brainDir, 'desktop_after_phone.png') });
  console.log('Saved desktop_after_phone.png');

  await desktopContext.close();
  await browser.close();
  console.log('Done!');
})();
