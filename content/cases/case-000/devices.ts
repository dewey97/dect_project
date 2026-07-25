import { EvidenceDevice } from '@/lib/types'

export const devices000: EvidenceDevice[] = [
  {
    id: 'dev-00',
    caseId: 'case-000',
    kind: 'phone',
    label: 'Điện thoại của Khang',
    owner: 'Nguyễn Văn Khang',
    locked: false,
    status: 'unlocked',
    evidenceId: 'DEV-00-KHANG',
    recoveryLevel: 100,
    lastUpdated: '25-07-2026 // 09:00',
    previewStats: '3 cuộc trò chuyện SMS khôi phục',
    pinLength: 4
  },
  {
    id: 'dev-02',
    caseId: 'case-000',
    kind: 'phone',
    label: 'Điện thoại của Mai',
    owner: 'Trần Ngọc Mai',
    locked: true,
    status: 'locked',
    evidenceId: 'DEV-02-MAI',
    recoveryLevel: 80,
    lastUpdated: '25-07-2026 // 10:15',
    previewStats: 'Yêu cầu mở khóa bằng Checkpoint 1',
    pinLength: 6
  },
  {
    id: 'dev-03',
    caseId: 'case-000',
    kind: 'phone',
    label: 'Điện thoại của Vũ',
    owner: 'Lê Quang Vũ',
    locked: true,
    status: 'locked',
    evidenceId: 'DEV-03-VU',
    recoveryLevel: 75,
    lastUpdated: '25-07-2026 // 11:30',
    previewStats: 'Yêu cầu mở khóa bằng Checkpoint 2',
    pinLength: 6
  }
]
