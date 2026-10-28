import { expect, test } from "@playwright/test";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("Evidence Studio & Case Evidence Engine", () => {
  test("/studio/evidence chuyển sang Dossier Studio; mở và đóng cấu hình Hiện Trường 360", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

    // Evidence Studio đã gộp vào Dossier Studio
    await page.goto("/studio/evidence?case=case_000");
    await expect(page).toHaveURL(/\/studio\/dossier\?case=case_000/);
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.getByTitle("Thêm chứng cứ / ảnh / mục khác"),
    ).toBeVisible();

    await page
      .getByTitle("Xem & Cấu hình không gian Khám xét Hiện trường 360")
      .click();
    await expect(
      page.getByText("Cấu hình Hiện Trường 360 & Panorama"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("Case_000 evidence tray loads documents and evidence items in game", async ({
    page,
  }) => {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
      localStorage.setItem("case_000:intro_seen", "true");
    });

    await page.route("**/api/scan-answer", (route) =>
      route.fulfill({
        json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
      }),
    );

    await page.goto("/evidence/web?case_id=case_000");

    // Board canvas should attach
    await expect(page.locator('[data-pin-id="c0-pin-phone"], [data-node-kind="phone_lookup"]').first()).toBeAttached();

    // Check evidence header / tray has document items
    await expect(page.locator("body")).toContainText(
      "Cẩm nang hướng dẫn điều tra ban đầu",
    );

    // B14-1: Chọn tài liệu A-01 -> khung giữa hiển thị tiêu đề và breadcrumb
    // Migration 47 bỏ gạch nối trong mã tài liệu: A-01 -> A01.
    const a01Item = page.getByText(/^A-?01$/).filter({ visible: true }).first();
    await a01Item.click();
    await expect(
      page.locator('[data-testid="evidence-inspector-breadcrumb"]'),
    ).toContainText("Cẩm nang hướng dẫn điều tra ban đầu");
    await expect(
      page.locator("h1:has-text('Cẩm nang hướng dẫn điều tra ban đầu')"),
    ).toBeVisible();
  });

  test("Form vật chứng trong Dossier Studio không còn trường lưu ký cũ", async ({
    page,
  }, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Thiếu biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }

    await page.goto("/studio/dossier?case=case_000");
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTitle("Thêm chứng cứ / ảnh / mục khác").click();

    // Form vật chứng hiện ra với các ô chính
    await expect(page.getByPlaceholder("VD: A01, B02...")).toBeVisible();
    await expect(
      page.getByPlaceholder("VD: Ảnh mảnh bình vỡ, Sổ ghi nợ, Bài báo cũ 1996..."),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Mô tả chi tiết vật chứng...")).toBeVisible();

    // 4 trường lưu ký cũ đã bỏ
    await expect(page.getByText("Mã vật chứng pháp lý")).toHaveCount(0);
    await expect(page.getByText("Thời điểm ghi nhận")).toHaveCount(0);
    await expect(page.getByText("Người thu thập")).toHaveCount(0);
    await expect(page.getByText("Trạng thái niêm phong")).toHaveCount(0);
  });
});
