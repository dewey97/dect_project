'use client'

import React from 'react'
import { Circle, Compass, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isScannedMapLocation, type CaseLocation, type RouteResult } from '@/lib/case-locations-data'
import type { MapVectorData } from '@/lib/types/map-vector'
import { pointsToSvgPath, generateRailwayPaths } from '@/lib/maps/vector-utils'
import { calculateVisibleBounds, renderVectorMapToCanvas } from '@/lib/maps/canvas-renderer'

export interface VectorMapCanvasProps {
  pan: { x: number; y: number }
  zoom: number
  is3DView: boolean
  mapLayer: 'standard' | 'satellite'
  showTrafficLayer: boolean
  origin: CaseLocation
  destination: CaseLocation
  activeRoute: RouteResult
  baseRoute: RouteResult
  useAlternativeRoute: boolean
  setUseAlternativeRoute: (val: boolean) => void
  isNavigating: boolean
  vehiclePos: { x: number; y: number }
  droppedPin?: { x: number; y: number; title: string } | null
  caseLocations: CaseLocation[]
  selectedPlace: CaseLocation | null
  handlePinClick: (loc: CaseLocation) => void
  handleMapClick: (e: React.MouseEvent) => void
  handleMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  handleMouseMove?: (e: React.MouseEvent | React.TouchEvent) => void
  handleMouseUp?: () => void
  handlePointerDown?: (e: React.PointerEvent) => void
  handlePointerMove?: (e: React.PointerEvent) => void
  handlePointerUp?: (e: React.PointerEvent) => void
  handleWheel?: (e: React.WheelEvent) => void
  isDragging?: boolean
  customMapVector?: MapVectorData | null
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  scaleMeters: number
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setIs3DView: React.Dispatch<React.SetStateAction<boolean>>
  setShowLayersSheet: (val: boolean) => void
  handleCenterMyLocation: () => void
  isCentered: boolean
  setIsCentered: (val: boolean) => void
  routeMidpoint: { x: number; y: number }
  showRoutePolyline?: boolean
}

