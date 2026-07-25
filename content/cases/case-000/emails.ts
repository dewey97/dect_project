import { Email } from '@/lib/types'

export const emails000: Record<string, Email[]> = {
  'dev-00': [
    {
      id: 'e1',
      sender: 'Ban Bồi Thường Giải Tỏa',
      subject: 'Thông báo phương án đền bù diện tích mở rộng',
      body: 'Kính gửi ông Nguyễn Văn Khang, chúng tôi đã ghi nhận hồ sơ hiện trạng sử dụng đất ổn định do cán bộ Lê Quang Vũ nộp lên. Theo phương án này, diện tích đất tính đền bù được mở rộng thêm 45m2 phía sau căn nhà...',
      timestamp: '11:20',
      classification: 'CONFIDENTIAL',
      integrity: 'SECURED'
    }
  ],
  'dev-02': [
    {
      id: 'e2',
      sender: 'Luật sư Minh',
      subject: 'Tư vấn tranh chấp di chúc thừa kế',
      body: 'Chào Mai, tôi đã xem qua bản sao di chúc Khang gửi. Đúng như cô nghi ngờ, điều khoản mô tả số thửa đất lại dùng danh pháp địa chính khóa mới (chỉ áp dụng từ năm 2021), trong khi ngày ký di chúc lại là năm 2018. Đây là bằng chứng thép để chứng minh di chúc bị làm giả hoặc chỉnh sửa sau này.',
      timestamp: '14:15',
      classification: 'CONFIDENTIAL',
      integrity: 'SECURED'
    }
  ],
  'dev-03': []
}
