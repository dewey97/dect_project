/**
 * Script tổng hợp và đồng bộ 100% 21 TÀI LIỆU (11 Lời khai, 6 Lý lịch, 4 Báo cáo)
 * vào Tab `testimonies` trên Google Sheet và Master Google Doc Tabs:
 *
 * Tab `testimonies` chứa đầy đủ các cột:
 * - case_id, doc_code, doc_type (loi_khai | ly_lich | bao_cao), phase,
 *   person_name, role, doc_title, doc_number, time_taken, location,
 *   officer, participants, full_content, alibi_claim, clue_flaw,
 *
 * Chạy: node scripts/build-all-documents-gdoc-and-sheet.js
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

const MASTER_DOC_ID = "1pJxlZpfCfIbnQ0YGx3mvCUmYTRng7zLyDxJ2EggJkgc";

// Định nghĩa 21 tài liệu thuộc 3 nhóm chuẩn hóa
const ALL_DOCUMENTS = [
  // ==========================================
  // NHÓM 1: LỜI KHAI (loi_khai) - 11 tài liệu
  // ==========================================
  {
    code: "06",
    doc_type: "loi_khai",
    phase: "00_khoi_dau",
    person_name: "Bà Nguyễn Thị Lụa & Ông Nguyễn Thanh Tiến",
    role: "Nhân chứng (Hàng xóm lân cận)",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI NHÂN CHỨNG",
    doc_number: "06/BB-LK",
    time_taken: "09h00 - 10h00 ngày 25/07/2016",
    location: "Nhà số 12 và số 10 Đường Bờ Sông, Phân khu Cảng, Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Bà Nguyễn Thị Lụa, Ông Nguyễn Thanh Tiến (Người làm chứng)",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/06_loi_khai_nhan_chung.md",
    alibi_claim: "Bà Lụa xem thời sự đến hơn 20h nghe tiếng cãi cọ, đồ vỡ; Ông Tiến ngủ từ 20h30.",
    clue_flaw: "Bà Lụa nghe cãi cọ tầm hơn 20h; sáng 25/07 phát hiện xác lúc 06h45.",
    tab_title: "[06] Lời khai Nhân chứng (Bà Lụa & Ông Tiến)",
  },
  {
    code: "07",
    doc_type: "loi_khai",
    phase: "00_khoi_dau",
    person_name: "Nguyễn Ngọc Mai (Lần 1)",
    role: "Nghi phạm 1 (Em họ nạn nhân)",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI",
    doc_number: "07/BB-LK",
    time_taken: "10h30 - 11h45 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Nguyễn Ngọc Mai (Người được lấy lời khai)",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/07_loi_khai_mai.md",
    alibi_claim: "Khai rời nhà Khang lúc 19:00, về nhà ở 45 Đoàn Kết xem TV cùng chồng cả tối.",
    clue_flaw: "Lời khai về chồng (Vũ) mâu thuẫn; sự cố mất cáp TV lúc 20:10 xác nhận thời điểm ở nhà.",
    tab_title: "[07] Lời khai Nguyễn Ngọc Mai (Lần 1)",
  },
  {
    code: "08",
    doc_type: "loi_khai",
    phase: "00_khoi_dau",
    person_name: "Lê Quang Vũ (Lần 1)",
    role: "Nghi phạm 2 (Chồng của Mai)",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI",
    doc_number: "08/BB-LK",
    time_taken: "13h30 - 14h45 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Lê Quang Vũ (Người được lấy lời khai)",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/08_loi_khai_vu.md",
    alibi_claim: "Khai đi cùng xe với Mai rời nhà Khang lúc 19:00 và về nhà ở cả tối.",
    clue_flaw: "Che giấu việc nán lại xin khất nợ 300 triệu và đi uống bia tại Quán Bia 88.",
    tab_title: "[08] Lời khai Lê Quang Vũ (Lần 1)",
  },
  {
    code: "09",
    doc_type: "loi_khai",
    phase: "00_khoi_dau",
    person_name: "Trần Thị Hà (Lần 1)",
    role: "Nghi phạm 4 (Bạn gái nạn nhân)",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI",
    doc_number: "09/BB-LK",
    time_taken: "15h00 - 16h15 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 03 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Đại úy Trần Văn Hùng",
    participants: "Trần Thị Hà (Người được lấy lời khai)",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/09_loi_khai_ha.md",
    alibi_claim: "Khai ở phòng trọ xem phim VTV3 cả tối, không đi đâu.",
    clue_flaw: "Lịch phát sóng VTV3 tối 24/07 chiếu Gameshow chứ không chiếu phim; Voicemail 20:32 lọt tiếng còi tàu.",
    tab_title: "[09] Lời khai Trần Thị Hà (Lần 1)",
  },
  {
    code: "12",
    doc_type: "loi_khai",
    phase: "00_khoi_dau",
    person_name: "Tổng Hợp Lời Khai Các Số Gọi Đến",
    role: "Nhân chứng cuộc gọi",
    doc_title: "BÁO CÁO XÁC MINH NHẬT KÝ CUỘC GỌI & LỜI KHAI",
    doc_number: "12/BC-XM",
    time_taken: "16h30 ngày 25/07/2016",
    location: "Đội Trọng án - Phòng PC02 Công an TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ điều tra Đội Trọng án",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/12_tong_hop_loi_khai_cuoc_goi.md",
    alibi_claim: "Xác minh 3 cuộc gọi: Hoàng Anh (đòi nợ), Thảo Vy (hẹn đi Đà Lạt), Tuấn Hưng (bàn chuyện họ).",
    clue_flaw: "Phát hiện mối quan hệ lén lút giữa Khang và Thảo Vy, mấu chốt kích hoạt ghen tuông của Hà.",
    tab_title: "[12] Báo cáo Lời khai Cuộc gọi Nạn nhân",
  },
  {
    code: "A02",
    doc_type: "loi_khai",
    phase: "01_nhanh_mai_vu",
    person_name: "Lê Quang Vũ (Lần 2 - Đấu tranh mâu thuẫn)",
    role: "Nghi phạm 2",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI (LẦN 2)",
    doc_number: "02/BB-LK2",
    time_taken: "08h30 - 10h00 ngày 26/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Lê Quang Vũ (Người được lấy lời khai)",
    file_md: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/02_loi_khai_lan_2_vu.md",
    alibi_claim: "Thừa nhận nán lại cãi cọ xin khất nợ đến 19:30, sau đó đi uống bia tại Quán Bia 88 đến hơn 21:00.",
    clue_flaw: "Khớp nối bill chuyển khoản 195k lúc 20:45 và rời quán lúc 21:15 do vụ ẩu đả -> Loại trừ Vũ.",
    tab_title: "[A02] Lời khai Lê Quang Vũ (Lần 2)",
  },
  {
    code: "A03",
    doc_type: "loi_khai",
    phase: "01_nhanh_mai_vu",
    person_name: "Nguyễn Văn Tuấn (Chủ quán bia Hải Hói)",
    role: "Nhân chứng (Chủ quán Bia 88)",
    doc_title: "BIÊN BẢN LÀM VIỆC VỚI CHỦ QUÁN BIA",
    doc_number: "03/BB-LV",
    time_taken: "14h00 ngày 26/07/2016",
    location: "Quán Bia 88, Đường Vĩnh Hà, Phường Cảng Đông, Hà Nội",
    officer: "Đại úy Trần Văn Hùng",
    participants: "Nguyễn Văn Tuấn (Chủ hộ kinh doanh Quán Bia 88)",
    file_md: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/03_bien_ban_lam_viec_chu_quan_bia.md",
    alibi_claim: "Xác nhận Vũ ngồi uống bia từ ~19:49 đến khi xảy ra xô xát lúc 21:10 thì thanh toán rời đi.",
    clue_flaw: "Cung cấp Sổ thu chi quán bia xác nhận thời gian ngoại phạm tuyệt đối của Lê Quang Vũ.",
    tab_title: "[A03] Biên bản làm việc Chủ Quán Bia 88",
  },
  {
    code: "B01",
    doc_type: "loi_khai",
    phase: "02_nhanh_tung",
    person_name: "Nguyễn Thanh Tùng (Bản tự thú)",
    role: "Nghi phạm 3 (Anh trai nạn nhân năm 1996)",
    doc_title: "BẢN TỰ THÚ HÀNH VI XÔ XÁT GÂY THƯƠNG TÍCH",
    doc_number: "01/TT",
    time_taken: "08h00 ngày 26/07/2016",
    location: "Công an Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Đại úy Bùi Tiến Đạt (Tiếp nhận)",
    participants: "Nguyễn Thanh Tùng (Người tự thú)",
    file_md: "docs/cases/case_000/03_documents/02_nhanh_tung/01_tu_thu_xo_xat_tung.md",
    alibi_claim: "Tự thú sang nhà Khang lúc 20:00, xô ngã Khang đập đầu bất tỉnh rồi hoảng sợ bỏ chạy lúc 20:15.",
    clue_flaw: "Khang tử vong do vết đâm cổ lúc ~21:00 bằng mảnh vỡ bình trà -> Tùng chỉ gây ngất, không phải hung thủ giết người.",
    tab_title: "[B01] Bản Tự Thú Nguyễn Thanh Tùng",
  },
  {
    code: "B02",
    doc_type: "loi_khai",
    phase: "02_nhanh_tung",
    person_name: "Nguyễn Thanh Tùng (Lấy lời khai chi tiết)",
    role: "Nghi phạm 3",
    doc_title: "BIÊN BẢN HỎI CUNG BỊ CAN / LẤY LỜI KHAI",
    doc_number: "02/BB-HC",
    time_taken: "09h30 - 11h00 ngày 26/07/2016",
    location: "Trại tạm giam Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Nguyễn Thanh Tùng (Người khai)",
    file_md: "docs/cases/case_000/03_documents/02_nhanh_tung/02_loi_khai_tung.md",
    alibi_claim: "Khai chi tiết quá trình giằng co, làm vỡ khung ảnh và bình trà, không hề đâm hay cắt tóc nạn nhân.",
    clue_flaw: "Khớp nối dấu vân tay trên khung ảnh và mảnh báo 1996; xác nhận có kẻ thứ ba đột nhập sau 20:15.",
    tab_title: "[B02] Lời khai Nguyễn Thanh Tùng (Chi tiết)",
  },
  {
    code: "B04",
    doc_type: "loi_khai",
    phase: "02_nhanh_tung",
    person_name: "Trịnh Thành Đạt (Đạt Gà)",
    role: "Nhân chứng (Bạn bè Tùng)",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI",
    doc_number: "04/BB-LK",
    time_taken: "14h30 ngày 26/07/2016",
    location: "Khu B Chợ Cầu Cảng, Phường Phân khu Cảng, Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Trịnh Thành Đạt (Người được lấy lời khai)",
    file_md: "docs/cases/case_000/03_documents/02_nhanh_tung/04_loi_khai_dat_ga.md",
    alibi_claim: "Xác nhận nhận cuộc gọi của Khang đòi nợ lúc chiều, sau đó đi uống rượu không liên quan vụ án.",
    clue_flaw: "Xác minh nguồn gốc số điện thoại 0984.180.357 trong danh bạ Khang.",
    tab_title: "[B04] Lời khai Trịnh Thành Đạt (Đạt Gà)",
  },
  {
    code: "C01",
    doc_type: "loi_khai",
    phase: "03_nhanh_ha",
    person_name: "Trần Thị Hà (Lần 2 - Thừa nhận sự thật)",
    role: "Thủ phạm thực sự",
    doc_title: "BIÊN BẢN LẤY LỜI KHAI & NHẬN TỘI",
    doc_number: "01/BB-LK-C",
    time_taken: "16h00 - 18h00 ngày 26/07/2016",
    location: "Phòng lấy lời khai số 01 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thượng tá Nguyễn Văn Quyết (Trưởng ban)",
    participants: "Trần Thị Hà (Người khai nhận tội)",
    file_md: "docs/cases/case_000/03_documents/03_nhanh_ha/01_loi_khai_lan_2_tran_thi_ha.md",
    alibi_claim: "Thừa nhận toàn bộ hành vi: rình ngoài ngõ từ 19:25, đột nhập lúc 20:45, đâm cổ Khang lúc 21:00.",
    clue_flaw: "Lời nhận tội khớp 100% với vật chứng thu giữ: Áo gió dính phấn hoa xoan, lọn tóc dính máu, bùa yêu.",
    tab_title: "[C01] Lời khai Nhận tội Trần Thị Hà (Lần 2)",
  },

  // ==========================================
  // NHÓM 2: SƠ YẾU LÝ LỊCH (ly_lich) - 6 tài liệu
  // ==========================================
  {
    code: "04",
    doc_type: "ly_lich",
    phase: "00_khoi_dau",
    person_name: "Nguyễn Văn Khang",
    role: "Nạn nhân",
    doc_title: "BÁO CÁO XÁC MINH NHÂN THÂN, LAI LỊCH CỦA NẠN NHÂN",
    doc_number: "04/BC-XMNT",
    time_taken: "25/07/2016",
    location: "Công an Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Trung úy Lê Hoàng Long",
    participants: "Cán bộ quản lý hồ sơ nhân thân",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/04_nhan_than_nan_nhan.md",
    alibi_claim: "Làm nghề tín dụng đen / bốc họ; mồ côi bố mẹ, sống với ông nội vừa mất.",
    clue_flaw: "Có 01 tiền sự năm 2012 về gây rối trật tự công cộng; quan hệ tình cảm phức tạp.",
    tab_title: "[04] Lý lịch Nạn nhân Nguyễn Văn Khang",
  },
  {
    code: "05a",
    doc_type: "ly_lich",
    phase: "00_khoi_dau",
    person_name: "Nguyễn Ngọc Mai",
    role: "Nghi phạm 1 (Em họ nạn nhân)",
    doc_title: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    doc_number: "05a/TL-LL",
    time_taken: "25/07/2016",
    location: "Công an Phường Cảng Đông, TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/05a_ly_lich_nguyen_ngoc_mai.md",
    alibi_claim: "Kế toán tại Công ty dệt may; nhân thân tốt, chưa có tiền án tiền sự.",
    clue_flaw: "Đang có tranh chấp mảnh đất 200m2 di sản của ông nội với Khang; nộp đơn khởi kiện.",
    tab_title: "[05a] Lý lịch Nguyễn Ngọc Mai",
  },
  {
    code: "05b",
    doc_type: "ly_lich",
    phase: "00_khoi_dau",
    person_name: "Lê Quang Vũ",
    role: "Nghi phạm 2 (Chồng của Mai)",
    doc_title: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    doc_number: "05b/TL-LL",
    time_taken: "25/07/2016",
    location: "Công an Phường Cảng Đông, TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/05b_ly_lich_le_quang_vu.md",
    alibi_claim: "Thầu xây dựng tự do; không tiền án; nghiện cá độ bóng đá và cờ bạc ngầm.",
    clue_flaw: "Giấu vợ vay nóng Khang 300 triệu lãi suất 5k/triệu/ngày, đang bị Khang xiết nợ.",
    tab_title: "[05b] Lý lịch Lê Quang Vũ",
  },
  {
    code: "05c",
    doc_type: "ly_lich",
    phase: "00_khoi_dau",
    person_name: "Trần Thị Hà",
    role: "Nghi phạm 4 (Bạn gái nạn nhân)",
    doc_title: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    doc_number: "05c/TL-LL",
    time_taken: "25/07/2016",
    location: "Công an Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/05c_ly_lich_tran_thi_ha.md",
    alibi_claim: "Nhân viên thu ngân siêu thị; tính cách hướng nội, trầm mặc, sùng tín bùa ngải.",
    clue_flaw: "Có biểu hiện kiểm soát người yêu cực đoan; từng đi khám tâm lý do trầm cảm ghen tuông.",
    tab_title: "[05c] Lý lịch Trần Thị Hà",
  },
  {
    code: "B03",
    doc_type: "ly_lich",
    phase: "02_nhanh_tung",
    person_name: "Nguyễn Thanh Tùng",
    role: "Nghi phạm 3",
    doc_title: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    doc_number: "03/TL-LL",
    time_taken: "26/07/2016",
    location: "Công an Phường Cầu Bươu, TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Cán bộ trích lục hồ sơ",
    file_md: "docs/cases/case_000/03_documents/02_nhanh_tung/03_ly_lich_nguyen_thanh_tung.md",
    alibi_claim: "Thợ nề tự do; anh trai của bé Nguyễn Gia Huy tử vong trong tủ gỗ năm 1996.",
    clue_flaw: "01 tiền án 2 năm tù năm 2011 về tội Cố ý gây thương tích; mối thù sâu sắc 20 năm với Khang.",
    tab_title: "[B03] Lý lịch Nguyễn Thanh Tùng",
  },
  {
    code: "B05",
    doc_type: "ly_lich",
    phase: "02_nhanh_tung",
    person_name: "Trịnh Thành Đạt (Đạt Gà)",
    role: "Nhân chứng",
    doc_title: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    doc_number: "05/TL-LL",
    time_taken: "26/07/2016",
    location: "Công an Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    file_md: "docs/cases/case_000/03_documents/02_nhanh_tung/05_ly_lich_dat_ga.md",
    alibi_claim: "Tiểu thương bán gia cầm Chợ Cầu Cảng; bạn bè đồng hương của Tùng.",
    clue_flaw: "Nợ tiền Khang 20 triệu tiền bốc bát họ; không liên quan trực tiếp đến hiện trường án mạng.",
    tab_title: "[B05] Lý lịch Trịnh Thành Đạt (Đạt Gà)",
  },

  // ==========================================
  // NHÓM 3: BÁO CÁO NGHIỆP VỤ (bao_cao) - 4 tài liệu
  // ==========================================
  {
    code: "01",
    doc_type: "bao_cao",
    phase: "00_khoi_dau",
    person_name: "Bà Nguyễn Thị Lụa (Người báo tin)",
    role: "Tiếp nhận nguồn tin tội phạm",
    doc_title: "BIÊN BẢN TIẾP NHẬN NGUỒN TIN VỀ TỘI PHẠM",
    doc_number: "01/BB-TNB",
    time_taken: "07h00 ngày 25/07/2016",
    location: "Trụ sở Công an Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Đại úy Bùi Tiến Đạt (Trực ban hình sự)",
    participants: "Bà Nguyễn Thị Lụa (Người trình báo)",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/01_tiep_nhan_tin_bao.md",
    alibi_claim: "Bà Lụa phát hiện thi thể Khang lúc 06:45 sáng khi đi quét ngõ, cổng và cửa mở toang.",
    clue_flaw: "Báo động hiện trường ban đầu: Nạn nhân nằm gục trong vũng máu ở phòng khách.",
    tab_title: "[01] Biên bản Tiếp nhận Tin báo Tội phạm",
  },
  {
    code: "03a",
    doc_type: "bao_cao",
    phase: "00_khoi_dau",
    person_name: "Hiện trường Số 14 Đường Bờ Sông",
    role: "Khám nghiệm hiện trường chính",
    doc_title: "BIÊN BẢN KHÁM NGHIỆM HIỆN TRƯỜNG",
    doc_number: "14/BB-KNHT",
    time_taken: "07h15 - 10h30 ngày 25/07/2016",
    location: "Số 14 Đường Bờ Sông, Phường Phân khu Cảng, TP. Hà Nội",
    officer: "Thượng tá Nguyễn Văn Quyết (Chủ trì), Đội Kỹ thuật hình sự PC54",
    participants: "Kiểm sát viên VKSND TP. Hà Nội, Bác sĩ pháp y, Công an Phường, Đại diện tổ dân phố",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/03a_bien_ban_kham_nghiem_hien_truong.md",
    alibi_claim: "Hiện trường phòng khách: bình trà vỡ, khung ảnh rơi vỡ, vết máu bắn dạng phun tia.",
    clue_flaw: "Thu giữ: mảnh vỡ bình trà dính máu, khung ảnh dính vân tay, mẩu báo 1996, tóc mai bị cắt cụt.",
    tab_title: "[03a] Biên bản Khám nghiệm Hiện trường",
  },
  {
    code: "03b",
    doc_type: "bao_cao",
    phase: "00_khoi_dau",
    person_name: "Tử thi Nguyễn Văn Khang",
    role: "Khám nghiệm tử thi sơ bộ",
    doc_title: "BÁO CÁO KHÁM NGHIỆM TỬ THI SƠ BỘ",
    doc_number: "14/BC-KNTT",
    time_taken: "08h00 - 10h45 ngày 25/07/2016",
    location: "Phòng mổ pháp y - Bệnh viện Đa khoa Trung tâm Hà Nội",
    officer: "Bác sĩ Pháp y Đặng Văn Bình (Phòng KTHS PC54)",
    participants: "Điều tra viên thụ lý, Kiểm sát viên kiểm sát khám nghiệm",
    file_md: "docs/cases/case_000/03_documents/00_khoi_dau/03b_bao_cao_kham_nghiem_tu_thi_so_bo.md",
    alibi_claim: "Nạn nhân chết do mất máu cấp bởi vết đâm đứt động mạch cảnh cổ trái.",
    clue_flaw: "Thời gian tử vong: 20h45 - 21h15 (khoảng ~21h00); vùng gáy có vết tụ máu ngất trước đó ~45 phút.",
    tab_title: "[03b] Báo cáo Khám nghiệm Tử thi Sơ bộ",
  },
  {
    code: "C03",
    doc_type: "bao_cao",
    phase: "03_nhanh_ha",
    person_name: "Phòng trọ Trần Thị Hà (Số 8 Ngõ 12 Bờ Kè)",
    role: "Khám xét khẩn cấp",
    doc_title: "BIÊN BẢN KHÁM XÉT CHỖ Ở KHẨN CẤP",
    doc_number: "03/BB-KX",
    time_taken: "14h00 - 15h30 ngày 26/07/2016",
    location: "Phòng trọ số 3, Số 8 Ngõ 12 Đường Bờ Kè, Phường Phân khu Cảng, Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn (Chủ trì)",
    participants: "Chủ nhà trọ, Cán bộ Tổ dân phố, Đương sự Trần Thị Hà",
    file_md: "docs/cases/case_000/03_documents/03_nhanh_ha/03_kham_xet_phong_ha.md",
    alibi_claim: "Khám xét thu giữ các đồ vật nghi vấn giấu trong tủ quần áo và dưới gầm giường.",
    clue_flaw: "Thu giữ: Áo gió dính phấn hoa xoan, kéo cắt tóc dính máu + lọn tóc gói giấy, bùa yêu ghi tên Khang.",
    tab_title: "[C03] Biên bản Khám xét Phòng trọ Trần Thị Hà",
  },
];

function extractCleanBody(filePath, docType) {
  const full = path.resolve(root, filePath);
  if (!fs.existsSync(full)) {
    console.warn("⚠️ File not found:", filePath);
    return "";
  }
  const raw = fs.readFileSync(full, "utf-8");
  const lines = raw.split("\n");
  const result = [];
  let started = false;

  for (let line of lines) {
    let t = line.trim();
    if (!t) {
      if (started) result.push("");
      continue;
    }

    // Bỏ qua quốc hiệu tiêu ngữ và header văn bản vì đã render riêng
    if (
      t.startsWith("# CỘNG HÒA") ||
      t.startsWith("**Độc lập") ||
      t.includes("CỘNG HÒA XÃ HỘI") ||
      t.includes("Độc lập – Tự do") ||
      t.includes("CÔNG AN THÀNH PHỐ") ||
      t.includes("PHÒNG CẢNH SÁT") ||
      t.includes("CƠ QUAN CẢNH SÁT") ||
      t.startsWith("Số:") ||
      t.startsWith("*Hà Nội, ngày") ||
      t.startsWith("# BIÊN BẢN") ||
      t.startsWith("# BÁO CÁO") ||
      t.startsWith("# BẢN TỰ THÚ") ||
      t.startsWith("# BẢN TRÍCH LỤC") ||
      t.startsWith("*(Nạn nhân") ||
      t.startsWith("*(Người khai") ||
      t.startsWith("*(Vụ án") ||
      t.startsWith("*(Hồi") ||
      t.startsWith("---")
    ) {
      continue;
    }

    // Nếu gặp chữ ký cuối cùng thì dừng
    if (
      t.startsWith("**CÁN BỘ LẤY LỜI KHAI**") ||
      t.startsWith("**CÁN BỘ XÁC MINH**") ||
      t.startsWith("**NGƯỜI TỰ THÚ**") ||
      t.startsWith("**NGƯỜI KHAI**") ||
      t.startsWith("**CÁN BỘ CHỦ TRÌ**") ||
      t.startsWith("**BÁC SĨ PHÁP Y**")
    ) {
      break;
    }

    started = true;
    t = t.replace(/^\*\s+/, "• ").replace(/###\s*/g, "").replace(/\*\*/g, "").replace(/`/g, "").trim();
    result.push(t);
  }

  return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function main() {
  console.log("🚀 Bắt đầu quá trình đồng bộ 21 Tài Liệu vào Google Sheet và Master Google Doc...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Chuẩn bị dữ liệu full text cho từng tài liệu
  console.log("\n📦 Đang đọc và bóc tách nội dung chi tiết 21 tài liệu...");
  const processedDocs = ALL_DOCUMENTS.map((doc) => {
    const fullContent = extractCleanBody(doc.file_md, doc.doc_type);
    return {
      ...doc,
      full_content: fullContent,
    };
  });

  // 2. Lấy thông tin Master Google Doc hiện tại
  console.log("\n📄 Kiểm tra Document Tabs trên Master Google Doc...");
  const docInfo = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  const existingTabs = docInfo.data.tabs || [];
  console.log(`📋 Số lượng tab hiện có: ${existingTabs.length}`);

  // 3. Tạo hoặc lấy ID tab cho từng tài liệu trong 21 files
  const tabMap = {}; // code -> tabId

  for (let i = 0; i < processedDocs.length; i++) {
    const doc = processedDocs[i];
    const targetTitle = doc.tab_title;

    let foundTab = existingTabs.find((t) => t.tabProperties?.title === targetTitle);

    if (!foundTab) {
      console.log(`➕ Đang tạo Tab mới: "${targetTitle}"...`);
      try {
        const addRes = await docs.documents.batchUpdate({
          documentId: MASTER_DOC_ID,
          requestBody: {
            requests: [
              {
                addDocumentTab: {
                  tabProperties: {
                    title: targetTitle,
                    index: i,
                  },
                },
              },
            ],
          },
        });
        const newTabId = addRes.data.replies[0].addDocumentTab.tabProperties.tabId;
        tabMap[doc.code] = newTabId;
        console.log(`✅ Đã tạo Tab ID: ${newTabId}`);
      } catch (err) {
        console.error(`❌ Lỗi khi tạo tab "${targetTitle}":`, err.message);
      }
    } else {
      tabMap[doc.code] = foundTab.tabProperties.tabId;
      console.log(`⚡ Tái sử dụng Tab: "${targetTitle}" (ID: ${tabMap[doc.code]})`);
    }
  }

  // 4. Lấy lại cấu trúc doc mới nhất sau khi tạo tabs
  const updatedDoc = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  const allTabs = updatedDoc.data.tabs || [];
  console.log(`\n✍️ Bắt đầu ghi nội dung và định dạng cho 21 Tabs trên Google Docs...`);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < processedDocs.length; i++) {
    const doc = processedDocs[i];
    const tabId = tabMap[doc.code];
    if (!tabId) continue;

    const currentTab = allTabs.find((t) => t.tabProperties?.tabId === tabId);
    const tabContent = currentTab?.documentTab?.body?.content || [];
    const endIndex = tabContent.length > 0 ? tabContent[tabContent.length - 1].endIndex : 1;

    const tabRequests = [];

    // 1. Xóa nội dung cũ trong tab nếu có
    if (endIndex > 2) {
      tabRequests.push({
        deleteContentRange: {
          range: {
            tabId: tabId,
            startIndex: 1,
            endIndex: endIndex - 1,
          },
        },
      });
    }

    // 2. Xây dựng nội dung văn bản hành chính hoàn chỉnh
    let headerAgency = "CÔNG AN THÀNH PHỐ HÀ NỘI\nCƠ QUAN CẢNH SÁT ĐIỀU TRA (PC02)\n";
    if (doc.doc_type === "ly_lich") {
      headerAgency = "CÔNG AN THÀNH PHỐ HÀ NỘI\nPHÒNG CẢNH SÁT HÌNH SỰ (PC02)\n";
    }

    const headerText =
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n" +
      "---------------------------\n" +
      headerAgency +
      `Số: ${doc.doc_number}\n\n` +
      `${doc.doc_title}\n` +
      `(${doc.person_name} — Vụ án mạng Số 14 Đường Bờ Sông)\n\n`;

    let metaText = "";
    if (doc.time_taken) metaText += `• Thời gian thực hiện: ${doc.time_taken}\n`;
    if (doc.location) metaText += `• Địa điểm: ${doc.location}\n`;
    if (doc.officer) metaText += `• Cán bộ thực hiện: ${doc.officer}\n`;
    if (doc.participants) metaText += `• Thành phần tham gia: ${doc.participants}\n`;
    metaText += "------------------------------------------------------------\n\n";

    let signText = "\n\n------------------------------------------------------------\n";
    if (doc.doc_type === "loi_khai") {
      signText +=
        "          NGƯỜI KHAI / ĐƯƠNG SỰ                           CÁN BỘ LẤY LỜI KHAI\n" +
        "             (Ký, ghi rõ họ tên)                              (Ký, ghi rõ họ tên)\n\n\n" +
        `             ${doc.person_name.split("(")[0].trim()}                         ${doc.officer}\n`;
    } else if (doc.doc_type === "ly_lich") {
      signText +=
        "                                                      CÁN BỘ XÁC MINH TRÍCH LỤC\n" +
        "                                                          (Ký, ghi rõ họ tên)\n\n\n" +
        `                                                          ${doc.officer}\n`;
    } else {
      signText +=
        "          ĐẠI DIỆN CÁC BÊN CHỨNG KIẾN                     CÁN BỘ CHỦ TRÌ KHÁM NGHIỆM\n" +
        "             (Ký, ghi rõ họ tên)                              (Ký, ghi rõ họ tên)\n\n\n" +
        `                                                          ${doc.officer}\n`;
    }

    const fullDocText = headerText + metaText + doc.full_content + signText;

    // Chèn text vào Tab
    tabRequests.push({
      insertText: {
        location: { tabId: tabId, index: 1 },
        text: fullDocText,
      },
    });

    // Toàn bộ văn bản font Times New Roman 12pt
    const totalLen = fullDocText.length;
    tabRequests.push({
      updateTextStyle: {
        range: { tabId: tabId, startIndex: 1, endIndex: totalLen },
        textStyle: {
          weightedFontFamily: { fontFamily: "Times New Roman" },
          fontSize: { magnitude: 12, unit: "PT" },
        },
        fields: "weightedFontFamily,fontSize",
      },
    });

    // In đậm Quốc hiệu Tiêu ngữ & Tên văn bản
    const nationIdx = fullDocText.indexOf("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
    if (nationIdx !== -1) {
      tabRequests.push({
        updateTextStyle: {
          range: { tabId: tabId, startIndex: nationIdx + 1, endIndex: nationIdx + 63 },
          textStyle: { bold: true },
          fields: "bold",
        },
      });
    }

    const titleIdx = fullDocText.indexOf(doc.doc_title);
    if (titleIdx !== -1) {
      tabRequests.push({
        updateTextStyle: {
          range: { tabId: tabId, startIndex: titleIdx + 1, endIndex: titleIdx + 1 + doc.doc_title.length },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 15, unit: "PT" },
          },
          fields: "bold,fontSize",
        },
      });
    }

    // In đậm tất cả các từ "Hỏi:" và "Đáp:"
    let searchPos = 0;
    while (true) {
      const hoiPos = fullDocText.indexOf("Hỏi:", searchPos);
      if (hoiPos === -1) break;
      tabRequests.push({
        updateTextStyle: {
          range: { tabId: tabId, startIndex: hoiPos + 1, endIndex: hoiPos + 5 },
          textStyle: { bold: true },
          fields: "bold",
        },
      });
      searchPos = hoiPos + 4;
    }

    searchPos = 0;
    while (true) {
      const dapPos = fullDocText.indexOf("Đáp:", searchPos);
      if (dapPos === -1) break;
      tabRequests.push({
        updateTextStyle: {
          range: { tabId: tabId, startIndex: dapPos + 1, endIndex: dapPos + 5 },
          textStyle: { bold: true },
          fields: "bold",
        },
      });
      searchPos = dapPos + 4;
    }

    try {
      await docs.documents.batchUpdate({
        documentId: MASTER_DOC_ID,
        requestBody: { requests: tabRequests },
      });
      console.log(`✅ [${i + 1}/21] Đã ghi & format hoàn chỉnh Tab "${doc.tab_title}"`);
    } catch (err) {
      console.warn(`⚠️ Lỗi khi cập nhật tab "${doc.tab_title}":`, err.message);
    }

    await sleep(1500); // Tránh quota 429 của Google Docs API
  }

  // 5. Cập nhật dữ liệu vào Google Sheet tab `testimonies`
  console.log("\n📊 Đang cập nhật dữ liệu 21 tài liệu vào Google Sheet tab 'testimonies'...");

  const sheetHeaders = [
    "case_id",
    "doc_code",
    "doc_type",
    "phase",
    "person_name",
    "role",
    "doc_title",
    "doc_number",
    "time_taken",
    "location",
    "officer",
    "participants",
    "full_content",
    "alibi_claim",
    "clue_flaw",
    "gdoc_tab_title",
    "gdoc_url",
  ];

  const sheetRows = processedDocs.map((doc) => {
    const tabId = tabMap[doc.code] || "t.0";
    const gdocUrl = `https://docs.google.com/document/d/${MASTER_DOC_ID}/edit?tab=${tabId}`;
    return [
      "case_000",
      doc.code,
      doc.doc_type,
      doc.phase,
      doc.person_name,
      doc.role,
      doc.doc_title,
      doc.doc_number,
      doc.time_taken,
      doc.location,
      doc.officer,
      doc.participants,
      doc.full_content,
      doc.alibi_claim,
      doc.clue_flaw,
      doc.tab_title,
      gdocUrl,
    ];
  });

  // Xóa và ghi mới toàn bộ tab testimonies
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'testimonies'!A1:Z100",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'testimonies'!A1:R" + (sheetRows.length + 1),
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [sheetHeaders, ...sheetRows],
    },
  });

  console.log("\n🎉 HOÀN TẤT ĐỒNG BỘ 100% 21 TÀI LIỆU!");
  console.log(`📄 Master Google Doc: https://docs.google.com/document/d/${MASTER_DOC_ID}/edit`);
  console.log(`📊 Google Sheet CMS: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=testimonies`);
}

main().catch((err) => {
  console.error("❌ LỖI TRẦM TRỌNG:", err);
});
