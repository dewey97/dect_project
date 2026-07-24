import { Suspect } from '@/lib/types'

export const suspects001: Suspect[] = [
  {
    id: 'foreman',
    caseId: 'case-001',
    name: 'Quản Đốc (The Foreman)',
    role: 'Giám sát Cầu cảng',
    background: 'Giám sát sắp xếp container tại Cầu cảng 9. Có chìa khóa của tất cả các kho bãi xung quanh.',
    alibi: 'Tuyên bố đã rời cảng lúc 22:00, nhưng thẻ quẹt cổng cho thấy có lượt vào lúc 23:45.',
    collected: true
  },
  {
    id: 'marsh',
    caseId: 'case-001',
    name: 'V. Marsh',
    role: 'Đại lý Hàng hóa Tàu biển',
    background: 'Quản lý cơ sở dữ liệu hóa đơn vận chuyển hàng hải. Nợ nần chồng chất do đầu cơ các hợp đồng bảo hiểm hàng hóa.',
    alibi: 'Đang làm việc chính thức tại văn phòng hành chính thuộc Căn hộ 6B.',
    collected: true
  },
  {
    id: 'unknown',
    caseId: 'case-001',
    name: 'Người Thuê Ẩn Danh',
    role: 'Biệt hiệu Căn hộ 6B',
    background: 'Thuê các khoang lưu trữ tạm thời dưới tên của V. Marsh.',
    alibi: 'Không thể định vị trong khoảng thời gian xảy ra vụ án.',
    collected: false
  }
]
