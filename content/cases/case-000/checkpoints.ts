import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Giai đoạn 0: Khoanh vùng Rộng & Ma trận 04 Nghi phạm',
    question: 'Dựa trên báo cáo tử thi và hiện trường sơ bộ, hãy xác định 2 tổn thương trên thi thể nạn nhân Khang và danh sách nghi phạm?',
    hint: 'Báo cáo khám nghiệm tử thi ghi nhận vết bầm chẩm gáy 6x4cm và vết đâm 3.5cm đứt động mạch cảnh.',
    options: [
      '2 tổn thương (bầm gáy ngất tạm thời & đứt động mạch cảnh) + 4 đối tượng (Mai, Vũ, Tùng, Hà)',
      '1 tổn thương duy nhất do chấn thương sọ nội + 2 đối tượng (Mai, Vũ)',
      '2 tổn thương do ngạt khí + 3 đối tượng (Vũ, Tùng, Hà)',
      '3 tổn thương do ngộ độc chất hóa học + 4 đối tượng nghi vấn'
    ],
    correctAnswer: '2 tổn thương (bầm gáy ngất tạm thời & đứt động mạch cảnh) + 4 đối tượng (Mai, Vũ, Tùng, Hà)',
    unlockedEvidenceId: 'f2-1',
    status: 'active'
  },
  {
    id: 'cp-000-1',
    caseId: 'case-000',
    title: 'Giai đoạn 1: Bóc tách Tranh chấp Di chúc & Đất đai',
    question: 'Dấu vết tẩy xóa nào trên tờ di chúc (08) chứng minh di chúc bị làm giả và giải thích lý do Mai cùng Vũ không phải hung thủ?',
    hint: 'Đọc Kết quả giám định 09 để xem phân tích vết tẩy xóa hóa chất tên Mai và mực bi dầu 2024 viết đè.',
    options: [
      'Vết tẩy xóa hóa chất tên Mai + Mực bi hóa dầu 2024 viết đè. Mai có chứng cứ ngoại phạm tại VP luật sư (19:30-20:30), Vũ có chứng cứ ngoại phạm nhậu từ 19:40.',
      'Di chúc bị mờ chữ và đứt nét. Mai và Vũ đều có chứng cứ ngoại phạm ở nước ngoài.',
      'Di chúc viết bằng mực xanh. Mai không có ở hiện trường còn Vũ bị ốm.',
      'Di chúc không có chữ ký. Mai và Vũ đã thỏa thuận chia đều tài sản.'
    ],
    correctAnswer: 'Vết tẩy xóa hóa chất tên Mai + Mực bi hóa dầu 2024 viết đè. Mai có chứng cứ ngoại phạm tại VP luật sư (19:30-20:30), Vũ có chứng cứ ngoại phạm nhậu từ 19:40.',
    unlockedEvidenceId: 'f3-1',
    status: 'locked'
  },
  {
    id: 'cp-000-2',
    caseId: 'case-000',
    title: 'Giai đoạn 2: Bẫy Red Herring Quá khứ Trốn Tìm',
    question: 'Bi kịch năm 1998 là gì và hành vi xô xát của Tùng lúc 20:00 tại hiện trường có gây ra cái chết trực tiếp cho nạn nhân không?',
    hint: 'Tùng thừa nhận xô ngã Khang ngất xỉu và làm vỡ bình trà lúc 20:00, tháo chạy lúc 20:15. Hãy kiểm tra xem vết bầm gáy có gây tử vong đứt động mạch không.',
    options: [
      'Năm 1998 Gia Huy ngạt chết trong tủ gỗ. Tùng xô Khang ngất xỉu & vỡ bình trà lúc 20:00 rồi tháo chạy lúc 20:15 (Không gây tử vong trực tiếp).',
      'Năm 1998 Khang bị tai nạn giao thông. Tùng xô ngã đâm chết Khang tại chỗ.',
      'Năm 1998 Tùng bị Khang đánh đuổi. Tùng đâm chết Khang lúc 20:00.',
      'Năm 1998 nhà cửa bị cháy. Tùng không đến hiện trường lúc 20:00.'
    ],
    correctAnswer: 'Năm 1998 Gia Huy ngạt chết trong tủ gỗ. Tùng xô Khang ngất xỉu & vỡ bình trà lúc 20:00 rồi tháo chạy lúc 20:15 (Không gây tử vong trực tiếp).',
    unlockedEvidenceId: 'f4-1',
    status: 'locked'
  },
  {
    id: 'cp-000-3',
    caseId: 'case-000',
    title: 'Giai đoạn 3: Phán quyết Eureka Lật tẩy Hung thủ Thực sự',
    question: 'Ai là hung thủ thực sự đâm chết nạn nhân Khang lúc 21:00 và cặp bằng chứng nào lật tẩy lời khai giả mạo của đối tượng này?',
    hint: 'Hung thủ khai ở nhà cả tối nhưng lại lỡ lời mô tả chi tiết Khang nằm gục bên bộ bình trà vỡ (chỉ bị vỡ lúc 20:00 bởi Tùng). Báo cáo pháp y xác nhận tử vong muộn lúc 21:00.',
    options: [
      'Hung thủ: Trần Thị Hà (ha). Bằng chứng 12 (Giờ tử vong 21:00) & Bằng chứng 07d (Hà lỡ lời mô tả bình trà vỡ).',
      'Hung thủ: Nguyễn Thanh Tùng. Bằng chứng 11 & Bằng chứng 07c.',
      'Hung thủ: Lê Quang Vũ. Bằng chứng 10 & Bằng chứng 07b.',
      'Hung thủ: Trần Ngọc Mai. Bằng chứng 08 & Bằng chứng 07a.'
    ],
    correctAnswer: 'Hung thủ: Trần Thị Hà (ha). Bằng chứng 12 (Giờ tử vong 21:00) & Bằng chứng 07d (Hà lỡ lời mô tả bình trà vỡ).',
    unlockedEvidenceId: 'rewards-000',
    status: 'locked'
  }
]
