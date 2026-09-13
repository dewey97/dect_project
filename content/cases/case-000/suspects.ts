import { Suspect } from '@/lib/types'

export const suspects000: Suspect[] = [
  {
    id: 'mai',
    caseId: 'case-000',
    name: 'Nguyễn Ngọc Mai',
    role: 'Em họ nạn nhân',
    background: 'Tranh chấp 50% di sản đất 200m² của ông nội. Phát hiện Khang làm giả chữ ký đồ nét (tracing) mang thế chấp ngân hàng. Ném Đơn tố cáo xuống sàn rồi rời đi lúc 19:00.',
    alibi: 'Rời đi lúc 19:00 (khớp tiếng xe máy lúc nhạc Thời sự VTV1), về đến nhà 19:45, xem tivi đến khi mất cáp lúc 20:10.',
    collected: true
  },
  {
    id: 'vu',
    caseId: 'case-000',
    name: 'Lê Quang Vũ',
    role: 'Chồng Mai / Kỹ sư điện',
    background: 'Nợ Khang 300 triệu đồng tiền bốc họ giấu vợ, bị Khang đe dọa mách gia đình vợ. Nán lại xin hoãn nợ đến 19:25 rồi bắt xe ôm ra Quán Bia 88.',
    alibi: 'Đặt xe ôm lúc 19:25, đón lúc 19:30 ra Quán Bia 88 ngồi uống bia một mình đến 20:45 (thanh toán CK 195k lúc 20:45 cách hiện trường 3.8km).',
    collected: true
  },
  {
    id: 'tung',
    caseId: 'case-000',
    name: 'Nguyễn Thanh Tùng',
    role: 'Thợ nề / Bạn thời thơ ấu',
    background: 'Anh trai bé Gia Huy tử vong trong tủ gỗ năm 1996. Mang mẩu báo cũ sang bắt Khang ra mộ tạ tội lúc 20:00 ngày giỗ 30 năm, xô Khang ngã đập đầu ngất xỉu rồi bỏ đi lúc 20:15.',
    alibi: 'Rời hiện trường lúc 20:15 bắt xe ôm về phòng trọ Cầu Bươu, nhìn thấy nhân viên gác chắn chuẩn bị đón tàu 20:30.',
    collected: true
  },
  {
    id: 'ha',
    caseId: 'case-000',
    name: 'Trần Thị Hà',
    role: 'Kế toán / Bạn gái của Khang (HUNG THỦ)',
    background: 'Yêu Khang cuồng dại nhưng bị ruồng rẫy. Đứng rình dưới cây xoan từ 19:25, gửi voice 20:32 lọt còi tàu, lẻn vào lúc 20:45 thấy Khang ngất và phát hiện tin nhắn Khang hẹn bỏ trốn cùng Thảo Vy -> Đâm chết Khang lúc 21:00.',
    alibi: 'Khai ở phòng trọ xem phim bộ VTV3 cả tối (Bị bóc trần vì tối thứ Sáu VTV3 chỉ chiếu Gameshow, và voice 20:32 lọt còi tàu trước nhà Khang).',
    collected: true
  }
]
