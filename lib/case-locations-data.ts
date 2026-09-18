/**
 * Master Dataset & Real-World GPS Routing Engine for Greater Hanoi Map
 * High-precision GPS coordinates, Road-snapped Navigation, Authentic Case Location Names
 */

export interface CaseLocation {
  id: string
  name: string
  shortName: string
  address: string
  category: 'residential' | 'food' | 'shopping' | 'transit' | 'finance' | 'public'
  x: number // Map coordinate X (0 - 2400) for vector fallback
  y: number // Map coordinate Y (0 - 2000) for vector fallback
  lat: number // Real-world GPS Latitude
  lng: number // Real-world GPS Longitude
  description: string
  rating?: number
  reviewCount?: number
  openingHours?: string
  plusCode?: string
  phone?: string
  categoryLabel?: string
  roadNodeId: string // Closest road network intersection node
}

export type TransportMode = 'motorbike' | 'car' | 'walk' | 'transit'

export interface RouteStep {
  instruction: string
  distance: string
  iconType: 'straight' | 'turn-left' | 'turn-right' | 'arrive'
  subInstruction?: string
}

export interface RouteResult {
  origin: CaseLocation
  destination: CaseLocation
  mode: TransportMode
  distanceKm: number
  distanceText: string
  durationMinutes: number
  durationText: string
  trafficStatus: 'good' | 'moderate' | 'slow'
  viaRoute: string
  points: { x: number; y: number }[]
  latLngs: [number, number][] // Real-world coordinates [lat, lng] for Leaflet
  steps: RouteStep[]
  // Alternative Route (Gray line in real Google Maps)
  alternativePoints?: { x: number; y: number }[]
  alternativeLatLngs?: [number, number][]
  alternativeDistanceText?: string
  alternativeDurationText?: string
  alternativeViaRoute?: string
  alternativeDurationMinutes?: number
  fareEstimate?: string
}

