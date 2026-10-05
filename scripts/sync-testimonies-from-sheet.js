/**
 * Script kéo dữ liệu lời khai từ Tab `testimonies` trên Google Sheet về cập nhật vào Docs Markdown của dự án.
 *
 * Chạy: node scripts/sync-testimonies-from-sheet.js
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

const PATH_MAP = {
  "06": "docs/cases/case_000/03_documents/00_khoi_dau/06_loi_khai_nhan_chung.md",
  "07": "docs/cases/case_000/03_documents/00_khoi_dau/07_loi_khai_mai.md",
  "08": "docs/cases/case_000/03_documents/00_khoi_dau/08_loi_khai_vu.md",
  "09": "docs/cases/case_000/03_documents/00_khoi_dau/09_loi_khai_ha.md",
  "12": "docs/cases/case_000/03_documents/00_khoi_dau/12_tong_hop_loi_khai_cuoc_goi.md",
  A02: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/02_loi_khai_lan_2_vu.md",
  A03: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/03_bien_ban_lam_viec_chu_quan_bia.md",
  B01: "docs/cases/case_000/03_documents/02_nhanh_tung/01_tu_thu_xo_xat_tung.md",
  B02: "docs/cases/case_000/03_documents/02_nhanh_tung/02_loi_khai_tung.md",
  B04: "docs/cases/case_000/03_documents/02_nhanh_tung/04_loi_khai_dat_ga.md",
  C01: "docs/cases/case_000/03_documents/03_nhanh_ha/01_loi_khai_lan_2_tran_thi_ha.md",
};

async function main() {
  console.log("📥 Đang kéo dữ liệu Lời Khai từ Google Sheet về Docs Markdown...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'testimonies'!A2:N100",
  });

  const rows = res.data.values || [];
  if (!rows.length) {
    console.warn("⚠️ Không tìm thấy dữ liệu trong tab 'testimonies'.");
    return;
  }

  let updatedCount = 0;
  for (const row of rows) {
    const docCode = row[1];
    const qaContent = row[9];

    if (!docCode || !qaContent) continue;

    const relPath = PATH_MAP[docCode];
    if (relPath) {
      const fullPath = path.resolve(root, relPath);
      fs.writeFileSync(fullPath, qaContent, "utf-8");
      console.log(`✅ Đã cập nhật file Markdown: ${relPath}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Đã đồng bộ thành công ${updatedCount} file tài liệu Markdown từ Google Sheet!`);
}

main().catch((err) => {
  console.error("❌ LỖI:", err);
});
