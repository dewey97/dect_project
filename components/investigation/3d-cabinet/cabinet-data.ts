import { CaseFile, DrawerData } from './cabinet-types'

export const COLS = 10
export const ROWS = 6
export const TOTAL_DRAWERS = COLS * ROWS

export const CASE_TITLES = [
  'Vụ án Biệt thự Sương Mù',
  'Vật chứng Hiện trường #02',
  'Tài liệu Mật Dự án Omega',
  'Hồ sơ Độc tố Kali Xyanua',
  'Bản sao Nhật ký Nghi phạm',
  'Bản đồ Địa đạo Ngầm #09',
  'Giao dịch Ngân hàng Ẩn danh',
  'Mã hóa Tín hiệu Vô tuyến',
  'Mẫu ADN Đối soát Tội phạm',
  'Báo cáo Giám định Dấu vân tay',
  'Bản ghi Âm Cuộc gọi Đe dọa',
  'Chứng cứ Rửa tiền Quốc tế',
  'Hồ sơ Vụ án Cháy Kho Bãi',
  'Dữ liệu Định vị Xe Khả nghi',
  'Báo cáo Tử thi Nạn nhân X',
]

export const DRAWERS_3D_DATA: DrawerData[] = Array.from({ length: TOTAL_DRAWERS }).map((_, i) => {
  const row = Math.floor(i / COLS)
  const col = i % COLS
  const num = (i + 1).toString().padStart(2, '0')

  // Tính toán vị trí x, y để căn đều lưới 10 cột x 6 hàng
  const x = (col - (COLS - 1) / 2) * 2.35
  const y = ((ROWS - 1) / 2 - row) * 1.55
  const z = 0

  const titleTopic = CASE_TITLES[i % CASE_TITLES.length]
  const isHideAndSeek = i === 0
  const isDrawer04 = i === 3 || num === '04'
  const isMultiCaseVault = i === 35 || num === '36'

  return {
    id: `drawer-${num}`,
    label: isDrawer04
      ? 'DRAWER #04 // CHUYÊN ÁN MẬT'
      : isHideAndSeek
      ? 'Vụ án Trốn Tìm'
      : isMultiCaseVault
      ? 'KHO CHUYÊN ÁN TỔNG HỢP'
      : `${titleTopic} (Unit-${num})`,
    code: `UNIT-${num}`,
    position: [x, y, z],
    files: isDrawer04
      ? [
          {
            id: 'case-000',
            code: 'CASE #000',
            title: 'Trốn Tìm (1998)',
            date: '1998',
            summary: 'Hồ sơ lưu trữ các biên bản khám nghiệm, tài liệu lời khai và chứng cứ liên quan đến vụ tử vong nghi vấn của Nguyễn Văn Khang.',
            details: 'Thời lượng: 20-30 phút | Độ khó: Trung bình. Vết mực chưa khô và chiếc đồng hồ cát dừng lúc 22:15.',
            classification: 'SẴN SÀNG / READY',
            status: 'ready',
            estimatedTime: '20-30 phút',
            difficulty: 'Trung bình',
            validCodes: ['TEST-99', 'NX-4471', 'TRON-TIM', 'CASE-000'],
            caseUrl: '/activate',
            folderBgColor: '#d9a066',
          },
          {
            id: 'case-001',
            code: 'CASE #001',
            title: 'Bảo Bảo Trong Đêm (2004)',
            date: '2004',
            summary: 'Vụ án mất tích bí ẩn tại khu tập thể cũ năm 2004 liên quan đến những lá thư đe dọa không người gửi.',
            details: 'Thời lượng: 30-45 phút | Độ khó: Nâng cao. Nhận dạng mẫu dấu chân bùn và chìa khóa két sắt bị xáo trộn.',
            classification: 'SẴN SÀNG / READY',
            status: 'ready',
            estimatedTime: '30-45 phút',
            difficulty: 'Nâng cao',
            validCodes: ['TEST-99', 'CASE-001', 'BAO-BAO'],
            caseUrl: '/activate',
            folderBgColor: '#c98f55',
          },
          {
            id: 'case-002',
            code: 'CASE #002',
            title: 'Di Chúc Bị Đánh Tráo (2012)',
            date: '2012',
            summary: 'Tranh chấp tài sản thừa kế hàng tỷ đồng và cái chết bất thường của chủ tập đoàn bất động sản.',
            details: 'Thời lượng: 40-60 phút | Độ khó: Phức tạp. Bản di chúc thứ hai được tìm thấy dưới tấm lót nệm.',
            classification: 'BẢO MẬT / LOCKED',
            status: 'locked',
            estimatedTime: '40-60 phút',
            difficulty: 'Phức tạp',
            validCodes: ['CASE-002', 'DI-CHUC'],
            caseUrl: '/activate',
            folderBgColor: '#b87e45',
          },
          {
            id: 'case-003',
            code: 'CASE #003',
            title: 'Bóng Đêm Cầu Cảng (2007)',
            date: '2007',
            summary: 'Vụ án đắm tàu hàng vận tải và sự biến mất không dấu vết của viên thuyền trưởng cùng hòm niêm phong.',
            details: 'Thời lượng: 45-60 phút | Độ khó: Phức tạp. Bản sao nhật ký hải trình thu hồi dưới lòng sông.',
            classification: 'BẢO MẬT / LOCKED',
            status: 'locked',
            estimatedTime: '45-60 phút',
            difficulty: 'Phức tạp',
            validCodes: ['CASE-003', 'CAU-CANG'],
            caseUrl: '/activate',
            folderBgColor: '#a6723c',
          },
          {
            id: 'case-004',
            code: 'CASE #004',
            title: 'Tiếng Còi Lúc Nửa Đêm (1995)',
            date: '1995',
            summary: 'Những vụ cháy bí ẩn liên tiếp tại nhà máy dệt cũ liên quan đến bản hợp đồng chuyển nhượng lừa đảo.',
            details: 'Thời lượng: 50-70 phút | Độ khó: Chuyên gia. Phát hiện vi dải dung môi công nghiệp dễ cháy.',
            classification: 'TUYỆT MẬT / LOCKED',
            status: 'locked',
            estimatedTime: '50-70 phút',
            difficulty: 'Chuyên gia',
            validCodes: ['CASE-004', 'TIENG-COI'],
            caseUrl: '/activate',
            folderBgColor: '#966330',
          },
        ]
      : isHideAndSeek
      ? [
          {
            id: 'f-01-1',
            code: 'DOC-011',
            title: 'Báo cáo Hiện trường - Vụ án Trốn Tìm',
            date: '14/10/2024',
            summary: 'Nạn nhân biến mất bí ẩn lúc 22:00 trong biệt thự cổ khi đang chơi trò trốn tìm.',
            details: 'Phát hiện vết mực chưa khô và chiếc đồng hồ cát bị dừng lúc 22:15 phía sau bức tường bí mật.',
            classification: 'MẬT / RESTRICTED',
          },
          {
            id: 'f-01-2',
            code: 'DOC-012',
            title: 'Biên bản Tang vật - Chiếc Đồng Hồ Cổ & Mảnh Áo',
            date: '16/10/2024',
            summary: 'Thu giữ mảnh áo dính sơn đỏ và bức thư nặc danh có dấu niêm phong độc tố.',
            details: 'Phát hiện dải niêm phong có chứa hàm lượng dung môi công nghiệp mâu thuẫn lời khai.',
            classification: 'TUYỆT MẬT / TOP SECRET',
          },
          {
            id: 'f-01-3',
            code: 'DOC-013',
            title: 'Trích xuất Lời khai - Nghi phạm Vụ Trốn Tìm',
            date: '18/10/2024',
            summary: 'Lời khai mâu thuẫn của quản gia về tiếng động lạ sau bức tường hầm ngầm.',
            details: 'Đối tượng khai không hề xuống hầm nhưng dữ liệu dấu vân tay lại xuất hiện tại cửa hầm ngầm.',
            classification: 'NỘI BỘ / CONFIDENTIAL',
          },
        ]
      : isMultiCaseVault
      ? [
          {
            id: 'c-000',
            code: 'CASE #000',
            title: 'Trốn Tìm (Chuyên án 1998)',
            date: '1998',
            summary: 'Hồ sơ lưu trữ các biên bản khám nghiệm, tài liệu lời khai và chứng cứ liên quan đến vụ tử vong nghi vấn của Nguyễn Văn Khang.',
            details: 'Thời lượng phá án: 20-30 phút | Độ khó: Trung bình. Phát hiện bức tường bí mật đằng sau giá sách và chiếc đồng hồ cát nghẽn hạt.',
            classification: 'BẮT BUỘC / READY',
            estimatedTime: '20-30 phút',
            difficulty: 'Trung bình',
            caseUrl: '/activate',
            folderBgColor: '#d97706',
          },
          {
            id: 'c-001',
            code: 'CASE #001',
            title: 'Bảo Bảo Trong Đêm',
            date: '2001',
            summary: 'Biên bản điều tra vụ đột nhập căn biệt thự ngầm phía Tây thành phố trong đêm giông bão.',
            details: 'Thời lượng phá án: 30-45 phút | Độ khó: Khó. Nhận dạng mẫu dấu chân bùn và chìa khóa két sắt bị xáo trộn.',
            classification: 'BẢO MẬT / HIGH LEVEL',
            estimatedTime: '30-45 phút',
            difficulty: 'Khó',
            caseUrl: '/activate',
            folderBgColor: '#854d0e',
          },
          {
            id: 'c-002',
            code: 'CASE #002',
            title: 'Khách Sạn Hoàng Gia',
            date: '2005',
            summary: 'Bí ẩn vụ án gạt tay nắm cửa phòng 404 tại khách sạn xa xỉ Royal Grand Hotel.',
            details: 'Thời lượng phá án: 40-50 phút | Độ khó: Chuyên gia. Dữ liệu thẻ từ bị ghi đè và camera hành lang tắt đúng 3 phút.',
            classification: 'TUYỆT MẬT / TOP SECRET',
            estimatedTime: '40-50 phút',
            difficulty: 'Chuyên gia',
            caseUrl: '/activate',
            folderBgColor: '#1e3a8a',
          },
          {
            id: 'c-003',
            code: 'CASE #003',
            title: 'Sương Mù Trên Sông',
            date: '2010',
            summary: 'Chuyên án trinh thám theo vết chuyến sà lan ẩn danh trên dòng sông Đỏ lúc nửa đêm.',
            details: 'Thời lượng phá án: 25-35 phút | Độ khó: Trung bình. Bản sao hải trình và hộp đen định vị thu hồi dưới lòng sông.',
            classification: 'NỘI BỘ / CONFIDENTIAL',
            estimatedTime: '25-35 phút',
            difficulty: 'Trung bình',
            caseUrl: '/activate',
            folderBgColor: '#991b1b',
          },
        ]
      : [
          {
            id: `f-${num}-1`,
            code: `DOC-${num}1`,
            title: `Báo cáo Ban đầu - ${titleTopic}`,
            date: '14/10/2024',
            summary: `Tài liệu thu thập trong ngăn chứa mật mã số ${num}. Chứa các chỉ dấu hiện trường quan trọng.`,
            details: 'Dấu vết mẫu ADN thu được tại điểm đột nhập trùng khớp 99% với hồ sơ theo dõi quốc tế.',
            classification: 'MẬT / RESTRICTED',
          },
          {
            id: `f-${num}-2`,
            code: `DOC-${num}2`,
            title: `Biên bản Giám định Vật chứng #${num}`,
            date: '16/10/2024',
            summary: 'Kiểm tra dải băng keo niêm phong, phát hiện vi dải kim loại và vết ố hóa chất.',
            details: 'Phát hiện hàm lượng độc tố Kali Xyanua và dấu vết dung môi công nghiệp trên niêm phong.',
            classification: 'TUYỆT MẬT / TOP SECRET',
          },
          {
            id: `f-${num}-3`,
            code: `DOC-${num}3`,
            title: `Trích xuất Nhật ký Lời khai #${num}`,
            date: '18/10/2024',
            summary: 'Diễn biến lời khai nghi phạm lúc 3:15 sáng tại phòng thẩm vấn số 3.',
            details: 'Đối tượng có hành vi quanh co, nhưng mâu thuẫn trực tiếp với dữ liệu camera hành trình.',
            classification: 'NỘI BỘ / CONFIDENTIAL',
          },
        ],
  }
})
