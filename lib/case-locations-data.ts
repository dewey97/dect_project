/**
 * Master Dataset & Real-World GPS Routing Engine for Greater Hanoi Map
 * Live CMS Synced with Google Sheets ('locations' tab)
 * Visual coordinates mapped to Figma Master Map (2474 x 1732)
 */

export type LocationCategory =
  | 'residential'
  | 'food'
  | 'shopping'
  | 'transit'
  | 'finance'
  | 'public'
  | 'crime_scene'
  | 'government'
  | 'entertainment'

export interface CaseLocation {
  id: string
  name: string
  shortName: string
  address: string
  category: LocationCategory
  categoryLabel?: string
  x: number // Map coordinate X on Figma Canvas (0 - 2474)
  y: number // Map coordinate Y on Figma Canvas (0 - 1732)
  lat: number // Real-world GPS Latitude
  lng: number // Real-world GPS Longitude
  description: string
  rating?: number
  reviewCount?: number
  openingHours?: string
  plusCode?: string
  phone?: string
  roadNodeId: string // Closest road network intersection node
  distanceFromScene?: string
  travelTime?: string
}

export interface SheetLocationRow {
  case_id?: string
  code?: string
  title?: string
  category?: string
  address?: string
  details?: string
  distance_from_scene?: string
  travel_time?: string
  position_x?: string | number
  position_y?: string | number
  [key: string]: unknown
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
  latLngs: [number, number][]
  steps: RouteStep[]
  alternativePoints?: { x: number; y: number }[]
  alternativeLatLngs?: [number, number][]
  alternativeDistanceText?: string
  alternativeDurationText?: string
  alternativeViaRoute?: string
  alternativeDurationMinutes?: number
  fareEstimate?: string
}