// ---------------------------------------------------------------------------
// 1. CLEAN CASE & LANDMARK LOCATIONS (Zero Real Street/District Name Leaks)
// ---------------------------------------------------------------------------
export const CASE_LOCATIONS: CaseLocation[] = [
  // --- Case Focus Core: Phân khu Cảng ---
  {
    id: 'loc-01',
    name: 'Số 14 Đường Bờ Sông',
    shortName: '14 Bờ Sông',
    address: 'Số 14, Đường Bờ Sông, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư',
    x: 1240,
    y: 1120,
    lat: 21.0058,
    lng: 105.8682,
    description: 'Nhà riêng dân cư tại Xóm Bờ Sông, cách gác chắn đường sắt 30m.',
    rating: 4.5,
    reviewCount: 18,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P28+3M Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-bosong-14'
  },
  {
    id: 'loc-02',
    name: 'Số 12 Đường Bờ Sông',
    shortName: '12 Bờ Sông',
    address: 'Số 12, Đường Bờ Sông, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư',
    x: 1220,
    y: 1145,
    lat: 21.0053,
    lng: 105.8686,
    description: 'Nhà dân cư liền kề sát vách, Xóm Bờ Sông.',
    rating: 4.8,
    reviewCount: 9,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P28+2M Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-bosong-south'
  },
  {
    id: 'loc-03',
    name: 'Số 10 Đường Bờ Sông',
    shortName: '10 Bờ Sông',
    address: 'Số 10, Đường Bờ Sông, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư',
    x: 1205,
    y: 1170,
    lat: 21.0048,
    lng: 105.8690,
    description: 'Nhà dân cư truyền thống, Xóm Bờ Sông.',
    rating: 4.2,
    reviewCount: 6,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P28+1M Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-bosong-south'
  },
  {
    id: 'loc-04',
    name: 'Bãi đất ven sông',
    shortName: 'Bãi đất ven sông',
    address: 'Khu bãi ven sông cũ, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'public',
    categoryLabel: 'Khu vực tự nhiên',
    x: 1285,
    y: 1240,
    lat: 21.0035,
    lng: 105.8715,
    description: 'Khu đất trống bồi ven bờ đê Sông Hồng.',
    rating: 4.0,
    reviewCount: 14,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P18+8K Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-desong-south'
  },
  {
    id: 'loc-05',
    name: 'Số 45 Đường Đoàn Kết',
    shortName: '45 Đoàn Kết',
    address: 'Số 45, Đường Đoàn Kết, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư',
    x: 1080,
    y: 1070,
    lat: 21.0085,
    lng: 105.8640,
    description: 'Nhà ở dân cư, mặt đường Đoàn Kết kết nối trung tâm phường.',
    rating: 4.4,
    reviewCount: 22,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P37+4G Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-doanket-west'
  },
  {
    id: 'loc-06',
    name: 'Số 8 Ngõ 12 Đường Bờ Kè',
    shortName: 'Số 8 Ngõ 12 Bờ Kè',
    address: 'Số 8, Ngõ 12, Đường Bờ Kè, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu nhà trọ',
    x: 1370,
    y: 1045,
    lat: 21.0092,
    lng: 105.8712,
    description: 'Khu nhà trọ tập thể sâu trong ngõ 12, cách đường sắt 1.2 km.',
    rating: 4.3,
    reviewCount: 31,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P39+9H Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-boke-ngo12'
  },
  {
    id: 'loc-07',
    name: 'Số 10 Ngõ 12 Đường Bờ Kè',
    shortName: 'Số 10 Ngõ 12 Bờ Kè',
    address: 'Số 10, Ngõ 12, Đường Bờ Kè, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư',
    x: 1390,
    y: 1060,
    lat: 21.0096,
    lng: 105.8718,
    description: 'Nhà dân cư ngõ 12 Đường Bờ Kè.',
    rating: 4.1,
    reviewCount: 8,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P39+8J Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-boke-ngo12'
  },
  {
    id: 'loc-08',
    name: 'Quán Bia 88',
    shortName: 'Quán Bia 88',
    address: 'Số 88, Đường Cầu Cảng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'food',
    categoryLabel: 'Quán bia & Ẩm thực bình dân',
    x: 1020,
    y: 1270,
    lat: 21.0035,
    lng: 105.8632,
    description: 'Quán bia hơi Hà Nội, đồ nhậu hải sản & món nhắm truyền thống.',
    rating: 4.6,
    reviewCount: 215,
    openingHours: 'Đang mở cửa • 10:00 - 23:30',
    phone: '024 3982 8888',
    plusCode: '7P16+9X Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-caucang-88'
  },
  {
    id: 'loc-09',
    name: 'Số 52 Phố Cầu Cảng',
    shortName: '52 Cầu Cảng',
    address: 'Số 52, Phố Cầu Cảng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Nhà ở kết hợp kinh doanh',
    x: 1070,
    y: 1225,
    lat: 21.0048,
    lng: 105.8645,
    description: 'Nhà ở riêng lẻ, mặt phố kinh doanh dịch vụ Cầu Cảng.',
    rating: 4.0,
    reviewCount: 12,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P17+5P Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-caucang-main'
  },
  {
    id: 'loc-10',
    name: 'Chợ Cầu Cảng',
    shortName: 'Chợ Cầu Cảng',
    address: 'Khu B, Chợ Dân sinh Cầu Cảng, TP. Hà Nội',
    category: 'shopping',
    categoryLabel: 'Chợ dân sinh',
    x: 1010,
    y: 1210,
    lat: 21.0051,
    lng: 105.8628,
    description: 'Chợ truyền thống bán buôn thực phẩm tươi sống, gia cầm, rau củ quả.',
    rating: 4.4,
    reviewCount: 380,
    openingHours: 'Đang mở cửa • 05:00 - 20:30',
    plusCode: '7P26+7R Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-caucang-main'
  },
  {
    id: 'loc-11',
    name: 'Bến xe khách Hoàng Long',
    shortName: 'Bến xe Hoàng Long',
    address: 'Bến đỗ xe khách liên tỉnh, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'transit',
    categoryLabel: 'Bến xe khách liên tỉnh',
    x: 1380,
    y: 1370,
    lat: 20.9980,
    lng: 105.8720,
    description: 'Điểm tập kết đón trả khách các tuyến xe khách đường dài miền Trung & Hải Phòng.',
    rating: 4.1,
    reviewCount: 1420,
    openingHours: 'Mở cửa cả ngày • Chuyến liên tục',
    phone: '024 3928 2828',
    plusCode: '7P19+6R Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-hoanglong-bus'
  },
  {
    id: 'loc-12',
    name: 'ATM Ngân hàng TMCP Việt Á',
    shortName: 'ATM Việt Á',
    address: 'Số 104, Đường Chiến Thắng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'finance',
    categoryLabel: 'Cây rút tiền tự động 24/7',
    x: 1420,
    y: 1270,
    lat: 21.0020,
    lng: 105.8680,
    description: 'Cây rút tiền tự động ngân hàng VietABank, có camera an ninh góc nhìn rộng.',
    rating: 4.2,
    reviewCount: 19,
    openingHours: 'Hoạt động 24/7',
    plusCode: '7P18+R6 Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-chienthang-bank'
  },
  {
    id: 'loc-13',
    name: 'Nhà nghỉ Hoàng Gia',
    shortName: 'Nhà nghỉ Hoàng Gia',
    address: 'Số 15, Ngõ 45 Đường Đoàn Kết, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Nhà nghỉ lưu trú',
    x: 1110,
    y: 1090,
    lat: 21.0070,
    lng: 105.8660,
    description: 'Cơ sở lưu trú tư nhân 4 tầng, cho thuê phòng theo giờ và qua đêm.',
    rating: 3.9,
    reviewCount: 45,
    openingHours: 'Mở cửa cả ngày • Lễ tân trực 24/24',
    phone: '024 3862 9999',
    plusCode: '7P38+RH Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-doanket-west'
  },
  {
    id: 'loc-14',
    name: 'Số 18 Phố Cầu Bươu',
    shortName: '18 Cầu Bươu',
    address: 'Số 18, Phố Cầu Bươu, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'residential',
    categoryLabel: 'Khu dân cư ngoại thành',
    x: 750,
    y: 1750,
    lat: 20.9554,
    lng: 105.8152,
    description: 'Khu dân cư ngoại thành phía Nam, giáp trục đường liên khu.',
    rating: 4.0,
    reviewCount: 15,
    openingHours: 'Mở cửa cả ngày',
    plusCode: '7P05+53 Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-caubuou-terminal'
  },
  {
    id: 'loc-15',
    name: 'Cty TNHH Vận tải Sông Hồng',
    shortName: 'Vận tải Sông Hồng',
    address: 'Số 102, Đường Ven Cảng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'public',
    categoryLabel: 'Dịch vụ vận tải logistics',
    x: 1400,
    y: 950,
    lat: 21.0115,
    lng: 105.8725,
    description: 'Văn phòng kinh doanh và điều vận sà lan hàng hóa đường thủy nội địa Phân khu Cảng.',
    rating: 4.4,
    reviewCount: 63,
    openingHours: '07:30 - 18:00',
    phone: '024 3829 5566',
    plusCode: '7P49+J2 Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-vantaish'
  },
  {
    id: 'loc-16',
    name: 'CLB Billiards X-Club',
    shortName: 'Billiards X-Club',
    address: 'Số 29, Phố Vọng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'food',
    categoryLabel: 'Câu lạc bộ thể thao giải trí',
    x: 1040,
    y: 1430,
    lat: 20.9982,
    lng: 105.8451,
    description: 'Hệ thống bàn bida Aileex tiêu chuẩn thi đấu, máy lạnh & đồ uống giải khát.',
    rating: 4.8,
    reviewCount: 160,
    openingHours: 'Đang mở cửa • 09:00 - 02:00',
    phone: '0988 123 456',
    plusCode: '7P18+72 Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-phovong'
  },
  {
    id: 'loc-17',
    name: 'Công an Phường Phân khu Cảng',
    shortName: 'Công an Phường',
    address: 'Số 02, Phố Cầu Cảng, Phường Phân khu Cảng, TP. Hà Nội',
    category: 'public',
    categoryLabel: 'Cơ quan hành chính nhà nước',
    x: 1140,
    y: 1140,
    lat: 21.0075,
    lng: 105.8655,
    description: 'Trụ sở tiếp công dân, đăng ký tạm trú và bảo vệ an ninh trật tự địa bàn.',
    rating: 4.6,
    reviewCount: 88,
    openingHours: 'Trực ban hình sự 24/7',
    phone: '024 3824 1133',
    plusCode: '7P38+26 Phân khu Cảng, Hà Nội',
    roadNodeId: 'node-doanket-east'
  },
  {
    id: 'loc-18',
    name: 'Sân bay Quốc tế Nội Bài (Nhà ga T1)',
    shortName: 'Sân bay Nội Bài T1',
    address: 'Nhà ga hành khách T1, Cảng Hàng không Quốc tế Nội Bài, TP. Hà Nội',
    category: 'transit',
    categoryLabel: 'Cảng hàng không quốc tế',
    x: 1180,
    y: 90,
    lat: 21.2212,
    lng: 105.8072,
    description: 'Nhà ga hành khách quốc nội T1, cách trung tâm 28 km qua trục cao tốc phía Bắc.',
    rating: 4.5,
    reviewCount: 8400,
    openingHours: 'Hoạt động 24/7',
    phone: '1900 636 535',
    plusCode: '9PQG+7P Nội Bài, Hà Nội',
    roadNodeId: 'node-noibai-airport'
  }
]

