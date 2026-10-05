/**
 * Script tổ chức phân cấp 3 TAB LỚN trong Master Google Doc:
 * 1. 📁 I. HỒ SƠ LỜI KHAI & THẨM VẤN (11 tab con)
 * 2. 📁 II. LÝ LỊCH & NHÂN THÂN NHÂN VẬT (6 tab con)
 * 3. 📁 III. BIÊN BẢN HIỆN TRƯỜNG & KHÁM XÉT (4 tab con)
 *
 * Chạy: node scripts/organize-gdoc-hierarchical-tabs.js
 */
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const envPath = path.resolve(root, ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const t = line.trim();
      if (!t || t.startsWith("#")) return;
      const i = t.indexOf("=");
      if (i > -1) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    });
}

const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(root, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(root, "google-service-account.json");

const MASTER_DOC_ID = "1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc";

// 3 nhóm tab lớn và các tab con tương ứng
const HIERARCHY_GROUPS = [
  {
    parentTitle: "📁 I. HỒ SƠ LỜI KHAI & THẨM VẤN",
    subtabs: [
      "[06] Lời khai Nhân chứng (Bà Lụa & Ông Tiến)",
      "[07] Lời khai Nguyễn Ngọc Mai (Lần 1)",
      "[08] Lời khai Lê Quang Vũ (Lần 1)",
      "[09] Lời khai Trần Thị Hà (Lần 1)",
      "[12] Báo cáo Lời khai Cuộc gọi Nạn nhân",
      "[A02] Lời khai Lê Quang Vũ (Lần 2)",
      "[A03] Biên bản làm việc Chủ Quán Bia 88",
      "[B01] Bản Tự Thú Nguyễn Thanh Tùng",
      "[B02] Lời khai Nguyễn Thanh Tùng (Chi tiết)",
      "[B04] Lời khai Trịnh Thành Đạt (Đạt Gà)",
      "[C01] Lời khai Nhận tội Trần Thị Hà (Lần 2)",
    ],
  },
  {
    parentTitle: "📁 II. LÝ LỊCH & NHÂN THÂN NHÂN VẬT",
    subtabs: [
      "[04] Lý lịch Nạn nhân Nguyễn Văn Khang",
      "[05a] Lý lịch Nguyễn Ngọc Mai",
      "[05b] Lý lịch Lê Quang Vũ",
      "[05c] Lý lịch Trần Thị Hà",
      "[B03] Lý lịch Nguyễn Thanh Tùng",
      "[B05] Lý lịch Trịnh Thành Đạt (Đạt Gà)",
    ],
  },
  {
    parentTitle: "📁 III. BIÊN BẢN HIỆN TRƯỜNG & KHÁM XÉT",
    subtabs: [
      "[01] Biên bản Tiếp nhận Tin báo Tội phạm",
      "[03a] Biên bản Khám nghiệm Hiện trường",
      "[03b] Báo cáo Khám nghiệm Tử thi Sơ bộ",
      "[C03] Biên bản Khám xét Phòng trọ Trần Thị Hà",
    ],
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/documents"],
  });
  const docs = google.docs({ version: "v1", auth });

  console.log("🔍 Đang tải danh sách Tabs hiện tại từ Google Docs Master...");
  const doc = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  const existingTabs = doc.data.tabs || [];
  console.log(`📋 Tìm thấy ${existingTabs.length} tabs.`);

  // 1. Tạo hoặc tìm 3 Parent Tabs
  const parentMap = {};
  for (const group of HIERARCHY_GROUPS) {
    const found = existingTabs.find(
      (t) => t.tabProperties?.title === group.parentTitle
    );
    if (found) {
      parentMap[group.parentTitle] = found.tabProperties.tabId;
      console.log(
        `⚡ Đã có Parent Tab: "${group.parentTitle}" (ID: ${found.tabProperties.tabId})`
      );
    } else {
      console.log(`➕ Đang tạo Parent Tab: "${group.parentTitle}"...`);
      const addRes = await docs.documents.batchUpdate({
        documentId: MASTER_DOC_ID,
        requestBody: {
          requests: [
            {
              addDocumentTab: {
                tabProperties: {
                  title: group.parentTitle,
                },
              },
            },
          ],
        },
      });
      const newParentId =
        addRes.data.replies[0].addDocumentTab.tabProperties.tabId;
      parentMap[group.parentTitle] = newParentId;
      console.log(
        `✅ Đã tạo Parent Tab: "${group.parentTitle}" (ID: ${newParentId})`
      );
      await sleep(1000);
    }
  }

  // 2. Cập nhật parentTabId cho tất cả các subtabs
  console.log("\n🔗 Đang gắn các Tab con vào đúng Tab cha...");
  for (const group of HIERARCHY_GROUPS) {
    const parentTabId = parentMap[group.parentTitle];
    for (const subTitle of group.subtabs) {
      const foundSub = existingTabs.find(
        (t) => t.tabProperties?.title === subTitle
      );
      if (!foundSub) {
        console.warn(`⚠️ Không tìm thấy subtab: "${subTitle}"`);
        continue;
      }
      const subTabId = foundSub.tabProperties.tabId;
      if (foundSub.tabProperties.parentTabId === parentTabId) {
        console.log(`✔️ Subtab "${subTitle}" đã thuộc tab cha.`);
        continue;
      }

      console.log(
        `🔄 Đang gán "${subTitle}" (ID: ${subTabId}) -> "${group.parentTitle}"...`
      );
      try {
        await docs.documents.batchUpdate({
          documentId: MASTER_DOC_ID,
          requestBody: {
            requests: [
              {
                updateDocumentTabProperties: {
                  tabProperties: {
                    tabId: subTabId,
                    parentTabId: parentTabId,
                  },
                  fields: "parentTabId",
                },
              },
            ],
          },
        });
        console.log(`✅ Thành công.`);
        await sleep(800);
      } catch (err) {
        console.error(`❌ Lỗi khi gán ${subTitle}:`, err.message);
      }
    }
  }

  console.log(
    "\n🎉 HOÀN TẤT TỔ CHỨC CẤU TRÚC PHÂN CẤP 3 TAB LỚN TRONG GOOGLE DOCS MASTER!"
  );
}

main().catch(console.error);
