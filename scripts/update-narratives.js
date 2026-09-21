/**
 * Đồng bộ tab `narratives` (Dẫn truyện mở đầu & theo từng bộ hồ sơ) lên Google Sheet.
 *
 * Tab `narratives` gồm 5 cột:
 * - case_id: Mã vụ án (case_000, case_001)
 * - phase: Số thứ tự chặng (0 = Ban Đầu, 1 = Bộ A, 2 = Bộ B, 3 = Bộ C)
 * - dossier: Tên bộ hồ sơ (Ban Đầu, Bộ A, Bộ B, Bộ C)
 * - date: Mốc thời gian (Đêm 24/07/2016, Sáng 25/07/2016...)
 * - monologue: Nội dung độc thoại dẫn truyện máy đánh chữ (Alt+Enter để ngắt đoạn)
 *
 * Chạy: node scripts/update-narratives.js
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

const ROWS_DATA = [
  ["case_id", "phase", "dossier", "date", "monologue"],
  [
    "case_000",
    "0",
    "Ban Đầu",
    "Đêm 24/07/2016",
    "Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối...\nChỉ có mùi máu bốc lên và ấm trà vỡ vụn dưới sàn phòng khách...\n\nNạn nhân Khang đã gục xuống. Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất.\n\nHung thủ đã kịp trốn vào màn đêm. Tội ác giờ đây đang bị ẩn giấu đằng sau những manh mối ngổn ngang.\n\nTrò chơi trốn tìm sinh tử chính thức bắt đầu - và bạn chính là người đi tìm sự thật.",
  ],
  [
    "case_000",
    "1",
    "Bộ A",
    "Sáng 25/07/2016",
    "Manh mối thu thập từ điện thoại nạn nhân đã mở ra những dấu vết đầu tiên.\n\nTừ những khoản nợ mờ ám cho đến mối ân oán kéo dài nhiều năm, các đối tượng liên quan dần lộ diện với những lời khai đầy mâu thuẫn.\n\nĐã đến lúc tiến hành thẩm tra trực diện các đối tượng tình nghi để bóc tách mâu thuẫn ngoại phạm và tìm ra ngọn nguồn sự thật...",
  ],
  [
    "case_000",
    "2",
    "Bộ B",
    "Chiều 25/07/2016",
    "Cả 3 nghi phạm ban đầu đều có căn cứ loại trừ khỏi thời điểm gây án chí mạng lúc ~21:00. Vụ án tưởng chừng đi vào ngõ tàng, nhưng hiện trường vẫn còn những vật chứng bị bỏ sót.\n\nLệnh khám xét bổ sung đã được phê duyệt. Những chi tiết kỹ thuật từ âm thanh thu âm cho đến mốc thời gian sinh hoạt sẽ là chìa khóa bóc trần vỏ bọc ngoại phạm thực sự...",
  ],
  [
    "case_000",
    "3",
    "Bộ C",
    "Đêm 25/07/2016",
    "Mọi lời khai giả mạo đã sụp đổ trước dữ liệu giám định thực tế. Mối quan hệ phức tạp và động cơ ẩn giấu đằng sau vụ án mạng đêm mưa giờ đây đã hoàn toàn phát lộ.\n\nĐã đến lúc lập Bản Cáo Trạng Định Tội chính thức, chỉ danh thủ phạm và khép lại hồ sơ chuyên án...",
  ],
];

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Kiểm tra xem tab `narratives` đã có trên Sheet chưa, nếu chưa có thì tạo mới
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitles = meta.data.sheets.map((s) => s.properties.title);

  if (!sheetTitles.includes("narratives")) {
    console.log("Creating tab 'narratives'...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: "narratives",
                gridProperties: { rowCount: 50, columnCount: 10 },
              },
            },
          },
        ],
      },
    });
  }

  // Dọn sạch vùng cũ trước khi ghi (bao gồm cả cột `subtitle` đã bỏ ở lần trước)
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'narratives'!A1:Z20",
  });

  // Ghi bảng dữ liệu dẫn truyện 5 cột tinh gọn
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'narratives'!A1",
    valueInputOption: "RAW",
    requestBody: { values: ROWS_DATA },
  });

  console.log("✅ Đã cập nhật xong tab narratives trên Google Sheet.");
})().catch((e) => console.error("ERR:", e.message));