// ---------------------------------------------------------------------------
// 2. HAVERSINE DISTANCE HELPER
// ---------------------------------------------------------------------------
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ---------------------------------------------------------------------------
// 3. ROAD NETWORK GRAPH
// ---------------------------------------------------------------------------
export interface RoadNode {
  id: string
  x: number
  y: number
  lat: number
  lng: number
  name: string
}

export interface RoadEdge {
  from: string
  to: string
  streetName: string
  distanceKm: number
}

export const ROAD_NODES: Record<string, RoadNode> = {
  // --- Core Case Area: Đường Bờ Sông & Cần Chắn ---
  'node-bosong-14': { id: 'node-bosong-14', x: 1240, y: 1120, lat: 21.0058, lng: 105.8682, name: 'Ngõ 14 Bờ Sông' },
  'node-bosong-crossing': { id: 'node-bosong-crossing', x: 1245, y: 1100, lat: 21.0065, lng: 105.8678, name: 'Gác chắn đường sắt Bờ Sông' },
  'node-bosong-south': { id: 'node-bosong-south', x: 1215, y: 1180, lat: 21.0048, lng: 105.8690, name: 'Bờ Sông Nam' },
  'node-desong-south': { id: 'node-desong-south', x: 1270, y: 1250, lat: 21.0035, lng: 105.8715, name: 'Bãi đất Bờ Sông' },
  'node-bosong-north': { id: 'node-bosong-north', x: 1255, y: 1040, lat: 21.0080, lng: 105.8685, name: 'Bờ Sông Bắc' },

  // --- Đường Đoàn Kết ---
  'node-doanket-east': { id: 'node-doanket-east', x: 1150, y: 1100, lat: 21.0075, lng: 105.8655, name: 'Ngã ba Đoàn Kết - Bờ Sông' },
  'node-doanket-west': { id: 'node-doanket-west', x: 1070, y: 1080, lat: 21.0085, lng: 105.8640, name: 'Số 45 Đoàn Kết' },

  // --- Phố Cầu Cảng ---
  'node-caucang-junction': { id: 'node-caucang-junction', x: 1120, y: 1160, lat: 21.0060, lng: 105.8650, name: 'Ngã tư Cầu Cảng' },
  'node-caucang-main': { id: 'node-caucang-main', x: 1060, y: 1210, lat: 21.0048, lng: 105.8645, name: 'Chợ Cầu Cảng' },
  'node-caucang-88': { id: 'node-caucang-88', x: 1020, y: 1260, lat: 21.0035, lng: 105.8632, name: 'Quán Bia 88 Cầu Cảng' },

  // --- Đường Bờ Kè & Ngõ 12 ---
  'node-boke-junction': { id: 'node-boke-junction', x: 1320, y: 1040, lat: 21.0088, lng: 105.8698, name: 'Ngã ba Bờ Kè' },
  'node-boke-ngo12': { id: 'node-boke-ngo12', x: 1370, y: 1060, lat: 21.0092, lng: 105.8712, name: 'Đầu Ngõ 12 Bờ Kè' },
  'node-vantaish': { id: 'node-vantaish', x: 1390, y: 960, lat: 21.0115, lng: 105.8725, name: 'Cảng Sông Hồng' },

  // --- Tuyến Vành Đai Phân Khu Cảng ---
  'node-vanhdai2-junction': { id: 'node-vanhdai2-junction', x: 1330, y: 1200, lat: 21.0015, lng: 105.8700, name: 'Nút giao Vành đai 2' },
  'node-chienthang-bank': { id: 'node-chienthang-bank', x: 1420, y: 1270, lat: 21.0020, lng: 105.8680, name: 'Đường Chiến Thắng' },
  'node-hoanglong-bus': { id: 'node-hoanglong-bus', x: 1380, y: 1370, lat: 20.9980, lng: 105.8720, name: 'Bến xe Hoàng Long' },

  // --- Tuyến Tây Nam: Phố Vọng & Cầu Bươu ---
  'node-phovong': { id: 'node-phovong', x: 1020, y: 1420, lat: 20.9982, lng: 105.8451, name: 'Phố Vọng' },
  'node-giaiphong-south': { id: 'node-giaiphong-south', x: 920, y: 1560, lat: 20.9780, lng: 105.8390, name: 'Đại lộ Phía Nam' },
  'node-caubuou-junction': { id: 'node-caubuou-junction', x: 820, y: 1680, lat: 20.9620, lng: 105.8250, name: 'Ngã ba Cầu Bươu' },
  'node-caubuou-terminal': { id: 'node-caubuou-terminal', x: 750, y: 1750, lat: 20.9554, lng: 105.8152, name: 'Số 18 Cầu Bươu' },

  // --- Tuyến Phía Bắc: Nội Bài Highway (28 km) ---
  'node-city-center': { id: 'node-city-center', x: 1180, y: 880, lat: 21.0285, lng: 105.8542, name: 'Trục Trung tâm Nội thành' },
  'node-westlake-east': { id: 'node-westlake-east', x: 1120, y: 640, lat: 21.0560, lng: 105.8280, name: 'Đường Ven Hồ' },
  'node-nhattan-bridge-south': { id: 'node-nhattan-bridge-south', x: 1140, y: 440, lat: 21.0850, lng: 105.8150, name: 'Đầu Cầu Phía Bắc' },
  'node-nhattan-bridge-north': { id: 'node-nhattan-bridge-north', x: 1220, y: 320, lat: 21.1180, lng: 105.8120, name: 'Cuối Cầu Phía Bắc' },
  'node-vonguyengiap-hwy': { id: 'node-vonguyengiap-hwy', x: 1200, y: 200, lat: 21.1650, lng: 105.8100, name: 'Trục Cao tốc Phía Bắc' },
  'node-noibai-airport': { id: 'node-noibai-airport', x: 1180, y: 100, lat: 21.2212, lng: 105.8072, name: 'Sân bay Quốc tế Nội Bài T1' }
}

