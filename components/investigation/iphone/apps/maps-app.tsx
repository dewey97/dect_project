'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Search,
  Navigation,
  Layers,
  Car,
  Footprints,
  Train,
  ArrowUpDown,
  ChevronLeft,
  X,
  CornerUpRight,
  CornerUpLeft,
  MapPin,
  Volume2,
  VolumeX,
  Bookmark,
  Building,
  Utensils,
  ShoppingBag,
  Bus,
  Star,
  Phone,
  Clock,
  ExternalLink,
  Navigation2,
  MoveUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CASE_LOCATIONS,
  CaseLocation,
  TransportMode,
  calculateRoute,
  RouteResult
} from '@/lib/case-locations-data'

// Dynamic import of client-only Leaflet Map component
const RealLeafletMap = dynamic(() => import('./real-leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#E5E3DF] text-gray-500 gap-2 select-none">
      <div className="w-8 h-8 rounded-full border-2 border-[#1A73E8] border-t-transparent animate-spin" />
      <span className="text-[12px] font-semibold text-gray-700">Đang tải bản đồ Google Maps...</span>
      <span className="text-[10px] text-gray-400">TP. Hà Nội • Vụ án số 000</span>
    </div>
  )
})

interface MapsAppProps {
  onBackToHome?: () => void
}

