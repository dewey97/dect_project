import { RecoveredFile, Document } from '@/lib/types'

export const files000: Record<string, RecoveredFile[]> = {
  'dev-00': [
    { id: 'f1', filename: 'don_xin_den_bu_dat.pdf', kind: 'pdf', size: '240 KB', status: 'secured', integrity: 'ĐÃ XÁC THỰC' }
  ],
  'dev-02': [],
  'dev-03': [
    { id: 'f2', filename: 'ban_do_dia_chinh_goc.pdf', kind: 'pdf', size: '1.2 MB', status: 'secured', integrity: 'ĐÃ XÁC THỰC' }
  ]
}

export const documents000: Record<string, Document[]> = {
  'dev-00': [
    { id: 'n1', title: 'Kế hoạch đàm phán', content: 'Kế hoạch ép các bên ký xác nhận: 1) Dùng bản di chúc viết tay để ép Mai ký ủy quyền. 2) Dùng bản vẽ sửa nhà gốc ép Vũ nâng tỉ lệ chia tiền đền bù lên 8-2. 3) Dùng chiếc còi đồng và trò trốn tìm năm xưa của Gia Huy ép Tùng và Hà giữ im lặng đồng thuận.', meta: 'Ghi chú cá nhân' }
  ],
  'dev-02': [
    { id: 'n2', title: 'Hoài nghi di chúc', content: 'Khang bỗng nhiên tìm thấy di chúc của ông nội sau tủ âm tường cũ. Chiếc hộp sắt đó tôi đã từng mở ra nhiều lần trước đây để tìm giấy tờ sửa nhà nhưng chưa từng thấy tờ di chúc nào cả. Nhất định hắn đã làm giả rồi bỏ vào sau.', meta: 'Nhật ký cá nhân' }
  ],
  'dev-03': [
    { id: 'n3', title: 'Biên bản thỏa thuận ngầm', content: 'Thống nhất đo vẽ thêm 45m2 đất lấn chiếm không rõ mốc giới cho nhà Khang để được chia 150 triệu sau khi giải ngân đền bù.', meta: 'Hồ sơ nháp' }
  ]
}
