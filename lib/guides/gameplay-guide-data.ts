export interface GuideStep {
  title: string
  desc: string
}

export interface GuideSection {
  id: string
  tabLabel: string
  title: string
  iconName: 'suspects' | 'evidence' | 'indictment'
  summary?: string
  steps: GuideStep[]
  proTip?: string
  requirementTip?: string
}

export const GAMEPLAY_GUIDE_CONFIG: {
  manualTitle: string
  sections: GuideSection[]
} = {
  manualTitle: 'SỔ TAY NGHIỆP VỤ ĐIỀU TRA',
  sections: [
    {
      id: 'suspects',
      tabLabel: 'Hồ sơ nghi phạm',
      title: 'HỒ SƠ NGHI PHẠM',
      summary: 'Tính năng xác lập và quản lý hồ sơ các đối tượng tình nghi.',
      iconName: 'suspects',
      steps: [
        {
          title: 'Điều kiện xác lập',
          desc: 'Chứng minh đối tượng có:\n• Động cơ: Tồn tại mâu thuẫn hoặc lý do để ra tay với nạn nhân\n• Mâu thuẫn trong lời khai/ngoại phạm: Sự sai lệch giữa lời khai của đối tượng với dữ liệu thực tế'
        },
        {
          title: 'Cách thức xác lập',
          desc: 'Nhập chính xác mã bằng chứng chứng minh đủ 2 điều kiện trên.'
        }
      ],
      proTip:
        'Bạn có thể chuyển sang điều tra đối tượng khác bất cứ lúc nào mà không sợ mất tiến độ điều tra đối tượng hiện tại.'
    },
    {
      id: 'evidence',
      tabLabel: 'Bổ sung chứng cứ',
      title: 'BỔ SUNG CHỨNG CỨ',
      summary: 'Thực hiện nghiệp vụ thu thập thêm chứng cứ mở rộng vụ án.',
      iconName: 'evidence',
      steps: [
        {
          title: 'Truy vết liên lạc',
          desc: 'Nhập chính xác danh tính chủ thuê bao được yêu cầu điều tra.'
        },
        {
          title: 'Khám xét lại hiện trường',
          desc: 'Tương tác trực tiếp với hình ảnh 360 độ của hiện trường để thu thập thêm chứng cứ quan trọng.'
        }
      ],
      requirementTip:
        'Yêu cầu xác lập thành công tối thiểu 2 hồ sơ nghi phạm để mở khóa thao tác.'
    },
    {
      id: 'indictment',
      tabLabel: 'Kết luận điều tra',
      title: 'KẾT LUẬN ĐIỀU TRA',
      summary: 'Đưa ra kết luận điều tra bằng việc xác nhận các yếu tố then chốt:',
      iconName: 'indictment',
      steps: [
        {
          title: 'Danh tính hung thủ',
          desc: 'Xác nhận chính xác danh tính đối tượng phạm tội.'
        },
        {
          title: 'Mâu thuẫn / Lý do ra tay với nạn nhân',
          desc: 'Chỉ rõ mâu thuẫn hoặc động cơ trực tiếp thúc đẩy hành vi sát hại nạn nhân.'
        },
        {
          title: 'Bằng chứng chứng minh hung thủ',
          desc: 'Cung cấp chứng cứ xác thực chứng minh:\n• Có động cơ gây án\n• Có cơ hội ra tay / có mặt tại thời điểm xảy ra vụ án\n• Để lại dấu vết / mang theo dấu vết của vụ án'
        }
      ]
    }
  ]
}