export function MapsApp({ onBackToHome }: MapsAppProps) {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'explore' | 'directions'>('directions')
  const [transportMode, setTransportMode] = useState<TransportMode>('motorbike')

  // Location selections (Default: 14 Bờ Sông -> Số 8 Ngõ 12 Đường Bờ Kè)
  const [originId, setOriginId] = useState<string>('loc-01')
  const [destinationId, setDestinationId] = useState<string>('loc-06')
  const [useAlternativeRoute, setUseAlternativeRoute] = useState<boolean>(false)

  // Selector dropdown modal state ('origin' | 'destination' | null)
  const [pickingTarget, setPickingTarget] = useState<'origin' | 'destination' | null>(null)
  const [selectorSearch, setSelectorSearch] = useState('')
  const [selectorCategory, setSelectorCategory] = useState<string>('all')

  // Map view & Layer state
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard')
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true)
  const [showLayersSheet, setShowLayersSheet] = useState<boolean>(false)

  // Selected Place Details State (Full Google Place Sheet)
  const [selectedPlace, setSelectedPlace] = useState<CaseLocation | null>(null)
  const [isPlaceSheetExpanded, setIsPlaceSheetExpanded] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

  // Custom Dropped Pin state
  const [droppedPin, setDroppedPin] = useState<{ lat: number; lng: number; title: string } | null>(null)

  // Turn-by-Turn GPS Navigation State
  const [isNavigating, setIsNavigating] = useState(false)
  const [navProgress, setNavProgress] = useState(0) // 0 to 100%
  const [navSpeed, setNavSpeed] = useState(34)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [showStepsDrawer, setShowStepsDrawer] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)

  // Current Origin and Destination objects
  const origin = useMemo(
    () => CASE_LOCATIONS.find((l) => l.id === originId) || CASE_LOCATIONS[0],
    [originId]
  )
  const destination = useMemo(
    () => CASE_LOCATIONS.find((l) => l.id === destinationId) || CASE_LOCATIONS[5],
    [destinationId]
  )

  // Computed Route from A to B via Road Network Graph
  const baseRoute: RouteResult = useMemo(
    () => calculateRoute(origin, destination, transportMode),
    [origin, destination, transportMode]
  )

  // Active route points & duration depending on whether alternative route is selected
  const activeRoute = useMemo(() => {
    if (useAlternativeRoute && baseRoute.alternativeLatLngs) {
      return {
        ...baseRoute,
        points: baseRoute.alternativePoints || baseRoute.points,
        latLngs: baseRoute.alternativeLatLngs,
        durationText: baseRoute.alternativeDurationText || baseRoute.durationText,
        durationMinutes: baseRoute.alternativeDurationMinutes || baseRoute.durationMinutes,
        distanceText: baseRoute.alternativeDistanceText || baseRoute.distanceText,
        viaRoute: baseRoute.alternativeViaRoute || baseRoute.viaRoute
      }
    }
    return baseRoute
  }, [baseRoute, useAlternativeRoute])

  // Real Web Speech API voice synthesis for Vietnamese directions
  const speakDirection = useCallback((text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 1.05
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } catch {}
  }, [isAudioMuted])

  // Swap A and B
  const handleSwapLocations = () => {
    const temp = originId
    setOriginId(destinationId)
    setDestinationId(temp)
    setUseAlternativeRoute(false)
    setSelectedPlace(null)
  }

  // Filter locations for picker modal
  const filteredPickerLocations = useMemo(() => {
    return CASE_LOCATIONS.filter((loc) => {
      const matchSearch =
        loc.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
        loc.address.toLowerCase().includes(selectorSearch.toLowerCase()) ||
        loc.shortName.toLowerCase().includes(selectorSearch.toLowerCase())
      const matchCat =
        selectorCategory === 'all' || loc.category === selectorCategory
      return matchSearch && matchCat
    })
  }, [selectorSearch, selectorCategory])

  // Select location from picker
  const handleSelectPickedLocation = (loc: CaseLocation) => {
    if (pickingTarget === 'origin') {
      setOriginId(loc.id)
    } else if (pickingTarget === 'destination') {
      setDestinationId(loc.id)
    }
    setPickingTarget(null)
    setSelectorSearch('')
    setSelectedPlace(loc)
    setDroppedPin(null)
  }

  // Start Navigation Mode
  const handleStartNavigation = () => {
    setIsNavigating(true)
    setNavProgress(0)
    setHasArrived(false)
    speakDirection(`Bắt đầu đi về hướng ${destination.name}. Tuyến đường nhanh nhất qua ${activeRoute.viaRoute}.`)
  }

  // Stop Navigation
  const handleStopNavigation = () => {
    setIsNavigating(false)
    setNavProgress(0)
    setHasArrived(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // Driving Simulation along route during Navigation Mode
  useEffect(() => {
    if (!isNavigating || hasArrived) return

    const interval = setInterval(() => {
      setNavProgress((prev) => {
        if (prev >= 100) {
          setHasArrived(true)
          speakDirection('Bạn đã đến nơi.')
          return 100
        }
        return prev + 2.5
      })

      // Realistic city traffic speed fluctuations (28 - 45 km/h)
      setNavSpeed((prev) => Math.min(45, Math.max(26, prev + Math.floor(Math.random() * 5) - 2)))
    }, 800)

    return () => clearInterval(interval)
  }, [isNavigating, hasArrived, speakDirection])

  // Remaining Distance during navigation
  const remainingDistanceKm = useMemo(() => {
    const remaining = activeRoute.distanceKm * (1 - navProgress / 100)
    if (remaining < 0.1) return '50 m'
    if (remaining < 1) return `${Math.round(remaining * 1000)} m`
    return `${remaining.toFixed(1)} km`
  }, [activeRoute.distanceKm, navProgress])

  return (
    <div className="flex flex-col h-full w-full bg-[#E5E3DF] text-[#202124] select-none overflow-hidden font-sans relative">
      
      {/* ========================================================================= */}
      {/* 1. GOOGLE MAPS AUTHENTIC TOP HEADER & DIRECTIONS PANEL                     */}
      {/* ========================================================================= */}
      {!isNavigating ? (
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
                    placeholder="Tìm kiếm địa điểm tại Hà Nội..."
                    onClick={() => {
                      setPickingTarget('destination')
                      setActiveTab('directions')
                    }}
                    readOnly
                    className="w-full text-[13px] font-normal text-gray-800 placeholder-gray-500 bg-transparent outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setActiveTab('directions')}
                    className="size-8 rounded-full bg-[#1A73E8] hover:bg-[#1557b0] text-white flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95"
                    title="Tìm đường"
                  >
                    <Navigation className="size-4 fill-white" />
                  </button>
                </div>
              </div>

              {/* Quick Search Chips Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-0.5 no-scrollbar text-[11px] font-medium">
                {[
                  { label: 'Quán ăn & Cà phê', icon: Utensils, cat: 'food' },
                  { label: 'Cửa hàng & Chợ', icon: ShoppingBag, cat: 'shopping' },
                  { label: 'Bến xe & Sân bay', icon: Bus, cat: 'transit' },
                  { label: 'Khu dân cư', icon: Building, cat: 'residential' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const match = CASE_LOCATIONS.find((l) => l.category === chip.cat)
                      if (match) setSelectedPlace(match)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full border border-gray-200 shadow-xs hover:bg-gray-50 active:scale-95 text-gray-700 whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <chip.icon className="size-3 text-gray-500" />
                    <span>{chip.label}</span>
                  </button>
                ))}
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
                    Chỉ đường (Hà Nội)
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
                    <span className="text-[9px] text-gray-400 shrink-0 font-mono ml-1">ĐIỂM ĐI</span>
                  </button>

                  {/* Point B Selector */}
                  <button
                    onClick={() => setPickingTarget('destination')}
                    className="w-full h-8 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-left flex items-center justify-between transition-colors border border-gray-200/60 cursor-pointer"
                  >
                    <span className="text-[11.5px] font-semibold text-gray-900 truncate">
                      {destination.name}
                    </span>
                    <span className="text-[9px] text-[#EA4335] font-bold shrink-0 font-mono ml-1">ĐIỂM ĐẾN</span>
                  </button>
                </div>

                {/* Swap A/B Button */}
                <button
                  onClick={handleSwapLocations}
                  className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer transition-transform active:rotate-180"
                  title="Đổi chiều xuất phát - điểm đến"
                >
                  <ArrowUpDown className="size-3.5" />
                </button>
              </div>

              {/* Transport Mode Tabs (Motorbike, Car, Bus/Train, Walk) */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-gray-100">
                {[
                  { mode: 'motorbike' as TransportMode, icon: Car, label: 'Xe máy' },
                  { mode: 'car' as TransportMode, icon: Car, label: 'Ô tô' },
                  { mode: 'transit' as TransportMode, icon: Train, label: 'Xe buýt' },
                  { mode: 'walk' as TransportMode, icon: Footprints, label: 'Đi bộ' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      setTransportMode(item.mode)
                      setUseAlternativeRoute(false)
                    }}
                    className={cn(
                      'py-1.5 rounded-lg flex flex-col items-center gap-0.5 transition-all text-[10.5px] font-medium cursor-pointer',
                      transportMode === item.mode
                        ? 'bg-blue-50 text-[#1A73E8] font-bold border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* FULLSCREEN NAVIGATION GPS HUD (Turn-by-Turn Real Navigation)             */
        /* ========================================================================= */
        <div className="absolute top-2 left-2 right-2 z-40 animate-in slide-in-from-top-4">
          <div className="bg-[#0F9D58] text-white rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 border border-green-400/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                  <CornerUpRight className="size-5 text-white stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[17px] font-bold leading-tight font-mono">
                    {hasArrived ? 'ĐÃ ĐẾN NƠI' : remainingDistanceKm}
                  </div>
                  <div className="text-[12px] text-green-100 font-semibold truncate">
                    {hasArrived ? `Điểm đến: ${destination.name}` : (activeRoute.steps[1]?.instruction || `Đi về hướng ${destination.name}`)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStopNavigation}
                className="size-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Thoát dẫn đường"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Next Sub-maneuver Preview Chip */}
            {!hasArrived && (
              <div className="text-[10px] text-green-100/90 flex items-center gap-1 pt-0.5 border-t border-green-400/30">
                <CornerUpLeft className="size-3" />
                <span>Sau đó rẽ vào trục đường liên khu vực</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REAL LEAFLET MAP (CARTO VOYAGER TILES & 100% REAL HANOI GEOGRAPHY)     */}
      {/* ========================================================================= */}
      <div className="w-full h-full relative">
        <RealLeafletMap
          origin={origin}
          destination={destination}
          activeRoute={activeRoute}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          useAlternativeRoute={useAlternativeRoute}
          onToggleAlternativeRoute={() => setUseAlternativeRoute(!useAlternativeRoute)}
          mapLayer={mapLayer}
          droppedPin={droppedPin}
          onDropPin={setDroppedPin}
          isNavigating={isNavigating}
          navProgress={navProgress}
        />

        {/* Layer Switcher Floating Button */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setShowLayersSheet(true)}
            className="size-9 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#1A73E8] flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Lớp bản đồ"
          >
            <Layers className="size-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GOOGLE MAPS BOTTOM SHEET & PLACE DETAILS / ROUTE SUMMARY               */}
      {/* ========================================================================= */}
      <div className={cn(
        'absolute bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200/90 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pointer-events-auto transition-all duration-300 overflow-y-auto',
        isPlaceSheetExpanded ? 'h-[75%]' : 'max-h-[46%]'
      )}>
        {/* Grab Handle (Click to toggle expand) */}
        <div
          onClick={() => setIsPlaceSheetExpanded(!isPlaceSheetExpanded)}
          className="w-full py-2 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Dropped Pin Details (if user dropped pin on map) */}
          {droppedPin ? (
            <div className="space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">
                    {droppedPin.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Tọa độ GPS: {droppedPin.lat.toFixed(4)}° N, {droppedPin.lng.toFixed(4)}° E • TP. Hà Nội
                  </p>
                </div>
                <button
                  onClick={() => setDroppedPin(null)}
                  className="text-[11px] text-[#1A73E8] font-medium cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setDroppedPin(null)
                  }}
                  className="flex-1 py-2 bg-[#1A73E8] text-white rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Navigation className="size-3.5 fill-white" />
                  <span>Chỉ đường</span>
                </button>
              </div>
            </div>
          ) : selectedPlace ? (
            /* =================================================================== */
            /* REAL GOOGLE MAPS PLACE DETAILS SHEET                                */
            /* =================================================================== */
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
              {/* Header Title & Close */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1">
                    <span className="font-semibold text-gray-800">{selectedPlace.rating || 4.5}</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-400">({selectedPlace.reviewCount || 35})</span>
                    <span className="text-gray-400">•</span>
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

              {/* Action Buttons Row (Directions, Start, Call, Save) */}
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
                  <span>Đường đi</span>
                </button>

                <button
                  onClick={() => {
                    setDestinationId(selectedPlace.id)
                    setSelectedPlace(null)
                    handleStartNavigation()
                  }}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Navigation2 className="size-3.5 text-[#1A73E8]" />
                  <span>Bắt đầu</span>
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

              {/* Extended Information Rows */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-[12px] text-gray-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>{selectedPlace.address}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="size-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-emerald-700">
                    {selectedPlace.openingHours || 'Mở cửa cả ngày'}
                  </span>
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

                <p className="text-[11px] text-gray-500 leading-relaxed pt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                  {selectedPlace.description}
                </p>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* ROUTE OVERVIEW & NAVIGATION TRIGGER                                 */
            /* =================================================================== */
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold text-[#0F9D58] tracking-tight">
                    {activeRoute.durationText}
                  </span>
                  <span className="text-[14px] font-semibold text-gray-600">
                    ({activeRoute.distanceText})
                  </span>
                </div>

                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                  Giao thông thông thoáng
                </span>
              </div>

              <div className="text-[11.5px] text-gray-600 flex items-center gap-1 truncate">
                <span className="text-gray-500">Tuyến đường:</span>
                <span className="font-semibold text-gray-800 truncate">{activeRoute.viaRoute}</span>
                {baseRoute.fareEstimate && (
                  <span className="text-gray-400 ml-auto font-mono text-[10.5px]">
                    Ước tính: {baseRoute.fareEstimate}
                  </span>
                )}
              </div>

              {/* Action Buttons: Bắt đầu (Start Navigation) & Chi tiết các bước */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleStartNavigation}
                  className="flex-1 py-2.5 rounded-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Navigation className="size-4 fill-white" />
                  <span>Bắt đầu</span>
                </button>

                <button
                  onClick={() => setShowStepsDrawer(true)}
                  className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-[12px] transition-all cursor-pointer"
                >
                  Chi tiết các bước
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TURN-BY-TURN DIRECTIONS DRAWER (Chi tiết lộ trình)                      */}
      {/* ========================================================================= */}
      {showStepsDrawer && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in-50">
          <div className="bg-white rounded-t-3xl p-4 max-h-[85%] flex flex-col shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Chi tiết tuyến đường</h3>
                <p className="text-[11px] text-gray-500">
                  {activeRoute.durationText} • {activeRoute.distanceText}
                </p>
              </div>
              <button
                onClick={() => setShowStepsDrawer(false)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {activeRoute.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="size-7 rounded-full bg-blue-50 text-[#1A73E8] border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    {step.iconType === 'turn-right' ? (
                      <CornerUpRight className="size-3.5 stroke-[2.5]" />
                    ) : step.iconType === 'turn-left' ? (
                      <CornerUpLeft className="size-3.5 stroke-[2.5]" />
                    ) : step.iconType === 'arrive' ? (
                      <MapPin className="size-3.5 text-red-600 fill-red-600" />
                    ) : (
                      <MoveUp className="size-3.5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="flex-1 border-b border-gray-100 pb-2.5">
                    <p className="font-semibold text-gray-900 leading-snug">{step.instruction}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {step.distance}
                      </span>
                      {step.subInstruction && (
                        <span className="text-[10px] text-gray-400 italic">
                          {step.subInstruction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowStepsDrawer(false)
                handleStartNavigation()
              }}
              className="w-full py-2.5 bg-[#1A73E8] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              <Navigation className="size-3.5 fill-white" />
              <span>Bắt đầu chỉ đường ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LOCATION PICKER MODAL (Chọn A hoặc B từ danh sách địa chỉ thật)        */}
      {/* ========================================================================= */}
      {pickingTarget && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-4">
          {/* Header Search Input */}
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
                autoFocus
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

          {/* Clean Real-world Place Categories */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto text-[10.5px]">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'residential', label: 'Khu dân cư' },
              { id: 'food', label: 'Quán ăn & Cà phê' },
              { id: 'transit', label: 'Giao thông & Bến bãi' },
              { id: 'public', label: 'Cơ quan & Công cộng' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectorCategory(cat.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer',
                  selectorCategory === cat.id
                    ? 'bg-[#1A73E8] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* List of Clean Locations */}
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
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-gray-900 truncate">
                        {loc.name}
                      </span>
                      {loc.rating && (
                        <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-0.5">
                          <Star className="size-2.5 fill-amber-400 text-amber-400" />
                          <span>{loc.rating}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-gray-500 truncate mt-0.5">{loc.address}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {loc.categoryLabel} • {loc.openingHours || 'Mở cửa cả ngày'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GOOGLE MAPS LAYERS SHEET (Lớp bản đồ: Mặc định / Vệ tinh)              */}
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

            {/* Map Type Choices */}
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

            {/* Map Details: Traffic */}
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

      {/* ========================================================================= */}
      {/* 7. NAVIGATION MODE BOTTOM CONTROL BAR (Speedometer & Voice Guidance)      */}
      {/* ========================================================================= */}
      {isNavigating && (
        <div className="absolute bottom-3 inset-x-3 z-40 flex flex-col gap-2 pointer-events-auto">
          {/* Speedometer Gauge (Floating at bottom-left with speed limit circle) */}
          <div className="flex items-center gap-2">
            <div className="size-12 rounded-full bg-white shadow-xl border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-[13px] font-bold leading-none font-mono text-gray-900">{navSpeed}</span>
              <span className="text-[7px] text-gray-500 font-bold">km/h</span>
            </div>
            {/* Speed Limit Sign 40 */}
            <div className="size-8 rounded-full bg-white border-2 border-red-600 shadow-md flex items-center justify-center font-bold text-[10px] text-gray-900 font-mono">
              40
            </div>
          </div>

          {/* Bottom GPS Control Bar */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-[#0F9D58] tracking-tight">
                {activeRoute.durationText}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {remainingDistanceKm}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextMute = !isAudioMuted
                  setIsAudioMuted(nextMute)
                  if (!nextMute) {
                    speakDirection(`Đang tiếp tục di chuyển về ${destination.name}.`)
                  }
                }}
                className={cn(
                  'p-2 rounded-full cursor-pointer transition-colors',
                  isAudioMuted ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#1A73E8]'
                )}
                title={isAudioMuted ? 'Bật âm thanh chỉ đường giọng nói' : 'Tắt âm thanh'}
              >
                {isAudioMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>

              <button
                onClick={handleStopNavigation}
                className="px-4 py-2 rounded-full bg-[#EA4335] hover:bg-[#d93025] text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Kết thúc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
