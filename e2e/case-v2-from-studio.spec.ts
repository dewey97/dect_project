import { expect, test, type Page } from "@playwright/test";
import {
  isE2EDbAvailable,
  deleteTestCase,
  cleanupE2EStorage,
  getAdminClient,
} from "./helpers/db-admin";

test.use({ storageState: "e2e/.auth/admin.json" });

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function tap(page: Page, text: string) {
  await page
    .getByText(new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`, "i"))
    .filter({ visible: true })
    .first()
    .click();
}

async function addEvidenceCodes(page: Page, codes: string[]) {
  const input = page.getByPlaceholder("Nhập mã chứng cứ minh chứng...");
  for (const code of codes) {
    await input.fill(code);
    await page.getByRole("button", { name: "Thêm" }).click();
  }
}

test.describe("B19-1: Nghiệm thu toàn trình Trốn Tìm v2 (Studio UI & Gameplay)", () => {
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
    await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
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
    test.setTimeout(240_000);

    if (!isE2EDbAvailable()) {
      testInfo.skip(
        true,
        "B19-1: Chưa bật ALLOW_E2E_PRODUCTION_SEED hoặc cấu hình Supabase DB.",
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
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.locator("h1")).toContainText(/Cases/i, {
          timeout: 15_000,
        });

        const createBtn = page.getByRole("button", { name: /Create New Case/i });
        await expect(createBtn).toBeVisible();
        await createBtn.click();

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

        await page.waitForURL(new RegExp(`/studio/cases/${testSlug}`), {
          timeout: 20_000,
        });
        createdSlug = testSlug;
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
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
        await expect(saveCaseBtn).toBeEnabled({ timeout: 15_000 });
        await saveCaseBtn.click();
        await expect(
          page.getByText(/Đã cập nhật metadata vụ án thành công/i).first(),
        ).toBeVisible({ timeout: 15_000 });
        await expect(saveCaseBtn).toBeEnabled({ timeout: 15_000 });

        await statusSelect.selectOption("DRAFT");
        await saveCaseBtn.click();
        await expect(
          page.getByText(/Đã cập nhật metadata vụ án thành công/i).first(),
        ).toBeVisible({ timeout: 15_000 });
        await expect(saveCaseBtn).toBeEnabled({ timeout: 15_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 3: Thêm 1 nạn nhân + 3 nghi phạm qua Character Studio (có upload avatar)
      // ----------------------------------------------------------------------
      await test.step("3. Thêm 1 nạn nhân + 3 nghi phạm qua Character Studio", async () => {
        await page.goto(`/studio/characters?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
        await expect(
          page.getByRole("heading", { name: "Nhân vật", level: 1 }),
        ).toBeVisible({ timeout: 15_000 });

        const characters = [
          { name: "Hoàng Văn Nam", key: "nam", role: "victim" },
          { name: "Đỗ Quốc Huy", key: "huy", role: "suspect" },
          { name: "Phạm Mai Lan", key: "lan", role: "suspect" },
          { name: "Bùi Đức Minh", key: "minh", role: "suspect" },
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

          if (char.key === "lan") {
            const avatarInput = page.locator('input[type="file"][accept="image/*"]');
            await expect(avatarInput).toBeAttached();
            await avatarInput.setInputFiles("e2e/fixtures/avatar-lan.png");
            await expect(
              page.getByText(/Đã tải ảnh chân dung thành công/i).first(),
            ).toBeVisible({ timeout: 15_000 });
          }

          const saveBtn = page.getByRole("button", {
            name: /Tạo nhân vật|Lưu thay đổi/i,
          });
          await expect(saveBtn).toBeVisible();
          await saveBtn.click();

          await expect(
            page.locator("aside").getByText(char.name),
          ).toBeVisible({ timeout: 15_000 });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 4: Thêm 4 bộ hồ sơ qua Dossier Studio
      // ----------------------------------------------------------------------
      await test.step("4. Thêm 4 bộ hồ sơ qua Dossier Studio", async () => {
        await page.goto(`/studio/dossier?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
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
          await expect(saveDossierBtn).not.toBeVisible({ timeout: 15_000 });

          await expect(
            page.locator("aside").getByText(dos.title),
          ).toBeVisible({ timeout: 15_000 });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 5: Thêm 4 vật chứng qua Evidence Studio (V2-01 ... V2-04)
      // ----------------------------------------------------------------------
      await test.step("5. Thêm 4 vật chứng qua Evidence Studio (V2-01 ... V2-04)", async () => {
        await page.goto(`/studio/evidence?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText("Evidence Studio")).toBeVisible({
          timeout: 15_000,
        });

        const items = [
          { title: "Dao găm sắc nhọn", code: "V2-01" },
          { title: "Bản kê giao dịch", code: "V2-02" },
          { title: "Mẫu đối chiếu dấu vết", code: "V2-03" },
          { title: "Biên lai chuyển khoản", code: "V2-04" },
        ];

        for (const item of items) {
          const addEvidenceBtn = page.getByRole("button", {
            name: /Thêm Chứng Cứ/i,
          });
          await expect(addEvidenceBtn).toBeVisible();
          await addEvidenceBtn.click();

          const titleInput = page.getByPlaceholder(
            "VD: Ảnh hiện trường phòng khách",
          );
          await expect(titleInput).toBeVisible();
          await titleInput.fill(item.title);

          const codeInput = page.getByPlaceholder("Tự sinh từ tiêu đề (VD: p1)");
          await expect(codeInput).toBeVisible();
          await codeInput.fill(item.code);

          const saveEvidenceBtn = page.getByRole("button", {
            name: /Tạo chứng cứ|Lưu thay đổi/i,
          });
          await expect(saveEvidenceBtn).toBeVisible();
          await saveEvidenceBtn.click();

          await expect(
            page.getByText(/Đã tạo chứng cứ mới|Đã cập nhật chứng cứ/i).first(),
          ).toBeVisible({ timeout: 15_000 });
          await expect(saveEvidenceBtn).toBeEnabled({ timeout: 15_000 });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 6: Checkpoints qua Checkpoint Studio (đủ 7 checkpoint có depends_on)
      // ----------------------------------------------------------------------
      await test.step("6. Thêm 7 Checkpoints có depends_on qua Checkpoint Studio", async () => {
        page.on("dialog", (dialog) => dialog.accept());
        await page.goto(`/studio/checkpoints?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.locator("header")).toBeVisible({ timeout: 15_000 });

        // 6.1. Checkpoint 1: phone_lookup
        const addCpBtn1 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn1).toBeVisible();
        await addCpBtn1.click();

        const cpTitleInput1 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput1).toBeVisible();
        await expect(cpTitleInput1).toHaveValue("");
        await cpTitleInput1.fill("Tra cứu số điện thoại nghi phạm");
        await expect(cpTitleInput1).toHaveValue("Tra cứu số điện thoại nghi phạm");

        const kindSelect1 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect1).toBeVisible();
        await kindSelect1.selectOption("phone_lookup");

        const questionInput1 = page.locator('label:has-text("Câu hỏi") textarea');
        await expect(questionInput1).toBeVisible();
        await questionInput1.fill("Tra cứu danh bạ để tìm danh tính các nghi phạm");

        for (let i = 0; i < 3; i++) {
          const addLookupBtn = page.getByRole("button", { name: "Thêm ô tra cứu" });
          await expect(addLookupBtn).toBeVisible();
          await addLookupBtn.click();
        }

        const answerInputs = page.getByPlaceholder("Nhập tên/từ khóa rồi Enter...");
        await expect(answerInputs).toHaveCount(3);
        await answerInputs.nth(0).fill("Đỗ Quốc Huy, Huy");
        await answerInputs.nth(0).press("Enter");
        await answerInputs.nth(1).fill("Phạm Mai Lan, Lan");
        await answerInputs.nth(1).press("Enter");
        await answerInputs.nth(2).fill("Bùi Đức Minh, Minh");
        await answerInputs.nth(2).press("Enter");

        const saveCpBtn1 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn1).toBeVisible();
        await saveCpBtn1.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.2. Checkpoint 2: suspect_interrogation (Huy)
        const addCpBtn2 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn2).toBeVisible();
        await addCpBtn2.click();

        const cpTitleInput2 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput2).toBeVisible();
        await expect(cpTitleInput2).toHaveValue("");
        await cpTitleInput2.fill("Thẩm tra Đỗ Quốc Huy");
        await expect(cpTitleInput2).toHaveValue("Thẩm tra Đỗ Quốc Huy");

        const kindSelect2 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect2).toBeVisible();
        await kindSelect2.selectOption("suspect_interrogation");

        const charSelect2 = page.locator('label:has-text("Nhân vật liên quan") select');
        await expect(charSelect2).toBeVisible();
        await charSelect2.selectOption("huy");

        const motiveInput2 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh động cơ)") input').first();
        await expect(motiveInput2).toBeVisible();
        await motiveInput2.fill("V2-01");
        await motiveInput2.press("Enter");

        const tabContradiction2 = page.getByRole("button", { name: "Mâu thuẫn" });
        await expect(tabContradiction2).toBeVisible();
        await tabContradiction2.click();

        const contradictionInput2 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh mâu thuẫn)") input').first();
        await expect(contradictionInput2).toBeVisible();
        await contradictionInput2.fill("V2-02");
        await contradictionInput2.press("Enter");

        const depLabel2 = page.locator('label:has-text("Tra cứu số điện thoại nghi phạm") input[type="checkbox"]');
        await expect(depLabel2).toBeVisible();
        await depLabel2.check();

        const saveCpBtn2 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn2).toBeVisible();
        await saveCpBtn2.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.3. Checkpoint 3: suspect_interrogation (Lan)
        const addCpBtn3 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn3).toBeVisible();
        await addCpBtn3.click();

        const cpTitleInput3 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput3).toBeVisible();
        await expect(cpTitleInput3).toHaveValue("");
        await cpTitleInput3.fill("Thẩm tra Phạm Mai Lan");
        await expect(cpTitleInput3).toHaveValue("Thẩm tra Phạm Mai Lan");

        const kindSelect3 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect3).toBeVisible();
        await kindSelect3.selectOption("suspect_interrogation");

        const charSelect3 = page.locator('label:has-text("Nhân vật liên quan") select');
        await expect(charSelect3).toBeVisible();
        await charSelect3.selectOption("lan");

        const tabMotive3 = page.getByRole("button", { name: "Động cơ" });
        await expect(tabMotive3).toBeVisible();
        await tabMotive3.click();

        const motiveInput3 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh động cơ)") input').first();
        await expect(motiveInput3).toBeVisible();
        await motiveInput3.fill("V2-01");
        await motiveInput3.press("Enter");

        const tabContradiction3 = page.getByRole("button", { name: "Mâu thuẫn" });
        await expect(tabContradiction3).toBeVisible();
        await tabContradiction3.click();

        const contradictionInput3 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh mâu thuẫn)") input').first();
        await expect(contradictionInput3).toBeVisible();
        await contradictionInput3.fill("V2-03");
        await contradictionInput3.press("Enter");

        const depLabel3 = page.locator('label:has-text("Tra cứu số điện thoại nghi phạm") input[type="checkbox"]');
        await expect(depLabel3).toBeVisible();
        await depLabel3.check();

        const saveCpBtn3 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn3).toBeVisible();
        await saveCpBtn3.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.4. Checkpoint 4: suspect_interrogation (Minh)
        const addCpBtn4 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn4).toBeVisible();
        await addCpBtn4.click();

        const cpTitleInput4 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput4).toBeVisible();
        await expect(cpTitleInput4).toHaveValue("");
        await cpTitleInput4.fill("Thẩm tra Bùi Đức Minh");
        await expect(cpTitleInput4).toHaveValue("Thẩm tra Bùi Đức Minh");

        const kindSelect4 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect4).toBeVisible();
        await kindSelect4.selectOption("suspect_interrogation");

        const charSelect4 = page.locator('label:has-text("Nhân vật liên quan") select');
        await expect(charSelect4).toBeVisible();
        await charSelect4.selectOption("minh");

        const tabMotive4 = page.getByRole("button", { name: "Động cơ" });
        await expect(tabMotive4).toBeVisible();
        await tabMotive4.click();

        const motiveInput4 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh động cơ)") input').first();
        await expect(motiveInput4).toBeVisible();
        await motiveInput4.fill("V2-02");
        await motiveInput4.press("Enter");

        const tabContradiction4 = page.getByRole("button", { name: "Mâu thuẫn" });
        await expect(tabContradiction4).toBeVisible();
        await tabContradiction4.click();

        const contradictionInput4 = page.locator('label:has-text("Vật chứng bắt buộc (chứng minh mâu thuẫn)") input').first();
        await expect(contradictionInput4).toBeVisible();
        await contradictionInput4.fill("V2-04");
        await contradictionInput4.press("Enter");

        const depLabel4 = page.locator('label:has-text("Tra cứu số điện thoại nghi phạm") input[type="checkbox"]');
        await expect(depLabel4).toBeVisible();
        await depLabel4.check();

        const saveCpBtn4 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn4).toBeVisible();
        await saveCpBtn4.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.5. Checkpoint 5: followup (Lan)
        const addCpBtn5 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn5).toBeVisible();
        await addCpBtn5.click();

        const cpTitleInput5 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput5).toBeVisible();
        await expect(cpTitleInput5).toHaveValue("");
        await cpTitleInput5.fill("Chất vấn mở rộng Phạm Mai Lan");
        await expect(cpTitleInput5).toHaveValue("Chất vấn mở rộng Phạm Mai Lan");

        const kindSelect5 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect5).toBeVisible();
        await kindSelect5.selectOption("followup");

        const charSelect5 = page.locator('label:has-text("Nhân vật liên quan") select');
        await expect(charSelect5).toBeVisible();
        await charSelect5.selectOption("lan");

        const qTypeSelect5 = page.locator('label:has-text("Loại câu hỏi phụ") select');
        await expect(qTypeSelect5).toBeVisible();
        await qTypeSelect5.selectOption("choice");

        const optionsInput5 = page.getByPlaceholder("Nhập phương án rồi Enter...");
        await expect(optionsInput5).toBeVisible();
        await optionsInput5.fill("CÓ, KHÔNG");
        await optionsInput5.press("Enter");

        const correctAnsInput5 = page.locator('label:has-text("Đáp án đúng") input');
        await expect(correctAnsInput5).toBeVisible();
        await correctAnsInput5.fill("KHÔNG");

        const depLabel5 = page.locator('label:has-text("Thẩm tra Phạm Mai Lan") input[type="checkbox"]');
        await expect(depLabel5).toBeVisible();
        await depLabel5.check();

        const saveCpBtn5 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn5).toBeVisible();
        await saveCpBtn5.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.6. Checkpoint 6: indictment
        const addCpBtn6 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn6).toBeVisible();
        await addCpBtn6.click();

        const cpTitleInput6 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput6).toBeVisible();
        await expect(cpTitleInput6).toHaveValue("");
        await cpTitleInput6.fill("Lập bản cáo trạng kết án");
        await expect(cpTitleInput6).toHaveValue("Lập bản cáo trạng kết án");

        const kindSelect6 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect6).toBeVisible();
        await kindSelect6.selectOption("indictment");

        const suspectChips6 = page.locator('label:has-text("Nghi phạm bị can đúng") input').first();
        await expect(suspectChips6).toBeVisible();
        await suspectChips6.fill("Phạm Mai Lan, lan");
        await suspectChips6.press("Enter");

        const motiveChips6 = page.locator('label:has-text("Động cơ phạm tội được chấp nhận") input').first();
        await expect(motiveChips6).toBeVisible();
        await motiveChips6.fill("Mâu thuẫn tài chính");
        await motiveChips6.press("Enter");

        const reqEvChips6 = page.locator('label:has-text("Mã chứng cứ bắt buộc để truy tố") input').first();
        await expect(reqEvChips6).toBeVisible();
        await reqEvChips6.fill("V2-01");
        await reqEvChips6.press("Enter");

        const optEvChips6 = page.locator('label:has-text("Mã chứng cứ bổ trợ") input').first();
        await expect(optEvChips6).toBeVisible();
        await optEvChips6.fill("V2-02, V2-03");
        await optEvChips6.press("Enter");

        const depHuy6 = page.locator('label:has-text("Thẩm tra Đỗ Quốc Huy") input[type="checkbox"]');
        await expect(depHuy6).toBeVisible();
        await depHuy6.check();

        const depLan6 = page.locator('label:has-text("Thẩm tra Phạm Mai Lan") input[type="checkbox"]');
        await expect(depLan6).toBeVisible();
        await depLan6.check();

        const depMinh6 = page.locator('label:has-text("Thẩm tra Bùi Đức Minh") input[type="checkbox"]');
        await expect(depMinh6).toBeVisible();
        await depMinh6.check();

        const depFollowup6 = page.locator('label:has-text("Chất vấn mở rộng Phạm Mai Lan") input[type="checkbox"]');
        await expect(depFollowup6).toBeVisible();
        await depFollowup6.check();

        const saveCpBtn6 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn6).toBeVisible();
        await saveCpBtn6.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });

        // 6.7. Checkpoint 7: epilogue
        const addCpBtn7 = page.getByRole("button", { name: "+ Checkpoint" });
        await expect(addCpBtn7).toBeVisible();
        await addCpBtn7.click();

        const cpTitleInput7 = page.getByPlaceholder("Tiêu đề checkpoint...");
        await expect(cpTitleInput7).toBeVisible();
        await expect(cpTitleInput7).toHaveValue("");
        await cpTitleInput7.fill("Hậu án tổng kết");
        await expect(cpTitleInput7).toHaveValue("Hậu án tổng kết");

        const kindSelect7 = page.locator('label:has-text("Loại Checkpoint") select');
        await expect(kindSelect7).toBeVisible();
        await kindSelect7.selectOption("epilogue");

        const monologueArea = page.locator('textarea').first();
        await expect(monologueArea).toBeVisible();
        await monologueArea.fill("Vụ án Trốn Tìm v2 đã được làm sáng tỏ. Phạm Mai Lan đã thừa nhận toàn bộ hành vi phạm tội.");

        const depIndictment7 = page.locator('label:has-text("Lập bản cáo trạng kết án") input[type="checkbox"]');
        await expect(depIndictment7).toBeVisible();
        await depIndictment7.check();

        const saveCpBtn7 = page.getByRole("button", { name: /Lưu Checkpoint/i });
        await expect(saveCpBtn7).toBeVisible();
        await saveCpBtn7.click();
        await expect(page.locator('aside header span[title="Đã lưu"]')).toBeVisible({ timeout: 15_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 7: Danh bạ, tin nhắn, cuộc gọi qua Phone Studio (thread >= 2 tin)
      // ----------------------------------------------------------------------
      await test.step("7. Danh bạ, tin nhắn, cuộc gọi qua Phone Studio", async () => {
        await page.goto(`/studio/phone?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
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
        ).toBeVisible({ timeout: 15_000 });

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
        ).toBeVisible({ timeout: 15_000 });

        // 7.3. Tin nhắn (thread ≥ 2 tin)
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
        await threadNameInput.fill("Đỗ Quốc Huy");

        const startThreadBtn = page.getByRole("button", { name: "Bắt đầu soạn" });
        await expect(startThreadBtn).toBeVisible();
        await startThreadBtn.click();

        const addRowBtn1 = page.getByRole("button", { name: "Thêm dòng" });
        await expect(addRowBtn1).toBeVisible();
        await addRowBtn1.click();

        const msgBody1 = page.getByPlaceholder("Nhập nội dung tin nhắn...").nth(0);
        await expect(msgBody1).toBeVisible();
        await msgBody1.fill("Hẹn gặp tối nay lúc 20h tại văn phòng");

        const addRowBtn2 = page.getByRole("button", { name: "Thêm dòng" });
        await expect(addRowBtn2).toBeVisible();
        await addRowBtn2.click();

        const msgBody2 = page.getByPlaceholder("Nhập nội dung tin nhắn...").nth(1);
        await expect(msgBody2).toBeVisible();
        await msgBody2.fill("Tôi sẽ đến đúng giờ mang theo tài liệu");

        const saveThreadBtn = page.getByRole("button", {
          name: /Lưu hội thoại \(Batch\)/i,
        });
        await expect(saveThreadBtn).toBeVisible();
        await saveThreadBtn.click();
        await expect(
          page.getByText(/Đã lưu thành công/i).first(),
        ).toBeVisible({ timeout: 15_000 });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 8: Thêm 1 node bảng & 1 hotspot hiện trường
      // ----------------------------------------------------------------------
      await test.step("8. Thêm node bảng & hotspot hiện trường", async () => {
        await page.goto(`/studio/checkpoints?case=${createdSlug}&view=board`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
        await expect(
          page.getByText("Bảng điều tra (Board Studio)"),
        ).toBeVisible({ timeout: 15_000 });

        const addNodeBtn = page.getByRole("button", { name: "Thêm Node" });
        await expect(addNodeBtn).toBeVisible({ timeout: 15_000 });
        await expect(addNodeBtn).toBeEnabled({ timeout: 15_000 });
        await addNodeBtn.click();

        const nodeTitleInput = page.getByPlaceholder("VD: Nạn nhân, Hiện trường…");
        await expect(nodeTitleInput).toBeVisible({ timeout: 15_000 });
        await nodeTitleInput.fill("Node Ghi Chú Hiện Trường");

        const saveNodeBtn = page.locator('form button[type="submit"]:has-text("Lưu")');
        await expect(saveNodeBtn).toBeVisible({ timeout: 15_000 });
        await saveNodeBtn.click();
        await expect(
          page.getByText(/Đã lưu node thành công|Đã lưu node/i).first(),
        ).toBeVisible({ timeout: 15_000 });

        const saveBoardLayoutBtn = page.getByRole("button", {
          name: "Lưu Bố Cục",
        });
        await expect(saveBoardLayoutBtn).toBeVisible({ timeout: 15_000 });
        await saveBoardLayoutBtn.click();
        await expect(
          page.getByText(/Đã lưu toàn bộ bố cục bảng|Đã lưu bố cục/i),
        ).toBeVisible({ timeout: 15_000 });

        await page.goto(`/studio/evidence?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({ timeout: 15_000 });
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
          timeout: 15_000,
        });
      });

      // ----------------------------------------------------------------------
      // BƯỚC 9: Chơi thử trực tiếp từ /evidence/web?case_id=<slug> đến KÝ SỰ HẬU ÁN
      // ----------------------------------------------------------------------
      await test.step("9. Chơi thử trực tiếp tại /evidence/web?case_id=<slug>", async () => {
        await page.route("**/api/test-scan-answer", (route) =>
          route.fulfill({
            json: { isCorrect: true, confidenceScore: 95, feedback: "E2E mock" },
          }),
        );

        await page.addInitScript((slug) => {
          localStorage.setItem("intro_seen", "true");
          localStorage.setItem(`${slug}:intro_seen`, "true");
          localStorage.setItem(`${slug}::intro_seen`, "true");
        }, createdSlug);

        await page.goto(`/evidence/web?case_id=${createdSlug}`);

        await expect(
          page.locator('[data-board-ready="true"]').first(),
        ).toBeAttached({ timeout: 25_000 });

        const canvas = page.locator("canvas").first();
        await expect(canvas).toBeVisible({ timeout: 15_000 });

        // 9.1. Tra cứu SĐT (nhập sai bị từ chối; nhập đúng 3 tên mở khóa)
        const phonePin = page.locator('[data-node-kind="phone_lookup"]').first();
        await expect(phonePin).toBeAttached({ timeout: 15_000 });
        await phonePin.evaluate((el: HTMLElement) => el.click());

        const phoneInputs = page.getByPlaceholder("Nhập họ tên cần tra...");
        await expect(phoneInputs).toHaveCount(3);

        await phoneInputs.nth(0).fill("Sai Một");
        await phoneInputs.nth(1).fill("Sai Hai");
        await phoneInputs.nth(2).fill("Sai Ba");
        const submitPhoneBtn = page.getByRole("button", { name: /LIÊN LẠC LẤY THÔNG TIN/i });
        await expect(submitPhoneBtn).toBeVisible();
        await submitPhoneBtn.click();
        await expect(page.getByText(/chưa chính xác/i).first()).toBeVisible({ timeout: 15_000 });

        await phoneInputs.nth(0).fill("Đỗ Quốc Huy");
        await phoneInputs.nth(1).fill("Phạm Mai Lan");
        await phoneInputs.nth(2).fill("Bùi Đức Minh");
        await submitPhoneBtn.click();

        const takeTestimonyBtn = page.getByRole("button", { name: /LẤY LỜI KHAI/i });
        await expect(takeTestimonyBtn).toBeVisible({ timeout: 15_000 });
        await takeTestimonyBtn.click();

        const continueBtn = page.getByRole("button", { name: /TIẾP TỤC ĐIỀU TRA/i });
        await expect(continueBtn).toBeVisible({ timeout: 15_000 });
        await continueBtn.click();

        // 9.2. Thẩm tra nghi phạm Phạm Mai Lan với mã chứng cứ đúng
        const lanPin = page.locator('[data-node-kind="suspect"][data-subject-key="lan"], [data-pin-id*="lan"]').first();
        await expect(lanPin).toBeAttached({ timeout: 15_000 });
        await lanPin.evaluate((el: HTMLElement) => el.click());

        await expect(page.getByRole("heading", { name: /THẨM TRA ĐỐI TƯỢNG/i }).first()).toBeVisible({ timeout: 15_000 });

        await tap(page, "Động cơ gây án");
        await page.getByPlaceholder("Nhập động cơ...").fill("Tranh chấp quyền lợi tài sản cá nhân");
        await addEvidenceCodes(page, ["V2-01"]);
        await tap(page, "XÁC NHẬN");
        await expect(page.getByText("Bằng chứng chính xác", { exact: false }).first()).toBeVisible({ timeout: 15_000 });
        await tap(page, "TIẾP TỤC ĐIỀU TRA");

        await tap(page, "Mâu thuẫn lời khai");
        await page.getByPlaceholder("Nhập mâu thuẫn lời khai...").fill("Mâu thuẫn lời khai với chứng cứ giám định");
        await addEvidenceCodes(page, ["V2-03"]);
        await tap(page, "XÁC NHẬN");
        await expect(page.getByText("Bằng chứng chính xác", { exact: false }).first()).toBeVisible({ timeout: 15_000 });
        await tap(page, "TIẾP TỤC ĐIỀU TRA");

        const submitInterrogationBtn = page.getByRole("button", { name: "ĐIỀU TRA", exact: true });
        await expect(submitInterrogationBtn).toBeVisible();
        await submitInterrogationBtn.click();

        // 9.3. Câu hỏi phụ chất vấn mở rộng Lan
        const followupPin = page.locator('[data-node-kind="followup"][data-subject-key="lan"], [data-pin-id*="followup"]').first();
        await expect(followupPin).toBeAttached({ timeout: 15_000 });
        await followupPin.evaluate((el: HTMLElement) => el.click());

        await page.getByRole("button", { name: "KHÔNG", exact: true }).click();
        await page.getByRole("button", { name: "CẬP NHẬT KẾT LUẬN", exact: true }).click();

        // Đóng CulpritEpilogueModal nếu xuất hiện sau khi trả lời câu hỏi phụ
        const nextInvestigateBtn = page.getByRole("button", { name: "TIẾP TỤC ĐIỀU TRA", exact: true });
        await expect(nextInvestigateBtn).toBeVisible({ timeout: 15_000 });
        await nextInvestigateBtn.click();

        // 9.4. Cáo trạng (kết án sai bị từ chối; kết án đúng được chấp thuận)
        const indictmentPin = page.locator('[data-node-kind="indictment"]').first();
        await expect(indictmentPin).toBeAttached({ timeout: 15_000 });
        await indictmentPin.evaluate((el: HTMLElement) => el.click());

        await expect(page.getByText("BẢN KẾT LUẬN ĐIỀU TRA", { exact: false }).first()).toBeVisible({ timeout: 15_000 });

        // Nộp cáo trạng sai: Đỗ Quốc Huy -> bị từ chối
        const suspectInput = page.getByPlaceholder("Nhập hoặc chọn tên bị can...");
        await expect(suspectInput).toBeVisible();
        await suspectInput.fill("Đỗ Quốc Huy");

        const motiveBtn = page.getByRole("button", { name: /Mâu thuẫn tài chính/i }).first();
        await expect(motiveBtn).toBeVisible();
        await motiveBtn.click();

        const evidenceInput = page.getByPlaceholder("Nhập mã chứng cứ (ví dụ", { exact: false });
        await expect(evidenceInput).toBeVisible();
        await evidenceInput.fill("V2-01");

        await page.getByRole("button", { name: /ĐỀ NGHỊ TRUY TỐ/i }).click();
        await expect(
          page.getByText("Kết luận đối tượng chưa chính xác", { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });

        // Nộp cáo trạng đúng: Phạm Mai Lan -> chấp thuận
        await suspectInput.fill("Phạm Mai Lan");
        await page.getByRole("button", { name: /ĐỀ NGHỊ TRUY TỐ/i }).click();

        // 9.5. KÝ SỰ HẬU ÁN hiển thị với nội dung đã biên soạn
        await expect(
          page.getByText("KÝ SỰ HẬU ÁN", { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });

        await expect(
          page.getByText("Phạm Mai Lan đã thừa nhận toàn bộ hành vi phạm tội", { exact: false }).first(),
        ).toBeVisible({ timeout: 15_000 });

        await page.screenshot({
          path: testInfo.outputPath("v2-gameplay-board.png"),
          fullPage: false,
        });
      });
    } finally {
      // ----------------------------------------------------------------------
      // B18-6: Dọn sạch triệt để case test và file Storage
      // ----------------------------------------------------------------------
      try {
        await page.goto("about:blank");
      } catch {}

      if (createdSlug && createdSlug.startsWith("e2e_")) {
        try {
          await deleteTestCase(createdSlug);
          await cleanupE2EStorage("e2e");
        } catch (cleanupErr) {
          console.warn("Lỗi cleanup e2e v2 case:", cleanupErr);
        }
      }

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