export const ROAD_EDGES: RoadEdge[] = [
  // Bờ Sông segments
  { from: 'node-bosong-14', to: 'node-bosong-crossing', streetName: 'Đường Bờ Sông', distanceKm: 0.08 },
  { from: 'node-bosong-14', to: 'node-bosong-south', streetName: 'Đường Bờ Sông', distanceKm: 0.12 },
  { from: 'node-bosong-south', to: 'node-desong-south', streetName: 'Đường ven đê', distanceKm: 0.25 },
  { from: 'node-bosong-crossing', to: 'node-bosong-north', streetName: 'Đường Bờ Sông', distanceKm: 0.2 },
  { from: 'node-bosong-crossing', to: 'node-doanket-east', streetName: 'Đường Đoàn Kết', distanceKm: 0.3 },

  // Đoàn Kết
  { from: 'node-doanket-east', to: 'node-doanket-west', streetName: 'Đường Đoàn Kết', distanceKm: 0.4 },
  { from: 'node-doanket-east', to: 'node-caucang-junction', streetName: 'Phố Cầu Cảng', distanceKm: 0.3 },

  // Cầu Cảng
  { from: 'node-caucang-junction', to: 'node-caucang-main', streetName: 'Phố Cầu Cảng', distanceKm: 0.3 },
  { from: 'node-caucang-main', to: 'node-caucang-88', streetName: 'Phố Cầu Cảng', distanceKm: 0.5 },
  { from: 'node-caucang-88', to: 'node-phovong', streetName: 'Đường liên khu vực', distanceKm: 1.8 },

  // Bờ Kè & Ngõ 12
  { from: 'node-bosong-north', to: 'node-boke-junction', streetName: 'Đường Bờ Kè', distanceKm: 0.4 },
  { from: 'node-boke-junction', to: 'node-boke-ngo12', streetName: 'Ngõ 12 Bờ Kè', distanceKm: 0.35 },
  { from: 'node-boke-junction', to: 'node-vantaish', streetName: 'Đường Ven Cảng', distanceKm: 0.5 },

  // Bờ Sông to Vành đai
  { from: 'node-bosong-crossing', to: 'node-vanhdai2-junction', streetName: 'Đường nối Vành đai', distanceKm: 0.6 },
  { from: 'node-vanhdai2-junction', to: 'node-chienthang-bank', streetName: 'Đường Chiến Thắng', distanceKm: 0.5 },
  { from: 'node-vanhdai2-junction', to: 'node-hoanglong-bus', streetName: 'Đường Vành đai Phân khu', distanceKm: 0.9 },

  // Cầu Bươu
  { from: 'node-phovong', to: 'node-giaiphong-south', streetName: 'Đại lộ Phía Nam', distanceKm: 3.2 },
  { from: 'node-giaiphong-south', to: 'node-caubuou-junction', streetName: 'Đường liên khu Nam', distanceKm: 2.8 },
  { from: 'node-caubuou-junction', to: 'node-caubuou-terminal', streetName: 'Phố Cầu Bươu', distanceKm: 1.2 },

  // Bắc: Nội Bài Highway
  { from: 'node-bosong-north', to: 'node-city-center', streetName: 'Đường ven đê', distanceKm: 3.5 },
  { from: 'node-city-center', to: 'node-westlake-east', streetName: 'Đường Ven Hồ', distanceKm: 4.2 },
  { from: 'node-westlake-east', to: 'node-nhattan-bridge-south', streetName: 'Đường Võ Chí Công', distanceKm: 3.8 },
  { from: 'node-nhattan-bridge-south', to: 'node-nhattan-bridge-north', streetName: 'Cầu Phía Bắc (3.75 km)', distanceKm: 3.8 },
  { from: 'node-nhattan-bridge-north', to: 'node-vonguyengiap-hwy', streetName: 'Trục Cao tốc Phía Bắc', distanceKm: 6.5 },
  { from: 'node-vonguyengiap-hwy', to: 'node-noibai-airport', streetName: 'Đường vào Sân bay Nội Bài', distanceKm: 7.2 }
]

