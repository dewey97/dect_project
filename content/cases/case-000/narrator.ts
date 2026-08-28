export interface PhaseNarrator {
  phase: number
  title: string
  subtitle: string
  date: string
  monologue: string
}

export const CASE_000_NARRATOR: Record<number, PhaseNarrator> = {
  0: {
    phase: 0,
    title: 'GIAI ĐOẠN 0: MÀN SƯƠNG HIỆN TRƯỜNG & BIÊN BẢN TỬ THI',
    subtitle: 'Đêm 24/07/2026',
    date: 'Đêm 24/07/2026',
    monologue:
      'Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối tịch mịch.\n\nMùi trà xanh tươi quyện lẫn vị máu tanh nồng bốc lên từ bộ bình gốm sứ vỡ vụn dưới sàn phòng khách...\n\nTiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất. Nạn nhân Khang gục xuống, nhưng sự thật dường như vẫn còn bị phong ấn...'
  },
  1: {
    phase: 1,
    title: 'GIAI ĐOẠN 1: TỜ DI CHÚC TẨY XÓA & VẾT MỰC BI 2024',
    subtitle: 'Sáng 25/07/2026',
    date: 'Sáng 25/07/2026',
    monologue:
      'Lòng tham và đất đai đền bù hàng tỷ đồng đã làm mờ mắt con người.\n\nTờ di chúc năm 2018 bị gột rửa bằng hóa chất độc hại để chèn lên dòng chữ bi hóa dầu năm 2024.\n\nNhưng liệu một tờ giấy bị tráo đổi có phải là ngọn nguồn thực sự dẫn đến vụ án mạng đẫm máu đêm mưa?'
  },
  2: {
    phase: 2,
    title: 'GIAI ĐOẠN 2: KỶ VẬT QUÁ KHỨ & TIẾNG XÔ XÁT ĐÊM 24/07',
    subtitle: 'Chiều 25/07/2026',
    date: 'Chiều 25/07/2026',
    monologue:
      'Trò chơi trốn tìm 12 năm trước tưởng chừng đã ngủ yên dưới lớp bụi thời gian...\n\nMột bài báo ố vàng, chiếc còi đồng im lìm và bóng người tháo chạy hoảng loạn lúc 20:15 trong đêm tối.\n\nSự căm hận tích tụ suốt hơn mười năm qua... liệu có phải là nhát đao cuối cùng lấy đi mạng sống của Khang?'
  },
  3: {
    phase: 3,
    title: 'GIAI ĐOẠN 3: PHÁN QUYẾT CUỐI CÙNG & ĐỘNG CƠ CUỒNG SỞ HỮU',
    subtitle: 'Đêm 25/07/2026',
    date: 'Đêm 25/07/2026',
    monologue:
      'Màn đêm bao phủ căn nhà số 14 Đường Bờ Sông khi các báo cáo pháp y cuối cùng được giải mã...\n\nMọi lời khai nhân chứng bắt đầu rạn nứt. Mốc giờ tử vong thực tế lệch khỏi mọi suy đoán ban đầu.\n\nĐã đến lúc bóc tách lớp mặt nạ cuối cùng, chỉ ra kẻ thực sự vơ lấy mảnh thủy tinh đâm chết nạn nhân đêm đó!'
  }
}
