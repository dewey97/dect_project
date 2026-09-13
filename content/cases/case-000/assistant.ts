import { AssistantConversation } from '@/lib/types'

export const assistant000: AssistantConversation = {
  caseId: 'case-000',
  welcomeMessage: 'Chào Thám tử, tôi là Trợ lý Pháp y Điều tra. Hệ thống đã đồng bộ toàn bộ chứng cứ vụ án 000 (Trốn Tìm).',
  initialChips: [
    { label: 'Phân tích vết thương tử thi', action: 'check_autopsy' },
    { label: 'Rà soát Chứng cứ Ngoại phạm', action: 'check_alibi' }
  ],
  timelineInfo: {
    title: 'Mốc thời gian điều tra',
    rows: [
      { label: '18:30', value: 'Nguyễn Ngọc Mai & Lê Quang Vũ đến nhà Khang đòi đất' },
      { label: '19:00', value: 'Mai rời đi về nhà (khớp tiếng xe lúc Thời sự VTV1)' },
      { label: '19:30', value: 'Vũ rời đi ra Quán Bia 88 uống đến 20:45' },
      { label: '20:00', value: 'Tùng xô ngã Khang & vỡ bình trà (ngày giỗ 30 năm)' },
      { label: '20:15', value: 'Tùng tháo chạy khỏi hiện trường về Cầu Bươu' },
      { label: '20:45', value: 'Hà lén chui vào nhà, mở khóa iPhone 8 Plus' },
      { label: '21:00', value: 'Nạn nhân bị đâm tử vong (Hung thủ: Hà)' }
    ]
  },
  recoveredMessageRef: {
    evidenceId: 'EV-HAIR-DNA',
    title: 'Lọn tóc mai dính máu trong áo ngực',
    previewText: 'Khớp 100% ADN nạn nhân Nguyễn Văn Khang'
  },
  hints: [
    { level: 1, text: 'Giám định kỹ thuật phát hiện chữ ký đồ nét tracing trên Giấy ủy quyền đất 200m² và hóa đơn Quán Bia 88 minh oan cho Mai & Vũ.' },
    { level: 2, text: 'So sánh giờ Tùng rời đi (20:15) với giờ tử vong do đứt động mạch cảnh (21:00).' },
    { level: 3, text: 'Âm thanh còi tàu 20:32 trong Voicemail và lịch VTV3 thứ Sáu (chỉ chiếu Gameshow) bóc trần toàn bộ alibi của Hà.' }
  ]
}
