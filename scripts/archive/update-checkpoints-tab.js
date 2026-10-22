const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const spreadsheetId =
  process.env.GOOGLE_SHEETS_ID ||
  "1h2P9VaBC9PELUMhipo6ze1SkJIVv3IOm5SP3ynURm4Q";
const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(__dirname, "..", process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH)
  : path.resolve(__dirname, "../google-service-account.json");

async function updateCheckpointsTab() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const headers = [
      "case_id",
      "checkpoint_id",
      "node_id",
      "dossier",
      "title",
      "question",
      "type",
      "unlocked_evidence_id",
      "answers",
      "hints",
    ];

    const rows = [
      headers,
      [
        "case_000",
        "cp-000-0",
        "c0-pin-phone",
        "Ban Đầu",
        "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
        "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
        "text_match_3",
        "f1-all-dossiers",
        "o_nhap: phone_1 | SĐT 0988.200.991: | Nhập tên nghi phạm (VD: Lê Quang Vũ)... | Lê Quang Vũ, Vũ, Le Quang Vu, Vu\no_nhap: phone_2 | SĐT 0912.331.888: | Nhập tên nghi phạm (VD: Nguyễn Thanh Tùng)... | Nguyễn Thanh Tùng, Tùng, Nguyen Thanh Tung, Tung\no_nhap: phone_3 | SĐT 0984.180.357: | Nhập tên nghi phạm (VD: Đạt Gà Chợ Cảng)... | Đạt Gà Chợ Cảng, Đạt Gà, Đạt, Trần Văn Đạt, Dat",
        "Gợi ý 1: Đối chiếu với Sổ tay ghi nợ của nạn nhân.\nGợi ý 2: Đối chiếu với thông tin trên Bảng tin tổ dân phố.\nGợi ý 3: Nhập tên 3 đối tượng: Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng.",
      ],
      [
        "case_000",
        "cp-000-1a",
        "c0-pin-followup-vu",
        "Bộ A",
        "Thẩm Tra Nghi Phạm Lê Quang Vũ",
        "Thẩm tra đối tượng tình nghi Lê Quang Vũ dựa trên các tài liệu & chứng cứ thu thập được:",
        "evidence_picker",
        "f2-loi-khai-2-vu",
        "nghi_pham: Lê Quang Vũ\nma_chung_cu: doc_10_so_no, sms_dev00, p6_anh_vu, doc_06_loi_khai_lua, p10_app_xe",
        "Gợi ý 1: Nhập tên đối tượng là Lê Quang Vũ.\nGợi ý 2: Chọn các chứng cứ: Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai Lụa (06/11), App đặt xe (p10).",
      ],
      [
        "case_000",
        "cp-000-1b",
        "c0-pin-followup-tung",
        "Bộ B",
        "Thẩm Tra Nghi Phạm Nguyễn Thanh Tùng",
        "Thẩm tra đối tượng tình nghi Nguyễn Thanh Tùng và bóc trần lời khai chối bỏ:",
        "evidence_picker",
        "f2-tu-thu-tung",
        "nghi_pham: Nguyễn Thanh Tùng\nma_chung_cu: doc_14_loi_khai_tung, p4_van_tay, p5_manh_bao, p4_anh_1996",
        "Gợi ý 1: Nhập tên đối tượng là Nguyễn Thanh Tùng.\nGợi ý 2: Chọn các chứng cứ: Lời khai Tùng (14), Vân tay (p4), Mảnh báo 1996 (p5), Khung ảnh 1996 (p4).",
      ],
      [
        "case_000",
        "cp-000-1c",
        "c0-pin-followup-ha",
        "Bộ C",
        "Bóc Trần Ngoại Phạm Trần Thị Hà",
        "Bóc trần lời khai ngoại phạm giả mạo của nghi phạm Trần Thị Hà:",
        "evidence_picker",
        "f4-kham-xet-phong-ha",
        "nghi_pham: Trần Thị Hà\nma_chung_cu: doc_voice_coi_tau, doc_lich_vtv3",
        "Gợi ý 1: Nhập tên đối tượng là Trần Thị Hà.\nGợi ý 2: Chọn 2 chứng cứ: Voice còi tàu (01) và Lịch VTV3 (02).",
      ],
      [
        "case_000",
        "cp-000-2b",
        "c0-pin-accusation",
        "Bộ C",
        "Bản Cáo Trạng Định Tội Thủ Phạm",
        "Chỉ danh thủ phạm và đưa ra bộ chứng cứ chí mạng kết án:",
        "evidence_picker",
        "rewards-case-000",
        "nghi_pham: Trần Thị Hà\nma_chung_cu: ev_hair_dna, ev_ao_gio_xoan",
        "Gợi ý 1: Thủ phạm là Trần Thị Hà.\nGợi ý 2: Chọn 2 chứng cứ chí mạng: Lọn tóc mai ADN (EV-HAIR-DNA) và Áo gió phấn hoa (03).",
      ],
    ];

    console.log("Clearing and updating 'checkpoints' tab on Google Sheets...");
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: "checkpoints!A1:Z100",
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "checkpoints!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    console.log("SUCCESS! Google Sheet 'checkpoints' tab updated perfectly!");
  } catch (error) {
    console.error("FAILED to update Google Sheet:", error);
  }
}

updateCheckpointsTab();
