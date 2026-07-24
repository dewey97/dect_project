import type {
  Case,
  DetectiveProfile,
  Device,
  Evidence,
  TraceCard,
} from './types'

/**
 * Các cấu trúc cố định được dịch sang tiếng Việt để đồng bộ toàn hệ thống.
 */

export const CASES: Case[] = [
  {
    id: 'case-01',
    code: 'NX-4471',
    title: 'Ánh Sáng Cảng Biển (The Harbor Lights)',
    logline: 'Một nhân viên bến cảng biến mất tại Cầu cảng số 9, để lại một chiếc điện thoại phụ bị mã hóa và nhật ký sai lệch hàng hóa.',
    briefing:
      'Thám tử, bạn được chỉ định dẫn đầu cuộc điều tra pháp y về sự biến mất của Thomas Vance, một nhân viên ghi chép sổ sách tại Cầu cảng số 9. Hãy kiểm tra thiết bị di động thu hồi được và lần theo các điểm sai lệch hàng hóa để tìm ra kẻ thủ ác.',
    objective: 'Giải mã tin nhắn điện thoại nạn nhân và tìm ra nghi phạm.',
    estimatedTime: '60-90 phút',
    status: 'active',
    difficulty: 2,
    progress: 45,
    location: 'Cảng phía Bắc, Phân khu Bến tàu 12',
    openedAt: '02:14',
  },
  {
    id: 'case-02',
    code: 'NX-5093',
    title: 'Tàn Tro Trong Kho Lưu Trữ',
    logline: 'Một thư ký hồ sơ cố tình phóng hỏa tiêu hủy nhầm hồ sơ vụ án.',
    briefing:
      'Một vụ cháy tại cơ quan lưu trữ thành phố đã thiêu rụi một tủ tài liệu duy nhất. Các dấu vết cho thấy đây là hành vi cố ý. Hãy phục hồi những gì kẻ phóng hỏa cố gắng xóa sạch.',
    objective: 'Khôi phục nội dung kho lưu trữ bị cháy và xác định nghi phạm.',
    estimatedTime: '90-120 phút',
    status: 'locked',
    difficulty: 3,
    progress: 0,
    location: 'Trung tâm Hành chính',
  },
  {
    id: 'case-03',
    code: 'NX-6620',
    title: 'Người Thuê Nhà Lặng Lẽ',
    logline: 'Căn hộ 6B đã để trống một năm nay. Nhưng ánh đèn bên trong lại nói điều ngược lại.',
    briefing:
      'Hàng xóm báo cáo có chuyển động trong một căn hộ được thuê bởi một người không tồn tại. Hãy truy tìm danh tính thực sự đứng sau hợp đồng thuê nhà.',
    objective: 'Điều tra Căn hộ 6B và xác định người thuê thực sự.',
    estimatedTime: '120-150 phút',
    status: 'locked',
    difficulty: 4,
    progress: 0,
    location: 'Rossmore Heights',
  },
  {
    id: 'case-xx',
    code: '████████',
    title: 'HỒ SƠ BẢO MẬT',
    logline: 'Quyền truy cập bị hạn chế cho đến khi tất cả các cuộc điều tra hiện trường kết thúc.',
    briefing: 'Hồ sơ vụ án này đã được niêm phong mật.',
    objective: 'Quyền truy cập bị hạn chế. Hoàn thành tất cả các vụ án đang hoạt động để tiếp tục.',
    estimatedTime: 'ĐÃ ẨN',
    status: 'sealed',
    difficulty: 5,
    progress: 0,
    hidden: true,
    location: 'ĐÃ ẨN',
  },
]

export const DEVICES: Device[] = [
  {
    id: 'dev-01',
    caseId: 'case-01',
    kind: 'phone',
    label: 'Điện thoại Burner của Thomas',
    owner: 'Thomas Vance',
    locked: false,
    status: 'unlocked',
    evidenceId: 'DEV-0144',
    recoveryLevel: 98,
    lastUpdated: '23:14',
    previewStats: 'Đã giải mã thành công phân vùng',
    pinLength: 4,
  },
  {
    id: 'dev-02',
    caseId: 'case-01',
    kind: 'laptop',
    label: 'Máy trạm Vận đơn Hàng hóa',
    owner: 'V. Marsh',
    locked: true,
    status: 'locked',
    evidenceId: 'DEV-0209',
    recoveryLevel: 45,
    lastUpdated: '12:45',
    previewStats: 'Cần xác thực mã Pin bảo mật',
    pinLength: 6,
  },
  {
    id: 'dev-03',
    caseId: 'case-01',
    kind: 'recorder',
    label: 'Máy ghi âm tang vật',
    owner: 'V. Marsh',
    locked: true,
    status: 'unlocking',
    evidenceId: 'DEV-0312',
    recoveryLevel: 40,
    lastUpdated: '01:05',
    previewStats: 'Đang brute-force giải mã hash...',
    pinLength: 6,
  },
  {
    id: 'dev-04',
    caseId: 'case-01',
    kind: 'drive',
    label: 'Ổ đĩa sao lưu USB',
    owner: 'Tủ đồ Cầu cảng số 9',
    locked: false,
    status: 'analyzing',
    evidenceId: 'DEV-0410',
    recoveryLevel: 80,
    lastUpdated: '02:10',
    previewStats: 'Đang khôi phục các khối bị xóa...',
  },
  {
    id: 'dev-05',
    caseId: 'case-01',
    kind: 'camera',
    label: 'Camera An ninh Bến cảng',
    owner: 'Cổng vào Kho bãi 12',
    locked: false,
    status: 'unlocked',
    evidenceId: 'DEV-0562',
    recoveryLevel: 100,
    lastUpdated: '03:22',
    previewStats: '1 video (Cầu cảng lúc nửa đêm)',
  },
]

