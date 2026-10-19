/**
 * Real-World Vector Map Routing Engine
 * Thuật toán tìm đường ngắn nhất Dijkstra / A* trên đồ thị giao thông thực tế của bản đồ Vector Hà Nội
 * Tỉ lệ khoảng cách thực tế: 1px ≈ 1.70 mét (590px ≈ 1.0 km)
 */

import type { Point, RoadFeature, MapVectorData } from '@/types/map-vector'
import type { CaseLocation, RouteResult, RouteStep, TransportMode } from '@/lib/case-locations-data'

export const BBOX_SOUTH = 21.010
export const BBOX_WEST = 105.820
export const BBOX_NORTH = 21.055
export const BBOX_EAST = 105.875

export const CANVAS_WIDTH = 3600
export const CANVAS_HEIGHT = 2800
export const CANVAS_PADDING = 100

export const METERS_PER_PIXEL = 1.70
export const KM_PER_PIXEL = 0.0017

/**
 * Quy đổi tọa độ Canvas (X, Y) sang tọa độ GPS thực tế (Latitude, Longitude)
 */
export function canvasXYToLatLng(x: number, y: number): [number, number] {
  const activeW = CANVAS_WIDTH - 2 * CANVAS_PADDING
  const activeH = CANVAS_HEIGHT - 2 * CANVAS_PADDING
  const lon = BBOX_WEST + ((x - CANVAS_PADDING) / activeW) * (BBOX_EAST - BBOX_WEST)
  const lat = BBOX_NORTH - ((y - CANVAS_PADDING) / activeH) * (BBOX_NORTH - BBOX_SOUTH)
  return [Number(lat.toFixed(6)), Number(lon.toFixed(6))]
}

/**
 * Quy đổi tọa độ GPS thực tế (Latitude, Longitude) sang tọa độ Canvas (X, Y)
 */
export function latLngToCanvasXY(lat: number, lon: number): Point {
  const activeW = CANVAS_WIDTH - 2 * CANVAS_PADDING
  const activeH = CANVAS_HEIGHT - 2 * CANVAS_PADDING
  const x = CANVAS_PADDING + ((lon - BBOX_WEST) / (BBOX_EAST - BBOX_WEST)) * activeW
  const y = CANVAS_PADDING + ((BBOX_NORTH - lat) / (BBOX_NORTH - BBOX_SOUTH)) * activeH
  return { x: Math.round(x), y: Math.round(y) }
}

interface GraphEdge {
  to: string
  weight: number
  streetName: string
}

// Spatial grid bucket index for fast node lookup (O(1) instead of scanning thousands of nodes)
const GRID_CELL_SIZE = 150

class SpatialGrid {
  private cells = new Map<string, string[]>()

  private cellKey(x: number, y: number): string {
    const cx = Math.floor(x / GRID_CELL_SIZE)
    const cy = Math.floor(y / GRID_CELL_SIZE)
    return `${cx}:${cy}`
  }

  insert(nodeKey: string, pt: Point) {
    const ck = this.cellKey(pt.x, pt.y)
    let list = this.cells.get(ck)
    if (!list) {
      list = []
      this.cells.set(ck, list)
    }
    list.push(nodeKey)
  }

  getNearby(pt: Point, searchRadiusPx = GRID_CELL_SIZE * 2): string[] {
    const minCx = Math.floor((pt.x - searchRadiusPx) / GRID_CELL_SIZE)
    const maxCx = Math.floor((pt.x + searchRadiusPx) / GRID_CELL_SIZE)
    const minCy = Math.floor((pt.y - searchRadiusPx) / GRID_CELL_SIZE)
    const maxCy = Math.floor((pt.y + searchRadiusPx) / GRID_CELL_SIZE)

    const result: string[] = []
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const bucket = this.cells.get(`${cx}:${cy}`)
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) {
            result.push(bucket[i])
          }
        }
      }
    }
    return result
  }
}

