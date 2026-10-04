export interface WalkthroughStep {
  id: string
  stepNumber: number
  totalSteps: number
  title: string
  subtitle: string
  description: string
  actionHint?: string
  targetType: 'canvas-center' | 'pin' | 'dom-selector'
  targetPinId?: string
  domSelector?: string
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'step-overview',
    stepNumber: 1,
    totalSteps: 7,
    title: 'TỔNG QUAN BẢNG ĐIỀU TRA',
    subtitle: 'Sơ đồ án mạng & Mắt xích vật chứng',
    description:
      'Đây là bảng điều tra vụ án. Nơi tập hợp mọi tài liệu, hình ảnh hiện trường, hồ sơ đối tượng và các mối liên kết phá án.',
    actionHint: '💡 Bạn có thể nhấp vào bất kỳ ghim nào để kiểm tra chi tiết.',
    targetType: 'canvas-center'
  },
  {
    id: 'step-evidence-photo',
    stepNumber: 2,
    totalSteps: 7,
    title: 'VẬT CHỨNG & ẢNH HIỆN TRƯỜNG',
    subtitle: 'Xem ảnh Polaroid & Biên bản pháp y',
    description:
      'Các bức ảnh hiện trường và nạn nhân được ghim trực tiếp trên bảng. Nhấp trực tiếp vào ảnh hoặc ghim tài liệu để phóng to xem chi tiết.',
    actionHint: '💡 Nhấn phím Esc hoặc nhấp ra ngoài để đóng nhanh ảnh phóng to.',
    targetType: 'pin',
    targetPinId: 'c0-pin-victim-khang'
  },
  {
    id: 'step-phone-forensics',
    stepNumber: 3,
    totalSteps: 7,
    title: 'KHAI THÁC THIẾT BỊ SỐ & TRA CỨU SĐT',
    subtitle: 'Điện thoại nạn nhân & Danh bạ nhà mạng',
    description:
      'Truy cập điện thoại của nạn nhân (Tin nhắn, Ghi chú, Ảnh, Sao kê ngân hàng, GPS) và tra cứu cơ sở dữ liệu số điện thoại lạ xuất hiện trong vụ án.',
    actionHint: '💡 Mốc thời gian trong tin nhắn và cuộc gọi là chìa khóa dựng lại Timeline.',
    targetType: 'pin',
    targetPinId: 'c0-pin-phone'
  },
  {
    id: 'step-suspects',
    stepNumber: 4,
    totalSteps: 7,
    title: 'QUẢN LÝ & GÁN MANH MỐI NGHI PHẠM',
    subtitle: 'Lập hồ sơ đối tượng, động cơ & bằng chứng ngoại phạm',
    description:
      'Mở danh mục Nghi phạm để thêm các đối tượng tình nghi. Gán Động cơ (Motive) và Chứng cứ ngoại phạm (Alibi) của từng người để đối chiếu lời khai.',
    actionHint: '💡 Khi nhận diện đúng đối tượng, ảnh chân dung và dây liên kết sẽ tự động nối trên bảng án.',
    targetType: 'pin',
    targetPinId: 'c0-pin-suspects'
  },
  {
    id: 'step-reinvestigate',
    stepNumber: 5,
    totalSteps: 7,
    title: 'LỆNH TÁI KHÁM XÉT & CÂU HỎI NGHIỆP VỤ',
    subtitle: 'Thẩm vấn mở rộng & Tìm kiếm vật chứng ẩn',
    description:
      'Trả lời các câu hỏi thẩm vấn then chốt tại các ghim nghi vấn để được phê duyệt Lệnh khám xét lại hiện trường nhằm thu thập thêm chứng cứ mới.',
    actionHint: '💡 Các ghim màu vàng/đỏ thể hiện các câu hỏi cần giải quyết tiếp theo.',
    targetType: 'pin',
    targetPinId: 'c0-pin-reinvestigate'
  },
  {
    id: 'step-indictment',
    stepNumber: 6,
    totalSteps: 7,
    title: 'LẬP BẢN CÁO TRẠNG GỬI VIỆN KIỂM SÁT',
    subtitle: 'Kết luận điều tra & Bắt giữ hung thủ',
    description:
      'Khi đã đủ bằng chứng, nhấp vào đây để hoàn thiện 4 yếu tố: Hung Thủ + Động Cơ + Phương Thức Gây Án + Chứng Cứ Buộc Tội để phá án thành công!',
    actionHint: '💡 Bản cáo trạng chính xác 100% sẽ mở ra phần Hậu truyện (Epilogue).',
    targetType: 'pin',
    targetPinId: 'c0-pin-indictment'
  },
  {
    id: 'step-quick-menu',
    stepNumber: 7,
    totalSteps: 7,
    title: 'MENU THAO TÁC NHANH & SỔ TAY',
    subtitle: 'Gợi ý phá án & Xem lại sổ tay',
    description:
      'Tại góc dưới phải, nút Thao tác nhanh cho phép bạn xem Gợi ý phá án, mở Điện thoại và mở lại Sổ tay hướng dẫn này bất cứ lúc nào.',
    actionHint: '💡 Chúc điều tra viên phá án thành công!',
    targetType: 'dom-selector',
    domSelector: '[data-tour="fab-menu"]'
  }
]
