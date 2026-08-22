import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Giai đoạn 0: Màn Sương Hiện Trường & Biên Bản Tử Thi',
    question: 'Dựa trên báo cáo khám nghiệm tử thi sơ bộ (01) và hiện trường (02), hãy xác định 2 vùng tổn thương chính trên thi thể Khang và danh sách 4 đối tượng nghi vấn?',
    hint: 'Báo cáo khám nghiệm tử thi ghi nhận vết bầm chẩm gáy 6x4cm và vết đâm 3.5cm đứt động mạch cảnh.',
    options: [
      '2 tổn thương (bầm ngắt chẩm gáy & đứt động mạch cảnh) + 4 nghi phạm (Mai, Vũ, Tùng, Hà)',
      '2 tổn thương (rạn xương sọ chẩm & đâm thủng vòm họng) + 4 nghi phạm (Mai, Vũ, Tùng, Hà)',
      '2 tổn thương (gãy xương sườn & đứt động mạch cảnh) + 4 nghi phạm (Mai, Vũ, Tùng, Hà)',
      '2 tổn thương (vết bầm ở vùng ngực & chấn thương sọ nội) + 4 nghi phạm (Mai, Vũ, Tùng, Hà)'
    ],
    correctAnswer: '2 tổn thương (bầm ngắt chẩm gáy & đứt động mạch cảnh) + 4 nghi phạm (Mai, Vũ, Tùng, Hà)',
    unlockedEvidenceId: 'f2-1',
    status: 'active'
  },
  {
    id: 'cp-000-1',
    caseId: 'case-000',
    title: 'Giai đoạn 1: Tờ Di Chúc Tẩy Xóa & Vết Mực Bi 2024',
    question: 'Kết quả giám định (09) phát hiện chi tiết kỹ thuật nào chứng minh di chúc (08) bị Khang sửa đổi, đồng thời minh oan cho Mai và Vũ?',
    hint: 'Đọc Kết quả giám định 09 để xem phân tích vết tẩy xóa hóa chất tên Mai và mực bi dầu 2024 viết đè.',
    options: [
      'Vết tẩy hóa chất tên Mai + Mực bi dầu 2024 viết đè. Mai & Vũ có chứng cứ ngoại phạm khung giờ 19:30-20:30.',
      'Dấu vân tay miết của Khang trên di chúc. Mai & Vũ không có mặt tại hiện trường trước 21:00.',
      'Chữ ký ông nội bị giả mạo bằng máy in scanner. Mai & Vũ đã ký biên bản từ bỏ quyền thừa kế.',
      'Tráo đổi toàn bộ tờ di chúc 2018 bằng bản 2024. Mai & Vũ bị Khang khóa cửa nhốt ở ngoài.'
    ],
    correctAnswer: 'Vết tẩy hóa chất tên Mai + Mực bi dầu 2024 viết đè. Mai & Vũ có chứng cứ ngoại phạm khung giờ 19:30-20:30.',
    unlockedEvidenceId: 'f3-1',
    status: 'locked'
  },
  {
    id: 'cp-000-2',
    caseId: 'case-000',
    title: 'Giai đoạn 2: Tiếng Xô Xát Đêm 24/07 & Kỷ Vật Tủ Âm Tường',
    question: 'Diễn biến xô xát giữa Tùng và Khang lúc 20:00 gây ra tổn thương nào, và tại sao Tùng không phải là hung thủ gây ra cái chết trực tiếp?',
    hint: 'Tùng thừa nhận xô ngã Khang ngất xỉu và làm vỡ bình trà lúc 20:00, tháo chạy lúc 20:15. Hãy kiểm tra xem vết bầm gáy có gây tử vong đứt động mạch không.',
    options: [
      'Tùng làm vỡ bình trà & xô Khang đập đầu ngất xỉu lúc 20:00 (chỉ gây vết bầm gáy, Khang chưa tử vong khi Tùng bỏ chạy 20:15).',
      'Tùng xô Khang ngã đập đầu vào bộ bình trà vỡ khiến mảnh thủy tinh đâm đứt động mạch cảnh ngay tại chỗ lúc 20:00.',
      'Tùng vật lộn siết cổ Khang ngất xỉu rồi dùng kéo đâm vào cổ nạn nhân trước khi hoảng hốt tháo chạy lúc 20:15.',
      'Tùng đến hiện trường lúc 20:00 nhưng không xảy ra xô xát, Khang đã tử vong từ trước khi Tùng bước vào nhà.'
    ],
    correctAnswer: 'Tùng làm vỡ bình trà & xô Khang đập đầu ngất xỉu lúc 20:00 (chỉ gây vết bầm gáy, Khang chưa tử vong khi Tùng bỏ chạy 20:15).',
    unlockedEvidenceId: 'f4-1',
    status: 'locked'
  },
  {
    id: 'cp-000-3',
    caseId: 'case-000',
    title: 'Giai đoạn 3: Phán Quyết Cuối Cùng & Động Cơ Cuồng Sở Hữu',
    question: 'Ai là hung thủ thực sự gây ra vết đâm đứt động mạch cảnh lúc 21:00, và bằng chứng then chốt nào lật tẩy lời khai giả mạo của đối tượng này?',
    hint: 'Hung thủ khai ở nhà cả tối nhưng lại lỡ lời mô tả chi tiết Khang nằm gục bên bộ bình trà vỡ (chỉ bị vỡ lúc 20:00 bởi Tùng). Báo cáo pháp y xác nhận tử vong muộn lúc 21:00.',
    options: [
      'Hung thủ: Trần Thị Hà. Báo cáo 12 (Tử vong 21:00 khi đang ngất) & Lời khai lỡ lời mô tả bộ bình trà vỡ lúc 20:00.',
      'Hung thủ: Nguyễn Thanh Tùng. Báo cáo 11 (Vết máu trên áo) & Khung ảnh gỗ bị đập vỡ năm 1998.',
      'Hung thủ: Lê Quang Vũ. Bằng chứng 10 (Giấy nợ 350M) & Dấu giày size 41 chui qua cửa sau.',
      'Hung thủ: Trần Ngọc Mai. Bằng chứng 08 (Tờ di chúc giả) & Dấu vân tay trên hộp sắt kỷ vật.'
    ],
    correctAnswer: 'Hung thủ: Trần Thị Hà. Báo cáo 12 (Tử vong 21:00 khi đang ngất) & Lời khai lỡ lời mô tả bộ bình trà vỡ lúc 20:00.',
    unlockedEvidenceId: 'rewards-000',
    status: 'locked'
  }
]
