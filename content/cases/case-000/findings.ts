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
    title: 'Tổn thương tử thi & Hai mốc thời gian tử vong',
    description: 'Nạn nhân bị đánh gục lúc 20:00 (vết bầm gáy) nhưng nguyên nhân tử vong thực sự là do vết đâm đứt động mạch cảnh lúc 21:00.',
    evidenceRef: 'f1-1 / f1-2',
    isKeyFinding: true,
    keywordGroups: [
      ['tử thi', 'tu thi', 'tử vong', 'tu vong', 'bầm gáy', 'bam gay', 'gáy', 'động mạch', 'dong mach', 'máu', 'mau', 'nạn nhân', 'nan nhan', 'nạn nhân bị', 'tác động', 'tac dong', '2 người', 'hai người', 'đánh ngất', 'bị thương', 'chấn thương'],
      ['20:00', '21:00', 'hai mốc', 'hai moc', 'mốc giờ', 'moc gio', 'thời gian', 'thoi gian', 'hai lần', 'hai lan', '2 người', 'hai người', '2 mốc', 'tác động', 'tac dong', '2 chấn thương', 'đánh ngất', 'vùng tổn thương', 'hai tác động']
    ],
    hint: 'Hãy chú ý báo cáo pháp y 01: Nạn nhân bị đánh ngất vào giờ nào và thực sự tử vong vào giờ nào?'
  },
  {
    id: 'f-000-0-2',
    phase: 0,
    title: 'Ma trận 4 nghi phạm có động cơ mâu thuẫn',
    description: 'Cả 4 người thân thiết (Trần Ngọc Mai, Lê Quang Vũ, Nguyễn Thanh Tùng, Trần Thị Hà) đều có động cơ tranh chấp đất đai hoặc nợ nần.',
    evidenceRef: 'f1-5 / f1-6',
    keywordGroups: [
      ['nghi phạm', 'nghi pham', 'bốn người', 'bon nguoi', '4 người', '4 nguoi', 'tất cả', 'tat ca', 'nhiều người', 'nhieu nguoi', 'cả 4', 'ca 4', 'các đối tượng', 'cac doi tuong'],
      ['mâu thuẫn', 'mau thuan', 'động cơ', 'dong co', 'nợ nần', 'no nan', 'tranh chấp', 'tranh chap']
    ],
    hint: 'Theo Báo cáo 05, có bao nhiêu đối tượng có mâu thuẫn trực tiếp với Khang?'
  },

  // =========================================================================
  // GIAI ĐOẠN 1: Tờ di chúc bị tẩy xóa & Tranh chấp đất đai
  // =========================================================================
  {
    id: 'f-000-1-1',
    phase: 1,
    title: 'Tờ di chúc bị tẩy xóa làm giả bằng hóa chất',
    description: 'Di chúc gốc 2018 bị gột rửa bằng dung môi hóa chất và viết đè bằng mực bi dầu 2024 nhằm chiếm đoạt 75m2 đất.',
    evidenceRef: 'f2-1 / f2-2',
    isKeyFinding: true,
    keywordGroups: [
      ['di chúc', 'di chuc', 'tờ di chúc', 'to di chuc'],
      ['tẩy xóa', 'tay xoa', 'làm giả', 'lam gia', 'hóa chất', 'hoa chat', 'gột rửa', 'got rua', 'mực bi', 'muc bi', 'sửa']
    ],
    hint: 'Kết quả giám định 09 chỉ rõ tờ di chúc đã bị làm gì và dùng mực năm nào?'
  },
  {
    id: 'f-000-1-2',
    phase: 1,
    title: 'Bằng chứng ngoại phạm của Mai & Vũ',
    description: 'Mai có chứng cứ ở văn phòng luật sư lúc 20:30, Vũ ở quán nhậu từ 19:30 - 22:00, loại trừ khả năng trực tiếp ra tay.',
    evidenceRef: 'f2-3 / 07a / 07b',
    keywordGroups: [
      ['ngoại phạm', 'ngoai pham', 'bằng chứng ngoại phạm', 'bang chung ngoai pham'],
      ['mai', 'vũ', 'vu', 'luật sư', 'luat su', 'quán nhậu', 'quan nhau']
    ],
    hint: 'Báo cáo xác minh 10 cho thấy Mai và Vũ đang ở đâu trong khung giờ gây án?'
  },

  // =========================================================================
  // GIAI ĐOẠN 2: Bí mật quá khứ & Bẫy Red Herring Nguyễn Thanh Tùng
  // =========================================================================
  {
    id: 'f-000-2-1',
    phase: 2,
    title: 'Ghim cài áo công trường & Bác bỏ lời khai vắng mặt của Tùng',
    description: 'Chiếc ghim cài áo công trường rơi tại hiện trường bác bỏ lời khai của Tùng (khai chỉ gọi điện thoại lúc 20:55 chứ không đến nhà), chứng minh Tùng có mặt trong phòng khách.',
    evidenceRef: 'f1-2 / p8 / 07c',
    isKeyFinding: true,
    keywordGroups: [
      ['tùng', 'tung', 'nguyễn thanh tùng', 'nguyen thanh tung'],
      ['ghim cài áo', 'ghim cai ao', 'huy hiệu', 'huy hieu', 'xây dựng', 'xay dung', 'bác bỏ', 'bac bo', 'hiện trường', 'hien truong', 'có mặt', 'co mat', 'nói dối', 'noi doi']
    ],
    hint: 'Vật chứng kim loại p8 rơi dưới chân bàn trà có liên quan gì đến nghề nghiệp công nhân xây dựng của Tùng?'
  },
  {
    id: 'f-000-2-2',
    phase: 2,
    title: 'Bút tích khung tranh & Động cơ xô xát từ bài báo 1998',
    description: 'Sau khi nghe Khang say rượu khoe chiến tích nhốt Gia Huy vào tủ gỗ, Tùng mang bài báo 1998 sang đối chất và bị Khang xé thách thức, dẫn tới xô xát lúc 20:00.',
    evidenceRef: 'f3-1 / f3-2 / p4 / p5',
    keywordGroups: [
      ['trốn tìm', 'tron tim', 'gia huy', 'bài báo', 'bai bao', 'khung tranh', 'khung tranh', 'bút tích', 'but tich'],
      ['nhốt tủ', 'nhot tu', 'say rượu', 'say ruou', 'đối chất', 'doi chat', 'xô ngã', 'xo nga', '20:00', '20:15']
    ],
    hint: 'Mặt sau khung tranh p4 và các mảnh báo p5 hé lộ nguồn cơn xô xát bắt nguồn từ câu nói say xỉn nào của Khang?'
  },

  // =========================================================================
  // GIAI ĐOẠN 3: Phán quyết cuối cùng & Động cơ cuồng sở hữu
  // =========================================================================
  {
    id: 'f-000-3-1',
    phase: 3,
    title: 'Trần Thị Hà lỡ lời mô tả tư thế Khang gục ngã',
    description: 'Hà khai ở nhà cả tối nhưng lại mô tả chính xác Khang gục cạnh bộ bình trà vỡ (bình vỡ lúc 20:00 bởi Tùng, nhưng Khang bị đâm lúc 21:00).',
    evidenceRef: '12 / 07d',
    isKeyFinding: true,
    keywordGroups: [
      ['hà', 'ha', 'trần thị hà', 'tran thi ha'],
      ['lỡ lời', 'lo loi', 'mô tả', 'mo ta', 'bình trà vỡ', 'binh tra vo', 'khang gục', 'khang guc', 'hiện trường', 'hien truong']
    ],
    hint: 'Báo cáo pháp y bổ sung 12 vạch trần chi tiết lỡ lời nào trong khai báo của Trần Thị Hà?'
  },
  {
    id: 'f-000-3-2',
    phase: 3,
    title: 'Động cơ sát hại của Hà: Tin nhắn tình nhân 20:40',
    description: 'Hà quay lại lúc 20:50, thấy tin nhắn rủ tình nhân du lịch trên máy Khang (20:40), ghen tuông bộc phát cầm mảnh thủy tinh đâm đứt động mạch cảnh.',
    evidenceRef: '13 / ev-p6',
    keywordGroups: [
      ['tin nhắn', 'tin nhan', 'tình nhân', 'tinh nhan', '20:40', 'ghen tuông', 'ghen tuong', 'du lịch', 'du lich', 'đâm', 'dam'],
      ['hà', 'ha', 'động cơ', 'dong co', 'sát hại', 'sat hai', 'thủy tinh', 'thuy tinh']
    ],
    hint: 'Tổng hợp SMS 13 phát hiện tin nhắn nào lúc 20:40 đẩy Hà vào cơn ghen điên loạn?'
  }
]
