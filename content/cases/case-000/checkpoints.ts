import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-1',
    caseId: 'case-000',
    title: 'Hành động của Trần Ngọc Mai',
    question: 'Trần Ngọc Mai đã làm gì với bản di chúc gốc được giấu trong hộp sắt tủ âm tường?',
    hint: 'Hãy mở rộng thông tin nghi phạm Trần Ngọc Mai trong danh sách nghi phạm để xem bí mật riêng của cô ấy.',
    options: [
      'Lấy bản gốc đi giám định và tráo bản sao',
      'Đốt bản di chúc gốc',
      'Ký tên đồng thuận ủy quyền nhận đền bù'
    ],
    correctAnswer: 'Lấy bản gốc đi giám định và tráo bản sao',
    unlockedEvidenceId: 'dev-02', // Mở khóa điện thoại của Mai
    status: 'active'
  },
  {
    id: 'cp-000-2',
    caseId: 'case-000',
    title: 'Mục đích đột nhập của Lê Quang Vũ',
    question: 'Lê Quang Vũ quay lại căn nhà cũ vào buổi tối nhằm mục đích gì?',
    hint: 'Hãy đọc tin nhắn của Lê Quang Vũ gửi cho Vợ trong điện thoại của Vũ sau khi mở khóa.',
    options: [
      'Tìm bản vẽ gốc để tiêu hủy chứng cứ sai phạm',
      'Lấy trộm tiền mặt trong tủ âm tường',
      'Thuyết phục Khang chia thêm tiền đền bù'
    ],
    correctAnswer: 'Tìm bản vẽ gốc để tiêu hủy chứng cứ sai phạm',
    unlockedEvidenceId: 'dev-03', // Mở khóa điện thoại của Vũ
    status: 'locked'
  },
  {
    id: 'cp-000-3',
    caseId: 'case-000',
    title: 'Vật chứng Gia Huy biến mất',
    question: 'Hà đã đột nhập hiện trường để lấy đi thứ gì nhằm che giấu bí mật về cái chết của Gia Huy năm xưa?',
    hint: 'Hãy đọc thông tin nghi phạm của Hà để tìm hiểu về hành vi lấy vật chứng.',
    options: [
      'Chiếc còi đồng của Gia Huy',
      'Bản di chúc viết tay của ông nội',
      'Bản vẽ sửa nhà gốc của Khang'
    ],
    correctAnswer: 'Chiếc còi đồng của Gia Huy',
    unlockedEvidenceId: 'conclusion', // Mở khóa nút nộp báo cáo kết án
    status: 'locked'
  }
]
