import { expect, test } from "@playwright/test";
import { executeSql } from "./helpers/db-admin";

const TEST_CASE_SLUG = "e2e_board_test";

test.describe("B12-6: Dynamic New Case Board (Isolated Workspace)", () => {
  let isSeeded = false;

  test.beforeAll(async () => {
    try {
      // 1. Dọn sạch dữ liệu cũ nếu sót lại
      await executeSql(`
        DELETE FROM public.case_board_nodes WHERE case_slug = '${TEST_CASE_SLUG}';
        DELETE FROM public.case_checkpoints WHERE case_id = '${TEST_CASE_SLUG}';
        DELETE FROM public.case_characters WHERE case_slug = '${TEST_CASE_SLUG}';
        DELETE FROM public.cases WHERE slug = '${TEST_CASE_SLUG}';
      `);

      // 2. Seed dữ liệu vụ án test: 1 victim + 2 suspect + 1 checkpoint indictment
      await executeSql(`
        INSERT INTO public.cases (slug, title, status)
        VALUES ('${TEST_CASE_SLUG}', 'Vụ Án Bí Ẩn Test Board', 'DRAFT');

        INSERT INTO public.case_characters (case_slug, key, name, role, slot_index)
        VALUES 
          ('${TEST_CASE_SLUG}', 'victim_test', 'Nạn Nhân Phan Hoàng Nam', 'victim', 0),
          ('${TEST_CASE_SLUG}', 'suspect_alpha', 'Nghi Phạm Đỗ Mạnh Hùng', 'suspect', 1),
          ('${TEST_CASE_SLUG}', 'suspect_beta', 'Nghi Phạm Mai Thúy Hạnh', 'suspect', 2);

        INSERT INTO public.case_checkpoints (case_id, checkpoint_id, title, kind, subject_key, board_config)
        VALUES
          ('${TEST_CASE_SLUG}', 'cp_test_indictment', 'Luận tội thủ phạm', 'indictment', 'suspect_alpha', jsonb_build_object(
            'pin_title', 'Bản kết luận điều tra',
            'position', jsonb_build_object('desktop', jsonb_build_object('x', 0.78, 'y', 0.78))
          ));

        INSERT INTO public.case_board_nodes (id, case_slug, node_kind, title, subject_key, slot_index, config)
        VALUES
          (
            '${TEST_CASE_SLUG}:victim_phone:phone',
            '${TEST_CASE_SLUG}',
            'victim_phone',
            'Điện thoại nạn nhân',
            'victim_test',
            0,
            jsonb_build_object(
              'pin_title', 'Điện thoại nạn nhân',
              'position', jsonb_build_object('desktop', jsonb_build_object('x', 0.38, 'y', 0.14))
            )
          ),
          (
            '${TEST_CASE_SLUG}:suspects_hub:hub',
            '${TEST_CASE_SLUG}',
            'suspects_hub',
            'Danh sách nghi phạm',
            NULL,
            1,
            jsonb_build_object(
              'pin_title', 'Khu vực nghi phạm',
              'position', jsonb_build_object('desktop', jsonb_build_object('x', 0.25, 'y', 0.50))
            )
          );
      `);

      isSeeded = true;
    } catch (err) {
      console.warn("Không thể seed database cho board-new-case test:", err);
    }
  });

  test.afterAll(async () => {
    if (isSeeded) {
      try {
        await executeSql(`
          DELETE FROM public.case_board_nodes WHERE case_slug = '${TEST_CASE_SLUG}';
          DELETE FROM public.case_checkpoints WHERE case_id = '${TEST_CASE_SLUG}';
          DELETE FROM public.case_characters WHERE case_slug = '${TEST_CASE_SLUG}';
          DELETE FROM public.cases WHERE slug = '${TEST_CASE_SLUG}';
        `);
      } catch (err) {
        console.warn("Lỗi khi cleanup board-new-case test:", err);
      }
    }
  });

  test("Bàn điều tra vụ mới render đúng nhân vật, không dính tên hay ảnh case_000", async ({
    page,
  }, testInfo) => {
    if (!isSeeded) {
      testInfo.skip(true, "Database chưa được cấu hình hoặc seed thất bại");
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
