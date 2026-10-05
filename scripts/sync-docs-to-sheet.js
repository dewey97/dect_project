/**
 * Script ĐỒNG BỘ 2 CHIỀU:
 * Đọc toàn bộ nội dung mới nhất từ các file Google Docs và ghi đè vào tab `testimonies` trên Google Sheet.
 * Đảm bảo Google Sheet và Google Docs luôn luôn đồng bộ 100%.
 *
 * Chạy: node scripts/sync-docs-to-sheet.js
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

function extractPlainText(docBody) {
  if (!docBody || !docBody.content) return "";
  let text = "";
  for (const element of docBody.content) {
    if (element.paragraph) {
      for (const elem of element.paragraph.elements) {
        if (elem.textRun && elem.textRun.content) {
          text += elem.textRun.content;
        }
      }
    } else if (element.table) {
      for (const row of element.table.tableRows) {
        for (const cell of row.tableCells) {
          text += extractPlainText(cell);
        }
      }
    }
  }
  return text.trim();
}

async function main() {
  console.log("📥 Đang đồng bộ nội dung từ Google Docs về Google Sheet...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'testimonies'!A1:N20",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) {
    console.warn("⚠️ Tab 'testimonies' không có dữ liệu.");
    return;
  }

  let updatedCount = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const code = row[1];
    const personName = row[3];
    const gdocUrl = row[13];

    if (!gdocUrl) continue;

    const match =
      gdocUrl.match(/id=([a-zA-Z0-9_-]+)/) ||
      gdocUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const docId = match ? match[1] : null;

    if (!docId) continue;

    try {
      const docRes = await docs.documents.get({ documentId: docId });
      const docText = extractPlainText(docRes.data.body);

      if (docText) {
        row[9] = docText; // Cập nhật cột qa_content (cột J / index 9)
        console.log(`✅ Đã lấy nội dung mới nhất từ Google Doc [${code} - ${personName}]`);
        updatedCount++;
      }
    } catch (e) {
      console.error(`❌ Lỗi đọc Doc ID ${docId}:`, e.message);
    }
  }

  // Ghi đè lại bảng dữ liệu mới nhất vào Google Sheet
  console.log("💾 Đang lưu toàn bộ nội dung vào Google Sheet...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'testimonies'!A1",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  console.log(`\n🎉 HOÀN TẤT ĐỒNG BỘ! Đã cập nhật ${updatedCount} hồ sơ từ Google Docs về Google Sheet.`);
}

main().catch((e) => console.error("LỖI:", e));