// ---------------------------------------------------------------------------
// 1. ROAD NETWORK NODES & SNAP REGISTRY
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
  // Core Case Corridor: Đường Bờ Sông & Cần Chắn
  'node-bosong-14': { id: 'node-bosong-14', x: 1240, y: 1120, lat: 21.0058, lng: 105.8682, name: 'Ngõ 14 Bờ Sông' },
  'node-bosong-crossing': { id: 'node-bosong-crossing', x: 1245, y: 1100, lat: 21.0065, lng: 105.8678, name: 'Gác chắn đường sắt Bờ Sông' },
  'node-bosong-south': { id: 'node-bosong-south', x: 1215, y: 1180, lat: 21.0048, lng: 105.8690, name: 'Bờ Sông Nam' },
  'node-desong-south': { id: 'node-desong-south', x: 1270, y: 1250, lat: 21.0035, lng: 105.8715, name: 'Bãi đất Bờ Sông' },
  'node-bosong-north': { id: 'node-bosong-north', x: 1255, y: 1040, lat: 21.0080, lng: 105.8685, name: 'Bờ Sông Bắc' },

  // Đường Đoàn Kết
  'node-doanket-east': { id: 'node-doanket-east', x: 1150, y: 1100, lat: 21.0075, lng: 105.8655, name: 'Ngã ba Đoàn Kết - Bờ Sông' },
  'node-doanket-west': { id: 'node-doanket-west', x: 1070, y: 1080, lat: 21.0085, lng: 105.8640, name: 'Số 45 Đoàn Kết' },

  // Phố Cầu Cảng
  'node-caucang-junction': { id: 'node-caucang-junction', x: 1120, y: 1160, lat: 21.0060, lng: 105.8650, name: 'Ngã tư Cầu Cảng' },
  'node-caucang-main': { id: 'node-caucang-main', x: 1060, y: 1210, lat: 21.0048, lng: 105.8645, name: 'Chợ Cầu Cảng' },
  'node-caucang-88': { id: 'node-caucang-88', x: 1020, y: 1260, lat: 21.0035, lng: 105.8632, name: 'Quán Bia 88' },

  // Đường Bờ Kè & Ngõ 12
  'node-boke-junction': { id: 'node-boke-junction', x: 1320, y: 1040, lat: 21.0088, lng: 105.8698, name: 'Ngã ba Bờ Kè' },
  'node-boke-ngo12': { id: 'node-boke-ngo12', x: 1370, y: 1060, lat: 21.0092, lng: 105.8712, name: 'Đầu Ngõ 12 Bờ Kè' },
  'node-vantaish': { id: 'node-vantaish', x: 1390, y: 960, lat: 21.0115, lng: 105.8725, name: 'Cảng Sông Hồng' },

  // Tuyến Vành Đai Phân Khu Cảng
  'node-vanhdai2-junction': { id: 'node-vanhdai2-junction', x: 1330, y: 1200, lat: 21.0015, lng: 105.8700, name: 'Nút giao Vành đai' },
  'node-chienthang-bank': { id: 'node-chienthang-bank', x: 1420, y: 1270, lat: 21.0020, lng: 105.8680, name: 'Đường Chiến Thắng' },
  'node-hoanglong-bus': { id: 'node-hoanglong-bus', x: 1380, y: 1370, lat: 20.9980, lng: 105.8720, name: 'Bến xe Hoàng Long' },

  // Tuyến Tây Nam: Phố Vọng & Cầu Bươu
  'node-phovong': { id: 'node-phovong', x: 1020, y: 1420, lat: 20.9982, lng: 105.8451, name: 'Phố Vọng' },
  'node-giaiphong-south': { id: 'node-giaiphong-south', x: 920, y: 1560, lat: 20.9780, lng: 105.8390, name: 'Đường liên khu Nam' },
  'node-caubuou-junction': { id: 'node-caubuou-junction', x: 820, y: 1680, lat: 20.9620, lng: 105.8250, name: 'Ngã ba Cầu Bươu' },
  'node-caubuou-terminal': { id: 'node-caubuou-terminal', x: 750, y: 1750, lat: 20.9554, lng: 105.8152, name: 'Số 18 Cầu Bươu' },

  // Tuyến Phía Bắc: Trục Trung tâm & Nội Bài
  'node-city-center': { id: 'node-city-center', x: 1180, y: 880, lat: 21.0285, lng: 105.8542, name: 'Trục Trung tâm' },
  'node-westlake-east': { id: 'node-westlake-east', x: 1120, y: 640, lat: 21.0560, lng: 105.8280, name: 'Đường Ven Hồ' },
  'node-nhattan-bridge-south': { id: 'node-nhattan-bridge-south', x: 1140, y: 440, lat: 21.0850, lng: 105.8150, name: 'Đầu Cầu Phía Bắc' },
  'node-nhattan-bridge-north': { id: 'node-nhattan-bridge-north', x: 1220, y: 320, lat: 21.1180, lng: 105.8120, name: 'Cuối Cầu Phía Bắc' },
  'node-vonguyengiap-hwy': { id: 'node-vonguyengiap-hwy', x: 1200, y: 200, lat: 21.1650, lng: 105.8100, name: 'Cao tốc Sân bay' },
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
  { from: 'node-vanhdai2-junction', to: 'node-hoanglong-bus', streetName: 'Đường Vành đai', distanceKm: 0.9 },

  // Cầu Bươu
  { from: 'node-phovong', to: 'node-giaiphong-south', streetName: 'Đại lộ Phía Nam', distanceKm: 3.2 },
  { from: 'node-giaiphong-south', to: 'node-caubuou-junction', streetName: 'Đường liên khu Nam', distanceKm: 2.8 },
  { from: 'node-caubuou-junction', to: 'node-caubuou-terminal', streetName: 'Phố Cầu Bươu', distanceKm: 1.2 },

  // Bắc: Nội Bài Highway
  { from: 'node-bosong-north', to: 'node-city-center', streetName: 'Đường ven đê', distanceKm: 3.5 },
  { from: 'node-city-center', to: 'node-westlake-east', streetName: 'Đường Ven Hồ', distanceKm: 4.2 },
  { from: 'node-westlake-east', to: 'node-nhattan-bridge-south', streetName: 'Đường nối Cầu Phía Bắc', distanceKm: 3.8 },
  { from: 'node-nhattan-bridge-south', to: 'node-nhattan-bridge-north', streetName: 'Cầu Phía Bắc (3.75 km)', distanceKm: 3.8 },
  { from: 'node-nhattan-bridge-north', to: 'node-vonguyengiap-hwy', streetName: 'Cao tốc liên tỉnh', distanceKm: 6.5 },
  { from: 'node-vonguyengiap-hwy', to: 'node-noibai-airport', streetName: 'Đường vào Sân bay Nội Bài', distanceKm: 7.2 }
]

