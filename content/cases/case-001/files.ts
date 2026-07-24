import { RecoveredFile, Document } from '@/lib/types'

export const files001: Record<string, RecoveredFile[]> = {
  'dev-01': [
    { id: 'f1', filename: 'don_van_chuyen_cau_cang_9.pdf', kind: 'pdf', size: '420 KB', status: 'secured', integrity: 'ĐÃ XÁC THỰC' },
    { id: 'f2', filename: 'sao_luu_bi_hong_phan1.zip', kind: 'zip', size: '12.8 MB', status: 'corrupted', integrity: 'LỖI TÍNH TOÀN VẸN' },
    { id: 'f3', filename: 'anh_tang_vat_thu_giu.jpg', kind: 'image', size: '2.1 MB', status: 'secured', integrity: 'ĐÃ XÁC THỰC' }
  ]
}

export const documents001: Record<string, Document[]> = {
  'dev-01': [
    { id: 'n1', title: 'Chìa khóa Kho bãi', content: 'Chìa khóa được giấu dưới tấm ván sàn lỏng lẻo ở Kho bãi 12. Kiểm tra gần cầu dao điện ở bức tường phía bắc.', meta: 'GHI CHÚ GIẢI MÃ // 01' },
    { id: 'n2', title: 'Lịch trình Lô hàng [HỎNG]', content: '██████████████████████████████████████████████████████████████████████ tàu chở hàng rời cảng lúc 03:00 ██████████████████████████████', meta: 'GHI CHÚ GIẢI MÃ // 02', damaged: true }
  ]
}