interface CachedGraph {
  roadsRef: RoadFeature[]
  adjList: Map<string, GraphEdge[]>
  nodeCoords: Map<string, Point>
  nodeKeys: string[]
  spatialGrid: SpatialGrid
}

let graphCache: CachedGraph | null = null

function coordToKey(p: Point): string {
  return `${Math.round(p.x)}_${Math.round(p.y)}`
}

function keyToCoord(key: string): Point {
  const [x, y] = key.split('_').map(Number)
  return { x, y }
}

/**
 * Xây dựng đồ thị giao thông từ các trục đường Vector (Được Cache tối ưu + Spatial Grid Index)
 */
export function buildRoadGraph(roads: RoadFeature[]): CachedGraph {
  if (graphCache && graphCache.roadsRef === roads) {
    return graphCache
  }

  const adjList = new Map<string, GraphEdge[]>()
  const nodeCoords = new Map<string, Point>()
  const spatialGrid = new SpatialGrid()

  for (const road of roads) {
    const pts = road.points
    if (!pts || pts.length < 2) continue
    const streetName = road.name || 'Đường nội bộ'

    for (let i = 0; i < pts.length - 1; i++) {
      const k1 = coordToKey(pts[i])
      const k2 = coordToKey(pts[i + 1])
      if (k1 === k2) continue

      const p1 = pts[i]
      const p2 = pts[i + 1]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)

      if (!nodeCoords.has(k1)) {
        const pt1 = { x: Math.round(p1.x), y: Math.round(p1.y) }
        nodeCoords.set(k1, pt1)
        spatialGrid.insert(k1, pt1)
      }
      if (!nodeCoords.has(k2)) {
        const pt2 = { x: Math.round(p2.x), y: Math.round(p2.y) }
        nodeCoords.set(k2, pt2)
        spatialGrid.insert(k2, pt2)
      }

      let edges1 = adjList.get(k1)
      if (!edges1) {
        edges1 = []
        adjList.set(k1, edges1)
      }
      edges1.push({ to: k2, weight: dist, streetName })

      let edges2 = adjList.get(k2)
      if (!edges2) {
        edges2 = []
        adjList.set(k2, edges2)
      }
      edges2.push({ to: k1, weight: dist, streetName })
    }
  }

  const nodeKeys = Array.from(nodeCoords.keys())
  graphCache = { roadsRef: roads, adjList, nodeCoords, nodeKeys, spatialGrid }
  return graphCache
}

/**
 * Bắt dính (Snap) một điểm bất kỳ vào nút giao / tim đường gần nhất trên mạng lưới
 * Sử dụng Spatial Grid để tìm kiếm theo bucket O(1) thay vì O(N) toàn bộ đồ thị
 */
export function snapToNearestRoadNode(pt: Point, graph: CachedGraph): { nodeKey: string; coord: Point; distPx: number } {
  let bestKey = ''
  let bestDistSq = Infinity

  // 1. Tìm trong bucket lân cận trước
  let candidateKeys = graph.spatialGrid?.getNearby(pt, 300) || []
  if (candidateKeys.length === 0) {
    // Nếu điểm nằm ngoài khu vực mật độ đường sá cao, mở rộng bán kính
    candidateKeys = graph.spatialGrid?.getNearby(pt, 800) || []
  }
  // Fallback toàn bộ nếu vẫn không thấy
  if (candidateKeys.length === 0) {
    candidateKeys = graph.nodeKeys
  }

  for (const key of candidateKeys) {
    const coord = graph.nodeCoords.get(key)
    if (!coord) continue
    const dx = coord.x - pt.x
    const dy = coord.y - pt.y
    const dSq = dx * dx + dy * dy
    if (dSq < bestDistSq) {
      bestDistSq = dSq
      bestKey = key
    }
  }

  const coord = bestKey ? graph.nodeCoords.get(bestKey)! : pt
  return {
    nodeKey: bestKey,
    coord,
    distPx: Math.sqrt(bestDistSq)
  }
}

// Simple MinHeap Priority Queue for Dijkstra
class MinPriorityQueue {
  private heap: { node: string; priority: number }[] = []

