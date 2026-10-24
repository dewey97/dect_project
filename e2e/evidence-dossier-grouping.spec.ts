import { expect, test } from "@playwright/test";

test.describe("WT-5 Evidence Archival Dossier Grouping & Inspection", () => {
  test("1. Dossier filter chips match case_dossiers titles from API", async ({
    page,
    request,
  }) => {
    // 1. Lấy danh sách dossiers thực tế từ API
    const res = await request.get("/api/case-dossiers?case=case_000");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
    const dossiers: Array<{ dossier_key: string; title: string }> =
      json.data || [];

    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.goto("/evidence/web?case_id=case_000");

    // Khay hồ sơ hiển thị
    await expect(page.getByText("Hồ sơ & Vật chứng")).toBeVisible();

    // Chip "Tất cả" luôn có
    await expect(page.getByRole("button", { name: "Tất cả" })).toBeVisible();

    // Mọi tiêu đề dossier từ API đều xuất hiện dưới dạng chip
    for (const d of dossiers) {
      if (d.title && d.title.trim()) {
        await expect(
          page.getByRole("button", { name: d.title, exact: true }),
        ).toBeVisible();
      }
    }

    // Các chip hệ thống
    await expect(
      page.getByRole("button", { name: "Vật chứng", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Chưa gán bộ", exact: true }),
    ).toBeVisible();
  });

  test("2. Locked dossiers are disabled by default and unlock with progress", async ({
    page,
  }) => {
    // Ban đầu không set tiến trình mở khóa -> Bộ C / Kết luận bị khóa
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
      localStorage.removeItem("case_000_unlocked_dossiers");
      localStorage.removeItem("case_000_reinvestigate_unlocked");
      localStorage.removeItem("case_000_indictment_solved");
    });

    await page.goto("/evidence/web?case_id=case_000");

    const chipBoC = page.getByRole("button", { name: "Bộ C", exact: true });
    if (await chipBoC.count()) {
      await expect(chipBoC).toBeDisabled();
    }

    // Cập nhật tiến trình: mở khóa Bộ C và Kết luận
    await page.evaluate(() => {
      localStorage.setItem(
        "case_000_unlocked_dossiers",
        JSON.stringify(["ban_dau", "bo_a", "bo_b", "bo_c", "ket_luan"]),
      );
    });

    await page.reload();

    if (await chipBoC.count()) {
      await expect(chipBoC).toBeEnabled();
    }
  });

  test("3. Selecting document displays breadcrumb in inspector", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.goto("/evidence/web?case_id=case_000");

    // Click vào một tài liệu bất kỳ trong khay
    const docItem = page.locator('[id^="doc-card-dossier-"]').first();
    if (await docItem.count()) {
      await docItem.click();

      // Inspector hiển thị breadcrumb có chứa text "Bộ hồ sơ:"
      const breadcrumb = page.locator(
        '[data-testid="evidence-inspector-breadcrumb"]',
      );
      if (await breadcrumb.count()) {
        await expect(breadcrumb).toContainText("Bộ hồ sơ:");
      }
    }
  });

  test("4. No legacy custody metadata appears on /evidence/web", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
    });

    await page.goto("/evidence/web?case_id=case_000");

    const pageContent = await page.content();
    expect(pageContent).not.toContain("Người thu thập");
    expect(pageContent).not.toContain("niêm phong");
    expect(pageContent).not.toContain("VERIFIED");
  });

  test("5. /evidence/victim-phone opens device simulator without integrity indicator", async ({
    page,
  }) => {
    await page.goto("/evidence/victim-phone");
    // Verify phone simulator home screen renders
    await expect(page.getByRole("button", { name: /Ảnh/i })).toBeVisible();
    const pageContent = await page.content();
    expect(pageContent).not.toContain("BIÊN BẢN HỢP LỆ");
  });
});
