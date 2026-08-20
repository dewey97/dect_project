import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-1',
    caseId: 'case-000',
    title: 'Hành động của Trần Ngọc Mai',
    question: 'Trần Ngọc Mai đã làm gì với bản di chúc gốc giấu trong tủ âm tường?',
    hint: 'Mở rộng thông tin nghi phạm Trần Ngọc Mai để kiểm tra hành vi của cô ấy.',
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
    title: 'Sự thật về cuộc xô xát của Tùng',
    question: 'Tùng đã gây ra điều gì khi chạm trán Khang tại căn nhà lúc 20:00?',
    hint: 'Kiểm tra báo cáo vết thương bầm tím và mảnh vỡ bình trà thủy tinh.',
    options: [
      'Làm vỡ bộ bình trà, xô Khang ngất xỉu rồi hoảng sợ bỏ đi lúc 20:15',
      'Dùng mảnh thủy tinh đâm chết Khang tại chỗ',
      'Lấy trộm tiền đền bù rồi trốn đi'
    ],
    correctAnswer: 'Làm vỡ bộ bình trà, xô Khang ngất xỉu rồi hoảng sợ bỏ đi lúc 20:15',
    unlockedEvidenceId: 'dev-03', // Mở khóa chứng cứ giai đoạn 3
    status: 'locked'
  },
  {
    id: 'cp-000-3',
    caseId: 'case-000',
    title: 'Sự lỡ lời lật tẩy Hung thủ thật sự',
    question: 'Chi tiết lỡ lời nào trong lời khai ban đầu chứng minh Hà mới là kẻ đâm chết Khang?',
    hint: 'Đối chiếu lời khai khẳng định ở nhà cả tối của Hà với chi tiết hiện trường sau khi Tùng làm vỡ bình trà.',
    options: [
      'Hà mô tả Khang gục ngã cạnh bộ bình trà vỡ (dù khai ở nhà cả tối)',
      'Hà khai nhìn thấy Tùng mang theo dao nhọn',
      'Hà thừa nhận đã tranh chấp di chúc với Mai'
    ],
    correctAnswer: 'Hà mô tả Khang gục ngã cạnh bộ bình trà vỡ (dù khai ở nhà cả tối)',
    unlockedEvidenceId: 'conclusion', // Mở khóa nộp báo cáo kết án
    status: 'locked'
  }
]
