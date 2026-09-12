import { Checkpoint } from '@/lib/types'

export const checkpoints000: Checkpoint[] = [
  {
    id: 'cp-000-0',
    caseId: 'case-000',
    title: 'Giai đoạn 0: Màn Sương Hiện Trường & Biên Bản Tử Thi',
    question: 'Dựa trên việc đối chiếu Biên bản khám nghiệm hiện trường (05), Biên bản tử thi (04) và Lời khai ban đầu, nhận định nào phản ánh chính xác nhất diễn biến bất thường lúc ~20:00 và kế hoạch điều tra ban đầu?',
    hint: 'Hãy đối chiếu mốc giờ hàng xóm nghe tiếng vỡ xoảng bình trà lúc ~20:00 với vết chấn thương chẩm gáy của nạn nhân và ma trận mâu thuẫn 4 nghi phạm.',
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
    title: 'Giai đoạn 1: Giả Mạo Chữ Ký Đất Đai & Món Nợ 300 Triệu',
    question: 'Kết quả giám định kỹ thuật tài liệu và đối chiếu sổ sách phát hiện chi tiết nào chứng minh Khang làm giả ủy quyền đất và minh oan cho Mai & Vũ lúc 20:45?',
    hint: 'Đọc Báo cáo giám định chữ ký đồ nét tracing trên Giấy ủy quyền đất 200m² và đối chiếu tính tiền Quán Bia 88 lúc 20:45.',
    options: [
      'Chữ ký đồ nét tracing trên Giấy ủy quyền đất 200m² + Vũ có hóa đơn chuyển khoản Quán Bia 88 lúc 20:45 cách hiện trường 3.8km.',
      'Dấu vân tay miết của Khang trên di chúc. Mai & Vũ không có mặt tại hiện trường trước 21:00.',
      'Chữ ký ông nội bị giả mạo bằng máy in scanner. Mai & Vũ đã ký biên bản từ bỏ quyền thừa kế.',
      'Tráo đổi toàn bộ tờ di chúc bằng bản 2024. Mai & Vũ bị Khang khóa cửa nhốt ở ngoài.'
    ],
    correctAnswer: 'Chữ ký đồ nét tracing trên Giấy ủy quyền đất 200m² + Vũ có hóa đơn chuyển khoản Quán Bia 88 lúc 20:45 cách hiện trường 3.8km.',
    unlockedEvidenceId: 'f3-1',
    status: 'locked'
  },
  {
    id: 'cp-000-2',
    caseId: 'case-000',
    title: 'Giai đoạn 2: Bi Kịch Trốn Tìm 1996 & Lời Tự Thú Xô Ngã',
    question: 'Dựa trên mẩu báo cũ năm 1996 và ảnh tuổi thơ p4, động cơ nào thúc đẩy Tùng đến tìm Khang đêm 24/07 và chi tiết nào minh oan cho Tùng?',
    hint: 'Đối chiếu ngày giỗ tròn 30 năm bé Gia Huy (24/07/1996 - 24/07/2026), lời tự thú của Tùng lúc 20:15 và mốc giờ tàu hàng chạy qua lúc 20:30.',
    options: [
      'Ngày giỗ 30 năm bé Gia Huy tử vong trong tủ gỗ năm 1996; Tùng xô Khang ngã ngất lúc 20:00 nhưng Khang vẫn thở đều, Tùng bỏ đi lúc 20:15 trước khi tàu hàng 20:30 chạy qua.',
      'Tùng nợ Khang khoản tiền bốc họ 300M từ năm 1996 và đến để xin khất nợ.',
      'Tùng tranh chấp mảnh đất 200m² của cụ Thọ và muốn ép Khang chia phần.',
      'Tùng đến để làm chứng cho cuộc cãi vã giữa Mai và Khang về Giấy ủy quyền đất.'
    ],
    correctAnswer: 'Ngày giỗ 30 năm bé Gia Huy tử vong trong tủ gỗ năm 1996; Tùng xô Khang ngã ngất lúc 20:00 nhưng Khang vẫn thở đều, Tùng bỏ đi lúc 20:15 trước khi tàu hàng 20:30 chạy qua.',
    unlockedEvidenceId: 'f4-1',
    status: 'locked'
  },
  {
    id: 'cp-000-3',
    caseId: 'case-000',
    title: 'Giai đoạn 3: Phán Quyết Cuối Cùng & Sự Thật Về Cơn Cuồng Ghen',
    question: 'Ai là hung thủ thực sự sát hại Khang lúc 21:00, và bộ chứng cứ nào bóc trần toàn bộ lời khai ngoại phạm của đối tượng này?',
    hint: 'Hung thủ khai ở phòng trọ xem phim VTV3 cả tối nhưng bị bóc trần bởi âm thanh còi tàu 20:32, lịch VTV3 thứ Sáu chỉ chiếu Gameshow, và Lọn tóc ADN trong áo ngực.',
    options: [
      'Hung thủ: Trần Thị Hà. Bị bóc trần bằng Còi tàu 20:32 trong Voicemail, Lịch VTV3 thứ Sáu (chỉ chiếu Gameshow), Áo gió dính phấn hoa xoan và Lọn tóc ADN trong áo ngực.',
      'Hung thủ: Nguyễn Thanh Tùng. Báo cáo pháp y (Vết máu trên áo) & Khung ảnh gỗ bị đập vỡ năm 1996.',
      'Hung thủ: Lê Quang Vũ. Sổ nợ 300M & Dấu giày size 41 chui qua cửa sau.',
      'Hung thủ: Trần Ngọc Mai. Đơn tố cáo đòi đất 200m² & Dấu vân tay trên bình trà.'
    ],
    correctAnswer: 'Hung thủ: Trần Thị Hà. Bị bóc trần bằng Còi tàu 20:32 trong Voicemail, Lịch VTV3 thứ Sáu (chỉ chiếu Gameshow), Áo gió dính phấn hoa xoan và Lọn tóc ADN trong áo ngực.',
    unlockedEvidenceId: 'rewards-000',
    status: 'locked'
  }
]
