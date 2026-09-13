export interface Finding {
  id: string
  phase: number
  title: string
  description: string
  evidenceRef: string
  // Array of required keyword groups — input must match AT LEAST 1 synonym from EACH group
  keywordGroups: string[][]
  hint: string
  // Key Finding triggers the unlocking of the next Phase
  isKeyFinding?: boolean
}

export const CASE_000_FINDINGS: Finding[] = [
  // =========================================================================
  // GIAI ĐOẠN 0: Màn sương hiện trường & Tử thi
  // =========================================================================
  {
    id: 'f-000-0-1',
    phase: 0,
    title: 'Tổn thương tử thi & Hai mốc thời gian',
    description: 'Nạn nhân bị xô ngã ngất lúc 20:00 (vết bầm gáy) nhưng nguyên nhân tử vong thực sự là do vết đâm đứt động mạch cảnh lúc 21:00.',
    evidenceRef: 'f1-1 / f1-2',
    isKeyFinding: true,
    keywordGroups: [
      ['tử thi', 'tu thi', 'tử vong', 'tu vong', 'bầm gáy', 'bam gay', 'gáy', 'động mạch', 'dong mach', 'máu', 'mau', 'nạn nhân', 'nan nhan', 'nạn nhân bị', 'tác động', 'tac dong', '2 người', 'hai người', 'đánh ngất', 'bị thương', 'chấn thương'],
      ['20:00', '21:00', 'hai mốc', 'hai moc', 'mốc giờ', 'moc gio', 'thời gian', 'thoi gian', 'hai lần', 'hai lan', '2 người', 'hai người', '2 mốc', 'tác động', 'tac dong', '2 chấn thương', 'đánh ngất', 'vùng tổn thương', 'hai tác động']
    ],
    hint: 'Hãy chú ý báo cáo pháp y 04: Nạn nhân bị va đập ngất vào giờ nào và thực sự tử vong vào giờ nào?'
  },
  {
    id: 'f-000-0-2',
    phase: 0,
    title: 'Ma trận 4 nghi phạm có động cơ mâu thuẫn',
    description: 'Cả 4 người (Nguyễn Ngọc Mai, Lê Quang Vũ, Nguyễn Thanh Tùng, Trần Thị Hà) đều có động cơ tranh chấp đất đai, nợ nần, thù hận quá khứ hoặc ghen tuông.',
    evidenceRef: '08 / 09',
    keywordGroups: [
      ['nghi phạm', 'nghi pham', 'bốn người', 'bon nguoi', '4 người', '4 nguoi', 'tất cả', 'tat ca', 'nhiều người', 'nhieu nguoi', 'cả 4', 'ca 4', 'các đối tượng', 'cac doi tuong'],
      ['mâu thuẫn', 'mau thuan', 'động cơ', 'dong co', 'nợ nần', 'no nan', 'tranh chấp', 'tranh chap']
    ],
    hint: 'Theo Báo cáo 09, có bao nhiêu đối tượng có mâu thuẫn trực tiếp với Khang?'
  },

  // =========================================================================
  // GIAI ĐOẠN 1: Giả mạo chữ ký đất đai & Ngoại phạm của Mai - Vũ
  // =========================================================================
  {
    id: 'f-000-1-1',
    phase: 1,
    title: 'Chữ ký đồ nét giả mạo trên Giấy ủy quyền đất',
    description: 'Khang đã dùng kỹ thuật đồ nét (tracing) sao chép chữ ký của Mai từ Biên bản 2024 sang Giấy ủy quyền đất 200m².',
    evidenceRef: 'DOC-A1 / EV-SIGN-01',
    isKeyFinding: true,
    keywordGroups: [
      ['chữ ký', 'chu ky', 'ủy quyền', 'uy quyen', 'giấy ủy quyền', 'giay uy quyen'],
      ['đồ nét', 'do net', 'tracing', 'giả mạo', 'gia mao', 'sao chép', 'sao chep']
    ],
    hint: 'Báo cáo giám định chữ ký DOC-A1 chỉ rõ chữ ký của Mai trên Giấy ủy quyền là thật hay giả mạo bằng cách nào?'
  },
  {
    id: 'f-000-1-2',
    phase: 1,
    title: 'Bằng chứng ngoại phạm của Mai & Vũ',
    description: 'Mai rời đi lúc 19:00 (khớp tiếng xe lúc Thời sự VTV1), Vũ chuyển khoản tại Quán Bia 88 lúc 20:45 cách hiện trường 3.8km.',
    evidenceRef: 'DOC-A6 / DOC-A7',
    keywordGroups: [
      ['ngoại phạm', 'ngoai pham', 'bằng chứng ngoại phạm', 'bang chung ngoai pham'],
      ['mai', 'vũ', 'vu', 'quán bia', 'quan bia', '195k', '20:45']
    ],
    hint: 'Sổ thu chi Quán Bia 88 cho thấy Vũ đang thanh toán tiền bia lúc mấy giờ?'
  },

  // =========================================================================
  // GIAI ĐOẠN 2: Bi kịch 1996 & Lời tự thú của Nguyễn Thanh Tùng
  // =========================================================================
  {
    id: 'f-000-2-1',
    phase: 2,
    title: 'Bi kịch trốn tìm 1996 & Lời tự thú xô ngã của Tùng',
    description: 'Tùng mang mẩu báo 1996 sang bắt Khang tạ tội ngày giỗ 30 năm của bé Gia Huy, xô Khang ngã ngất lúc 20:00 rồi rời đi lúc 20:15 trước giờ tàu 20:30.',
    evidenceRef: 'DOC-B1 / p4 / p5',
    isKeyFinding: true,
    keywordGroups: [
      ['tùng', 'tung', 'nguyễn thanh tùng', 'nguyen thanh tung'],
      ['1996', 'gia huy', 'mẩu báo', 'mau bao', 'tự thú', 'tu thu', 'xô ngã', 'xo nga', '20:00', '20:15']
    ],
    hint: 'Lời tự thú của Tùng và mẩu báo 1996 hé lộ điều gì về biến cố ngày 24/07 cách đây 30 năm?'
  },

  // =========================================================================
  // GIAI ĐOẠN 3: Phán quyết định tội Trần Thị Hà
  // =========================================================================
  {
    id: 'f-000-3-1',
    phase: 3,
    title: 'Còi tàu 20:32 & Lịch VTV3 bóc trần lời khai của Hà',
    description: 'Hộp thư thoại 20:32 lọt tiếng còi tàu hàng và lịch VTV3 thứ Sáu chỉ chiếu Gameshow chứng minh Hà nói dối và có mặt trước nhà Khang.',
    evidenceRef: 'DOC-C2 / DOC-C6',
    isKeyFinding: true,
    keywordGroups: [
      ['hà', 'ha', 'trần thị hà', 'tran thi ha'],
      ['còi tàu', 'coi tau', 'vtv3', 'gameshow', 'nói dối', 'noi doi', 'ngoại phạm', 'ngoai pham']
    ],
    hint: 'Phân tích âm thanh Voicemail 20:32 và Lịch phát sóng VTV3 đã bẻ gãy lời khai của Hà như thế nào?'
  },
  {
    id: 'f-000-3-2',
    phase: 3,
    title: 'Vật chứng định tội: Lọn tóc ADN trong áo ngực của Hà',
    description: 'Lọn tóc mai thu giữ trong áo ngực của Hà khớp 100% ADN của Khang (khớp mảng tóc mai bị cắt sát da đầu trong khám nghiệm tử thi).',
    evidenceRef: 'EV-HAIR-DNA / DOC-C5',
    keywordGroups: [
      ['lọn tóc', 'lon toc', 'tóc', 'toc', 'adn', 'áo ngực', 'ao nguc', 'trần thị hà', 'tran thi ha']
    ],
    hint: 'Vật chứng sinh học nào thu giữ tại người Hà là bằng chứng không thể chối cãi?'
  }
]
