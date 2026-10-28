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

/** Bấm nút LƯU chung của Checkpoint Studio và chờ lưu xong. */
async function saveStudio(page: Page) {
  const btn = page.getByTitle("Lưu tất cả thay đổi (Ctrl+S)");
  await expect(btn).toBeEnabled({ timeout: 15_000 });
  await btn.click();
  await expect(
    page.getByText("Đã lưu toàn bộ thay đổi thành công!").first(),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Chưa lưu", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
    timeout: 15_000,
  });
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
    let lanKey = "";

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
      // BƯỚC 3: Thêm 4 bộ hồ sơ qua Dossier Studio
      // ----------------------------------------------------------------------
      await test.step("3. Thêm 4 bộ hồ sơ qua Dossier Studio", async () => {
        await page.goto(`/studio/dossier?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
          timeout: 15_000,
        });

        const dossiers = [
          "Bộ A - Hồ Sơ Khởi Đầu",
          "Bộ B - Hồ Sơ Pháp Y",
          "Bộ C - Hồ Sơ Hiện Trường",
          "Bộ D - Hồ Sơ Mở Rộng",
        ];

        for (const title of dossiers) {
          const addBtn = page
            .getByRole("button", { name: /^\s*(Thêm|\+ Tạo bộ hồ sơ đầu tiên)\s*$/i })
            .first();
          await expect(addBtn).toBeVisible();
          await addBtn.click();

          const titleInput = page.getByPlaceholder("VD: Bộ A, Hồ Sơ Hiện Trường...");
          await expect(titleInput).toBeVisible();
          await titleInput.fill(title);

          const saveDossierBtn = page.getByRole("button", { name: "Lưu bộ hồ sơ" });
          await saveDossierBtn.click();
          await expect(saveDossierBtn).not.toBeVisible({ timeout: 15_000 });
          await expect(page.getByText(title).first()).toBeVisible({
            timeout: 15_000,
          });
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 4: Thêm 4 vật chứng trong Dossier Studio (V2-01 ... V2-04)
      // ----------------------------------------------------------------------
      await test.step("4. Thêm 4 vật chứng trong Dossier Studio (V2-01 ... V2-04)", async () => {
        const items = [
          { title: "Dao găm sắc nhọn", code: "V2-01" },
          { title: "Bản kê giao dịch", code: "V2-02" },
          { title: "Mẫu đối chiếu dấu vết", code: "V2-03" },
          { title: "Biên lai chuyển khoản", code: "V2-04" },
        ];

        for (const item of items) {
          await page.getByTitle("Thêm chứng cứ / ảnh hiện trường mới").click();

          const codeInput = page.getByPlaceholder("VD: A-01, B-02...");
          await expect(codeInput).toBeVisible();
          await codeInput.fill(item.code);

          const titleInput = page.getByPlaceholder(
            "VD: Ảnh mảnh bình vỡ, Sổ ghi nợ, Bài báo cũ 1996...",
          );
          await titleInput.fill(item.title);
        }

        await page
          .getByTitle("Lưu lại toàn bộ dữ liệu vào Database Supabase")
          .click();
        await expect(
          page.getByText("Đã lưu toàn bộ tài liệu & chứng cứ!").first(),
        ).toBeVisible({ timeout: 15_000 });

        const admin = getAdminClient();
        if (admin) {
          const { data } = await admin
            .from("case_evidence")
            .select("code")
            .eq("case_slug", createdSlug);
          expect((data || []).map((r) => r.code).sort()).toEqual(
            items.map((i) => i.code).sort(),
          );
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 5: Nhân vật + thẩm tra 2 lớp trong Checkpoint Studio
      // ----------------------------------------------------------------------
      await test.step("5. Thêm nạn nhân + 3 nghi phạm (kèm thẩm tra) trong Checkpoint Studio", async () => {
        page.on("dialog", (dialog) => dialog.accept());
        await page.goto(`/studio/checkpoints?case=${createdSlug}`);
        await expect(page.locator('[data-studio-ready="true"]').first()).toBeVisible({
          timeout: 15_000,
        });

        const characters = [
          { name: "Hoàng Văn Nam", role: "victim" },
          {
            name: "Đỗ Quốc Huy",
            role: "suspect",
            motive: "V2-01",
            contradiction: "V2-02",
          },
          {
            name: "Phạm Mai Lan",
            role: "suspect",
            motive: "V2-01",
            contradiction: "V2-03",
            avatar: "/brand/logo-x.png",
          },
          {
            name: "Bùi Đức Minh",
            role: "suspect",
            motive: "V2-02",
            contradiction: "V2-04",
          },
        ];

        for (const char of characters) {
          await page.getByTitle("Tạo nhân vật mới").click();

          const nameInput = page.getByPlaceholder(
            "VD: Lê Quang Vũ, Nguyễn Thanh Tùng...",
          );
          await expect(nameInput).toBeVisible();
          await nameInput.fill(char.name);

          const roleSelect = page.locator("select", {
            has: page.locator('option[value="related"]'),
          });
          await roleSelect.selectOption(char.role);

          if (char.avatar) {
            await page.getByTitle("Dán link ảnh đại diện (Drive / Web)").click();
            await page
              .getByPlaceholder("Dán link ảnh Google Drive hoặc URL trực tiếp...")
              .fill(char.avatar);
          }

          if (char.motive && char.contradiction) {
            const motiveInput = page
              .locator(
                'label:has-text("Vật chứng bắt buộc (chứng minh động cơ)") input',
              )
              .first();
            await expect(motiveInput).toBeVisible();
            await motiveInput.fill(char.motive);
            await motiveInput.press("Enter");

            await page
              .getByRole("button", { name: "Mâu thuẫn lời khai" })
              .first()
              .click();
            const contradictionInput = page
              .locator(
                'label:has-text("Vật chứng bắt buộc (chứng minh mâu thuẫn)") input',
              )
              .first();
            await expect(contradictionInput).toBeVisible();
            await contradictionInput.fill(char.contradiction);
            await contradictionInput.press("Enter");
          }

          await saveStudio(page);
        }

        const admin = getAdminClient();
        if (admin) {
          const { data: chars } = await admin
            .from("case_characters")
            .select("key, name, role")
            .eq("case_slug", createdSlug);
          expect(chars).toHaveLength(4);
          const suspects = (chars || []).filter((c) => c.role === "suspect");
          lanKey = suspects.find((c) => c.name === "Phạm Mai Lan")?.key || "";
          expect(lanKey).toBeTruthy();
          const { data: interrogations } = await admin
            .from("case_checkpoints")
            .select("subject_key")
            .eq("case_id", createdSlug)
            .eq("kind", "suspect_interrogation");
          expect((interrogations || []).map((r) => r.subject_key).sort()).toEqual(
            suspects.map((c) => c.key).sort(),
          );
        }
      });

      // ----------------------------------------------------------------------
      // BƯỚC 6: Checkpoint tra SĐT, câu hỏi phụ, cáo trạng, hậu án (có depends_on)
      // ----------------------------------------------------------------------
      await test.step("6. Thêm checkpoint tra SĐT, câu hỏi phụ, cáo trạng, hậu án", async () => {
        const kindSelect = page.locator("select", {
          has: page.locator('option[value="phone_lookup"]'),
        });
        const dependsSelect = page.locator("select", {
          has: page.locator("option", { hasText: "Không phụ thuộc" }),
        });

        async function newCheckpoint(kind: string, title?: string) {
          await page.getByTitle("Tạo checkpoint mới").click();
          await expect(kindSelect).toBeVisible();
          await kindSelect.selectOption(kind);
          if (title) {
            const titleInput = page.getByLabel("Tiêu đề checkpoint");
            await titleInput.fill(title);
            await expect(titleInput).toHaveValue(title);
          }
        }

        // 6.1. Tra cứu SĐT: 3 ô
        await newCheckpoint("phone_lookup", "Tra cứu số điện thoại nghi phạm");
        for (let i = 0; i < 3; i++) {
          await page.getByRole("button", { name: "Thêm ô tra cứu" }).click();
        }
        const answerInputs = page.getByPlaceholder("VD: Lê Quang Vũ");
        await expect(answerInputs).toHaveCount(3);
        await answerInputs.nth(0).fill("Đỗ Quốc Huy");
        await answerInputs.nth(1).fill("Phạm Mai Lan");
        await answerInputs.nth(2).fill("Bùi Đức Minh");
        await saveStudio(page);

        // 6.2. Câu hỏi phụ cho Lan (pin khớp theo tên trong tiêu đề)
        await newCheckpoint("followup", "Chất vấn mở rộng Phạm Mai Lan");
        await page
          .locator('label:has-text("Loại câu hỏi phụ") select')
          .selectOption("choice");
        const optionsInput = page.getByPlaceholder("Nhập phương án rồi Enter...");
        await optionsInput.fill("CÓ");
        await optionsInput.press("Enter");
        await optionsInput.fill("KHÔNG");
        await optionsInput.press("Enter");
        await page.getByPlaceholder("Nhập đáp án đúng...").fill("KHÔNG");
        await dependsSelect.selectOption({ label: "Thẩm tra Phạm Mai Lan" });
        await saveStudio(page);

        // 6.3. Cáo trạng
        await newCheckpoint("indictment", "Lập bản cáo trạng kết án");
        const chip = async (label: string, values: string[]) => {
          const input = page.locator(`label:has-text("${label}") input`).first();
          await expect(input).toBeVisible();
          for (const v of values) {
            await input.fill(v);
            await input.press("Enter");
          }
        };
        await chip("Nghi phạm bị can đúng", ["Phạm Mai Lan"]);
        await chip("Động cơ phạm tội được chấp nhận", ["Mâu thuẫn tài chính"]);
        await chip("Mã chứng cứ bắt buộc để truy tố", ["V2-01"]);
        await chip("Mã chứng cứ bổ trợ", ["V2-02", "V2-03"]);
        await dependsSelect.selectOption({ label: "Chất vấn mở rộng Phạm Mai Lan" });
        await saveStudio(page);

        // 6.4. Hậu án: vụ mới đã có sẵn checkpoint "Hậu án" từ mẫu, sửa nội dung
        await page.getByRole("button", { name: /^Checkpoint \(\d+\)$/ }).click();
        const cpPicker = page.getByTitle("Chọn checkpoint để edit");
        const epilogueValue = await cpPicker
          .locator("option", { hasText: "Hậu án" })
          .first()
          .getAttribute("value");
        expect(epilogueValue).toBeTruthy();
        await cpPicker.selectOption(epilogueValue!);
        const monologue = page.locator("textarea").filter({ visible: true }).last();
        await expect(monologue).toBeVisible();
        await monologue.fill(
          "Vụ án Trốn Tìm v2 đã được làm sáng tỏ. Phạm Mai Lan đã thừa nhận toàn bộ hành vi phạm tội.",
        );
        await dependsSelect.selectOption({ label: "Lập bản cáo trạng kết án" });
        await saveStudio(page);

        const admin = getAdminClient();
        if (admin) {
          const { data } = await admin
            .from("case_checkpoints")
            .select("kind")
            .eq("case_id", createdSlug);
          expect((data || []).map((r) => r.kind).sort()).toEqual([
            "choice",
            "epilogue",
            "followup",
            "indictment",
            "phone_lookup",
            "suspect_interrogation",
            "suspect_interrogation",
            "suspect_interrogation",
          ]);
        }
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
      // BƯỚC 8: Chơi thử trực tiếp từ /evidence/web?case_id=<slug> đến KÝ SỰ HẬU ÁN
      // ----------------------------------------------------------------------
      await test.step("8. Chơi thử trực tiếp tại /evidence/web?case_id=<slug>", async () => {
        await page.route("**/api/scan-answer", (route) =>
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

        const phoneInputs = page.getByPlaceholder("Nhập họ tên đầy đủ...");
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
        const lanPin = page.locator(`[data-node-kind="suspect"][data-subject-key="${lanKey}"]`).first();
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
        const followupPin = page.locator(`[data-node-kind="followup"][data-subject-key="${lanKey}"]`).first();
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