// ---------------------------------------------------------------------------
// 4. GRAPH PATHFINDING ALGORITHM (Dijkstra Shortest Path)
// ---------------------------------------------------------------------------
function findShortestPath(startNodeId: string, endNodeId: string): string[] {
  if (startNodeId === endNodeId) return [startNodeId]

  const graph: Record<string, { node: string; weight: number }[]> = {}
  Object.keys(ROAD_NODES).forEach((id) => (graph[id] = []))

  ROAD_EDGES.forEach((edge) => {
    if (graph[edge.from] && graph[edge.to]) {
      graph[edge.from].push({ node: edge.to, weight: edge.distanceKm })
      graph[edge.to].push({ node: edge.from, weight: edge.distanceKm })
    }
  })

  const distances: Record<string, number> = {}
  const previous: Record<string, string | null> = {}
  const unvisited = new Set<string>()

  Object.keys(ROAD_NODES).forEach((nodeId) => {
    distances[nodeId] = nodeId === startNodeId ? 0 : Infinity
    previous[nodeId] = null
    unvisited.add(nodeId)
  })

  while (unvisited.size > 0) {
    let current: string | null = null
    let minDistance = Infinity

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId]
        current = nodeId
      }
    })

    if (current === null || current === endNodeId || minDistance === Infinity) {
      break
    }

    unvisited.delete(current)

    const neighbors = graph[current] || []
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.node)) continue
      const alt = distances[current] + neighbor.weight
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt
        previous[neighbor.node] = current
      }
    }
  }

  const path: string[] = []
  let curr: string | null = endNodeId
  while (curr !== null) {
    path.unshift(curr)
    curr = previous[curr]
  }

  return path.length > 0 && path[0] === startNodeId ? path : [startNodeId, endNodeId]
}

