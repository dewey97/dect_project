import { RecoveredFile, Document } from '@/lib/types'

export const files000: Record<string, RecoveredFile[]> = {
  'dev-00': [
    {
      id: 'f-01',
      filename: '01_bao_cao_kham_nghiem_tu_thi.pdf',
      kind: 'pdf',
      size: '2.4 MB',
      status: 'secured',
      integrity: '100%'
    },
    {
      id: 'f-02',
      filename: '02_bien_ban_kham_nghiem_hien_truong.pdf',
      kind: 'pdf',
      size: '1.8 MB',
      status: 'secured',
      integrity: '100%'
    },
    {
      id: 'f-08',
      filename: '08_di_chuc_ong_noi_gia_mao.pdf',
      kind: 'pdf',
      size: '1.2 MB',
      status: 'secured',
      integrity: '100%'
    },
    {
      id: 'f-12',
      filename: '12_bao_cao_phap_y_bo_sung_va_loi_khai_ha_lo_loi.pdf',
      kind: 'pdf',
      size: '3.1 MB',
      status: 'secured',
      integrity: '100%'
    }
  ]
}

export const documents000: Record<string, Document[]> = {
  'dev-00': [
    {
      id: 'doc-01',
      title: 'Ghi chép vị trí trốn tìm 1996 (Note n3)',
      content: 'Căn phòng phía Tây... khoang tủ gỗ âm tường... ký hiệu XE-CARD-000. Tròn 30 năm rồi, đêm nào cũng nằm mơ thấy bóng thằng Huy...',
      meta: 'Ghi chú cá nhân • 12/07/2016'
    },
    {
      id: 'doc-02',
      title: 'Danh sách nợ bốc họ & Lịch gom tiền mặt',
      content: '1. Tiền cọc đất Bờ Sông (Nhận từ khách): 2,100,000,000đ\n2. Nợ Lê Quang Vũ (Vay nóng bốc họ): 300,000,000đ (Khấu trừ vào bản vẽ trích đo khống)\n3. Nợ F88 thế chấp xe máy: 45,000,000đ\n==> Tối 24/7 gom sạch tiền mặt, 06:15 sáng 25/7 bay vào Sài Gòn với Vy.',
      meta: 'Ghi chú cá nhân • 22/07/2016'
    },
    {
      id: 'doc-03',
      title: 'Lịch trình trốn vào Sài Gòn với Vy',
      content: 'Chuyến bay VN125 Hà Nội (HAN) - Tân Sơn Nhất (SGN) lúc 06:15 sáng 25/7.\nThuê nhà trọ khu Tân Bình (Phường 2), đổi SIM điện thoại mới ngay khi hạ cánh.\nTuyệt đối không nghe máy hay trả lời tin nhắn của Trần Thị Hà.',
      meta: 'Ghi chú cá nhân • 23/07/2016'
    },
    {
      id: 'doc-04',
      title: 'Ghi nhớ tranh chấp đất 200m² nhà ông nội',
      content: 'Giấy ủy quyền đứng tên Khang đã nộp ngân hàng thế chấp. Con Mai có luật sư dọa kiện tố cáo làm giả chữ ký. Cần ép Vũ ký xác nhận trích đo gấp trước 25/7.',
      meta: 'Ghi chú cá nhân • 24/07/2016'
    }
  ]
}
