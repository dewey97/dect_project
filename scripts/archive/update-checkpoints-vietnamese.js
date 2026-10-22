/**
 * Chuẩn hoá lại tab `checkpoints` trên Google Sheet:
 * - Giữ lại 9 cột thiết yếu: case_id, checkpoint_id, dossier, title, question, type, unlocked_evidence_id, answers, hints
 * - Cột `answers` gõ theo cú pháp tiếng Việt thuần việt:
 *     nghi_pham: ...
 *     ma_chung_cu: ...
 *     mau_thuan: ...
 *     dong_co: ...
 *     o_nhap: ...
 *
 * Lưu ý: Dẫn truyện (story) KHÔNG nằm ở tab này — xem `scripts/update-narratives.js` (tab `narratives`).
 *
 * Chạy: node scripts/update-checkpoints-vietnamese.js
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
  [
    "case_id",
    "checkpoint_id",
    "dossier",
    "title",
    "question",
    "type",
    "unlocked_evidence_id",
    "answers",
    "hints",
  ],
  [
    "case_000",
    "cp-000-0",
    "Ban Đầu",
    "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
    "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
    "text_match_3",
    "f1-all-dossiers",
    "o_nhap: phone_1 | SĐT 0988.200.991: | | Lê Quang Vũ\no_nhap: phone_2 | SĐT 0912.331.888: | | Nguyễn Thanh Tùng\no_nhap: phone_3 | SĐT 0984.180.357: | | Đạt Gà",
    "Hãy đối chiếu danh bạ và nhật ký cuộc gọi trong Điện thoại Khang (dev-00) với Sổ ghi nợ (10) và Bảng tin rao vặt (11).\nSố 0988.200.991 khớp với con nợ vay 300 triệu trong Sổ 10; số 0984.180.357 nằm trên mẩu tin đục phá bê tông Bảng tin 11; số 0912.331.888 thuộc thợ nề Tùng.\nÔ 1: Lê Quang Vũ | Ô 2: Nguyễn Thanh Tùng | Ô 3: Đạt Gà",
  ],
  [
    "case_000",
    "cp-000-1a",
    "Bộ A",
    "Thẩm tra bóc trần mâu thuẫn Lê Quang Vũ",
    "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
    "evidence_picker",
    "f2-loi-khai-2-vu",
    "nghi_pham: Lê Quang Vũ\nma_chung_cu: 10, dev-00, p6, 06, p10",
    "So sánh mốc thời gian Vũ khai rời đi (19:00) với lịch sử di chuyển thực tế trên App đặt xe (p10) và lời khai hàng xóm.\nVũ khai về lúc 19:00 cùng Mai, nhưng App đặt xe (p10) ghi nhận chuyến xe đón Vũ lúc 19:30.\nTick chọn 5 mã vật chứng: 10 (Sổ nợ), dev-00 (SMS), p6 (Ảnh Vũ), 06 (Lời khai bà Lụa), p10 (App đặt xe)",
  ],
  [
    "case_000",
    "cp-000-1b",
    "Bộ A",
    "Thẩm tra bóc trần Nguyễn Thanh Tùng",
    "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
    "evidence_picker",
    "f2-tu-thu-tung",
    "nghi_pham: Nguyễn Thanh Tùng\nma_chung_cu: 14, p4, p5",
    "Tùng khai chỉ gọi điện không sang, nhưng dấu vết vật lý tại hiện trường phòng khách lại nói lên điều ngược lại.\nĐối chiếu vết vân tay trên Khung ảnh vỡ (p4) với Mẩu báo cũ 1996 (p5) về bi kịch em trai 20 năm trước.\nTick chọn 3 mã vật chứng: 14 (Lời khai Tùng), p4 (Khung ảnh + Vân tay), p5 (Báo cũ 1996)",
  ],
  [
    "case_000",
    "cp-000-2a",
    "Bộ B",
    "Bóc trần Thủ phạm chính Trần Thị Hà",
    "Bóc trần lời khai ngoại phạm giả mạo xem phim bộ VTV3 tại phòng trọ của nghi phạm Trần Thị Hà:",
    "evidence_picker",
    "f4-kham-xet-phong-ha",
    "nghi_pham: Trần Thị Hà\nma_chung_cu: 01_voicemail, 02_vtv3\nmau_thuan: mismatch_location\nmismatch_option: 📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng nhà Khang)\nmismatch_option: 🕒 Mâu thuẫn Nhân dạng (Khai mặc áo dài nhưng mặc áo bảo hộ)\nmismatch_option: 💰 Mâu thuẫn Tiền bạc (Khai không vay mượn nhưng nợ 300 triệu)",
    "Chú ý đến âm thanh nền lọt vào đoạn Voicemail 20:32 và lịch sinh hoạt truyền hình VTV3 của Hà.\nTiếng còi tàu D19E lọt vào voicemail 20:32:15 tố cáo Hà đang ở trước cổng nhà Khang chứ không phải ở trọ; Lịch VTV3 thứ 6 chiếu Gameshow chứ không chiếu phim bộ.\nChọn Mâu thuẫn Địa điểm, tick 2 mã vật chứng: 01_voicemail (Voice 20:32) + 02_vtv3 (Lịch VTV3)",
  ],
  [
    "case_000",
    "cp-000-2b",
    "Bộ C",
    "Bản Cáo Trạng Định Tội & Tuyến Án",
    "Lập Bản Cáo Trạng Định Tội chính thức kết án thủ phạm gây ra cái chết của Nguyễn Văn Khang:",
    "accusation",
    "rewards-case-000",
    "nghi_pham: Trần Thị Hà\nma_chung_cu: 04_lon_toc, 03_ao_gio\ndong_co: motive_jealousy\nmotive_option: Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới\nmotive_option: Tranh chấp quyền thừa kế mảnh đất 200m² của gia đình\nmotive_option: Đòi lại món nợ tín dụng đen 300 triệu đồng\nmotive_option: Trả thù cho bi kịch vụ án nhốt tủ gỗ năm 1996",
    "Xem xét động cơ ghen tuông chiếm hữu bệnh hoạn và các dấu vết sinh học/vật lý để lại tại hiện trường.\nĐộng cơ phát hiện Khang định bỏ trốn đi Đà Lạt (vé VJ-511); chứng cứ chí mạng là lọn tóc mai dính máu (04_lon_toc) và áo gió dính phấn hoa xoan (03_ao_gio).\nChọn Động cơ ghen tuông bệnh hoạn, tick 2 mã chứng cứ buộc tội: 04_lon_toc + 03_ao_gio",
  ],
  [
    "case_001",
    "cp-001-0",
    "Bộ A",
    "Giai đoạn 1: Màn đêm Cầu cảng số 9",
    "Nạn nhân Thomas Vance liên lạc với ai vào lúc 23:41?",
    "mcq",
    "dev-02",
    "option: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.\noption: 2. Gửi tin nhắn cho cảnh sát đường sông.\noption: 3. Không gửi cho ai.\ncorrect: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.",
    "Kiểm tra nhật ký tin nhắn thu hồi từ chiếc điện thoại phụ DEV-0144.\nXem xét dòng tin nhắn cuối cùng trước khi mất tín hiệu.\nChọn đáp án 1.",
  ],
];

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Clear existing range A1:Z20 first
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'checkpoints'!A1:Z20",
  });

  // Write new clean structured data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'checkpoints'!A1",
    valueInputOption: "RAW",
    requestBody: { values: ROWS_DATA },
  });

  console.log(
    "✅ Đã cập nhật lại tab checkpoints trên Google Sheet (9 cột tinh gọn thuần Việt).",
  );
})().catch((e) => console.error("ERR:", e.message));
