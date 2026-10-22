/**
 * Script phân chia THÀNH TỪNG TAB RIÊNG BIỆT (Google Document Tabs)
 * trong 1 File Google Doc Master duy nhất:
 * "1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc"
 *
 * Mỗi lời khai là một Tab ở cột bên trái.
 * Link từng Tab được cập nhật thẳng vào Google Sheet!
 *
 * Chạy: node scripts/build-master-gdoc-real-tabs.js
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

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(root, process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(root, "google-service-account.json");

const MASTER_DOC_ID = "1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc";

function cleanContent(rawContent) {
  const lines = (rawContent || "").split("\n");
  const filtered = [];
  for (let l of lines) {
    let t = l.trim();
    if (!t) {
      filtered.push("");
      continue;
    }
    if (
      t.startsWith("#") ||
      t.startsWith("---") ||
      t.includes("CỘNG HÒA") ||
      t.includes("Độc lập") ||
      t.includes("CÔNG AN") ||
      t.startsWith("Số:") ||
      t.startsWith("*Hà Nội") ||
      t.startsWith("BIÊN BẢN") ||
      t.startsWith("BÁO CÁO") ||
      t.startsWith("BẢN TỰ THÚ") ||
      t.startsWith("*(Vụ án") ||
      t.startsWith("*(Ghi nhận") ||
      t.startsWith("ĐIỀU TRA") ||
      t.startsWith("NGƯỜI KHAI")
    ) {
      continue;
    }
    t = t.replace(/^\*\s+/, "").replace(/\*\*/g, "").replace(/###/g, "").replace(/`/g, "").trim();
    filtered.push(t);
  }
  return filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function main() {
  console.log("🚀 Bắt đầu phân chia 11 Document Tabs trong Master Google Doc...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Đọc dữ liệu từ Google Sheet tab testimonies
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'testimonies'!A2:N15",
  });

  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.warn("⚠️ Không có dữ liệu trong tab 'testimonies'.");
    return;
  }

  // 2. Lấy thông tin tabs hiện tại của Master Doc
  const docInfo = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  const existingTabs = docInfo.data.tabs || [];
  console.log(`📋 Tabs hiện có (${existingTabs.length}):`, existingTabs.map((t) => t.tabProperties?.title));

  // 3. Xóa hoặc tái sử dụng tabs
  // Chúng ta sẽ tạo lần lượt 11 tabs ứng với 11 hồ sơ
  const tabMap = {}; // code -> tabId

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const code = r[1];
    const personName = r[3];
    const tabTitle = `[${code}] ${personName.split("(")[0].trim()}`;

    // Kiểm tra xem đã có tab với title này chưa
    let foundTab = existingTabs.find((t) => t.tabProperties?.title === tabTitle);
    
    // Nếu i == 0 và chưa có tab nào ngoài default tab (t.0), đổi tên default tab
    if (i === 0 && existingTabs.length > 0 && !foundTab) {
      const defaultTab = existingTabs[0];
      try {
        await docs.documents.batchUpdate({
          documentId: MASTER_DOC_ID,
          requestBody: {
            requests: [
              {
                updateDocumentStyle: {
                  tabId: defaultTab.tabProperties.tabId,
                  documentStyle: {},
                  fields: "pageNumberStart",
                },
              },
            ],
          },
        });
      } catch (e) {}
      foundTab = defaultTab;
    }

    if (!foundTab) {
      console.log(`➕ Đang tạo Tab mới: "${tabTitle}"...`);
      const addRes = await docs.documents.batchUpdate({
        documentId: MASTER_DOC_ID,
        requestBody: {
          requests: [
            {
              addDocumentTab: {
                tabProperties: {
                  title: tabTitle,
                  index: i,
                },
              },
            },
          ],
        },
      });
      const newTabId = addRes.data.replies[0].addDocumentTab.tabProperties.tabId;
      tabMap[code] = newTabId;
      console.log(`✅ Đã tạo Tab ID: ${newTabId}`);
    } else {
      tabMap[code] = foundTab.tabProperties.tabId;
      console.log(`⚡ Tái sử dụng Tab: "${tabTitle}" (ID: ${tabMap[code]})`);
    }
  }

  // 4. Lấy lại cấu trúc doc mới nhất sau khi tạo tabs để ghi nội dung
  const updatedDoc = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  const allTabs = updatedDoc.data.tabs || [];
  console.log(`\n✍️ Bắt đầu ghi nội dung và format cho từng Tab...`);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const code = r[1];
    const personName = r[3];
    const relationship = r[4] || "";
    const docTitle = r[5];
    const docNumber = r[6];
    const timeTaken = r[7];
    const officer = r[8];
    const rawContent = r[9] || "";
    const tabId = tabMap[code];

    if (!tabId) continue;

    console.log(`🎨 Formatting Tab [${code}] (Tab ID: ${tabId})...`);

    // Tìm tab content
    const currentTab = allTabs.find((t) => t.tabProperties?.tabId === tabId);
    const tabBodyContent = currentTab?.documentTab?.body?.content || [];
    const lastElem = tabBodyContent[tabBodyContent.length - 1];
    const endIndex = lastElem ? lastElem.endIndex : 1;

    // Xóa nội dung cũ trong tab nếu có
    if (endIndex > 2) {
      await docs.documents.batchUpdate({
        documentId: MASTER_DOC_ID,
        requestBody: {
          requests: [
            {
              deleteContentRange: {
                range: {
                  tabId,
                  startIndex: 1,
                  endIndex: endIndex - 1,
                },
              },
            },
          ],
        },
      });
    }

    // Soạn thảo nội dung
    const cleanPerson = personName.split("(")[0].trim();
    const officerList = officer
      .split(",")
      .map((o, idx) => `${idx + 1}. ${o.trim()}`)
      .join("\n");

    const cleanBody = cleanContent(rawContent);
    const headerBlock =
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n" +
      "────────────────────────────────────────────────────────────\n" +
      `CÔNG AN THÀNH PHỐ HÀ NỘI                 Số: ${docNumber}\n` +
      `PHÒNG CẢNH SÁT HÌNH SỰ (PC02)             ${timeTaken}\n\n`;

    const titleBlock = `${docTitle.toUpperCase()}\n(Vụ án mạng tại số 14 Đường Bờ Sông, Phân khu Cảng)\n\n`;

    const adminBlock =
      `Vào hồi ${timeTaken}, tại Trụ sở Cơ quan Cảnh sát điều tra (PC02) Công an TP. Hà Nội.\n` +
      `Chúng tôi gồm:\n` +
      `${officerList}\n\n` +
      `Tiến hành làm việc với người tham gia tố tụng:\n` +
      `• Họ và tên: ${cleanPerson}\n` +
      `• Tư cách tham gia / Mối quan hệ: ${relationship}\n` +
      `────────────────────────────────────────────────────────────\n\n` +
      `NỘI DUNG LÀM VIỆC (HỎI VÀ ĐÁP):\n\n`;

    const signBlock =
      "\n\n\n" +
      `               ĐIỀU TRA VIÊN                                 NGƯỜI KHAI BÁO\n` +
      `             (Ký, ghi rõ họ tên)                           (Ký, ghi rõ họ tên)\n\n\n\n\n` +
      `           ${officer.split(",")[0].trim().padEnd(30, " ")}          ${cleanPerson}\n`;

    const fullText = headerBlock + titleBlock + adminBlock + cleanBody + signBlock;

    // Insert text vào tab
    await docs.documents.batchUpdate({
      documentId: MASTER_DOC_ID,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { tabId, index: 1 },
              text: fullText,
            },
          },
        ],
      },
    });

    // Format Times New Roman & Styling cho Tab
    const formatReqs = [
      {
        updateTextStyle: {
          range: { tabId, startIndex: 1, endIndex: fullText.length },
          textStyle: {
            weightedFontFamily: { fontFamily: "Times New Roman" },
            fontSize: { magnitude: 12, unit: "PT" },
          },
          fields: "weightedFontFamily,fontSize",
        },
      },
      {
        updateTextStyle: {
          range: { tabId, startIndex: 1, endIndex: 65 },
          textStyle: { bold: true },
          fields: "bold",
        },
      },
      {
        updateTextStyle: {
          range: {
            tabId,
            startIndex: headerBlock.length + 1,
            endIndex: headerBlock.length + docTitle.length + 1,
          },
          textStyle: { bold: true, fontSize: { magnitude: 14, unit: "PT" } },
          fields: "bold,fontSize",
        },
      },
    ];

    // Format Hỏi, Đáp & Biểu cảm trong ngoặc
    let searchIdx = 0;
    while (searchIdx < fullText.length) {
      const hoiIdx = fullText.indexOf("Hỏi", searchIdx);
      const dapIdx = fullText.indexOf("Đáp", searchIdx);
      let nextIdx = -1;
      if (hoiIdx !== -1 && dapIdx !== -1) nextIdx = Math.min(hoiIdx, dapIdx);
      else if (hoiIdx !== -1) nextIdx = hoiIdx;
      else if (dapIdx !== -1) nextIdx = dapIdx;
      if (nextIdx === -1) break;

      const colonIdx = fullText.indexOf(":", nextIdx);
      if (colonIdx !== -1 && colonIdx - nextIdx < 35) {
        formatReqs.push({
          updateTextStyle: {
            range: { tabId, startIndex: nextIdx + 1, endIndex: colonIdx + 2 },
            textStyle: { bold: true },
            fields: "bold",
          },
        });
        if (nextIdx === hoiIdx) {
          const lineEnd = fullText.indexOf("\n", colonIdx);
          if (lineEnd !== -1) {
            formatReqs.push({
              updateTextStyle: {
                range: { tabId, startIndex: colonIdx + 2, endIndex: lineEnd + 1 },
                textStyle: { italic: true },
                fields: "italic",
              },
            });
          }
        }
      }
      searchIdx = nextIdx + 4;
    }

    // Biểu cảm (khóc, ngập ngừng...)
    let pIdx = 0;
    while (pIdx < fullText.length) {
      const op = fullText.indexOf("(", pIdx);
      if (op === -1) break;
      const cl = fullText.indexOf(")", op);
      if (cl === -1 || cl - op > 80) {
        pIdx = op + 1;
        continue;
      }
      formatReqs.push({
        updateTextStyle: {
          range: { tabId, startIndex: op + 1, endIndex: cl + 2 },
          textStyle: { italic: true },
          fields: "italic",
        },
      });
      pIdx = cl + 1;
    }

    await docs.documents.batchUpdate({
      documentId: MASTER_DOC_ID,
      requestBody: { requests: formatReqs },
    });

    // Cập nhật URL chính xác của từng Tab vào bảng
    const tabUrl = `https://docs.google.com/document/d/${MASTER_DOC_ID}/edit?tab=${tabId}`;
    rows[i][13] = tabUrl;
    console.log(`✅ Hoàn thành Tab [${code}] -> ${tabUrl}`);
  }

  // 5. Cập nhật link Tab vào Google Sheet
  console.log("\n💾 Lưu link từng Tab vào Google Sheet...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'testimonies'!A2:N15",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  console.log("\n🎉 HOÀN THÀNH TẤT CẢ! Master Google Doc đã có 11 Document Tabs riêng biệt!");
}

main().catch((e) => console.error("LỖI:", e));
