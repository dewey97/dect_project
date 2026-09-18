import * as THREE from 'three'

// ==========================================
// ROOM HOTSPOTS DEFINITION (8 CHUẨN ĐIỂM KHÁM XÉT HỒ SƠ VỤ ÁN)
// ==========================================
export interface RoomHotspot {
  id: string
  num: number
  shortName: string
  position: [number, number, number] // [X, Y, Z] in 3D room
  targetCamera: {
    pos: [number, number, number]
    lon: number
    lat: number
    fov: number
  }
  title: string
  caption: string
  detail: string
  imageUrl: string
}

// ==========================================
// WALL PICTURE FRAMES CONFIGURATION
// ==========================================
export interface WallPictureFrameConfig {
  id: string
  label: string
  subtitle?: string
  imageUrl?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  tilt?: number
}

// ==========================================
// CAMERA CONTROLLER STATE
// ==========================================
export interface ControllerState {
  lon: number
  lat: number
  targetLon: number
  targetLat: number
  targetPos: THREE.Vector3
  currentPos: THREE.Vector3
  fov: number
  targetFov: number
  isInteracting: boolean
  downX: number
  downY: number
  downLon: number
  downLat: number
}

// ==========================================
// MAIN COMPONENT PROPS
// ==========================================
export interface CrimeSceneRoom3DProps {
  onSelectSpot?: (spot: RoomHotspot) => void
}
