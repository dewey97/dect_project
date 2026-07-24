import { Conversation } from '@/lib/types'

export const conversations001: Record<string, Conversation[]> = {
  'dev-01': [
    {
      id: 'foreman',
      name: 'Quản Đốc (The Foreman)',
      timestamp: '23:41',
      previewText: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.',
      recoveryProgress: 98,
      unread: true,
      messages: [
        { id: 'm1', sender: 'Quản Đốc', role: 'received', text: 'Cậu đã sẵn sàng cho chuyến hàng cập bến chưa? Cầu cảng số 9 đang rất yên tĩnh.', timestamp: '23:40' },
        { id: 'm2', sender: 'DETECTIVE', role: 'sent', text: 'Đang đến đó đây. Đã lấy chìa khóa tủ đồ.', timestamp: '23:41' },
        { id: 'm3', sender: 'Quản Đốc', role: 'received', text: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.', timestamp: '23:41' },
      ]
    },
    {
      id: 'unknown',
      name: 'Nghi phạm Ẩn danh',
      timestamp: '22:15',
      previewText: '█████ [PHÂN VÙNG HỎNG]',
      recoveryProgress: 82,
      unread: false,
      messages: [
        { id: 'm4', sender: 'Nghi phạm Ẩn danh', role: 'received', text: 'Cần sửa đổi bản vận đơn lô hàng này trước khi hải quan kiểm toán.', timestamp: '22:12' },
        { id: 'm5', sender: 'Nghi phạm Ẩn danh', role: 'corrupted', text: '████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████', timestamp: '22:15' },
      ]
    }
  ]
}