export const EVIDENCE: Evidence[] = [
  {
    id: 'ev-01',
    caseId: 'case-01',
    deviceId: 'dev-02',
    kind: 'message',
    title: 'Luồng chat: "lô hàng"',
    preview: 'gặp tôi lúc 9 giờ. đừng mang điện thoại.',
    timestamp: '23:41',
    flagged: true,
    evidenceId: 'EV-0104',
    recoveredBy: 'DET. NIGHTJAR',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
  },
  {
    id: 'ev-02',
    caseId: 'case-01',
    deviceId: 'dev-03',
    kind: 'voice',
    title: 'Tệp ghi âm 004',
    preview: '00:38 — trò chuyện lầm bầm, tiếng hải âu ở nền',
    timestamp: '23:58',
    evidenceId: 'EV-0205',
    recoveredBy: 'DET. NIGHTJAR',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
  },
  {
    id: 'ev-03',
    caseId: 'case-01',
    deviceId: 'dev-01',
    kind: 'gps',
    title: 'Lịch sử định vị GPS',
    preview: '6 tọa độ giữa Cầu cảng 9 và Kho bãi 12',
    timestamp: '00:02',
    evidenceId: 'EV-0311',
    recoveredBy: 'DET. NIGHTJAR',
    integrityStatus: 'analyzing',
    chainOfCustody: 'LOGGED',
  },
  {
    id: 'ev-04',
    caseId: 'case-01',
    deviceId: 'dev-02',
    kind: 'email',
    title: 'Re: Sửa đổi bản vận đơn',
    preview: 'Số hiệu các container không khớp với sổ sách tại kho bãi...',
    timestamp: '18:20',
    evidenceId: 'EV-0402',
    recoveredBy: 'DET. NIGHTJAR',
    integrityStatus: 'secured',
    chainOfCustody: 'VERIFIED',
  },
]

export const TRACE_CARDS: TraceCard[] = [
  {
    id: 'trace-01',
    caseId: 'case-01',
    code: 'T-01',
    name: 'Quản Đốc (The Foreman)',
    category: 'suspect',
    description: 'Người cuối cùng ký sổ sách bến cảng trước khi xảy ra vụ án.',
    collected: true,
  },
  {
    id: 'trace-02',
    caseId: 'case-01',
    code: 'T-02',
    name: 'Kho Bãi 12 (Warehouse 12)',
    category: 'location',
    description: 'Nơi định vị GPS cuối cùng của Thomas Vance được đăng ký.',
    collected: true,
  },
  {
    id: 'trace-03',
    caseId: 'case-01',
    code: 'T-03',
    name: 'Chìa Khóa Đồng',
    category: 'object',
    description: 'Được thu hồi từ bao đựng điện thoại phụ. Không có ký hiệu.',
    collected: false,
  },
]

export const DETECTIVE_PROFILE: DetectiveProfile = {
  codename: 'NIGHTJAR',
  rank: 'Thám tử Hiện trường — Cấp II',
  badgeId: '0447-N',
  casesSolved: 1,
  totalCases: 4,
  averageRating: 3,
}

/* --- Accessors (async-shaped for a painless Supabase swap later) --- */

export async function getCases(): Promise<Case[]> {
  return CASES
}

export async function getActiveCase(): Promise<Case | undefined> {
  return CASES.find((c) => c.status === 'active')
}

export async function getDevices(caseId: string): Promise<Device[]> {
  return DEVICES.filter((d) => d.caseId === caseId)
}

export async function getEvidence(caseId: string): Promise<Evidence[]> {
  return EVIDENCE.filter((e) => e.caseId === caseId)
}

export async function getTraceCards(caseId: string): Promise<TraceCard[]> {
  return TRACE_CARDS.filter((t) => t.caseId === caseId)
}

export async function getProfile(): Promise<DetectiveProfile> {
  return DETECTIVE_PROFILE
}
