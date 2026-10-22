/**
 * Script tự động xuất bản (Export) toàn bộ 21 Document Tabs
 * từ Master Google Doc về các file PDF trong thư mục `public/documents/case_000/...`
 *
 * Chạy: npm run export:docs-pdf
 */
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const https = require("https");

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

// Định nghĩa mapping file đích cho từng Document Tab
const TARGET_PDF_MAP = {
  "[06] Lời khai Nhân chứng (Bà Lụa & Ông Tiến)": "public/documents/case_000/phase_0/06_loi_khai_nhan_chung.pdf",
  "[07] Lời khai Nguyễn Ngọc Mai (Lần 1)": "public/documents/case_000/phase_0/07_loi_khai_mai.pdf",
  "[08] Lời khai Lê Quang Vũ (Lần 1)": "public/documents/case_000/phase_0/08_loi_khai_vu.pdf",
  "[09] Lời khai Trần Thị Hà (Lần 1)": "public/documents/case_000/phase_0/09_loi_khai_ha.pdf",
  "[12] Báo cáo Lời khai Cuộc gọi Nạn nhân": "public/documents/case_000/phase_0/12_tong_hop_loi_khai_cuoc_goi.pdf",
  "[A02] Lời khai Lê Quang Vũ (Lần 2)": "public/documents/case_000/phase_1/02_loi_khai_lan_2_vu.pdf",
  "[A03] Biên bản làm việc Chủ Quán Bia 88": "public/documents/case_000/phase_1/03_bien_ban_lam_viec_chu_quan_bia.pdf",
  "[B01] Bản Tự Thú Nguyễn Thanh Tùng": "public/documents/case_000/phase_2/01_tu_thu_xo_xat_tung.pdf",
  "[B02] Lời khai Nguyễn Thanh Tùng (Chi tiết)": "public/documents/case_000/phase_2/02_loi_khai_tung.pdf",
  "[B04] Lời khai Trần Văn Đạt (Đạt Gà)": "public/documents/case_000/phase_2/04_loi_khai_dat_ga.pdf",
  "[C01] Lời khai Nhận tội Trần Thị Hà (Lần 2)": "public/documents/case_000/phase_3/01_loi_khai_lan_2_tran_thi_ha.pdf",
  "[04] Lý lịch Nạn nhân Nguyễn Văn Khang": "public/documents/case_000/phase_0/04_nhan_than_nan_nhan.pdf",
  "[05a] Lý lịch Nguyễn Ngọc Mai": "public/documents/case_000/phase_0/05a_ly_lich_nguyen_ngoc_mai.pdf",
  "[05b] Lý lịch Lê Quang Vũ": "public/documents/case_000/phase_0/05b_ly_lich_le_quang_vu.pdf",
  "[05c] Lý lịch Trần Thị Hà": "public/documents/case_000/phase_0/05c_ly_lich_tran_thi_ha.pdf",
  "[B03] Lý lịch Nguyễn Thanh Tùng": "public/documents/case_000/phase_2/03_ly_lich_nguyen_thanh_tung.pdf",
  "[B05] Lý lịch Trần Văn Đạt (Đạt Gà)": "public/documents/case_000/phase_2/05_ly_lich_dat_ga.pdf",
  "[01] Biên bản Tiếp nhận Tin báo Tội phạm": "public/documents/case_000/phase_0/01_tiep_nhan_tin_bao.pdf",
  "[03a] Biên bản Khám nghiệm Hiện trường": "public/documents/case_000/phase_0/03a_bien_ban_kham_nghiem_hien_truong.pdf",
  "[03b] Báo cáo Khám nghiệm Tử thi Sơ bộ": "public/documents/case_000/phase_0/03b_bao_cao_kham_nghiem_tu_thi_so_bo.pdf",
  "[C03] Biên bản Khám xét Phòng trọ Trần Thị Hà": "public/documents/case_000/phase_3/03_kham_xet_phong_ha.pdf",
};

async function downloadTabAsPdf(token, tabId, destPath) {
  const url = `https://docs.google.com/document/d/${MASTER_DOC_ID}/export?format=pdf&tab=${tabId}`;
  const fullDest = path.resolve(root, destPath);
  const dir = path.dirname(fullDest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fullDest);
    https
      .get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            // Xử lý redirect nếu có
            https
              .get(
                response.headers.location,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
                (redirectRes) => {
                  redirectRes.pipe(file);
                  file.on("finish", () => {
                    file.close();
                    resolve();
                  });
                }
              )
              .on("error", reject);
          } else if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
          } else {
            reject(new Error(`HTTP Status ${response.statusCode}`));
          }
        }
      )
      .on("error", reject);
  });
}

async function main() {
  console.log("📥 Bắt đầu tự động xuất bản PDF trực tiếp từ Master Google Docs...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;

  const docs = google.docs({ version: "v1", auth });
  const docInfo = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  function getAllTabs(tabsList) {
    let result = [];
    for (const t of tabsList) {
      result.push(t);
      if (t.childTabs && t.childTabs.length > 0) {
        result = result.concat(getAllTabs(t.childTabs));
      }
    }
    return result;
  }

  const allFlattenedTabs = getAllTabs(docInfo.data.tabs || []);
  console.log(`📋 Tìm thấy tổng cộng ${allFlattenedTabs.length} tabs (gồm cả tab phân cấp) trong Master Google Doc.`);

  let successCount = 0;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < allFlattenedTabs.length; i++) {
    const tab = allFlattenedTabs[i];
    const title = tab.tabProperties?.title;
    const tabId = tab.tabProperties?.tabId;

    const destPath = TARGET_PDF_MAP[title];
    if (destPath && tabId) {
      try {
        await downloadTabAsPdf(token, tabId, destPath);
        console.log(`✅ [${++successCount}/${Object.keys(TARGET_PDF_MAP).length}] Đã xuất PDF: ${destPath}`);
      } catch (err) {
        console.warn(`⚠️ Lỗi khi xuất tab "${title}":`, err.message);
      }
      await sleep(500);
    }
  }

  console.log(`\n🎉 HOÀN TẤT XUẤT BẢN ${successCount} FILE PDF TỪ GOOGLE DOCS!`);
}

main().catch((err) => {
  console.error("❌ LỖI:", err);
});
