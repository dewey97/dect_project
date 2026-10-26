import { defineConfig, devices } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local optional
}

const PORT = Number(process.env.E2E_PORT || process.env.PORT || 3101);

/**
 * E2E gameplay. Chạy: `pnpm test:e2e`.
 * Dev server riêng dùng distDir `.next_dev` (đã gitignore) để không đụng
 * cache `.next` của dev server đang chạy ở cổng 3000.
 */
export default defineConfig({
  globalSetup: "./e2e/helpers/global-setup.ts",
  globalTeardown: "./e2e/helpers/global-teardown.ts",
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `node scripts/ops/ensure-e2e-port.mjs && node node_modules/next/dist/bin/next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    env: {
      NEXT_DIST_DIR: ".next_dev",
      ...(process.env.E2E_SUPABASE_URL
        ? {
            NEXT_PUBLIC_SUPABASE_URL: process.env.E2E_SUPABASE_URL,
            SUPABASE_URL: process.env.E2E_SUPABASE_URL,
            ...(process.env.E2E_SUPABASE_ANON_KEY
              ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.E2E_SUPABASE_ANON_KEY }
              : {}),
            ...(process.env.E2E_SUPABASE_SERVICE_ROLE_KEY
              ? { SUPABASE_SERVICE_ROLE_KEY: process.env.E2E_SUPABASE_SERVICE_ROLE_KEY }
              : {}),
          }
        : {}),
    },
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
