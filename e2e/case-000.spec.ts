import { expect, test, type Page } from "@playwright/test";

/**
 * Baseline E2E cho case_000 (bước B1 trong docs/HANDOFF_ROADMAP.md).
 * Khóa hành vi hiện tại trước khi refactor checkpoint theo `kind` và chuyển
 * chấm điểm lên server. Đáp án lấy từ `case_checkpoints` của case_000.
 *
 * - Chấm AI (`/api/test-scan-answer`) được mock để test không gọi Gemini.
 * - Ghim vẽ trên canvas; test bấm qua danh sách nút `[data-pin-id]` (sr-only).
 * - Nhiều nút dùng CSS `uppercase`, nên so chữ không phân biệt hoa thường.
 */

const CASE_URL = "/evidence/web?case_id=case_000";

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bấm phần tử đang hiển thị có đúng nội dung `text` (không phân biệt hoa thường). */
async function tap(page: Page, text: string) {
  await page
    .getByText(new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`, "i"))
    .filter({ visible: true })
    .first()
    .click();
}

async function openBoard(page: Page) {
  await page.addInitScript(() => {
    // Bỏ màn dẫn truyện mở đầu; chỉ đặt một lần để reload giữ tiến trình.
    if (!localStorage.getItem("intro_seen")) {
      localStorage.setItem("intro_seen", "true");
    }
  });
  await page.route("**/api/test-scan-answer", (route) =>
    route.fulfill({
      json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
    }),
  );
  await page.goto(CASE_URL);
  await expect(page.locator('[data-pin-id="c0-pin-phone"]')).toBeAttached();
}

async function clickPin(page: Page, pinId: string) {
  const pin = page.locator(`[data-pin-id="${pinId}"]`);
  await expect(pin).toBeAttached();
  await pin.evaluate((el: HTMLElement) => el.click());
}

async function storage(page: Page, key: string) {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

async function addEvidenceCodes(page: Page, codes: string[]) {
  const input = page.getByPlaceholder("Nhập mã chứng cứ minh chứng...");
  for (const code of codes) {
    await input.fill(code);
    await page.getByRole("button", { name: "Thêm" }).click();
  }
}

async function solvePhoneLookup(page: Page, names: [string, string, string]) {
  await clickPin(page, "c0-pin-phone");
  const inputs = page.getByPlaceholder("Nhập tên nghi phạm...");
  await expect(inputs).toHaveCount(3);
  for (let i = 0; i < 3; i++) await inputs.nth(i).fill(names[i]);
  await inputs.nth(2).press("Enter");
}

/** Thẩm tra 2 lớp (động cơ + mâu thuẫn) rồi bấm "ĐIỀU TRA" và đóng thông báo. */
async function interrogate(
  page: Page,
  pinId: string,
  motiveCodes: string[],
  contradictionCodes: string[],
) {
  await clickPin(page, pinId);

  await tap(page, "Động cơ gây án");
  await page
    .getByPlaceholder("Nhập động cơ...")
    .fill("Động cơ có căn cứ từ chứng cứ");
  await addEvidenceCodes(page, motiveCodes);
  await tap(page, "XÁC NHẬN");
  await expect(
    page.getByText("Bằng chứng chính xác", { exact: false }),
  ).toBeVisible();
  await tap(page, "TIẾP TỤC ĐIỀU TRA");

  await tap(page, "Mâu thuẫn lời khai");
  await page
    .getByPlaceholder("Nhập mâu thuẫn lời khai...")
    .fill("Lời khai mâu thuẫn với chứng cứ thu thập");
  await addEvidenceCodes(page, contradictionCodes);
  await tap(page, "XÁC NHẬN");
  await expect(
    page.getByText("Bằng chứng chính xác", { exact: false }),
  ).toBeVisible();
  await tap(page, "TIẾP TỤC ĐIỀU TRA");

  await page.getByRole("button", { name: "ĐIỀU TRA", exact: true }).click();
  await tap(page, "BẮT ĐẦU ĐIỀU TRA");
}

test.describe("case_000 baseline", () => {
  test("bàn điều tra tải nhân vật, checkpoint và ghim", async ({ page }) => {
    const characters = page.waitForResponse((r) =>
      r.url().includes("/api/characters?caseId=case_000"),
    );
    const checkpoints = page.waitForResponse((r) =>
      r.url().includes("/api/checkpoints?caseId=case_000"),
    );
    await openBoard(page);

    const charactersBody = await (await characters).json();
    expect(charactersBody.data).toHaveLength(10);
    expect((await checkpoints).ok()).toBe(true);

    for (const pinId of [
      "c0-pin-phone",
      "c0-pin-suspects",
      "c0-pin-indictment",
      "node-suspect-vu",
      "node-suspect-tung",
      "node-suspect-ha",
    ]) {
      await expect(page.locator(`[data-pin-id="${pinId}"]`)).toBeAttached();
    }
  });

  test("sổ tay mở từ toolbar cạnh nút âm lượng", async ({ page }) => {
    await openBoard(page);
    await page.getByTitle("Mở sổ tay ghi chép thám tử").click();
    await expect(page.locator("textarea").first()).toBeVisible();
  });

  test("tra 3 SĐT: sai thì không mở, đúng thì mở khóa", async ({ page }) => {
    await openBoard(page);

    await solvePhoneLookup(page, ["Mai", "Hà", "Vy"]);
    await page.waitForTimeout(1_000);
    expect(await storage(page, "phone_solved")).not.toBe("true");

    await page.goto(CASE_URL);
    await solvePhoneLookup(page, ["Vũ", "Tùng", "Đạt"]);
    await expect.poll(() => storage(page, "phone_solved")).toBe("true");
    await expect(
      page.getByText(/lấy lời khai/i).filter({ visible: true }),
    ).toBeVisible();
  });

  test("thẩm tra nhận mã chứng cứ sai thì không ghi nhận", async ({ page }) => {
    await openBoard(page);
    await clickPin(page, "node-suspect-vu");
    await tap(page, "Động cơ gây án");
    await page.getByPlaceholder("Nhập động cơ...").fill("Vũ có động cơ");
    await addEvidenceCodes(page, ["B-99"]);
    await tap(page, "XÁC NHẬN");
    await page.waitForTimeout(1_000);
    await expect(
      page.getByText("Bằng chứng chính xác", { exact: false }),
    ).toHaveCount(0);
  });

  test("Vũ: thẩm tra 2 lớp và câu hỏi phụ mốc thời gian", async ({ page }) => {
    await openBoard(page);
    await interrogate(
      page,
      "node-suspect-vu",
      ["A-12", "0988200991"],
      ["A-18"],
    );

    const suspects = JSON.parse(
      (await storage(page, "canvas_suspects")) || "[]",
    );
    const vu = suspects.find((s: { id: string }) => s.id === "vu");
    expect(vu?.motiveClueIds).toEqual(["A-12", "sms_phone_0988200991"]);
    expect(vu?.contradictionClueIds).toContain("A-18");
    expect(
      JSON.parse((await storage(page, "investigated_suspects")) || "[]"),
    ).toContain("vu");

    await clickPin(page, "c0-pin-followup-vu");
    const answer = page.getByPlaceholder("Nhập đáp án hoặc kết luận...");
    await answer.fill("20:00");
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect.poll(() => storage(page, "followup_vu")).toBeNull();

    await answer.fill("21:15");
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect.poll(() => storage(page, "followup_vu")).toBe("21:15");
    expect(
      JSON.parse((await storage(page, "solved_followups")) || "[]"),
    ).toContain("vu");
  });

  test("Tùng: câu hỏi phụ trắc nghiệm chấm theo nhãn phương án", async ({
    page,
  }) => {
    await openBoard(page);
    await interrogate(page, "node-suspect-tung", ["A-10", "A-11"], ["A-09"]);

    await clickPin(page, "c0-pin-followup-tung");
    await page.getByRole("button", { name: "CÓ", exact: true }).click();
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect(
      page.getByText("Đáp án chưa chính xác", { exact: false }),
    ).toBeVisible();

    await page.getByRole("button", { name: "KHÔNG", exact: true }).click();
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect.poll(() => storage(page, "followup_tung")).toBe("KHÔNG");
    expect(
      JSON.parse((await storage(page, "solved_followups")) || "[]"),
    ).toContain("tung");
  });

  test("Hà: thẩm tra (SĐT, ghi âm) và mật khẩu hộp thiếc", async ({ page }) => {
    await openBoard(page);
    await interrogate(
      page,
      "node-suspect-ha",
      ["0978552109", "0984112568"],
      ["voice_phone_0984112568", "C-01", "A-23"],
    );

    await clickPin(page, "c0-pin-followup-ha");
    const answer = page.getByPlaceholder("Nhập đáp án hoặc kết luận...");
    await answer.fill("000000");
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect.poll(() => storage(page, "followup_ha")).toBeNull();

    await answer.fill("120713");
    await tap(page, "CẬP NHẬT KẾT LUẬN");
    await expect.poll(() => storage(page, "followup_ha")).toBe("120713");
  });

  test("cáo trạng: sai bị can bị từ chối, đúng thì kết án", async ({
    page,
  }) => {
    await openBoard(page);
    await clickPin(page, "c0-pin-indictment");

    const submitIndictment = async (suspect: string, codes: string[]) => {
      const nameInput = page.locator("input:visible").nth(1);
      await nameInput.fill(suspect);
      await page.getByRole("button", { name: /Mâu thuẫn tình cảm/ }).click();
      // Ô mã chứng cứ nhận nhiều mã phân tách bằng dấu phẩy; Enter sẽ nộp form.
      await page
        .getByPlaceholder("Nhập mã chứng cứ (ví dụ", { exact: false })
        .fill(codes.join(", "));
      await tap(page, "ĐỀ NGHỊ TRUY TỐ");
    };

    await submitIndictment("Lê Quang Vũ", ["C-02", "D-04", "D-05"]);
    await expect(
      page.getByText("Kết luận đối tượng chưa chính xác", { exact: false }),
    ).toBeVisible();
    expect(await storage(page, "indictment_solved")).not.toBe("true");

    await page.goto(CASE_URL);
    await clickPin(page, "c0-pin-indictment");
    await submitIndictment("Trần Thị Hà", ["C-02", "D-04", "D-05"]);
    await expect.poll(() => storage(page, "indictment_solved")).toBe("true");
    expect(await storage(page, "indictment_culprit")).toBe("ha");
  });

  test("hậu án hiển thị 4 phần có nội dung sau cáo trạng", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("intro_seen", "true");
      localStorage.setItem("indictment_solved", "true");
      localStorage.setItem("indictment_culprit", "ha");
    });
    await page.route("**/api/test-scan-answer", (route) =>
      route.fulfill({
        json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
      }),
    );
    await page.goto(CASE_URL);
    await expect(
      page.locator('[data-pin-id="c0-pin-indictment"]'),
    ).toBeAttached();

    // Bấm pin cáo trạng (đã giải) -> mở thẳng EpilogueModal
    await clickPin(page, "c0-pin-indictment");

    // Xác nhận modal Hậu Án hiển thị
    await expect(
      page.getByText("KÝ SỰ HẬU ÁN", { exact: false }).first(),
    ).toBeVisible({
      timeout: 10_000,
    });

    // Phải có các nút chọn phần hậu án đang hiển thị
    const storyButtons = page
      .locator("button:visible")
      .filter({ hasText: /Hậu Án/i });
    await expect(storyButtons.first()).toBeVisible();
    const count = await storyButtons.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Phần đầu tiên phải có nội dung (TypewriterNarrator render text)
    // Kiểm tra vùng nội dung không hiển thị trạng thái "đang cập nhật"
    await expect(
      page.getByText("Hồ sơ hậu án đang được cập nhật", { exact: false }),
    ).toHaveCount(0);
  });

  test("trang kích hoạt /activate tải danh sách hồ sơ và mở form xác thực", async ({
    page,
  }) => {
    await page.goto("/activate");
    await expect(
      page.getByText("PHÒNG LƯU TRỮ CHUYÊN ÁN MẬT", { exact: false }),
    ).toBeVisible();

    // Hồ sơ case_000 Trốn Tìm có mặt trên màn hình
    const tronTimTab = page
      .getByText(/Trốn Tìm/i)
      .filter({ visible: true })
      .first();
    await expect(tronTimTab).toBeVisible();

    // Bấm mở hồ sơ Trốn Tìm để hiển thị panel xác thực bên phải
    await tronTimTab.click();
    await expect(
      page.getByText("XÁC THỰC KÍCH HOẠT // CASE #000", { exact: false }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /PHÁ ÁN/i })).toBeVisible();
  });
});