  push(node: string, priority: number) {
    this.heap.push({ node, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): { node: string; priority: number } | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const bottom = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = bottom
      this.sinkDown(0)
    }
    return top
  }

  get size(): number {
    return this.heap.length
  }

  private bubbleUp(index: number) {
    const element = this.heap[index]
    while (index > 0) {
      const parentIdx = (index - 1) >> 1
      const parent = this.heap[parentIdx]
      if (element.priority >= parent.priority) break
      this.heap[index] = parent
      this.heap[parentIdx] = element
      index = parentIdx
    }
  }

  private sinkDown(index: number) {
    const length = this.heap.length
    const element = this.heap[index]
    while (true) {
      const leftChildIdx = (index << 1) + 1
      const rightChildIdx = leftChildIdx + 1
      let swapIdx: number | null = null

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].priority < element.priority) {
          swapIdx = leftChildIdx
        }
      }

      if (rightChildIdx < length) {
        if (
          (swapIdx === null && this.heap[rightChildIdx].priority < element.priority) ||
          (swapIdx !== null && this.heap[rightChildIdx].priority < this.heap[leftChildIdx].priority)
        ) {
          swapIdx = rightChildIdx
        }
      }

      if (swapIdx === null) break
      this.heap[index] = this.heap[swapIdx]
      this.heap[swapIdx] = element
      index = swapIdx
    }
  }
}

/**
 * Thuật toán Dijkstra tìm đường ngắn nhất trên đồ thị đường sá
 */
export function findShortestPathDijkstra(
  startNode: string,
  endNode: string,
  graph: CachedGraph
): { pathKeys: string[]; totalPx: number; streets: string[] } {
  if (startNode === endNode) {
    return { pathKeys: [startNode], totalPx: 0, streets: [] }
  }

  const distances = new Map<string, number>()
  const previous = new Map<string, { node: string; street: string }>()
  const visited = new Set<string>()
  const pq = new MinPriorityQueue()

  distances.set(startNode, 0)
  pq.push(startNode, 0)

  while (pq.size > 0) {
    const current = pq.pop()!
    const u = current.node

    if (u === endNode) break
    if (visited.has(u)) continue
    visited.add(u)

    const edges = graph.adjList.get(u) || []
    const curDist = distances.get(u)!

    for (const edge of edges) {
      if (visited.has(edge.to)) continue
      const newDist = curDist + edge.weight
      const oldDist = distances.get(edge.to) ?? Infinity

      if (newDist < oldDist) {
        distances.set(edge.to, newDist)
        previous.set(edge.to, { node: u, street: edge.streetName })
        pq.push(edge.to, newDist)
      }
    }
  }

  if (!previous.has(endNode) && startNode !== endNode) {
    return { pathKeys: [startNode, endNode], totalPx: 0, streets: [] }
  }

  const pathKeys: string[] = []
  const streets: string[] = []
  let curr: string | undefined = endNode

  while (curr && curr !== startNode) {
    pathKeys.unshift(curr)
    const prevEntry = previous.get(curr)
    if (prevEntry) {
      if (prevEntry.street && !streets.includes(prevEntry.street)) {
        streets.unshift(prevEntry.street)
      }
      curr = prevEntry.node
    } else {
      break
    }
  }
  pathKeys.unshift(startNode)

  const totalPx = distances.get(endNode) || 0
  return { pathKeys, totalPx, streets }
}

/**
 * Hàm tính toán chỉ đường chính xác kết nối với Map Studio Vector Data
 */
