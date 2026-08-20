import { Evaluation, TimelineEvent } from '@/lib/types'

export const timelineEvents000: TimelineEvent[] = [
  { id: 't-000-1', text: 'Mai cãi nhau với Khang về di chúc giả, âm thầm tráo bản sao lấy bản gốc đi giám định.' },
  { id: 't-000-2', text: 'Vũ (chồng Mai) đột nhập qua cửa sau tìm bản vẽ sửa nhà gốc để tiêu hủy chứng cứ gian lận đền bù.' },
  { id: 't-000-3', text: 'Tùng chạm trán Khang lúc 20:00, giằng co làm vỡ bộ bình trà thủy tinh và xô Khang bất tỉnh rồi hoảng sợ tháo chạy lúc 20:15.' },
  { id: 't-000-4', text: 'Hà âm thầm bám theo, lén vào nhà thấy Khang nằm bất tỉnh + phát hiện Khang có nhân tình mới.' },
  { id: 't-000-5', text: 'Hà dùng mảnh thủy tinh vỡ từ bộ bình trà đâm vào chỗ hiểm của Khang gây mất máu tử vong cấp lúc 21:00.' },
  { id: 't-000-6', text: 'Hà giả vờ làm người thân quen hỗ trợ cảnh sát điều tra và lỡ lời khai chi tiết mảnh vỡ bình trà.' }
]

export const conclusionOptions000 = {
  suspects: [
    { id: 'mai', name: 'Trần Ngọc Mai', role: 'Đồng thừa kế' },
    { id: 'vu', name: 'Lê Quang Vũ', role: 'Cán bộ đo đạc' },
    { id: 'tung', name: 'Tùng', role: 'Bạn cũ (Xô xát)' },
    { id: 'ha', name: 'Trần Thị Hà', role: 'Bạn gái cũ / THỦ PHẠM' }
  ],
  motives: [
    { id: 'romantic-jealousy', title: 'Ghen tuông cuồng loạn', desc: 'Sở hữu cuồng loạn, căm tức vì bị phớt lờ/bỏ rơi và phát hiện Khang có người phụ nữ mới.' },
    { id: 'past-secret', title: 'Che giấu bí mật quá khứ', desc: 'Lo sợ bị vạch trần bí mật vụ tai nạn của Gia Huy năm xưa.' },
    { id: 'inheritance', title: 'Tranh chấp thừa kế', desc: 'Chiếm đoạt trọn vẹn số tiền bồi thường đền bù đất đai.' },
    { id: 'survey-fraud', title: 'Che giấu sai phạm đo đạc', desc: 'Tiêu hủy bản vẽ khống để tránh bị tố cáo sai phạm nghề nghiệp.' }
  ],
  methods: [
    { id: 'glass-shard-stab', title: 'Đâm bằng mảnh thủy tinh vỡ', desc: 'Cầm mảnh thủy tinh vỡ từ bộ bình trà đâm vào chỗ hiểm khiến nạn nhân đứt động mạch mất máu tử vong cấp.' },
    { id: 'altercation-staged', title: 'Xô ngã trong lúc giằng co', desc: 'Giằng co làm vỡ bình trà và xô Khang bất tỉnh (Tùng gây ra nhưng không làm Khang tử vong).' },
    { id: 'alteration-will', title: 'Tráo di chúc gốc', desc: 'Đột nhập tráo bản sao di chúc vào hộp sắt để đem bản gốc đi thẩm định chữ ký.' }
  ],
  evidenceList: [
    { id: 'ev-glass', code: 'EV-GLASS-SHARD', title: 'Báo cáo khám nghiệm mảnh thủy tinh & đứt động mạch cổ' },
    { id: 'ev-time', code: 'EV-TIME-MISMATCH', title: 'Lệch khung giờ tử vong (21:00) & Lời khai lỡ lời của Hà' },
    { id: 'ev-will', code: 'EV-WILL-COPY', title: 'Bản sao di chúc bị tráo của Mai' },
    { id: 'ev-map', code: 'EV-MAP-ORIGIN', title: 'Bản vẽ sửa nhà gốc của Vũ' },
    { id: 'ev-tung-alibi', code: 'EV-TUNG-TIMELINE', title: 'Dấu vết xô xát lúc 20:15 của Tùng' }
  ]
}

export const evaluation000: Evaluation = {
  caseId: 'case-000',
  suspectName: 'Trần Thị Hà',
  motiveTitle: 'Ghen tuông cuồng loạn',
  methodTitle: 'Đâm bằng mảnh thủy tinh vỡ',
  radarScores: [
    { id: 'logic', name: 'Tư duy Logic', score: 100, desc: 'Tuyệt vời. Bạn đã bóc tách chính xác tổn thương do xô xát và tổn thương vết đâm tử vong.' },
    { id: 'deduction', name: 'Suy luận Phân tích', score: 100, desc: 'Xuất sắc phân biệt giữa Tùng (chỉ làm ngất Khang) và Hà (thủ phạm đâm mảnh thủy tinh).' },
    { id: 'timeline', name: 'Phục dựng Dòng thời gian', score: 100, desc: 'Sắp xếp chuẩn xác khung giờ tử vong 21:00 khác biệt với khung giờ Tùng rời đi 20:15.' },
    { id: 'evidence', name: 'Thu thập Bằng chứng', score: 100, desc: 'Đính kèm đầy đủ chứng cứ pháp y mảnh thủy tinh và sự lỡ lời của Hà.' }
  ],
  strengths: 'Bạn đã chỉ ra Hà mới là kẻ đâm chết Khang lúc 21:00 dựa trên mâu thuẫn thời gian pháp y và lời khai lỡ lời về bộ bình trà vỡ.',
  weaknesses: 'Không có sai sót nào trong lập luận.',
  missedEvidence: 'Không bỏ sót bằng chứng quan trọng nào.',
  correctTimeline: [
    '1. Mai cãi nhau với Khang về di chúc giả, âm thầm tráo bản sao lấy bản gốc đi giám định.',
    '2. Vũ (chồng Mai) đột nhập qua cửa sau tìm bản vẽ sửa nhà gốc để tiêu hủy chứng cứ gian lận đền bù.',
    '3. Tùng chạm trán Khang lúc 20:00, giằng co làm vỡ bộ bình trà thủy tinh và xô Khang bất tỉnh rồi hoảng sợ tháo chạy lúc 20:15.',
    '4. Hà âm thầm bám theo, lén vào nhà thấy Khang nằm bất tỉnh + phát hiện Khang có nhân tình mới.',
    '5. Hà dùng mảnh thủy tinh vỡ từ bộ bình trà đâm vào chỗ hiểm của Khang gây mất máu tử vong cấp lúc 21:00.',
    '6. Hà giả vờ làm người thân quen hỗ trợ cảnh sát điều tra và lỡ lời khai chi tiết mảnh vỡ bình trà.'
  ],
  evidenceUsage: {
    used: ['ev-glass', 'ev-time', 'ev-will', 'ev-map', 'ev-tung-alibi'],
    ignored: [],
    critical: ['ev-glass', 'ev-time']
  }
}
