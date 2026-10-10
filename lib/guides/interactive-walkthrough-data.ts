export interface WalkthroughStep {
  id: string
  stepNumber: number
  totalSteps: number
  title: string
  subtitle?: string
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
    totalSteps: 6,
    title: 'Tổng quan bảng điều tra',
    description:
      'Hiển thị toàn bộ hồ sơ đối tượng, các liên kết và tiến trình phá án.',
    targetType: 'canvas-center'
  },
  {
    id: 'step-suspects',
    stepNumber: 2,
    totalSteps: 6,
    title: 'Hồ sơ nghi phạm',
    description:
      'Nơi xác lập đối tượng tình nghi khi chứng minh được đối tượng có:\n• Động cơ gây án\n• Mâu thuẫn trong lời khai hoặc ngoại phạm',
    targetType: 'pin',
    targetPinId: 'c0-pin-suspects'
  },
  {
    id: 'step-victim-phone',
    stepNumber: 3,
    totalSteps: 6,
    title: 'Điện thoại nạn nhân',
    description:
      'Nơi lưu trữ các dấu vết số của nạn nhân. Bạn có thể tự thao tác trực tiếp trên điện thoại.',
    targetType: 'pin',
    targetPinId: 'c0-pin-victim-phone'
  },
  {
    id: 'step-evidence',
    stepNumber: 4,
    totalSteps: 6,
    title: 'Bổ sung chứng cứ',
    description:
      'Thực hiện nghiệp vụ thu thập thêm chứng cứ:\n• 4.1. Truy vết liên lạc: Tra cứu danh tính chủ thuê bao ẩn danh để triệu tập và mở khóa lời khai mới.\n• 4.2. Khám xét lại hiện trường: Nhằm thu thập thêm chứng cứ khi chuỗi bằng chứng ban đầu chưa thể khép lại vụ án. Yêu cầu xác lập thành công tối thiểu 2 hồ sơ nghi phạm để mở khóa thao tác.',
    targetType: 'pin',
    targetPinId: 'c0-pin-evidence'
  },
  {
    id: 'step-indictment',
    stepNumber: 5,
    totalSteps: 6,
    title: 'Kết luận điều tra',
    description:
      'Nơi đưa ra phán quyết cuối cùng về danh tính hung thủ. Tính năng luôn mở nhưng không cung cấp gợi ý, vì vậy hãy cân nhắc thật kỹ trước khi nộp kết luận.',
    targetType: 'pin',
    targetPinId: 'c0-pin-indictment'
  },
  {
    id: 'step-quick-menu',
    stepNumber: 6,
    totalSteps: 6,
    title: 'Menu thao tác nhanh',
    description:
      'Bao gồm:\n• Gợi ý: Cung cấp manh mối định hướng khi bạn gặp bế tắc.\n• Sổ tay hướng dẫn: Tra cứu lại các chức năng điều tra.\n• Chơi lại từ đầu: Đặt lại toàn bộ tiến trình điều tra về trạng thái ban đầu.',
    targetType: 'dom-selector',
    domSelector: '[data-tour="fab-menu"]'
  }
]
