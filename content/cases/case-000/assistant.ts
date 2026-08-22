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
      { label: '18:30', value: 'Trần Ngọc Mai có mặt tại nhà Khang' },
      { label: '19:30', value: 'Lê Quang Vũ chui cửa sau tìm bản vẽ' },
      { label: '20:00', value: 'Tùng xô ngã Khang & vỡ bình trà' },
      { label: '20:15', value: 'Tùng tháo chạy khỏi hiện trường' },
      { label: '20:45', value: 'Hà lén chui vào nhà' },
      { label: '21:00', value: 'Nạn nhân bị đâm tử vong (Hung thủ: Hà)' }
    ]
  },
  recoveredMessageRef: {
    evidenceId: 'EV-GLASS-SHARD',
    title: 'Mảnh vỡ bình trà dính máu',
    previewText: 'Vật sắc nhọn gây ra vết đâm đứt động mạch cảnh lúc 21:00'
  },
  hints: [
    { level: 1, text: 'Soi tia UV phát hiện vết tẩy xóa hóa chất và mực bi 2024 viết đè tên Mai trên di chúc 2018.' },
    { level: 2, text: 'So sánh giờ Tùng tháo chạy (20:15) với giờ tử vong do đứt động mạch (21:00).' },
    { level: 3, text: 'Lỗi lỡ lời của Hà trong lời khai 07d mô tả chi tiết vết gục bên bình trà vỡ.' }
  ]
}
