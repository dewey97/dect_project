import { expect, test } from "@playwright/test";

test.describe("B15-2: Khớp chính xác bị can theo nhân vật và không mặc định 'ha'", () => {
  const TEST_SLUG = "e2e_lan_case";

  test("Vụ án có nghi phạm Phạm Mai Lan (key lan): nhập Phạm Mai Lan phải giải quyết ra culprit = lan", async ({
    page,
  }) => {
    // 1. Mock API characters với nghi phạm Phạm Mai Lan (key: lan)
    await page.route("**/api/characters?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              case_slug: TEST_SLUG,
              key: "victim_k",
              name: "Nạn Nhân K",
              role: "victim",
              avatar_url: "/images/avatar_placeholder.svg",
            },
            {
              case_slug: TEST_SLUG,
              key: "lan",
              name: "Phạm Mai Lan",
              role: "suspect",
              avatar_url: "/images/avatar_placeholder.svg",
            },
          ],
        }),
      });
    });

    // 2. Mock API board-nodes có node indictment
    await page.route("**/api/board-nodes?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: `${TEST_SLUG}:victim:victim_k`,
              case_slug: TEST_SLUG,
              node_kind: "victim",
              title: "Nạn Nhân K",
              subject_key: "victim_k",
              slot_index: 0,
              config: {},
            },
            {
              id: `${TEST_SLUG}:indictment:cp_indictment`,
              case_slug: TEST_SLUG,
              node_kind: "indictment",
              title: "Bản Cáo Trạng Định Tội",
              checkpoint_id: "cp_indictment",
              slot_index: 1,
              config: {},
            },
          ],
        }),
      });
    });

    // 3. Mock server verify endpoint
    await page.route("**/api/checkpoints/verify", async (route) => {
      const body = route.request().postDataJSON();
      // Server grader so sánh chính xác sau normalize
      const isLan = (body?.suspect || "").toLowerCase().includes("lan");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          correct: isLan,
          feedback: isLan ? "Đúng đối tượng" : "Kết luận đối tượng chưa chính xác.",
        }),
      });
    });

    await page.addInitScript((slug) => {
      localStorage.setItem("intro_seen", "true");
      localStorage.setItem(`${slug}:intro_seen`, "true");
    }, TEST_SLUG);

    await page.goto(`/evidence/web?case_id=${TEST_SLUG}`);

    const indictmentPin = page.locator('[data-node-kind="indictment"]').first();
    await expect(indictmentPin).toBeAttached({ timeout: 15_000 });
    await indictmentPin.evaluate((el: HTMLElement) => el.click());

    // Modal Cáo Trạng phải mở
    const nameInput = page.getByPlaceholder("Nhập hoặc chọn tên bị can...");
    await expect(nameInput).toBeVisible({ timeout: 10_000 });

    // 4. Test trường hợp nhập tên không tồn tại (vd: "Thanh" hoặc "Nguyễn Không Khớp")
    await nameInput.fill("Thanh");
    const motiveBtn = page.locator("button").filter({ hasText: /Mâu thuẫn/i }).first();
    if (await motiveBtn.isVisible()) {
      await motiveBtn.click();
    }
    const clueInput = page.getByPlaceholder("Nhập mã chứng cứ (ví dụ", { exact: false });
    await clueInput.fill("C-01");

    const submitBtn = page.getByRole("button", { name: /ĐỀ NGHỊ TRUY TỐ/i });
    await submitBtn.click();

    // Phải báo lỗi nghi can không tồn tại, KHÔNG được lưu hay mặc định 'ha'
    await expect(
      page.getByText("Không tìm thấy nghi can phù hợp trong hồ sơ vụ án!", { exact: false }),
    ).toBeVisible({ timeout: 5_000 });

    const culpritBefore = await page.evaluate(
      (slug) =>
        localStorage.getItem(`${slug}::indictment_culprit`) ||
        localStorage.getItem(`${slug}:indictment_culprit`),
      TEST_SLUG,
    );
    expect(culpritBefore).toBeNull();

    // 5. Test trường hợp nhập đúng "Phạm Mai Lan"
    await nameInput.fill("Phạm Mai Lan");
    await submitBtn.click();

    // Kiểm tra kết quả ghi nhận đúng key 'lan', không bao giờ rơi về 'ha'
    await expect.poll(async () => {
      return await page.evaluate(
        (slug) =>
          localStorage.getItem(`${slug}::indictment_culprit`) ||
          localStorage.getItem(`${slug}:indictment_culprit`) ||
          localStorage.getItem("indictment_culprit"),
        TEST_SLUG,
      );
    }).toBe("lan");

    const isSolved = await page.evaluate(
      (slug) =>
        localStorage.getItem(`${slug}::indictment_solved`) ||
        localStorage.getItem(`${slug}:indictment_solved`) ||
        localStorage.getItem("indictment_solved"),
      TEST_SLUG,
    );
    expect(isSolved).toBe("true");
  });
});
