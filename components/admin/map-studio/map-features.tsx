'use client'

import React, { useMemo } from 'react'
import type {
  Point,
  WaterFeature,
  RoadFeature,
  RailwayFeature,
  ZoneFeature,
  PoiFeature,
  LabelFeature,
  PoiCategory
} from '@/types/map-vector'
import { pointsToSvgPath, generateRailwayPaths } from '@/lib/map-vector-utils'
import { cn } from '@/lib/utils'

export const POI_CATEGORY_CONFIG: Record<
  PoiCategory,
  { label: string; color: string; badgeBg: string }
> = {
  crime_scene: { label: 'Hiện trường vụ án', color: '#EA4335', badgeBg: 'bg-red-500' },
  residential: { label: 'Nhà ở / Nhà trọ', color: '#1A73E8', badgeBg: 'bg-blue-500' },
  transit: { label: 'Giao thông / Bến bãi', color: '#0F9D58', badgeBg: 'bg-emerald-500' },
  dock: { label: 'Cảng biển / Bến đò', color: '#0284C7', badgeBg: 'bg-sky-500' },
  warehouse: { label: 'Kho hàng / Xưởng', color: '#F59E0B', badgeBg: 'bg-amber-500' },
  food: { label: 'Quán ăn / Nhà hàng', color: '#EA580C', badgeBg: 'bg-orange-500' },
  secret: { label: 'Điểm bí mật / Khả nghi', color: '#9333EA', badgeBg: 'bg-purple-500' }
}

export const MemoWaterFeature = React.memo(function WaterFeatureItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: WaterFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  const d = useMemo(
    () => pointsToSvgPath(feature.points, feature.closed, feature.smooth),
    [feature.points, feature.closed, feature.smooth]
  )

  return (
    <g
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer group', isSelected && 'cursor-move')}
    >
      {feature.closed ? (
        <path
          d={d}
          fill={feature.color}
          opacity={feature.opacity}
          stroke={isSelected ? '#2563EB' : '#7BB6E8'}
          strokeWidth={isSelected ? 3 : 1}
        />
      ) : (
        <path
          d={d}
          fill="none"
          stroke={feature.color}
          strokeWidth={feature.width || 80}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={feature.opacity}
        />
      )}
    </g>
  )
})

export const MemoZoneFeature = React.memo(function ZoneFeatureItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: ZoneFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  const d = useMemo(
    () => pointsToSvgPath(feature.points, true, false),
    [feature.points]
  )

  return (
    <path
      d={d}
      fill={feature.fillColor}
      stroke={isSelected ? '#2563EB' : feature.strokeColor || '#CBD5E1'}
      strokeWidth={isSelected ? 3 : feature.strokeWidth || 1.5}
      opacity={feature.opacity}
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer', isSelected && 'cursor-move')}
    />
  )
})

