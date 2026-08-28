import { Suspect } from '@/lib/types'

export const suspects000: Suspect[] = [
  {
    id: 'mai',
    caseId: 'case-000',
    name: 'Trần Ngọc Mai',
    role: 'Em họ nạn nhân',
    background: 'Tranh chấp di chúc đền bù nhà đất với Khang. Khai sang nhà Khang lúc 18:30 rồi rời đi lúc 19:00.',
    alibi: 'Khai ở nhà một mình từ 19:30 xem tivi (Không có bằng chứng/người làm chứng).',
    collected: true
  },
  {
    id: 'vu',
    caseId: 'case-000',
    name: 'Lê Quang Vũ',
    role: 'Chồng Mai / Nhân viên đo đạc',
    background: 'Nợ Khang 350 triệu đồng và bị Khang ép đo khống đất đai. Khai đi nhậu một mình sau khi rời nhà Khang.',
    alibi: 'Khai ngồi uống bia một mình ở quán nhậu từ 19:40 đến 21:30 (Không có người làm chứng).',
    collected: true
  },
  {
    id: 'tung',
    caseId: 'case-000',
    name: 'Nguyễn Thanh Tùng',
    role: 'Bạn cũ có hiềm khích',
    background: 'Ban đầu đưa vé xe khách 19:30 để chối tội. Khi bị vạch trần thì lúng túng thừa nhận có đến nhà Khang lúc 20:00 nhưng chối không xô đập hay hại Khang.',
    alibi: 'Trưng vé xe khách liên tỉnh khởi hành lúc 19:30 (Bằng chứng ngoại phạm giả).',
    collected: true
  },
  {
    id: 'ha',
    caseId: 'case-000',
    name: 'Trần Thị Hà',
    role: 'Bạn gái hiện tại của Khang',
    background: 'Bạn gái hiện tại (yêu 3 năm). Tỏ ra êm ấm, cung cấp danh sách mâu thuẫn gồm Tùng (lảng vảng) cùng các nghi vấn nhiễu chú Hùng & Nam Còi.',
    alibi: 'Khai ở nhà xem tivi một mình cả tối 24/07.',
    collected: true
  }
]
