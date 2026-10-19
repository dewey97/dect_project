import type { Point, MapVectorData, WaterFeature, RoadFeature, RailwayFeature, ZoneFeature, PoiFeature, LabelFeature, PoiCategory } from '@/types/map-vector'
import type { CaseLocation, LocationCategory } from '@/lib/case-locations-data'

/**
 * Catmull-Rom to Cubic Bezier curve path converter for organic smooth rivers, lakes, and roads.
 */
export function pointsToSvgPath(points: Point[], closed = false, smooth = false): string {
  if (!points || points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  if (!smooth || points.length < 3) {
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
    if (closed) d += ' Z'
    return d
  }

  // Smooth spline using Catmull-Rom spline converted to cubic Bezier
  const pts = [...points]
  if (closed) {
    pts.unshift(points[points.length - 1])
    pts.push(points[0])
    pts.push(points[1])
  }

  let d = `M ${points[0].x} ${points[0].y}`
  const startIndex = closed ? 1 : 0
  const endIndex = closed ? pts.length - 2 : pts.length - 1

  for (let i = startIndex; i < endIndex; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2

    // Control points
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${Math.round(cp1x * 10) / 10} ${Math.round(cp1y * 10) / 10}, ${Math.round(cp2x * 10) / 10} ${Math.round(cp2y * 10) / 10}, ${Math.round(p2.x * 10) / 10} ${Math.round(p2.y * 10) / 10}`
  }

  if (closed) {
    d += ' Z'
  }

  return d
}

/**
 * Generates technical railway SVG elements: dual parallel steel rails + perpendicular cross-tie sleepers.
 */
export function generateRailwayPaths(
  points: Point[],
  width = 8,
  sleeperSpacing = 12
): { railsPath: string; sleepersPath: string } {
  if (!points || points.length < 2) return { railsPath: '', sleepersPath: '' }

  const halfWidth = width / 2
  let leftRail = ''
  let rightRail = ''
  let sleepers = ''

  // Sample points along polyline
  const sampledSegments: { start: Point; end: Point; length: number; dirX: number; dirY: number }[] = []
  let totalLength = 0

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.hypot(dx, dy)
    if (len > 0) {
      sampledSegments.push({
        start: p1,
        end: p2,
        length: len,
        dirX: dx / len,
        dirY: dy / len
      })
      totalLength += len
    }
  }

  if (sampledSegments.length === 0) return { railsPath: '', sleepersPath: '' }

  // 1. Build Left & Right Rails
  for (let i = 0; i < sampledSegments.length; i++) {
    const seg = sampledSegments[i]
    const normX = -seg.dirY
    const normY = seg.dirX

    const lx1 = seg.start.x + normX * halfWidth
    const ly1 = seg.start.y + normY * halfWidth
    const lx2 = seg.end.x + normX * halfWidth
    const ly2 = seg.end.y + normY * halfWidth

    const rx1 = seg.start.x - normX * halfWidth
    const ry1 = seg.start.y - normY * halfWidth
    const rx2 = seg.end.x - normX * halfWidth
    const ry2 = seg.end.y - normY * halfWidth

    if (i === 0) {
      leftRail += `M ${lx1} ${ly1} L ${lx2} ${ly2}`
      rightRail += `M ${rx1} ${ry1} L ${rx2} ${ry2}`
    } else {
      leftRail += ` L ${lx2} ${ly2}`
      rightRail += ` L ${rx2} ${ry2}`
    }
  }

  // 2. Build Sleepers along the cumulative length
  let currentDist = 0
  let segIndex = 0
  let distInSeg = 0

  while (currentDist <= totalLength && segIndex < sampledSegments.length) {
    const seg = sampledSegments[segIndex]
    const px = seg.start.x + seg.dirX * distInSeg
    const py = seg.start.y + seg.dirY * distInSeg
    const normX = -seg.dirY
    const normY = seg.dirX

    // Tie extends slightly beyond the rails (+2px on each side)
    const tieExtend = halfWidth + 2.5
    const sx1 = px + normX * tieExtend
    const sy1 = py + normY * tieExtend
    const sx2 = px - normX * tieExtend
    const sy2 = py - normY * tieExtend

    sleepers += `M ${Math.round(sx1 * 10) / 10} ${Math.round(sy1 * 10) / 10} L ${Math.round(sx2 * 10) / 10} ${Math.round(sy2 * 10) / 10} `

    currentDist += sleeperSpacing
    distInSeg += sleeperSpacing

    while (segIndex < sampledSegments.length && distInSeg > sampledSegments[segIndex].length) {
      distInSeg -= sampledSegments[segIndex].length
      segIndex++
    }
  }

  return {
    railsPath: `${leftRail} ${rightRail}`,
    sleepersPath: sleepers
  }
}

/**
 * Smart vertex snapping to grid and nearby points.
 */
export function snapPoint(
  p: Point,
  gridSize = 20,
  snapToGrid = true,
  nearbyPoints: Point[] = [],
  snapThreshold = 14
): Point {
  // 1. Nearby points take highest priority (magnetic connection)
  for (const target of nearbyPoints) {
    if (Math.hypot(p.x - target.x, p.y - target.y) <= snapThreshold) {
      return { x: target.x, y: target.y }
    }
  }

  // 2. Grid snap fallback
  if (snapToGrid && gridSize > 1) {
    return {
      x: Math.round(p.x / gridSize) * gridSize,
      y: Math.round(p.y / gridSize) * gridSize
    }
  }

  return p
}

export function getEmptyMapVectorData(caseId = 'case_000'): MapVectorData {
  return {
    version: '2.0.0',
    caseId,
    canvasWidth: 2800,
    canvasHeight: 2000,
    backgroundColor: '#EEF2F6',
    water: [],
    zones: [],
    roads: [],
    railways: [],
    pois: [],
    labels: [],
    updatedAt: new Date().toISOString()
  }
}

import { canvasXYToLatLng } from '@/lib/map-routing-engine'

/**
 * Transform a POI from Vector Map Studio to a standard CaseLocation for the phone app
 */
export function transformPoiToCaseLocation(poi: PoiFeature): CaseLocation {
  const catMap: Record<PoiCategory, LocationCategory> = {
    crime_scene: 'crime_scene',
    residential: 'residential',
    transit: 'transit',
    dock: 'transit',
    warehouse: 'public',
    food: 'food',
    secret: 'crime_scene'
  }

  const categoryLabels: Record<PoiCategory, string> = {
    crime_scene: 'Hiện trường vụ án',
    residential: 'Khu dân cư',
    transit: 'Giao thông / Đi lại',
    dock: 'Bến bãi ven sông',
    warehouse: 'Nhà kho / Bến cảng',
    food: 'Quán ăn / Nhà hàng',
    secret: 'Địa điểm tình nghi'
  }

  const [lat, lng] = canvasXYToLatLng(poi.x, poi.y)

  return {
    id: poi.id,
    name: poi.name,
    shortName: poi.shortName || poi.name,
    address: poi.address || 'Khu vực điều tra Vĩnh Thụy',
    category: catMap[poi.category] || 'crime_scene',
    categoryLabel: categoryLabels[poi.category] || poi.category,
    x: poi.x,
    y: poi.y,
    lat,
    lng,
    description: poi.description || poi.clueNotes || '',
    phone: poi.phone,
    roadNodeId: `node-${poi.id}`
  }
}
