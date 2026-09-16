import { AssistantConversation } from '@/lib/types'

export const assistant001: AssistantConversation = {
  caseId: 'case-01',
  welcomeMessage: 'Chào Thám tử, hệ thống đã nạp xong hồ sơ vụ án Ánh Sáng Cảng Biển.',
  initialChips: [
    { label: 'Kiểm tra vận đơn container', action: 'check_manifest' }
  ],
  timelineInfo: {
    title: 'Mốc thời gian điều tra',
    rows: [
      { label: '23:41', value: 'Tin nhắn bí ẩn gửi đến điện thoại phụ' }
    ]
  },
  recoveredMessageRef: {
    evidenceId: 'EV-0104',
    title: 'Luồng chat lô hàng',
    previewText: 'Gặp tôi lúc 9 giờ...'
  },
  hints: [
    { level: 1, text: 'Tra cứu số hiệu container trong sổ sách kế toán.' }
  ]
}
