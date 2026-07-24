import { EvidenceDevice } from '@/lib/types'

export const devices001: EvidenceDevice[] = [
  {
    id: 'dev-01',
    caseId: 'case-001',
    kind: 'phone',
    label: 'Điện thoại Burner của Thomas',
    owner: 'Thomas Vance',
    locked: false,
    status: 'unlocked',
    evidenceId: 'EVID-4471-A',
    recoveryLevel: 98,
    lastUpdated: '19-07-2026 // 14:32',
    previewStats: 'TIN NHẮN // EMAIL // THƯ VIỆN ẢNH',
    pinLength: 4
  },
  {
    id: 'dev-02',
    caseId: 'case-001',
    kind: 'laptop',
    label: 'Máy trạm Vận đơn Hàng hóa',
    owner: 'V. Marsh',
    locked: true,
    status: 'locked',
    evidenceId: 'EVID-4471-B',
    recoveryLevel: 45,
    lastUpdated: '19-07-2026 // 11:15',
    previewStats: 'PHÂN VÙNG BỊ MÃ HÓA // SỔ SÁCH',
    pinLength: 6
  },
  {
    id: 'dev-03',
    caseId: 'case-001',
    kind: 'drive',
    label: 'Ổ đĩa Sao lưu Thu giữ',
    owner: 'Người Thuê Ẩn Danh',
    locked: true,
    status: 'locked',
    evidenceId: 'EVID-4471-C',
    recoveryLevel: 0,
    lastUpdated: '19-07-2026 // 09:20',
    previewStats: 'PHÂN VÙNG DỮ LIỆU THÔ'
  }
]
