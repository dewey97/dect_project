import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-05',
      name: 'Bé Vy ❤️',
      phoneNumber: '0978.552.109',
      avatarColor: 'from-[#FF2D55] to-[#FF375F]',
      timestamp: '20:35',
      previewText: 'Dạaaa, vậy sáng mai anh qua đón e nhé 😘😘',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm5-1',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Anh ơi em xếp đồ xong rồi nè 🥰 Mà anh đặt vé chưa ạaaa?',
          timestamp: '24/07 • 19:40'
        },
        {
          id: 'm5-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh đặt rồi cưng. Tối nay thu xếp nốt mấy việc còn lại là xong.',
          timestamp: '24/07 • 19:41',
          status: 'Đã gửi • 19:41'
        },
        {
          id: 'm5-3',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Hihi yêu anh nhất!! Thế còn chị Hà anh tính sao ? Em sợ chị ấy biết rồi lại làm loạn...🥹',
          timestamp: '24/07 • 19:41',
          attachment: {
            type: 'image',
            title: 'Ve_may_bay_VN125_0615.png',
            thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400'
          }
        },
        {
          id: 'm5-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Kệ con đó đi. Bám như đỉa. Anh block nó rồi mà nó đổi số gọi hoài. Chả hiểu sao mặt dày lì lợm thế',
          timestamp: '24/07 • 19:41',
          status: 'Đã gửi • 19:41',
          isClue: true,
          clueTitle: 'Động cơ gây án bùng nổ của Trần Thị Hà',
          clueAnalysis:
            'Khang ruồng rẫy Hà và gọi là "bám như đỉa, mặt dày lì lợm". Khi Hà lẻn vào nhà lúc 20:45 và dùng tay Khang mở khóa Touch ID chiếc iPhone này, đoạn chat độc địa này đã khiến cơn cuồng ghen của Hà bùng nổ dẫn đến hành vi sát hại lúc 21:00.'
        },
        {
          id: 'm5-5',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Thôi thì ít nhất chị í cũng thật lòng yêu anh 🤣',
          timestamp: '24/07 • 19:42'
        },
        {
          id: 'm5-6',
          sender: 'Khang',
          role: 'sent',
          text: 'Yêu gì mà yêu, anh chịu hết nổi rồi. Chỉ có bé mới hiểu anh thôi.',
          timestamp: '24/07 • 19:44',
          status: 'Đã gửi • 19:44'
        },
        {
          id: 'm5-7',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Dạaaa, vậy sáng mai anh qua đón e nhé 😘😘',
          timestamp: '24/07 • 20:35',
          status: 'Đã xem 20:36'
        }
      ]
    },
    {
      id: 'conv-03',
      name: 'Hà Kế Toán',
      phoneNumber: '0984.112.568',
      avatarColor: 'from-[#FF375F] to-[#AF52DE]',
      isMuted: true,
      timestamp: '20:32',
      previewText: '[Thư thoại 0:18] "Anh Khang à, sao em gọi mãi anh không nghe máy thế?..." (Lọt tiếng còi tàu)',
      recoveryProgress: 100,
      unread: true,
      messages: [
        {
          id: 'm3-d1-1',
          sender: 'Hà Kế Toán',
          role: 'received',
          text: 'Anh Khang ơi, hôm nay em nấu canh cua với rau đay, anh thích món đó mà. Để em mang sang cho anh nhé? Em biết anh hay quên ăn tối...',
          timestamp: '22/07 • 21:17'
        },
        {
          id: 'm3-d1-2',
          sender: 'Hà Kế Toán',
          role: 'received',
          text: 'Anh không trả lời à... Không sao, em để phần anh trong hộp cơm ở trước cửa nhé. Anh nhớ lấy vào ăn kẻo nguội.',
          timestamp: '22/07 • 22:03',
          status: 'Đã xem • Không trả lời'
        },
        {
          id: 'm3-d2-1',
          sender: 'Hà Kế Toán',
          role: 'received',
          text: 'Em thấy hộp cơm hôm qua anh đã lấy vào rồi 🥰 Vậy là anh có ăn phải không? Chiều nay em nghỉ sớm, hay để em ghé qua dọn nhà cho anh nh?',
          timestamp: '23/07 • 12:44',
          isClue: true,
          clueTitle: 'Hũ trà hoa cúc tẩm độc chuẩn bị trước',
          clueAnalysis:
            'Hà đã chủ động mang hũ trà hoa cúc (chứa nồng độ thảo dược an thần ức chế thần kinh) sang đặt sẵn trên bàn phòng khách từ 2 ngày trước để đầu độc làm suy yếu Khang.'
        },
        {
          id: 'm3-d2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Đừng có sang. Bận.',
          timestamp: '23/07 • 14:51',
          status: 'Đã gửi • 14:51'
        },
        {
          id: 'm3-1',
          sender: 'Hà Kế Toán',
          role: 'received',
          text: 'Anh ơi, em vừa sao xong mẻ trà hoa cúc mới, thơm lắm anh. Lát anh có ở nhà không, em mang qua cho anh nhé?',
          timestamp: '24/07 • 19:00',
          status: '🔕 Đã gửi • Chưa xem (Đã tắt thông báo)'
        },
        {
          id: 'm3-voice',
          sender: 'Hà Kế Toán',
          role: 'received',
          text: '[HỘP THƯ THOẠI] "Anh Khang à, sao em gọi mãi anh không nghe máy thế? Em đang ở phòng trọ xem phim một mình buồn quá... tí nữa em chạy qua với anh nhé..."',
          timestamp: '24/07 • 20:32',
          attachment: {
            type: 'audio',
            title: 'Thu_thoai_2032_Ha_loi_khai_gia.wav',
            duration: '0:18',
            audioClue:
              '⚠️ BẰNG CHỨNG PHÁ ÁN CHÍ MẠNG: Phía sau giọng nói thì thầm lọt rất rõ tiếng còi tàu hỏa diesel hú 2 hồi dài và tiếng chuông gác chắn đường sắt reo leng keng (khoảng cách < 30m). Địa điểm duy nhất thu được âm thanh này là gốc cây xoan trước ngõ nhà Khang (số 14 Đường Bờ Sông), bóc trần hoàn toàn lời khai giả tạo của Hà là "ở phòng trọ cách 1.2km xem phim".'
          },
          isClue: true,
          clueTitle: 'Vạch trần chứng cứ ngoại phạm giả của Hà',
          clueAnalysis:
            'Tạp âm tiếng còi tàu 20:32 là chìa khóa chứng minh Hà có mặt tại hiện trường lúc nạn nhân bị hạ sát.'
        }
      ]
    },
    {
      id: 'conv-02',
      name: '0967.452.183',
      phoneNumber: '0967.452.183',
      avatarColor: 'from-[#0A84FF] to-[#5E5CE6]',
      timestamp: '24/07 • 18:12',
      previewText: 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm2-d1-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Hạn 20 rồi mày không thấy lịch à. 300 triệu không phải 300 nghìn. Tắt máy trốn thì tao tìm đến tận nhà mày.',
          timestamp: '21/07 • 09:14'
        },
        {
          id: 'm2-d2-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Mày nghĩ tắt máy là xong à?',
          timestamp: '22/07 • 20:31'
        },
        {
          id: 'm2-d2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Ngày mai không gọi lại tao thì tao cho rải giấy nợ để cả phố biết mặt thằng rể quý nhà họ Nguyễn.',
          timestamp: '22/07 • 20:31',
          attachment: {
            type: 'image',
            title: 'Giay_vay_no_viet_tay_300tr.jpg',
            thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400'
          },
          isClue: true,
          clueTitle: 'Sổ nợ bốc họ 300 triệu của Vũ',
          clueAnalysis:
            'Khang dùng khoản nợ tín dụng đen 300 triệu ép Vũ vẽ khống bản trích đo đất từ 75m2 lên 120m2.'
        },
        {
          id: 'm2-d4-1',
          sender: 'Khang',
          role: 'sent',
          text: 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng. Không thì ngày mai tao ghé nhà máy thăm bố vợ mày luôn thể.',
          timestamp: '24/07 • 18:12',
          status: 'Đã gửi • 18:12'
        }
      ]
    },
    {
      id: 'conv-01',
      name: 'Nguyễn Ngọc Mai (Em họ)',
      phoneNumber: '0984.661.302',
      avatarColor: 'from-[#30D158] to-[#0A84FF]',
      timestamp: '24/07 • 18:50',
      previewText: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1-1',
          sender: 'Nguyễn Ngọc Mai',
          role: 'received',
          text: 'Anh Khang, chuyện mảnh đất 200m2 của ông nội tại sao anh dám tự ý làm giả giấy ủy quyền mang đi thế chấp ngân hàng? Tôi đã nhờ luật sư lập đơn tố cáo rồi!',
          timestamp: '24/07 • 18:35',
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
          timestamp: '24/07 • 18:38'
        },
        {
          id: 'm1-3',
          sender: 'Nguyễn Ngọc Mai',
          role: 'received',
          text: 'Tối nay tôi với anh Vũ sẽ qua nhà anh nói chuyện cho rõ ràng. Anh trả lại 50% đất cho tôi!',
          timestamp: '24/07 • 18:45'
        },
        {
          id: 'm1-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
          timestamp: '24/07 • 18:50'
        }
      ]
    },
    {
      id: 'conv-04',
      name: '0913.882.901',
      phoneNumber: '0913.882.901',
      avatarColor: 'from-[#FF9F0A] to-[#FF453A]',
      timestamp: '24/07 • 15:30',
      previewText: 'Tròn 30 năm rồi đó. M không có gì muốn nói với Huy à?',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm4-1',
          sender: '0913.882.901',
          role: 'received',
          text: 'Tròn 30 năm rồi đó. M không có gì muốn nói với Huy à?',
          timestamp: '24/07 • 15:30',
          attachment: {
            type: 'image',
            title: 'Chiec_coi_dong_Huy_1996.jpg',
            thumbnail: 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&q=80&w=400'
          },
          isClue: true,
          clueTitle: 'Ám hiệu ngày giỗ 30 năm bé Gia Huy',
          clueAnalysis:
            'Tin nhắn từ thợ nề Tùng khơi lại tai nạn ngạt khí tủ gỗ năm 1996 mà Khang chính là thủ phạm nhốt Huy dẫn đến cái chết thương tâm.'
        }
      ]
    },
    /* PRE-N-2 UNRELATED / REALISTIC LIFESTYLE MESSAGES (JULY 20-21, 2016) */
    {
      id: 'conv-06',
      name: 'Tuấn "Bia 88"',
      phoneNumber: '0936.888.712',
      avatarColor: 'from-[#FFD60A] to-[#FF9500]',
      timestamp: '20/07 • 18:45',
      previewText: 'Tối bận đi thu nợ rồi ông. Để bữa khác.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm6-1',
          sender: 'Tuấn "Bia 88"',
          role: 'received',
          text: 'Khang ơi, tối nay xem bóng đá ra làm vài cốc bia hơi phố cổ không ông? Lô bia hơi Hà Nội mới về mát lịm.',
          timestamp: '20/07 • 18:30'
        },
        {
          id: 'm6-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tối bận đi thu nợ rồi ông. Để bữa khác.',
          timestamp: '20/07 • 18:45',
          status: 'Đã gửi • 18:45'
        }
      ]
    },
    {
      id: 'conv-07',
      name: 'Giặt Khô Khâm Thiên',
      phoneNumber: '0912.998.112',
      avatarColor: 'from-[#5856D6] to-[#AF52DE]',
      timestamp: '21/07 • 15:20',
      previewText: 'Anh Khang ơi áo da với chăn bông của anh giặt khô xong rồi nhé...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm7-1',
          sender: 'Giặt Khô Khâm Thiên',
          role: 'received',
          text: 'Anh Khang ơi áo da với chăn bông của anh giặt khô xong rồi nhé, chiều tiện ghé 42 Khâm Thiên lấy hộ em.',
          timestamp: '21/07 • 15:20'
        }
      ]
    },
    {
      id: 'conv-08',
      name: 'VNPT_Notice',
      phoneNumber: 'VNPT',
      avatarColor: 'from-[#0A84FF] to-[#30D158]',
      timestamp: '21/07 • 08:00',
      previewText: '[Thông báo] Thue bao 0904888666 da thanh toan cuoc Internet...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm8-1',
          sender: 'VNPT_Notice',
          role: 'received',
          text: '[Thông báo] Thue bao 0904888666 da thanh toan cuoc Internet FiberVNN thang 06/2016 so tien 220.000d. Cam on Quy khach.',
          timestamp: '21/07 • 08:00'
        }
      ]
    },
    {
      id: 'conv-09',
      name: 'Viettel_KM',
      phoneNumber: '198',
      avatarColor: 'from-[#FF3B30] to-[#FF9500]',
      timestamp: '20/07 • 07:30',
      previewText: '[QC] Tu 00h-24h ngay 20/07/2016, Viettel KM 50% gia tri the nap...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm9-1',
          sender: 'Viettel_KM',
          role: 'received',
          text: '[QC] Tu 00h-24h ngay 20/07/2016, Viettel KM 50% gia tri the nap cho thue bao tra truoc (25% cong vao TK KM, 25% cong vao TK KM2). Chi tiet LH 198 (0d).',
          timestamp: '20/07 • 07:30'
        }
      ]
    },
    {
      id: 'conv-10',
      name: 'Anh Hùng Thợ Sửa',
      phoneNumber: '0989.123.456',
      avatarColor: 'from-[#636366] to-[#3A3A3C]',
      timestamp: '19/07 • 10:20',
      previewText: 'Tầm 4h chiều anh qua đi.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm10-1',
          sender: 'Anh Hùng Thợ Sửa',
          role: 'received',
          text: 'Khang ơi chiều mấy giờ chú có nhà để anh qua thay cái van ống nước bồn rửa bát?',
          timestamp: '19/07 • 10:15'
        },
        {
          id: 'm10-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tầm 4h chiều anh qua đi.',
          timestamp: '19/07 • 10:20',
          status: 'Đã gửi • 10:20'
        }
      ]
    },
    {
      id: 'conv-11',
      name: 'Garage Ô Tô Hà Đông',
      phoneNumber: '0904.333.222',
      avatarColor: 'from-[#FF9F0A] to-[#FF3B30]',
      timestamp: '18/07 • 14:00',
      previewText: 'Xe SH của anh thay dầu với bảo dưỡng phanh xong rồi nhé...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm11-1',
          sender: 'Garage Hà Đông',
          role: 'received',
          text: 'Xe SH của anh thay dầu với bảo dưỡng phanh xong rồi nhé, tổng hết 850k anh nhé.',
          timestamp: '18/07 • 14:00'
        }
      ]
    }
  ]
}
