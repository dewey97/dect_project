export interface PhaseNarrator {
  phase: number
  subtitle: string
  date: string
  monologue: string
}

export const CASE_000_NARRATOR: Record<number, PhaseNarrator> = {
  0: {
    phase: 0,
    subtitle: 'Đêm 24/07/2016',
    date: 'Đêm 24/07/2016',
    monologue:
      'Căn nhà cũ số 14 Đường Bờ Sông chìm trong bóng tối...\nChỉ có mùi máu bốc lên và ấm trà vỡ vụn dưới sàn phòng khách...\n\nNạn nhân Khang đã gục xuống. Tiếng bước chân lẩn khuất ngoài ngõ vắng vừa biến mất.\n\nHung thủ đã kịp trốn vào màn đêm. Tội ác giờ đây đang bị ẩn giấu đằng sau những manh mối ngổn ngang.\n\nTrò chơi trốn tìm sinh tử chính thức bắt đầu - và bạn chính là người đi tìm sự thật.'
  },
  1: {
    phase: 1,
    subtitle: 'Sáng 25/07/2016',
    date: 'Sáng 25/07/2016',
    monologue:
      'Manh mối thu thập từ điện thoại nạn nhân đã mở ra những dấu vết đầu tiên.\n\nTừ những khoản nợ mờ ám cho đến mối ân oán kéo dài nhiều năm, các đối tượng liên quan dần lộ diện với những lời khai đầy mâu thuẫn.\n\nĐã đến lúc tiến hành thẩm tra trực diện các đối tượng tình nghi để bóc tách mâu thuẫn ngoại phạm và tìm ra ngọn nguồn sự thật...'
  },
  2: {
    phase: 2,
    subtitle: 'Chiều 25/07/2016',
    date: 'Chiều 25/07/2016',
    monologue:
      'Cả 3 nghi phạm ban đầu đều có căn cứ loại trừ khỏi thời điểm gây án chí mạng lúc ~21:00. Vụ án tưởng chừng đi vào ngõ tàng, nhưng hiện trường vẫn còn những vật chứng bị bỏ sót.\n\nLệnh khám xét bổ sung đã được phê duyệt. Những chi tiết kỹ thuật từ âm thanh thu âm cho đến mốc thời gian sinh hoạt sẽ là chìa khóa bóc trần vỏ bọc ngoại phạm thực sự...'
  },
  3: {
    phase: 3,
    subtitle: 'Đêm 25/07/2016',
    date: 'Đêm 25/07/2016',
    monologue:
      'Mọi lời khai giả mạo đã sụp đổ trước dữ liệu giám định thực tế. Mối quan hệ phức tạp và động cơ ẩn giấu đằng sau vụ án mạng đêm mưa giờ đây đã hoàn toàn phát lộ.\n\nĐã đến lúc lập Bản Cáo Trạng Định Tội chính thức, chỉ danh thủ phạm và khép lại hồ sơ chuyên án...'
  }
}
