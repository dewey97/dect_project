import { AssistantConversation } from '@/lib/types'

export const assistant000: AssistantConversation = {
  caseId: 'case-000',
  welcomeMessage: 'CHÀO ĐIỀU TRA VIÊN. Hệ thống điều phối viên Minh đã được kết nối với hồ sơ vụ án Trốn Tìm (TEST-99). Hãy giải quyết các Mục tiêu chặng bằng chứng để mở khóa thiết bị của Mai và Vũ, lần theo manh mối chiếc còi đồng để phá án.',
  initialChips: [
    { label: 'Xem mốc thời gian đã biết', action: 'root_timeline' },
    { label: 'Gợi ý phá án', action: 'root_hint1' }
  ],
  timelineInfo: {
    title: 'DÒNG THỜI GIAN // Trốn Tìm',
    rows: [
      { label: '10:00', value: 'Mai cãi nhau với Khang về việc di chúc giả.' },
      { label: '15:30', value: 'Vũ lập biên bản đo vẽ hiện trạng diện tích lấn chiếm.' },
      { label: '20:45', value: 'Vũ đột nhập vào căn nhà cũ bằng lối cửa sau.' }
    ]
  },
  recoveredMessageRef: {
    evidenceId: 'DEV-00-KHANG',
    title: 'Nhật ký tin nhắn Nguyễn Văn Khang',
    previewText: 'Tối nay gặp tao ở căn nhà cũ để ký giấy.'
  },
  hints: [
    { level: 1, text: 'Hãy kiểm tra mâu thuẫn di chúc trong điện thoại của Mai sau khi trả lời Mục tiêu 1.' },
    { level: 2, text: 'Lê Quang Vũ quay lại tìm bản vẽ gốc, nhưng hung thủ xô ngã Khang và dàn dựng hiện trường lại liên quan đến bí mật Gia Huy.' },
    { level: 3, text: 'Hà lấy chiếc còi để phi tang chứng cứ, nhưng Tùng mới là kẻ giằng co làm Khang ngã rồi tạo hiện trường giả.' }
  ]
}
