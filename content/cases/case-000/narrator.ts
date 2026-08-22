export interface PhaseNarrator {
  phase: number
  title: string
  subtitle: string
  monologue: string
}

export const CASE_000_NARRATOR: Record<number, PhaseNarrator> = {
  0: {
    phase: 0,
    title: 'GIAI ĐOẠN 0: MÀN SƯƠNG HIỆN TRƯỜNG & BIÊN BẢN TỬ THI',
    subtitle: 'Lời Dẫn Chuyện // Đêm 24/07/2026',
    monologue:
      'Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối tịch mịch. Mùi trà xanh tươi quyện lẫn vị máu tanh nồng bốc lên từ bộ bình ceramic vỡ vụn dưới sàn phòng khách... Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất. Nạn nhân Khang gục xuống, nhưng sự thật dường như vẫn còn bị phong ấn...'
  },
  1: {
    phase: 1,
    title: 'GIAI ĐOẠN 1: TỜ DI CHÚC TẨY XÓA & VẾT MỰC BI 2024',
    subtitle: 'Lời Dẫn Chuyện // Lòng Tham & Mâu Thuẫn Di Sản',
    monologue:
      'Lòng tham và đất đai đền bù hàng tỷ đồng đã làm mờ mắt con người. Tờ di chúc năm 2018 bị gột rửa bằng hóa chất độc hại để chèn lên dòng chữ bi hóa dầu năm 2024. Nhưng liệu một tờ giấy bị tráo đổi có phải là ngọn nguồn thực sự dẫn đến vụ án mạng đẫm máu đêm mưa?'
  },
  2: {
    phase: 2,
    title: 'GIAI ĐOẠN 2: TIẾNG XÔ XÁT ĐÊM 24/07 & KỶ VẬT TỦ ÂM TƯỜNG',
    subtitle: 'Lời Dẫn Chuyện // Ký Ức Đau Thương 1998',
    monologue:
      'Trò chơi trốn tìm 12 năm trước chưa bao giờ kết thúc... Tiếng rầm rít từ chiếc tủ âm tường bọc gỗ rơm rớm nhựa trong đêm tối. Tùng tưởng mình đã lỡ tay sát hại nạn nhân lúc 20:00 và hoảng hốt tháo chạy lúc 20:15... Nhưng bóng đen thực sự mới bắt đầu chui vào nhà SAU khi Tùng bỏ chạy!'
  },
  3: {
    phase: 3,
    title: 'GIAI ĐOẠN 3: PHÁN QUYẾT CUỐI CÙNG & ĐỘNG CƠ CUỒNG SỞ HỮU',
    subtitle: 'Lời Dẫn Chuyện // Lật Tẩy Hung Thủ Thực Sự',
    monologue:
      'Màn đêm buông xuống... Kẻ giả vờ khóc lóc thảm thiết nhất lại chính là kẻ đã lén chui vào nhà lúc 20:45, vơ lấy mảnh thủy tinh ceramic sắc nhọn 8cm đâm đứt động mạch cảnh Khang lúc 21:00 trong cơn ghen cuồng sở hữu độc hại. Sự thật đã được phơi bày ra ánh sáng!'
  }
}