function VectorMapCanvasComponent({
  pan,
  zoom,
  is3DView,
  mapLayer,
  showTrafficLayer,
  origin,
  destination,
  activeRoute,
  baseRoute,
  useAlternativeRoute,
  setUseAlternativeRoute,
  isNavigating,
  vehiclePos,
  caseLocations,
  selectedPlace,
  handlePinClick,
  handleMapClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleWheel,
  isDragging = false,
  customMapVector,
  mapContainerRef,
  scaleMeters,
  setPan,
  setZoom,
  setIs3DView,
  setShowLayersSheet,
  handleCenterMyLocation,
  isCentered,
  setIsCentered,
  routeMidpoint,
  showRoutePolyline = true
}: VectorMapCanvasProps) {
  const isCustomVector = Boolean(
    customMapVector && (customMapVector.water.length > 0 || customMapVector.roads.length > 0)
  )
  const mapWidth = customMapVector?.canvasWidth || 1237
  const mapHeight = customMapVector?.canvasHeight || 866

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Render the vector map onto HTML5 Canvas 2D with Viewport Culling & LOD
  // Bypasses the DOM tree entirely for 2,000+ buildings and 726 roads.
  // Only elements inside the visible phone viewport are rasterized by the GPU.
  React.useEffect(() => {
    if (!isCustomVector || !customMapVector) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const container = mapContainerRef.current
    const viewW = container ? container.clientWidth : 400
    const viewH = container ? container.clientHeight : 700

    const visibleBounds = calculateVisibleBounds(pan, zoom, viewW, viewH, 120)
    renderVectorMapToCanvas(ctx, customMapVector, visibleBounds, zoom, mapLayer)
  }, [isCustomVector, customMapVector, pan, zoom, mapLayer, mapContainerRef])

  return (
    <div
      ref={mapContainerRef}
      onClick={handleMapClick}
      onPointerDown={handlePointerDown || handleMouseDown}
      onPointerMove={handlePointerMove || handleMouseMove}
      onPointerUp={handlePointerUp || handleMouseUp}
      onPointerCancel={handlePointerUp || handleMouseUp}
      onWheel={handleWheel}
      className={cn(
        'w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none',
        mapLayer === 'satellite' ? 'bg-[#18232c]' : ''
      )}
      style={{
        backgroundColor: mapLayer === 'satellite' ? '#18232c' : (customMapVector?.backgroundColor || '#F3F2EE')
      }}
    >
      {/* World Layer Transformed by Pan & Zoom & 3D Tilt in Navigation mode */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom}) ${
            is3DView ? 'perspective(700px) rotateX(28deg)' : ''
          }`,
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* =================================================================== */}
        {/* 1. MASTER WORLD MAP LAYER — HIGH-PERFORMANCE 2D CANVAS              */}
        {/* =================================================================== */}
        {isCustomVector && customMapVector ? (
          <canvas
            ref={canvasRef}
            width={mapWidth}
            height={mapHeight}
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
          />
        ) : null}

        {/* =================================================================== */}
        {/* 2. DYNAMIC INTERACTIVE OVERLAY CANVAS                               */}
        {/* =================================================================== */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#55CBE8" />
              <stop offset="50%" stopColor="#56CCF2" />
              <stop offset="100%" stopColor="#49C2E8" />
            </linearGradient>

            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1A73E8" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* 13. Real-World Road Route Polyline using Dijkstra */}
          {showRoutePolyline && origin && destination && origin.id !== destination.id && (
            <g className="pointer-events-none">
              {/* Optional Alternative Route Path */}
              {activeRoute.alternativePoints && activeRoute.alternativePoints.length >= 2 && (
                <path
                  d={pointsToSvgPath(activeRoute.alternativePoints, false, false)}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.55}
                />
              )}

              {/* High-visibility white casing for road path */}
              <path
                d={pointsToSvgPath(
                  activeRoute.points && activeRoute.points.length >= 2
                    ? activeRoute.points
                    : [{ x: origin.x, y: origin.y }, { x: destination.x, y: destination.y }],
                  false,
                  false
                )}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main vibrant GPS Route along real roads */}
              <path
                d={pointsToSvgPath(
                  activeRoute.points && activeRoute.points.length >= 2
                    ? activeRoute.points
                    : [{ x: origin.x, y: origin.y }, { x: destination.x, y: destination.y }],
                  false,
                  false
                )}
                fill="none"
                stroke="#1A73E8"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Directional Endpoint Anchors */}
              <circle cx={origin.x} cy={origin.y} r={7} fill="#1A73E8" stroke="#FFFFFF" strokeWidth={2.5} />
              <circle cx={destination.x} cy={destination.y} r={7} fill="#EA4335" stroke="#FFFFFF" strokeWidth={2.5} />
            </g>
          )}

          {/* Real-Time Moving Vehicle / Navigation Puck */}
          {isNavigating && (
            <g
              transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}
              className="transition-transform duration-700 pointer-events-none"
            >
              <path
                d="M 0,-6 L -20,-45 L 20,-45 Z"
                fill="url(#riverGrad)"
                opacity="0.35"
              />
              <circle cx="0" cy="0" r="10" fill="#1A73E8" stroke="#FFFFFF" strokeWidth="3" className="shadow-2xl" />
              <path d="M 0,-4 L 3.5,4 L 0,2 L -3.5,4 Z" fill="#FFFFFF" />
            </g>
          )}
        </svg>

        {/* =================================================================== */}
        {/* FLOATING POINT-TO-POINT DISTANCE BUBBLE                             */}
        {/* =================================================================== */}
        {showRoutePolyline && origin && destination && origin.id !== destination.id && (
          <div
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 shadow-xl rounded-full px-3 py-1 bg-[#1A73E8] text-white flex items-center gap-1.5 text-[11px] font-bold border-2 border-white animate-in zoom-in-75 cursor-default select-none z-20"
            style={{
              left: routeMidpoint?.x ?? (origin.x + destination.x) / 2,
              top: (routeMidpoint?.y ?? (origin.y + destination.y) / 2) - 14
            }}
          >
            <Compass className="size-3 text-white" />
            <span>{activeRoute.distanceText} {activeRoute.durationText ? `• ${activeRoute.durationText}` : ''}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* INTERACTIVE OVERLAYS DIRECTLY ON TOP OF SCANNED MAP DOTS             */}
        {/* =================================================================== */}
        {caseLocations
          .filter((loc) => (isCustomVector ? true : isScannedMapLocation(loc.id)))
          .map((loc) => {
            const isOrigin = showRoutePolyline && loc.id === origin.id
            const isDestination = (showRoutePolyline && loc.id === destination.id)
            const isSelected = loc.id === selectedPlace?.id

            return (
              <div
                key={loc.id}
                className="map-pin-btn absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform active:scale-95 group"
                style={{ left: loc.x, top: loc.y }}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePinClick(loc)
                }}
              >
                {/* 1. Origin Pin A: Pulsing Blue Selection Ring (Chỉ hiện khi đang bật Chỉ đường) */}
                {isOrigin ? (
                  <div className="relative size-7 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#1A73E8]/35 animate-ping opacity-75" />
                    <div className="size-5 rounded-full border-2 border-white bg-[#1A73E8] shadow-lg ring-2 ring-[#1A73E8] flex items-center justify-center">
                      <Circle className="size-1.5 fill-white text-white" />
                    </div>
                  </div>
                ) : isDestination ? (
                  /* 2. Destination Pin B: Pulsing Red Selection Ring (Chỉ hiện khi đang bật Chỉ đường) */
                  <div className="relative size-7 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#EA4335]/35 animate-ping opacity-75" />
                    <div className="size-5 rounded-full border-2 border-white bg-[#EA4335] shadow-lg ring-2 ring-[#EA4335] flex items-center justify-center">
                      <Circle className="size-1.5 fill-white text-white" />
                    </div>
                  </div>
                ) : isSelected ? (
                  /* 3. Ghim tìm kiếm khi Người chơi Tra cứu địa điểm (Ghim đỏ giọt nước chuẩn Apple/Google Maps) */
                  <div className="relative -translate-y-3.5 cursor-pointer z-30 transition-transform animate-in zoom-in-75 duration-200">
                    <div className="flex flex-col items-center">
                      <div className="size-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(234,67,53,0.55)] border-2 border-white ring-2 ring-[#EA4335]/30">
                        <MapPin className="size-4.5 fill-white text-white" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#EA4335] rotate-45 -mt-1 shadow-xs" />
                      <div className="w-3.5 h-1 bg-black/35 rounded-full blur-[1px] mt-0.5" />
                    </div>
                  </div>
                ) : (
                  /* 4. Default Clean POI Pin: Điểm mốc bản đồ trang nhã, đồng nhất cho mọi POI, không phân màu số */
                  <div className="flex flex-col items-center transition-transform group-hover:scale-110">
                    <div className="size-3.5 rounded-full border border-white shadow-xs flex items-center justify-center transition-all bg-[#475569]">
                      <div className="size-1 rounded-full bg-white" />
                    </div>
                    {zoom >= 0.38 && (
                      <span className="mt-0.5 px-1 py-0.2 text-[8.5px] font-medium text-slate-700 bg-white/95 rounded shadow-xs border border-slate-200/50 whitespace-nowrap max-w-[100px] truncate pointer-events-none">
                        {loc.shortName || loc.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* ======================================================================= */}
      {/* MAP FLOATING CONTROLS                                                   */}
      {/* ======================================================================= */}
      <div className="absolute bottom-4 left-3 z-20 pointer-events-none flex flex-col items-start gap-0.5">
        <div className="h-1 w-12 border-b-2 border-l-2 border-r-2 border-gray-700 bg-black/10" />
        <span className="text-[9px] font-mono font-bold text-gray-700 drop-shadow-xs bg-white/70 px-1 rounded">
          {scaleMeters >= 1000 ? `${(scaleMeters / 1000).toFixed(1)} km` : `${scaleMeters} m`}
        </span>
      </div>

      <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => {
              setZoom((z) => Math.min(2.5, z + 0.25))
              setIsCentered(false)
            }}
            className="size-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 border-b border-gray-100 font-bold text-sm cursor-pointer"
            title="Phóng to"
          >
            +
          </button>
          <button
            onClick={() => {
              setZoom((z) => Math.max(0.35, z - 0.25))
              setIsCentered(false)
            }}
            className="size-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-sm cursor-pointer"
            title="Thu nhỏ"
          >
            −
          </button>
        </div>
      </div>
    </div>
  )
}

export const VectorMapCanvas = React.memo(VectorMapCanvasComponent)
