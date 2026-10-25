import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local optional
}

const AUTH_FILE = "e2e/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  // Ensure directory exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  if (!email || !password) {
    // Write empty storage state so specs referencing it do not fail with ENOENT
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  await page.goto("/login");
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.locator('form button[type="submit"]:has-text("Đăng Nhập")').click();

  // Wait for login to complete (URL leaves /login)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });

  await page.context().storageState({ path: AUTH_FILE });
});
