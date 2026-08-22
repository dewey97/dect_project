import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-01',
      name: 'Tình nhân mới (N.T.M)',
      timestamp: '20:40',
      previewText: 'Em chuẩn bị xong rồi, tối nay anh qua đón đi du lịch nhé...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1',
          sender: 'N.T.M',
          role: 'received',
          text: 'Em chuẩn bị xong hết hành lý rồi, tối nay anh qua đón em rủ đi du lịch như đã hứa nhé!',
          timestamp: '20:40'
        }
      ]
    },
    {
      id: 'conv-02',
      name: 'Trần Thị Hà',
      timestamp: '19:15',
      previewText: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm2',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà đấy!',
          timestamp: '19:15'
        }
      ]
    }
  ]
}
