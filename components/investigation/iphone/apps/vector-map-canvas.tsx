'use client'

import React from 'react'
import {
  Car,
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
  droppedPin: { x: number; y: number; title: string } | null
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
  droppedPin,
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
          width: '2400px',
          height: '2000px'
        }}
      >
        {/* =================================================================== */}
        {/* HIGH-PRECISION VECTOR MAP CANVAS (EXACT MATCH TO USER'S MAP IMAGE) */}
        {/* =================================================================== */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2400 2000">
          <defs>
            {/* Image 2 Track Pattern: Light gray center rail with perpendicular sleepers */}
            <pattern id="railTrackPattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <line x1="2" y1="6" x2="10" y2="6" stroke={mapLayer === 'satellite' ? '#64748B' : '#94A3B8'} strokeWidth="1.8" />
              <line x1="6" y1="0" x2="6" y2="12" stroke={mapLayer === 'satellite' ? '#94A3B8' : '#CBD5E1'} strokeWidth="2.5" />
            </pattern>

            {/* Bright Cyan Water Wave Gradient (Matching Google Maps Water #55CBE8) */}
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={mapLayer === 'satellite' ? '#143147' : '#55CBE8'} />
              <stop offset="50%" stopColor={mapLayer === 'satellite' ? '#0f2638' : '#56CCF2'} />
              <stop offset="100%" stopColor={mapLayer === 'satellite' ? '#0b2030' : '#49C2E8'} />
            </linearGradient>

            {/* Route Glow Effect */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1A73E8" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* 1. Base Map Background Land */}
          <rect width="2400" height="2000" fill={mapLayer === 'satellite' ? '#15212B' : '#F5F7FA'} />

          {/* 2. Red River Water Surface (Sông Hồng - Upper Curve as in Uploaded Image) */}
          <path
            d="M 0,0 
               L 450,0 
               C 650,80 900,160 1200,260 
               C 1500,360 1850,550 2400,820 
               L 2400,0 Z"
            fill="url(#riverGrad)"
            stroke="#49C2E8"
            strokeWidth="2"
          />

          {/* River Bank Floodplain (Light Pastel Green #C5F5CF along the water edge) */}
          <path
            d="M 450,0 
               C 650,80 900,160 1200,260 
               C 1500,360 1850,550 2400,820
               L 2400,1050
               C 1950,820 1620,600 1320,440
               C 1050,300 780,210 520,130
               L 0,0 Z"
            fill={mapLayer === 'satellite' ? '#1E392A' : '#C5F5CF'}
            opacity="0.9"
          />

          {/* Natural Riverbank Inlets & Jetties (Angular cutouts extending into river) */}
          <g fill={mapLayer === 'satellite' ? '#1E392A' : '#C5F5CF'}>
            <polygon points="1220,265 1250,220 1290,265" />
            <polygon points="1680,485 1710,430 1760,495" />
            <polygon points="2050,670 2090,620 2130,685" />
          </g>

          {/* "Red River" Tilted Water Label */}
          <text
            x="1350"
            y="220"
            fill={mapLayer === 'satellite' ? '#7BBCE6' : '#2B7A97'}
            fontSize="18"
            fontWeight="600"
            letterSpacing="6"
            opacity="0.65"
            transform="rotate(18 1350 220)"
          >
            Red River (Sông Hồng)
          </text>

          {/* 3. Garden / Agricultural Zone ("Vườn nhà B...") on the right */}
          <g transform="translate(1950, 880)">
            <path d="M 0,0 C 80,-40 220,-20 300,40 L 300,280 C 200,300 80,240 0,180 Z" fill={mapLayer === 'satellite' ? '#234733' : '#DCFCE7'} opacity="0.8" />
            {/* Green Tree Icon Badge */}
            <g transform="translate(50, 40)">
              <circle cx="16" cy="16" r="14" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 16,7 L 23,20 L 19,20 L 22,25 L 10,25 L 13,20 L 9,20 Z" fill="#FFFFFF" />
              <rect x="14.5" y="25" width="3" height="4" fill="#FFFFFF" />
            </g>
            <text x="85" y="62" fill="#15803D" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
              Vườn cây sinh thái
            </text>
          </g>

          {/* 4. Lakes on the Left Side (Matching exact shapes from uploaded image) */}
          <g fill="url(#riverGrad)" stroke="#49C2E8" strokeWidth="1.5">
            {/* Top-Left Large L-Shaped Lake */}
            <path d="M 180,280 C 260,260 480,270 480,440 L 480,560 C 340,560 380,420 180,440 Z" />

            {/* Mid-Left Polygon Lake */}
            <path d="M 0,920 L 180,940 L 160,1150 L 0,1120 Z" />

            {/* Mid-Left Elongated Thin Pond */}
            <path d="M 650,1320 C 690,1310 740,1360 700,1520 C 660,1540 630,1460 650,1320 Z" />

            {/* Lower-Left Lake Shapes */}
            <path d="M 0,1220 L 150,1240 L 130,1480 L 0,1420 Z" />
            <path d="M 0,1550 L 220,1580 L 180,1850 L 0,1800 Z" />
          </g>

          {/* Lake Border Green Patches */}
          <g fill={mapLayer === 'satellite' ? '#1E392A' : '#DCFCE7'} opacity="0.7">
            <path d="M 480,440 C 520,380 580,420 540,520 Z" />
            <path d="M 160,1150 C 200,1120 240,1180 180,1220 Z" />
          </g>

          {/* 5. Organic Secondary Street Network Grid (Exact match to neighborhood lines) */}
          <g stroke={mapLayer === 'satellite' ? '#334155' : '#D3DBE5'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* West Neighborhood Street Grid */}
            <path d="M 0,180 L 420,240 L 450,420" />
            <path d="M 150,80 L 150,280 M 240,80 L 240,270 M 320,60 L 320,250" />
            <path d="M 0,550 L 350,560 L 520,580" />
            <path d="M 220,560 L 220,920 M 320,560 L 320,950 M 420,570 L 420,1050" />

            {/* Central Residential Streets (Tổ DP số 31 area) */}
            <path d="M 520,580 L 980,590 L 1150,600 L 1650,650 M 520,720 L 1050,730 L 1550,780 M 520,880 L 1120,890 L 1750,940" />
            <path d="M 720,580 L 720,1250 M 850,590 L 850,1350 M 980,590 L 980,1450 M 1150,600 L 1150,1550 M 1350,620 L 1350,1650 M 1550,650 L 1550,1750 M 1750,700 L 1750,1850" />
            <path d="M 1850,920 L 2400,1050 M 1850,1080 L 2400,1200 M 1850,1240 L 2400,1350 M 1850,1400 L 2400,1500" />
            <path d="M 1950,950 L 1950,1650 M 2100,980 L 2100,1750 M 2250,1020 L 2250,1850" />

            {/* South-West Branching Alleys */}
            <path d="M 0,1380 L 520,1420 L 950,1480" />
            <path d="M 0,1650 L 620,1690 L 1050,1750" />
            <path d="M 220,1240 L 220,1880 M 350,1260 L 350,1920 M 480,1280 L 480,1950 M 620,1420 L 620,1980" />
          </g>

          {/* 6. Main Arterial Highway ("ĐƯỜNG BỜ SÔNG" / Đ. Nguyễn Khoái in uploaded image) */}
          {/* Outer Gray Border Casing */}
          <path
            d="M 180,40 
               C 520,180 820,320 1150,440 
               C 1240,480 1280,580 1270,720 
               C 1250,880 1210,1050 1320,1280 
               C 1420,1520 1520,1720 1680,2000"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#334155' : '#BDC5D1'}
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Light Gray Road Surface */}
          <path
            d="M 180,40 
               C 520,180 820,320 1150,440 
               C 1240,480 1280,580 1270,720 
               C 1250,880 1210,1050 1320,1280 
               C 1420,1520 1520,1720 1680,2000"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#475569' : '#FFFFFF'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 7. Collector Road ("PHỐ CẦU CẢNG" / P. Thanh Lân in uploaded image) */}
          <path
            d="M 550,580 
               L 550,1150 
               C 550,1350 520,1650 500,2000"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#334155' : '#CBD2DC'}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 550,580 
               L 550,1150 
               C 550,1350 520,1650 500,2000"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#475569' : '#FFFFFF'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 8. Steel Blue Highway CT37 (Bottom-Right Diagonal Expressway in uploaded image) */}
          <path
            d="M 1520,2000 
               L 2400,950"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#1E293B' : '#475569'}
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M 1520,2000 
               L 2400,950"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#3B82F6' : '#5A7191'}
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* CT37 Highway Shield Yellow Badge */}
          <g transform="translate(2020, 1380) rotate(-48)">
            <rect x="-24" y="-11" width="48" height="22" rx="5" fill="#FFD600" stroke="#000000" strokeWidth="1" />
            <text x="0" y="4" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              CT37
            </text>
          </g>

          {/* 9. Bus Stop Station Badges along Main Road (Matching Bus Icons in uploaded image) */}
          {[
            { x: 860, y: 340 },
            { x: 1010, y: 400 },
            { x: 1250, y: 820 },
            { x: 1570, y: 1780 }
          ].map((busPt, idx) => (
            <g key={idx} transform={`translate(${busPt.x}, ${busPt.y})`}>
              <circle cx="0" cy="0" r="10" fill="#3B5998" stroke="#FFFFFF" strokeWidth="2" className="shadow-md" />
              <Bus className="size-3 text-white -translate-x-1.5 -translate-y-1.5" />
            </g>
          ))}

          {/* 10. RAILWAY TRACK (Image 2 Sleeper Pattern along Case Corridor) */}
          <g fill="none">
            <path
              d="M 1680,2000 L 1320,1280 L 1210,1050 L 1270,720 L 1240,480 L 1150,440 L 820,320 L 520,180 L 180,40"
              stroke={mapLayer === 'satellite' ? '#64748B' : '#94A3B8'}
              strokeWidth="2.5"
            />
            <path
              d="M 1680,2000 L 1320,1280 L 1210,1050 L 1270,720 L 1240,480 L 1150,440 L 820,320 L 520,180 L 180,40"
              stroke="url(#railTrackPattern)"
              strokeWidth="12"
            />
          </g>

          {/* Railway Crossing Danger Sign */}
          <g transform="translate(1260, 950)">
            <circle cx="0" cy="0" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">✕</text>
          </g>

          {/* 11. STREET & AREA TEXT LABELS (Clean Case-Specific Labels Only) */}
          <g style={{ paintOrder: 'stroke fill' }} stroke="#FFFFFF" strokeWidth="3.5" fill="#334155" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            {/* Main Road Curved Street Name Labels */}
            <text transform="translate(580, 220) rotate(22)">ĐƯỜNG BỜ SÔNG</text>
            <text transform="translate(1310, 850) rotate(78)">ĐƯỜNG BỜ SÔNG</text>
            <text transform="translate(1420, 1500) rotate(62)">ĐƯỜNG BỜ KÈ</text>

            {/* Collector Street Name Label */}
            <text transform="translate(565, 920) rotate(90)">PHỐ CẦU CẢNG</text>
          </g>

          {/* Ward / Area District Label ("TỔ DP SỐ 31" / "PHÂN KHU CẢNG" in Uploaded Image) */}
          <g fill="#475569" fontSize="15" fontWeight="800" letterSpacing="3" fontFamily="sans-serif" opacity="0.8">
            <text x="1350" y="1120">TỔ DÂN PHỐ SỐ 31</text>
            <text x="1350" y="1145" fontSize="12" fill="#64748B" fontWeight="600" letterSpacing="1">
              (PHÂN KHU CẢNG)
            </text>
          </g>

          {/* 12. Live Traffic Overlay */}
          {showTrafficLayer && (
            <g fill="none" strokeLinecap="round" opacity="0.85">
              <path d="M 180,40 C 520,180 820,320 1150,440" stroke="#0F9D58" strokeWidth="4" />
              <path d="M 1150,440 C 1240,480 1280,580 1270,720" stroke="#F4B400" strokeWidth="4" />
              <path d="M 1270,720 C 1250,880 1210,1050 1320,1280" stroke="#EA4335" strokeWidth="4" />
              <path d="M 1320,1280 C 1420,1520 1520,1720 1680,2000" stroke="#0F9D58" strokeWidth="4" />
            </g>
          )}

          {/* 13. Navigation Route Polylines (Rendered when in Directions or Navigation mode) */}
          {showRoutePolyline && (
            <>
              {/* Alternative Route (Gray Line) */}
              {baseRoute.alternativePoints && baseRoute.alternativePoints.length > 1 && (
                <g
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => setUseAlternativeRoute(!useAlternativeRoute)}
                >
                  <path
                    d={baseRoute.alternativePoints.reduce(
                      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
                      ''
                    )}
                    stroke={useAlternativeRoute ? '#1A73E8' : '#9AA0A6'}
                    strokeWidth={useAlternativeRoute ? 7 : 5.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={useAlternativeRoute ? 1 : 0.75}
                  />
                </g>
              )}

              {/* Primary Route (Google Maps Blue Polyline with White Casing) */}
              {baseRoute.points.length > 1 && (
                <g
                  filter="url(#routeGlow)"
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => setUseAlternativeRoute(false)}
                >
                  <path
                    d={baseRoute.points.reduce(
                      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
                      ''
                    )}
                    stroke="#FFFFFF"
                    strokeWidth={useAlternativeRoute ? 7 : 9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d={baseRoute.points.reduce(
                      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
                      ''
                    )}
                    stroke={useAlternativeRoute ? '#9AA0A6' : '#1A73E8'}
                    strokeWidth={useAlternativeRoute ? 5 : 7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              )}
            </>
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
        {/* FLOATING ROUTE TIME BUBBLE                                          */}
        {/* =================================================================== */}
        {showRoutePolyline && activeRoute.points.length > 1 && !isNavigating && (
          <div
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 shadow-xl rounded-full px-2.5 py-1 bg-[#1A73E8] text-white flex items-center gap-1 text-[10.5px] font-bold border-2 border-white animate-in zoom-in-75 cursor-pointer"
            style={{
              left: routeMidpoint.x,
              top: routeMidpoint.y - 16
            }}
            onClick={() => setUseAlternativeRoute(false)}
          >
            <Car className="size-3" />
            <span>{activeRoute.durationText}</span>
            <span className="opacity-80">({activeRoute.distanceText})</span>
          </div>
        )}

        {/* Alternative Route Pill */}
        {showRoutePolyline && baseRoute.alternativePoints && !useAlternativeRoute && !isNavigating && (
          <div
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 shadow-md rounded-full px-2 py-0.5 bg-white text-gray-700 flex items-center gap-1 text-[9.5px] font-semibold border border-gray-300 cursor-pointer hover:bg-gray-50"
            style={{
              left: routeMidpoint.x + 40,
              top: routeMidpoint.y + 20
            }}
            onClick={() => setUseAlternativeRoute(true)}
            title="Nhấn để chọn tuyến đường thay thế này"
          >
            <span>{baseRoute.alternativeDurationText}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* DROPPED PIN                                                         */}
        {/* =================================================================== */}
        {droppedPin && (
          <div
            className="absolute pointer-events-auto -translate-x-1/2 -translate-y-full cursor-pointer z-40 animate-in zoom-in-50"
            style={{ left: droppedPin.x, top: droppedPin.y }}
          >
            <div className="relative flex flex-col items-center">
              <MapPin className="size-9 text-[#EA4335] fill-[#EA4335] drop-shadow-lg animate-bounce" />
              <span className="px-2 py-0.5 rounded-full bg-black/90 text-white text-[9px] font-bold shadow-md whitespace-nowrap -mt-1 border border-white/20">
                Ghim đã thả
              </span>
            </div>
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
