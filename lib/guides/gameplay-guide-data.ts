export interface GuideStep {
  title: string
  desc: string
}

export interface GuideSection {
  id: string
  tabLabel: string
  title: string
  iconName: 'canvas' | 'suspects' | 'phone' | 'indictment'
  steps: GuideStep[]
  proTip?: string
}

export const GAMEPLAY_GUIDE_CONFIG: {
  manualTitle: string
  sections: GuideSection[]
} = {
  manualTitle: 'SỔ TAY NGHIỆP VỤ ĐIỀU TRA',
  sections: [
    {
      id: 'canvas',
      tabLabel: 'Bảng Điều Tra',
      title: 'TƯƠNG TÁC BẢNG HỒ SƠ & VẬT CHỨNG',
      iconName: 'canvas',
      steps: [
        {
          title: 'Kiểm tra ghim & xem chi tiết',
          desc: 'Nhấp trực tiếp vào bất kỳ thẻ ghim nào trên bảng (Ảnh Polaroid, Biên bản hiện trường, Ghi chú) để xem chi tiết hoặc phóng to toàn màn hình.'
        },
        {
          title: 'Theo dõi sơ đồ liên kết',
          desc: 'Các đường dây nối và màu ghim thể hiện mối liên hệ giữa các mắt xích, sẽ tự động mở khóa thêm khi bạn tìm ra manh mối mới.'
        }
      ],
      proTip: 'Bấm phím Esc hoặc nhấp ra ngoài để đóng nhanh tài liệu hoặc ảnh phóng to.'
    },
    {
      id: 'suspects',
      tabLabel: 'Nghi Phạm',
      title: 'QUẢN LÝ & GÁN MANH MỐI NGHI PHẠM',
      iconName: 'suspects',
      steps: [
        {
          title: 'Theo dõi nhiều đối tượng & Đổi hướng bất kỳ lúc nào',
          desc: 'Có thể lập hồ sơ theo dõi nhiều nghi phạm cùng lúc. Điều tra dở dang đối tượng này có thể chuyển sang đối tượng khác bất cứ lúc nào mà không mất tiến độ.'
        },
        {
          title: 'Điều kiện xác định nghi phạm',
          desc: 'Đối tượng chỉ được coi là nghi phạm khi thỏa mãn đồng thời: Có động cơ (mâu thuẫn lợi ích/tình cảm) và Chứng cứ ngoại phạm bất hợp lý (lời khai mâu thuẫn dữ liệu).'
        }
      ],
      proTip: 'Khi nhận diện đúng đối tượng, ảnh nhận dạng và dây liên kết sẽ tự động xuất hiện trên bảng án.'
    },
    {
      id: 'phone',
      tabLabel: 'Thiết Bị Số',
      title: 'KHAI THÁC THIẾT BỊ SỐ & TRA CỨU',
      iconName: 'phone',
      steps: [
        {
          title: 'Điện thoại nạn nhân',
          desc: 'Kiểm tra Tin nhắn, Ghi chú, Thư viện ảnh, Lịch sử cuộc gọi và Sao kê ngân hàng để dựng lại lịch trình vụ án.'
        },
        {
          title: 'Tra cứu danh tính số lạ',
          desc: 'Sử dụng công cụ "Mở rộng điều tra" để tra cứu thông tin chủ thuê bao của các số điện thoại đáng ngờ.'
        }
      ],
      proTip: 'Thời gian trong tin nhắn và lịch sử cuộc gọi là dữ liệu then chốt để xác thực chứng cứ ngoại phạm.'
    },
    {
      id: 'indictment',
      tabLabel: 'Cáo Trạng & Phá Án',
      title: 'THẨM VẤN & LẬP BẢN CÁO TRẠNG',
      iconName: 'indictment',
      steps: [
        {
          title: 'Giải quyết câu hỏi thẩm vấn',
          desc: 'Nhấp vào các ghim nghi vấn (màu vàng/đỏ) để trả lời các câu hỏi nghiệp vụ và mở khóa thêm quyền hạn điều tra.'
        },
        {
          title: 'Lập Bản Cáo Trạng kết tội',
          desc: 'Nhấp vào ghim "Bản kết luận điều tra", chọn đúng: Hung Thủ + Động Cơ + Phương Thức Gây Án + Chứng Cứ Then Chốt để phá giải vụ án.'
        }
      ],
      proTip: 'Cáo trạng chính xác sẽ mở ra hồ sơ kết án và phần Hậu truyện (Epilogue) của vụ án.'
    }
  ]
}
