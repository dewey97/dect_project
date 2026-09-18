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

export const SUSPECT_NARRATIVES = {
  questionPrompt: (name: string) =>
    `Toàn bộ hành tung của ${name} trong đêm xảy ra vụ án đã được thu thập & phân tích. Các mảnh ghép đã dần lộ diện.\n\nDựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?`,

  choiceTin: (name: string) =>
    `Bạn lựa chọn tạm thời tin tưởng ${name}.\n\nHãy chuyển hướng điều tra vụ án.\nTuy nhiên, xin các thám tử nhớ rằng: Một người chỉ được kết luận vô tội khi bạn tìm ra được hung thủ thực sự.`,

  choiceKhongTin: (name: string) =>
    `Bạn không tin đối tượng ${name} vô tội.\n\nHãy lập tức mở rộng điều tra, truy quét thêm các manh mối để chứng minh suy luận của mình.`,

  haWarrantProposal:
    `Đối tượng Trần Thị Hà có thái độ bất hợp tác, không giải trình được các mâu thuẫn trong lời khai ban đầu.\n\nQua đánh giá dấu vết nghiệp vụ, có căn cứ nhận định nhiều khả năng các vật chứng, tư trang hoặc công cụ gây án hiện đang được cất giấu tại nơi ở của đối tượng.\nĐể ngăn chặn nguy cơ tẩu tán chứng cứ, căn cứ Điều 140 và Điều 141 Bộ luật Tố tụng hình sự, Đội 5 kính đề xuất\n\nPhê duyệt Lệnh khám xét khẩn cấp chỗ ở đối với Trần Thị Hà, giao Tổ công tác phối hợp cùng Công an phường Phân khu Cảng và VKSND TP. Hà Nội thực hiện theo quy định.`,

  haFinalConclusion:
    'Chiếc áo gió màu xám đen dính bụi đất cây xoan khớp chính xác nhân dạng kẻ rình rập trước cổng nhà Khang lúc 19:25. Vỉ thuốc an thần Diazepam bóc dở 4 viên trùng khớp hoạt chất trong cặn ấm trà hoa cúc và dịch dạ dày nạn nhân. Và trên hết, lọn tóc mai dính máu giấu trong áo ngực có kết quả giám định sinh học trùng khớp 100% mẫu ADN của nạn nhân Nguyễn Văn Khang.\n\nTrước chuỗi chứng cứ đanh thép không thể chối cãi, bức tường ngoại phạm của Trần Thị Hà hoàn toàn sụp đổ. Cơn cuồng ghen bệnh hoạn khi phát hiện Khang chuẩn bị tiền bỏ trốn cùng nhân tình mới đã biến tình yêu mù quáng thành tội ác giết người man rợ lúc 21:00.\n\nToàn bộ sự thật đã được phơi bày ra ánh sáng. Đã đủ căn cứ pháp lý để lập hồ sơ đề nghị Viện Kiểm sát truy tố thủ phạm trước pháp luật.',

  suspectBreakdown: (name: string) =>
    `Vỏ bọc vô can của ${name} đã chính thức sụp đổ.\n\nNhững mối thù hằn âm ỉ với nạn nhân bị phơi bày, cùng lời khai gian dối về bằng chứng ngoại phạm đã biến ${name} trở thành đối tượng tình nghi trọng điểm.`
}

