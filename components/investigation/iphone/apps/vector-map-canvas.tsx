'use client'

import React from 'react'
import { Circle, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaseLocation, RouteResult, isScannedMapLocation } from '@/lib/case-locations-data'

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
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void
  handleMouseMove: (e: React.MouseEvent | React.TouchEvent) => void
  handleMouseUp: () => void
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

export function VectorMapCanvas({
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
  return (
    <div
      ref={mapContainerRef}
      onClick={handleMapClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      className={cn(
        'w-full h-full relative overflow-hidden transition-colors cursor-grab active:cursor-grabbing select-none',
        mapLayer === 'satellite' ? 'bg-[#18232c]' : 'bg-[#F5F7FA]'
      )}
    >
      {/* World Layer Transformed by Pan & Zoom & 3D Tilt in Navigation mode */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none transition-transform duration-300"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${
            is3DView ? 'perspective(700px) rotateX(28deg)' : ''
          }`,
          width: '1237px',
          height: '866px'
        }}
      >
        {/* =================================================================== */}
        {/* 1. MASTER FIGMA HIGH-RES WORLD MAP RENDER LAYER (Frame 96:9215)     */}
        {/* =================================================================== */}
        <img
          src="/images/cases/case_000/map/hanoi_master_map.png"
          alt="Bản đồ Hà Nội Master"
          className={cn(
            'absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-300',
            mapLayer === 'satellite' ? 'brightness-75 contrast-125 saturate-50' : 'brightness-100'
          )}
          draggable={false}
        />

        {/* =================================================================== */}
        {/* 2. DYNAMIC INTERACTIVE OVERLAY CANVAS                               */}
        {/* =================================================================== */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1237 866">
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

          {/* Live Traffic Overlay */}
          {showTrafficLayer && (
            <g fill="none" strokeLinecap="round" opacity="0.85">
              <path d="M 90,20 C 260,90 410,160 575,220" stroke="#0F9D58" strokeWidth="2.5" />
              <path d="M 575,220 C 620,240 640,290 635,360" stroke="#F4B400" strokeWidth="2.5" />
              <path d="M 635,360 C 625,440 605,525 660,640" stroke="#EA4335" strokeWidth="2.5" />
            </g>
          )}

          {/* 13. Point-to-Point Distance Connection Line */}
          {showRoutePolyline && origin && destination && origin.id !== destination.id && (
            <g className="pointer-events-none">
              {/* High-visibility white casing */}
              <line
                x1={origin.x}
                y1={origin.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#FFFFFF"
                strokeWidth={7}
                strokeLinecap="round"
              />
              {/* Vibrant dashed connection line */}
              <line
                x1={origin.x}
                y1={origin.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#1A73E8"
                strokeWidth={4.5}
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              {/* Endpoint anchors */}
              <circle cx={origin.x} cy={origin.y} r={6} fill="#1A73E8" stroke="#FFFFFF" strokeWidth={2.5} />
              <circle cx={destination.x} cy={destination.y} r={6} fill="#EA4335" stroke="#FFFFFF" strokeWidth={2.5} />
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
              left: (origin.x + destination.x) / 2,
              top: (origin.y + destination.y) / 2 - 14
            }}
          >
            <Compass className="size-3 text-white" />
            <span>{activeRoute.distanceText}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* INTERACTIVE OVERLAYS DIRECTLY ON TOP OF SCANNED MAP DOTS             */}
        {/* =================================================================== */}
        {caseLocations
          .filter((loc) => isScannedMapLocation(loc.id))
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
                {/* 1. Origin Pin A: Pulsing Blue Selection Ring */}
                {isOrigin ? (
                  <div className="relative size-7 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#1A73E8]/35 animate-ping opacity-75" />
                    <div className="size-5 rounded-full border-2 border-white bg-[#1A73E8] shadow-lg ring-2 ring-[#1A73E8] flex items-center justify-center">
                      <Circle className="size-1.5 fill-white text-white" />
                    </div>
                  </div>
                ) : isDestination ? (
                  /* 2. Destination Pin B: Pulsing Red Selection Ring */
                  <div className="relative size-7 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#EA4335]/35 animate-ping opacity-75" />
                    <div className="size-5 rounded-full border-2 border-white bg-[#EA4335] shadow-lg ring-2 ring-[#EA4335] flex items-center justify-center">
                      <Circle className="size-1.5 fill-white text-white" />
                    </div>
                  </div>
                ) : isSelected ? (
                  /* 3. Selected Place: Amber Highlight Ring */
                  <div className="relative size-7 flex items-center justify-center">
                    <div className="size-5 rounded-full border-2 border-white bg-[#FBBC04] shadow-lg ring-2 ring-[#FBBC04] flex items-center justify-center animate-pulse">
                      <Circle className="size-1.5 fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  /* 4. Normal Dot Overlay: Clean White-Bordered Circular Hotspot (No Text) */
                  <div className="size-5 rounded-full border-2 border-white/80 bg-transparent hover:scale-125 hover:border-blue-400 hover:bg-blue-500/25 transition-all shadow-xs" />
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
          {scaleMeters} m
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