// ---------------------------------------------------------------------------
// 2. LOCATION POSITION & ROAD SNAP CONFIG
// ---------------------------------------------------------------------------
interface LocationMeta {
  title: string
  address: string
  category: LocationCategory
  roadNodeId: string
  x: number
  y: number
  lat: number
  lng: number
  rating?: number
  reviewCount?: number
  openingHours?: string
  phone?: string
  plusCode?: string
}

export const LOCATION_METAS: Record<string, LocationMeta> = {
  // 1: Số 14 Đường Bờ Sông (Hiện trường chính) - Dot 1 trên MAP.png
  '1': { title: 'Số 14 Đường Bờ Sông', address: 'Số 14, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'crime_scene', roadNodeId: 'node-bosong-14', x: 853, y: 225, lat: 21.0058, lng: 105.8682, plusCode: '7P28+3M Phân khu Cảng, Hà Nội' },
  'loc-01': { title: 'Số 14 Đường Bờ Sông', address: 'Số 14, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'crime_scene', roadNodeId: 'node-bosong-14', x: 853, y: 225, lat: 21.0058, lng: 105.8682, plusCode: '7P28+3M Phân khu Cảng, Hà Nội' },

  // 2: Số 12 Đường Bờ Sông (Nhà bà Lụa) - Dot 2 trên MAP.png
  '2': { title: 'Số 12 Đường Bờ Sông', address: 'Số 12, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-bosong-south', x: 863, y: 241, lat: 21.0053, lng: 105.8686, plusCode: '7P28+2M Phân khu Cảng, Hà Nội' },
  'loc-02': { title: 'Số 12 Đường Bờ Sông', address: 'Số 12, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-bosong-south', x: 863, y: 241, lat: 21.0053, lng: 105.8686, plusCode: '7P28+2M Phân khu Cảng, Hà Nội' },

  // 3: Số 10 Đường Bờ Sông (Nhà cũ bố mẹ Tùng) - Dot 3 trên MAP.png
  '3': { title: 'Số 10 Đường Bờ Sông', address: 'Số 10, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-bosong-south', x: 864, y: 260, lat: 21.0048, lng: 105.8690, plusCode: '7P28+1M Phân khu Cảng, Hà Nội' },
  'loc-03': { title: 'Số 10 Đường Bờ Sông', address: 'Số 10, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-bosong-south', x: 864, y: 260, lat: 21.0048, lng: 105.8690, plusCode: '7P28+1M Phân khu Cảng, Hà Nội' },

  // 4: Bãi đất ven sông (Hiện trường 1996) - Dot 4 trên MAP.png
  '4': { title: 'Bãi đất ven sông', address: 'Khu bãi ven sông cũ, P. Phân khu Cảng, Hà Nội', category: 'public', roadNodeId: 'node-desong-south', x: 871, y: 192, lat: 21.0035, lng: 105.8715, plusCode: '7P18+8K Phân khu Cảng, Hà Nội' },
  'loc-04': { title: 'Bãi đất ven sông', address: 'Khu bãi ven sông cũ, P. Phân khu Cảng, Hà Nội', category: 'public', roadNodeId: 'node-desong-south', x: 871, y: 192, lat: 21.0035, lng: 105.8715, plusCode: '7P18+8K Phân khu Cảng, Hà Nội' },

  // 5: Số 45 Đường Đoàn Kết (Nhà Mai Vũ) - Dot 5 (Mai & Vũ) trên MAP.png
  '5': { title: 'Số 45 Đường Đoàn Kết', address: 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Hà Nội', category: 'residential', roadNodeId: 'node-doanket-west', x: 1094, y: 251, lat: 21.0085, lng: 105.8640, plusCode: '7P37+4G Cảng Đông, Hà Nội' },
  'loc-05': { title: 'Số 45 Đường Đoàn Kết', address: 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Hà Nội', category: 'residential', roadNodeId: 'node-doanket-west', x: 1094, y: 251, lat: 21.0085, lng: 105.8640, plusCode: '7P37+4G Cảng Đông, Hà Nội' },

  // 6: Số 8 Ngõ 12 Đường Bờ Kè (Phòng trọ Hà) - Dot 6 trên MAP.png
  '6': { title: 'Số 8 Ngõ 12 Đường Bờ Kè', address: 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-boke-ngo12', x: 883, y: 366, lat: 21.0092, lng: 105.8712, plusCode: '7P39+9H Phân khu Cảng, Hà Nội' },
  'loc-06': { title: 'Số 8 Ngõ 12 Đường Bờ Kè', address: 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-boke-ngo12', x: 883, y: 366, lat: 21.0092, lng: 105.8712, plusCode: '7P39+9H Phân khu Cảng, Hà Nội' },

  // 7: Quán Bia 88 - Dot 7 (Bia 88) trên MAP.png
  '7': { title: 'Quán Bia 88', address: 'Số 88, Đường Vĩnh Hà, P. Cảng Đông, Hà Nội', category: 'food', roadNodeId: 'node-caucang-88', x: 997, y: 229, lat: 21.0035, lng: 105.8632, phone: '024 3982 8888', plusCode: '7P16+9X Cảng Đông, Hà Nội' },
  'loc-07': { title: 'Quán Bia 88', address: 'Số 88, Đường Vĩnh Hà, P. Cảng Đông, Hà Nội', category: 'food', roadNodeId: 'node-caucang-88', x: 997, y: 229, lat: 21.0035, lng: 105.8632, phone: '024 3982 8888', plusCode: '7P16+9X Cảng Đông, Hà Nội' },

  // 8: Số 52 Đường Cầu Cảng (Nhà Đạt Gà) - Dot 8 trên MAP.png
  '8': { title: 'Số 52 Đường Cầu Cảng', address: 'Số 52, Đường Cầu Cảng, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-caucang-main', x: 731, y: 205, lat: 21.0048, lng: 105.8645, plusCode: '7P17+5P Phân khu Cảng, Hà Nội' },
  'loc-08': { title: 'Số 52 Đường Cầu Cảng', address: 'Số 52, Đường Cầu Cảng, P. Phân khu Cảng, Hà Nội', category: 'residential', roadNodeId: 'node-caucang-main', x: 731, y: 205, lat: 21.0048, lng: 105.8645, plusCode: '7P17+5P Phân khu Cảng, Hà Nội' },

  // 9: Chợ Cầu Cảng (Sạp bán gia cầm) - Dot 9 trên MAP.png
  '9': { title: 'Chợ Cầu Cảng', address: 'Khu B, Chợ Dân sinh Cầu Cảng, Hà Nội', category: 'shopping', roadNodeId: 'node-caucang-main', x: 772, y: 211, lat: 21.0051, lng: 105.8628, plusCode: '7P26+7R Phân khu Cảng, Hà Nội' },
  'loc-09': { title: 'Chợ Cầu Cảng', address: 'Khu B, Chợ Dân sinh Cầu Cảng, Hà Nội', category: 'shopping', roadNodeId: 'node-caucang-main', x: 772, y: 211, lat: 21.0051, lng: 105.8628, plusCode: '7P26+7R Phân khu Cảng, Hà Nội' },

  // 10: Bến xe khách Hoàng Long
  '10': { title: 'Bến xe khách Hoàng Long', address: 'Đường Phân khu Cảng, Q. Sông Hồng, Hà Nội', category: 'transit', roadNodeId: 'node-hoanglong-bus', x: 880, y: 440, lat: 20.9980, lng: 105.8720, phone: '024 3928 2828', plusCode: '7P19+6R Phân khu Cảng, Hà Nội' },
  'loc-10': { title: 'Bến xe khách Hoàng Long', address: 'Đường Phân khu Cảng, Q. Sông Hồng, Hà Nội', category: 'transit', roadNodeId: 'node-hoanglong-bus', x: 880, y: 440, lat: 20.9980, lng: 105.8720, phone: '024 3928 2828', plusCode: '7P19+6R Phân khu Cảng, Hà Nội' },

  // 11: Nhà nghỉ Hoàng Gia
  '11': { title: 'Nhà nghỉ Hoàng Gia', address: 'Đường Đoàn Kết, P. Cảng Đông, Hà Nội', category: 'residential', roadNodeId: 'node-doanket-west', x: 1080, y: 265, lat: 21.0070, lng: 105.8660, phone: '024 3862 9999', plusCode: '7P38+RH Phân khu Cảng, Hà Nội' },
  'loc-11': { title: 'Nhà nghỉ Hoàng Gia', address: 'Đường Đoàn Kết, P. Cảng Đông, Hà Nội', category: 'residential', roadNodeId: 'node-doanket-west', x: 1080, y: 265, lat: 21.0070, lng: 105.8660, phone: '024 3862 9999', plusCode: '7P38+RH Phân khu Cảng, Hà Nội' },

  // 12: Số 18 Phố Cầu Bươu (Lạc Hà / Tùng) - Dot 12 trên MAP.png
  '12': { title: 'Số 18 Phố Cầu Bươu', address: 'Số 18 Phố Cầu Bươu, Phường Lạc Hà, Hà Nội', category: 'residential', roadNodeId: 'node-caubuou-terminal', x: 673, y: 68, lat: 20.9554, lng: 105.8152, plusCode: '7P05+53 Phân khu Cảng, Hà Nội' },
  'loc-12': { title: 'Số 18 Phố Cầu Bươu', address: 'Số 18 Phố Cầu Bươu, Phường Lạc Hà, Hà Nội', category: 'residential', roadNodeId: 'node-caubuou-terminal', x: 673, y: 68, lat: 20.9554, lng: 105.8152, plusCode: '7P05+53 Phân khu Cảng, Hà Nội' },

  // 13: Cty TNHH Vận tải Sông Hồng - Dot 13 trên MAP.png
  '13': { title: 'Cty TNHH Vận tải Sông Hồng', address: 'Số 15 Cảng Cát Lái, Hà Nội', category: 'shopping', roadNodeId: 'node-vantaish', x: 783, y: 187, lat: 21.0115, lng: 105.8725, phone: '024 3829 5566', plusCode: '7P49+J2 Phân khu Cảng, Hà Nội' },
  'loc-13': { title: 'Cty TNHH Vận tải Sông Hồng', address: 'Số 15 Cảng Cát Lái, Hà Nội', category: 'shopping', roadNodeId: 'node-vantaish', x: 783, y: 187, lat: 21.0115, lng: 105.8725, phone: '024 3829 5566', plusCode: '7P49+J2 Phân khu Cảng, Hà Nội' },

  // 14: CLB Billiards X-Club
  '14': { title: 'CLB Billiards X-Club', address: 'Số 68 Phố Vọng, Hai Bà Trưng, Hà Nội', category: 'entertainment', roadNodeId: 'node-phovong', x: 810, y: 280, lat: 20.9982, lng: 105.8451, phone: '0988 123 456', plusCode: '7P18+72 Phân khu Cảng, Hà Nội' },
  'loc-14': { title: 'CLB Billiards X-Club', address: 'Số 68 Phố Vọng, Hai Bà Trưng, Hà Nội', category: 'entertainment', roadNodeId: 'node-phovong', x: 810, y: 280, lat: 20.9982, lng: 105.8451, phone: '0988 123 456', plusCode: '7P18+72 Phân khu Cảng, Hà Nội' },

  // 15: Công an P. Phân khu Cảng
  '15': { title: 'Công an P. Phân khu Cảng', address: 'Số 1 Đường Đoàn Kết, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 890, y: 250, lat: 21.0075, lng: 105.8655, phone: '024 3824 1133', plusCode: '7P38+26 Phân khu Cảng, Hà Nội' },
  'loc-15': { title: 'Công an P. Phân khu Cảng', address: 'Số 1 Đường Đoàn Kết, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 890, y: 250, lat: 21.0075, lng: 105.8655, phone: '024 3824 1133', plusCode: '7P38+26 Phân khu Cảng, Hà Nội' },

  // 16: Sân bay Quốc tế Nội Bài (T1)
  '16': { title: 'Sân bay Quốc tế Nội Bài (T1)', address: 'Xã Phú Minh, Sóc Sơn, Hà Nội', category: 'transit', roadNodeId: 'node-noibai-airport', x: 600, y: 25, lat: 21.2212, lng: 105.8072, phone: '1900 636 535', plusCode: '9PQG+7P Nội Bài, Hà Nội' },
  'loc-16': { title: 'Sân bay Quốc tế Nội Bài (T1)', address: 'Xã Phú Minh, Sóc Sơn, Hà Nội', category: 'transit', roadNodeId: 'node-noibai-airport', x: 600, y: 25, lat: 21.2212, lng: 105.8072, phone: '1900 636 535', plusCode: '9PQG+7P Nội Bài, Hà Nội' },

  // 17: Nhà nghỉ Đạt Phú (Cảng Tây) - Dot 17 trên MAP.png
  '17': { title: 'Nhà nghỉ Đạt Phú', address: 'Ngõ 12 Đường Bờ Kè, Phường Cảng Tây, Hà Nội', category: 'residential', roadNodeId: 'node-boke-ngo12', x: 633, y: 243, lat: 21.0080, lng: 105.8700, phone: '024 3869 2929', plusCode: '7P38+5X Cảng Tây, Hà Nội' },
  'loc-17': { title: 'Nhà nghỉ Đạt Phú', address: 'Ngõ 12 Đường Bờ Kè, Phường Cảng Tây, Hà Nội', category: 'residential', roadNodeId: 'node-boke-ngo12', x: 633, y: 243, lat: 21.0080, lng: 105.8700, phone: '024 3869 2929', plusCode: '7P38+5X Cảng Tây, Hà Nội' },

  // 18: Quán Cơm Chị Ba
  '18': { title: 'Quán Cơm Chị Ba', address: 'Số 15 Cầu Cảng, Hà Nội', category: 'food', roadNodeId: 'node-caucang-junction', x: 840, y: 250, lat: 21.0062, lng: 105.8652, phone: '0908 334 991', plusCode: '7P28+4A Phân khu Cảng, Hà Nội' },
  'loc-18': { title: 'Quán Cơm Chị Ba', address: 'Số 15 Cầu Cảng, Hà Nội', category: 'food', roadNodeId: 'node-caucang-junction', x: 840, y: 250, lat: 21.0062, lng: 105.8652, phone: '0908 334 991', plusCode: '7P28+4A Phân khu Cảng, Hà Nội' },

  // 19: Tiệm Giặt Là Chị Hạnh
  '19': { title: 'Tiệm Giặt Là Chị Hạnh', address: 'Số 22 Phố Cảng, Hà Nội', category: 'shopping', roadNodeId: 'node-city-center', x: 650, y: 350, lat: 21.0180, lng: 105.8520, phone: '0914 556 789', plusCode: '7P52+7M Sông Hồng, Hà Nội' },
  'loc-19': { title: 'Tiệm Giặt Là Chị Hạnh', address: 'Số 22 Phố Cảng, Hà Nội', category: 'shopping', roadNodeId: 'node-city-center', x: 650, y: 350, lat: 21.0180, lng: 105.8520, phone: '0914 556 789', plusCode: '7P52+7M Sông Hồng, Hà Nội' },

  // 20: Bến phà Phân khu Cảng
  '20': { title: 'Bến phà Phân khu Cảng', address: 'Bến Phà Cảng Sông Hồng, Hà Nội', category: 'transit', roadNodeId: 'node-vantaish', x: 920, y: 200, lat: 21.0100, lng: 105.8760, plusCode: '7P4A+2B Phân khu Cảng, Hà Nội' },
  'loc-20': { title: 'Bến phà Phân khu Cảng', address: 'Bến Phà Cảng Sông Hồng, Hà Nội', category: 'transit', roadNodeId: 'node-vantaish', x: 920, y: 200, lat: 21.0100, lng: 105.8760, plusCode: '7P4A+2B Phân khu Cảng, Hà Nội' },

  // 21: Trụ sở Phòng Cảnh sát Hình sự (PC02)
  '21': { title: 'Trụ sở Phòng Cảnh sát Hình sự (PC02)', address: 'Số 7 Phố Thiền Quang, Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 450, y: 420, lat: 21.0250, lng: 105.8500, plusCode: '7P53+2X Sông Hồng, Hà Nội' },
  'loc-21': { title: 'Trụ sở Phòng Cảnh sát Hình sự (PC02)', address: 'Số 7 Phố Thiền Quang, Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 450, y: 420, lat: 21.0250, lng: 105.8500, plusCode: '7P53+2X Sông Hồng, Hà Nội' },

  // 22: Viện Kiểm sát Nhân dân TP. Hà Nội
  '22': { title: 'Viện Kiểm sát Nhân dân TP. Hà Nội', address: 'TP. Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 440, y: 400, lat: 21.0280, lng: 105.8530, plusCode: '7P54+4A Sông Hồng, Hà Nội' },
  'loc-22': { title: 'Viện Kiểm sát Nhân dân TP. Hà Nội', address: 'TP. Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 440, y: 400, lat: 21.0280, lng: 105.8530, plusCode: '7P54+4A Sông Hồng, Hà Nội' },

  // 23: Tòa án Nhân dân Q. Sông Hồng
  '23': { title: 'Tòa án Nhân dân Q. Sông Hồng', address: 'Q. Sông Hồng, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 600, y: 380, lat: 21.0080, lng: 105.8660, plusCode: '7P38+3C Phân khu Cảng, Hà Nội' },
  'loc-23': { title: 'Tòa án Nhân dân Q. Sông Hồng', address: 'Q. Sông Hồng, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 600, y: 380, lat: 21.0080, lng: 105.8660, plusCode: '7P38+3C Phân khu Cảng, Hà Nội' },

  // 24: Ngân hàng TMCP Đầu tư & NN Xanh (GreenAgri)
  '24': { title: 'Ngân hàng TMCP Đầu tư & NN Xanh (GreenAgri)', address: 'Đường Cầu Cảng, Hà Nội', category: 'finance', roadNodeId: 'node-caucang-junction', x: 820, y: 270, lat: 21.0065, lng: 105.8655, plusCode: '7P28+6D Phân khu Cảng, Hà Nội' },
  'loc-24': { title: 'Ngân hàng TMCP Đầu tư & NN Xanh (GreenAgri)', address: 'Đường Cầu Cảng, Hà Nội', category: 'finance', roadNodeId: 'node-caucang-junction', x: 820, y: 270, lat: 21.0065, lng: 105.8655, plusCode: '7P28+6D Phân khu Cảng, Hà Nội' },

  // 25: Phòng Tài nguyên & Môi trường Q. Sông Hồng
  '25': { title: 'Phòng Tài nguyên & Môi trường Q. Sông Hồng', address: 'Q. Sông Hồng, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 610, y: 370, lat: 21.0078, lng: 105.8665, plusCode: '7P38+5E Phân khu Cảng, Hà Nội' },
  'loc-25': { title: 'Phòng Tài nguyên & Môi trường Q. Sông Hồng', address: 'Q. Sông Hồng, Hà Nội', category: 'government', roadNodeId: 'node-doanket-east', x: 610, y: 370, lat: 21.0078, lng: 105.8665, plusCode: '7P38+5E Phân khu Cảng, Hà Nội' },

  // 26: Phòng Kỹ thuật Hình sự (PC54)
  '26': { title: 'Phòng Kỹ thuật Hình sự (PC54)', address: 'TP. Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 460, y: 410, lat: 21.0245, lng: 105.8510, plusCode: '7P53+1M Sông Hồng, Hà Nội' },
  'loc-26': { title: 'Phòng Kỹ thuật Hình sự (PC54)', address: 'TP. Hà Nội', category: 'government', roadNodeId: 'node-city-center', x: 460, y: 410, lat: 21.0245, lng: 105.8510, plusCode: '7P53+1M Sông Hồng, Hà Nội' }
}

export function getLocationMeta(rawId: string): LocationMeta | undefined {
  if (!rawId) return undefined
  if (LOCATION_METAS[rawId]) return LOCATION_METAS[rawId]
  const numStr = rawId.replace('loc-', '').replace(/^0+/, '')
  const prefixedId = `loc-${numStr.padStart(2, '0')}`
  return LOCATION_METAS[numStr] || LOCATION_METAS[prefixedId] || LOCATION_METAS[`loc-${rawId}`]
}

export function parseCategory(rawCat?: string): { category: LocationCategory; categoryLabel: string } {
  const norm = (rawCat || '').toUpperCase().trim()
  switch (norm) {
    case 'CRIME_SCENE':
      return { category: 'crime_scene', categoryLabel: 'Hiện trường vụ án' }
    case 'RESIDENCE':
    case 'RESIDENTIAL':
      return { category: 'residential', categoryLabel: 'Khu dân cư & Nhà ở' }
    case 'BUSINESS':
    case 'SHOPPING':
      return { category: 'shopping', categoryLabel: 'Kinh doanh & Thương mại' }
    case 'TRANSIT':
      return { category: 'transit', categoryLabel: 'Giao thông & Bến bãi' }
    case 'FOOD':
      return { category: 'food', categoryLabel: 'Ẩm thực & Quán xá' }
    case 'FINANCE':
      return { category: 'finance', categoryLabel: 'Tài chính & Ngân hàng' }
    case 'GOVERNMENT':
      return { category: 'government', categoryLabel: 'Cơ quan nhà nước' }
    case 'ENTERTAINMENT':
      return { category: 'entertainment', categoryLabel: 'Thể thao & Giải trí' }
    case 'PUBLIC':
    default:
      return { category: 'public', categoryLabel: 'Khu vực công cộng' }
  }
}

/**
 * Adapter chuyển đổi một dòng thô từ Google Sheets sang CaseLocation chuẩn
 */
export function transformSheetLocationToCaseLocation(row: SheetLocationRow): CaseLocation {
  const id = String(row.code || row.id || '').trim() || 'loc-unknown'
  const meta = LOCATION_METAS[id]
  const rawTitle = String(row.title || row.name || '').trim()
  const title = (rawTitle && !rawTitle.startsWith('Địa điểm loc-')) ? rawTitle : (meta?.title || rawTitle || 'Địa điểm chưa đặt tên')
  
  const rawCat = String(row.category || '').trim()
  const parsedCat = rawCat ? parseCategory(rawCat) : (meta?.category ? parseCategory(meta.category) : parseCategory(''))
  const { category, categoryLabel } = parsedCat

  // Tọa độ ưu tiên từ metadata đã scan trực tiếp theo các dot trên MAP.png (1237 x 866)
  const x = meta?.x ?? 853
  const y = meta?.y ?? 225

  const lat = meta?.lat ?? 21.0058
  const lng = meta?.lng ?? 105.8682
  const roadNodeId = meta?.roadNodeId ?? 'node-bosong-14'

  return {
    id,
    name: title,
    shortName: title.length > 20 ? title.substring(0, 18) + '...' : title,
    address: String(row.address || meta?.address || 'Hà Nội').trim(),
    category,
    categoryLabel,
    x,
    y,
    lat,
    lng,
    description: String(row.details || row.description || '').trim(),
    rating: meta?.rating ?? 4.5,
    reviewCount: meta?.reviewCount ?? 15,
    openingHours: meta?.openingHours ?? 'Mở cửa cả ngày',
    plusCode: meta?.plusCode ?? '7P28+3M Hà Nội',
    phone: meta?.phone,
    roadNodeId,
    distanceFromScene: String(row.distance_from_scene || '').trim(),
    travelTime: String(row.travel_time || '').trim()
  }
}

// ---------------------------------------------------------------------------
// 3. SEED CASE LOCATIONS (Fallback Instant Init trước khi Fetch xong Sheet)
// ---------------------------------------------------------------------------
export const CASE_LOCATIONS: CaseLocation[] = Object.keys(LOCATION_METAS)
  .filter((key) => !key.startsWith('loc-'))
  .map((key) => {
    const meta = LOCATION_METAS[key]
    return transformSheetLocationToCaseLocation({
      code: key,
      title: meta?.title || key,
      category: meta?.category || 'residential',
      address: meta?.address || 'Hà Nội'
    })
  })

export const DEFAULT_CASE_LOCATIONS = CASE_LOCATIONS

// ---------------------------------------------------------------------------
// 4. HAVERSINE DISTANCE HELPER
// ---------------------------------------------------------------------------
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
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
// 5. GRAPH PATHFINDING ALGORITHM (Dijkstra Shortest Path)
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
// 6. CALCULATE ROUTE (Case-Consistent Route Engine)
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

  let viaRoute = 'Qua Đường Bờ Sông'
  let alternativeViaRoute = 'Qua Tuyến Đường Vành Đai'
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
