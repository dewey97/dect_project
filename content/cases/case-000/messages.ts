import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    {
      id: 'chat-mai',
      name: 'Trần Ngọc Mai (Em họ)',
      timestamp: '14:20',
      previewText: 'Tôi sẽ khiến anh không lấy được một đồng nào từ căn nhà này!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        { id: 'm-mai-1', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Mai, di chúc viết tay của ông nội để lại căn nhà cho tao là thật. Mày đừng có gây sự.', timestamp: '10:05' },
        { id: 'm-mai-2', sender: 'Trần Ngọc Mai', role: 'received', text: 'Nực cười. Ông nội chưa bao giờ nói sẽ để lại nhà cho anh. Chữ ký trông có vẻ giống nhưng từ ngữ thửa đất không đúng thời đó đâu. Tôi biết thừa anh làm trò gì.', timestamp: '10:12' },
        { id: 'm-mai-3', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Bản gốc đang nằm trong hộp sắt tủ âm tường. Mày không ký giấy ủy quyền nhận đền bù thì cũng chả được chia đồng nào đâu.', timestamp: '10:20' },
        { id: 'm-mai-4', sender: 'Trần Ngọc Mai', role: 'received', text: 'Tôi đe dọa anh lần cuối, tôi sẽ khiến anh không lấy được một đồng nào từ căn nhà này!', timestamp: '14:20' }
      ]
    },
    {
      id: 'chat-vu',
      name: 'Lê Quang Vũ (Đo đạc)',
      timestamp: '16:45',
      previewText: 'Anh đừng ép tôi vào đường cùng!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        { id: 'm-vu-1', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Vũ, hồ sơ đo đạc hiện trạng căn sau nhà ghi nhận xong chưa?', timestamp: '15:30' },
        { id: 'm-vu-2', sender: 'Lê Quang Vũ', role: 'received', text: 'Tôi đã lách luật ghi nhận diện tích lấn chiếm phía sau là sử dụng ổn định cho nhà anh rồi. Nhớ chia tiền phần tôi như đã hứa.', timestamp: '15:35' },
        { id: 'm-vu-3', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Tôi thay đổi ý định rồi, tôi lấy 8 phần, anh 2 phần thôi. Không đồng ý thì bản vẽ sửa nhà gốc tôi gửi thẳng cho cơ quan thanh tra. Để xem anh có mất việc không.', timestamp: '16:00' },
        { id: 'm-vu-4', sender: 'Lê Quang Vũ', role: 'received', text: 'Khang, anh tống tiền tôi đấy à? Bản vẽ đó anh để đâu? Đừng ép tôi vào đường cùng!', timestamp: '16:45' }
      ]
    },
    {
      id: 'chat-tung',
      name: 'Tùng (Bạn cũ)',
      timestamp: '18:10',
      previewText: 'Mày im miệng đi Khang!',
      recoveryProgress: 100,
      unread: false,
      messages: [
        { id: 'm-tung-1', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Tùng, Hà, tụi mày nhớ chiếc còi đồng và trò trốn tìm của thằng Gia Huy năm xưa không? Ký xác nhận đồng thừa kế cho tao nhanh lên, không tao nộp đống đồ chơi cũ của nó cho công an đấy.', timestamp: '17:50' },
        { id: 'm-tung-2', sender: 'Tùng', role: 'received', text: 'Mày im miệng đi Khang! Chuyện năm đó là tai nạn ngoài ý muốn, mày cũng có phần khóa cửa khoang tủ cơ mà!', timestamp: '18:05' },
        { id: 'm-tung-3', sender: 'Nguyễn Văn Khang', role: 'sent', text: 'Nhưng tao không sợ đi tù như tụi mày. Tối nay gặp tao ở căn nhà cũ để ký giấy.', timestamp: '18:10' }
      ]
    }
  ],
  'dev-02': [
    {
      id: 'chat-lawyer',
      name: 'Luật sư Minh',
      timestamp: '15:40',
      previewText: 'Đã chuyển bản gốc cho chuyên gia.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        { id: 'm-law-1', sender: 'Trần Ngọc Mai', role: 'sent', text: 'Anh Minh, tôi đã tráo bản sao vào hộp sắt của Khang và lấy bản di chúc gốc ra rồi. Gửi anh đi giám định chữ viết gấp giúp tôi.', timestamp: '11:15' },
        { id: 'm-law-2', sender: 'Luật sư Minh', role: 'received', text: 'Tôi đã chuyển bản gốc cho chuyên gia giám định chữ viết tư nhân. Họ báo kết quả ban đầu nét chữ rất giống ông nội nhưng phần mô tả đất đai viết bằng loại mực khác hoàn toàn, nghi là bị viết đè sau này.', timestamp: '15:40' }
      ]
    }
  ],
  'dev-03': [
    {
      id: 'chat-wife',
      name: 'Vợ',
      timestamp: '21:10',
      previewText: 'Tôi phải lấy lại bản vẽ gốc.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        { id: 'm-wife-1', sender: 'Vợ', role: 'received', text: 'Anh đang ở đâu đấy? Sao muộn thế chưa về ăn cơm?', timestamp: '20:30' },
        { id: 'm-wife-2', sender: 'Lê Quang Vũ', role: 'sent', text: 'Tôi đang quay lại khu giải tỏa căn nhà của thằng Khang. Tôi phải đột nhập tìm và lấy lại bản vẽ gốc trước khi nó gửi thanh tra, không là tôi mất hết sự nghiệp.', timestamp: '20:45' },
        { id: 'm-wife-3', sender: 'Vợ', role: 'received', text: 'Anh cẩn thận đấy, nhỡ nó bắt được thì sao.', timestamp: '21:00' },
        { id: 'm-wife-4', sender: 'Lê Quang Vũ', role: 'sent', text: 'Tôi lẻn vào cửa sau, chắc nó không biết đâu. Lấy xong tôi về ngay.', timestamp: '21:10' }
      ]
    }
  ]
}
