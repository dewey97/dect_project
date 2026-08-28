export const SHOWCASE_ITEMS = {
  dossier: {
    title: 'Tệp Hồ Sơ Vụ Án Giấy',
    desc: 'Bản in hiện vật chứa biên bản khám nghiệm, sơ đồ hiện trường vụ án và thông tin cá nhân nạn nhân.',
    digitalTitle: 'Hồ Sơ Vụ Án Trực Tuyến',
    digitalDesc: 'Dữ liệu được số hóa tự động khi bạn nhập mã kích hoạt, giúp bạn đối chiếu dòng thời gian thám tử.',
    badgeText: 'HỒ SƠ GỐC CẢNG BẮC'
  },
  phone: {
    title: 'Điện Thoại Phụ (Burner Phone)',
    desc: 'Một mẫu điện thoại phím bấm thực tế đi kèm hộp game chứa mã vạch mở khóa đính sau pin.',
    digitalTitle: 'Trình Giả Lập Pháp Y Di Động',
    digitalDesc: 'Giao diện trích xuất chip-off, giải mã tin nhắn đã xóa, xem email nội bộ cảng và định vị GPS di chuyển.',
    badgeText: 'THIẾT BỊ TANG VẬT'
  },
  key: {
    title: 'Chìa Khóa Đồng Đúc',
    desc: 'Mẫu chìa khóa đồng nặng trĩu của cảnh sát chứa mã số chìm khắc trên bề mặt.',
    digitalTitle: 'Hệ Thống Bẻ Khóa Két Sắt',
    digitalDesc: 'Nhập mã số chìa khóa để mở phân vùng bảo mật của máy chủ cảng biển, tìm tệp tin ghi âm lầm bầm của Marsh.',
    badgeText: 'VẬT THỂ LIÊN KẾT'
  }
}

export const FAQ_DATA = [
  {
    q: 'Trò chơi dành cho mấy người chơi?',
    a: 'Bạn có thể chơi một mình như một thám tử độc hành hoặc chơi nhóm từ 2 - 4 người dưới dạng thảo luận, phân chia nhiệm vụ (ví dụ: một người đọc hồ sơ giấy, một người thao tác bẻ khóa trên Web).'
  },
  {
    q: 'Tôi có bắt buộc phải mua hộp game vật lý không?',
    a: 'Có. Trình giả lập trực tuyến này là một phần của trải nghiệm Nocturne. Bạn cần có các tài liệu giấy, mã số chìa khóa và mã kích hoạt in độc quyền trong hộp game vật lý để giải mã các câu đố trên Web.'
  },
  {
    q: 'Thời gian chơi game trung bình là bao lâu?',
    a: 'Vụ án đầu tiên "Ánh Sáng Cảng Biển" có thời gian phá án trung bình từ 60 - 90 phút tùy thuộc vào khả năng lập luận logic và xâu chuỗi manh mối của bạn.'
  },
  {
    q: 'Mạng internet có bắt buộc để chơi game không?',
    a: 'Có, bạn cần kết nối internet để truy cập vào trình giả lập pháp y này. Máy trạm hỗ trợ mượt mà trên cả trình duyệt máy tính, máy tính bảng và điện thoại di động.'
  },
  {
    q: 'Chính sách giao hàng và phí ship thế nào?',
    a: 'Chúng tôi miễn phí vận chuyển tiêu chuẩn toàn quốc cho tất cả các đơn hàng hộp hồ sơ vụ án vật lý. Đơn hàng nội thành Hà Nội/TP.HCM dự kiến nhận trong 1 - 2 ngày, các tỉnh thành khác từ 3 - 4 ngày.'
  },
  {
    q: 'Chính sách đổi trả hàng vật lý nếu thiếu linh kiện?',
    a: 'Nếu hộp hồ sơ nhận được bị rách niêm phong, thiếu linh kiện vật lý (chìa khóa, burner phone mô hình, thẻ bài), chúng tôi sẽ gửi bù linh kiện miễn phí hoặc đổi bộ mới 100% trong vòng 7 ngày kể từ khi nhận hàng.'
  }
]

export const POSTER_ITEMS = [
  { id: 0, img: '/nocturne_case_9.png', title: 'Bóng Ma Cầu Cảng Số 9' },
  { id: 1, img: '/nocturne_case_north.png', title: 'Mật Mã Cảng Bắc' },
  { id: 2, img: '/suspect_marsh.png', title: 'Bí Mật Xí Nghiệp Đường Sắt' },
  { id: 3, img: '/newspaper_clipping.png', title: 'Vụ Án Tẩy Xóa Hồ Sơ' },
  { id: 4, img: '/victim_thomas.png', title: 'Hồ Sơ Mất Tích Phân Khu 4' },
]

export const CASE_FOLDERS = [
  { label: 'NX-4471', title: 'BÓNG MA CẦU CẢNG SỐ 9', status: 'TẠM ĐÌNH CHỈ', idx: 0, defaultR: '16deg', right: '10px' },
  { label: 'NX-4472', title: 'MẬT MÃ CẢNG BẮC', status: 'ĐANG MỞ ĐT', idx: 1, defaultR: '4deg', right: '44px' },
  { label: 'NX-4473', title: 'BÍ MẬT XÍ NGHIỆP ĐS', status: 'PHONG TỎA', idx: 2, defaultR: '-8deg', right: '78px' },
]

export const TESTIMONIALS_DATA = [
  {
    author: 'Thám tử Blackwood',
    div: 'Phân khu 9 // Tỉnh Cảng Bắc',
    stars: 5,
    quote: 'Việc kết hợp tài liệu giấy và máy trạm số tạo ra trải nghiệm cực kỳ lôi cuốn. Khi bạn tìm thấy mã PIN viết tay trên mép tài liệu giấy và nhập vào bẻ khóa điện thoại trên web, cảm giác nhập vai vượt trội.'
  },
  {
    author: 'Thám tử V. Dung',
    div: 'Phân khu 4 // Tỉnh Cảng Bắc',
    stars: 5,
    quote: 'Bộ công cụ đối chiếu dòng thời gian (Timeline Tool) rất tuyệt vời. Việc so sánh lời khai nói dối của nghi phạm với nhật ký GPS thật để phát hiện điểm mâu thuẫn chớp đỏ làm tôi có cảm giác như thám tử thực thụ.'
  },
  {
    author: 'Thám tử L. Quốc',
    div: 'Tổ Đặc Nhiệm // Tỉnh Cảng Bắc',
    stars: 4,
    quote: 'Các thông số pháp y như mã băm SHA-256, phân vùng khôi phục dữ liệu burner mang lại chiều sâu công nghệ tuyệt vời. Tuy nhiên việc có nút ẩn bớt các thông số này giúp người chơi không bị ngợp.'
  }
]
