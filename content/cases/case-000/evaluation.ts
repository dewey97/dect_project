import { Evaluation, TimelineEvent } from '@/lib/types'

export const timelineEvents000: TimelineEvent[] = [
  { id: 't-000-1', text: 'Mai cãi nhau với Khang về bản di chúc giả.' },
  { id: 't-000-2', text: 'Mai âm thầm tráo di chúc gốc bằng bản sao và mang đi giám định.' },
  { id: 't-000-3', text: 'Vũ lập biên bản mô tả sai lệch hiện trạng diện tích nhà Khang để nhận chia tiền.' },
  { id: 't-000-4', text: 'Vũ đột nhập lại hiện trường vào buổi tối để tìm bản vẽ gốc nhằm tiêu hủy chứng cứ.' },
  { id: 't-000-5', text: 'Hà lén lấy đi chiếc còi đồng của Gia Huy khỏi hộp sắt tủ âm tường.' },
  { id: 't-000-6', text: 'Tùng giằng co xô ngã Khang, bỏ mặc nạn nhân và dàn dựng hiện trường giả.' }
]

export const conclusionOptions000 = {
  suspects: [
    { id: 'mai', name: 'Trần Ngọc Mai', role: 'Đồng thừa kế' },
    { id: 'vu', name: 'Lê Quang Vũ', role: 'Nhân viên đo đạc' },
    { id: 'ha', name: 'Hà', role: 'Bạn thuở nhỏ' },
    { id: 'tung', name: 'Tùng', role: 'Bạn cũ / Thủ phạm' }
  ],
  motives: [
    { id: 'past-secret', title: 'Che giấu bí mật quá khứ', desc: 'Thủ tiêu Khang vì anh ta dùng cái chết của Gia Huy năm xưa để tống tiền cả nhóm.' },
    { id: 'inheritance', title: 'Tranh chấp thừa kế', desc: 'Chiếm đoạt trọn vẹn số tiền bồi thường đền bù giải phóng mặt bằng căn nhà.' },
    { id: 'survey-fraud', title: 'Che giấu sai phạm đo đạc', desc: 'Tiêu hủy chứng cứ Khang dùng để khống chế đe dọa tố cáo sai phạm nghề nghiệp.' }
  ],
  methods: [
    { id: 'altercation-staged', title: 'Xô ngã và dàn dựng hiện trường', desc: 'Giằng co xô ngã Khang từ cú ngã chí mạng, bỏ mặc nạn nhân tử vong và dựng hiện trường giả để đánh lạc hướng.' },
    { id: 'alteration-will', title: 'Tráo di chúc gốc', desc: 'Đột nhập tráo bản sao di chúc vào hộp sắt để đem bản gốc đi thẩm định chữ ký.' },
    { id: 'theft-drawing', title: 'Đột nhập trộm bản vẽ', desc: 'Quay lại căn nhà vào ban đêm để lấy lại bản vẽ sửa nhà gốc nhằm xóa dấu vết gian lận.' }
  ],
  evidenceList: [
    { id: 'ev-will', code: 'EV-WILL-COPY', title: 'Bản sao di chúc bị tráo' },
    { id: 'ev-whistle', code: 'EV-WHISTLE-GONE', title: 'Còi đồng Gia Huy biến mất' },
    { id: 'ev-map', code: 'EV-MAP-ORIGIN', title: 'Bản vẽ sửa nhà gốc' },
    { id: 'ev-gps-vu', code: 'EV-GPS-VU', title: 'Định vị GPS của Vũ lúc tối muộn' },
    { id: 'ev-sms-mai', code: 'EV-SMS-MAI', title: 'Tin nhắn Mai đe dọa Khang' }
  ]
}

export const evaluation000: Evaluation = {
  caseId: 'case-000',
  suspectName: 'Tùng',
  motiveTitle: 'Che giấu bí mật quá khứ',
  methodTitle: 'Xô ngã và dàn dựng hiện trường',
  radarScores: [
    { id: 'logic', name: 'Tư duy Logic', score: 100, desc: 'Tuyệt vời. Bạn đã bóc tách chính xác các động cơ và hành vi độc lập tại hiện trường.' },
    { id: 'deduction', name: 'Suy luận Phân tích', score: 100, desc: 'Xuất sắc phân biệt giữa động cơ tài sản của Mai, Vũ và động cơ sát hại thực sự của Tùng.' },
    { id: 'timeline', name: 'Phục dựng Dòng thời gian', score: 100, desc: 'Sắp xếp chuẩn xác chuỗi diễn biến phức tạp của cả 4 người có mặt tại hiện trường.' },
    { id: 'evidence', name: 'Thu thập Bằng chứng', score: 100, desc: 'Đính kèm đầy đủ các bằng chứng mâu thuẫn để chứng minh lập luận.' }
  ],
  strengths: 'Bạn đã chỉ ra Tùng mới là kẻ duy nhất có mặt vào khung giờ gây án thực sự, xâu chuỗi được bí ẩn cái chết của Gia Huy năm xưa.',
  weaknesses: 'Không có sai sót nào trong lập luận.',
  missedEvidence: 'Không bỏ sót bằng chứng quan trọng nào.',
  correctTimeline: [
    '1. Mai cãi nhau với Khang về bản di chúc giả.',
    '2. Mai âm thầm tráo di chúc gốc bằng bản sao và mang đi giám định.',
    '3. Vũ lập biên bản mô tả sai lệch hiện trạng diện tích nhà Khang để nhận chia tiền.',
    '4. Vũ đột nhập lại hiện trường vào buổi tối để tìm bản vẽ gốc nhằm tiêu hủy chứng cứ.',
    '5. Hà lén lấy đi chiếc còi đồng của Gia Huy khỏi hộp sắt tủ âm tường.',
    '6. Tùng giằng co xô ngã Khang, bỏ mặc nạn nhân và dàn dựng hiện trường giả.'
  ],
  evidenceUsage: {
    used: ['ev-will', 'ev-whistle', 'ev-map', 'ev-gps-vu', 'ev-sms-mai'],
    ignored: [],
    critical: ['ev-whistle', 'ev-will', 'ev-map']
  }
}
