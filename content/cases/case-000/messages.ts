import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'conv-03',
      name: 'Trần Thị Hà',
      timestamp: '19:15',
      previewText: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà đấy!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // --- 21/07/2026 ---
        {
          id: 'm3-d1-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Hôm nay anh đi cắt tóc ở tiệm anh Tuấn đúng không? Em thấy sợi tóc mai rơi trên gối sáng nay ngắn hơn bình thường 1 phân...',
          timestamp: '21/07 • 14:10'
        },
        {
          id: 'm3-d1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Ừ anh tiện đường ghé gội đầu cắt tí thôi. Có thế em cũng để ý.',
          timestamp: '21/07 • 14:35'
        },
        {
          id: 'm3-d1-3',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Mọi thứ thuộc về anh em đều nhớ rất rõ. Từng sợi tóc, từng nốt ruồi trên lưng anh.',
          timestamp: '21/07 • 14:40'
        },
        // --- 22/07/2026 ---
        {
          id: 'm3-d2-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Chiếc cúc áo thứ hai trên sơ mi xanh của anh bị lỏng chỉ rồi, để tối em sang khâu lại. Anh tuyệt đối đừng để ai khác chạm tay vào áo anh nhé.',
          timestamp: '22/07 • 08:30'
        },
        {
          id: 'm3-d2-2',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Chiều nay em mới mang hũ trà hoa cúc sang đặt trên bàn uống nước. Tối nhớ hãm uống cho dễ ngủ, dạo này anh hay thức khuya lắm.',
          timestamp: '22/07 • 17:45'
        },
        {
          id: 'm3-d2-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Ừ anh thấy hũ trà rồi, đang uống thử đây.',
          timestamp: '22/07 • 19:50'
        },
        // --- 23/07/2026 ---
        {
          id: 'm3-d3-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh Khang hôm nay đi đâu từ chiều thế? Em đứng đợi trước ngõ mãi không thấy xe anh về.',
          timestamp: '23/07 • 18:20'
        },
        {
          id: 'm3-d3-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh đi gặp khách bốc họ, em đừng có rình trước cửa nhà anh nữa người ta dị nghị!',
          timestamp: '23/07 • 18:55'
        },
        // --- 24/07/2026 (Hôm nay) ---
        {
          id: 'm3-1',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh Khang ơi, tối nay anh có rảnh không? Mấy hôm nay anh bận việc gì mà gọi điện nghe máy ngập ngừng thế?',
          timestamp: '19:00'
        },
        {
          id: 'm3-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tối nay anh có việc bận giải quyết chuyện nhà đất với người ta, em ở nhà đi đừng sang.',
          timestamp: '19:08'
        },
        {
          id: 'm3-3',
          sender: 'Trần Thị Hà',
          role: 'received',
          text: 'Anh tại sao lại tránh mặt em? Đừng để em tìm tới nhà đấy!',
          timestamp: '19:15'
        }
      ]
    },
    {
      id: 'conv-05',
      name: 'Yến Nhi',
      timestamp: '20:40',
      previewText: 'Anh yêu nhớ book phòng view đồi thông ở Đà Lạt nhé...',
      recoveryProgress: 100,
      unread: true,
      messages: [
        // --- 22/07/2026 ---
        {
          id: 'm5-d1-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Cuối tuần này anh thu xong tiền đền bù đất là mình bay thẳng vào Đà Lạt nghỉ 1 tuần em nhé.',
          timestamp: '22/07 • 15:20'
        },
        {
          id: 'm5-d1-2',
          sender: 'Yến Nhi',
          role: 'received',
          text: 'Thật không đấy anh yêu? Hay lại hứa lèo như lần trước?',
          timestamp: '22/07 • 15:25'
        },
        {
          id: 'm5-d1-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh chuyển cọc tour 12 triệu cho bên du lịch rồi, vé máy bay sáng 25/7 xuất phát nhé.',
          timestamp: '22/07 • 15:30'
        },
        // --- 24/07/2026 (Hôm nay) ---
        {
          id: 'm5-1',
          sender: 'Yến Nhi',
          role: 'received',
          text: 'Anh Khang ơi, tối nay anh xử lý xong việc bán nhà chưa? Mai mình đi nốt tour Đà Lạt nhé?',
          timestamp: '20:38'
        },
        {
          id: 'm5-2',
          sender: 'Yến Nhi',
          role: 'received',
          text: 'Anh yêu nhớ book phòng view đồi thông ở Đà Lạt nhé, em chuẩn bị xong hết vali rồi đấy ❤️',
          timestamp: '20:40'
        }
      ]
    },
    {
      id: 'conv-01',
      name: 'Trần Ngọc Mai (Em họ)',
      timestamp: '18:50',
      previewText: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // --- 20/07/2026 ---
        {
          id: 'm1-d1-1',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Anh Khang, bên Ban quản lý dự án sắp chốt danh sách nhận đền bù đợt 1 rồi đấy. Căn nhà của ông nội anh tính chia thế nào?',
          timestamp: '20/07 • 09:15'
        },
        {
          id: 'm1-d1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Ông nội nuôi tôi từ nhỏ đến lớn, căn nhà đương nhiên để tôi thừa kế. Cô đi lấy chồng rồi đừng có hòng dòm ngó.',
          timestamp: '20/07 • 09:30'
        },
        // --- 24/07/2026 (Hôm nay) ---
        {
          id: 'm1-1',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Anh Khang, chuyện tờ di chúc của ông nội tại sao anh lại tự ý lấy về cất giữ? Phần tiền đền bù nhà đất bờ sông anh định nuốt riêng à?',
          timestamp: '18:35'
        },
        {
          id: 'm1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Bản di chúc ông để lại cho ai người đó giữ. Cô đừng có xía vào.',
          timestamp: '18:38'
        },
        {
          id: 'm1-3',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Anh đừng có coi thường vợ chồng tôi. Giấy tờ đất đứng tên ông nội chứ không phải tên một mình anh!',
          timestamp: '18:42'
        },
        {
          id: 'm1-4',
          sender: 'Trần Ngọc Mai',
          role: 'received',
          text: 'Tối nay tôi với anh Vũ sẽ qua nhà anh nói chuyện cho rõ ràng chuyện di chúc và mảnh đất bến sông. Anh đừng có giấu!',
          timestamp: '18:45'
        },
        {
          id: 'm1-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Có ngon thì cứ qua. Đừng có giở trò với tôi!',
          timestamp: '18:50'
        }
      ]
    },
    {
      id: 'conv-02',
      name: 'Lê Quang Vũ',
      timestamp: '19:05',
      previewText: 'Anh Khang, khoản nợ 350tr với chuyện số liệu đo đạc...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // --- 19/07/2026 ---
        {
          id: 'm2-d1-1',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, tiền lãi tháng này tôi xin khất thêm 5 ngày được không? Công trình đợt này bên địa chính chưa giải ngân kịp.',
          timestamp: '19/07 • 11:00'
        },
        {
          id: 'm2-d1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Khất con c... Hạn đến ngày nào nộp đủ ngày đó. Không thì liệu cái ghế cán bộ của chú.',
          timestamp: '19/07 • 11:15'
        },
        // --- 24/07/2026 (Hôm nay) ---
        {
          id: 'm2-1',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, chiều nay bên công ty đo đạc giục nộp hồ sơ giải tỏa đền bù rồi. Anh trả lại bản vẽ chuẩn cho tôi.',
          timestamp: '18:55'
        },
        {
          id: 'm2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Cứ báo số liệu khống lên 120m2 như tôi bảo đi. Chú mày còn thiếu nợ tôi 350 triệu đấy, quên rồi à?',
          timestamp: '18:58'
        },
        {
          id: 'm2-3',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Tôi làm vậy là vi phạm pháp luật! Anh ép tôi quá đáng vừa thôi!',
          timestamp: '19:02'
        },
        {
          id: 'm2-4',
          sender: 'Lê Quang Vũ',
          role: 'received',
          text: 'Anh Khang, khoản nợ 350tr với chuyện số liệu đo đạc bớt ép tôi đi. Tối nay vợ chồng tôi sang chốt hạ!',
          timestamp: '19:05'
        }
      ]
    },
    {
      id: 'conv-04',
      name: 'Hội Bạn Nhậu Bờ Sông (4)',
      timestamp: '22/07 • 21:05',
      previewText: 'Khang: Thôi tao chịu, đợt này chả hiểu sao cứ tầm 8h tối...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // --- 20/07/2026 ---
        {
          id: 'm4-d1-1',
          sender: 'Tuấn "Bia"',
          role: 'received',
          text: 'Tối thứ 6 tuần này làm bữa chia tay Tùng đi Hải Phòng nhé anh em.',
          timestamp: '20/07 • 16:00'
        },
        {
          id: 'm4-d1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Thằng Tùng về làm gì thế? Lâu lắm không gặp nó.',
          timestamp: '20/07 • 16:10'
        },
        // --- 22/07/2026 ---
        {
          id: 'm4-d2-1',
          sender: 'Tuấn "Bia"',
          role: 'received',
          text: 'Hôm qua ngồi nhậu với thằng Tùng nhắc lại mấy trò nghịch ngợm hồi nhỏ trong xóm cười đau cả ruột, công nhận vui vãi.',
          timestamp: '22/07 • 14:15'
        },
        {
          id: 'm4-d2-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Haha nhớ chứ, hồi đó tao trốn chỗ nào tụi mày tìm hoài không ra. Đỉnh nhất là cái vụ tao gài chốt nhốt trong tủ, không ai nghĩ ra luôn!',
          timestamp: '22/07 • 14:20'
        },
        {
          id: 'm4-d2-3',
          sender: 'Tuấn "Bia"',
          role: 'received',
          text: 'Vãi cả nhốt tủ, ác vl haha. Thôi tối nay ra làm vài quai tiếp không? Có mấy em bên trường múa sang giao lưu này!',
          timestamp: '22/07 • 21:00'
        },
        {
          id: 'm4-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Thôi tao chịu, đợt này chả hiểu sao cứ tầm 8h tối húp xong bát canh với cốc trà con Hà mang sang là mắt díp tịt lại, người nhũn như cọng bún, nằm bẹp giường không nhấc nổi cái chân...',
          timestamp: '22/07 • 21:03'
        },
        {
          id: 'm4-3',
          sender: 'Tuấn "Bia"',
          role: 'received',
          text: 'Haha, mày bị con Hà nó vắt kiệt sức rồi chứ gì, thôi ngủ đi ông tướng.',
          timestamp: '22/07 • 21:05'
        }
      ]
    }
  ]
}
