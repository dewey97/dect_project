import { Checkpoint } from '@/lib/types'

export const checkpoints001: Checkpoint[] = [
  {
    id: 'cp-001-0',
    caseId: 'case-01',
    title: 'Giai đoạn 1: Màn đêm Cầu cảng số 9',
    question: 'Nạn nhân Thomas Vance liên lạc với ai vào lúc 23:41?',
    hint: 'Kiểm tra nhật ký tin nhắn thu hồi từ chiếc điện thoại phụ DEV-0144.',
    options: [
      'Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.',
      'Gửi tin nhắn cho cảnh sát đường sông.',
      'Không gửi cho ai.'
    ],
    correctAnswer: 'Gửi tin nhắn cho đối tượng liên lạc mờ ám hẹn gặp lúc 9 giờ.',
    unlockedEvidenceId: 'dev-02',
    status: 'active'
  }
]
