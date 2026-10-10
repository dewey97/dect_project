import { RoomHotspot, WallPictureFrameConfig } from './types'

// ==========================================
// ROOM HOTSPOTS DEFINITION (8 CHUẨN ĐIỂM KHÁM XÉT HỒ SƠ VỤ ÁN)
// ==========================================
export const CRIME_SCENE_HOTSPOTS: RoomHotspot[] = [
  {
    id: 'spot-1',
    num: 1,
    shortName: 'Bàn trà & Chén vỡ',
    position: [0, 0.51, -2.4],
    targetCamera: {
      pos: [0, 1.1, -1.45],
      lon: 180,
      lat: -32,
      fov: 46
    },
    title: 'BÀN TRÀ PHÒNG KHÁCH — PHÍCH RẠNG ĐÔNG & CHÉN VỠ',
    caption: 'Ảnh hiện trường #01-KX: Ấm chén gốm vỡ trên sàn gạch và phích nước Rạng Đông',
    detail: 'Bộ ấm chén gốm vỡ trên sàn gạch bông, ghế đơn bị xô ngã lật nghiêng khoảng 40cm. Phích nước còn nóng chứng tỏ nạn nhân đã tiếp khách ít phút trước khi xảy ra vụ việc.',
    imageUrl: '/images/cases/case_000/avatar_khang.jpg'
  },
  {
    id: 'spot-2',
    num: 2,
    shortName: 'Tủ tivi & Vết cạy',
    position: [0, 1.15, 3.25],
    targetCamera: {
      pos: [0, 1.35, 1.8],
      lon: 0,
      lat: -6,
      fov: 48
    },
    title: 'TỦ TIVI GỖ & TIVI CRT 90S (ĐỐI DIỆN BÀN NƯỚC)',
    caption: 'Ảnh hiện trường #02-KX: Tivi CRT thập niên 90 và dấu vết tác động ngoại lực',
    detail: 'Tủ tivi đặt đối diện trực diện bộ bàn ghế trường kỷ. Màn hình tivi CRT bám lớp bụi mỏng bị xê dịch. Khung tủ gỗ có vết cạy trầy xước mới ở ngăn kéo dưới — nghi can đã lục soát tìm kiếm tài sản hoặc di thư.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg'
  },
  {
    id: 'spot-3',
    num: 3,
    shortName: 'Tủ gỗ lim 1996',
    position: [-3.8, 1.35, 2.58],
    targetCamera: {
      pos: [-2.2, 1.45, 1.6],
      lon: 301,
      lat: -3,
      fov: 50
    },
    title: 'KHE TỦ GỖ LIM GÓC PHÒNG — VỤ ÁN TRỐN TÌM 1996',
    caption: 'Ảnh hiện trường #03-KX: Khe tủ hé mở có dấu vết người ẩn nấp quan sát và kỷ vật bi kịch 1996',
    detail: 'Khe tủ gỗ lim hé mở khoảng 5cm, then cài sắt đã gỉ sét. Bên trong phát hiện dấu vải cọ xát và dấu vân tay mờ — có người đã nấp bên trong quan sát toàn bộ diễn biến. Trên nóc tủ hằn vết đập bàn tay kích động.',
    imageUrl: '/images/cases/case_000/wardrobe_eyes.jpg'
  },
  {
    id: 'spot-4',
    num: 4,
    shortName: 'Cửa sổ ray tàu',
    position: [2.8, 1.70, 0.5],
    targetCamera: {
      pos: [1.4, 1.62, 0.5],
      lon: 90,
      lat: 2,
      fov: 48
    },
    title: 'GÓC CỬA SỔ PHÍA ĐÔNG — HƯỚNG ĐƯỜNG RAY TÀU',
    caption: 'Ảnh hiện trường #04-KX: Góc nhìn trực diện qua chấn song cửa sổ ra cột đèn tín hiệu đường sắt (150m)',
    detail: 'Từ cửa sổ phòng khách nhìn thẳng ra cột đèn ray tàu cách 150m trong đêm tĩnh mịch. Thời điểm 20:30 đêm xảy ra vụ án, tiếng còi tàu hỏa rúc lớn trùng khớp với bản thu âm trong máy tính của Khang.',
    imageUrl: '/images/cases/case_000/trontim.jpg'
  },
  {
    id: 'spot-5',
    num: 5,
    shortName: 'Cửa chính & Thềm',
    position: [-1.8, 0.35, 3.9],
    targetCamera: {
      pos: [-1.8, 1.35, 2.6],
      lon: 0,
      lat: -33,
      fov: 50
    },
    title: 'CỬA CHÍNH NAM (BÊN TRÁI TIVI) — BẬC THỀM & GỐC XOAN',
    caption: 'Ảnh hiện trường #05-KX: Dấu vết phấn hoa xoan bám dính trên thềm gạch',
    detail: 'Cửa chính 2 cánh gỗ lim mở toang nằm bên trái tủ tivi. Bậc thềm còn lưu lại bột phấn hoa xoan bám dính. Ngoài sân, dưới gốc cây xoan cổ thụ có dấu chân đế giày nữ size 37.',
    imageUrl: '/images/cases/case_000/photo_cheating_sms.jpg'
  },
  {
    id: 'spot-6',
    num: 6,
    shortName: 'Giỏ rác cửa',
    position: [-2.85, 0.45, 3.42],
    targetCamera: {
      pos: [-2.55, 1.15, 2.7],
      lon: 336,
      lat: -42,
      fov: 42
    },
    title: 'GIỎ RÁC CẠNH CỬA RA VÀO — CUỐNG VÉ XE & KHĂN GIẤY',
    caption: 'Ảnh hiện trường #06-KX: Cuống vé xe khách liên tỉnh bị vò nát dưới đáy',
    detail: 'Dưới đáy giỏ rác đặt sát mép cửa chính thu giữ 01 cuống vé xe khách liên tỉnh tuyến Hà Nội — Nam Định có ghi thời gian xuất bến, cùng mẩu khăn giấy dính son dưỡng và bột phấn hoa xoan.',
    imageUrl: '/images/cases/case_000/cuong_ve_xe_tung.png'
  },
  {
    id: 'spot-7',
    num: 7,
    shortName: 'Giường ngủ & Bùa yêu',
    position: [-3.7, 0.70, -3.1],
    targetCamera: {
      pos: [-3.7, 1.35, -1.8],
      lon: 180,
      lat: -27,
      fov: 45
    },
    title: 'GIƯỜNG NGỦ GIAN TRONG — LÁ BÙA YÊU TRONG GỐI',
    caption: 'Ảnh hiện trường #07-KX: Ruột gối nằm phòng ngủ bị rạch khóa kéo giấu bùa yếm',
    detail: 'Trong ruột gối bông phát hiện 01 lá bùa vải đỏ gấp hình tam giác ghi họ tên Khang & Hà bằng mực son, buộc kèm lọn tóc bằng chỉ đỏ — minh chứng sự cuồng yêu mù quáng của Trần Thị Hà.',
    imageUrl: '/images/cases/case_000/photo-reinvestigation-room-realistic.jpg'
  },
  {
    id: 'spot-8',
    num: 8,
    shortName: 'Khung ảnh 1996',
    position: [0.0, 2.15, -3.70],
    targetCamera: {
      pos: [0.0, 1.65, -2.0],
      lon: 180,
      lat: 16,
      fov: 48
    },
    title: 'BỘ KHUNG ẢNH KỶ NIỆM XÓM BỜ SÔNG HÈ 1996',
    caption: 'Ảnh hiện trường #08-KX: Bức ảnh 5 đứa trẻ xóm Bờ Sông hè 1996 và đồng hồ cơ',
    detail: 'Khung ảnh gỗ treo tường chụp bức ảnh kỷ niệm hè 1996: Tùng (sẹo chữ V ở chân mày) ôm em trai Gia Huy đeo còi đồng trước ngực. Bên cạnh là đồng hồ cơ quả lắc truyền thống.',
    imageUrl: '/images/cases/case_000/trontim.jpg'
  }
]

// ==========================================
// WALL PICTURE FRAMES CONFIGURATION
// ==========================================
export const WALL_PICTURE_FRAMES: WallPictureFrameConfig[] = [
  {
    id: 'frame-1',
    label: 'Gia đình Văn hóa',
    subtitle: 'UBND Phường Phân Khu Cảng',
    imageUrl: '',
    position: [-1.4, 2.15, -3.72],
    width: 0.95,
    height: 0.68,
    tilt: -0.015
  },
  {
    id: 'frame-2',
    label: 'Kỷ niệm Hè 1996',
    subtitle: '5 Đứa Trẻ Xóm Bờ Sông',
    imageUrl: '/images/cases/case_000/trontim.jpg',
    position: [0.0, 2.15, -3.72],
    width: 1.15,
    height: 0.80,
    tilt: 0.01
  },
  {
    id: 'frame-3',
    label: 'Bằng Khen',
    subtitle: 'Năm 1994',
    imageUrl: '',
    position: [1.4, 2.15, -3.72],
    width: 0.95,
    height: 0.68,
    tilt: 0.012
  }
]
