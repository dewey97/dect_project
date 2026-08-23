import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-01',
      name: 'Trần Ngọc Mai (Em họ)',
      timestamp: '18:50',
      previewText: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1-1',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Anh Khang, chuyện tờ di chúc của ông nội tại sao anh lại tự ý lấy về cất giữ? Phần tiền đền bù nhà đất bờ sông anh định nuốt riêng à?',
          timestamp: '18:35'
        },
        {
          id: 'm1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Bản di chúc ông để lại cho ai người đó giữ. Cô đừng có xía vào.',
          timestamp: '18:38'
        },
        {
          id: 'm1-3',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Anh đừng có coi thường vợ chồng tôi. Giấy tờ đất đứng tên ông nội chứ không phải tên một mình anh!',
          timestamp: '18:42'
        },
        {
          id: 'm1-4',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Tối nay tôi với anh Vũ sẽ qua nhà anh nói chuyện cho rõ ràng chuyện di chúc và mảnh đất bến sông. Anh đừng có giấu!',
          timestamp: '18:45'
        },
        {
          id: 'm1-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
          timestamp: '18:50'
        }
      ]
    },
    {
      id: 'conv-02',
      name: 'Lê Quang Vũ',
      timestamp: '19:05',
      previewText: 'Anh Khang, khoản nợ 350tr với chuyện số liệu đo đạc...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm2-1',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, chiều nay bên công ty đo đạc giục nộp hồ sơ giải tỏa đền bù rồi. Anh trả lại bản vẽ chuẩn cho tôi.',
          timestamp: '18:55'
        },
        {
          id: 'm2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Cứ báo số liệu khống như tôi bảo đi. Chú mày còn thiếu nợ tôi 350 triệu đấy, quên rồi à?',
          timestamp: '18:58'
        },
        {
          id: 'm2-3',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Tôi làm vậy là vi phạm pháp luật! Anh ép tôi quá đáng vừa thôi!',
          timestamp: '19:02'
        },
        {
          id: 'm2-4',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, khoản nợ 350tr với chuyện số liệu đo đạc bớt ép tôi đi. Tối nay vợ chồng tôi sang chốt hạ!',
          timestamp: '19:05'
        }
      ]
    },
    {
      id: 'conv-03',
      name: 'Trần Thị Hà',
      timestamp: '19:15',
      previewText: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm3-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh Khang ơi, tối nay anh có rảnh không? Mấy hôm nay anh bận việc gì mà gọi điện nghe máy ngập ngừng thế?',
          timestamp: '19:00'
        },
        {
          id: 'm3-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tối nay anh có việc bận giải quyết chuyện nhà đất với người ta, em ở nhà đi đừng sang.',
          timestamp: '19:08'
        },
        {
          id: 'm3-3',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà đấy!',
          timestamp: '19:15'
        }
      ]
    }
  ]
}
