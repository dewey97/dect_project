import { expect, test } from "@playwright/test";
import {
  isE2EDbAvailable,
  deleteTestCase,
  cleanupE2EStorage,
  getAdminClient,
} from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

test.describe("B18-3: Nghiệm thu Trốn Tìm v2 (Tạo qua Studio UI)", () => {
  test.beforeEach(async ({}, testInfo) => {
    if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      testInfo.skip(
        true,
        "Cần biến môi trường E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD cho admin spec",
      );
    }
  });

  test("1. Studio Cases list hiển thị và sẵn sàng tạo vụ mới", async ({
    page,
  }, testInfo) => {
    await page.goto("/studio/cases");
    await expect(page.locator("h1")).toContainText(/Cases/i, {
      timeout: 15_000,
    });

    const createBtn = page.getByRole("button", { name: /Create New Case/i });
    await expect(createBtn).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("studio-cases-list.png"),
      fullPage: false,
    });
  });

  test("2. Toàn trình tạo dữ liệu Trốn Tìm v2 qua Studio UI và nghiệm thu gameplay", async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);

    // B18-3 & B18-6: Chỉ chạy khi isE2EDbAvailable() = true (có DB test riêng hoặc cờ an toàn)
    if (!isE2EDbAvailable()) {
      testInfo.skip(
        true,
        "B18-3: Chưa cấu hình Supabase test DB. Tự động skip an toàn để bảo vệ DB production.",
      );
      return;
    }

    const testSlug = `e2e_v2_${Date.now()}`;
    let createdSlug = "";

    try {
      // ----------------------------------------------------------------------
      // BƯỚC 1: Tạo vụ án qua Studio UI với slug e2e_v2_<timestamp>
      // ----------------------------------------------------------------------
      await test.step("1. Tạo vụ án qua modal Studio UI", async () => {
        await page.goto("/studio/cases");
        await expect(page.locator("h1")).toContainText(/Cases/i, {
          timeout: 15_000,
        });

        const createBtn = page.getByRole("button", { name: /Create New Case/i });
        await expect(createBtn).toBeVisible();
        await createBtn.click();

        // Modal "Tạo Vụ Án Mới" hiển thị
        await expect(page.getByText("Tạo Vụ Án Mới")).toBeVisible({ timeout: 5_000 });
        const titleInput = page.getByPlaceholder("VD: Kỳ án ven sông...");
        await expect(titleInput).toBeVisible();
        await titleInput.fill("Trốn Tìm v2 (Studio Test)");

        const slugInput = page.getByPlaceholder(/Để trống để tự sinh mã/i);
        await expect(slugInput).toBeVisible();
        await slugInput.fill(testSlug);

        const confirmBtn = page.getByRole("button", { name: "Xác nhận tạo vụ án" });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        // Đợi chuyển hướng đến trang chi tiết vụ án
        await page.waitForURL(new RegExp(`/studio/cases/${testSlug}`), {
          timeout: 20_000,
        });
        createdSlug = testSlug;
        await expect(page.getByText(`Mã hệ thống: ${testSlug}`)).toBeVisible();
      });

      // ----------------------------------------------------------------------
      // BƯỚC 2: Cấu hình metadata, xuất bản PUBLISHED và revert ngay về DRAFT
      // ----------------------------------------------------------------------
      await test.step("2. Xuất bản PUBLISHED và revert ngay về DRAFT", async () => {
        const statusSelect = page.locator("select").first();
        await expect(statusSelect).toBeVisible();
        await statusSelect.selectOption("PUBLISHED");

        const saveCaseBtn = page.getByRole("button", { name: /Lưu Thay Đổi/i });
        await expect(saveCaseBtn).toBeVisible();
        await saveCaseBtn.click();
        await expect(
          page.getByText(/Đã cập nhật metadata vụ án thành công/i),
        ).toBeVisible({ timeout: 10_000 });

        // Revert về DRAFT ngay lập tức theo yêu cầu B18-3 để bảo vệ người chơi thật
        await statusSelect.selectOption("DRAFT");
        await saveCaseBtn.click();
        await expect(
          page.getByText(/Đã cập nhật metadata vụ án thành công/i),
        ).toBeVisible({ timeout: 10_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 3: Thêm 1 nạn nhân + 3 nghi phạm qua Character Studio
      // ----------------------------------------------------------------------
      await test.step("3. Thêm 1 nạn nhân + 3 nghi phạm qua Character Studio", async () => {
        await page.goto(`/studio/characters?case=${createdSlug}`);
        await expect(
          page.getByRole("heading", { name: "Nhân vật", level: 1 }),
        ).toBeVisible({ timeout: 15_000 });

        const characters = [
          { name: "Nguyễn Văn Khang", key: "khang", role: "victim" },
          { name: "Lê Quang Vũ", key: "vu", role: "suspect" },
          { name: "Nguyễn Thanh Tùng", key: "tung", role: "suspect" },
          { name: "Trần Thị Hà", key: "ha", role: "suspect" },
        ];

        for (const char of characters) {
          const addCharBtn = page.getByRole("button", { name: /Thêm nhân vật/i });
          await expect(addCharBtn).toBeVisible();
          await addCharBtn.click();

          const nameInput = page.locator('label:has-text("Họ tên") input');
          await expect(nameInput).toBeVisible();
          await nameInput.fill(char.name);

          const keyInput = page.locator('label:has-text("Mã") input');
          await expect(keyInput).toBeVisible();
          await keyInput.fill(char.key);

          const roleSelect = page.locator('label:has-text("Vai trò") select');
          await expect(roleSelect).toBeVisible();
          await roleSelect.selectOption(char.role);

          const saveBtn = page.getByRole("button", {
            name: /Tạo nhân vật|Lưu thay đổi/i,
          });
          await expect(saveBtn).toBeVisible();
          await saveBtn.click();

          await expect(
            page.locator("aside").getByText(char.name),
          ).toBeVisible({ timeout: 10_000 });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 4: Thêm 4 bộ hồ sơ + ≥ 6 tài liệu qua Dossier Studio
      // ----------------------------------------------------------------------
      await test.step("4. Thêm 4 bộ hồ sơ + tài liệu qua Dossier Studio", async () => {
        await page.goto(`/studio/dossier?case=${createdSlug}`);
        await expect(page.getByText(/Bộ Hồ Sơ/i).first()).toBeVisible({
          timeout: 15_000,
        });

        const dossiers = [
          { title: "Bộ A - Hồ Sơ Khởi Đầu", key: "bo_a" },
          { title: "Bộ B - Hồ Sơ Pháp Y", key: "bo_b" },
          { title: "Bộ C - Hồ Sơ Hiện Trường", key: "bo_c" },
          { title: "Bộ D - Hồ Sơ Mở Rộng", key: "bo_d" },
        ];

        for (const dos of dossiers) {
          const addBtn = page
            .getByRole("button", { name: /Thêm|\+ Tạo bộ hồ sơ đầu tiên/i })
            .first();
          await expect(addBtn).toBeVisible();
          await addBtn.click();

          const titleInput = page.getByPlaceholder(
            "VD: Bộ A, Hồ Sơ Hiện Trường...",
          );
          await expect(titleInput).toBeVisible();
          await titleInput.fill(dos.title);

          const keyInput = page.getByPlaceholder("bo_a, bo_b...");
          await expect(keyInput).toBeVisible();
          await keyInput.fill(dos.key);

          const saveDossierBtn = page.getByRole("button", {
            name: "Lưu bộ hồ sơ",
          });
          await expect(saveDossierBtn).toBeVisible();
          await saveDossierBtn.click();

          await expect(
            page.locator("aside").getByText(dos.title),
          ).toBeVisible({ timeout: 10_000 });
        }

        // Tạo 3 văn bản lời khai và 3 lý lịch
        for (let i = 1; i <= 3; i++) {
          const createDocBtn = page.getByRole("button", { name: "+ Tạo Mới" });
          await expect(createDocBtn).toBeVisible();
          await createDocBtn.click();

          const saveDocBtn = page.getByRole("button", { name: /Lưu/i }).first();
          await expect(saveDocBtn).toBeVisible();
          await saveDocBtn.click();
          await expect(page.getByText(/Đã lưu DB!/i)).toBeVisible({
            timeout: 10_000,
          });
        }

        const switchModeBtn = page.getByRole("button", {
          name: "Lý Lịch",
          exact: true,
        });
        await expect(switchModeBtn).toBeVisible();
        await switchModeBtn.click();

        for (let i = 1; i <= 3; i++) {
          const createDocBtn = page.getByRole("button", { name: "+ Tạo Mới" });
          await expect(createDocBtn).toBeVisible();
          await createDocBtn.click();

          const saveDocBtn = page.getByRole("button", { name: /Lưu/i }).first();
          await expect(saveDocBtn).toBeVisible();
          await saveDocBtn.click();
          await expect(page.getByText(/Đã lưu DB!/i)).toBeVisible({
            timeout: 10_000,
          });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 5: Thêm ≥ 4 vật chứng qua Evidence Studio
      // ----------------------------------------------------------------------
      await test.step("5. Thêm ≥ 4 vật chứng qua Evidence Studio", async () => {
        await page.goto(`/studio/evidence?case=${createdSlug}`);
        await expect(page.getByText("Evidence Studio")).toBeVisible({
          timeout: 15_000,
        });

        const items = [
          "Dao găm sắc nhọn",
          "Điện thoại vỡ màn hình",
          "Bản sao kê ngân hàng",
          "Chìa khóa két sắt",
        ];

        for (const title of items) {
          const addEvidenceBtn = page.getByRole("button", {
            name: /Thêm Chứng Cứ/i,
          });
          await expect(addEvidenceBtn).toBeVisible();
          await addEvidenceBtn.click();

          const titleInput = page.getByPlaceholder(
            "VD: Ảnh hiện trường phòng khách",
          );
          await expect(titleInput).toBeVisible();
          await titleInput.fill(title);

          const saveEvidenceBtn = page.getByRole("button", {
            name: /Tạo chứng cứ|Lưu thay đổi/i,
          });
          await expect(saveEvidenceBtn).toBeVisible();
          await saveEvidenceBtn.click();

          await expect(
            page.getByText(/Đã tạo chứng cứ mới|Đã cập nhật chứng cứ/i).first(),
          ).toBeVisible({ timeout: 10_000 });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 6: Checkpoints qua Checkpoint Studio
      // ----------------------------------------------------------------------
      await test.step("6. Thêm Checkpoints qua Checkpoint Studio", async () => {
        await page.goto(`/studio/checkpoints?case=${createdSlug}`);
        await expect(page.locator("header")).toBeVisible({ timeout: 15_000 });

        // Tạo checkpoint phone_lookup
        const addCpBtn = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn).toBeVisible();
        await addCpBtn.click();

        // Điền tiêu đề checkpoint
        const cpTitleInput = page.locator("aside header input").first();
        await expect(cpTitleInput).toBeVisible();
        await cpTitleInput.fill("Tra cứu số điện thoại nạn nhân");

        // Chỉnh sửa kind sang phone_lookup
        const kindSelect = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect).toBeVisible();
        await kindSelect.selectOption("phone_lookup");

        const questionInput = page.locator('label:has-text("Câu hỏi") textarea');
        await expect(questionInput).toBeVisible();
        await questionInput.fill("Tra cứu danh bạ liên quan vụ án");

        const saveBtn = page.getByRole("button", { name: "Lưu" }).first();
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        await expect(
          page.getByText(/Đã lưu checkpoint|Đã lưu/i).first(),
        ).toBeVisible({ timeout: 10_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 7: Danh bạ, tin nhắn, cuộc gọi qua Phone Studio
      // ----------------------------------------------------------------------
      await test.step("7. Danh bạ, tin nhắn, cuộc gọi qua Phone Studio", async () => {
        await page.goto(`/studio/phone?case=${createdSlug}`);
        await expect(page.locator("h1")).toContainText(/Phone Studio/i, {
          timeout: 15_000,
        });

        // 7.1. Danh bạ
        const contactsTab = page.getByRole("tab", { name: /Danh bạ/i });
        await expect(contactsTab).toBeVisible();
        await contactsTab.click();

        const contactNameInput = page.getByPlaceholder("VD: Hoàng Minh...");
        await expect(contactNameInput).toBeVisible();
        await contactNameInput.fill("Bác sĩ Pháp y");

        const contactPhoneInput = page.getByPlaceholder("0912.345.678");
        await expect(contactPhoneInput).toBeVisible();
        await contactPhoneInput.fill("0901234567");

        const addContactBtn = page.getByRole("button", {
          name: /Thêm vào danh bạ/i,
        });
        await expect(addContactBtn).toBeVisible();
        await addContactBtn.click();
        await expect(
          page.getByText(/Đã thêm liên hệ vào danh bạ/i).first(),
        ).toBeVisible({ timeout: 10_000 });

        // 7.2. Cuộc gọi
        const callsTab = page.getByRole("tab", { name: /Cuộc gọi/i });
        await expect(callsTab).toBeVisible();
        await callsTab.click();

        const callContactInput = page.getByPlaceholder("VD: Nguyễn Văn A...");
        await expect(callContactInput).toBeVisible();
        await callContactInput.fill("Bác sĩ Pháp y");

        const callerInput = page.getByPlaceholder("0987.654.321");
        await expect(callerInput).toBeVisible();
        await callerInput.fill("0901234567");

        const addCallBtn = page.getByRole("button", {
          name: /Thêm vào nhật ký cuộc gọi/i,
        });
        await expect(addCallBtn).toBeEnabled();
        await addCallBtn.click();
        await expect(
          page.getByText(/Đã thêm cuộc gọi vào nhật ký/i).first(),
        ).toBeVisible({ timeout: 10_000 });

        // 7.3. Tin nhắn
        const messagesTab = page.getByRole("tab", { name: /Tin nhắn/i });
        await expect(messagesTab).toBeVisible();
        await messagesTab.click();

        const createThreadBtn = page.getByRole("button", { name: "Tạo mới" });
        await expect(createThreadBtn).toBeVisible();
        await createThreadBtn.click();

        const threadNameInput = page.getByPlaceholder(
          "Tên đối tượng (VD: Hoàng Minh)...",
        );
        await expect(threadNameInput).toBeVisible();
        await threadNameInput.fill("Lê Quang Vũ");

        const startThreadBtn = page.getByRole("button", { name: "Bắt đầu soạn" });
        await expect(startThreadBtn).toBeVisible();
        await startThreadBtn.click();

        const saveThreadBtn = page.getByRole("button", {
          name: /Lưu hội thoại \(Batch\)/i,
        });
        await expect(saveThreadBtn).toBeVisible();
        await saveThreadBtn.click();
        await expect(
          page.getByText(/Đã lưu thành công/i).first(),
        ).toBeVisible({ timeout: 10_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 8: Thêm 1 node bảng & 1 hotspot hiện trường
      // ----------------------------------------------------------------------
      await test.step("8. Thêm node bảng & hotspot hiện trường", async () => {
        // Board Studio
        await page.goto(`/studio/checkpoints?case=${createdSlug}&view=board`);
        await expect(
          page.getByText("Bảng điều tra (Board Studio)"),
        ).toBeVisible({ timeout: 15_000 });

        const addNodeBtn = page.getByRole("button", { name: "Thêm Node" });
        await expect(addNodeBtn).toBeVisible();
        await addNodeBtn.click();

        const nodeTitleInput = page.getByPlaceholder("VD: Nguyễn Văn Khang...");
        await expect(nodeTitleInput).toBeVisible();
        await nodeTitleInput.fill("Node Ghi Chú Hiện Trường");

        const saveNodeBtn = page.locator('form button[type="submit"]:has-text("Lưu")');
        await expect(saveNodeBtn).toBeVisible();
        await saveNodeBtn.click();

        const saveBoardLayoutBtn = page.getByRole("button", {
          name: "Lưu Bố Cục",
        });
        await expect(saveBoardLayoutBtn).toBeVisible();
        await saveBoardLayoutBtn.click();
        await expect(
          page.getByText(/Đã lưu toàn bộ bố cục bảng|Đã lưu bố cục/i),
        ).toBeVisible({ timeout: 10_000 });

        // Hotspot Hiện trường trong Evidence Studio
        await page.goto(`/studio/evidence?case=${createdSlug}`);
        const sceneTab = page.getByRole("button", {
          name: "Hiện Trường (2D / 360)",
        });
        await expect(sceneTab).toBeVisible();
        await sceneTab.click();

        const addSpotBtn = page.getByRole("button", { name: "Thêm Điểm" });
        await expect(addSpotBtn).toBeVisible();
        await addSpotBtn.click();

        const saveHotspotsBtn = page.getByRole("button", {
          name: /Lưu \(.*điểm\)|Lưu/i,
        });
        await expect(saveHotspotsBtn).toBeVisible();
        await saveHotspotsBtn.click();
        await expect(page.getByText(/lên Server!/i)).toBeVisible({
          timeout: 10_000,
        });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 9: Mở và xác thực gameplay trực tiếp tại /evidence/web?case_id=<slug>
      // ----------------------------------------------------------------------
      await test.step("9. Chơi thử trực tiếp tại /evidence/web?case_id=<slug>", async () => {
        await page.addInitScript((slug) => {
          localStorage.setItem("intro_seen", "true");
          localStorage.setItem(`${slug}:intro_seen`, "true");
        }, createdSlug);

        await page.goto(`/evidence/web?case_id=${createdSlug}`);

        await expect(
          page.locator('[data-board-ready="true"]').first(),
        ).toBeAttached({ timeout: 20_000 });

        // Xác thực canvas bàn điều tra đã load với các node được sinh tự động
        const canvas = page.locator("canvas").first();
        await expect(canvas).toBeVisible({ timeout: 15_000 });

        // Xác thực các ghim điều tra và khay hồ sơ của vụ án v2
        await expect(
          page.getByRole("button", { name: "Điện thoại nạn nhân" }),
        ).toBeAttached();
        await expect(
          page.getByRole("button", { name: "Nghi phạm" }),
        ).toBeAttached();
        await expect(
          page.getByRole("button", { name: "Bản kết luận điều tra" }),
        ).toBeAttached();
        await expect(
          page.getByRole("button", { name: "Bộ A - Hồ Sơ Khởi Đầu" }),
        ).toBeVisible();

        // Chụp ảnh màn hình nghiệm thu gameplay
        await page.screenshot({
          path: testInfo.outputPath("v2-gameplay-board.png"),
          fullPage: false,
        });
      });
    } finally {
      // ----------------------------------------------------------------------
      // B18-6: Dọn sạch triệt để case test và file Storage
      // ----------------------------------------------------------------------
      if (createdSlug && createdSlug.startsWith("e2e_")) {
        try {
          await deleteTestCase(createdSlug);
          await cleanupE2EStorage("e2e");
        } catch (cleanupErr) {
          console.warn("Lỗi cleanup e2e v2 case:", cleanupErr);
        }
      }

      // Xác minh DB không còn case nào với slug e2e_v2_*
      const adminClient = getAdminClient();
      if (adminClient && createdSlug) {
        const { data: lingering } = await adminClient
          .from("cases")
          .select("slug")
          .eq("slug", createdSlug);
        expect(lingering || []).toHaveLength(0);
      }
    }
  });
});
