import { TimelineEvent, ConclusionOption, Evaluation } from '@/lib/types'

export const timelineEvents000: TimelineEvent[] = [
  { id: 't1', text: '18:30 — Nguyễn Ngọc Mai đến đòi lại 50% đất 200m², ném Đơn tố cáo rồi rời đi lúc 19:00' },
  { id: 't2', text: '19:00 — Lê Quang Vũ ở lại xin hoãn nợ 300M, bị Khang đe dọa rồi chạy ra Quán Bia 88 lúc 19:30' },
  { id: 't3', text: '20:00 — Nguyễn Thanh Tùng đến đối chất ngày giỗ 30 năm, xô Khang ngã đập đầu vỡ bình trà' },
  { id: 't4', text: '20:15 — Tùng rời hiện trường về phòng trọ Cầu Bươu khi Khang vẫn còn thở đều' },
  { id: 't5', text: '20:45 — Trần Thị Hà lẻn vào nhà, mở khóa iPhone 6s Plus phát hiện tin nhắn Khang hẹn trốn cùng Thảo Vy' },
  { id: 't6', text: '21:00 — Trần Thị Hà vơ mảnh bình trà vỡ đâm đứt động mạch cảnh Khang và cắt lọn tóc mai dính máu' }
]

export const conclusionOptions000 = {
  suspects: [
    { id: 'mai', title: 'Nguyễn Ngọc Mai', desc: 'Em họ nạn nhân (Tranh chấp đất đai)' },
    { id: 'vu', title: 'Lê Quang Vũ', desc: 'Chồng Mai / Kỹ sư điện (Nợ 300M)' },
    { id: 'tung', title: 'Nguyễn Thanh Tùng', desc: 'Bạn thời thơ ấu (Bẫy Red Herring ngày giỗ 30 năm)' },
    { id: 'ha', title: 'Trần Thị Hà', desc: 'Bạn gái Khang (HUNG THỦ THỰC SỰ)' }
  ],
  motives: [
    { id: 'romantic-jealousy', title: 'Cơn ghen cuồng loạn & Tâm lý cuồng sở hữu', desc: 'Phát hiện tin nhắn Khang hẹn bay chuyến 06:15 cùng Thảo Vy' },
    { id: 'inheritance', title: 'Tranh chấp 200m² đất di sản thừa kế', desc: 'Đòi lại đất bị làm giả ủy quyền' },
    { id: 'extortion', title: 'Thù hận bi kịch trốn tìm 1996', desc: 'Hận thù cái chết ngạt của em trai Gia Huy do Khang gây ra' }
  ],
  methods: [
    { id: 'glass-shard-stab', title: 'Đâm đứt động mạch cảnh bằng mảnh bình trà vỡ', desc: 'Vơ mảnh vỡ bình trà đâm nạn nhân lúc 21:00' },
    { id: 'blunt-force', title: 'Đập đầu chấn thương sọ kín', desc: 'Gây ra cú đập gáy lúc 20:00' }
  ],
  evidenceList: [
    { id: 'EV-HAIR-DNA', title: '04_giam_dinh_adn_lon_toc.md (Lọn tóc ADN trong áo ngực)' },
    { id: 'EV-VOICEMAIL-TRAIN', title: '02_giam_dinh_am_thanh_coi_tau.md (Còi tàu 20:32 bóc trần ngoại phạm)' },
    { id: 'EV-VTV3-SCHEDULE', title: '06_lich_phat_song_vtv3.md (Gameshow VTV3 tối thứ Sáu)' }
  ]
}

export const evaluation000: Evaluation = {
  caseId: 'case-000',
  suspectName: 'Trần Thị Hà',
  motiveTitle: 'Cơn ghen cuồng loạn & Tâm lý cuồng sở hữu',
  methodTitle: 'Đâm đứt động mạch cảnh bằng mảnh bình trà vỡ',
  radarScores: [
    { id: 'r1', name: 'Độ chính xác suy luận', score: 100, desc: 'Bóc tách chính xác mâu thuẫn mốc giờ ngoại phạm' },
    { id: 'r2', name: 'Pháp y & Giám định', score: 95, desc: 'Phân lập đúng 2 giai đoạn tổn thương' },
    { id: 'r3', name: 'Khai thác chứng cứ sinh học', score: 90, desc: 'Phát hiện lọn tóc ADN trong áo ngực' }
  ],
  strengths: 'Phát hiện tiếng còi tàu 20:32 và lịch VTV3 bóc trần alibi của Hà, kết hợp lọn tóc ADN định tội tuyệt đối.',
  weaknesses: 'Không bị rơi vào bẫy Red Herring do cú xô ngã của Tùng lúc 20:00.',
  missedEvidence: 'Không có.',
  correctTimeline: [
    '19:00 — Mai ném đơn đòi đất rồi rời đi',
    '19:30 — Vũ đón xe ôm ra Quán Bia 88',
    '20:00 — Tùng xô ngã Khang & vỡ bình trà',
    '20:15 — Tùng bỏ chạy về Cầu Bươu',
    '20:45 — Hà lẻn vào nhà Khang',
    '21:00 — Hà đâm đứt động mạch cảnh Khang'
  ],
  evidenceUsage: {
    used: ['EV-HAIR-DNA', 'EV-VOICEMAIL-TRAIN'],
    ignored: [],
    critical: ['EV-HAIR-DNA', 'EV-VOICEMAIL-TRAIN']
  }
}
