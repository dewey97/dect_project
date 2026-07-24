import { AssistantConversation } from '@/lib/types'

export const assistant001: AssistantConversation = {
  caseId: 'case-001',
  welcomeMessage: 'THÁM TỬ. Đường truyền an toàn đã được thiết lập. Tôi đã phân tích nhật ký bằng chứng thu thập được cho Hồ sơ vụ án NX-4471 (Ánh Sáng Cảng Biển). Chọn một giao thức hành động bên dưới để định hướng cuộc điều tra của chúng ta.',
  initialChips: [
    { label: 'Phục dựng dòng thời gian nạn nhân', action: 'root_timeline' },
    { label: 'Xem tin nhắn trích xuất', action: 'root_messages' },
    { label: 'Yêu cầu gợi ý thám tử', action: 'root_hint1' },
    { label: 'Xem kho lưu trữ Trace', action: 'root_trace' }
  ],
  timelineInfo: {
    title: 'DÒNG THỜI GIAN // Vụ mất tích tại Cảng',
    rows: [
      { label: '23:14', value: 'Điện thoại phụ (Burner) hoạt động (Ghi nhận thu giữ)' },
      { label: '23:40', value: 'Tin nhắn đến: "Cậu đã sẵn sàng chưa?"' },
      { label: '23:41', value: 'Tin nhắn đến: "gặp tôi lúc 9 giờ. đừng mang điện thoại."' },
      { label: '23:58', value: 'Ghi âm giọng nói: Thảo luận lầm bầm gần Cầu cảng 9' },
      { label: '00:02', value: 'Định vị GPS: Kho bãi 12 (Phân khu phía Bắc)' }
    ]
  },
  recoveredMessageRef: {
    evidenceId: 'EV-0104',
    title: 'Luồng chat: "lô hàng"',
    previewText: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.'
  },
  hints: [
    { level: 1, text: 'Điện thoại phụ của nạn nhân đã hoạt động gần Cầu cảng số 9 ngay trước nửa đêm. Hãy phân tích nhật ký định vị GPS để tìm các tọa độ tương ứng.' },
    { level: 2, text: 'Hồ sơ định vị GPS đặt nạn nhân tại Kho bãi 12 lúc 00:02. Hãy so sánh mốc thời gian này với các tin nhắn trên điện thoại phụ và tìm kiếm dấu hiệu truy cập trái phép.' },
    { level: 3, text: 'Điện thoại phụ nhận được tin nhắn lúc 23:41 yêu cầu nạn nhân "gặp tôi lúc 9 giờ". Người gửi là "Quản Đốc (The Foreman)". Hãy kiểm tra sổ sách bến cảng xem có chữ ký của quản đốc để xác minh các giao dịch bàn giao hàng hóa.' }
  ]
}
