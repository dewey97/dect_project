import { Suspect } from '@/lib/types'

export const suspects000: Suspect[] = [
  {
    id: 'mai',
    caseId: 'case-000',
    name: 'Trần Ngọc Mai',
    role: 'Em họ Khang / Đồng thừa kế',
    background: '36 tuổi. Nghi ngờ Khang làm giả di chúc viết tay của ông nội nhằm chiếm phần lớn tiền bồi thường giải phóng mặt bằng của căn nhà chung.',
    alibi: 'Đột nhập lấy di chúc thật đi giám định chữ viết trước khi án mạng xảy ra, có chứng cứ ngoại phạm từ văn phòng giám định và luật sư.',
    collected: true
  },
  {
    id: 'vu',
    caseId: 'case-000',
    name: 'Lê Quang Vũ',
    role: 'Nhân viên đo đạc khảo sát',
    background: '39 tuổi. Đã nhận tiền của Khang để mô tả hiện trạng đất sai lệch. Bị Khang tống tiền bằng bản vẽ gốc nên cố gắng tìm cách lấy lại tài liệu.',
    alibi: 'Có mặt tại bến xe/cây xăng vào khung giờ án mạng xảy ra, tuy nhiên camera an ninh ghi nhận từng quay lại căn nhà vào buổi tối để trộm tài liệu.',
    collected: true
  },
  {
    id: 'ha',
    caseId: 'case-000',
    name: 'Hà',
    role: 'Bạn thuở nhỏ của nạn nhân',
    background: 'Thuộc nhóm trẻ năm xưa liên quan đến cái chết của Gia Huy. Đột nhập lấy chiếc còi đồng của Huy khỏi hộp sắt để tránh bị Khang đe dọa ép buộc.',
    alibi: 'Về nhà trước khi Khang tử vong. Chỉ lấy đi chiếc còi và xóa tin nhắn liên quan.',
    collected: true
  },
  {
    id: 'tung',
    caseId: 'case-000',
    name: 'Tùng',
    role: 'Bạn thuở nhỏ / Thủ phạm',
    background: 'Bị Khang liên tục tống tiền và đe dọa vạch trần bí mật cái chết của Gia Huy năm xưa nhằm ép ký các giấy tờ thừa kế có lợi cho Khang.',
    alibi: 'Khai báo rời khỏi hiện trường sớm, tuy nhiên dấu vết chứng minh anh đã giằng co với Khang dẫn tới cú ngã chí mạng của nạn nhân, bỏ mặc thi thể và dàn dựng hiện trường giả.',
    collected: true
  }
]
