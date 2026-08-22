import { Suspect } from '@/lib/types'

export const suspects000: Suspect[] = [
  {
    id: 'mai',
    caseId: 'case-000',
    name: 'Trần Ngọc Mai',
    role: 'Em họ nạn nhân',
    background: 'Có tranh chấp thừa kế di chúc với Khang. Phát hiện di chúc bị sửa chữa.',
    alibi: 'Làm việc tại Văn phòng Luật sư Minh từ 19:30 đến 20:30.',
    collected: true
  },
  {
    id: 'vu',
    caseId: 'case-000',
    name: 'Lê Quang Vũ',
    role: 'Chồng Mai / Nhân viên đo đạc',
    background: 'Nợ Khang 350 triệu đồng và bị Khang ép đo khống diện tích đất.',
    alibi: 'Có mặt tại quán nhậu từ 19:40 đến 22:00.',
    collected: true
  },
  {
    id: 'tung',
    caseId: 'case-000',
    name: 'Nguyễn Thanh Tùng',
    role: 'Bạn cũ / Anh trai Gia Huy',
    background: 'Bị Khang tống tiền liên quan đến bi kịch trốn tìm năm 1998 khiến Gia Huy qua đời.',
    alibi: 'Đến cãi vã xô ngã Khang lúc 20:00 nhưng bỏ chạy lúc 20:15.',
    collected: true
  },
  {
    id: 'ha',
    caseId: 'case-000',
    name: 'Trần Thị Hà',
    role: 'Bạn gái cũ của Khang (Thủ phạm)',
    background: 'Ghen tuông cuồng loạn. Theo dõi Khang và chui qua cửa sau lúc 20:45.',
    alibi: 'Khai ở nhà cả tối nhưng lỡ lời mô tả chi tiết vết ngục bên bộ bình trà vỡ.',
    collected: true
  }
]
