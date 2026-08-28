import { TimelineEvent, ConclusionOption, Evaluation } from '@/lib/types'

export const timelineEvents001: TimelineEvent[] = [
  { id: 't1', text: '23:41 — Thomas nhận tin nhắn hẹn gặp tại Cầu cảng số 9' }
]

export const conclusionOptions001 = {
  suspects: [
    { id: 'marsh', title: 'V. Marsh', desc: 'Quản đốc kho bãi' }
  ],
  motives: [
    { id: 'smuggling', title: 'Buôn lậu container', desc: 'Sai lệch số lượng hàng hóa' }
  ],
  methods: [
    { id: 'kidnap', title: 'Bắt giữ tống tiền', desc: 'Tiêu hủy dấu vết' }
  ],
  evidenceList: [
    { id: 'EV-0104', title: 'Luồng chat lô hàng' }
  ]
}

export const evaluation001: Evaluation = {
  caseId: 'case-01',
  suspectName: 'V. Marsh',
  motiveTitle: 'Buôn lậu container',
  methodTitle: 'Bắt giữ tiêu hủy chứng cứ',
  radarScores: [
    { id: 'r1', name: 'Độ chính xác', score: 90, desc: 'Tốt' }
  ],
  strengths: 'Phát hiện sai lệch container.',
  weaknesses: 'Chưa có.',
  missedEvidence: 'Không có.',
  correctTimeline: ['23:41 — Tin nhắn hẹn gặp'],
  evidenceUsage: {
    used: ['EV-0104'],
    ignored: [],
    critical: ['EV-0104']
  }
}
