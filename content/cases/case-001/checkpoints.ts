import { Checkpoint } from '@/lib/types'

export const checkpoints001: Checkpoint[] = [
  {
    id: 'cp-001-1',
    caseId: 'case-001',
    title: 'Người hẹn gặp Thomas',
    question: 'Ai là người nhắn tin yêu cầu Thomas Vance đến Cầu cảng số 9 mà không mang điện thoại?',
    hint: 'Hãy mở phân vùng tin nhắn đã được khôi phục từ Nokia Burner Phone của Thomas.',
    options: [
      'Quản Đốc (The Foreman)',
      'V. Marsh',
      'Người Thuê Ẩn Danh'
    ],
    correctAnswer: 'Quản Đốc (The Foreman)',
    unlockedEvidenceId: 'dev-02', // Mở khóa laptop của V. Marsh
    status: 'active'
  },
  {
    id: 'cp-001-2',
    caseId: 'case-001',
    title: 'Sai lệch số sách vận đơn',
    question: 'Bằng chứng nào cho thấy có sự sửa đổi bản vận đơn hải quan trái phép của V. Marsh?',
    hint: 'Hãy phân tích email và tệp tin trên máy tính của V. Marsh sau khi đã mở khóa.',
    options: [
      'Email "Re: Sửa đổi bản vận đơn"',
      'Email "Re: Yêu cầu đặt chỗ"',
      'File nhật ký cảng'
    ],
    correctAnswer: 'Email "Re: Sửa đổi bản vận đơn"',
    unlockedEvidenceId: 'dev-03', // Mở khóa máy ghi âm
    status: 'locked'
  }
]
