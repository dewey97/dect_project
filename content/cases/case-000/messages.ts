import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-05',
      name: 'Bé Vy ❤️',
      phoneNumber: '0978.552.xxx',
      avatarColor: 'from-[#FF2D55] to-[#FF375F]',
      timestamp: '17:55',
      previewText: 'Nhớ lời anh đó nha! Em chuẩn bị xong hết vali rồi, sáng mai em đợi anh ở sân bay Nội Bài đấy! ✈️❤️',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm5-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh đang dồn nốt tiền cọc đất với mấy mối nợ bốc họ tối nay là cầm gọn hơn 2 tỷ tiền mặt. Sáng mai bay sớm vào với em nhé bé yêu.',
          timestamp: '24/07 • 17:30',
          status: 'Đã gửi • 17:30'
        },
        {
          id: 'm5-2',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Vé máy bay chuyến 06:15 sáng mai em book xong cả 2 vé rồi nhé anh yêu! Mà còn con bé người yêu cũ bám đuôi anh thì sao? Nó có biết anh đi không?',
          timestamp: '24/07 • 17:45',
          attachment: {
            type: 'image',
            title: 'Ve_may_bay_VN125_0615.png',
            thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400'
          }
        },
        {
          id: 'm5-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Kệ xác nó, con Hà phiền phức đấy anh tắt thông báo cả tuần nay rồi. Tối nay xong việc anh vứt sim là xong, vào trong đó nó tìm bằng mắt. Đời này anh chỉ cần em thôi ❤️',
          timestamp: '24/07 • 17:50',
          status: 'Đã gửi • 17:50',
          isClue: true,
          clueTitle: 'Động cơ gây án bùng nổ của Trần Thị Hà',
          clueAnalysis:
            'Khang ruồng rẫy Hà và gọi là "con phiền phức bám đuôi". Khi Hà lẻn vào nhà lúc 20:45 và dùng tay Khang mở khóa Touch ID chiếc iPhone này, đoạn chat độc địa này đã khiến cơn cuồng ghen của Hà bùng nổ dẫn đến hành vi sát hại lúc 21:00.'
        },
        {
          id: 'm5-4',
          sender: 'Bé Vy ❤️',
          role: 'received',
          text: 'Nhớ lời anh đó nha! Em chuẩn bị xong hết vali rồi, sáng mai em đợi anh ở sân bay Nội Bài đấy! ✈️❤️',
          timestamp: '24/07 • 17:55',
          status: 'Đã xem 17:56'
        }
      ]
    },
    {
      id: 'conv-03',
      name: 'Trần Thị Hà',
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
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh Khang ơi, sao hôm nay anh lại nói những lời như vậy với em? Anh đừng giận em nữa được không, mình gặp nhau nói chuyện đàng hoàng nhé anh...',
          timestamp: '18/07 • 22:10',
          status: 'Đã xem • Không trả lời'
        },
        {
          id: 'm3-d2-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Chiều nay em mới mang hũ trà hoa cúc sang đặt trên bàn uống nước. Tối nhớ hãm uống cho dễ ngủ, dạo này anh hay thức khuya lắm.',
          timestamp: '22/07 • 17:45',
          isClue: true,
          clueTitle: 'Hũ trà hoa cúc tẩm độc chuẩn bị trước',
          clueAnalysis:
            'Hà đã chủ động mang hũ trà hoa cúc (chứa nồng độ thảo dược an thần ức chế thần kinh) sang đặt sẵn trên bàn phòng khách từ 2 ngày trước để đầu độc làm suy yếu Khang.'
        },
        {
          id: 'm3-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh Khang ơi, tối nay em đem hũ trà hoa cúc mới sao sang cho anh nhé... anh nhớ uống rồi nghỉ sớm nhé.',
          timestamp: '24/07 • 19:15',
          status: '🔕 Đã gửi • Chưa xem (Đã tắt thông báo)'
        },
        {
          id: 'm3-voice',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: '[HỘP THƯ THOẠI] "Anh Khang à, sao em gọi mãi anh không nghe máy thế? Em đang ở phòng trọ xem phim một mình buồn quá... tí nữa em chạy qua với anh nhé..."',
          timestamp: '24/07 • 20:32',
          attachment: {
            type: 'audio',
            title: 'Thu_thoai_2032_Ha_loi_khai_gia.wav',
            duration: '0:18',
            audioClue:
              '⚠️ BẰNG CHỨNG PHÁ ÁN CHÍ MẠNG: Phía sau giọng nói thì thầm lọt rất rõ tiếng còi tàu hỏa diesel hú 2 hồi dài và tiếng chuông gác chắn đường sắt reo leng keng (khoảng cách < 30m). Địa điểm duy nhất thu được âm thanh này là gốc cây xoan trước ngõ nhà Khang (số 14 Bờ Sông), bóc trần hoàn toàn lời khai giả tạo của Hà là "ở phòng trọ ngõ 12 cách 1.2km xem phim".'
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
      name: 'Lê Quang Vũ',
      phoneNumber: '0988.20.09.91',
      avatarColor: 'from-[#0A84FF] to-[#5E5CE6]',
      timestamp: '24/07 • 18:15',
      previewText: 'Tối nay tôi chạy sang nhà anh, xin anh đừng làm to chuyện với gia đình vợ tôi...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm2-d1-1',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, tiền nợ 300 triệu cho tôi khất thêm mấy ngày được không? Tôi đang xoay vốn công trình.',
          timestamp: '19/07 • 11:00'
        },
        {
          id: 'm2-d1-2',
          sender: 'Khang',
          role: 'sent',
          text: '300 triệu tiền họ quá hạn từ ngày 20 rồi, mày bùng hẹn ở 45 Đoàn Kết thì đừng trách tao ném giấy nợ cho bố vợ mày xem mặt thằng rể quý!',
          timestamp: '23/07 • 14:22',
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
          id: 'm2-d2-1',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Tối nay tôi chạy sang nhà anh lúc 19:00, mình nói chuyện riêng xin anh đừng làm to chuyện với gia đình vợ tôi...',
          timestamp: '24/07 • 18:15',
          status: 'Đã xem • 18:20'
        }
      ]
    },
    {
      id: 'conv-01',
      name: 'Trần Ngọc Mai (Em họ)',
      phoneNumber: '0912.456.789',
      avatarColor: 'from-[#30D158] to-[#0A84FF]',
      timestamp: '24/07 • 18:50',
      previewText: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm1-1',
          sender: 'Trần Ngọc Mai',
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
          sender: 'Trần Ngọc Mai',
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
      name: '0913.882.901 (Số lạ - Thợ nề Tùng)',
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
    }
  ]
}
