import { Email } from '@/lib/types'

export const emails001: Record<string, Email[]> = {
  'dev-01': [
    {
      id: 'e1',
      sender: 'Ban Quản lý Cảng',
      subject: 'Re: Sửa đổi bản vận đơn',
      body: 'Số hiệu các container không khớp với sổ sách tại kho bãi...',
      timestamp: '18:20',
      classification: 'RESTRICTED',
      integrity: 'SECURED'
    },
    {
      id: 'e2',
      sender: 'V. Marsh',
      subject: 'Re: Yêu cầu đặt chỗ',
      body: 'Các khoang hàng trên tàu đã được phân bổ. Thanh toán đã được xác minh...',
      timestamp: '15:10',
      classification: 'CONFIDENTIAL',
      integrity: 'SECURED'
    }
  ]
}
