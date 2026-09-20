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

// Schema mới: 13 cột (gộp 10 cột cấu hình/đáp án thành 1 cột `answers`)
const headers = [
  "case_id",
  "checkpoint_id",
  "phase",
  "title",
  "question",
  "type",
  "unlocked_evidence_id",
  "answers",
  "suspect_label",
  "evidence_step_label",
  "motive_label",
  "mismatch_label",
  "hints",
];

const POOL_1A =
  "01, 03a, 03b, 04, 05a, 05b, 05c, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, dev-00, 07b, p10, p6, p2, p4, p5, p3";
const POOL_2A =
  "03a, 03b, 04, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, dev-00, 07b, p10, p6, p2, p4, p5, p3, 01_voicemail, 02_vtv3";
const POOL_2B =
  "01, 03a, 03b, 04, 05a, 05b, 05c, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, dev-00, 07b, p10, p6, p2, p4, p5, p3, 01_voicemail, 02_vtv3, 03_ao_gio, 04_lon_toc, 08_ve_may_bay";

const rows = [
  headers,
  [
    "case_000",
    "cp-000-0",
    "PHASE_0",
    "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
    "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
    "text_match_3",
    "f1-all-dossiers",
    [
      "input: phone_1 | SĐT 0988.200.991: | Nhập tên nghi phạm (VD: Lê Quang Vũ)... | Lê Quang Vũ, Vũ, Le Quang Vu, Vu, 00, 000, 0, admin",
      "input: phone_2 | SĐT 0912.331.888: | Nhập tên nghi phạm (VD: Nguyễn Thanh Tùng)... | Nguyễn Thanh Tùng, Tùng, Nguyen Thanh Tung, Tung, 00, 000, 0, admin",
      "input: phone_3 | SĐT 0984.180.357: | Nhập tên nghi phạm (VD: Đạt Gà Chợ Cảng)... | Đạt Gà Chợ Cảng, Đạt Gà, Đạt, Trần Văn Đạt, Tran Van Dat, Dat Ga Cho Cang, Dat Ga, Dat, 00, 000, 0, admin",
    ].join("\n"),
    "",
    "",
    "",
    "",
    [
      "Hãy đối chiếu danh bạ và nhật ký cuộc gọi trong Điện thoại Khang (dev-00) với Sổ ghi nợ (10) và Bảng tin rao vặt (11).",
      "Số 0988.200.991 khớp với con nợ vay 300 triệu trong Sổ 10; số 0984.180.357 nằm trên mẩu tin đục phá bê tông Bảng tin 11; số 0912.331.888 thuộc thợ nề Tùng.",
      "Ô 1: Lê Quang Vũ | Ô 2: Nguyễn Thanh Tùng | Ô 3: Đạt Gà Chợ Cảng",
    ].join("\n"),
  ],
  [
    "case_000",
    "cp-000-1a",
    "PHASE_1A",
    "Thẩm tra bóc trần mâu thuẫn Lê Quang Vũ",
    "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
    "evidence_picker",
    "f2-loi-khai-2-vu",
    [
      "suspect: Lê Quang Vũ, Vũ, Le Quang Vu, Vu, Nguyễn Thanh Tùng, Tùng, Nguyen Thanh Tung, Tung",
      "require: 10, dev-00, p6, 06, p10",
      `show: ${POOL_1A}`,
    ].join("\n"),
    "Đối tượng tình nghi:",
    "Chọn tài liệu & vật chứng chứng minh động cơ & mâu thuẫn ngoại phạm:",
    "",
    "",
    [
      "So sánh mốc thời gian Vũ khai rời đi (19:00) với lịch sử di chuyển thực tế trên App đặt xe (p10) và lời khai hàng xóm.",
      "Vũ khai về lúc 19:00 cùng Mai, nhưng App đặt xe (p10) ghi nhận chuyến xe đón Vũ lúc 19:30 (Vũ nán lại 30 phút bị Khang tát sưng má).",
      "Tick chọn 5 mã vật chứng: 10 (Sổ nợ), dev-00 (SMS), p6 (Ảnh Vũ), 06 (Lời khai bà Lụa), p10 (App đặt xe)",
    ].join("\n"),
  ],
  [
    "case_000",
    "cp-000-1b",
    "PHASE_1B",
    "Thẩm tra bóc trần Nguyễn Thanh Tùng",
    "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
    "evidence_picker",
    "f2-tu-thu-tung",
    [
      "suspect: Nguyễn Thanh Tùng, Tùng, Nguyen Thanh Tung, Tung, Lê Quang Vũ, Vũ, Le Quang Vu, Vu",
      "require: 14, p4, p5",
      `show: ${POOL_1A}`,
    ].join("\n"),
    "Đối tượng tình nghi:",
    "Chọn tài liệu & vật chứng bóc trần lời khai chối bỏ:",
    "",
    "",
    [
      "Tùng khai chỉ gọi điện không sang, nhưng dấu vết vật lý tại hiện trường phòng khách lại nói lên điều ngược lại.",
      "Đối chiếu vết vân tay trên Khung ảnh vỡ (p4) với Mẩu báo cũ 1996 (p5) về bi kịch em trai 20 năm trước.",
      "Tick chọn 3 mã vật chứng: 14 (Lời khai Tùng), p4 (Khung ảnh + Vân tay), p5 (Báo cũ 1996)",
    ].join("\n"),
  ],
  [
    "case_000",
    "cp-000-convergence",
    "PHASE_1.5",
    "🔑 Nút Hội Tụ: Loại Trừ 3 Nghi Phạm Ban Đầu & Khám Xét Lại",
    "Xác nhận lý do & bằng chứng loại trừ 3 nghi phạm ban đầu (Mai, Vũ, Tùng) khỏi diện hung thủ đâm chết Khang lúc ~21:00 để kích hoạt Lệnh khám xét lại hiện trường:",
    "convergence",
    "f3-lenh-kham-xet",
    [
      "branch: mai | 1. Nguyễn Ngọc Mai | mai_alibi_tv | Ngoại phạm xem TV tại nhà Phố Đoàn Kết, gặp sự cố đứt cáp quang lúc 20:10 (Lời khai Mai 07 + Bảng tin 11) /// Không có động cơ tranh chấp đất đai với nạn nhân /// Được bà Lụa làm chứng có mặt ở Quán Bia 88 lúc 21:00",
      "branch: vu | 2. Lê Quang Vũ | vu_alibi_pub | Thanh toán chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km (Lời khai Vũ 07b + App đặt xe p10) /// Được tài xế xe ôm xác nhận ở lại nhà Khang suốt đêm /// Không có mâu thuẫn tiền bạc hay vay mượn gì với Khang",
      "branch: tung | 3. Nguyễn Thanh Tùng | tung_confession_left | Tự thú xô ngã nạn nhân ngất lúc 20:00 rồi bỏ đi lúc 20:15; thương tích đâm cổ chết xảy ra sau đó lúc ~21:00 (Lời khai Tùng 14) /// Có chứng cứ ngoại phạm bán hàng ở Chợ Cảng từ 18:00 đến 22:00 /// Đã hòa giải xong mâu thuẫn 1996 và đi nhậu cùng bạn bè",
    ].join("\n"),
    "",
    "",
    "",
    "",
    [
      "Xem xét mốc thời gian xảy ra án mạng chí mạng (~21:00) để tìm lý do ngoại phạm của Mai, Vũ và Tùng.",
      "Mai mất mạng TV cáp quang lúc 20:10; Vũ có hóa đơn Quán Bia 88 lúc 21:15; Tùng đã bỏ đi sau khi xô ngã Khang lúc 20:15.",
      "Tick chọn 3 lý do loại trừ, lấy Thẻ cứng Lệnh khám xét lại hiện trường và quét mã QR / nhập mã REINVESTIGATE-CASE00",
    ].join("\n"),
  ],
  [
    "case_000",
    "cp-000-2a",
    "PHASE_2",
    "Bóc trần Thủ phạm chính Trần Thị Hà",
    "Bóc trần lời khai ngoại phạm giả mạo xem phim bộ VTV3 tại phòng trọ của nghi phạm Trần Thị Hà:",
    "evidence_picker",
    "f4-kham-xet-phong-ha",
    [
      "suspect: Trần Thị Hà, Hà, Tran Thi Ha, Ha",
      "require: 01_voicemail, 02_vtv3",
      `show: ${POOL_2A}`,
      "mismatch: mismatch_location",
      "mismatch_option: 📍 Mâu thuẫn Địa điểm (Khai ở phòng trọ nhưng thực chất có mặt trước cổng nhà Khang)",
      "mismatch_option: 🕒 Mâu thuẫn Nhân dạng (Khai mặc áo dài nhưng mặc áo bảo hộ)",
      "mismatch_option: 💰 Mâu thuẫn Tiền bạc (Khai không vay mượn nhưng nợ 300 triệu)",
    ].join("\n"),
    "Đối tượng tình nghi:",
    "Chọn tài liệu bẻ gãy lời khai ngoại phạm:",
    "",
    "Chọn loại mâu thuẫn trong lời khai:",
    [
      "Chú ý đến âm thanh nền lọt vào đoạn Voicemail 20:32 và lịch sinh hoạt truyền hình VTV3 của Hà.",
      "Tiếng còi tàu D19E lọt vào voicemail 20:32:15 tố cáo Hà đang ở trước cổng nhà Khang chứ không phải ở trọ; Lịch VTV3 thứ 6 chiếu Gameshow chứ không chiếu phim bộ.",
      "Chọn Mâu thuẫn Địa điểm, tick 2 mã vật chứng: 01_voicemail (Voice 20:32) + 02_vtv3 (Lịch VTV3)",
    ].join("\n"),
  ],
  [
    "case_000",
    "cp-000-2b",
    "PHASE_3",
    "Bản Cáo Trạng Định Tội & Tuyến Án",
    "Lập Bản Cáo Trạng Định Tội chính thức kết án thủ phạm gây ra cái chết của Nguyễn Văn Khang:",
    "accusation",
    "rewards-case-000",
    [
      "suspect: Trần Thị Hà, Hà, Tran Thi Ha, Ha, ha",
      "require: 04_lon_toc, 03_ao_gio",
      `show: ${POOL_2B}`,
      "motive: motive_jealousy",
      "motive_option: Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới",
      "motive_option: Tranh chấp quyền thừa kế mảnh đất 200m² của gia đình",
      "motive_option: Đòi lại món nợ tín dụng đen 300 triệu đồng",
      "motive_option: Trả thù cho bi kịch vụ án nhốt tủ gỗ năm 1996",
    ].join("\n"),
    "Chỉ danh thủ phạm chính:",
    "Chọn tài liệu & vật chứng buộc tội:",
    "Xác định động cơ gây án thực sự:",
    "",
    [
      "Xem xét động cơ ghen tuông chiếm hữu bệnh hoạn và các dấu vết sinh học/vật lý để lại tại hiện trường.",
      "Động cơ phát hiện Khang định bỏ trốn đi Đà Lạt (vé VJ-511); chứng cứ chí mạng là lọn tóc mai dính máu (04_lon_toc) và áo gió dính phấn hoa xoan (03_ao_gio).",
      "Chọn Động cơ ghen tuông bệnh hoạn, tick 2 mã chứng cứ buộc tội: 04_lon_toc + 03_ao_gio",
    ].join("\n"),
  ],
  [
    "case_001",
    "cp-001-0",
    "PHASE_1",
    "Giai đoạn 1: Màn đêm Cầu cảng số 9",
    "Nạn nhân Thomas Vance liên lạc với ai vào lúc 23:41?",
    "mcq",
    "dev-02",
    [
      "option: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.",
      "option: 2. Gửi tin nhắn cho cảnh sát đường sông.",
      "option: 3. Không gửi cho ai.",
      "correct: 1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.",
    ].join("\n"),
    "",
    "",
    "",
    "",
    [
      "Kiểm tra nhật ký tin nhắn thu hồi từ chiếc điện thoại phụ DEV-0144.",
      "Xem xét dòng tin nhắn cuối cùng trước khi mất tín hiệu.",
      "Chọn đáp án 1.",
    ].join("\n"),
  ],
];

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'checkpoints'!A1:AZ60",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range:
      "'checkpoints'!A1:" +
      String.fromCharCode(65 + headers.length - 1) +
      rows.length,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
  console.log(
    `✅ Checkpoints tab rewritten: 13 columns (answers column format: key: value). Rows: ${rows.length - 1}`,
  );
})().catch((e) => console.error("ERR:", e.message));
