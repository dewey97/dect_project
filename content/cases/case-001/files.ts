import { RecoveredFile, Document } from '@/lib/types'

export const files001: Record<string, RecoveredFile[]> = {
  'dev-01': [
    {
      id: 'f-01',
      filename: 'manifest-dock-9.pdf',
      kind: 'pdf',
      size: '1.5 MB',
      status: 'secured',
      integrity: '100%'
    }
  ]
}

export const documents001: Record<string, Document[]> = {
  'dev-01': [
    {
      id: 'doc-01',
      title: 'Nhật ký vận đơn sai lệch',
      content: 'Container #4471 có bất thường về trọng lượng ghi nhận...',
      meta: 'Sổ sách kho bãi 12'
    }
  ]
}
