import { TimelineEvent, ConclusionOption, Evaluation } from '@/lib/types'

export const timelineEvents000: TimelineEvent[] = [
  { id: 't1', text: '18:30 — Trần Ngọc Mai lén tráo di chúc gốc mang đi giám định' },
  { id: 't2', text: '19:30 — Lê Quang Vũ chui cửa sau tìm bản vẽ 75m2 tiêu hủy' },
  { id: 't3', text: '20:00 — Nguyễn Thanh Tùng cãi vã, làm vỡ bình trà & xô Khang ngất xỉu' },
  { id: 't4', text: '20:15 — Tùng tháo chạy hoảng loạn khỏi hiện trường' },
  { id: 't5', text: '20:45 — Trần Thị Hà chui qua cửa sau, đọc tin nhắn tình nhân rủ đi du lịch lúc 20:40' },
  { id: 't6', text: '21:00 — Trần Thị Hà dùng mảnh thủy tinh vỡ đâm chết Khang' }
]

export const conclusionOptions000 = {
  suspects: [
    { id: 'mai', title: 'Trần Ngọc Mai', desc: 'Em họ nạn nhân' },
    { id: 'vu', title: 'Lê Quang Vũ', desc: 'Chồng Mai / Nhân viên đo đạc' },
    { id: 'tung', title: 'Nguyễn Thanh Tùng', desc: 'Bạn cũ (Bẫy Red Herring)' },
    { id: 'ha', title: 'Trần Thị Hà', desc: 'Bạn gái cũ (HUNG THỦ THỰC SỰ)' }
  ],
  motives: [
    { id: 'romantic-jealousy', title: 'Ghen tuông cuồng loạn', desc: 'Phát hiện tin nhắn tình nhân mới lúc 20:40' },
    { id: 'inheritance', title: 'Tranh chấp di chúc thừa kế', desc: 'Muốn chiếm đoạt căn nhà đền bù' },
    { id: 'extortion', title: 'Trả thù tống tiền 1998', desc: 'Thù hận về cái chết của Gia Huy' }
  ],
  methods: [
    { id: 'glass-shard-stab', title: 'Đâm đứt động mạch cảnh bằng mảnh thủy tinh', desc: 'Vơ mảnh vỡ bình trà đâm nạn nhân lúc 21:00' },
    { id: 'blunt-force', title: 'Đập đầu chấn thương sọ nội', desc: 'Gây ra cú đập gáy lúc 20:00' }
  ],
  evidenceList: [
    { id: 'EV-GLASS-SHARD', title: '12_bao_cao_phap_y_bo_sung.pdf (Giờ tử vong 21:00)' },
    { id: 'EV-TIME-MISMATCH', title: '07d_bien_ban_loi_khai_tran_thi_ha.pdf (Hà lỡ lời mô tả bình trà vỡ)' },
    { id: 'EV-BLUEPRINT', title: '10_ban_do_dia_chinh_va_giay_no_vu.pdf' }
  ]
}

export const evaluation000: Evaluation = {
  caseId: 'case-000',
  suspectName: 'Trần Thị Hà',
  motiveTitle: 'Ghen tuông cuồng loạn',
  methodTitle: 'Đâm đứt động mạch bằng mảnh thủy tinh vỡ',
  radarScores: [
    { id: 'r1', name: 'Độ chính xác suy luận', score: 100, desc: 'Bóc tách chính xác mâu thuẫn mốc giờ ngoại phạm' },
    { id: 'r2', name: 'Pháp y & Giám định', score: 95, desc: 'Phân lập đúng 2 giai đoạn tổn thương' },
    { id: 'r3', name: 'Khai thác lời khai', score: 90, desc: 'Bắt trọn lỗi lỡ lời của Hà' }
  ],
  strengths: 'Phát hiện lỗi lỡ lời trong lời khai của Hà về bộ bình trà vỡ và phân biệt mốc giờ tử vong 21:00.',
  weaknesses: 'Không bị rơi vào bẫy Red Herring do cú xô ngã của Tùng.',
  missedEvidence: 'Không có.',
  correctTimeline: [
    '18:30 — Mai tráo di chúc',
    '19:30 — Vũ tìm bản vẽ gốc',
    '20:00 — Tùng xô ngã Khang & vỡ bình trà',
    '20:15 — Tùng bỏ chạy',
    '20:45 — Hà đột nhập',
    '21:00 — Hà đâm đứt động mạch cảnh Khang'
  ],
  evidenceUsage: {
    used: ['EV-GLASS-SHARD', 'EV-TIME-MISMATCH'],
    ignored: [],
    critical: ['EV-GLASS-SHARD', 'EV-TIME-MISMATCH']
  }
}
