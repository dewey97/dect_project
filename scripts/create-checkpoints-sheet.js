const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local if exists
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

async function createCheckpointsSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Check existing sheets
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = (metadata.data.sheets || []).map(
      (s) => s.properties?.title,
    );

    // 2. Add 'checkpoints' tab if not exist
    if (!existingSheets.includes("checkpoints")) {
      console.log("Creating new tab: 'checkpoints'...");
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "checkpoints",
                },
              },
            },
          ],
        },
      });
      console.log("Tab 'checkpoints' created successfully.");
    } else {
      console.log("Tab 'checkpoints' already exists. Updating rows...");
    }

    // 3. Headers
    const headers = [
      "case_id",
      "checkpoint_id",
      "phase",
      "title",
      "question",
      "type",
      "options",
      "correct_answer",
      "valid_suspects",
      "required_evidences",
      "unlocked_evidence_id",
      "hints_list",
    ];

    // 4. Rows for Case 000 & Case 001
    const rows = [
      // Case 000 - CP 0
      [
        "case_000",
        "cp-000-0",
        "0",
        "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
        "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
        "text_match_3",
        "",
        "Lê Quang Vũ | Nguyễn Thanh Tùng | Đạt Gà Chợ Cảng",
        "Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng",
        "doc_10_so_no, doc_06_loi_khai_lua",
        "f1-all-dossiers",
        "Gợi ý 1: Đối chiếu với Sổ tay ghi nợ của nạn nhân.\nGợi ý 2: Đối chiếu với thông tin trên Bảng tin tổ dân phố.\nGợi ý 3: Nhập tên 3 đối tượng vào các ô: Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng.",
      ],
      // Case 000 - CP 1a
      [
        "case_000",
        "cp-000-1a",
        "1",
        "Điều Tra Đối Tượng Tình Nghi (Vũ hoặc Tùng)",
        "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
        "evidence_picker",
        "",
        "Lê Quang Vũ",
        "Lê Quang Vũ, Vũ, Nguyễn Thanh Tùng, Tùng",
        "doc_10_so_no, sms_dev00, p6_anh_vu, doc_06_loi_khai_lua, p10_app_xe",
        "f2-loi-khai-2-vu",
        "Gợi ý 1: Bạn có thể chọn thẩm tra Lê Quang Vũ hoặc Nguyễn Thanh Tùng.\nGợi ý 2: Nếu thẩm tra Vũ: chọn Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai bà Lụa (06/11), App đặt xe (p10).\nGợi ý 3: Nếu thẩm tra Tùng: chọn Lời khai Tùng (14), Vân tay khung ảnh (p4), Mảnh báo 1996 (p5), Ảnh kỷ niệm 1996 (p4).",
      ],
      // Case 000 - CP 1b
      [
        "case_000",
        "cp-000-1b",
        "1",
        "Điều Tra Nghi Phạm Còn Lại",
        "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
        "evidence_picker",
        "",
        "Nguyễn Thanh Tùng",
        "Nguyễn Thanh Tùng, Tùng, Lê Quang Vũ, Vũ",
        "doc_14_loi_khai_tung, p4_van_tay, p5_manh_bao, p4_anh_1996",
        "f2-tu-thu-tung",
        "Gợi ý 1: Nhập tên nghi phạm còn lại (Lê Quang Vũ hoặc Nguyễn Thanh Tùng).\nGợi ý 2: Nếu là Vũ: chọn Sổ nợ (10), SMS (dev-00), Ảnh Vũ (p6), Lời khai Lụa (06/11), App đặt xe (p10).\nGợi ý 3: Nếu là Tùng: chọn Lời khai Tùng (14), Vân tay (p4), Mảnh báo 1996 (p5), Ảnh kỷ niệm 1996 (p4).",
      ],
      // Case 000 - Convergence
      [
        "case_000",
        "cp-000-convergence",
        "1",
        "🔑 Nút Hội Tụ: Loại Trừ 3 Nghi Phạm Ban Đầu & Khám Xét Lại",
        "Xác nhận lý do & bằng chứng loại trừ 3 nghi phạm ban đầu (Mai, Vũ, Tùng) khỏi diện hung thủ đâm chết Khang lúc ~21:00 để kích hoạt Lệnh khám xét lại hiện trường:",
        "convergence",
        "",
        "mai_alibi_tv | vu_alibi_pub | tung_confession_left",
        "Nguyễn Ngọc Mai, Lê Quang Vũ, Nguyễn Thanh Tùng",
        "",
        "f3-lenh-kham-xet",
        "Gợi ý 1: Mai có ngoại phạm khách quan ở Phố Đoàn Kết (xem TV bị đứt cáp 20:10).\nGợi ý 2: Vũ có chuyển khoản 195k tại Quán Bia 88 lúc 21:15 cách hiện trường 3.8km.\nGợi ý 3: Tùng tự thú xô Khang ngất lúc 20:00 rồi bỏ chạy 20:15; thương tích chí mạng đâm cổ diễn ra lúc ~21:00.",
      ],
      // Case 000 - CP 2a
      [
        "case_000",
        "cp-000-2a",
        "2",
        "Bóc Trần Ngoại Phạm Trần Thị Hà",
        "Bóc trần lời khai ngoại phạm giả mạo xem phim bộ VTV3 tại phòng trọ của nghi phạm Trần Thị Hà:",
        "evidence_picker",
        "",
        "Trần Thị Hà",
        "Trần Thị Hà, Hà, Tran Thi Ha, Ha",
        "doc_voice_coi_tau, doc_lich_vtv3",
        "f4-kham-xet-phong-ha",
        "Gợi ý 1: Nhập tên nghi phạm là Trần Thị Hà (hoặc Hà).\nGợi ý 2: Loại mâu thuẫn là Mâu thuẫn Địa điểm (khai ở phòng trọ nhưng thực chất đứng rình trước cổng nhà Khang).\nGợi ý 3: Tài liệu bẻ gãy lời khai: Voice tin nhắn 20:32 (lọt còi tàu) + Lịch phát sóng VTV3 (Gameshow).",
      ],
      // Case 000 - CP 2b
      [
        "case_000",
        "cp-000-2b",
        "2",
        "Phase 2 — Bản Cáo Trạng Định Tội & Bắt Giữ Thủ Phạm",
        "Lập Bản Cáo Trạng Định Tội chính thức kết án thủ phạm gây ra cái chết của Nguyễn Văn Khang:",
        "accusation",
        "",
        "Trần Thị Hà",
        "Trần Thị Hà, Hà, Tran Thi Ha, Ha",
        "ev_hair_dna, ev_ao_gio_xoan",
        "rewards-case-000",
        "Gợi ý 1: Thủ phạm là Trần Thị Hà.\nGợi ý 2: Động cơ: Cuồng yêu, ghen tuông bệnh hoạn khi mở điện thoại phát hiện Khang chuẩn bị tiền bỏ trốn với bồ mới Thảo Vy.\nGợi ý 3: Bộ chứng cứ chí mạng: Lọn tóc mai dính máu (EV-HAIR-DNA) + Áo gió dính phấn hoa xoan (03).",
      ],
      // Case 001 - Multiple Choice (MCQ) Sample
      [
        "case_001",
        "cp-001-0",
        "1",
        "Giai đoạn 1: Màn đêm Cầu cảng số 9",
        "Nạn nhân Thomas Vance liên lạc với ai vào lúc 23:41?",
        "mcq",
        "1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.\n2. Gửi tin nhắn cho cảnh sát đường sông.\n3. Không gửi cho ai.",
        "1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.",
        "",
        "dev-0144",
        "dev-02",
        "Kiểm tra nhật ký tin nhắn thu hồi từ chiếc điện thoại phụ DEV-0144.",
      ],
    ];

    // 5. Write to Sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'checkpoints'!A1:L${rows.length + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(
      `Successfully populated ${rows.length} rows to 'checkpoints' tab!`,
    );
  } catch (error) {
    console.error("Error creating checkpoints sheet:", error.message);
  }
}

createCheckpointsSheet();
