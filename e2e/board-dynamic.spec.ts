import { test, expect } from '@playwright/test';

test.describe('Dynamic Board and Read-only Gameplay', () => {
  test('gameplay board should not display admin move/setup controls', async ({ page }) => {
    // Navigate to gameplay evidence page
    await page.goto('/evidence/web?case_id=case_000');

    // Wait for the board container or canvas to load
    await page.waitForLoadState('networkidle');

    // Verify admin edit/setup button does NOT exist on the canvas toolbar
    const editMoveButton = page.locator('button:has-text("Bật chế độ di chuyển")');
    await expect(editMoveButton).toHaveCount(0);

    const setupNodeButton = page.locator('button:has-text("Setup Node")');
    await expect(setupNodeButton).toHaveCount(0);

    const addPinButton = page.locator('button:has-text("Thêm Ghim")');
    await expect(addPinButton).toHaveCount(0);
  });

  test('no request should be made to legacy clue_notes folder', async ({ page }) => {
    const legacyRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/clue_notes/')) {
        legacyRequests.push(url);
      }
    });

    await page.goto('/evidence/web?case_id=case_000');
    await page.waitForLoadState('networkidle');

    expect(legacyRequests).toHaveLength(0);
  });
});
