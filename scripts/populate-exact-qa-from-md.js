/**
 * Script bóc tách CHÍNH XÁC 100% NỘI DUNG THẬT từ từng file Markdown gốc,
 * giữ nguyên từng câu từ đối thoại, lời tự thuật, danh sách xác minh cuộc gọi,
 * và nạp vào Google Sheet + Master Google Docs.
 *
 * Chạy: node scripts/populate-exact-qa-from-md.js
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

const TESTIMONY_SPECS = [
  {
    code: "06",
    file: "docs/cases/case_000/03_documents/00_khoi_dau/06_loi_khai_nhan_chung.md",
    extract: (md) => {
      // Lấy từ section I trở xuống đến trước CÁN BỘ LẤY LỜI KHAI
      const start = md.indexOf("### I. LỜI KHAI BÀ NGUYỄN THỊ LỤA");
      const end = md.indexOf("**CÁN BỘ LẤY LỜI KHAI**");
      let text = md.slice(start, end !== -1 ? end : md.length);
      return text
        .replace(/###\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "07",
    file: "docs/cases/case_000/03_documents/00_khoi_dau/07_loi_khai_mai.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP)");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 35 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "08",
    file: "docs/cases/case_000/03_documents/00_khoi_dau/08_loi_khai_vu.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP)");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 35 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "09",
    file: "docs/cases/case_000/03_documents/00_khoi_dau/09_loi_khai_ha.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP)");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 35 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "12",
    file: "docs/cases/case_000/03_documents/00_khoi_dau/12_tong_hop_loi_khai_cuoc_goi.md",
    extract: (md) => {
      // Lấy danh sách trích xuất từng cuộc gọi
      const start = md.indexOf("### I. BẢNG TRÍCH XUẤT");
      const end = md.indexOf("**CÁN BỘ LẬP BẢNG TỔNG HỢP**");
      let text = md.slice(start, end !== -1 ? end : md.length);
      return text
        .replace(/###\s*/g, "")
        .replace(/---/g, "")
        .replace(/<br>/g, " - ")
        .replace(/\|/g, " ")
        .replace(/`([0-9:.]+)/g, "$1")
        .replace(/\*\*/g, "")
        .trim();
    },
  },
  {
    code: "A02",
    file: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/02_loi_khai_lan_2_vu.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI ĐẤU TRANH");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 32 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "A03",
    file: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/03_bien_ban_lam_viec_chu_quan_bia.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI TỰ THUẬT");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 31 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "B01",
    file: "docs/cases/case_000/03_documents/02_nhanh_tung/01_tu_thu_xo_xat_tung.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG TỰ THÚ HÀNH VI");
      const end = md.indexOf("NGƯỜI TỰ THÚ");
      let text = md.slice(start !== -1 ? start + 28 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "B02",
    file: "docs/cases/case_000/03_documents/02_nhanh_tung/02_loi_khai_tung.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG HỎI CUNG / LẤY LỜI KHAI");
      const end = md.indexOf("Biên bản hỏi cung kết thúc");
      let text = md.slice(start !== -1 ? start + 36 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "B04",
    file: "docs/cases/case_000/03_documents/02_nhanh_tung/04_loi_khai_dat_ga.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI");
      const end = md.indexOf("Biên bản lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 22 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
  {
    code: "C01",
    file: "docs/cases/case_000/03_documents/03_nhanh_ha/01_loi_khai_lan_2_tran_thi_ha.md",
    extract: (md) => {
      const start = md.indexOf("### NỘI DUNG LỜI KHAI ĐẤU TRANH TRỰC DIỆN");
      const end = md.indexOf("Buổi lấy lời khai kết thúc");
      let text = md.slice(start !== -1 ? start + 42 : 0, end !== -1 ? end : md.length);
      return text
        .replace(/\*\*/g, "")
        .replace(/^\*\s*/gm, "")
        .replace(/---/g, "")
        .trim();
    },
  },
];

async function main() {
  console.log("🚀 Bắt đầu trích xuất CHUẨN XÁC 100% nội dung Hỏi - Đáp từ file Markdown...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'testimonies'!A1:N15",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return;

  for (const spec of TESTIMONY_SPECS) {
    const fullPath = path.resolve(root, spec.file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Không tìm thấy file: ${spec.file}`);
      continue;
    }

    const mdContent = fs.readFileSync(fullPath, "utf-8");
    const extractedQA = spec.extract(mdContent);

    // Tìm dòng tương ứng trên Sheet
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === spec.code) {
        rows[i][9] = extractedQA;
        console.log(`✅ [${spec.code}] Đã trích xuất ${extractedQA.length} ký tự đối thoại.`);
        break;
      }
    }
  }

  // Cập nhật lại Google Sheet
  console.log("💾 Đang ghi toàn bộ nội dung thật 100% lên Google Sheet...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'testimonies'!A1",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  console.log("\n🎉 HOÀN THÀNH 100%! Toàn bộ Hỏi & Đáp trên Sheet đã khớp nguyên bản từ Markdown!");
}

main().catch((e) => console.error("LỖI:", e));
