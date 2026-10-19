/**
 * High-Performance HTML5 Canvas 2D Vector Map Renderer
 * Renders vector map features (Water, Zones, Buildings, Roads, Railways, Labels)
 * with Viewport Culling & Level-of-Detail (LOD).
 * 
 * Provides smooth 60-120 FPS panning & zooming by bypassing DOM/SVG rasterization entirely.
 */

import type { Point, MapVectorData, RoadFeature, BuildingFeature } from '@/types/map-vector'

export interface ViewportBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Calculates current bounding box in Map Coordinate Space (X, Y)
 * visible through the phone viewport.
 */
export function calculateVisibleBounds(
  pan: { x: number; y: number },
  zoom: number,
  viewWidth: number,
  viewHeight: number,
  padding = 100
): ViewportBox {
  const minX = (-pan.x - padding) / zoom
  const minY = (-pan.y - padding) / zoom
  const maxX = (-pan.x + viewWidth + padding) / zoom
  const maxY = (-pan.y + viewHeight + padding) / zoom

  return { minX, minY, maxX, maxY }
}

/**
 * Checks if a feature bounding box overlaps with the visible viewport
 */
export function isFeatureInViewport(points: Point[], vp: ViewportBox): boolean {
  if (!points || points.length === 0) return false
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  return maxX >= vp.minX && minX <= vp.maxX && maxY >= vp.minY && minY <= vp.maxY
}

/**
 * Main Canvas Render Pass
 */
export function renderVectorMapToCanvas(
  ctx: CanvasRenderingContext2D,
  mapData: MapVectorData,
  viewport: ViewportBox,
  zoom: number,
  mapLayer: 'standard' | 'satellite' = 'standard'
) {
  const isSatellite = mapLayer === 'satellite'
  const canvasW = mapData.canvasWidth || 3600
  const canvasH = mapData.canvasHeight || 2800

  // 1. Clear & Background
  ctx.fillStyle = isSatellite ? '#18232c' : (mapData.backgroundColor || '#F3F2EE')
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 2. Water Features
  if (mapData.water) {
    for (const w of mapData.water) {
      if (!isFeatureInViewport(w.points, viewport)) continue
      const pts = w.points
      if (!pts || pts.length < 2) continue

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }

      if (w.closed) {
        ctx.closePath()
        ctx.fillStyle = isSatellite ? '#1A365D' : w.color
        ctx.globalAlpha = w.opacity || 0.9
        ctx.fill()
        ctx.strokeStyle = '#7BB6E8'
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.strokeStyle = isSatellite ? '#1A365D' : w.color
        ctx.lineWidth = w.width || 60
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = w.opacity || 0.9
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  // 3. Zones
  if (mapData.zones) {
    for (const z of mapData.zones) {
      if (!isFeatureInViewport(z.points, viewport)) continue
      const pts = z.points
      if (!pts || pts.length < 3) continue

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.closePath()
      ctx.fillStyle = isSatellite ? 'rgba(30, 41, 59, 0.4)' : z.fillColor
      ctx.globalAlpha = z.opacity || 0.5
      ctx.fill()
      if (z.strokeColor) {
        ctx.strokeStyle = z.strokeColor
        ctx.lineWidth = z.strokeWidth || 1.5
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  // 4. Buildings Footprints (Level of Detail: zoom >= 0.52 only)
  if (zoom >= 0.52 && mapData.buildings && mapData.buildings.length > 0) {
    ctx.save()
    ctx.globalAlpha = isSatellite ? 0.6 : 0.88

    for (const b of mapData.buildings) {
      if (!isFeatureInViewport(b.points, viewport)) continue
      const pts = b.points
      if (!pts || pts.length < 3) continue

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.closePath()
      ctx.fillStyle = isSatellite ? '#2A3B4C' : (b.color || '#ECEFF1')
      ctx.fill()
      ctx.strokeStyle = isSatellite ? '#3B4E63' : (b.strokeColor || '#CFD8DC')
      ctx.lineWidth = b.strokeWidth || 0.6
      ctx.stroke()
    }
    ctx.restore()
  }

  // 5. Roads (Painter's algorithm: bridge shadows -> casings -> surfaces)
  if (mapData.roads && mapData.roads.length > 0) {
    const showAlleys = zoom >= 0.52

    // Filter visible roads
    const visibleRoads: RoadFeature[] = []
    for (const r of mapData.roads) {
      if (!showAlleys && r.type === 'alley') continue
      if (!isFeatureInViewport(r.points, viewport)) continue
      visibleRoads.push(r)
    }

    // Pass 5a: Bridge shadows
    for (const r of visibleRoads) {
      if (!r.isBridge) continue
      const pts = r.points
      if (!pts || pts.length < 2) continue

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = r.width + (r.casingWidth || 2) * 2 + 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.25
      ctx.stroke()
      ctx.restore()
    }

    // Pass 5b: Road casings (Border / Outlines)
    for (const r of visibleRoads) {
      const pts = r.points
      if (!pts || pts.length < 2) continue

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.strokeStyle = isSatellite ? '#475569' : (r.casingColor || '#94A3B8')
      ctx.lineWidth = r.width + (r.casingWidth || 2) * 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()
    }

    // Pass 5c: Road surfaces (Fill)
    for (const r of visibleRoads) {
      const pts = r.points
      if (!pts || pts.length < 2) continue

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.strokeStyle = isSatellite ? '#334155' : (r.color || '#FFFFFF')
      ctx.lineWidth = r.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (r.dashed) {
        ctx.setLineDash([8, 6])
      }
      ctx.stroke()
      ctx.restore()
    }
  }

  // 6. Railways
  if (mapData.railways && mapData.railways.length > 0) {
    for (const rw of mapData.railways) {
      if (!isFeatureInViewport(rw.points, viewport)) continue
      const pts = rw.points
      if (!pts || pts.length < 2) continue

      const halfW = (rw.width || 8) / 2
      const tieExtend = halfW + 2.5
      const sleeperSpacing = rw.sleeperSpacing || 12

      ctx.save()
      // Rails
      ctx.strokeStyle = rw.color || '#475569'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.stroke()

      // Sleepers (sample along segments)
      ctx.strokeStyle = '#1E293B'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'butt'
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const len = Math.hypot(dx, dy)
        if (len === 0) continue

        const dirX = dx / len
        const dirY = dy / len
        const normX = -dirY
        const normY = dirX

        for (let d = 0; d < len; d += sleeperSpacing) {
          const px = p1.x + dirX * d
          const py = p1.y + dirY * d
          ctx.beginPath()
          ctx.moveTo(px + normX * tieExtend, py + normY * tieExtend)
          ctx.lineTo(px - normX * tieExtend, py - normY * tieExtend)
          ctx.stroke()
        }
      }
      ctx.restore()
    }
  }

  // 7. Labels
  if (mapData.labels && mapData.labels.length > 0) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const l of mapData.labels) {
      if (l.x < viewport.minX || l.x > viewport.maxX || l.y < viewport.minY || l.y > viewport.maxY) continue

      ctx.save()
      ctx.translate(l.x, l.y)
      if (l.rotation) {
        ctx.rotate((l.rotation * Math.PI) / 180)
      }
      const weight = l.fontWeight === 'normal' ? '400' : '700'
      ctx.font = `${weight} ${l.fontSize || 12}px sans-serif`
      ctx.fillStyle = isSatellite ? '#E2E8F0' : l.color
      ctx.fillText(l.text, 0, 0)
      ctx.restore()
    }
    ctx.restore()
  }
}
