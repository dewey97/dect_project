import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Giai đoạn 0: Màn Sương Hiện Trường & Biên Bản Tử Thi',
    question: 'Dựa trên việc đối chiếu Biên bản hiện trường (02), Lời khai hàng xóm (06) và Trích xuất tin nhắn (08), nhận định nào phản ánh chính xác nhất diễn biến bất thường lúc ~20:00 và kế hoạch triệu tập ban đầu?',
    hint: 'Hãy đối chiếu mốc giờ hàng xóm nghe tiếng vỡ xoảng đồ sứ/thủy tinh với dấu vết hiện trường phòng khách và ma trận mâu thuẫn nghi phạm.',
    options: [
      'Hiện trường xảy ra xô xát giằng co làm đập vỡ bộ bình trà lúc ~20:00 gây chấn thương chẩm gáy; cần triệu tập nhóm nghi phạm có mâu thuẫn gay gắt gồm Mai, Vũ, Tùng và Hà.',
      'Hiện trường chỉ là một vụ đột nhập lén lút lúc 19:30 không có xô xát; nạn nhân tự làm vỡ bình trà và chỉ cần triệu tập duy nhất nghi phạm Lê Quang Vũ.',
      'Nạn nhân bị đâm chết tại chỗ ngay từ 18:30 khi cãi vã với Mai; hàng xóm nghe nhầm tiếng động và chỉ cần triệu tập Trần Ngọc Mai.',
      'Vụ xô xát làm vỡ bình trà xảy ra lúc nửa đêm 24:00; nạn nhân bị gài bẫy và cần triệu tập tất cả hàng xóm xung quanh.'
    ],
    correctAnswer: 'Hiện trường xảy ra xô xát giằng co làm đập vỡ bộ bình trà lúc ~20:00 gây chấn thương chẩm gáy; cần triệu tập nhóm nghi phạm có mâu thuẫn gay gắt gồm Mai, Vũ, Tùng và Hà.',
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
    title: 'Giai đoạn 2: Kỷ Vật Quá Khứ & Tiếng Xô Xát Đêm 24/07',
    question: 'Dựa trên bài báo cũ năm 1998 và các kỷ vật tại hiện trường, động cơ thù hận sâu sắc nào đã thúc đẩy Nguyễn Thanh Tùng đến tìm nạn nhân đêm 24/07?',
    hint: 'Đối chiếu bức ảnh 2 anh em (đeo còi đồng) ở đống giấy tờ văng vãi p2 với bài báo 1998 và ảnh gia đình p4 để làm rõ bi kịch quá khứ giữa Tùng và Khang.',
    options: [
      'Khang gài chốt nhốt em trai Tùng (bé Gia Huy) ngạt chết trong tủ gỗ năm 1998; Tùng mang kỷ vật đến đối chất đêm 24/07 và xảy ra giằng co xô xát.',
      'Tùng nợ Khang khoản tiền bốc họ 350M từ năm 1998 và đến để xin khất nợ.',
      'Tùng tranh chấp mảnh đất 75m2 đền bù của cụ Thành và muốn ép Khang chia phần.',
      'Tùng đến để làm chứng cho cuộc cãi vã giữa Mai và Khang về tờ di chúc 2018.'
    ],
    correctAnswer: 'Khang gài chốt nhốt em trai Tùng (bé Gia Huy) ngạt chết trong tủ gỗ năm 1998; Tùng mang kỷ vật đến đối chất đêm 24/07 và xảy ra giằng co xô xát.',
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
