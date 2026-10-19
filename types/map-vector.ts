export interface Point {
  x: number
  y: number
}

export type WaterType = 'lake' | 'river' | 'stream' | 'ocean'

export interface WaterFeature {
  id: string
  name: string
  type: WaterType
  points: Point[]
  closed: boolean
  width?: number
  color: string
  opacity: number
  smooth?: boolean
  zIndex: number
}

export type ZoneCategory =
  | 'residential'
  | 'industrial'
  | 'port'
  | 'park'
  | 'commercial'
  | 'military'
  | 'custom'

export interface ZoneFeature {
  id: string
  name: string
  category: ZoneCategory
  points: Point[]
  fillColor: string
  strokeColor?: string
  strokeWidth?: number
  opacity: number
  zIndex: number
}

export type RoadType = 'highway' | 'avenue' | 'street' | 'alley' | 'bridge'

export interface RoadFeature {
  id: string
  name: string
  type: RoadType
  points: Point[]
  width: number
  color: string
  casingColor: string
  casingWidth: number
  isBridge?: boolean
  smooth?: boolean
  dashed?: boolean
  zIndex: number
}

export interface RailwayFeature {
  id: string
  name: string
  points: Point[]
  width: number
  color: string
  sleeperSpacing: number
  smooth?: boolean
  zIndex: number
}

export type PoiCategory =
  | 'crime_scene'
  | 'residential'
  | 'transit'
  | 'dock'
  | 'warehouse'
  | 'food'
  | 'secret'

export interface PoiFeature {
  id: string
  name: string
  shortName?: string
  category: PoiCategory
  x: number
  y: number
  address?: string
  phone?: string
  description?: string
  clueNotes?: string
  iconColor?: string
  badgeNumber?: number
  caseId?: string // Thuộc vụ án cụ thể (vd: 'case_000') hoặc để trống/undefined nếu là địa điểm công cộng dùng chung
  caseIds?: string[] // Danh sách các vụ án liên quan
  zIndex: number
}

export interface LabelFeature {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  rotation?: number
  letterSpacing?: number
  fontWeight?: 'normal' | 'bold' | 'black'
  zIndex: number
}

export type MapStudioTool =
  | 'select'
  | 'pan'
  | 'water'
  | 'road'
  | 'railway'
  | 'zone'
  | 'poi'
  | 'label'

export interface BuildingFeature {
  id: string
  name?: string
  points: Point[]
  color?: string
  strokeColor?: string
  strokeWidth?: number
  opacity?: number
  height?: number
  zIndex: number
}

export type AnyMapFeature =
  | WaterFeature
  | ZoneFeature
  | BuildingFeature
  | RoadFeature
  | RailwayFeature
  | PoiFeature
  | LabelFeature

export interface MapVectorData {
  version: string
  caseId: string
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  water: WaterFeature[]
  zones: ZoneFeature[]
  buildings?: BuildingFeature[]
  roads: RoadFeature[]
  railways: RailwayFeature[]
  pois: PoiFeature[]
  labels: LabelFeature[]
  updatedAt: string
}
