import { Evaluation, TimelineEvent, ConclusionOption } from '@/lib/types'

export const timelineEvents001: TimelineEvent[] = [
  { id: 't1', text: 'Sai lệch sổ sách hàng hóa tàu biển được ghi chép bởi nhân viên bến cảng.' },
  { id: 't2', text: 'Nhận được tin nhắn chỉ đạo nạn nhân đến Cầu cảng số 9 mà không mang điện thoại.' },
  { id: 't3', text: 'Cuộc trò chuyện thì thầm và giằng co được ghi lại gần cổng bến tàu.' },
  { id: 't4', text: 'Bộ định vị GPS điện thoại ghi lại tọa độ cuối cùng tại Kho bãi 12.' }
]

export const conclusionOptions001 = {
  suspects: [
    { id: 'foreman', name: 'Quản Đốc (The Foreman)', role: 'Giám sát Cầu cảng' },
    { id: 'marsh', name: 'V. Marsh', role: 'Đại lý Hàng hóa Tàu biển' },
    { id: 'unknown', name: 'Người Thuê Ẩn Danh', role: 'Biệt hiệu Căn hộ 6B' }
  ],
  motives: [
    { id: 'espionage', title: 'Gián điệp Doanh nghiệp', desc: 'Thu thập bất hợp pháp các bản vận đơn container cảng bị hạn chế.' },
    { id: 'silence', title: 'Bịt đầu mối Nhân chứng', desc: 'Thủ tiêu người thư ký đã phát hiện ra sai lệch sổ sách hàng hóa.' },
    { id: 'fraud', title: 'Gian lận Bảo hiểm', desc: 'Giả mạo một vụ cháy kho bãi để đòi tiền bồi thường bảo hiểm vận chuyển.' }
  ],
  methods: [
    { id: 'abduction', title: 'Bắt cóc tại Cầu cảng', desc: 'Phục kích nạn nhân sau khi yêu cầu vứt bỏ điện thoại di động.' },
    { id: 'arson', title: 'Phóng hỏa tiêu hủy', desc: 'Đốt các thư mục lưu trữ tài liệu quan trọng tại Trung tâm hành chính.' },
    { id: 'deletion', title: 'Xóa sạch phân vùng', desc: 'Xóa sạch các phân vùng của điện thoại bằng phương pháp brute-force.' }
  ],
  evidenceList: [
    { id: 'ev-01', code: 'EV-0104', title: 'Luồng chat: "lô hàng"' },
    { id: 'ev-02', code: 'EV-0205', title: 'Ghi âm 004 (Âm thanh Bến cảng)' },
    { id: 'ev-03', code: 'EV-0311', title: 'Lịch sử GPS Điện thoại' },
    { id: 'ev-04', code: 'EV-0402', title: 'Email Sửa đổi Vận đơn Hải quan' }
  ]
}

export const evaluation001: Evaluation = {
  caseId: 'case-001',
  suspectName: 'V. Marsh',
  motiveTitle: 'Gián điệp Doanh nghiệp',
  methodTitle: 'Bắt cóc tại Cầu cảng',
  radarScores: [
    { id: 'logic', name: 'Tư duy Logic', score: 85, desc: 'Suy luận logic đã cô lập thành công động cơ của V. Marsh và các mối liên hệ gian lận sổ sách hàng hóa.' },
    { id: 'obs', name: 'Khả năng Quan sát', score: 90, desc: 'Quan sát xuất sắc: Đã chỉ ra chính xác thời gian ra vào cổng cảng và tọa độ điện thoại phụ.' },
    { id: 'analysis', name: 'Phân tích Bằng chứng', score: 75, desc: 'Liên kết tốt vận đơn hàng hải và các bản ghi âm bến cảng. Tuy nhiên, các tệp ổ đĩa phụ vẫn chưa được kiểm tra.' },
    { id: 'timeline', name: 'Phục dựng Dòng thời gian', score: 95, desc: 'Sắp xếp trình tự thời gian cực kỳ chính xác. Đã giải mã thành công lộ trình di chuyển của nạn nhân.' },
    { id: 'strategy', name: 'Tư duy Chiến thuật', score: 80, desc: 'Tham chiếu chéo hiệu quả mã Trace trên bàn game trước khi thử vượt qua các mã khóa pin.' }
  ],
  strengths: 'Độ chính xác cao trong việc dựng dòng thời gian. Thiết lập đúng các liên kết quan trọng giữa tọa độ GPS và tín hiệu sóng điện thoại.',
  weaknesses: 'Chưa kiểm tra các bản nhật ký trên ổ đĩa phụ. Đưa ra kết luận khi chưa kiểm tra toàn bộ các khu vực tệp của điện thoại.',
  missedEvidence: 'Các phân vùng phục hồi khối dữ liệu bị xóa trên USB Flash Drive đã bị bỏ qua trước khi đóng hồ sơ.',
  correctTimeline: [
    '23:40 - Ghi nhận sai lệch hàng hóa trên tàu.',
    '23:41 - Nhận tin nhắn điện thoại hướng dẫn tới Cầu cảng 9.',
    '23:58 - Cuộc hội thoại âm thanh được ghi lại tại cổng cảng.',
    '00:02 - Tọa độ GPS cuối cùng được đăng ký tại Kho bãi 12.'
  ],
  evidenceUsage: {
    used: ['EV-0104', 'EV-0311'],
    ignored: ['EV-0402'],
    critical: ['EV-0205']
  }
}
