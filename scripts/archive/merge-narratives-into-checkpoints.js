/**
 * Script hợp nhất TOÀN BỘ NARRATIVES VÀO TAB `checkpoints` TRÊN GOOGLE SHEET:
 * - Thêm Cột K: `narrative` (Đoạn Cinematic Typewriter)
 * - Nạp nội dung độc thoại chuẩn cho 5 Checkpoints chính
 * - Chồng thêm 4 Dòng Ký Sự Hậu Án đa tuyến:
 *   1. cp-epilogue-ha (Trần Thị Hà)
 *   2. cp-epilogue-mai-vu (Mai & Vũ)
 *   3. cp-epilogue-tung (Nguyễn Thanh Tùng)
 *   4. cp-epilogue-closure (Khép lại chuyên án)
 *
 * Chạy: node scripts/merge-narratives-into-checkpoints.js
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

const CHECKPOINT_ROWS = [
  [
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
    "narrative",
  ],
  [
    "case_000",
    "cp-000-0",
    "c0-pin-phone",
    "Ban Đầu",
    "Truy Tìm Danh Tính 3 Số Điện Thoại Ẩn Danh",
    "Hãy đọc các tài liệu Hồ sơ (Sổ nợ 10, Bảng tin 11) và tra cứu Điện thoại nạn nhân Khang (Call Log dev-00) để xác định danh tính 3 nghi phạm liên quan đến 3 SĐT lạ gọi tới trong đêm 24/07:",
    "text_match_3",
    "f1-all-dossiers",
    "o_nhap: phone_1 | SĐT 0988.200.991: | Nhập tên nghi phạm... | Lê Quang Vũ, Vũ, Le Quang Vu, Vu\no_nhap: phone_2 | SĐT 0912.331.888: | Nhập tên nghi phạm... | Nguyễn Thanh Tùng, Tùng, Nguyen Thanh Tung, Tung\no_nhap: phone_3 | SĐT 0984.180.357: | Nhập tên nghi phạm... | Đạt, Đạt Gà, Đạt Gà Chợ Cảng, Trịnh Thành Đạt, Dat",
    "Gợi ý 1: Đối chiếu với Sổ tay ghi nợ của nạn nhân.\nGợi ý 2: Đối chiếu với thông tin trên Bảng tin tổ dân phố.\nGợi ý 3: Nhập tên 3 đối tượng: Lê Quang Vũ, Nguyễn Thanh Tùng, Đạt Gà Chợ Cảng.",
    "Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối...\nChỉ có mùi máu bốc lên và ấm trà vỡ vụn dưới sàn phòng khách...\n\nNạn nhân Khang đã gục xuống. Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất.\n\nHung thủ đã kịp trốn vào màn đêm. Tội ác giờ đây đang bị ẩn giấu đằng sau những manh mối ngổn ngang.\n\nTrò chơi trốn tìm sinh tử chính thức bắt đầu - và bạn chính là người đi tìm sự thật.",
  ],
  [
    "case_000",
    "cp-000-1a",
    "c0-pin-followup-vu",
    "Bộ A",
    "Thẩm Tra Nghi Phạm Lê Quang Vũ",
    "Thẩm tra Động cơ (Sổ nợ 13, Tin nhắn với SĐT 0988.200.991) & Mâu thuẫn ngoại phạm (10, 42) của Lê Quang Vũ:",
    "evidence_picker",
    "f2-loi-khai-2-vu",
    "nghi_pham: Lê Quang Vũ\ndong_co: 13, 0988.200.991\nngoai_pham: 10, 42\ntuy_chon_ngoai_pham: 6, 8\ngio_roi_quan: 21:15\nma_chung_cu: 13, 10, 42, 6, 8, 0988.200.991",
    "Gợi ý 1: Động cơ: Kiểm tra Sổ tay ghi nợ (13) và Tin nhắn văn bản với SĐT 0988.200.991.\nGợi ý 2: Ngoại phạm: Đối chiếu thời gian Vũ khai rời đi (10) và thời gian xe đón (42) (Tùy chọn: 6, 8).\nGợi ý 3: Mốc giờ Quán Bia 88: Lấy vụ ẩu đả làm mốc đối chiếu và số tiền thanh toán -> 21:15.",
    "Vỏ bọc ngoại phạm của Lê Quang Vũ đã chính thức sụp đổ.\n\nLời khai nhậu suốt đêm tại Quán Bia Hải Hói bị bẻ gãy khi hóa đơn cho thấy Vũ đã thanh toán lúc 20h45 và rời quán hơn 30 phút.\n\nTuy nhiên, sự xuất hiện của vết thương ở trán nạn nhân và khoản nợ 300 triệu đã chuyển hướng điều tra sang đối tượng tiếp theo...",
  ],
  [
    "case_000",
    "cp-000-1b",
    "c0-pin-followup-tung",
    "Bộ B",
    "Thẩm Tra Nghi Phạm Nguyễn Thanh Tùng",
    "Thẩm tra Động cơ (Tài liệu 1996: 18, 40, Tin nhắn với SĐT 0912.331.888) & Mâu thuẫn ngoại phạm (20, 41) của Nguyễn Thanh Tùng:",
    "evidence_picker",
    "f2-tu-thu-tung",
    "nghi_pham: Nguyễn Thanh Tùng\ndong_co: 18, 40, 0912.331.888\nngoai_pham: 20, 41\nma_chung_cu: 18, 40, 20, 41, 0912.331.888",
    "Gợi ý 1: Động cơ: Chú ý tài liệu mốc thời gian năm 1996 (18, 40) và Tin nhắn văn bản với SĐT 0912.331.888.\nGợi ý 2: Ngoại phạm: Manh mối nào tại hiện trường chưa được xác nhận danh tính? (20, 41).",
    "Nguyễn Thanh Tùng đã chính thức đầu thú về hành vi xô xát làm vỡ ấm trà lúc 20h00.\n\nTuy nhiên, kết luận giám định pháp y khẳng định vết rách trán không phải nguyên nhân tử vong. Nạn nhân Khang vẫn còn sống và nhắn tin sau khi Tùng bỏ chạy.\n\nKẻ thực sự ra tay kết liễu nạn nhân bằng nhát đâm chí mạng lúc 21h00 vẫn đang ẩn mình...",
  ],
  [
    "case_000",
    "cp-000-1c",
    "c0-pin-followup-ha",
    "Bộ C",
    "Bóc Trần Ngoại Phạm & Khớp Nối Vật Chứng Trần Thị Hà",
    "Thẩm tra Động cơ (Tin nhắn SĐT 0978.552.109) & Ngoại phạm (Tin nhắn thoại SĐT 0984.112.568, Lịch VTV3 12, 44) & Khớp nối 3 vật phẩm (Áo gió: 45,10,6; Kéo tóc: 4; Bùa yêu: 49):",
    "evidence_picker",
    "f4-kham-xet-phong-ha",
    "nghi_pham: Trần Thị Hà\ndong_co: 0978.552.109\ntuy_chon_dong_co: 0984.112.568, 53, 48\nngoai_pham: voice_0984.112.568, 12, 44\ntuy_chon_ngoai_pham: 9, 7, 45\ntile_ao_gio: 45, 10, 6\ntile_lon_toc: 4\ntile_bua_yeu: 49\nma_chung_cu: 12, 44, 45, 49, 4, 10, 6, 0978.552.109, voice_0984.112.568",
    "Gợi ý 1: Động cơ: Mối quan hệ giữa Khang và Hà như thế nào? Địa điểm trong tin nhắn giữa Khang và Vy (0978.552.109).\nGợi ý 2: Ngoại phạm: Tiếng còi tàu trong Tin nhắn thoại (0984.112.568) và Xem lịch phát sóng VTV3 ngày hôm đó (12, 44).\nGợi ý 3: Khớp nối vật chứng: Đối chiếu 3 vật phẩm thu tại phòng Hà với hiện trường (Áo gió: 45, 10, 6; Kéo tóc: 4; Bùa yêu: 49).",
    "Đối tượng Trần Thị Hà có thái độ bất hợp tác, không giải trình được mâu thuẫn tiếng còi tàu 68 dB trong hộp thư thoại lúc 20:32.\n\nĐể ngăn chặn nguy cơ tẩu tán chứng cứ, căn cứ Điều 140 Bộ luật Tố tụng hình sự, Lệnh khám xét khẩn cấp chỗ ở đối với Trần Thị Hà chính thức được phê duyệt.\n\nTổ công tác khẩn trương lên đường thu giữ vật chứng giấu kín...",
  ],
  [
    "case_000",
    "cp-000-2b",
    "c0-pin-accusation",
    "Bộ C",
    "Bản Cáo Trạng Truy Tố & Định Tội Thủ Phạm",
    "Chỉ danh Thủ phạm (Trần Thị Hà), Động cơ (Mâu thuẫn tình cảm) và 3 Chứng cứ buộc tội (2.1: 52; 2.2: 50, 51; 2.3: 53):",
    "evidence_picker",
    "case_fully_solved",
    "nghi_pham: Trần Thị Hà\ndong_co: Mâu thuẫn tình cảm\nchung_cu_2_1: 52\nchung_cu_2_2: 50, 51\nchung_cu_2_3: 53\nma_chung_cu: 52, 50, 51, 53",
    "Gợi ý 1: Thủ phạm & Động cơ: Tìm đối tượng có mâu thuẫn tình cảm và phản ứng ghen tuông cực đoan (Trần Thị Hà).\nGợi ý 2: Chứng cứ buộc tội: Nhập đúng mã vật chứng thu tại phòng Hà tương ứng từng mục: 2.1 là 52; 2.2 là 50 hoặc 51; 2.3 là 53.",
    "Chiếc áo gió màu xám đen dính bụi đất cây xoan khớp chính xác nhân dạng kẻ rình rập lúc 19:25. Vỉ thuốc an thần Diazepam bóc dở 4 viên trùng khớp cặn ấm trà hoa cúc. Và lọn tóc mai dính máu giấu trong áo ngực có kết quả ADN trùng khớp 100% nạn nhân Khang.\n\nTrước chuỗi chứng cứ đanh thép, bức tường ngoại phạm của Trần Thị Hà hoàn toàn sụp đổ. Cơn cuồng ghen bệnh hoạn khi phát hiện Khang chuẩn bị tiền bỏ trốn cùng nhân tình đã biến tình yêu mù quáng thành tội ác giết người lúc 21:00.\n\nToàn bộ sự thật đã được phơi bày ra ánh sáng!",
  ],
  [
    "case_000",
    "cp-epilogue-ha",
    "c0-pin-epilogue-ha",
    "Kết Luận",
    "Hậu Án I: Trần Thị Hà & Bản Án Lương Tâm",
    "Đọc ký sự hậu án về số phận của thủ phạm Trần Thị Hà sau phiên tòa xét xử:",
    "text",
    "epilogue_ha_read",
    "",
    "",
    "Sau khi cảnh sát đưa ra những bằng chứng không thể chối cãi, Trần Thị Hà đã cúi đầu nhận tội.\n\nTại phiên tòa xét xử, Hà bình thản nghe tuyên án. Khi được nói lời cuối cùng, Hà không xin giảm án, không tỏ ra hối hận mà chỉ mỉm cười cay đắng: 'Em không hối hận. Nếu em không giữ được anh, thì không ai trên đời này được phép có anh.'\n\nNhưng chỉ vài tuần sau khi vào trại giam, Hà phát hiện mình đã có thai hai tháng — giọt máu của Khang.\nTừ ngày biết mình mang cốt nhục của người đàn ông do chính tay mình sát hại, Hà rơi vào điên loạn. Lúc thì cô gào khóc than trách trời cao, lúc lại vuốt ve bụng thì thầm bài đồng dao trốn tìm năm nào...",
  ],
  [
    "case_000",
    "cp-epilogue-mai-vu",
    "c0-pin-epilogue-mai-vu",
    "Kết Luận",
    "Hậu Án II: Vợ Chồng Mai - Vũ & Mảnh Đất Tranh Chấp",
    "Đọc ký sự hậu án về kết cục của gia đình Nguyễn Ngọc Mai & Lê Quang Vũ:",
    "text",
    "epilogue_maivu_read",
    "",
    "",
    "Trước tình trạng tâm thần bất ổn của người mẹ trong trại giam, Ban quản lý liên hệ với những người thân còn lại của Khang là Mai và Vũ, đề nghị nhận nuôi đứa trẻ.\n\nNhưng bị ám ảnh bởi cái chết đẫm máu của Khang, Mai và Vũ dứt khoát từ chối. Họ đề nghị gửi đứa bé vào Trung tâm bảo trợ xã hội.\n\nMảnh đất 200m² tại số 14 Đường Bờ Sông — nguồn cơn của bao tranh chấp và thù hằn — cuối cùng bị Ngân hàng kê biên phát mại để thu hồi khoản nợ 1,2 tỷ đồng. Hai gia đình không ai có được tấc đất nào, chỉ còn lại sự đổ vỡ và nỗi day dứt khôn nguôi.",
  ],
  [
    "case_000",
    "cp-epilogue-tung",
    "c0-pin-epilogue-tung",
    "Kết Luận",
    "Hậu Án III: Nguyễn Thanh Tùng & Bức Thư Cứu Rỗi",
    "Đọc bức thư 20 năm chuộc tội của Nguyễn Thanh Tùng:",
    "text",
    "epilogue_tung_read",
    "",
    "",
    "Ngay khi tất cả đều nghĩ rằng đứa trẻ vô tội sẽ phải lớn lên côi cút, trại giam bất ngờ nhận được đơn đề nghị nhận nuôi từ một người đàn ông: Nguyễn Thanh Tùng.\n\nAnh gửi một lá thư ngắn gửi đến Hà:\n'Hãy để tôi được chuộc lại tội lỗi của mình. Nếu không vì hành động xô xát đêm đó đã đẩy Khang đến nguy hiểm, thì đứa bé đã không phải mồ côi cha mẹ. Mọi ân oán lẽ ra nên để lại trong quá khứ. Mọi sinh linh bé nhỏ đều là vô tội, 20 năm trước hay bây giờ cũng như vậy.'\n\nCầm bức thư trên tay, ánh mắt điên dại của Hà chợt khựng lại. Quá khứ như cuốn phim hiện về. Bi kịch trốn tìm năm 1996 cuối cùng đã tìm thấy sự tha thứ và cứu rỗi.",
  ],
  [
    "case_000",
    "cp-epilogue-closure",
    "c0-pin-epilogue-closure",
    "Kết Luận",
    "Hậu Án IV: Khép Lại Chuyên Án Số 14 Đường Bờ Sông",
    "Đọc lời đúc kết của Ban chuyên án PC02 khép lại hồ sơ vụ án:",
    "text",
    "case_fully_closed",
    "",
    "",
    "Hồ sơ Chuyên án #000 chính thức được đóng dấu niêm phong lưu trữ.\n\nCông lý đã được thực thi, kẻ thủ ác phải trả giá trước vành móng ngựa. Nhưng hơn cả việc tìm ra thủ phạm, điều đọng lại sau chuyên án là bài học sâu sắc về lòng hận thù và sự tha thứ.\n\nĐêm đen ở ngõ Bờ Sông đã qua đi, bình minh dần ló rạng. Đứa trẻ sẽ lớn lên với một cuộc đời mới — nơi không còn bóng ma của những trò trốn tìm oan nghiệt.\n\nChúc mừng Thám tử đã xuất sắc phá giải toàn bộ vụ án!",
  ],
];

async function main() {
  console.log("🚀 Đang đồng bộ toàn bộ Checkpoints + Narratives + 4 Hậu Án lên Google Sheet...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // 1. Dọn sạch vùng cũ của tab checkpoints
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'checkpoints'!A1:Z30",
  });

  // 2. Ghi đè 10 dòng Checkpoint hoàn chỉnh
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'checkpoints'!A1",
    valueInputOption: "RAW",
    requestBody: { values: CHECKPOINT_ROWS },
  });

  console.log(`✅ Đã cập nhật xong ${CHECKPOINT_ROWS.length - 1} Checkpoints (gồm 5 Checkpoints điều tra + 4 Ký sự Hậu Án) lên Google Sheet!`);
}

main().catch((e) => console.error("LỖI:", e));
