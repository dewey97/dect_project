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
      title: 'Ghi chép vị trí trốn tìm 1998 (Note n3)',
      content: 'Căn phòng phía Tây... khoang tủ gỗ âm tường... ký hiệu XE-CARD-000',
      meta: 'Phát hiện trong hộp sắt kỷ vật'
    }
  ]
}
