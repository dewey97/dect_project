/**
 * Tạo và nạp kho ý tưởng Động cơ (`motive_ideas`) & Cách thức gây án (`method_ideas`) lên Google Sheet.
 * Bao gồm 30 mẫu Động cơ & 30 mẫu Thủ đoạn trinh thám kinh điển chuyên sâu.
 *
 * Chạy: node scripts/create-crime-ideas-sheets.js
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

const MOTIVE_ROWS = [
  [
    "id",
    "category",
    "title",
    "summary",
    "psychological_trigger",
    "victim_relation",
    "evidence_signatures",
  ],
  [
    "MOT-001",
    "Tài chính",
    "Thừa kế gia tài & Tiền bảo hiểm nhân thọ",
    "Hung thủ túng thiếu nợ nần hoặc muốn chiếm đoạt khối tài sản lớn mà nạn nhân đang đứng tên.",
    "Nạn nhân đột ngột công bố di chúc mới chia hết tiền cho từ thiện hoặc con nuôi.",
    "Con cái, vợ/chồng, người thừa kế thứ tự ưu tiên.",
    "Hợp đồng bảo hiểm vừa đăng ký, giấy nợ, di chúc giả/bị đánh tráo.",
  ],
  [
    "MOT-002",
    "Che đậy",
    "Diệt khẩu kẻ tống tiền (Blackmail Slain)",
    "Nạn nhân nắm giữ bí mật chí mạng (ngoại tình, bối cảnh phạm tội cũ, tham nhũng) và tống tiền hung thủ liên tục.",
    "Nạn nhân tăng số tiền tống tiền gấp đôi hoặc dọa tung bằng chứng lên mạng.",
    "Kẻ tống tiền - Nạn nhân tống tiền.",
    "Sao kê ngân hàng rút tiền mặt liên tục, tin nhắn mã hóa tống tiền, USB bí mật.",
  ],
  [
    "MOT-003",
    "Tình cảm",
    "Cuồng yêu & Ghen tuông mù quáng (Crime of Passion)",
    "Mối quan hệ chiếm hữu bế tắc; hung thủ không chấp nhận bị bỏ rơi hoặc phát hiện bị phản bội.",
    "Nạn nhân đính hôn với người khác hoặc dọn đồ bỏ đi ngay trong đêm.",
    "Người yêu cũ, tình nhân bí mật, vợ/chồng ly thân.",
    "Nhật ký đe dọa, nhẫn cưới bị vứt bỏ, vết cào xước tình nhân.",
  ],
  [
    "MOT-004",
    "Tài chính",
    "Tham nhũng & Trộm cắp ý tưởng/Bằng sáng chế",
    "Kẻ thủ ác muốn cướp công trình nghiên cứu, mã nguồn phần mềm hoặc công thức độc quyền trị giá hàng triệu USD.",
    "Nạn nhân sắp ký hợp đồng bán công trình cho tập đoàn đối thủ.",
    "Đồng nghiệp nghiên cứu, đối tác khởi nghiệp.",
    "Ổ cứng bị format/tháo mất, bản thảo mất trang cốt lõi, log truy cập server đêm.",
  ],
  [
    "MOT-005",
    "Che đậy",
    "Thế thân đổi căn cước (Identity Theft)",
    "Hung thủ bị truy nã hoặc nợ ngập đầu, muốn giết nạn nhân có ngoại hình/nhân dạng tương đồng để giả chết trốn nợ.",
    "Tài khoản hung thủ bị phong tỏa toàn bộ, lệnh bắt giữ sắp thi hành.",
    "Bạn cũ lâu năm xa cách, người vô gia cư có nét giống hung thủ.",
    "Mặt dây chuyền/nhẫn nhận dạng bị đeo vào thi thể cháy, xét nghiệm nha khoa mâu thuẫn.",
  ],
  [
    "MOT-006",
    "Bệnh lý",
    "Trừng phạt tội đồ (Vigilante Justice)",
    "Hung thủ tự cho mình là đấng thi hành công lý, hạ sát nạn nhân vì nạn nhân từng gây ra tội ác nhưng thoát án phạt.",
    "Án phạt quá nhẹ của tòa án hoặc quá hạn truy cứu trách nhiệm hình sự.",
    "Kẻ sống sót/Thân nhân nạn nhân cũ - Cựu tội phạm thoát án.",
    "Biểu tượng trả thù để lại hiện trường, cắt báo cũ về vụ án năm xưa.",
  ],
  [
    "MOT-007",
    "Danh dự",
    "Bảo vệ sĩ diện & Xóa vết nhơ gia tộc",
    "Nạn nhân định công khai bê bối lớn gia đình (con ngoài giá thú, dòng tiền bẩn) làm sụp đổ tập đoàn.",
    "Buổi họp báo hoặc họp cổ đông công khai tuyên bố sự thật.",
    "Bố mẹ chồng/vợ, thành viên hội đồng quản trị gia đình.",
    "Bản cam kết bảo mật bị xé rách, thỏa thuận ngầm đền bù thất bại.",
  ],
  [
    "MOT-008",
    "Thù hận",
    "Bắt nạt đường dài & Trả thù học đường/công sở",
    "Uất ức tích tụ qua nhiều năm bị nhục mạ, đày đọa tâm lý đến mức mất kiểm soát.",
    "Lời chế nhạo công khai trước mặt đồng nghiệp/bạn bè ngay trước giờ G.",
    "Sếp trực tiếp - Nạn nhân bắt nạt, bạn học cũ.",
    "Lịch sử tìm kiếm thuốc độc/cách giết người trên máy tính cá nhân.",
  ],
  [
    "MOT-009",
    "Tài chính",
    "Thôn tính doanh nghiệp & Xóa sổ cổ đông",
    "Loại bỏ người nắm quyền veto hoặc số cổ phần quyết định trong cuộc chiến tranh giành quyền lực.",
    "Biên bản họp HĐQT biểu quyết dự án sinh tử vào sáng hôm sau.",
    "Cổ đông thứ hai, phó chủ tịch tập đoàn.",
    "Ủy quyền bỏ phiếu giả mạo, hợp đồng sáp nhập đã dán tem sẵn.",
  ],
  [
    "MOT-010",
    "Tình cảm",
    "Tình mẫu tử/phụ tử mù quáng",
    "Bố mẹ sẵn sàng giết người để bảo vệ con cái khỏi án tù hoặc che đậy tội lỗi của con.",
    "Nạn nhân dọa báo công an tóm cổ đứa con bất hảo.",
    "Phụ huynh nghi phạm - Nạn nhân tố giác.",
    "Dấu vân tay người mẹ trên vũ khí dù không có mặt ở hiện trường.",
  ],
  [
    "MOT-011",
    "Bệnh lý",
    "Tâm lý thao túng Munchausen by Proxy / Án hi sinh giả",
    "Tự dàn cảnh giết người/gây tai nạn để đóng vai nạn nhân thứ hai nhằm lấy sự thương hại hoặc cứu trợ xã hội.",
    "Hết quỹ tài trợ hoặc bị công chúng lãng quên.",
    "Bản thân - Bạn thân / Thân nhân.",
    "Thuốc an thần liều cao, tài khoản gây quỹ ủng hộ tạo trước 1 ngày.",
  ],
  [
    "MOT-012",
    "Che đậy",
    "Tái phạm để che đậy vụ sát hại đầu tiên",
    "Nạn nhân vô tình nhìn thấy hung thủ phi tang vật chứng hoặc xuất hiện ở hiện trường vụ án trước.",
    "Nạn nhân vô tư nhắc đến chiếc áo dính bẩn của hung thủ đêm qua.",
    "Nhân chứng vô tình (người lau dọn, bảo vệ đêm).",
    "Nhật ký dở dang của nhân chứng viết chữ 'Tôi đã thấy...'",
  ],
  [
    "MOT-013",
    "Tài chính",
    "Vỡ nợ cờ bạc / Tiền ảo đa cấp ngầm",
    "Hung thủ nợ xã hội đen hàng chục tỷ đồng do đầu tư coin/cờ bạc, bị đe dọa chặt tay nên sát hại chủ nợ hoặc người giữ két sắt.",
    "Tối hậu thư thanh toán trước 24:00 đêm nay.",
    "Con nợ - Chủ nợ, đối tác đầu tư ngầm.",
    "Tin nhắn đòi nợ đe dọa, két sắt bị phá mã, ví lạnh crypto bị chuyển tiền.",
  ],
  [
    "MOT-014",
    "Danh dự",
    "Đạo văn & Bóc phốt học thuật / Giải thưởng lớn",
    "Nạn nhân nắm chứng cứ luận án tiến sĩ hoặc tác phẩm văn học đoạt giải của hung thủ là đạo nhái 100%.",
    "Hội đồng thẩm định gửi thư mời làm việc xác minh đạo văn vào sáng hôm sau.",
    "Cố vấn học thuật - Nghiên cứu sinh, tác giả vô danh - Nhà văn nổi tiếng.",
    "Bản thảo gốc viết tay bị mất, email tranh chấp quyền tác giả bị xóa sạch.",
  ],
  [
    "MOT-015",
    "Thù hận",
    "Tội lỗi y khoa & Cái chết của người thân (Medical Malpractice Revenge)",
    "Thủ phạm tin rằng bác sĩ đã cố tình tắc trách hoặc ưu tiên bệnh nhân VIP khiến người thân duy nhất của mình qua đời oan uổng.",
    "Kỷ niệm 1 năm ngày mất của người thân / Nhìn thấy bác sĩ nhận huân chương.",
    "Thân nhân người bệnh - Bác sĩ phẫu thuật chính.",
    "Hồ sơ bệnh án cũ bị đánh cắp, dao mổ y tế làm hung khí, hoa cúc trắng để lại.",
  ],
  [
    "MOT-016",
    "Tình cảm",
    "Hợp đồng hôn nhân tan vỡ & Tranh chấp quyền nuôi con",
    "Nạn nhân chuẩn bị giành toàn bộ quyền nuôi con và đẩy hung thủ ra đường không một xu dính túi.",
    "Tòa án tống đạt quyết định quyền nuôi con tạm thời.",
    "Vợ - Chồng đang trong quá trình ly hôn căng thẳng.",
    "Thỏa thuận ly hôn có chữ ký dở, đoạn băng ghi âm cãi vã giành con.",
  ],
  [
    "MOT-017",
    "Che đậy",
    "Vạch trần tai nạn giao thông bỏ trốn (Hit-and-Run Cover-up)",
    "Nhiều năm trước hung thủ lái xe say xỉn tông chết người rồi bỏ trốn. Nạn nhân nay tìm ra chiếc xe tang vật giấu kín.",
    "Nạn nhân chụp ảnh số khung xe bị mài mòn và hẹn gặp nói chuyện.",
    "Người điều tra nghiệp dư / Thám tử tư - Kẻ gây tai nạn năm xưa.",
    "Xưởng sửa xe tư nhân cũ, biên lai thay phụ tùng xe 5 năm trước.",
  ],
  [
    "MOT-018",
    "Bệnh lý",
    "Ám ảnh cưỡng chế sưu tầm & Nghệ thuật cuồng tín (Collector Obsession)",
    "Kẻ sát nhân tôn sùng cái đẹp bệnh hoạn, muốn lưu giữ nạn nhân như một tác phẩm nghệ thuật hoàn hảo vĩnh cửu.",
    "Nạn nhân thông báo giải nghệ hoặc chuẩn bị kết hôn làm mất đi 'vẻ đẹp thuần khiết'.",
    "Nhiếp ảnh gia - Người mẫu, Họa sĩ - Nàng thơ.",
    "Ảnh chụp nạn nhân từ góc khuất theo dõi (Stalking), chất bảo quản tiêu bản xác động vật.",
  ],
  [
    "MOT-019",
    "Tài chính",
    "Gian lận đấu thầu dự án nghìn tỷ",
    "Nạn nhân từ chối nhận hối lộ và kiên quyết chuyển hồ sơ gian lận kỹ thuật lên thanh tra chính phủ.",
    "Thời hạn nộp hồ sơ thanh tra kết thúc vào ngày mai.",
    "Trưởng ban thanh tra / Kỹ sư giám sát - Nhà thầu xây dựng.",
    "Bản báo cáo kết cấu thép bị bôi đen, USB chứa file ghi âm đút lót.",
  ],
  [
    "MOT-020",
    "Thù hận",
    "Cạnh tranh danh hiệu nghệ thuật / Thể thao sinh tử",
    "Kẻ về nhì vĩnh viễn không thể vượt qua thiên tài nạn nhân. Giết chết đối thủ để trở thành đại diện duy nhất.",
    "Vòng tuyển chọn cuối cùng cho kỳ thi Olympic/Liên hoan âm nhạc quốc tế.",
    "Vận động viên số 2 - Ngôi sao số 1, Nghệ sĩ vĩ cầm phụ - Nghệ sĩ độc tấu.",
    "Dây đàn bị cắt khía, bột kích thích tim giấu trong bình nước thể thao.",
  ],
  [
    "MOT-021",
    "Che đậy",
    "Tố giác đường dây buôn lậu cổ vật / Hàng giả",
    "Nạn nhân là chuyên gia giám định phát hiện bảo vật trong bảo tàng đã bị đánh tráo bằng đồ giả tinh vi.",
    "Nạn nhân chuẩn bị công bố kết quả phân tích đồng vị carbon.",
    "Giám định viên bảo tàng - Kẻ buôn cổ vật ngầm / Quản thủ bảo tàng.",
    "Kính lúp chuyên dụng vỡ, mảnh gốm cổ giả rơi dưới gầm bàn.",
  ],
  [
    "MOT-022",
    "Danh dự",
    "Cựu đặc vụ / Bê bối quân ngũ bị phanh phui",
    "Nạn nhân chuẩn bị xuất bản hồi ký tiết lộ tội ác chiến tranh hoặc nhiệm vụ đen bí mật mà hung thủ từng tham gia.",
    "Bản thảo sách được nhà xuất bản duyệt phát hành toàn cầu.",
    "Cựu đồng đội - Nhà báo chiến trường.",
    "Huy hiệu quân đội mạ vàng, vết đạn giảm thanh chuyên dụng không có số seri.",
  ],
  [
    "MOT-023",
    "Tình cảm",
    "Tam giác tình yêu & Án mạng đền tội thay người yêu",
    "Hung thủ giết người để loại trừ rào cản ngăn cách người mình thầm yêu đến với hạnh phúc.",
    "Nạn nhân liên tục bạo hành hoặc dồn ép người mà hung thủ yêu đơn phương.",
    "Người si tình thầm lặng - Kẻ bạo hành người yêu.",
    "Bức vẽ chân dung nạn nhân bị gạch chéo đỏ, khăn tay thêu tên cô gái.",
  ],
  [
    "MOT-024",
    "Bệnh lý",
    "Tà giáo cuồng tín & Hiến tế thanh tẩy",
    "Thủ phạm tin rằng cái chết của nạn nhân là nghi thức bắt buộc để ngăn chặn tai ương hoặc cứu rỗi linh hồn nhóm người.",
    "Hiện tượng thiên văn đặc biệt (Nhật thực, Trăng máu, ngày trùng cửu).",
    "Giáo chủ / Tín đồ cuồng tín - Người 'được chọn' / Kẻ đào tẩu khỏi giáo phái.",
    "Biểu tượng tế lễ vẽ bằng máu động vật, nến thơm thảo dược gây ảo giác, áo choàng đen.",
  ],
  [
    "MOT-025",
    "Tài chính",
    "Tranh chấp quyền khai thác mỏ / Đất đai vàng quy hoạch",
    "Nạn nhân kiên quyết giữ lại mảnh đất tổ tiên nằm ngay chính giữa dự án quy hoạch khu đô thị triệu đô của tập đoàn.",
    "Lệnh cưỡng chế giải tỏa bị tòa án đình chỉ do đơn kiện của nạn nhân.",
    "Hộ dân đơn lẻ - Trùm bất động sản / Xã hội đen bảo kê dự án.",
    "Bản đồ địa chính bị sửa mốc giới, hợp đồng chuyển nhượng ép buộc chưa công chứng.",
  ],
  [
    "MOT-026",
    "Che đậy",
    "Bí mật thân phận con lai / Dòng dõi thừa kế hoàng gia",
    "Hung thủ là kẻ mạo danh người thừa kế suốt 20 năm; nạn nhân là người con ruột thật sự vừa xuất hiện trở lại.",
    "Kết quả xét nghiệm ADN huyết thống sắp có tại trung tâm giám định.",
    "Kẻ mạo danh - Người thừa kế thực sự.",
    "Phiếu kết quả ADN bị đốt dở, vết bớt nhận dạng trên thi thể bị hủy hoại.",
  ],
  [
    "MOT-027",
    "Thù hận",
    "Phản bội tổ chức ngầm & Ôm tiền bỏ trốn",
    "Nạn nhân là kế toán của băng đảng, gom sạch quỹ đen chuẩn bị đào tẩu ra nước ngoài cùng người tình.",
    "Vé máy bay một chiều và hộ chiếu giả đã kích hoạt.",
    "Sát thủ tổ chức ngầm - Kế toán phản bội.",
    "Vali rỗng dính bụi tiền tệ, hộ chiếu giả bị xé góc, đồng xu đánh dấu của băng đảng.",
  ],
  [
    "MOT-028",
    "Danh dự",
    "Bí mật nghiện ngập / Bán độ thể thao điện tử (Esports Match-Fixing)",
    "Nạn nhân là đội trưởng từ chối bán độ trận chung kết thế giới và dọa tố giác toàn bộ ban huấn luyện.",
    "Trận chung kết diễn ra vào ngày mai với số tiền cá cược lên đến hàng triệu USD.",
    "Huấn luyện viên / Nhà tài trợ ngầm - Đội trưởng tuyển thủ.",
    "Dữ liệu chat Telegram bí mật, tài khoản ngân hàng nước ngoài nhận tiền cọc cá độ.",
  ],
  [
    "MOT-029",
    "Tình cảm",
    "Chiếm đoạt danh phận người vợ / chồng hoàn hảo (Gaslighting & Replacement)",
    "Hung thủ phẫu thuật thẩm mỹ hoặc từng bước mô phỏng cử chỉ của nạn nhân để thay thế hoàn toàn vị trí của nạn nhân trong gia đình.",
    "Nạn nhân phát hiện chiếc vali chứa toàn đồ đạc giống hệt mình dưới tầng hầm.",
    "Người giúp việc / Bạn thân - Nữ chủ nhà.",
    "Hóa đơn phẫu thuật chỉnh hình khuôn mặt, trang sức bị đánh tráo bản sao tinh vi.",
  ],
  [
    "MOT-030",
    "Che đậy",
    "Khử nhân chứng bảo vệ của viện kiểm sát (Witness Protection Leak)",
    "Nạn nhân là nhân chứng quan trọng chuẩn bị ra tòa điều trần chống lại tập đoàn mafia; hung thủ là cảnh sát biến chất bảo vệ nhân chứng.",
    "Phiên tòa đại hình ấn định khai mạc trong vòng 48 giờ.",
    "Cảnh sát bảo vệ bị mua chuộc - Nhân chứng được bảo vệ.",
    "Thiết bị định vị GPS siêu nhỏ giấu trong gấu áo, điện thoại 'Burner Phone' liên lạc với trùm mafia.",
  ],
];

const METHOD_ROWS = [
  [
    "id",
    "category",
    "title",
    "summary",
    "required_tools",
    "forensic_traces",
    "alibi_trick",
    "flaw_counter",
  ],
  [
    "MET-001",
    "Độc chất",
    "Xyanua tráo trong vỏ viên thuốc bổ/kháng sinh",
    "Rút ruột viên thuốc nang của nạn nhân, nhét xyanua hòa tan rồi đóng nắp lại. Nạn nhân tự uống đúng giờ.",
    "Viên thuốc nang rỗng, Kali Xyanua.",
    "Niêm mạc dạ dày màu đỏ tươi, mùi hạnh nhân đắng.",
    "Hung thủ rời thành phố từ 3 ngày trước; thuốc uống vào mới phát độc.",
    "Lọ thuốc trên bàn chỉ có 1 viên duy nhất chứa độc, vân tay hung thủ trên nắp hộp thuốc cũ.",
  ],
  [
    "MET-002",
    "Ngoại phạm Alibi",
    "Đá lạnh hẹn giờ chập điện / Giờ chết giả",
    "Dùng tảng đá lớn chèn công tắc hoặc dây dẫn điện. Khi đá tan, công tắc bật gây cháy/điện giật.",
    "Khay đá lạnh lớn, hệ thống dây điện hở, lò sưởi bật tối đa.",
    "Vệt nước đọng bất thường dưới sàn dính bụi điện, nhiệt độ phòng bị chỉnh cao làm biến dạng thời gian co cứng tử thi.",
    "Có hóa đơn ăn uống và camera đối diện cách 10km lúc sự cố xảy ra.",
    "Nồng độ độ ẩm trong phòng cao bất thường, vết nước đá tan còn sót lại dưới thảm ngấm.",
  ],
  [
    "MET-003",
    "Tai nạn dàn dựng",
    "Thắng xe rò rỉ dầu phanh (Brake Line Tampering)",
    "Dùng dao cắt vết nhỏ trên dây dẫn dầu phanh xe ô tô. Dầu chảy từ từ, đạp phanh vài lần sẽ mất hoàn toàn áp suất ở đoạn đường đèo.",
    "Kìm cắt kim loại, chất dung môi xóa dầu.",
    "Vết cắt ngọt cơ học trên ống dẫn cao su thay vì vết nứt lão hóa.",
    "Đang dự tiệc cưới đông người khi tai nạn xe xảy ra.",
    "Vết dầu phanh dính trên tay áo cũ của hung thủ bị giặt dở.",
  ],
  [
    "MET-004",
    "Bẫy cơ học",
    "Súng tự động kích hoạt bằng dây cước và tay nắm cửa",
    "Gắn súng vào kệ sách, buộc dây cước nối với tay nắm cửa phòng. Nạn nhân đẩy cửa vào tự kéo cò súng.",
    "Súng ngắn, dây cước câu cá trong suốt, đinh vị trí.",
    "Dấu vết dây cước cọ xát trên sơn tay nắm cửa, lỗ đinh mới đóng sau tủ.",
    "Hung thủ đang Livestream hoặc nghe điện thoại với cảnh sát lúc tiếng súng nổ.",
    "Dây cước bị đứt còn sót lại trong thùng rác hoặc cuộn cước thiếu đúng 1.5m.",
  ],
  [
    "MET-005",
    "Độc chất",
    "Khí CO (Cacbon Monoxit) qua hệ thống điều hòa / Thông gió",
    "Dẫn khí thải động cơ nổ hoặc xả CO vào đường ống thông gió phòng ngủ kín của nạn nhân khi đang ngủ.",
    "Ống dẫn mềm, máy phát điện cầm tay.",
    "Máu tử thi màu đỏ hồng đào (cherry-red), không có dấu hiệu giằng co.",
    "Ngủ tại khách sạn khác; thiết bị bơm khí tự tắt khi hết nhiên liệu.",
    "Vết muội than đen bám ở miệng vòi thông gió phòng ngủ.",
  ],
  [
    "MET-006",
    "Ngoại phạm Alibi",
    "Ghi âm tiếng động dàn dựng & Gọi video giả mạo",
    "Mở băng ghi âm tiếng va chạm/cãi nhau trong phòng kín. Hung thủ ra ngoài gặp nhân chứng làm bằng chứng ngoại phạm.",
    "Loa Bluetooth hẹn giờ, file ghi âm cắt ghép giọng nạn nhân.",
    "Điện thoại nạn nhân nhận cuộc gọi đến nhưng không có dữ liệu sóng thực tế.",
    "Có 5 nhân chứng xác nhận hung thủ đang uống cà phê dưới sảnh khi nghe tiếng cãi nhau trên lầu.",
    "Tiếng chim hót trong file ghi âm thuộc loài chim không có ở địa phương.",
  ],
  [
    "MET-007",
    "Vũ khí",
    "Băng nhọn đâm chết rồi tự tan (Ice Dagger)",
    "Dùng khuôn đúc dao bằng đá lạnh nước tinh khiết cứng. Đâm vào động mạch rồi để đá tự tan thành nước dưới nhiệt độ phòng.",
    "Khuôn silicon hình dao, tủ đông âm độ.",
    "Vết thương đâm thủng không có kim loại sót lại, vết nước ngấm ướt áo nạn nhân xung quanh vết máu.",
    "Không tìm thấy bất kỳ vũ khí hung khí nào trong phạm vi 5km.",
    "Hàm lượng Clo/Khoáng chất trong vệt nước ngấm trên áo khớp với nước lọc từ máy nhà hung thủ.",
  ],
  [
    "MET-008",
    "Tai nạn dàn dựng",
    "Dị ứng thực phẩm cố ý (Anaphylactic Shock)",
    "Lén pha chiết xuất đậu phộng/bột hải sản vào món ăn của nạn nhân có tiền sử dị ứng cấp tính severe.",
    "Bột dị ứng cô đặc, muỗng khuấy bẩn.",
    "Sốc phản vệ, nghẽn đường thở, không có dấu vết bạo lực.",
    "Món ăn do đầu bếp nhà hàng nấu, hung thủ chỉ là khách mời cùng bàn.",
    "Chiếc bơm tiêm Epinephrine tự động trong túi nạn nhân đã bị rút hết thuốc từ trước.",
  ],
  [
    "MET-009",
    "Bẫy cơ học",
    "Điện giật qua tay nắm cửa kim loại / Bồn tắm",
    "Nối dây điện nguồn vào khung cửa kim loại hoặc vòi nước bồn tắm. Kích hoạt qua ổ cắm thông minh Wi-Fi.",
    "Dây điện lõi đồng, ổ cắm điều khiển từ xa Tuya/SmartLife.",
    "Vết bỏng điện hình điểm ở ngón tay tử thi, nội tạng tụ máu cấp.",
    "Đang ở nước ngoài, bật tắt thiết bị qua app điện thoại.",
    "Log máy chủ đám mây của app nhà thông minh ghi nhận lệnh ON từ IP của hung thủ.",
  ],
  [
    "MET-010",
    "Vũ khí",
    "Siết cổ bằng dây ni-lông rồi thiêu hủy dây",
    "Dùng dây siêu bền siết cổ nạn nhân, sau đó ném dây vào lò sưởi / bếp gas đốt sạch thành tro.",
    "Dây dù/dây cáp nilon, bếp lửa.",
    "Vết hằn siết cổ ngang mỏng sắc (ligature mark), vết bỏng tro nilon ở lò sưởi.",
    "Không tìm thấy dây thừng hay hung khí siết cổ.",
    "Vết hạt nhựa dính trên găng tay da của hung thủ.",
  ],
  [
    "MET-011",
    "Độc chất",
    "Thuốc bôi ngoài da hấp thụ Insulin/Succinylcholine",
    "Tiêm thuốc làm liệt cơ hoặc hạ đường huyết nặng vào kẽ ngón chân/da đầu nạn nhân khi đang say rượu.",
    "Bơm tiêm siêu nhỏ (31G), thuốc Insulin liều cao.",
    "Vết tiêm siêu nhỏ ẩn dưới kẽ ngón chân, nồng độ C-peptide bất thường trong máu.",
    "Nạn nhân chết trong ngủ gật, tử thi không vết xước.",
    "Vỏ ống thuốc Insulin bị vứt ở thùng rác công cộng gần nhà hung thủ.",
  ],
  [
    "MET-012",
    "Ngoại phạm Alibi",
    "Chuyển dời thi thể bằng xe đẩy giao hàng đêm",
    "Sát hại nạn nhân ở nơi A lúc 18:00, giấu vào thùng đông lạnh. 23:00 chở đến hiện trường B giả làm vụ cướp.",
    "Thùng xốp bảo ôn lớn, đá khô CO2.",
    "Vết hoen tử thi (livor mortis) nằm ở lưng nhưng thi thể lại được phát hiện nằm úp mặt.",
    "Có camera xác nhận nạn nhân vẫn nhắn tin lúc 20:00 (do hung thủ dùng máy nạn nhân gửi).",
    "Mẫu đá khô/tuyết nhân tạo hiếm gặp dính trên thảm lót cốp xe hung thủ.",
  ],
  [
    "MET-013",
    "Độc chất",
    "Nicotin tinh khiết tẩm vào đầu lọc điếu xì gà",
    "Trích xuất nồng độ cao nicotin từ thuốc lá công nghiệp, nhỏ vào đầu điếu xì gà đắt tiền nạn nhân hay hút trước khi ngủ.",
    "Dung môi cồn chiết xuất, ống nhỏ giọt cao su.",
    "Đồng tử co nhỏ cực độ, trụy tim đột ngột, nồng độ Cotinine trong máu chạm đỉnh kịch trần.",
    "Điếu xì gà để trong phòng kín từ 1 tuần trước; hung thủ không có mặt.",
    "Tàn tro xì gà dính vết dung môi hữu cơ chưa bay hơi hết.",
  ],
  [
    "MET-014",
    "Ngoại phạm Alibi",
    "Đổi đồng hồ treo tường & Điều khiển nhiệt độ phòng lạnh",
    "Vặn lùi đồng hồ nạn nhân 2 tiếng và bật máy lạnh xuống 16 độ C để làm chậm quá trình giảm thân nhiệt (Algor Mortis) và cứng xác.",
    "Điều khiển máy lạnh khóa nhiệt độ, găng tay vải.",
    "Độ co cứng cơ hàm và nhiệt độ gan xác chết không khớp với mốc thời gian vỡ mặt đồng hồ đeo tay.",
    "Có bằng chứng ăn tối tại nhà hàng lúc 21:00 (thời điểm đồng hồ bị vỡ chỉ 21:00 nhưng án mạng thực sự xảy ra lúc 19:00).",
    "Ngưng tụ hơi nước bên trong kính đồng hồ do thay đổi nhiệt độ đột ngột.",
  ],
  [
    "MET-015",
    "Bẫy cơ học",
    "Bẫy dây piano cắt cổ trên đường chạy xe phân khối lớn",
    "Căng dây kim loại mảnh ngang tầm cổ người lái xe ở khúc cua khuất tầm nhìn ban đêm.",
    "Dây đàn piano bằng thép gió, tăng đơ siết dây cây ven đường.",
    "Vết cắt ngọt sâu đến đốt sống cổ C3-C4, vết ma sát kim loại trên thân cây hai bên đường.",
    "Hung thủ đang ngồi trong quán bar cách đó 15km; bẫy tự hoạt động khi nạn nhân đi làm về.",
    "Dấu kẹp kìm bấm trên thân cây và vụn mạt thép dính vào vỏ cây thông.",
  ],
  [
    "MET-016",
    "Tai nạn dàn dựng",
    "Nổ khí gas qua bóng đèn dây tóc vỡ nắp",
    "Mở khóa van bình gas trong bếp kín, tháo nắp bảo vệ bóng đèn dây tóc để lộ tim đèn. Khi nạn nhân bấm công tắc, tia lửa làm phát nổ cả căn phòng.",
    "Bình gas công nghiệp, bóng đèn vonfram tháo chóa.",
    "Bỏng diện rộng toàn thân do sóng nhiệt áp suất cao, không có mảnh bom kim loại.",
    "Bật thiết bị hẹn giờ hoặc chờ nạn nhân tự đi làm về bật đèn.",
    "Dấu keo dán quanh lỗ thông gió để giữ kín khí gas trước vụ nổ.",
  ],
  [
    "MET-017",
    "Vũ khí",
    "Khối đông thịt tảng đập đầu rồi nấu chín tiêu hủy (Roast Leg of Lamb)",
    "Dùng tảng thịt bò/cừu đông lạnh cứng như đá đập vỡ sọ nạn nhân, sau đó bỏ tảng thịt vào lò nướng làm bữa tối chiêu đãi chính cảnh sát điều tra.",
    "Tảng thịt đông lạnh, lò nướng công suất cao.",
    "Chấn thương sọ não do vật tày diện rộng không để lại vết xước kim loại hay mùn gỗ.",
    "Cảnh sát tìm khắp nhà không thấy hung khí giết người vì đã ăn mất hung khí.",
    "Mảnh xương dăm nhỏ của thịt đông lạnh dính trong vết rách da đầu nạn nhân.",
  ],
  [
    "MET-018",
    "Độc chất",
    "Chất chống đông xe hơi (Ethylene Glycol) pha vào rượu vang ngọt",
    "Ethylene Glycol có vị ngọt thanh không mùi, hòa tan hoàn hảo vào rượu vang đỏ/trắng, phá hủy thận từ từ sau 24-48 giờ.",
    "Chất làm mát két nước ô tô (Antifreeze).",
    "Suy thận cấp, tinh thể Canxi Oxalat hình phong bì đặc trưng trong nước tiểu và mô thận.",
    "Nạn nhân tử vong tại bệnh viện 2 ngày sau buổi tiệc rượu khi hung thủ đã đi công tác.",
    "Chai rượu đắt tiền trong tủ có nồng độ huỳnh quang UV khác thường.",
  ],
  [
    "MET-019",
    "Ngoại phạm Alibi",
    "Tạo phòng kín bằng băng dính dán từ bên ngoài kéo qua khe cửa",
    "Sát hại nạn nhân rồi khóa chốt trong bằng sợi chỉ kéo luồn qua đáy cửa hoặc dán băng dính vào then cài rút từ ngoài.",
    "Băng keo nano siêu mỏng, chỉ dù trong suốt, nam châm neodymium cực mạnh.",
    "Không có dấu hiệu đột nhập từ bên ngoài; hiện trường là phòng kín tuyệt đối (Locked-room Mystery).",
    "Nhiều người chứng kiến phá cửa phòng khóa trái từ bên trong.",
    "Vết xước kim loại nhỏ ở mặt trong của chốt then cửa và sợi chỉ tơ kẹt dưới mép cửa.",
  ],
  [
    "MET-020",
    "Bẫy cơ học",
    "Rơi tạ nâng trần nhà qua ròng rọc cân bằng trọng lượng cát",
    "Treo vật nặng trên trần nhà, đối trọng bằng bao cát bị chọc lỗ nhỏ. Cát chảy từ từ như đồng hồ cát; sau 3 tiếng vật nặng rơi đè chết nạn nhân trên giường.",
    "Ròng rọc đôi, bao cát đục lỗ, chậu hứng cát.",
    "Chấn thương dập nát do đè ép trọng lực thẳng đứng từ trên cao.",
    "Hung thủ đang họp hội đồng quản trị lúc vật nặng rơi xuống.",
    "Vài hạt cát biển còn sót lại trong kẽ nẹp gỗ trên trần nhà.",
  ],
  [
    "MET-021",
    "Tai nạn dàn dựng",
    "Tráo dây an toàn leo núi / Dù nhảy (Rigged Carabiner / Parachute)",
    "Bôi acid ăn mòn từ từ dây đai leo núi hoặc rút chốt bung dù chính của vận động viên nhảy dù.",
    "Acid Sunfuric loãng, chốt mở dù dự phòng bị kẹt chốt chèn gỗ.",
    "Tử vong do rơi từ độ cao lớn; hiện trường trông như tai nạn thể thao mạo hiểm.",
    "Không có mặt tại đỉnh núi lúc nạn nhân bắt đầu leo.",
    "Dấu vết acid ăn mòn dạng sợi polyme dưới kính hiển vi thay vì ma sát đứt gãy tự nhiên.",
  ],
  [
    "MET-022",
    "Vũ khí",
    "Chỉ phóng điện từ súng Taser tự chế nối bình ắc quy xe tải",
    "Bắn mũi tên dẫn điện cực mạnh làm ngừng tim nạn nhân ngay lập tức, sau đó rút dây điện phi tang để ngụy tạo thành cơn đột quỵ tim.",
    "Bình ắc quy 24V nâng áp, đầu kim châm cứu mạ đồng.",
    "Hai vết bỏng điện siêu nhỏ cách nhau đúng 5cm trên ngực, rối loạn nhịp thất cơ tim.",
    "Nạn nhân có tiền sử bệnh tim nên ban đầu được kết luận tử vong tự nhiên.",
    "Vệt từ trường bất thường trên mặt khóa dây thắt lưng kim loại của nạn nhân.",
  ],
  [
    "MET-023",
    "Độc chất",
    "Độc tố cá nóc (Tetrodotoxin - TTX) gây chết giả rồi chôn sống",
    "Liều lượng TTX cực nhỏ làm tê liệt toàn thân, nhịp thở và tim đập chậm đến mức máy đo y tế thông thường không phát hiện được.",
    "Chiết xuất buồng trứng cá nóc khô, ống tiêm vi lượng.",
    "Thi thể ngạt thở trong quan tài kín sau khi bác sĩ cấp giấy chứng tử.",
    "Có giấy chứng tử hợp pháp của bệnh viện do suy hô hấp.",
    "Vết cào xước tuyệt vọng ở mặt trong nắp quan tài khi nạn nhân tỉnh lại dưới mộ.",
  ],
  [
    "MET-024",
    "Ngoại phạm Alibi",
    "Sử dụng cặp song sinh cùng trứng thay phiên xuất hiện",
    "Người anh em sinh đôi xuất hiện trước camera giám sát và bắt tay quan khách trong khi người còn lại đi thực hiện vụ ám sát.",
    "Quần áo giống hệt nhau, đồng hồ đôi, thiết bị bộ đàm tai nghe giấu kín.",
    "ADN tại hiện trường hoàn toàn trùng khớp với người đang có mặt ở bữa tiệc.",
    "Cả 100 nhân chứng đều thề danh dự thấy nghi phạm ở bữa tiệc suốt đêm.",
    "Người anh em sinh đôi thuận tay trái trong khi hung thủ thực sự thuận tay phải (được ghi lại qua camera cầm ly rượu).",
  ],
  [
    "MET-025",
    "Bẫy cơ học",
    "Thang máy bị vô hiệu hóa cảm biến tầng & Cắt cáp hãm phanh",
    "Mở khóa cửa tầng trên cao khi cabin thang máy đang ở tầng trệt; nạn nhân bước vào phòng tối và rơi thẳng xuống giếng thang máy.",
    "Chìa khóa hình tam giác mở cửa thang máy, băng dính đen che cảm biến quang học.",
    "Đa chấn thương gãy xương phức tạp do rơi tự do trong không gian hẹp.",
    "Đang ăn tối cùng gia đình; nạn nhân tự bấm thang máy tại công ty lúc tăng ca đêm.",
    "Vết băng keo dán trên mắt cảm biến hồng ngoại ở cửa thang máy tầng 5.",
  ],
  [
    "MET-026",
    "Tai nạn dàn dựng",
    "Say sóng nhân tạo bằng thuốc nhỏ mắt Scopolamine trong bể bơi",
    "Nhỏ Scopolamine vào kính bơi hoặc nước uống của nạn nhân khiến nạn nhân mất phương hướng và chìm xuống bể bơi sâu mà không thể vùng vẫy.",
    "Thuốc chống say xe chứa Scopolamine nồng độ cao.",
    "Phù phổi cấp do ngạt nước, nồng độ cồn trong máu = 0 nhưng có chất ức chế thần kinh đối giao cảm.",
    "Hung thủ đang ngồi phơi nắng cách bể bơi 20m cùng nhân viên cứu hộ.",
    "Lọ dung dịch thuốc nhỏ mắt rỗng giấu trong túi quần bơi của hung thủ.",
  ],
  [
    "MET-027",
    "Vũ khí",
    "Viên bi sắt bắn bằng súng cao su công nghiệp từ tòa nhà đối diện",
    "Bắn bi vonfram siêu nặng qua cửa sổ mở vào thái dương nạn nhân từ cự ly 80m, bi dội vào tường rồi rơi vào chậu cây giấu kín.",
    "Súng cao su trợ lực cánh tay có ống ngắm laser, bi vonfram 12mm.",
    "Vết nứt sọ hình tròn hoàn hảo, không có thuốc súng cháy bám quanh miệng vết thương (khác súng thật).",
    "Không có tiếng súng nổ, cửa phòng nạn nhân khóa kín từ bên trong.",
    "Góc đường đạn chiếu laser từ cửa sổ phòng đối diện thẳng sang bàn làm việc.",
  ],
  [
    "MET-028",
    "Độc chất",
    "Aconitine (Độc cây Ô đầu) tẩm vào bã kẹo cao su / Kem đánh răng",
    "Chất độc thảo mộc cực mạnh ngấm qua niêm mạc miệng khi nạn nhân đánh răng vào buổi sáng, làm loạn nhịp tim sau 30 phút lái xe đi làm.",
    "Củ ấu tẩu ngâm cồn cô đặc, tuýp kem đánh răng bơm độc bằng kim tiêm.",
    "Tê liệt đầu lưỡi, block dẫn truyền nhĩ thất tim độ 3.",
    "Nạn nhân đột tử khi đang lái xe một mình trên đường cao tốc cách nhà 20km.",
    "Dấu vết độc Aconitine còn sót lại trên lông bàn chải đánh răng trong nhà tắm.",
  ],
  [
    "MET-029",
    "Ngoại phạm Alibi",
    "Dùng Drone thả vật nặng từ trên không theo tọa độ GPS",
    "Lập trình Drone tự bay theo tuyến đường định sẵn, ngắt nam châm điện thả khối sắt xuống đỉnh đầu nạn nhân khi nạn nhân đi bộ trong vườn đêm.",
    "Drone 6 cánh tải trọng 5kg, nam châm điện Arduino điều khiển qua 4G.",
    "Vết thương dập sọ từ đỉnh đầu thẳng xuống, không có dấu chân hung thủ trong bán kính 100m.",
    "Hung thủ ở cách hiện trường 50km, chỉ điều khiển qua mạng di động.",
    "File log chuyến bay và tọa độ GPS còn lưu trong thẻ nhớ microSD của Drone khi thu hồi.",
  ],
  [
    "MET-030",
    "Tai nạn dàn dựng",
    "Đảo ngược van thở bình lặn biển (Helium / Khí Nito nguyên chất)",
    "Nạp khí Nito tinh khiết không có Oxy vào bình dưỡng khí của thợ lặn. Nạn nhân hít vào bị bất tỉnh sau 2 hơi thở mà không hề cảm thấy nghẹt thở (Hypoxia không báo trước).",
    "Bình khí nén N2 tinh khiết công nghiệp, đồng hồ đo áp suất giả.",
    "Tử vong do thiếu oxy não cấp tính dưới nước sâu, không có vết tích bạo lực.",
    "Hung thủ ở trên tàu cứu hộ cùng đoàn thám hiểm.",
    "Hàm lượng khí còn lại trong bình lặn được phân tích quang phổ không chứa 21% O2.",
  ],
];

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = meta.data.sheets.map((s) => s.properties.title);

  const newSheetsToCreate = [];
  if (!existingSheets.includes("motive_ideas")) {
    newSheetsToCreate.push({
      addSheet: {
        properties: {
          title: "motive_ideas",
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
    });
  }
  if (!existingSheets.includes("method_ideas")) {
    newSheetsToCreate.push({
      addSheet: {
        properties: {
          title: "method_ideas",
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
    });
  }

  if (newSheetsToCreate.length > 0) {
    console.log("Creating new idea sheets...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: newSheetsToCreate },
    });
  }

  // Clear & Update motive_ideas
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'motive_ideas'!A1:Z100",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'motive_ideas'!A1",
    valueInputOption: "RAW",
    requestBody: { values: MOTIVE_ROWS },
  });
  console.log(
    `✅ Đã ghi ${MOTIVE_ROWS.length - 1} ý tưởng Động cơ vào tab 'motive_ideas'.`,
  );

  // Clear & Update method_ideas
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'method_ideas'!A1:Z100",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'method_ideas'!A1",
    valueInputOption: "RAW",
    requestBody: { values: METHOD_ROWS },
  });
  console.log(
    `✅ Đã ghi ${METHOD_ROWS.length - 1} ý tưởng Cách thức gây án vào tab 'method_ideas'.`,
  );
})().catch((e) => console.error("ERR:", e.message));
