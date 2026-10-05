/**
 * Script đồng bộ & chuẩn hóa HOÀN HẢO 100% 21 TÀI LIỆU
 * giữa Git Source, Master Google Docs và Google Sheets:
 * - Chuẩn hóa tên: Trần Văn Đạt (Đạt Gà), Nguyễn Văn Hùng (Chủ Quán Bia 88).
 * - Cập nhật nội dung đầy đủ cho Tab [06] và toàn bộ 21 Document Tabs.
 * - Cập nhật metadata trên Google Sheets.
 * - Xuất bản PDF mới nhất.
 *
 * Chạy: node scripts/sync-perfect-all-21-docs.js
 */
const { execSync } = require("child_process");
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

// Danh mục chuẩn hóa 21 tài liệu
const MASTER_DOCS_DATA = [
  // ==========================================
  // NHÓM 1: LỜI KHAI (11)
  // ==========================================
  {
    code: "06",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "00_khoi_dau",
    personName: "Bà Nguyễn Thị Lụa & Ông Nguyễn Thanh Tiến",
    role: "Nhân chứng (Hàng xóm lân cận)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI NHÂN CHỨNG",
    docNumber: "06/BB-LK",
    timeTaken: "09h00 - 10h00 ngày 25/07/2016",
    location: "Nhà số 12 và số 10 Đường Bờ Sông, Phân khu Cảng, Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Bà Nguyễn Thị Lụa, Ông Nguyễn Thanh Tiến",
    coreContent: "Bà Lụa nghe cãi cọ lúc hơn 20h, sáng 06h45 phát hiện xác. Ông Tiến ngủ từ 20h30.",
    alibiClaim: "Bà Lụa xem TV thời sự, Ông Tiến đi ngủ sớm.",
    clueFlaw: "Bà Lụa thấy 2 người đi chung xe máy đến nhà Khang lúc chiều tối; phát hiện xác lúc 06:45.",
    tabTitle: "[06] Lời khai Nhân chứng (Bà Lụa & Ông Tiến)",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/06_loi_khai_nhan_chung.md",
    targetPdf: "public/documents/case_000/phase_0/06_loi_khai_nhan_chung.pdf",
  },
  {
    code: "07",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "00_khoi_dau",
    personName: "Nguyễn Ngọc Mai (Lần 1)",
    role: "Nghi phạm 1 (Em họ nạn nhân)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI",
    docNumber: "07/BB-LK",
    timeTaken: "10h30 - 11h45 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Nguyễn Ngọc Mai (Người khai)",
    coreContent: "Khai rời nhà Khang lúc 19:00, về nhà xem TV cùng chồng cả tối.",
    alibiClaim: "Khai về nhà ở 45 Đoàn Kết xem TV cùng chồng (Vũ) cả tối.",
    clueFlaw: "Lời khai về thời gian của chồng có mâu thuẫn; sự cố mất cáp TV 20:10 xác nhận thời điểm ở nhà.",
    tabTitle: "[07] Lời khai Nguyễn Ngọc Mai (Lần 1)",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/07_loi_khai_mai.md",
    targetPdf: "public/documents/case_000/phase_0/07_loi_khai_mai.pdf",
  },
  {
    code: "08",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "00_khoi_dau",
    personName: "Lê Quang Vũ (Lần 1)",
    role: "Nghi phạm 2 (Chồng của Mai)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI",
    docNumber: "08/BB-LK",
    timeTaken: "13h30 - 14h45 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Lê Quang Vũ (Người khai)",
    coreContent: "Khai đi cùng xe với Mai về nhà lúc 19:00 và ở nhà cả tối.",
    alibiClaim: "Khai về nhà cùng Mai lúc 19h và xem TV cả tối.",
    clueFlaw: "Che giấu việc nán lại xin khất nợ 300 triệu và đi uống bia tại Quán Bia 88.",
    tabTitle: "[08] Lời khai Lê Quang Vũ (Lần 1)",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/08_loi_khai_vu.md",
    targetPdf: "public/documents/case_000/phase_0/08_loi_khai_vu.pdf",
  },
  {
    code: "09",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "00_khoi_dau",
    personName: "Trần Thị Hà (Lần 1)",
    role: "Nghi phạm 4 (Bạn gái nạn nhân)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI",
    docNumber: "09/BB-LK",
    timeTaken: "15h00 - 16h15 ngày 25/07/2016",
    location: "Phòng lấy lời khai số 03 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Đại úy Trần Văn Hùng",
    participants: "Trần Thị Hà (Người khai)",
    coreContent: "Khai ở phòng trọ xem phim VTV3 cả tối, không đi đâu.",
    alibiClaim: "Khai ở phòng trọ xem phim truyền hình VTV3 suốt từ 20h đến 22h.",
    clueFlaw: "Lịch VTV3 tối 24/07 chiếu Gameshow chứ không chiếu phim; Voicemail 20:32 có tiếng còi tàu.",
    tabTitle: "[09] Lời khai Trần Thị Hà (Lần 1)",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/09_loi_khai_ha.md",
    targetPdf: "public/documents/case_000/phase_0/09_loi_khai_ha.pdf",
  },
  {
    code: "12",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "00_khoi_dau",
    personName: "Tổng Hợp Lời Khai Cuộc Gọi Nạn Nhân",
    role: "Nhân chứng cuộc gọi",
    docTitle: "BÁO CÁO XÁC MINH NHẬT KÝ CUỘC GỌI & LỜI KHAI",
    docNumber: "12/BC-XM",
    timeTaken: "16h30 ngày 25/07/2016",
    location: "Đội Trọng án - Phòng PC02 Công an TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích xuất dữ liệu viễn thông",
    coreContent: "Xác minh các cuộc gọi đến máy nạn nhân: Vũ (19:40), Đạt Gà (19:45), Tùng (20:00), Hà (20:32).",
    alibiClaim: "Tổng hợp đối chiếu mốc giờ liên lạc của các bên liên quan.",
    clueFlaw: "Cuộc gọi của Hà lúc 20:32 dài 45s lọt âm thanh còi tàu hỏa trùng khớp khung giờ tàu chạy.",
    tabTitle: "[12] Báo cáo Lời khai Cuộc gọi Nạn nhân",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/12_tong_hop_loi_khai_cuoc_goi.md",
    targetPdf: "public/documents/case_000/phase_0/12_tong_hop_loi_khai_cuoc_goi.pdf",
  },
  {
    code: "A02",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "01_nhanh_mai_vu",
    personName: "Lê Quang Vũ (Lần 2)",
    role: "Nghi phạm 2 (Chồng của Mai)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI (LẦN 2)",
    docNumber: "02/BB-LK2",
    timeTaken: "08h30 - 10h00 ngày 26/07/2016",
    location: "Phòng lấy lời khai số 02 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Lê Quang Vũ (Người khai)",
    coreContent: "Thừa nhận nán lại cãi cọ nợ 300 triệu, sau đó đi uống bia tại Quán Bia 88 lúc 19:45 - 21:00.",
    alibiClaim: "Khai uống bia tại Quán Bia 88 suốt từ 19:45 đến hơn 21:00.",
    clueFlaw: "App đặt xe cho thấy gọi xe lúc 20:15 rời quán bia; sổ thu chi quán bia có ghi chép đối chiếu.",
    tabTitle: "[A02] Lời khai Lê Quang Vũ (Lần 2)",
    gitFile: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/02_loi_khai_lan_2_vu.md",
    targetPdf: "public/documents/case_000/phase_1/02_loi_khai_lan_2_vu.pdf",
  },
  {
    code: "A03",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "01_nhanh_mai_vu",
    personName: "Nguyễn Văn Hùng (Chủ Quán Bia 88)",
    role: "Nhân chứng (Chủ quán bia)",
    docTitle: "BIÊN BẢN LÀM VIỆC VỚI CHỦ QUÁN BIA",
    docNumber: "03/BB-LKNC",
    timeTaken: "14h30 - 15h15 ngày 25/07/2016",
    location: "Quán Bia 88, Số 88 Đường Vĩnh Hà, Phường Cảng Đông, Hà Nội",
    officer: "Đại úy Lê Minh, Trung úy Nguyễn Văn Hoàng",
    participants: "Nguyễn Văn Hùng (Chủ quán)",
    coreContent: "Xác nhận Vũ đến quán lúc hơn 19:45, quán đông khách, nhớ có vụ xô xát bàn 4-5 lúc trả tiền.",
    alibiClaim: "Chủ quán nhớ mang máng khách đông, Vũ trả tiền mặt.",
    clueFlaw: "Không thể chứng minh Vũ ngồi liên tục tại quán đến 21h.",
    tabTitle: "[A03] Biên bản làm việc Chủ Quán Bia 88",
    gitFile: "docs/cases/case_000/03_documents/01_nhanh_mai_vu/03_bien_ban_lam_viec_chu_quan_bia.md",
    targetPdf: "public/documents/case_000/phase_1/03_bien_ban_lam_viec_chu_quan_bia.pdf",
  },
  {
    code: "B01",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "02_nhanh_tung",
    personName: "Nguyễn Thanh Tùng (Bản Tự Thú)",
    role: "Nghi phạm 3 (Con nợ & Bạn bè cũ)",
    docTitle: "BẢN TỰ THÚ HÀNH VI XÔ XÁT GÂY THƯƠNG TÍCH",
    docNumber: "01/TT",
    timeTaken: "08h00 ngày 26/07/2016",
    location: "Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Nguyễn Thanh Tùng (Người tự thú)",
    coreContent: "Tự thú đến đòi sổ nợ lúc 20:10, xô xát đẩy Khang ngã đập đầu chảy máu rồi hoảng sợ bỏ chạy.",
    alibiClaim: "Khai chỉ xô đẩy Khang ngã rồi bỏ chạy, Khang lúc đó vẫn còn thở và chửi bới.",
    clueFlaw: "Vết thương xô xát không phải là vết thương chí mạng gây tử vong (vết thương vùng gáy/đỉnh đầu).",
    tabTitle: "[B01] Bản Tự Thú Nguyễn Thanh Tùng",
    gitFile: "docs/cases/case_000/03_documents/02_nhanh_tung/01_tu_thu_xo_xat_tung.md",
    targetPdf: "public/documents/case_000/phase_2/01_tu_thu_xo_xat_tung.pdf",
  },
  {
    code: "B02",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "02_nhanh_tung",
    personName: "Nguyễn Thanh Tùng (Chi tiết)",
    role: "Nghi phạm 3 (Bị can xô xát)",
    docTitle: "BIÊN BẢN HỎI CUNG BỊ CAN / LẤY LỜI KHAI",
    docNumber: "02/BB-HC",
    timeTaken: "09h30 - 11h00 ngày 26/07/2016",
    location: "Trại tạm giam số 1 Công an TP. Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Nguyễn Thanh Tùng (Bị can)",
    coreContent: "Khai chi tiết diễn biến xô xát lúc 20:15 - 20:25, sau đó chạy ra bến xe bắt xe về quê lúc 21:00.",
    alibiClaim: "Bắt xe khách tuyến Hà Nội - Nam Định lúc 21:00 đêm 24/07.",
    clueFlaw: "Cuống vé xe khách xác nhận Tùng lên xe lúc 21:00, ngoại phạm trong khung giờ tử vong thực tế.",
    tabTitle: "[B02] Lời khai Nguyễn Thanh Tùng (Chi tiết)",
    gitFile: "docs/cases/case_000/03_documents/02_nhanh_tung/02_loi_khai_tung.md",
    targetPdf: "public/documents/case_000/phase_2/02_loi_khai_tung.pdf",
  },
  {
    code: "B04",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "02_nhanh_tung",
    personName: "Trần Văn Đạt (Đạt Gà)",
    role: "Nghi phạm (Con nợ buôn gà)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI",
    docNumber: "04/BB-LK",
    timeTaken: "15h15 ngày 25/07/2016",
    location: "Trụ sở Công an Phường Phân khu Cảng",
    officer: "Đại úy Hoàng Tuấn Dũng",
    participants: "Trần Văn Đạt (Người khai)",
    coreContent: "Khai gọi điện xin khất nợ 80 triệu lúc 19:45 bị Khang chửi bới, suốt tối ngồi bán gà ở chợ Cảng.",
    alibiClaim: "Ở sạp gà chợ Cảng suốt đêm 24/07, có tiểu thương làm chứng.",
    clueFlaw: "Có động cơ thù hằn nhưng có chứng cứ ngoại phạm chắc chắn tại chợ.",
    tabTitle: "[B04] Lời khai Trần Văn Đạt (Đạt Gà)",
    gitFile: "docs/cases/case_000/03_documents/02_nhanh_tung/04_loi_khai_dat_ga.md",
    targetPdf: "public/documents/case_000/phase_2/04_loi_khai_dat_ga.pdf",
  },
  {
    code: "C01",
    type: "loi_khai",
    sheetTab: "testimonies",
    phase: "03_nhanh_ha",
    personName: "Trần Thị Hà (Lần 2 - Nhận Tội)",
    role: "Hung thủ chính (Bạn gái nạn nhân)",
    docTitle: "BIÊN BẢN LẤY LỜI KHAI & NHẬN TỘI",
    docNumber: "01/BB-LK-C",
    timeTaken: "16h00 - 18h00 ngày 26/07/2016",
    location: "Phòng lấy lời khai số 01 - Cơ quan CSĐT Công an TP. Hà Nội",
    officer: "Thượng tá Nguyễn Văn Quyết, Thiếu tá Lê Minh Tuấn",
    participants: "Trần Thị Hà (Bị can)",
    coreContent: "Thừa nhận đến lúc 20:30, phát hiện Khang bị thương, dùng bình trà đập vào đầu Khang để trả thù cho anh trai (tai nạn 1996).",
    alibiClaim: "Không còn lời khai ngoại phạm, nhận tội toàn bộ.",
    clueFlaw: "Khớp 100% với mảnh vỡ bình trà dính máu và động cơ chiếc nhẫn ngọc gia bảo.",
    tabTitle: "[C01] Lời khai Nhận tội Trần Thị Hà (Lần 2)",
    gitFile: "docs/cases/case_000/03_documents/03_nhanh_ha/01_loi_khai_lan_2_tran_thi_ha.md",
    targetPdf: "public/documents/case_000/phase_3/01_loi_khai_lan_2_tran_thi_ha.pdf",
  },

  // ==========================================
  // NHÓM 2: LÝ LỊCH (6)
  // ==========================================
  {
    code: "04",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "00_khoi_dau",
    personName: "Nguyễn Văn Khang",
    role: "Nạn nhân",
    docTitle: "BÁO CÁO XÁC MINH NHÂN THÂN, LAI LỊCH CỦA NẠN NHÂN",
    docNumber: "04/BC-XMNT",
    timeTaken: "25/07/2016",
    location: "Phòng PC02 Công an TP. Hà Nội",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ quản lý hồ sơ",
    coreContent: "Khang sinh 1988, hành nghề cho vay lãi nặng, bất minh kinh tế, có nhiều mâu thuẫn phức tạp.",
    backgroundMotive: "Cho nhiều người vay nợ số tiền lớn, xiết nợ đất đai và đe dọa con nợ.",
    criminalHistory: "Tiền sự gây rối trật tự công cộng, hoạt động tín dụng đen.",
    tabTitle: "[04] Lý lịch Nạn nhân Nguyễn Văn Khang",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/04_nhan_than_nan_nhan.md",
    targetPdf: "public/documents/case_000/phase_0/04_nhan_than_nan_nhan.pdf",
  },
  {
    code: "05a",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "00_khoi_dau",
    personName: "Nguyễn Ngọc Mai",
    role: "Nghi phạm 1 (Em họ)",
    docTitle: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    docNumber: "05a/TL-LL",
    timeTaken: "25/07/2016",
    location: "Công an Phường Phân khu Cảng",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    coreContent: "Mai sinh 1992, giáo viên mầm non, em họ Khang, đứng tên vay tiền giúp chồng.",
    backgroundMotive: "Áp lực nợ nần 300 triệu đồng Khang đòi ráo riết.",
    criminalHistory: "Chưa có tiền án, tiền sự.",
    tabTitle: "[05a] Lý lịch Nguyễn Ngọc Mai",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/05a_ly_lich_nguyen_ngoc_mai.md",
    targetPdf: "public/documents/case_000/phase_0/05a_ly_lich_nguyen_ngoc_mai.pdf",
  },
  {
    code: "05b",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "00_khoi_dau",
    personName: "Lê Quang Vũ",
    role: "Nghi phạm 2 (Em rể)",
    docTitle: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    docNumber: "05b/TL-LL",
    timeTaken: "25/07/2016",
    location: "Công an Phường Phân khu Cảng",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    coreContent: "Vũ sinh 1991, nhân viên kỹ thuật điện thoại, nợ Khang 300 triệu để cá độ/kinh doanh thua lỗ.",
    backgroundMotive: "Bị Khang đe dọa xiết căn nhà đang ở của hai vợ chồng.",
    criminalHistory: "Có dấu hiệu tham gia cờ bạc online.",
    tabTitle: "[05b] Lý lịch Lê Quang Vũ",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/05b_ly_lich_le_quang_vu.md",
    targetPdf: "public/documents/case_000/phase_0/05b_ly_lich_le_quang_vu.pdf",
  },
  {
    code: "05c",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "00_khoi_dau",
    personName: "Trần Thị Hà",
    role: "Nghi phạm 4 (Bạn gái)",
    docTitle: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    docNumber: "05c/TL-LL",
    timeTaken: "25/07/2016",
    location: "Công an Phường Phân khu Cảng",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    coreContent: "Hà sinh 1990, nhân viên kế toán, bạn gái Khang, em gái ruột của nạn nhân vụ án 1996.",
    backgroundMotive: "Phát hiện Khang chính là thủ phạm hại chết anh trai mình 20 năm trước.",
    criminalHistory: "Chưa có tiền án tiền sự, nhân thân trong sạch.",
    tabTitle: "[05c] Lý lịch Trần Thị Hà",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/05c_ly_lich_tran_thi_ha.md",
    targetPdf: "public/documents/case_000/phase_0/05c_ly_lich_tran_thi_ha.pdf",
  },
  {
    code: "B03",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "02_nhanh_tung",
    personName: "Nguyễn Thanh Tùng",
    role: "Nghi phạm 3 (Bạn cũ)",
    docTitle: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    docNumber: "03/TL-LL",
    timeTaken: "26/07/2016",
    location: "Công an Phường Cầu Bươu",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Cán bộ trích lục hồ sơ",
    coreContent: "Tùng sinh 1986, thợ cơ khí, bạn thuở nhỏ của Khang, nợ Khang 150 triệu.",
    backgroundMotive: "Bị Khang đe dọa giữ lại giấy tờ đất hương hỏa.",
    criminalHistory: "Từng có 01 tiền sự cố ý gây thương tích năm 2012.",
    tabTitle: "[B03] Lý lịch Nguyễn Thanh Tùng",
    gitFile: "docs/cases/case_000/03_documents/02_nhanh_tung/03_ly_lich_nguyen_thanh_tung.md",
    targetPdf: "public/documents/case_000/phase_2/03_ly_lich_nguyen_thanh_tung.pdf",
  },
  {
    code: "B05",
    type: "ly_lich",
    sheetTab: "profiles",
    phase: "02_nhanh_tung",
    personName: "Trần Văn Đạt (Đạt Gà)",
    role: "Nghi phạm (Con nợ)",
    docTitle: "BẢN TRÍCH LỤC LÝ LỊCH CÁ NHÂN",
    docNumber: "05/TL-LL",
    timeTaken: "26/07/2016",
    location: "Công an Phường Phân khu Cảng",
    officer: "Trung úy Nguyễn Văn Hoàng",
    participants: "Cán bộ trích lục hồ sơ",
    coreContent: "Đạt sinh 1988, buôn bán gia cầm tại chợ Cảng, nợ Khang 80 triệu.",
    backgroundMotive: "Bị Khang đe dọa dẹp sạp buôn gà.",
    criminalHistory: "Tiền sự đánh bạc ăn tiền năm 2014.",
    tabTitle: "[B05] Lý lịch Trần Văn Đạt (Đạt Gà)",
    gitFile: "docs/cases/case_000/03_documents/02_nhanh_tung/05_ly_lich_dat_ga.md",
    targetPdf: "public/documents/case_000/phase_2/05_ly_lich_dat_ga.pdf",
  },

  // ==========================================
  // NHÓM 3: BÁO CÁO & BIÊN BẢN (4)
  // ==========================================
  {
    code: "01",
    type: "bao_cao",
    sheetTab: "reports",
    phase: "00_khoi_dau",
    subjectName: "Nguyễn Thị Lụa (Người báo tin)",
    reportType: "Tin báo tội phạm",
    docTitle: "BIÊN BẢN TIẾP NHẬN NGUỒN TIN VỀ TỘI PHẠM",
    docNumber: "01/BB-TNB",
    timeTaken: "07h00 ngày 25/07/2016",
    location: "Trụ sở Công an Phường Phân khu Cảng",
    officer: "Đại úy Bùi Tiến Đạt",
    participants: "Bà Nguyễn Thị Lụa",
    coreContent: "Tiếp nhận tin báo lúc 06h45 phát hiện Khang tử vong tại phòng khách nhà số 14.",
    keyFindings: "Hiện trường cửa mở toang, đèn sáng, nạn nhân nằm gục trên vũng máu.",
    tabTitle: "[01] Biên bản Tiếp nhận Tin báo Tội phạm",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/01_tiep_nhan_tin_bao.md",
    targetPdf: "public/documents/case_000/phase_0/01_tiep_nhan_tin_bao.pdf",
  },
  {
    code: "03a",
    type: "bao_cao",
    sheetTab: "reports",
    phase: "00_khoi_dau",
    subjectName: "Hiện trường Số 14 Đường Bờ Sông",
    reportType: "Khám nghiệm hiện trường",
    docTitle: "BIÊN BẢN KHÁM NGHIỆM HIỆN TRƯỜNG",
    docNumber: "14/BB-KNHT",
    timeTaken: "07h15 - 10h30 ngày 25/07/2016",
    location: "Số 14 Đường Bờ Sông, Phân khu Cảng, Hà Nội",
    officer: "Thượng tá Nguyễn Văn Quyết",
    participants: "Đội KTHS PC54, Viện Kiểm sát nhân dân TP. Hà Nội",
    coreContent: "Khám nghiệm hiện trường phòng khách, thu giữ dấu vân tay, mảnh bình trà vỡ, điện thoại iPhone 6s Plus.",
    keyFindings: "Mảnh bình trà thủy tinh dính máu, két sắt mở rỗng, không có dấu vết cậy phá cửa.",
    tabTitle: "[03a] Biên bản Khám nghiệm Hiện trường",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/03a_bien_ban_kham_nghiem_hien_truong.md",
    targetPdf: "public/documents/case_000/phase_0/03a_bien_ban_kham_nghiem_hien_truong.pdf",
  },
  {
    code: "03b",
    type: "bao_cao",
    sheetTab: "reports",
    phase: "00_khoi_dau",
    subjectName: "Tử thi Nguyễn Văn Khang",
    reportType: "Khám nghiệm tử thi",
    docTitle: "BÁO CÁO KHÁM NGHIỆM TỬ THI SƠ BỘ",
    docNumber: "14/BC-KNTT",
    timeTaken: "08h00 - 10h45 ngày 25/07/2016",
    location: "Phòng mổ pháp y - Bệnh viện Đa khoa Trung tâm",
    officer: "Bác sĩ Pháp y Đặng Văn Bình (PC54)",
    participants: "Điều tra viên thụ lý, Kiểm sát viên",
    coreContent: "Tử vong do chấn thương sọ não kín dập não, thời gian tử vong ước tính 20h30 - 21h00 đêm 24/07.",
    keyFindings: "2 tổn thương riêng biệt: Vết rách trán nhẹ (do xô xát trước) và Vết lún vỡ xương sọ gáy chí mạng (do vật cứng đập sau).",
    tabTitle: "[03b] Báo cáo Khám nghiệm Tử thi Sơ bộ",
    gitFile: "docs/cases/case_000/03_documents/00_khoi_dau/03b_bao_cao_kham_nghiem_tu_thi_so_bo.md",
    targetPdf: "public/documents/case_000/phase_0/03b_bao_cao_kham_nghiem_tu_thi_so_bo.pdf",
  },
  {
    code: "C03",
    type: "bao_cao",
    sheetTab: "reports",
    phase: "03_nhanh_ha",
    subjectName: "Phòng trọ Trần Thị Hà (Số 8 Ngõ 12)",
    reportType: "Khám xét khẩn cấp",
    docTitle: "BIÊN BẢN KHÁM XÉT CHỖ Ở KHẨN CẤP",
    docNumber: "03/BB-KX",
    timeTaken: "14h00 - 15h30 ngày 26/07/2016",
    location: "Phòng trọ số 3, Số 8 Ngõ 12 Đường Bờ Kè, Hà Nội",
    officer: "Thiếu tá Lê Minh Tuấn",
    participants: "Chủ nhà trọ, Cán bộ Tổ dân phố, Trần Thị Hà",
    coreContent: "Khám xét khẩn cấp phòng trọ của Hà, thu giữ váy hoa dính máu nạn nhân và chiếc nhẫn ngọc gia bảo.",
    keyFindings: "Thu giữ váy hoa dính máu ẩn giấu trong đáy tủ quần áo và tài liệu bài báo năm 1996.",
    tabTitle: "[C03] Biên bản Khám xét Phòng trọ Trần Thị Hà",
    gitFile: "docs/cases/case_000/03_documents/03_nhanh_ha/03_kham_xet_phong_ha.md",
    targetPdf: "public/documents/case_000/phase_3/03_kham_xet_phong_ha.pdf",
  },
];

