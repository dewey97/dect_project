export interface CanvasTourStep {
  id: string
  stepNumber: number
  totalSteps: number
  title: string
  subtitle?: string
  description: string
  actionHint?: string
  targetSelector?: string
  targetType: 'canvas-center' | 'dom-selector'
}

export const CANVAS_TOUR_STEPS: CanvasTourStep[] = [
  {
    id: 'canvas-workspace',
    stepNumber: 1,
    totalSteps: 6,
    title: 'Mặt bàn tác nghiệp vô tận',
    subtitle: 'Không gian trải rộng hồ sơ vụ án',
    description:
      'Mặt bàn mở rộng tự do theo mọi hướng, mô phỏng bàn làm việc thực tế của ban chuyên án:\n• Giữ Chuột giữa hoặc giữ phím Space + Kéo chuột để di chuyển bàn.\n• Cuộn bánh xe chuột để Phóng to / Thu nhỏ tầm nhìn.\n• Bấm nút Căn giữa (hoặc phím 0) để quy tụ toàn bộ tài liệu về giữa màn mắt.',
    actionHint: 'Mẹo: Giữ phím Space rồi kéo chuột là cách lướt bàn nhanh và mượt mà nhất.',
    targetType: 'canvas-center',
    targetSelector: '[data-tour="canvas-workspace"]'
  },
  {
    id: 'canvas-dossier-tray',
    stepNumber: 2,
    totalSteps: 6,
    title: 'Khay tài liệu & Rút hồ sơ',
    subtitle: 'Nơi lưu trữ chứng cứ và biên bản điều tra',
    description:
      'Toàn bộ lời khai nhân chứng, lý lịch nghi phạm, biên bản giám định pháp y và ảnh vật chứng nằm ở đây:\n• Bấm vào bất kỳ tài liệu nào để đưa lên bàn làm việc.\n• Nhấn giữ và kéo thả trực tiếp tài liệu từ khay ra một góc bất kỳ trên bàn để nghiên cứu đối chiếu.',
    actionHint: 'Mẹo: Bạn có thể lọc tài liệu theo từng Giai đoạn (Phase) hoặc theo Thể loại.',
    targetType: 'dom-selector',
    targetSelector: '[data-tour="canvas-dossier-tray"]'
  },
  {
    id: 'canvas-desk-cards',
    stepNumber: 3,
    totalSteps: 6,
    title: 'Thao tác trên tài liệu',
    subtitle: 'Sắp xếp, co kéo, ghim cố định và đọc chi tiết',
    description:
      'Mỗi tập hồ sơ trên bàn là một thực thể vật lý độc lập:\n• Nắm thanh tiêu đề màu nâu để di chuyển vị trí tự do.\n• Kéo góc dưới phải để mở rộng hoặc thu nhỏ kích thước đọc.\n• Bấm nút Ghim để khóa vị trí không bị xê dịch khi lướt bàn.\n• Bấm nút Phóng to để đọc tài liệu ở chế độ toàn cảnh.',
    actionHint: 'Mẹo: Đặt các bản lời khai mâu thuẫn nằm cạnh nhau để dễ phát hiện sơ hở.',
    targetType: 'canvas-center',
    targetSelector: '[data-tour="canvas-desk-cards"]'
  },
  {
    id: 'canvas-bottom-toolbar',
    stepNumber: 4,
    totalSteps: 6,
    title: 'Bộ công cụ ghi chú & Highlight',
    subtitle: 'Vẽ, khoanh vùng và dán note trực tiếp lên bàn',
    description:
      'Thanh công cụ cố định tại đáy màn hình hỗ trợ ghi lại suy luận ngay tại chỗ:\n• Bút mực (Pen): Khoanh tròn các chi tiết nghi vấn bằng mực đỏ, đen, xanh.\n• Bút dạ quang (Highlighter): Tô sáng các mốc thời gian hoặc câu nói mâu thuẫn.\n• Giấy dán (Sticky Note): Dán các mảnh note ghi chú giả thuyết phá án khắp mặt bàn.\n• Tẩy (Eraser): Xóa từng nét vẽ hoặc làm sạch toàn bộ ghi chú.',
    actionHint: 'Mẹo: Nhấn Ctrl+Z để hoàn tác nhanh nét vẽ vừa tạo.',
    targetType: 'dom-selector',
    targetSelector: '[data-tour="canvas-bottom-toolbar"]'
  },
  {
    id: 'canvas-floating-board',
    stepNumber: 5,
    totalSteps: 6,
    title: 'Bảng điều tra & Cửa sổ nổi',
    subtitle: 'Đa nhiệm song song không làm mất bố cục',
    description:
      'Các phân hệ điều tra trọng yếu hiển thị dưới dạng cửa sổ nổi:\n• Bảng điều tra mini (góc phải): Nối chỉ đỏ và theo dõi đồ thị vụ án. Có thể phóng to toàn màn hình hoặc cất gọn.\n• Điện thoại nạn nhân: Tra cứu tin nhắn, cuộc gọi và ứng dụng ngân hàng số.\n• Sổ tay thám tử: Ghi chép nhật ký phá án độc lập.',
    actionHint: 'Mẹo: Nắm thanh tiêu đề của Điện thoại/Sổ tay để kéo đến vị trí thuận mắt nhất.',
    targetType: 'dom-selector',
    targetSelector: '[data-tour="canvas-floating-board"]'
  },
  {
    id: 'canvas-left-dock',
    stepNumber: 6,
    totalSteps: 6,
    title: 'Dock điều hướng & Cá nhân hóa',
    subtitle: 'Lối tắt nghiệp vụ & Tùy biến mặt bàn',
    description:
      'Thanh dock bên mép trái hỗ trợ bật/tắt tức thì các phân hệ:\n• Tài liệu, Điều tra, Điện thoại, Hiện trường 360 và Sổ tay.\n• Nhấn nút Bảng màu ở thanh đáy để đổi chất liệu mặt bàn (Gỗ sồi, Bàn da, Giấy cổ điển).\n• Chuyển đổi giữa Bàn hồ sơ và chế độ Xem lẻ bất kỳ lúc nào qua menu trên thanh Header.',
    actionHint: 'Bạn đã sẵn sàng! Chúc bạn giải mã thành công vụ án.',
    targetType: 'dom-selector',
    targetSelector: '[data-tour="canvas-left-dock"]'
  }
]

