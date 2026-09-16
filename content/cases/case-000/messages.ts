import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-05',
      name: 'Bé Vy ❤️',
      phoneNumber: '0978.552.xxx',
      avatarColor: 'from-[#FF2D55] to-[#FF375F]',
      timestamp: '20:35, 24 Th 7',
      previewText: 'Dạaaa, mai anh yêu nhớ qua đón em nhé 😘😘',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm5-1',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Anh ơi em xếp đồ xong rồi nè 🥰 Mà anh đặt vé chưa ạaaa?',
          timestamp: '19:40, 24 Th 7',
          status: 'Đã xem'
        },
        {
          id: 'm5-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh đặt rồi cưng. Tối nay thu xếp nốt mấy việc còn lại là xong.',
          timestamp: '19:41, 24 Th 7',
          status: 'Đã gửi'
        },
        {
          id: 'm5-3',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Hihi yêu anh nhất!! Thế còn chị Hà anh tính sao ? Em sợ chị ấy biết rồi lại làm loạn...🥹',
          timestamp: '19:41, 24 Th 7',
          status: 'Đã xem'
        },
        {
          id: 'm5-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Kệ con đó đi. Bám như đỉa.\nAnh block nó rồi mà nó đổi số gọi hoài. Chả hiểu sao mặt dày lì lợm thế',
          timestamp: '19:41, 24 Th 7',
          status: 'Đã gửi',
          isClue: true,
          clueTitle: 'Động cơ gây án bùng nổ của Trần Thị Hà',
          clueAnalysis:
            'Khang ruồng rẫy Hà và coi Hà là "bám như đỉa, mặt dày lì lợm". Khi Hà lén mở khóa điện thoại, lời lẽ miệt thị độc địa này đã đẩy cơn uất hận cuồng ghen lên đỉnh điểm dẫn đến vụ án mạng.'
        },
        {
          id: 'm5-5',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Thôi thì ít nhất chị í cũng thật lòng yêu anh 🤣',
          timestamp: '17:42, 24 Th 7',
          status: 'Đã xem'
        },
        {
          id: 'm5-6',
          sender: 'Khang',
          role: 'sent',
          text: 'Yêu gì mà yêu, anh chịu hết nổi rồi. Chỉ có bé mới hiểu anh thôi.',
          timestamp: '17:44, 24 Th 7',
          status: 'Đã gửi'
        },
        {
          id: 'm5-7',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Dạaaa, mai anh yêu nhớ qua đón em nhé 😘😘',
          timestamp: '20:35, 24 Th 7',
          status: 'Đã xem'
        }
      ]
    },
    {
      id: 'conv-03',
      name: 'Hà',
      phoneNumber: '0984.112.568',
      avatarColor: 'from-[#FF375F] to-[#AF52DE]',
      isMuted: true,
      timestamp: '19:00, 24 Th 7',
      previewText: 'Anh ơi, em vừa sao xong mẻ trà hoa cúc mới...',
      recoveryProgress: 100,
      unread: true,
      messages: [
        {
          id: 'm3-1',
          sender: 'Hà',
          role: 'received',
          text: 'Anh Khang ơi, hôm nay em nấu canh cua với rau đay, anh thích món đó mà. Để em mang sang cho anh nhé? Em biết anh hay quên ăn tối...',
          timestamp: '21:17, 22 Th 7'
        },
        {
          id: 'm3-2',
          sender: 'Hà',
          role: 'received',
          text: 'Anh không trả lời à... Không sao, em để phần anh trong hộp cơm ở trước cửa nhé. Anh nhớ lấy vào ăn kẻo nguội.',
          timestamp: '22:03, 22 Th 7'
        },
        {
          id: 'm3-3',
          sender: 'Hà',
          role: 'received',
          text: 'Em thấy hộp cơm hôm qua anh đã lấy vào rồi 🥰 Vậy là anh có ăn phải không? Chiều nay em nghỉ sớm, hay để em ghé qua dọn nhà cho anh nh?',
          timestamp: '12:44, 23 Th 7'
        },
        {
          id: 'm3-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Đừng có sang. Bận.',
          timestamp: '14:51, 23 Th 7'
        },
        {
          id: 'm3-5',
          sender: 'Hà',
          role: 'received',
          text: 'Anh ơi, em vừa sao xong mẻ trà hoa cúc mới, thơm lắm anh. Lát anh có ở nhà không, em mang qua cho anh nhé?',
          timestamp: '19:00, 24 Th 7',
          isClue: true,
          clueTitle: 'Hũ trà hoa cúc tẩm độc',
          clueAnalysis:
            'Hà mang mẻ trà hoa cúc sang cho Khang.'
        }
      ]
    },
    {
      id: 'conv-02',
      name: '0967452183',
      phoneNumber: '0967452183',
      avatarColor: 'from-[#0A84FF] to-[#5E5CE6]',
      timestamp: '18:12, 24 Th 7',
      previewText: 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm2-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Hạn 20 rồi mày không thấy lịch à. 300 triệu không phải 300 nghìn. Tắt máy trốn thì tao tìm đến tận nhà mày.',
          timestamp: '09:14, 21 Th 7'
        },
        {
          id: 'm2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Mày nghĩ tắt máy là xong à?',
          timestamp: '20:31, 22 Th 7'
        },
        {
          id: 'm2-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Ngày mai không gọi lại tao thì tao cho rải giấy nợ để cả phố biết mặt thằng rể quý nhà họ Nguyễn.',
          timestamp: '20:31, 22 Th 7'
        },
        {
          id: 'm2-4',
          sender: 'Khang',
          role: 'sent',
          text: 'T cho m cơ hội cuối.\nTối nay qua nhà tao nói chuyện cho đàng hoàng.\nKhông thì ngày mai tao ghé nhà máy thăm bố vợ mày luôn thể.',
          timestamp: '18:12, 24 Th 7',
          isClue: true,
          clueTitle: 'Sổ nợ bốc họ 300 triệu của Vũ',
          clueAnalysis:
            'Khang dùng khoản nợ tín dụng đen 300 triệu ép Vũ.'
        }
      ]
    },
    {
      id: 'conv-01',
      name: 'Nguyễn Ngọc Mai (Em họ)',
      phoneNumber: '0912.456.789',
      avatarColor: 'from-[#30D158] to-[#0A84FF]',
      timestamp: '18:50, 24 Th 7',
      previewText: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1-1',
          sender: 'Nguyễn Ngọc Mai',
          role: 'received',
          text: 'Anh Khang, chuyện mảnh đất 200m2 của ông nội tại sao anh dám tự ý làm giả giấy ủy quyền mang đi thế chấp ngân hàng? Tôi đã nhờ luật sư lập đơn tố cáo rồi!',
          timestamp: '18:35, 24 Th 7',
          attachment: {
            type: 'image',
            title: 'Don_to_cao_chiem_doat_dat_ong_noi.pdf',
            thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400'
          },
          isClue: true,
          clueTitle: 'Tranh chấp đất đai 200m² gia bảo',
          clueAnalysis:
            'Mai phát hiện Khang làm giả chữ ký ông nội trên giấy ủy quyền chiếm trọn suất đất giải tỏa đền bù.'
        },
        {
          id: 'm1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Đất ông để lại cho tao làm nơi thờ tự, mày đi lấy chồng rồi đừng có dòm ngó.',
          timestamp: '18:38, 24 Th 7'
        },
        {
          id: 'm1-3',
          sender: 'Nguyễn Ngọc Mai',
          role: 'received',
          text: 'Tối nay tôi với anh Vũ sẽ qua nhà anh nói chuyện cho rõ ràng. Anh trả lại 50% đất cho tôi!',
          timestamp: '18:45, 24 Th 7'
        },
        {
          id: 'm1-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
          timestamp: '18:50, 24 Th 7'
        }
      ]
    }
  ]
}
