'use client'

import React from 'react'
import {
  MapPin,
  Utensils,
  ShoppingBag,
  Plane,
  Bus,
  Landmark,
  Building,
  Circle,
  Compass,
  Layers,
  Crosshair
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CaseLocation, RouteResult } from '@/lib/case-locations-data'

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
        {/* AUTHENTIC GOOGLE MAPS POI PINS                                      */}
        {/* =================================================================== */}
        {caseLocations.map((loc) => {
          const isOrigin = showRoutePolyline && loc.id === origin.id
          const isDestination = (showRoutePolyline && loc.id === destination.id) || loc.id === selectedPlace?.id

          const getPoiIcon = () => {
            switch (loc.category) {
              case 'food':
                return <Utensils className="size-2.5" />
              case 'shopping':
                return <ShoppingBag className="size-2.5" />
              case 'transit':
                return loc.id === 'loc-18' ? <Plane className="size-2.5" /> : <Bus className="size-2.5" />
              case 'finance':
                return <Landmark className="size-2.5" />
              case 'public':
                return <Building className="size-2.5" />
              case 'residential':
              default:
                return <MapPin className="size-2.5 fill-white" />
            }
          }

          return (
            <div
              key={loc.id}
              className="map-pin-btn absolute pointer-events-auto -translate-x-1/2 -translate-y-full cursor-pointer group"
              style={{ left: loc.x, top: loc.y }}
              onClick={(e) => {
                e.stopPropagation()
                handlePinClick(loc)
              }}
            >
              {/* 1. Origin Pin A: Google Maps Blue Radar Puck */}
              {isOrigin ? (
                <div className="flex flex-col items-center">
                  <div className="size-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-blue-400/40 animate-pulse">
                    <Circle className="size-2.5 fill-white text-white" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-[#1A73E8] text-white text-[9.5px] font-bold shadow-md whitespace-nowrap border border-white">
                    A: {loc.name}
                  </span>
                </div>
              ) : isDestination ? (
                /* 2. Destination Pin B / Selected Place Pin: Google Maps Teardrop Red Pin */
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <MapPin className="size-9 text-[#EA4335] fill-[#EA4335] drop-shadow-md" />
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-white shadow-inner" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#EA4335] text-white text-[9.5px] font-bold shadow-md whitespace-nowrap border border-white -mt-1">
                    {showRoutePolyline ? `B: ${loc.name}` : loc.name}
                  </span>
                </div>
              ) : (
                /* 3. Regular Google Maps POI Badge */
                <div className="flex flex-col items-center transition-transform hover:scale-110">
                  <div
                    className={cn(
                      'size-5 rounded-full flex items-center justify-center shadow-sm border border-white text-white transition-all',
                      loc.category === 'residential'
                        ? 'bg-slate-600'
                        : loc.category === 'food'
                        ? 'bg-orange-600'
                        : loc.category === 'shopping'
                        ? 'bg-blue-600'
                        : loc.category === 'transit'
                        ? 'bg-cyan-700'
                        : loc.category === 'finance'
                        ? 'bg-emerald-600'
                        : 'bg-gray-600',
                      'hover:ring-2 hover:ring-blue-500'
                    )}
                  >
                    {getPoiIcon()}
                  </div>
                  <span
                    style={{ paintOrder: 'stroke fill' }}
                    className="mt-0.5 text-[9px] font-semibold text-gray-800 whitespace-nowrap select-none drop-shadow-xs stroke-white stroke-[2.5px]"
                  >
                    {loc.shortName}
                  </span>
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
