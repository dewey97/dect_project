import { expect, test, type Browser, type Page } from "@playwright/test";
import { getAdminClient, isE2EDbAvailable } from "./helpers/db-admin";

/**
 * Chơi nhóm v3 (docs/architecture/group_play_realtime.md):
 * tạo phòng → vào bằng mã (mã sai báo lỗi, không tạo phòng) → phòng chờ → Host bắt đầu
 * → intro đồng bộ → tiếp nhận vụ án → người vào muộn qua phòng chờ rồi Vào cuộc.
 *
 * Cần: migration 51 đã chạy, SUPABASE_SERVICE_ROLE_KEY ở dev server, và DB E2E
 * (E2E_SUPABASE_URL hoặc ALLOW_E2E_PRODUCTION_SEED=true). Thiếu thì spec tự skip.
 */

const CASE_ID = "case_000";
const createdRoomIds: string[] = [];

async function newPlayer(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  return context.newPage();
}

async function joinByCode(page: Page, code: string, nickname: string) {
  await page.goto(`/play/${CASE_ID}?mode=box`);
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await page.getByLabel("Mã phòng").fill(code);
  await page.getByLabel("Nickname của bạn").fill(nickname);
  await page.getByRole("button", { name: "Vào phòng" }).click();
}

test.describe("Group play v3", () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!isE2EDbAvailable(), "Không có DB E2E an toàn để ghi phòng.");
    const probe = await request.post("/api/rooms/join", {
      data: { code: "ZZZZ", nickname: "probe" },
    });
    test.skip(
      probe.status() !== 404,
      `Migration 51 chưa chạy hoặc thiếu service role (probe trả ${probe.status()}).`,
    );
  });

  test.afterAll(async () => {
    const db = getAdminClient();
    if (db && createdRoomIds.length > 0) {
      await db.from("game_rooms").delete().in("id", createdRoomIds);
    }
  });

  test("create, join by code, lobby, Host starts, late joiner enters", async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    // 1. Host tạo phòng.
    const host = await newPlayer(browser);
    await host.goto(`/play/${CASE_ID}?mode=box`);
    await host.getByRole("button", { name: "Tạo phòng" }).click();
    await host.getByLabel("Nickname của bạn").fill("Vy");
    await host.getByRole("button", { name: "Tăng số người" }).click(); // 4 → 5
    await host.getByRole("button", { name: "Tạo phòng" }).click();

    await expect(host.getByText("Phòng chờ")).toBeVisible();
    await expect(host).toHaveURL(/\/lobby\?room=[0-9A-Z]{4}/);
    const code = new URL(host.url()).searchParams.get("room")!;
    const roomId = await host.evaluate(() => {
      const raw = localStorage.getItem("dect_room_sessions");
      return raw ? (JSON.parse(raw)[0]?.roomId as string) : null;
    });
    if (roomId) createdRoomIds.push(roomId);
    await expect(host.getByRole("button", { name: "Bắt đầu" })).toBeVisible();

    // 2. Mã sai: báo lỗi, không vào phòng nào.
    const member = await newPlayer(browser);
    const wrong = code === "ZZZZ" ? "YYYY" : "ZZZZ";
    await joinByCode(member, wrong, "Nam");
    await expect(member.getByRole("alert")).toContainText(
      "Không tìm thấy phòng",
    );
    await expect(member.getByText("Phòng chờ")).toHaveCount(0);

    // 3. Mã đúng: cả hai thấy nhau trong phòng chờ.
    await member.getByLabel("Mã phòng").fill(code);
    await member.getByRole("button", { name: "Vào phòng" }).click();
    await expect(member.getByText("Chờ Host bắt đầu.")).toBeVisible();
    await expect(member.getByText("Vy", { exact: true })).toBeVisible();
    await expect(host.getByText("Nam", { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    // 4. Host bắt đầu: cả phòng sang cảnh mở đầu.
    await host.getByRole("button", { name: "Bắt đầu" }).click();
    await expect(host.getByRole("button", { name: "Tiếp tục" })).toBeVisible();
    await expect(member.getByText("Chờ Host chuyển màn.")).toBeVisible({
      timeout: 20_000,
    });

    // 5. Bàn giao hồ sơ → tiếp nhận vụ án → bàn điều tra.
    await host.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(
      host.getByRole("button", { name: "Tiếp nhận vụ án" }),
    ).toBeVisible();
    await expect(member.getByText("Bàn giao hồ sơ")).toBeVisible({
      timeout: 20_000,
    });
    await host.getByRole("button", { name: "Tiếp nhận vụ án" }).click();
    await expect(host).toHaveURL(/\/play\/[a-z0-9_]+\/board\?.*room=/, {
      timeout: 30_000,
    });
    await expect(member).toHaveURL(/\/play\/[a-z0-9_]+\/board\?.*room=/, {
      timeout: 30_000,
    });

    // 6. Người vào muộn: qua phòng chờ, thấy người đang chơi, bấm Vào cuộc.
    const late = await newPlayer(browser);
    await joinByCode(late, code, "Lan");
    await expect(late.getByText("Phòng đang chơi")).toBeVisible();
    await expect(late.getByText(/Đang điều tra/)).toBeVisible();
    await expect(late.getByText("Vy", { exact: true })).toBeVisible();
    await late.getByRole("button", { name: "Vào cuộc" }).click();
    await expect(late).toHaveURL(/\/play\/[a-z0-9_]+\/board\?.*room=/, {
      timeout: 30_000,
    });

    // 7. F5 giữ nguyên phòng (nhận lại bằng token, không hỏi nickname).
    await member.reload();
    await expect(member).toHaveURL(/\/play\/[a-z0-9_]+\/board\?.*room=/);
    await expect(member.getByLabel("Nickname của bạn")).toHaveCount(0);
  });
});
