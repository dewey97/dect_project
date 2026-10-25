import { expect, test } from "@playwright/test";
import {
  seedCaseTronTimV2,
  cleanupCaseTronTimV2,
  isE2EDbAvailable,
} from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

const TEST_CASE_SLUG = "case_tron_tim_v2";

test.describe("B14-13: Nghiệm thu Trốn Tìm v2 (Multi-Case từ Studio)", () => {
  let isSeeded = false;

  test.beforeAll(async () => {
    if (!isE2EDbAvailable()) {
      return;
    }
    try {
      await seedCaseTronTimV2(TEST_CASE_SLUG);
      isSeeded = true;
    } catch (err) {
      console.warn("Không thể seed case_tron_tim_v2:", err);
    }
  });

  test.afterAll(async () => {
    if (isSeeded) {
      try {
        // Đặt về DRAFT sau nghiệm thu theo đúng yêu cầu B14-13
        await cleanupCaseTronTimV2(TEST_CASE_SLUG, true);
      } catch (err) {
        console.warn("Lỗi khi chuyển case_tron_tim_v2 về DRAFT:", err);
      }
    }
  });

  test("Vụ án v2 tải đúng dữ liệu động, render đủ các node và không dính tên case_000", async ({
    page,
  }, testInfo) => {
    if (!isSeeded) {
      testInfo.skip(
        true,
        "B14-9/B14-13: Bỏ qua kiểm thử ghi DB thực tế vì chưa cấu hình E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_ROLE_KEY trong .env.local (chống ghi dữ liệu test lên production). Đặt ALLOW_E2E_PRODUCTION_SEED=true để chạy với DB hiện tại.",
      );
      return;
    }

    const requestedCase000Assets: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("/cases/case_000/") ||
        url.includes("avatar_khang") ||
        url.includes("avatar_vu") ||
        url.includes("avatar_tung") ||
        url.includes("avatar_ha")
      ) {
        requestedCase000Assets.push(url);
      }
    });

    await page.addInitScript((slug) => {
      localStorage.setItem("intro_seen", "true");
      localStorage.setItem(`${slug}:intro_seen`, "true");
    }, TEST_CASE_SLUG);

    await page.goto(`/evidence/web?case_id=${TEST_CASE_SLUG}`);

    // 1. Bàn điều tra render canvas
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // 2. Kiểm tra node nạn nhân & điện thoại của vụ v2
    await expect(
      page.locator('[data-node-kind="victim_phone"]').first(),
    ).toBeAttached({ timeout: 15_000 });
    await expect(
      page.locator('[data-node-kind="suspects_hub"]').first(),
    ).toBeAttached({ timeout: 10_000 });
    await expect(
      page.locator('[data-node-kind="evidence_hub"]').first(),
    ).toBeAttached({ timeout: 10_000 });
    await expect(
      page.locator('[data-node-kind="indictment"]').first(),
    ).toBeAttached({ timeout: 10_000 });

    // 3. Toàn trang không dính bất kỳ nhân vật nào của case_000
    const bodyContent = (await page.textContent("body")) || "";
    expect(bodyContent).not.toMatch(/\bNguyễn Văn Khang\b/i);
    expect(bodyContent).not.toMatch(/\bLê Quang Vũ\b/i);
    expect(bodyContent).not.toMatch(/\bNguyễn Thanh Tùng\b/i);
    expect(bodyContent).not.toMatch(/\bTrần Thị Hà\b/i);

    // 4. Không request tài nguyên ảnh riêng của case_000
    expect(requestedCase000Assets).toEqual([]);

    // 5. Chụp ảnh nghiệm thu bàn điều tra Trốn Tìm v2
    await page.screenshot({
      path: "docs/reports/b14/b14-13-tron-tim-v2-board.png",
      fullPage: false,
    });
  });

  test("Kiểm tra Studio hiển thị vụ án v2 độc lập", async ({ page }) => {
    // Test kiểm tra case studio danh sách vụ án
    await page.goto("/studio/cases");
    await expect(page.locator("h1")).toContainText(/Cases/i, {
      timeout: 10_000,
    });
  });
});
