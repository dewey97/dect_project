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

async function mergeHintsIntoCheckpoints() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Unified Headers
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
      "level_1_hint",
      "level_2_hint",
      "level_3_hint",
    ];

    // 2. Full Unified Data
    const rows = [
      // Case 000 - CP 0
      [
        "case_000",
        "cp-000-0",
        "PHASE_0",
        "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
        "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
        "text_match_3",
        "",
        "Lê Quang Vũ | Nguyễn Thanh Tùng | Đạt Gà Chợ Cảng",
        "Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng",
        "doc_10_so_no, doc_06_loi_khai_lua",
        "f1-all-dossiers",
        "Hãy đối chiếu danh bạ và nhật ký cuộc gọi trong Điện thoại Khang (dev-00) với Sổ ghi nợ (10) và Bảng tin rao vặt (11).",
        "Số 0988.200.991 khớp với con nợ vay 195k trong Sổ 10; số 0984.180.357 nằm trên mẩu tin đục phá bê tông Bảng tin 11; số 0912.331.888 thuộc thợ nề Tùng.",
        "Ô 1: Lê Quang Vũ | Ô 2: Nguyễn Thanh Tùng | Ô 3: Đạt Gà Chợ Cảng",
      ],
      // Case 000 - CP 1a
      [
        "case_000",
        "cp-000-1a",
        "PHASE_1A",
        "Thẩm tra bóc trần mâu thuẫn Lê Quang Vũ",
        "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
        "evidence_picker",
        "",
        "Lê Quang Vũ",
        "Lê Quang Vũ, Vũ, Nguyễn Thanh Tùng, Tùng",
        "doc_10_so_no, sms_dev00, p6_anh_vu, doc_06_loi_khai_lua, p10_app_xe",
        "f2-loi-khai-2-vu",
        "So sánh mốc thời gian Vũ khai rời đi (19:00) với lịch sử di chuyển thực tế trên App đặt xe (p10) và lời khai hàng xóm.",
        "Vũ khai về lúc 19:00 cùng Mai, nhưng App đặt xe (p10) ghi nhận chuyến xe đón Vũ lúc 19:30 (Vũ nán lại 30m bị Khang tát sưng má).",
        "Tick chọn 5 chips vật chứng: Sổ nợ Khang (10), Tin nhắn SMS (dev-00), Ảnh Vũ (p6), Lời khai bà Lụa (06), App đặt xe (p10)",
      ],
      // Case 000 - CP 1b
      [
        "case_000",
        "cp-000-1b",
        "PHASE_1B",
        "Thẩm tra bóc trần Nguyễn Thanh Tùng",
        "ĐIỀU TRA ĐỐI TƯỢNG TÌNH NGHI DỰA TRÊN MANH MỐI THU THẬP ĐƯỢC:",
        "evidence_picker",
        "",
        "Nguyễn Thanh Tùng",
        "Nguyễn Thanh Tùng, Tùng, Lê Quang Vũ, Vũ",
        "doc_14_loi_khai_tung, p4_van_tay, p5_manh_bao, p4_anh_1996",
        "f2-tu-thu-tung",
        "Tùng khai chỉ gọi điện không sang, nhưng dấu vết vật lý tại hiện trường phòng khách lại nói lên điều ngược lại.",
        "Đối chiếu vết vân tay trên Khung ảnh vỡ (p4) với Bài báo cũ 1996 (p5) về bi kịch em trai 20 năm trước và ảnh kỷ niệm 1996 (p4).",
        "Tick chọn 4 chips vật chứng: Lời khai Tùng (14), Vân tay trên khung ảnh (p4), Mảnh báo cũ 1996 (p5), Ảnh kỷ niệm 1996 (p4)",
      ],
      // Case 000 - Convergence
      [
        "case_000",
        "cp-000-convergence",
        "PHASE_1.5",
        "🔑 Nút Hội Tụ: Loại Trừ 3 Nghi Phạm Ban Đầu & Khám Xét Lại",
        "Xác nhận lý do & bằng chứng loại trừ 3 nghi phạm ban đầu (Mai, Vũ, Tùng) khỏi diện hung thủ đâm chết Khang lúc ~21:00 để kích hoạt Lệnh khám xét lại hiện trường:",
        "convergence",
        "",
        "mai_alibi_tv | vu_alibi_pub | tung_confession_left",
        "Nguyễn Ngọc Mai, Lê Quang Vũ, Nguyễn Thanh Tùng",
        "",
        "f3-lenh-kham-xet",
        "Xem xét mốc thời gian xảy ra án mạng chí mạng (~21:00) để tìm lý do ngoại phạm của Mai, Vũ và Tùng.",
        "Mai mất mạng TV cáp quang lúc 20:10; Vũ có hóa đơn Quán Bia 88 lúc 21:15; Tùng đã bỏ đi sau khi xô ngã Khang lúc 20:15.",
        "Tick chọn 3 lý do loại trừ, lấy Thẻ cứng Lệnh khám xét lại hiện trường và quét mã QR / nhập mã REINVESTIGATE-CASE00",
      ],
      // Case 000 - CP 2a
      [
        "case_000",
        "cp-000-2a",
        "PHASE_2",
        "Bóc trần Thủ phạm chính Trần Thị Hà",
        "Bóc trần lời khai ngoại phạm giả mạo xem phim bộ VTV3 tại phòng trọ của nghi phạm Trần Thị Hà:",
        "evidence_picker",
        "",
        "Trần Thị Hà",
        "Trần Thị Hà, Hà, Tran Thi Ha, Ha",
        "doc_voice_coi_tau, doc_lich_vtv3",
        "f4-kham-xet-phong-ha",
        "Chú ý đến âm thanh nền lọt vào đoạn Voicemail 20:32 (dev-00) và lịch sinh hoạt truyền hình VTV3 của Hà.",
        "Tiếng còi tàu D19E lọt vào voicemail 20:32:15 tố cáo Hà đang ở trước cổng nhà Khang chứ không phải ở trọ; Lịch VTV3 thứ 6 chiếu Gameshow chứ không chiếu phim bộ.",
        "Chọn Mâu thuẫn Địa điểm, tick 2 vật chứng bẻ gãy: Voicemail 20:32 + Lịch VTV3",
      ],
      // Case 000 - CP 2b
      [
        "case_000",
        "cp-000-2b",
        "PHASE_3",
        "Bản Cáo Trạng Định Tội & Tuyến Án",
        "Lập Bản Cáo Trạng Định Tội chính thức kết án thủ phạm gây ra cái chết của Nguyễn Văn Khang:",
        "accusation",
        "",
        "Trần Thị Hà",
        "Trần Thị Hà, Hà, Tran Thi Ha, Ha",
        "ev_hair_dna, ev_ao_gio_xoan",
        "rewards-case-000",
        "Xem xét động cơ ghen tuông chiếm hữu bệnh hoạn và các dấu vết sinh học/vật lý để lại tại hiện trường.",
        "Động cơ phát hiện Khang định bỏ trốn đi Đà Lạt; chứng cứ chí mạng liên quan mẫu ADN lọn tóc mai và áo gió dính phấn hoa xoan.",
        "Chọn Động cơ ghen tuông bệnh hoạn, tick 2 chứng cứ buộc tội: Lọn tóc mai dính máu (100% ADN) + Áo gió dính phấn hoa xoan",
      ],
      // Case 001 - Sample
      [
        "case_001",
        "cp-001-0",
        "PHASE_1",
        "Giai đoạn 1: Màn đêm Cầu cảng số 9",
        "Nạn nhân Thomas Vance liên lạc với ai vào lúc 23:41?",
        "mcq",
        "1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.\n2. Gửi tin nhắn cho cảnh sát đường sông.\n3. Không gửi cho ai.",
        "1. Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.",
        "",
        "dev-0144",
        "dev-02",
        "Kiểm tra nhật ký tin nhắn thu hồi từ chiếc điện thoại phụ DEV-0144.",
        "Xem xét dòng tin nhắn cuối cùng trước khi mất tín hiệu.",
        "Chọn đáp án 1.",
      ],
    ];

    // 3. Write unified data to 'checkpoints' tab
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'checkpoints'!A1:N${rows.length + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headers, ...rows],
      },
    });
    console.log(
      "Successfully wrote unified checkpoints schema to 'checkpoints' tab!",
    );

    // 4. Delete obsolete 'hints' tab
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const hintsSheet = meta.data.sheets.find(
      (s) => s.properties.title === "hints",
    );
    if (hintsSheet) {
      console.log(
        `Deleting obsolete 'hints' tab (sheetId: ${hintsSheet.properties.sheetId})...`,
      );
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: hintsSheet.properties.sheetId,
              },
            },
          ],
        },
      });
      console.log("Successfully deleted obsolete 'hints' tab!");
    }
  } catch (error) {
    console.error("Error merging hints into checkpoints:", error.message);
  }
}

mergeHintsIntoCheckpoints();