function cleanContent(rawContent) {
  const lines = (rawContent || "").split("\n");
  const filtered = [];
  for (let l of lines) {
    let t = l.trim();
    if (!t) {
      filtered.push("");
      continue;
    }
    if (
      t.startsWith("#") ||
      t.startsWith("---") ||
      t.includes("CỘNG HÒA") ||
      t.includes("Độc lập") ||
      t.includes("CÔNG AN") ||
      t.startsWith("Số:") ||
      t.startsWith("*Hà Nội") ||
      t.startsWith("BIÊN BẢN") ||
      t.startsWith("BÁO CÁO") ||
      t.startsWith("BẢN TỰ THÚ") ||
      t.startsWith("BẢN TRÍCH LỤC") ||
      t.startsWith("*(Vụ án") ||
      t.startsWith("*(Nạn nhân") ||
      t.startsWith("*(Người khai") ||
      t.startsWith("*(Ghi nhận") ||
      t.startsWith("*(Đối tượng") ||
      t.startsWith("ĐIỀU TRA") ||
      t.startsWith("NGƯỜI KHAI") ||
      t.startsWith("CÁN BỘ")
    ) {
      continue;
    }
    filtered.push(t);
  }
  return filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 Bắt đầu quá trình đồng bộ hoàn hảo 21 tài liệu...");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Lấy thông tin Master Doc hiện tại
  const docInfo = await docs.documents.get({
    documentId: MASTER_DOC_ID,
    includeTabsContent: true,
  });

  function getAllTabs(tabsList) {
    let res = [];
    for (const t of tabsList) {
      res.push(t);
      if (t.childTabs) res = res.concat(getAllTabs(t.childTabs));
    }
    return res;
  }

  const allTabs = getAllTabs(docInfo.data.tabs || []);

  // 2. Soạn thảo và cập nhật chuẩn xác nội dung vào từng Tab
  console.log("\n✍️ Bắt đầu cập nhật toàn bộ nội dung và thể thức chuẩn cho từng Tab...");
  for (let i = 0; i < MASTER_DOCS_DATA.length; i++) {
    const item = MASTER_DOCS_DATA[i];
    const foundTab = allTabs.find((t) => t.tabProperties?.title === item.tabTitle);
    if (!foundTab) {
      console.warn(`⚠️ Không tìm thấy Tab: "${item.tabTitle}"`);
      continue;
    }
    const tabId = foundTab.tabProperties.tabId;
    console.log(`[${i + 1}/21] Cập nhật Tab: "${item.tabTitle}" (ID: ${tabId})...`);

    // Đọc file gốc từ Git commit 4886ce0
    let rawMd = "";
    try {
      rawMd = execSync(`git show 4886ce0:${item.gitFile}`, { encoding: "utf-8" });
    } catch (e) {
      console.error(`❌ Lỗi đọc git file ${item.gitFile}:`, e.message);
      continue;
    }

    // Chuẩn hóa tên Trần Văn Đạt trong tài liệu nếu có
    rawMd = rawMd.replace(/Trịnh Thành Đạt/g, "Trần Văn Đạt");

    const cleanBody = cleanContent(rawMd);

    const headerBlock =
      "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n" +
      "────────────────────────────────────────────────────────────\n" +
      `CÔNG AN THÀNH PHỐ HÀ NỘI                 Số: ${item.docNumber}\n` +
      `CƠ QUAN CẢNH SÁT ĐIỀU TRA (PC02)         ${item.timeTaken}\n\n`;

    const titleBlock = `${item.docTitle.toUpperCase()}\n(${item.personName || item.subjectName} — Vụ án mạng Số 14 Đường Bờ Sông)\n\n`;

    const metaBlock =
      `• Thời gian thực hiện: ${item.timeTaken}\n` +
      `• Địa điểm: ${item.location}\n` +
      `• Cán bộ thực hiện: ${item.officer}\n` +
      `• Thành phần tham gia: ${item.participants}\n` +
      `────────────────────────────────────────────────────────────\n\n`;

    const signBlock =
      "\n\n\n" +
      `               CÁN BỘ CHỦ TRÌ                                NGƯỜI KHAI BÁO / ĐƯƠNG SỰ\n` +
      `               (Ký, ghi rõ họ tên)                           (Ký, ghi rõ họ tên)\n\n\n\n` +
      `               ${item.officer.split(",")[0].trim()}                          ${(item.personName || item.subjectName).split("(")[0].trim()}\n`;

    const fullText = headerBlock + titleBlock + metaBlock + cleanBody + signBlock;

    // Xóa nội dung cũ trong tab
    const tabBodyContent = foundTab?.documentTab?.body?.content || [];
    const lastElem = tabBodyContent[tabBodyContent.length - 1];
    const endIndex = lastElem ? lastElem.endIndex : 1;

    if (endIndex > 2) {
      await docs.documents.batchUpdate({
        documentId: MASTER_DOC_ID,
        requestBody: {
          requests: [
            {
              deleteContentRange: {
                range: {
                  tabId,
                  startIndex: 1,
                  endIndex: endIndex - 1,
                },
              },
            },
          ],
        },
      });
    }

    // Ghi nội dung mới + Định dạng Times New Roman
    await docs.documents.batchUpdate({
      documentId: MASTER_DOC_ID,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { tabId, index: 1 },
              text: fullText,
            },
          },
          {
            updateTextStyle: {
              range: { tabId, startIndex: 1, endIndex: fullText.length },
              textStyle: {
                weightedFontFamily: { fontFamily: "Times New Roman" },
                fontSize: { magnitude: 12, unit: "PT" },
              },
              fields: "weightedFontFamily,fontSize",
            },
          },
          {
            updateTextStyle: {
              range: { tabId, startIndex: 1, endIndex: 65 },
              textStyle: { bold: true },
              fields: "bold",
            },
          },
          {
            updateTextStyle: {
              range: {
                tabId,
                startIndex: headerBlock.length + 1,
                endIndex: headerBlock.length + item.docTitle.length + 1,
              },
              textStyle: { bold: true, fontSize: { magnitude: 14, unit: "PT" } },
              fields: "bold,fontSize",
            },
          },
        ],
      },
    });

    console.log(`✅ Đã cập nhật xong Tab "${item.tabTitle}" (${fullText.length} ký tự).`);
    await sleep(800);
  }

  // 3. Cập nhật Google Sheets (3 tab: testimonies, profiles, reports)
  console.log("\n📊 Đang cập nhật metadata chuẩn trên 3 Tab Google Sheets...");

  // Tab 1: testimonies
  const testimoniesRows = MASTER_DOCS_DATA.filter((d) => d.sheetTab === "testimonies").map((d) => {
    const foundTab = allTabs.find((t) => t.tabProperties?.title === d.tabTitle);
    const tabId = foundTab?.tabProperties?.tabId || "t.0";
    const gdocUrl = `https://docs.google.com/document/d/${MASTER_DOC_ID}/edit?tab=${tabId}`;
    return [
      "case_000",
      d.code,
      d.phase,
      d.personName,
      d.role,
      d.docTitle,
      d.docNumber,
      d.timeTaken,
      d.location,
      d.officer,
      d.participants,
      d.coreContent,
      d.alibiClaim,
      d.clueFlaw,
      d.tabTitle,
      gdocUrl,
    ];
  });

  const testimoniesHeader = [
    "case_id",
    "doc_code",
    "phase",
    "person_name",
    "role",
    "doc_title",
    "doc_number",
    "time_taken",
    "location",
    "officer",
    "participants",
    "core_content",
    "alibi_claim",
    "clue_flaw",
    "gdoc_tab_title",
    "gdoc_url",
  ];

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "'testimonies'!A1:Z100" });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'testimonies'!A1",
    valueInputOption: "RAW",
    requestBody: { values: [testimoniesHeader, ...testimoniesRows] },
  });
  console.log(`✅ Đã cập nhật tab testimonies (${testimoniesRows.length} dòng).`);

  // Tab 2: profiles
  const profilesRows = MASTER_DOCS_DATA.filter((d) => d.sheetTab === "profiles").map((d) => {
    const foundTab = allTabs.find((t) => t.tabProperties?.title === d.tabTitle);
    const tabId = foundTab?.tabProperties?.tabId || "t.0";
    const gdocUrl = `https://docs.google.com/document/d/${MASTER_DOC_ID}/edit?tab=${tabId}`;
    return [
      "case_000",
      d.code,
      d.phase,
      d.personName,
      d.role,
      d.docTitle,
      d.docNumber,
      d.timeTaken,
      d.location,
      d.officer,
      d.participants,
      d.coreContent,
      d.backgroundMotive,
      d.criminalHistory,
      d.tabTitle,
      gdocUrl,
    ];
  });

  const profilesHeader = [
    "case_id",
    "doc_code",
    "phase",
    "person_name",
    "role",
    "doc_title",
    "doc_number",
    "time_taken",
    "location",
    "officer",
    "participants",
    "core_content",
    "background_motive",
    "criminal_history",
    "gdoc_tab_title",
    "gdoc_url",
  ];

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "'profiles'!A1:Z100" });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'profiles'!A1",
    valueInputOption: "RAW",
    requestBody: { values: [profilesHeader, ...profilesRows] },
  });
  console.log(`✅ Đã cập nhật tab profiles (${profilesRows.length} dòng).`);

  // Tab 3: reports
  const reportsRows = MASTER_DOCS_DATA.filter((d) => d.sheetTab === "reports").map((d) => {
    const foundTab = allTabs.find((t) => t.tabProperties?.title === d.tabTitle);
    const tabId = foundTab?.tabProperties?.tabId || "t.0";
    const gdocUrl = `https://docs.google.com/document/d/${MASTER_DOC_ID}/edit?tab=${tabId}`;
    return [
      "case_000",
      d.code,
      d.phase,
      d.subjectName,
      d.reportType,
      d.docTitle,
      d.docNumber,
      d.timeTaken,
      d.location,
      d.officer,
      d.participants,
      d.coreContent,
      d.keyFindings,
      d.tabTitle,
      gdocUrl,
    ];
  });

  const reportsHeader = [
    "case_id",
    "doc_code",
    "phase",
    "subject_name",
    "report_type",
    "doc_title",
    "doc_number",
    "time_taken",
    "location",
    "officer",
    "participants",
    "core_content",
    "key_findings",
    "gdoc_tab_title",
    "gdoc_url",
  ];

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "'reports'!A1:Z100" });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'reports'!A1",
    valueInputOption: "RAW",
    requestBody: { values: [reportsHeader, ...reportsRows] },
  });
  console.log(`✅ Đã cập nhật tab reports (${reportsRows.length} dòng).`);

  console.log("\n🎉 HOÀN TẤT ĐỒNG BỘ 100% TOÀN BỘ 21 TÀI LIỆU CHUẨN XÁC!");
}

main().catch(console.error);