export function calculateVectorRoute(
  origin: CaseLocation,
  destination: CaseLocation,
  mapData: MapVectorData | null,
  mode: TransportMode = 'motorbike'
): RouteResult {
  // 1. Kiểm tra nếu có dữ liệu đường sá thật từ Vector Map
  if (mapData && mapData.roads && mapData.roads.length > 0) {
    const graph = buildRoadGraph(mapData.roads)
    const snapStart = snapToNearestRoadNode({ x: origin.x, y: origin.y }, graph)
    const snapEnd = snapToNearestRoadNode({ x: destination.x, y: destination.y }, graph)

    const { pathKeys, totalPx, streets } = findShortestPathDijkstra(
      snapStart.nodeKey,
      snapEnd.nodeKey,
      graph
    )

    // Xây dựng danh sách tọa độ Polyline
    const points: Point[] = [{ x: origin.x, y: origin.y }]
    for (const key of pathKeys) {
      const coord = graph.nodeCoords.get(key)
      if (coord) {
        points.push(coord)
      }
    }
    points.push({ x: destination.x, y: destination.y })

    // Tính khoảng cách thực tế (km)
    const extraDistPx = snapStart.distPx + snapEnd.distPx
    const routeDistancePx = totalPx > 0 ? totalPx + extraDistPx : Math.hypot(destination.x - origin.x, destination.y - origin.y)
    const distanceKm = Math.max(0.1, Number((routeDistancePx * KM_PER_PIXEL).toFixed(1)))

    // Vận tốc thực tế theo phương tiện
    let speedKmH = 30
    if (mode === 'walk') speedKmH = 4.8
    else if (mode === 'car') speedKmH = distanceKm > 10 ? 42 : 28
    else speedKmH = distanceKm > 10 ? 38 : 30 // Xe máy

    const durationMinutes = Math.max(1, Math.round((distanceKm / speedKmH) * 60))
    const distanceText = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`
    const durationText = durationMinutes < 60 ? `${durationMinutes} phút` : `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`

    // Tọa độ GPS tương ứng
    const latLngs: [number, number][] = points.map((p) => canvasXYToLatLng(p.x, p.y))

    // Tên các trục đường chính đi qua
    const topStreets = streets.filter((s) => s && s !== 'Đường nội bộ').slice(0, 3)
    const viaRoute = topStreets.length > 0 ? `Qua ${topStreets.join(' - ')}` : 'Qua các trục đường chính'

    // Danh sách các bước chỉ đường GPS
    const steps: RouteStep[] = [
      {
        instruction: `Xuất phát từ ${origin.name}`,
        distance: `${Math.round(snapStart.distPx * METERS_PER_PIXEL)} m`,
        iconType: 'straight',
        subInstruction: 'Tiến vào trục đường lớn gần nhất'
      }
    ]

    for (let i = 0; i < topStreets.length; i++) {
      steps.push({
        instruction: `Đi theo ${topStreets[i]}`,
        distance: `${((distanceKm / (topStreets.length || 1))).toFixed(1)} km`,
        iconType: i % 2 === 0 ? 'turn-right' : 'turn-left',
        subInstruction: 'Đi thẳng theo chỉ dẫn'
      })
    }

    steps.push({
      instruction: `Đến điểm hẹn ${destination.name}`,
      distance: '0 m',
      iconType: 'arrive',
      subInstruction: destination.address || 'Điểm đến ở bên phải bạn'
    })

    return {
      origin,
      destination,
      mode,
      distanceKm,
      distanceText,
      durationMinutes,
      durationText,
      trafficStatus: 'good',
      viaRoute,
      points,
      latLngs,
      steps
    }
  }

  // Fallback direct geometry
  const dx = destination.x - origin.x
  const dy = destination.y - origin.y
  const directDistPx = Math.hypot(dx, dy)
  const distanceKm = Math.max(0.1, Number((directDistPx * KM_PER_PIXEL).toFixed(1)))
  const durationMinutes = Math.max(1, Math.round((distanceKm / 30) * 60))

  return {
    origin,
    destination,
    mode,
    distanceKm,
    distanceText: `${distanceKm.toFixed(1)} km`,
    durationMinutes,
    durationText: `${durationMinutes} phút`,
    trafficStatus: 'good',
    viaRoute: 'Đường chim bay',
    points: [{ x: origin.x, y: origin.y }, { x: destination.x, y: destination.y }],
    latLngs: [canvasXYToLatLng(origin.x, origin.y), canvasXYToLatLng(destination.x, destination.y)],
    steps: []
  }
}
