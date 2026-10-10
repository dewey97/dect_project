'use client'

import React, { useState, useRef, useMemo } from 'react'
import {
  Search,
  Navigation,
  ArrowUpDown,
  ChevronLeft,
  X,
  MapPin,
  Bookmark,
  Phone,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'
import {
  CaseLocation,
  calculateRoute,
  RouteResult,
  transformSheetLocationToCaseLocation,
  DEFAULT_CASE_LOCATIONS,
  SheetLocationRow
} from '@/lib/case-locations-data'
import { VectorMapCanvas } from './vector-map-canvas'

interface MapsAppProps {
  onBackToHome?: () => void
}

export function MapsApp({ onBackToHome }: MapsAppProps) {
  // Live CMS Integration: Fetch locations from Google Sheets tab 'locations'
  const { data: rawSheetLocations } = usePhoneData<SheetLocationRow>('locations')

  const caseLocations: CaseLocation[] = useMemo(() => {
    if (!rawSheetLocations || rawSheetLocations.length === 0) {
      return DEFAULT_CASE_LOCATIONS
    }
    return rawSheetLocations.map(transformSheetLocationToCaseLocation)
  }, [rawSheetLocations])

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'explore' | 'directions'>('explore')

  // Location selections (Default: 14 Bờ Sông -> Số 8 Ngõ 12 Đường Bờ Kè)
  const [originId, setOriginId] = useState<string>('1')
  const [destinationId, setDestinationId] = useState<string>('6')
  const [useAlternativeRoute, setUseAlternativeRoute] = useState<boolean>(false)

  // Selector dropdown modal state ('origin' | 'destination' | null)
  const [pickingTarget, setPickingTarget] = useState<'origin' | 'destination' | null>(null)
  const [selectorSearch, setSelectorSearch] = useState('')

  // Map view & Layer state
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard')
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true)
  const [showLayersSheet, setShowLayersSheet] = useState<boolean>(false)
  const [is3DView, setIs3DView] = useState<boolean>(false)

  // Selected Place Details State (Full Google Place Sheet)
  const [selectedPlace, setSelectedPlace] = useState<CaseLocation | null>(null)
  const [isPlaceSheetExpanded, setIsPlaceSheetExpanded] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

  // Map Pan & Zoom state (Expanded canvas centered on Dot 1 - Phân khu Cảng)
  const [zoom, setZoom] = useState(0.85)
  const [pan, setPan] = useState({ x: -545, y: 130 })
  const [isDragging, setIsDragging] = useState(false)
  const [isCentered, setIsCentered] = useState(true)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Current Origin and Destination objects
  const origin = useMemo(
    () =>
      caseLocations.find(
        (l) =>
          l.id === originId ||
          l.id === originId.replace(/^loc-0?/, '') ||
          `loc-${l.id.padStart?.(2, '0') || l.id}` === originId
      ) ||
      caseLocations[0] ||
      DEFAULT_CASE_LOCATIONS[0],
    [caseLocations, originId]
  )
  const destination = useMemo(
    () =>
      caseLocations.find(
        (l) =>
          l.id === destinationId ||
          l.id === destinationId.replace(/^loc-0?/, '') ||
          `loc-${l.id.padStart?.(2, '0') || l.id}` === destinationId
      ) ||
      caseLocations[5] ||
      caseLocations[1] ||
      DEFAULT_CASE_LOCATIONS[1],
    [caseLocations, destinationId]
  )

  // Computed Route & Distance from A to B
  const baseRoute: RouteResult = useMemo(
    () => calculateRoute(origin, destination),
    [origin, destination]
  )

  // Active route points & duration depending on whether alternative route is selected
  const activeRoute = useMemo(() => {
    if (useAlternativeRoute && baseRoute.alternativePoints) {
      return {
        ...baseRoute,
        points: baseRoute.alternativePoints,
        durationText: baseRoute.alternativeDurationText || baseRoute.durationText,
        durationMinutes: baseRoute.alternativeDurationMinutes || baseRoute.durationMinutes,
        distanceText: baseRoute.alternativeDistanceText || baseRoute.distanceText,
        viaRoute: baseRoute.alternativeViaRoute || baseRoute.viaRoute
      }
    }
    return baseRoute
  }, [baseRoute, useAlternativeRoute])

  // Midpoint on active route for the floating duration callout bubble
  const routeMidpoint = useMemo(() => {
    if (!activeRoute.points || activeRoute.points.length === 0) {
      return { x: (origin.x + destination.x) / 2, y: (origin.y + destination.y) / 2 }
    }
    const midIdx = Math.floor(activeRoute.points.length / 2)
    return activeRoute.points[midIdx]
  }, [activeRoute.points, origin, destination])

  // Swap A and B
  const handleSwapLocations = () => {
    const temp = originId
    setOriginId(destinationId)
    setDestinationId(temp)
    setUseAlternativeRoute(false)
    setSelectedPlace(null)
  }

  // Center on current position (Origin)
  const handleCenterMyLocation = () => {
    const target = origin || caseLocations[0] || DEFAULT_CASE_LOCATIONS[0]
    const newZoom = 0.85
    setZoom(newZoom)
    setPan({
      x: 180 - target.x * newZoom,
      y: 320 - target.y * newZoom
    })
    setIsCentered(true)
    setIs3DView(false)
  }

  // Handle Drag / Pan Map
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.map-pin-btn')) return
    setIsDragging(true)
    setIsCentered(false)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStart.current = { x: clientX, y: clientY }
    panStart.current = { ...pan }
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const dx = clientX - dragStart.current.x
    const dy = clientY - dragStart.current.y
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Map click
  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return
    const target = e.target as HTMLElement
    if (target.closest('.map-pin-btn') || target.closest('button')) return
    setSelectedPlace(null)
  }

  // Filter locations for picker modal
  const filteredPickerLocations = useMemo(() => {
    const q = selectorSearch.toLowerCase().trim()
    return caseLocations.filter((loc) => {
      if (!q) return true
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.shortName.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        (loc.plusCode && loc.plusCode.toLowerCase().includes(q))
      )
    })
  }, [caseLocations, selectorSearch])

  // Select location from picker
  const handleSelectPickedLocation = (loc: CaseLocation) => {
    if (pickingTarget === 'origin') {
      setOriginId(loc.id)
    } else {
      setDestinationId(loc.id)
      setSelectedPlace(loc)
    }
    setPickingTarget(null)
    setSelectorSearch('')

    // Center camera smoothly on chosen location
    setPan({
      x: 180 - loc.x * zoom,
      y: 320 - loc.y * zoom
    })
  }

  // Pin click on map -> Opens Google Place Sheet
  const handlePinClick = (loc: CaseLocation) => {
    setSelectedPlace(loc)
    setIsPlaceSheetExpanded(false)
    setIsBookmarked(false)
  }

  // Dynamic Scale text in meters
  const scaleMeters = Math.round(500 / zoom)

  return (
    <div className="flex flex-col h-full w-full bg-[#E5E3DF] text-[#202124] select-none overflow-hidden font-sans relative">
      
      {/* ========================================================================= */}
      {/* 1. GOOGLE MAPS AUTHENTIC TOP HEADER & DIRECTIONS PANEL                     */}
      {/* ========================================================================= */}
        <div className="absolute top-2 left-2 right-2 z-30 flex flex-col gap-1.5 pointer-events-auto">
          {activeTab === 'explore' ? (
            /* EXPLORE / SEARCH PILL (Exact Google Maps Search Bar) */
            <div className="flex flex-col gap-1.5">
              <div className="h-11 rounded-full bg-white shadow-[0_2px_6px_rgba(60,64,67,0.3)] border border-transparent px-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {onBackToHome && (
                    <button
                      onClick={onBackToHome}
                      className="p-1 -ml-1 text-gray-600 hover:text-blue-600 cursor-pointer rounded-full active:bg-gray-100"
                      title="Về màn hình chính"
                    >
                      <ChevronLeft className="size-5 text-gray-700" />
                    </button>
                  )}
                  {/* Google "G" 4-color icon */}
                  <div className="size-5 flex items-center justify-center font-bold text-xs font-serif bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 text-white rounded-full shrink-0 shadow-xs">
                    G
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm (29 Vĩnh Thụy, Đạt Phú...)"
                    onClick={() => {
                      setPickingTarget('destination')
                    }}
                    readOnly
                    className="w-full text-[13px] font-normal text-gray-800 placeholder-gray-500 bg-transparent outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => setActiveTab('directions')}
                  className="p-1.5 text-[#1A73E8] hover:bg-blue-50 rounded-full cursor-pointer shrink-0 transition-colors"
                  title="Đo khoảng cách giữa 2 điểm"
                >
                  <Navigation className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* GOOGLE MAPS ROUTE DIRECTION HEADER */
            <div className="rounded-2xl bg-white shadow-[0_4px_14px_rgba(60,64,67,0.25)] border border-gray-200/90 p-2.5 space-y-2 animate-in fade-in-50">
              {/* Top Navigation Row: Back, Title & Options */}
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="p-1 text-gray-600 hover:text-black rounded-full cursor-pointer hover:bg-gray-100"
                    title="Quay lại tìm kiếm"
                  >
                    <ChevronLeft className="size-4 text-gray-700" />
                  </button>
                  <span className="text-[12px] font-semibold text-gray-900 tracking-tight">
                    Đo khoảng cách giữa 2 điểm
                  </span>
                </div>

                {onBackToHome && (
                  <button
                    onClick={onBackToHome}
                    className="text-[11px] text-[#1A73E8] font-semibold hover:underline cursor-pointer"
                  >
                    Về Home
                  </button>
                )}
              </div>

              {/* Origin A & Destination B with Swap Button */}
              <div className="flex items-center gap-2">
                {/* Visual Route Connectors (Blue ring, dotted line, Red pin) */}
                <div className="flex flex-col items-center justify-between py-2 shrink-0 w-4 h-16">
                  {/* Origin Circle */}
                  <div className="size-3 rounded-full border-2 border-[#1A73E8] bg-white flex items-center justify-center">
                    <div className="size-1 rounded-full bg-[#1A73E8]" />
                  </div>
                  {/* Dotted line */}
                  <div className="w-[1.5px] flex-1 my-0.5 border-l-2 border-dotted border-gray-400" />
                  {/* Destination Pin */}
                  <MapPin className="size-3.5 text-[#EA4335] fill-[#EA4335]" />
                </div>

                {/* Input Fields for Origin A and Destination B */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  {/* Point A Selector */}
                  <button
                    onClick={() => setPickingTarget('origin')}
                    className="w-full h-8 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-left flex items-center justify-between transition-colors border border-gray-200/60 cursor-pointer"
                  >
                    <span className="text-[11.5px] font-medium text-gray-800 truncate">
                      {origin.name}
                    </span>
                    <span className="text-[9px] text-[#1A73E8] font-bold shrink-0 font-mono ml-1">ĐIỂM A</span>
                  </button>

                  {/* Point B Selector */}
                  <button
                    onClick={() => setPickingTarget('destination')}
                    className="w-full h-8 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-left flex items-center justify-between transition-colors border border-gray-200/60 cursor-pointer"
                  >
                    <span className="text-[11.5px] font-semibold text-gray-900 truncate">
                      {destination.name}
                    </span>
                    <span className="text-[9px] text-[#EA4335] font-bold shrink-0 font-mono ml-1">ĐIỂM B</span>
                  </button>
                </div>

                {/* Swap A/B Button */}
                <button
                  onClick={handleSwapLocations}
                  className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-transform active:rotate-180"
                  title="Đổi chiều A - B"
                >
                  <ArrowUpDown className="size-3.5" />
                </button>
              </div>

              {/* Distance Summary Bar (No Motorbike / Walk Tabs) */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Khoảng cách giữa 2 điểm:</span>
                <span className="font-bold text-[#1A73E8] font-mono text-[13px] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activeRoute.distanceText}
                </span>
              </div>
            </div>
          )}
        </div>

      {/* ========================================================================= */}
      {/* 2. THE GOOGLE MAPS INTERACTIVE VECTOR CANVAS (STANDALONE COMPONENT)       */}
      {/* ========================================================================= */}
      <VectorMapCanvas
        pan={pan}
        zoom={zoom}
        is3DView={is3DView}
        mapLayer={mapLayer}
        showTrafficLayer={showTrafficLayer}
        origin={origin}
        destination={destination}
        activeRoute={activeRoute}
        baseRoute={baseRoute}
        useAlternativeRoute={useAlternativeRoute}
        setUseAlternativeRoute={setUseAlternativeRoute}
        isNavigating={false}
        vehiclePos={{ x: 0, y: 0 }}
        caseLocations={caseLocations}
        selectedPlace={selectedPlace}
        handlePinClick={handlePinClick}
        handleMapClick={handleMapClick}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        mapContainerRef={mapContainerRef}
        scaleMeters={scaleMeters}
        setPan={setPan}
        setZoom={setZoom}
        setIs3DView={setIs3DView}
        setShowLayersSheet={setShowLayersSheet}
        handleCenterMyLocation={handleCenterMyLocation}
        isCentered={isCentered}
        setIsCentered={setIsCentered}
        routeMidpoint={routeMidpoint}
        showRoutePolyline={activeTab === 'directions'}
      />

      {/* ========================================================================= */}
      {/* 3. GOOGLE MAPS BOTTOM SHEET & PLACE DETAILS / ROUTE SUMMARY               */}
      {/* ========================================================================= */}
      <div className={cn(
        'absolute bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200/90 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pointer-events-auto transition-all duration-300 overflow-y-auto',
        isPlaceSheetExpanded ? 'h-[75%]' : 'max-h-[46%]'
      )}>
        <div
          onClick={() => setIsPlaceSheetExpanded(!isPlaceSheetExpanded)}
          className="w-full py-2 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-4 pb-4 space-y-3">
          {selectedPlace ? (
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1">
                    <span className="text-gray-600">{selectedPlace.categoryLabel || 'Địa điểm'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 py-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => {
                    setDestinationId(selectedPlace.id)
                    setSelectedPlace(null)
                    setActiveTab('directions')
                    setUseAlternativeRoute(false)
                  }}
                  className="flex-1 py-2 px-3 bg-[#1A73E8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Navigation className="size-3.5 fill-white" />
                  <span>Nối khoảng cách</span>
                </button>

                {selectedPlace.phone && (
                  <a
                    href={`tel:${selectedPlace.phone.replace(/\s+/g, '')}`}
                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Phone className="size-3.5 text-gray-600" />
                    <span>Gọi</span>
                  </a>
                )}

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    'py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0',
                    isBookmarked ? 'bg-blue-50 text-[#1A73E8] border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  )}
                >
                  <Bookmark className={cn('size-3.5', isBookmarked && 'fill-[#1A73E8] text-[#1A73E8]')} />
                  <span>{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
                </button>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-[12px] text-gray-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>{selectedPlace.address}</span>
                </div>

                {selectedPlace.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="size-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-[#1A73E8] font-mono">{selectedPlace.phone}</span>
                  </div>
                )}

                {selectedPlace.plusCode && (
                  <div className="flex items-start gap-2.5">
                    <ExternalLink className="size-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-500 font-mono text-[11px]">
                      Plus Code: {selectedPlace.plusCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DISTANCE MEASUREMENT SUMMARY BOTTOM SHEET */
            <div className="space-y-2.5 animate-in slide-in-from-bottom-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Khoảng cách nối điểm</span>
                  <span className="text-[26px] font-bold text-[#1A73E8] tracking-tight font-mono">
                    {activeRoute.distanceText}
                  </span>
                </div>

                <button
                  onClick={handleSwapLocations}
                  className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Đổi chiều"
                >
                  <ArrowUpDown className="size-3" />
                  <span>Đổi chiều</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-gray-800">
                  <div className="size-2 rounded-full bg-[#1A73E8] shrink-0" />
                  <span className="font-semibold truncate">A: {origin.name}</span>
                </div>
                <div className="w-[1px] h-2 bg-gray-300 ml-1" />
                <div className="flex items-center gap-2 text-gray-800">
                  <div className="size-2 rounded-full bg-[#EA4335] shrink-0" />
                  <span className="font-semibold truncate">B: {destination.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="size-3.5" />
                  <span>Đóng đo khoảng cách</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LOCATION PICKER MODAL (NO CATEGORY CHIPS, NO STARS)                    */}
      {/* ========================================================================= */}
      {pickingTarget && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-4">
          <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
            <button
              onClick={() => setPickingTarget(null)}
              className="p-1 rounded-full text-gray-600 hover:text-black cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <Search className="size-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                placeholder={`Chọn ${pickingTarget === 'origin' ? 'Điểm bắt đầu (A)' : 'Điểm đến (B)'}...`}
                className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder-gray-400"
              />
              {selectorSearch && (
                <button onClick={() => setSelectorSearch('')}>
                  <X className="size-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredPickerLocations.map((loc) => {
              const isCurrent =
                pickingTarget === 'origin' ? loc.id === originId : loc.id === destinationId

              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectPickedLocation(loc)}
                  className={cn(
                    'w-full p-3 flex items-start gap-3 text-left hover:bg-blue-50/50 transition-colors cursor-pointer',
                    isCurrent && 'bg-blue-50'
                  )}
                >
                  <div
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      loc.category === 'residential'
                        ? 'bg-slate-100 text-slate-700'
                        : loc.category === 'food'
                        ? 'bg-orange-100 text-orange-700'
                        : loc.category === 'transit'
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    <MapPin className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-bold text-gray-900 block truncate">
                      {loc.name}
                    </span>
                    <p className="text-[10.5px] text-gray-500 truncate mt-0.5">{loc.address}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {loc.categoryLabel}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GOOGLE MAPS LAYERS SHEET                                               */}
      {/* ========================================================================= */}
      {showLayersSheet && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in-50">
          <div className="bg-white rounded-t-3xl p-4 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">Loại bản đồ</h3>
              <button
                onClick={() => setShowLayersSheet(false)}
                className="p-1 text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setMapLayer('standard')
                  setShowLayersSheet(false)
                }}
                className={cn(
                  'p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer',
                  mapLayer === 'standard'
                    ? 'border-[#1A73E8] bg-blue-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div className="w-16 h-12 rounded-lg bg-[#E5E3DF] border border-gray-300 flex items-center justify-center font-bold text-[10px] text-gray-700">
                  Mặc định
                </div>
                <span className="text-xs font-semibold text-gray-800">Mặc định</span>
              </button>

              <button
                onClick={() => {
                  setMapLayer('satellite')
                  setShowLayersSheet(false)
                }}
                className={cn(
                  'p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer',
                  mapLayer === 'satellite'
                    ? 'border-[#1A73E8] bg-blue-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div className="w-16 h-12 rounded-lg bg-[#18232c] border border-gray-700 flex items-center justify-center font-bold text-[10px] text-gray-200">
                  Vệ tinh
                </div>
                <span className="text-xs font-semibold text-gray-800">Vệ tinh</span>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Chi tiết bản đồ
              </div>
              <button
                onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-xs text-gray-800 font-medium">Giao thông trực tiếp</span>
                <div
                  className={cn(
                    'w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5',
                    showTrafficLayer ? 'bg-[#1A73E8]' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'size-4 rounded-full bg-white shadow-sm transition-transform',
                      showTrafficLayer ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
