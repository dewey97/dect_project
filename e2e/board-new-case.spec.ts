import { expect, test } from "@playwright/test";
import { seedTestCase, deleteTestCase, cleanupE2ECases, isE2EDbAvailable } from "./helpers/db-admin";

const TEST_CASE_SLUG = `e2e_${Date.now()}`;

test.describe("B12-6: Dynamic New Case Board (Isolated Workspace)", () => {
  let isSeeded = false;

  test.beforeAll(async () => {
    if (!isE2EDbAvailable()) {
      return;
    }
    try {
      // Dọn mọi case e2e cũ nếu có và seed case mới
      await cleanupE2ECases("e2e_");
      await seedTestCase(TEST_CASE_SLUG, "Vụ Án Bí Ẩn Test Board");
      isSeeded = true;
    } catch (err) {
      console.warn("Không thể seed database cho board-new-case test:", err);
    }
  });

  test.afterAll(async () => {
    if (isSeeded) {
      try {
        await deleteTestCase(TEST_CASE_SLUG);
      } catch (err) {
        console.warn("Lỗi khi cleanup board-new-case test:", err);
      }
    }
  });

  test("Bàn điều tra vụ mới render đúng nhân vật, không dính tên hay ảnh case_000", async ({
    page,
  }, testInfo) => {
    if (!isSeeded) {
      testInfo.skip(
        true,
        "B14-9: Bỏ qua vì chưa cấu hình E2E_SUPABASE_URL / E2E_SUPABASE_SERVICE_ROLE_KEY trong .env.local (chống ghi dữ liệu test lên production). Đặt ALLOW_E2E_PRODUCTION_SEED=true để cho phép ghi tạm.",
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

    // Bàn điều tra render canvas
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });

    // Kiểm tra các node được tạo cho vụ mới hiện diện trong DOM điều hướng
    await expect(
      page.locator('[data-node-kind="victim_phone"]').first(),
    ).toBeAttached({ timeout: 15_000 });
    await expect(
      page.locator('[data-node-kind="suspects_hub"]').first(),
    ).toBeAttached({ timeout: 10_000 });
    await expect(
      page.locator('[data-node-kind="indictment"]').first(),
    ).toBeAttached({ timeout: 10_000 });

    // Kiểm tra không request ảnh của case_000
    expect(requestedCase000Assets).toEqual([]);

    // Kiểm tra toàn trang không có các tên nhân vật của case_000
    const bodyContent = (await page.textContent("body")) || "";
    expect(bodyContent).not.toMatch(/\bNguyễn Văn Khang\b/i);
    expect(bodyContent).not.toMatch(/\bLê Quang Vũ\b/i);
    expect(bodyContent).not.toMatch(/\bNguyễn Thanh Tùng\b/i);
    expect(bodyContent).not.toMatch(/\bTrần Thị Hà\b/i);
  });
});
