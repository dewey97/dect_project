import { Suspect } from '@/lib/types'

export const suspects000: Suspect[] = [
  {
    id: 'mai',
    caseId: 'case-000',
    name: 'Trần Ngọc Mai',
    role: 'Em họ Khang / Đồng thừa kế',
    background: '36 tuổi. Nghi ngờ Khang làm giả di chúc viết tay của ông nội nhằm chiếm toàn bộ tiền bồi thường đất đai.',
    alibi: 'Đột nhập tráo di chúc giả lấy bản thật đi giám định chữ viết trước khi án mạng xảy ra; có chứng cứ ngoại phạm từ văn phòng giám định và luật sư.',
    collected: true
  },
  {
    id: 'vu',
    caseId: 'case-000',
    name: 'Lê Quang Vũ',
    role: 'Chồng Mai / Cán bộ đo đạc khảo sát',
    background: '39 tuổi. Nợ tiền Khang do làm ăn thua lỗ (giấu Mai). Đã nhận tiền để đo khống thêm 45m2 đất cho Khang, bị Khang dùng bản vẽ gốc tống tiền đe dọa.',
    alibi: 'Đột nhập cửa sau vào buổi tối để trộm lại bản vẽ tiêu hủy chứng cứ gian lận, rời đi trước khi án mạng xảy ra.',
    collected: true
  },
  {
    id: 'tung',
    caseId: 'case-000',
    name: 'Tùng',
    role: 'Bạn cũ / Anh trai Gia Huy (Red Herring)',
    background: '35 tuổi. Bị Khang tống tiền và đe dọa vạch trần bí mật tai nạn của Gia Huy năm xưa nhằm ép ký giấy tờ ủy quyền thừa kế.',
    alibi: 'Khai báo không đến. Thực tế có đến xô xát gay gắt làm vỡ bộ bình trà thủy tinh và đẩy Khang bất tỉnh rồi hoảng sợ tháo chạy lúc 20:15, lầm tưởng mình lỡ tay đánh chết Khang.',
    collected: true
  },
  {
    id: 'ha',
    caseId: 'case-000',
    name: 'Trần Thị Hà',
    role: 'Bạn gái cũ của nạn nhân / THỦ PHẠM THỰC SỰ',
    background: '35 tuổi. Có tâm lý kiểm soát cuồng loạn méo mó. Sau khi bị Khang đòi chia tay và phớt lờ, Hà luôn âm thầm bám theo dõi nạn nhân.',
    alibi: 'Khai báo ở nhà cả tối. Thực tế lén vào nhà sau khi Tùng rời đi, thấy Khang ngất xỉu + phát hiện Khang có nhân tình mới nên dùng mảnh thủy tinh vỡ đâm chết nạn nhân lúc 21:00.',
    collected: true
  }
]