export const RoadCasingItem = React.memo(function RoadCasingItem({
  feature,
  isSelected
}: {
  feature: RoadFeature
  isSelected: boolean
}) {
  const d = useMemo(
    () => pointsToSvgPath(feature.points, false, feature.smooth),
    [feature.points, feature.smooth]
  )

  return (
    <g>
      {/* Bridge Drop Shadow */}
      {feature.isBridge && (
        <path
          d={d}
          fill="none"
          stroke="#000000"
          strokeWidth={feature.width + (feature.casingWidth || 2) * 2 + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />
      )}
      {/* Road Casing (Border / Viền ngoài) */}
      <path
        d={d}
        fill="none"
        stroke={isSelected ? '#2563EB' : feature.casingColor || '#CBD5E1'}
        strokeWidth={feature.width + (feature.casingWidth || 2) * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
})

export const RoadSurfaceItem = React.memo(function RoadSurfaceItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: RoadFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  const d = useMemo(
    () => pointsToSvgPath(feature.points, false, feature.smooth),
    [feature.points, feature.smooth]
  )

  return (
    <path
      d={d}
      fill="none"
      stroke={feature.color || '#FFFFFF'}
      strokeWidth={feature.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={feature.dashed ? '8 6' : undefined}
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer', isSelected && 'cursor-move')}
    />
  )
})

export const MemoRoadFeature = React.memo(function RoadFeatureItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: RoadFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  return (
    <g>
      <RoadCasingItem feature={feature} isSelected={isSelected} />
      <RoadSurfaceItem
        feature={feature}
        isSelected={isSelected}
        onSelect={onSelect}
        onStartDrag={onStartDrag}
      />
    </g>
  )
})

export const MemoRailwayFeature = React.memo(function RailwayFeatureItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: RailwayFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  const { railsPath, sleepersPath } = useMemo(
    () => generateRailwayPaths(feature.points, feature.width, feature.sleeperSpacing),
    [feature.points, feature.width, feature.sleeperSpacing]
  )

  return (
    <g
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer', isSelected && 'cursor-move')}
    >
      {/* Sleepers */}
      <path d={sleepersPath} stroke="#1E293B" strokeWidth="2.5" strokeLinecap="butt" />
      {/* Steel Rails */}
      <path d={railsPath} stroke={feature.color || '#475569'} strokeWidth="1.8" fill="none" />
    </g>
  )
})

export const MemoLabelFeature = React.memo(function LabelFeatureItem({
  feature,
  isSelected,
  onSelect,
  onStartDrag
}: {
  feature: LabelFeature
  isSelected: boolean
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  return (
    <text
      x={feature.x}
      y={feature.y}
      fill={feature.color}
      fontSize={feature.fontSize}
      letterSpacing={feature.letterSpacing ? `${feature.letterSpacing}px` : undefined}
      fontWeight={feature.fontWeight || 'bold'}
      transform={`rotate(${feature.rotation || 0}, ${feature.x}, ${feature.y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer select-none font-sans', isSelected && 'cursor-move')}
    >
      {feature.text}
    </text>
  )
})

export const MemoPoiFeature = React.memo(function PoiFeatureItem({
  feature,
  isSelected,
  viewMode,
  onSelect,
  onStartDrag
}: {
  feature: PoiFeature
  isSelected: boolean
  viewMode: 'admin' | 'player'
  onSelect: (id: string) => void
  onStartDrag?: (e: React.MouseEvent, id: string) => void
}) {
  if (viewMode === 'player') return null

  return (
    <g
      transform={`translate(${feature.x}, ${feature.y})`}
      onMouseDown={(e) => onStartDrag?.(e, feature.id)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(feature.id)
      }}
      className={cn('cursor-pointer group', isSelected && 'cursor-move')}
    >
      {/* Outer selection ring */}
      {isSelected && (
        <circle r="16" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="4 3" />
      )}

      {/* Uniform Clean Marker Dot — Tất cả POI đều như nhau, không số, không màu mè, không toả ra */}
      <circle
        r="7"
        fill="#475569"
        stroke="#FFFFFF"
        strokeWidth="2"
        className="shadow-sm transition-transform group-hover:scale-125"
      />
      <circle
        r="2"
        fill="#FFFFFF"
      />

      {/* POI Title text underneath without enclosing box */}
      <text
        y="22"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fontWeight="600"
        fill="#0F172A"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
        paintOrder="stroke fill"
        className="select-none"
      >
        {feature.shortName || feature.name}
      </text>
    </g>
  )
})

export const ActiveDrawingPreview = React.memo(function ActiveDrawingPreviewComponent({
  drawingPoints,
  cursorPos,
  candidateLineRef,
  candidateDotRef
}: {
  drawingPoints: Point[]
  cursorPos?: Point
  candidateLineRef?: React.RefObject<SVGLineElement | null>
  candidateDotRef?: React.RefObject<SVGCircleElement | null>
}) {
  if (drawingPoints.length === 0) return null
  const lastPt = drawingPoints[drawingPoints.length - 1]
  const curX = cursorPos?.x ?? lastPt.x
  const curY = cursorPos?.y ?? lastPt.y

  return (
    <g pointerEvents="none">
      {/* Points joined so far */}
      <path
        d={pointsToSvgPath(drawingPoints, false, false)}
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeDasharray="6 4"
      />

      {/* Candidate line from last point to current mouse position */}
      {drawingPoints.length > 0 && (
        <line
          ref={candidateLineRef}
          x1={lastPt.x}
          y1={lastPt.y}
          x2={curX}
          y2={curY}
          stroke="#2563EB"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      )}

      {/* Drawn vertex dots */}
      {drawingPoints.map((pt, i) => (
        <circle key={`dp-${i}`} cx={pt.x} cy={pt.y} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
      ))}

      {/* Current cursor target dot */}
      <circle
        ref={candidateDotRef}
        cx={curX}
        cy={curY}
        r="6"
        fill="#EA580C"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </g>
  )
})