// ---------------------------------------------------------------------------
// 5. CALCULATE ROUTE (Case-Consistent Route Engine)
// ---------------------------------------------------------------------------
export function calculateRoute(
  origin: CaseLocation,
  destination: CaseLocation,
  mode: TransportMode = 'motorbike'
): RouteResult {
  const directDistanceKm = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng)
  const distanceKm = Math.max(0.1, Math.round(directDistanceKm * 1.28 * 10) / 10)

  let speedKmH = 30
  switch (mode) {
    case 'walk':
      speedKmH = 4.8
      break
    case 'car':
      speedKmH = distanceKm > 10 ? 46 : 28
      break
    case 'transit':
      speedKmH = 24
      break
    case 'motorbike':
    default:
      speedKmH = distanceKm > 10 ? 38 : 30
      break
  }

  const durationMinutes = Math.max(1, Math.round((distanceKm / speedKmH) * 60))
  const distanceText = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`
  const durationText = durationMinutes < 60 ? `${durationMinutes} phút` : `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`

  const startNodeId = origin.roadNodeId || 'node-bosong-14'
  const endNodeId = destination.roadNodeId || 'node-boke-ngo12'
  const nodePath = findShortestPath(startNodeId, endNodeId)

  const points: { x: number; y: number }[] = []
  points.push({ x: origin.x, y: origin.y })
  nodePath.forEach((nodeId) => {
    const node = ROAD_NODES[nodeId]
    if (node) points.push({ x: node.x, y: node.y })
  })
  points.push({ x: destination.x, y: destination.y })

  const latLngs: [number, number][] = []
  latLngs.push([origin.lat, origin.lng])
  nodePath.forEach((nodeId) => {
    const node = ROAD_NODES[nodeId]
    if (node) latLngs.push([node.lat, node.lng])
  })
  latLngs.push([destination.lat, destination.lng])

  const altPoints: { x: number; y: number }[] = []
  altPoints.push({ x: origin.x, y: origin.y })
  const altOffset = (destination.x - origin.x > 0 ? -1 : 1) * 45
  altPoints.push({ x: origin.x + (destination.x - origin.x) * 0.35, y: origin.y + altOffset })
  altPoints.push({ x: origin.x + (destination.x - origin.x) * 0.7 + altOffset, y: destination.y - (destination.y - origin.y) * 0.25 })
  altPoints.push({ x: destination.x, y: destination.y })

  const altLatLngs: [number, number][] = []
  altLatLngs.push([origin.lat, origin.lng])
  const latDiff = destination.lat - origin.lat
  const lngDiff = destination.lng - origin.lng
  altLatLngs.push([origin.lat + latDiff * 0.4 + 0.003, origin.lng + lngDiff * 0.4 - 0.003])
  altLatLngs.push([origin.lat + latDiff * 0.75 - 0.002, origin.lng + lngDiff * 0.75 + 0.002])
  altLatLngs.push([destination.lat, destination.lng])

  const altDistanceKm = Math.round((distanceKm * 1.2) * 10) / 10
  const altDurationMinutes = durationMinutes + Math.max(2, Math.round(durationMinutes * 0.2))
  const alternativeDistanceText = `${altDistanceKm.toFixed(1)} km`
  const alternativeDurationText = `+${Math.max(2, Math.round(durationMinutes * 0.2))} phút`

  // Fictional / Case-consistent route descriptions (No real street name leaks)
  let viaRoute = 'Qua Đường Bờ Sông'
  let alternativeViaRoute = 'Qua Tuyến Đường Vành Đai Phân Khu'
  if ((origin.id === 'loc-01' && destination.id === 'loc-06') || (origin.id === 'loc-06' && destination.id === 'loc-01')) {
    viaRoute = 'Qua Đường Bờ Kè & Ngõ 12'
    alternativeViaRoute = 'Qua Phố Cầu Cảng & Đường Ven Sông'
  } else if (destination.id === 'loc-08') {
    viaRoute = 'Qua Phố Cầu Cảng'
    alternativeViaRoute = 'Qua Ngõ Đoàn Kết'
  } else if (destination.id === 'loc-18') {
    viaRoute = 'Qua Trục Cao Tốc Phía Bắc'
    alternativeViaRoute = 'Qua Tuyến Đường Tránh Phía Bắc'
  } else if (destination.id === 'loc-14') {
    viaRoute = 'Qua Trục Đường Nam Phân Khu'
    alternativeViaRoute = 'Qua Tuyến Đường Vành Đai'
  } else if (destination.id === 'loc-16') {
    viaRoute = 'Qua Phố Vọng & Trục Liên Khu'
    alternativeViaRoute = 'Qua Đường Vành Đai'
  } else {
    viaRoute = `Trục đường liên khu ${destination.shortName}`
    alternativeViaRoute = `Tuyến đường tránh`
  }

  const steps: RouteStep[] = [
    {
      instruction: `Bắt đầu từ ${origin.name}, đi theo hướng đường chính`,
      distance: `${Math.round(distanceKm * 200)} m`,
      iconType: 'straight',
      subInstruction: 'Đi thẳng theo hướng mũi tên'
    },
    {
      instruction: `Rẽ phải vào trục đường liên khu vực hướng về ${destination.shortName}`,
      distance: `${Math.round(distanceKm * 500)} m`,
      iconType: 'turn-right',
      subInstruction: `Theo biển chỉ dẫn vào ${viaRoute}`
    },
    {
      instruction: `Tiếp tục đi thẳng qua ${viaRoute}`,
      distance: `${Math.round(distanceKm * 250)} m`,
      iconType: 'straight',
      subInstruction: 'Giao thông thông thoáng'
    },
    {
      instruction: `Đến điểm đích: ${destination.name}`,
      distance: 'Đã đến',
      iconType: 'arrive',
      subInstruction: 'Điểm đến ở phía bên phải'
    }
  ]

  const fareEstimate = `${Math.max(15, Math.round(distanceKm * 12 + 10))}.000đ`

  return {
    origin,
    destination,
    mode,
    distanceKm,
    distanceText,
    durationMinutes,
    durationText,
    trafficStatus: distanceKm > 15 ? 'moderate' : 'good',
    viaRoute,
    points,
    latLngs,
    steps,
    alternativePoints: altPoints,
    alternativeLatLngs: altLatLngs,
    alternativeDistanceText,
    alternativeDurationText,
    alternativeViaRoute,
    alternativeDurationMinutes: altDurationMinutes,
    fareEstimate
  }
}