export interface ShortcutItem {
  key: string
  label: string
  desc: string
}

export const CANVAS_SHORTCUTS: ShortcutItem[] = [
  {
    key: 'Space + Kéo',
    label: 'Cuộn mặt bàn',
    desc: 'Giữ phím cách và kéo chuột để lướt tự do trên bàn'
  },
  {
    key: 'Chuột giữa',
    label: 'Pan mặt bàn',
    desc: 'Nhấn giữ phím cuộn chuột và di chuyển để di chuyển bàn'
  },
  {
    key: 'Cuộn chuột',
    label: 'Thu phóng (Zoom)',
    desc: 'Cuộn lên để phóng to, cuộn xuống để thu nhỏ mặt bàn'
  },
  {
    key: 'Phím 0',
    label: 'Căn giữa (Fit All)',
    desc: 'Tự động quy tụ toàn bộ tài liệu về giữa tầm nhìn'
  },
  {
    key: 'Ctrl + Z',
    label: 'Hoàn tác nét vẽ',
    desc: 'Xóa nét vẽ hoặc highlight gần nhất trên mặt bàn'
  },
  {
    key: 'Ctrl + Y',
    label: 'Làm lại nét vẽ',
    desc: 'Phục hồi lại nét vẽ vừa hoàn tác'
  },
  {
    key: 'Esc',
    label: 'Thoát / Đóng',
    desc: 'Thoát toàn màn hình bảng điều tra hoặc đóng modal đang mở'
  }
]

export const CANVAS_INVESTIGATION_TIPS = [
  {
    title: 'Chiến thuật phối màu dạ quang (Color Coding)',
    desc: 'Dùng màu Vàng cho các mốc thời gian / địa điểm; màu Hồng/Đỏ cho những lời khai mâu thuẫn với vật chứng; màu Xanh lá cho thông tin ngoại phạm đã được kiểm chứng.'
  },
  {
    title: 'Đối chiếu chéo Lời khai & Dữ liệu số',
    desc: 'Mở cửa sổ Điện thoại nạn nhân và đặt sát cạnh bản lời khai của nghi phạm trên bàn. Đối chiếu từng tin nhắn, cuộc gọi với khung giờ nghi phạm khai báo.'
  },
  {
    title: 'Ghim cố định hồ sơ then chốt',
    desc: 'Những biên bản pháp y và sơ đồ hiện trường nên được bấm Ghim (Pin) ở vị trí trung tâm bàn làm việc để làm điểm tựa suy luận vững chắc.'
  },
  {
    title: 'Tối ưu không gian làm việc',
    desc: 'Khi cần tập trung phân tích sâu một biên bản, bấm nút phóng to để xem chế độ chi tiết; khi cần nhìn bức tranh toàn cảnh, thu nhỏ khay tài liệu bên trái lại.'
  }
]
