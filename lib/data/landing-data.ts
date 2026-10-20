export const FAQ_DATA = [
  {
    q: 'Trò chơi dành cho mấy người chơi?',
    a: 'Bạn có thể chơi một mình như một thám tử độc hành hoặc chơi nhóm từ 2 - 4 người dưới dạng thảo luận, phân chia nhiệm vụ (ví dụ: một người đọc hồ sơ giấy, một người thao tác bẻ khóa trên Bàn Điều Tra Trực Tuyến).'
  },
  {
    q: 'Tôi có bắt buộc phải mua hộp game vật lý không?',
    a: 'Có. Bàn Điều Tra Trực Tuyến là một phần của trải nghiệm XPLORE. Bạn cần có các tài liệu giấy, mã số chìa khóa và mã kích hoạt in độc quyền trong hộp game vật lý để giải mã các câu đố trên Web.'
  },
  {
    q: 'Thời gian chơi game trung bình là bao lâu?',
    a: 'Vụ án "Trốn Tìm" có thời gian phá án trung bình từ 60 - 90 phút tùy thuộc vào khả năng lập luận logic và xâu chuỗi manh mối của bạn.'
  },
  {
    q: 'Mạng internet có bắt buộc để chơi game không?',
    a: 'Có, bạn cần kết nối internet để truy cập vào Bàn Điều Tra Trực Tuyến. Hệ thống hỗ trợ mượt mà trên cả trình duyệt máy tính, máy tính bảng và điện thoại di động.'
  },
  {
    q: 'Điện thoại giả lập tang vật hoạt động như thế nào?',
    a: 'Khi khám phá vụ án, bạn sẽ được cấp quyền truy cập vào điện thoại của nạn nhân ngay trên giao diện web. Bạn có thể tự do mở các ứng dụng Tin nhắn, Danh bạ, Album ảnh, Ghi chú và bẻ khóa PIN để tìm ra các file ghi âm bí mật hay dữ liệu đã bị hung thủ xóa vội vã.'
  },
  {
    q: 'Chế độ khám xét hiện trường 360° có gì đặc biệt?',
    a: 'Thay vì chỉ nhìn những tấm ảnh 2D thông thường, bạn có thể xoay nhìn 360 độ quanh căn phòng án mạng, zoom cận cảnh từng góc khuất, chạm vào các vật chứng để đọc kết quả giám định pháp y và kích hoạt chế độ đèn huỳnh quang UV để soi dấu máu và vân tay ẩn.'
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
  { id: 0, img: '/poster_c0.png', title: 'Trốn Tìm', code: 'CASE #000', status: 'Đang mở điều tra' },
  { id: 1, img: '/images/landing/poster_classified.png', title: 'Hồ Sơ Mật', code: 'CASE #001', status: 'Sắp ra mắt' },
  { id: 2, img: '/images/landing/poster_classified.png', title: 'Hồ Sơ Mật', code: 'CASE #002', status: 'Sắp ra mắt' },
  { id: 3, img: '/images/landing/poster_classified.png', title: 'Hồ Sơ Mật', code: 'CASE #003', status: 'Sắp ra mắt' },
  { id: 4, img: '/images/landing/poster_classified.png', title: 'Hồ Sơ Mật', code: 'CASE #004', status: 'Sắp ra mắt' },
]

export const CASE_FOLDERS = [
  { label: 'C-000', title: 'VỤ ÁN TRỐN TÌM', status: 'ĐANG MỞ ĐT', idx: 0, defaultR: '16deg', right: '10px' },
  { label: 'C-001', title: 'HỒ SƠ MẬT PHÂN KHU 2', status: 'SẮP RA MẮT', idx: 1, defaultR: '4deg', right: '44px' },
  { label: 'C-002', title: 'HỒ SƠ MẬT PHÂN KHU 3', status: 'PHONG TỎA', idx: 2, defaultR: '-8deg', right: '78px' },
]

export const TESTIMONIALS_DATA = [
  {
    author: 'Thám tử Blackwood',
    div: 'Tổ Trọng Án // Ban Chuyên Án Độc Lập',
    stars: 5,
    quote: 'Cầm hồ sơ giấy đối chiếu hiện trường rồi giải mã trên web cực kỳ bánh cuốn. Cảm giác nhập vai chân thực vượt mong đợi.'
  },
  {
    author: 'Thám tử V. Dung',
    div: 'Phòng Kỹ Thuật Hình Sự',
    stars: 5,
    quote: 'Logic án gài cắm rất chặt chẽ. Cảm giác bóc tách mâu thuẫn trong lời khai nghi phạm cực kỳ thỏa mãn.'
  },
  {
    author: 'Thám tử L. Quốc',
    div: 'Tổ Đặc Nhiệm Hình Sự',
    stars: 4,
    quote: 'Cả nhóm ngồi tranh luận suốt 2 tiếng không dứt. Rất lâu rồi mới có một tựa game trinh thám xuất sắc thế này.'
  }
]
