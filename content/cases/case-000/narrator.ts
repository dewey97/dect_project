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
    subtitle: 'Đêm 24/07/2016',
    date: 'Đêm 24/07/2016',
    monologue:
      'Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối tịch mịch.\n\nMùi trà hoa cúc quyện lẫn vị máu tanh nồng bốc lên từ bộ bình thủy tinh vỡ vụn dưới sàn phòng khách...\n\nTiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất. Nạn nhân Khang gục xuống, nhưng sự thật dường như vẫn còn bị phong ấn...'
  },
  1: {
    phase: 1,
    title: 'GIAI ĐOẠN 1: GIẢ MẠO CHỮ KÝ ĐẤT ĐAI & MÓN NỢ 300 TRIỆU',
    subtitle: 'Sáng 25/07/2016',
    date: 'Sáng 25/07/2016',
    monologue:
      'Lòng tham và quyền thừa kế thửa đất 200m² đã làm mờ mắt con người.\n\nChữ ký trên Giấy ủy quyền bị sao chép tinh vi bằng kỹ thuật đồ nét (tracing) hòng chiếm trọn tài sản của gia tộc.\n\nNhưng liệu mâu thuẫn đất đai có phải là ngọn nguồn thực sự dẫn đến vụ án mạng đẫm máu đêm mưa?'
  },
  2: {
    phase: 2,
    title: 'GIAI ĐOẠN 2: BI KỊCH TRỐN TÌM 1996 & NGÀY GIỖ 20 NĂM',
    subtitle: 'Chiều 25/07/2016',
    date: 'Chiều 25/07/2016',
    monologue:
      'Trò chơi trốn tìm 20 năm trước tưởng chừng đã ngủ yên dưới lớp bụi thời gian...\n\nMột mẩu báo cũ ố vàng 1996, khung ảnh kỷ niệm vỡ kính và tiếng cãi vã lúc 20:00 trong đêm tối.\n\nSự căm hận tích tụ suốt hai mươi năm qua... liệu có phải là nhát đao cuối cùng lấy đi mạng sống của Khang?'
  },
  3: {
    phase: 3,
    title: 'GIAI ĐOẠN 3: PHÁN QUYẾT CUỐI CÙNG & SỰ THẬT CƠN CUỒNG GHEN',
    subtitle: 'Đêm 25/07/2016',
    date: 'Đêm 25/07/2016',
    monologue:
      'Màn đêm bao phủ căn nhà số 14 Đường Bờ Sông khi các báo cáo giám định cuối cùng được giải mã...\n\nMọi lời khai ngoại phạm bắt đầu sụp đổ trước âm thanh còi tàu và lịch phát sóng truyền hình.\n\nĐã đến lúc bóc tách lớp mặt nạ cuối cùng, vạch trần kẻ cuồng yêu đã ra tay hạ sát nạn nhân đêm đó!'
  }
}
