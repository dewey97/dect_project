import { Conversation } from '@/lib/types'

export const conversations001: Record<string, Conversation[]> = {
  'dev-01': [
    {
      id: 'c-01',
      name: 'Liên lạc bí ẩn',
      timestamp: '23:41',
      previewText: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1',
          sender: 'Bí ẩn',
          role: 'received',
          text: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.',
          timestamp: '23:41'
        }
      ]
    }
  ]
}
