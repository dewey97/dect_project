'use client'

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
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
  MoveUp,
  MapPin,
  Circle,
  Crosshair,
  Volume2,
  VolumeX,
  Bookmark,
  Building,
  Utensils,
  ShoppingBag,
  Bus,
  Plane,
  Landmark,
  Compass,
  Star,
  Phone,
  Clock,
  ExternalLink,
  Navigation2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CASE_LOCATIONS,
  CaseLocation,
  TransportMode,
  calculateRoute,
  RouteResult
} from '@/lib/case-locations-data'

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
  const [is3DView, setIs3DView] = useState<boolean>(false)

  // Selected Place Details State (Full Google Place Sheet)
  const [selectedPlace, setSelectedPlace] = useState<CaseLocation | null>(null)
  const [isPlaceSheetExpanded, setIsPlaceSheetExpanded] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

  // Custom Dropped Pin state
  const [droppedPin, setDroppedPin] = useState<{ x: number; y: number; title: string } | null>(null)

  // Turn-by-Turn GPS Navigation State
  const [isNavigating, setIsNavigating] = useState(false)
  const [navProgress, setNavProgress] = useState(0) // 0 to 100%
  const [navSpeed, setNavSpeed] = useState(34)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [showStepsDrawer, setShowStepsDrawer] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)

  // Map Pan & Zoom state (Expanded 2400 x 2000 canvas centered on Phân khu Cảng)
  const [zoom, setZoom] = useState(0.75)
  const [pan, setPan] = useState({ x: -750, y: -520 })
  const [isDragging, setIsDragging] = useState(false)
  const [isCentered, setIsCentered] = useState(true)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

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

  // Center on current position (Origin)
  const handleCenterMyLocation = () => {
    const target = origin || CASE_LOCATIONS[0]
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

  // Drop pin on map empty click
  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return
    const target = e.target as HTMLElement
    if (target.closest('.map-pin-btn') || target.closest('button')) return

    const rect = mapContainerRef.current?.getBoundingClientRect()
    if (!rect) return
    const clickX = (e.clientX - rect.left - pan.x) / zoom
    const clickY = (e.clientY - rect.top - pan.y) / zoom

    setDroppedPin({
      x: Math.round(clickX),
      y: Math.round(clickY),
      title: 'Vị trí đã thả ghim'
    })
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
    setSelectedPlace(null)
    setDroppedPin(null)

    // Center camera smoothly on chosen location
    setPan({
      x: 180 - loc.x * zoom,
      y: 320 - loc.y * zoom
    })
  }

  // Pin click on map -> Opens Google Place Sheet
  const handlePinClick = (loc: CaseLocation) => {
    setSelectedPlace(loc)
    setDroppedPin(null)
    setIsPlaceSheetExpanded(false)
    setIsBookmarked(false)
  }

  // Start Navigation Mode
  const handleStartNavigation = () => {
    setIsNavigating(true)
    setNavProgress(0)
    setHasArrived(false)
    setIs3DView(true)
    speakDirection(`Bắt đầu đi về hướng ${destination.name}. Tuyến đường nhanh nhất qua ${activeRoute.viaRoute}.`)
  }

  // Stop Navigation
  const handleStopNavigation = () => {
    setIsNavigating(false)
    setNavProgress(0)
    setHasArrived(false)
    setIs3DView(false)
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

  // Interpolate vehicle position along the road-snapped route points
  const vehiclePos = useMemo(() => {
    if (!activeRoute.points || activeRoute.points.length < 2) return activeRoute.points[0]
    const totalSegments = activeRoute.points.length - 1
    const progressSegment = (navProgress / 100) * totalSegments
    const segIndex = Math.min(Math.floor(progressSegment), totalSegments - 1)
    const segT = progressSegment - segIndex
    const p1 = activeRoute.points[segIndex]
    const p2 = activeRoute.points[segIndex + 1]
    return {
      x: p1.x + (p2.x - p1.x) * segT,
      y: p1.y + (p2.y - p1.y) * segT
    }
  }, [activeRoute.points, navProgress])

  // Dynamic Camera Auto-follow in GPS Navigation Mode
  useEffect(() => {
    if (isNavigating && vehiclePos) {
      setPan({
        x: 180 - vehiclePos.x * zoom,
        y: 360 - vehiclePos.y * zoom
      })
    }
  }, [isNavigating, vehiclePos, zoom])

  // Remaining Distance during navigation
  const remainingDistanceKm = useMemo(() => {
    const remaining = activeRoute.distanceKm * (1 - navProgress / 100)
    if (remaining < 0.1) return '50 m'
    if (remaining < 1) return `${Math.round(remaining * 1000)} m`
    return `${remaining.toFixed(1)} km`
  }, [activeRoute.distanceKm, navProgress])

  // Dynamic Scale text in meters
  const scaleMeters = Math.round(500 / zoom)

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
                    placeholder="Tìm kiếm địa điểm trong vụ án..."
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
                  { label: 'Ngân hàng', icon: Landmark, cat: 'finance' },
                  { label: 'Khu dân cư', icon: Building, cat: 'residential' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const match = CASE_LOCATIONS.find((l) => l.category === chip.cat)
                      if (match) {
                        setSelectedPlace(match)
                        setZoom(0.9)
                        setPan({ x: 180 - match.x * 0.9, y: 320 - match.y * 0.9 })
                      }
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
                    Chỉ đường Vụ án #000
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
      {/* 2. THE GOOGLE MAPS INTERACTIVE VECTOR CANVAS (100% CLEAN NO REAL NAMES)   */}
      {/* ========================================================================= */}
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
          'w-full h-full relative overflow-hidden transition-colors cursor-grab active:cursor-grabbing',
          mapLayer === 'satellite' ? 'bg-[#18232c]' : 'bg-[#E5E3DF]'
        )}
      >
        {/* World Layer Transformed by Pan & Zoom & 3D Tilt in Navigation mode */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none transition-transform duration-300"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${is3DView ? 'perspective(700px) rotateX(28deg)' : ''}`,
            width: '2400px',
            height: '2000px'
          }}
        >
          {/* Base SVG Map Graphics */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2400 2000">
            <defs>
              {/* Railroad track pattern */}
              <pattern id="railPattern" width="14" height="14" patternUnits="userSpaceOnUse">
                <path d="M 0,7 L 14,7" stroke="#4B5563" strokeWidth="2.5" />
                <path d="M 3,0 L 3,14 M 10,0 L 10,14" stroke="#1F2937" strokeWidth="2.5" />
              </pattern>

              {/* Water Wave Gradient */}
              <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={mapLayer === 'satellite' ? '#143147' : '#A5D6F7'} />
                <stop offset="50%" stopColor={mapLayer === 'satellite' ? '#0f2638' : '#90cdf4'} />
                <stop offset="100%" stopColor={mapLayer === 'satellite' ? '#0b2030' : '#7cbdf0'} />
              </linearGradient>

              {/* Route Glow Effect */}
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1A73E8" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Land cover background */}
            <rect width="2400" height="2000" fill={mapLayer === 'satellite' ? '#15212B' : '#F1EFE8'} />

            {/* ================================================================= */}
            {/* GREEN PARKS & ECOLOGICAL RESERVES                                 */}
            {/* ================================================================= */}
            <g fill={mapLayer === 'satellite' ? '#1E392A' : '#CEEAD6'} opacity="0.85">
              <path d="M 1150,1620 C 1220,1580 1340,1610 1370,1720 C 1320,1810 1190,1800 1140,1730 Z" />
              <path d="M 940,990 C 1000,970 1080,980 1070,1110 C 1030,1140 960,1140 930,1080 Z" />
              <path d="M 880,660 C 940,640 980,680 970,740 C 920,770 870,740 880,660 Z" />
              <path d="M 1240,680 C 1270,620 1290,720 1280,840 C 1260,930 1230,870 1240,680 Z" fill={mapLayer === 'satellite' ? '#2A4332' : '#D5E8D4'} />
              <path d="M 1320,1260 C 1360,1210 1380,1290 1370,1380 C 1340,1420 1310,1360 1320,1260 Z" fill={mapLayer === 'satellite' ? '#2A4332' : '#D5E8D4'} />
              <path d="M 900,20 C 1100,0 1400,20 1500,80 C 1450,140 1000,120 900,20 Z" />
            </g>

            {/* ================================================================= */}
            {/* LAKES (Hồ Phân Khu Vụ Án)                                         */}
            {/* ================================================================= */}
            <g fill="url(#riverGrad)" stroke="#64B5F6" strokeWidth="1.2">
              <path d="M 820,400 C 960,380 1030,450 1000,560 C 970,650 860,680 780,630 C 710,570 720,430 820,400 Z" />
              <path d="M 1020,490 C 1055,485 1070,520 1060,555 C 1040,575 1015,560 1020,490 Z" />
              <path d="M 1040,820 C 1065,820 1075,860 1065,890 C 1050,910 1030,890 1030,860 C 1030,835 1035,820 1040,820 Z" />
              <path d="M 980,1030 C 1020,1020 1045,1050 1035,1090 C 1015,1110 975,1095 980,1030 Z" />
              <path d="M 780,1540 C 850,1520 890,1570 880,1630 C 840,1670 760,1650 760,1590 Z" />
              <path d="M 870,1420 C 905,1410 920,1445 910,1470 C 885,1485 865,1465 870,1420 Z" />
            </g>

            {/* Sông Hồng (Red River Curve) */}
            <path
              d="M 1320,0 
                 C 1260,180 1190,320 1190,440 
                 C 1190,560 1260,700 1270,850 
                 C 1280,980 1310,1080 1325,1180 
                 C 1345,1300 1440,1450 1470,1600 
                 C 1510,1780 1620,1920 1740,2000 
                 L 1940,2000 
                 C 1820,1920 1710,1780 1670,1600 
                 C 1640,1450 1545,1300 1525,1180 
                 C 1510,1080 1480,980 1470,850 
                 C 1460,700 1390,560 1390,440 
                 C 1390,320 1460,180 1520,0 Z"
              fill="url(#riverGrad)"
              stroke="#64B5F6"
              strokeWidth="2"
            />

            <text
              x="1320"
              y="320"
              fill={mapLayer === 'satellite' ? '#7BBCE6' : '#2563EB'}
              fontSize="16"
              fontWeight="bold"
              letterSpacing="6"
              opacity="0.6"
              transform="rotate(65 1320 320)"
            >
              SÔNG HỒNG
            </text>

            {/* ================================================================= */}
            {/* NỘI BÀI AIRPORT COMPLEX (Top Canvas)                              */}
            {/* ================================================================= */}
            <g>
              <rect x="940" y="30" width="560" height="110" rx="8" fill={mapLayer === 'satellite' ? '#1c2730' : '#E5E3DB'} stroke="#D1D5DB" strokeWidth="1" />
              <rect x="980" y="48" width="480" height="12" fill="#374151" rx="2" />
              <rect x="980" y="86" width="480" height="12" fill="#374151" rx="2" />
              <line x1="990" y1="54" x2="1450" y2="54" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="8 6" />
              <line x1="990" y1="92" x2="1450" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="8 6" />
              <path d="M 1120,70 L 1240,70 L 1260,82 L 1220,82 L 1220,95 L 1140,95 L 1140,82 L 1100,82 Z" fill="#6B7280" />
              <text x="1180" y="65" fill="#4B5563" fontSize="11" fontWeight="bold" textAnchor="middle" style={{ paintOrder: 'stroke fill', stroke: '#FFFFFF', strokeWidth: 3 }}>
                CẢNG HÀNG KHÔNG QUỐC TẾ NỘI BÀI (HAN)
              </text>
            </g>

            {/* ================================================================= */}
            {/* URBAN BUILDING FOOTPRINTS                                         */}
            {/* ================================================================= */}
            <g fill={mapLayer === 'satellite' ? '#1f2d3a' : '#E8E5DF'} stroke={mapLayer === 'satellite' ? '#273847' : '#DAD7D1'} strokeWidth="1">
              <rect x="1170" y="1050" width="60" height="40" rx="2" />
              <rect x="1180" y="1105" width="40" height="30" rx="2" />
              <rect x="1160" y="1150" width="45" height="35" rx="2" />
              <rect x="1090" y="1120" width="45" height="35" rx="2" />
              <rect x="1030" y="1060" width="55" height="35" rx="2" />
              <rect x="1080" y="1210" width="60" height="40" rx="2" />
              <rect x="1150" y="1210" width="50" height="40" rx="2" />

              <rect x="1340" y="1010" width="50" height="30" rx="2" />
              <rect x="1350" y="1070" width="60" height="35" rx="2" />
              <rect x="1370" y="930" width="55" height="45" rx="2" />

              <rect x="1010" y="780" width="50" height="30" rx="2" />
              <rect x="1080" y="780" width="45" height="30" rx="2" />
              <rect x="1090" y="830" width="60" height="40" rx="2" />
              <rect x="1010" y="910" width="55" height="35" rx="2" />
              <rect x="1080" y="910" width="50" height="35" rx="2" />

              <rect x="1045" y="1380" width="55" height="35" rx="2" />
              <rect x="980" y="1450" width="50" height="35" rx="2" />
              <rect x="1050" y="1450" width="60" height="40" rx="2" />

              <rect x="800" y="1650" width="50" height="30" rx="2" />
              <rect x="760" y="1710" width="55" height="35" rx="2" />
            </g>

            {/* Industrial Container Infrastructure */}
            <g>
              <rect x="1360" y="970" width="30" height="12" fill="#DC2626" rx="1" />
              <rect x="1360" y="985" width="30" height="12" fill="#2563EB" rx="1" />
              <rect x="1395" y="970" width="30" height="12" fill="#F59E0B" rx="1" />
              <rect x="1395" y="985" width="30" height="12" fill="#10B981" rx="1" />
              <line x1="1410" y1="960" x2="1425" y2="925" stroke="#4B5563" strokeWidth="3" />
              <line x1="1410" y1="925" x2="1440" y2="925" stroke="#4B5563" strokeWidth="2" />
            </g>

            {/* ================================================================= */}
            {/* SECONDARY STREETS (Pure White with subtle border)                 */}
            {/* ================================================================= */}
            <g stroke={mapLayer === 'satellite' ? '#374151' : '#FFFFFF'} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 1215,1180 L 1240,1120 L 1245,1100 L 1255,1040" />
              <path d="M 1215,1180 L 1270,1250" />
              <path d="M 1245,1100 L 1150,1100 L 1070,1080" />
              <path d="M 1150,1100 L 1120,1160 L 1060,1210 L 1020,1260 L 1020,1420" />
              <path d="M 1255,1040 L 1320,1040 L 1370,1060" />
              <path d="M 1320,1040 L 1390,960" />
              <path d="M 1245,1100 L 1330,1200 L 1420,1270" />
              <path d="M 1330,1200 L 1380,1370" />
              <path d="M 1020,1420 L 920,1560 L 820,1680 L 750,1750" />
              <path d="M 980,800 L 1180,800 L 1200,800" />
              <path d="M 980,850 L 1180,850 L 1220,840" />
              <path d="M 980,900 L 1180,900" />
              <path d="M 1050,750 L 1050,960" />
              <path d="M 1110,750 L 1110,960" />
              <path d="M 1180,880 L 1120,640" />
            </g>

            {/* ================================================================= */}
            {/* PRIMARY ARTERIAL HIGHWAYS (Google Maps Gold #FBBC04)              */}
            {/* ================================================================= */}
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M 1180,100 L 1200,200 L 1220,320 L 1140,440 L 1120,640 L 1080,750"
                stroke={mapLayer === 'satellite' ? '#B45309' : '#F9AB00'}
                strokeWidth="12"
              />
              <path
                d="M 1180,100 L 1200,200 L 1220,320 L 1140,440 L 1120,640 L 1080,750"
                stroke={mapLayer === 'satellite' ? '#F59E0B' : '#FEEA8C'}
                strokeWidth="8"
              />

              <path
                d="M 1120,640 L 1180,880 L 1255,1040 L 1330,1200 L 1480,1110 L 1650,1100"
                stroke={mapLayer === 'satellite' ? '#B45309' : '#F9AB00'}
                strokeWidth="11"
              />
              <path
                d="M 1120,640 L 1180,880 L 1255,1040 L 1330,1200 L 1480,1110 L 1650,1100"
                stroke={mapLayer === 'satellite' ? '#F59E0B' : '#FEEA8C'}
                strokeWidth="7"
              />

              <path
                d="M 700,1100 L 780,1350 L 920,1560 L 1150,1550 L 1380,1480 L 1650,1420 L 1850,1400"
                stroke={mapLayer === 'satellite' ? '#B45309' : '#F9AB00'}
                strokeWidth="12"
              />
              <path
                d="M 700,1100 L 780,1350 L 920,1560 L 1150,1550 L 1380,1480 L 1650,1420 L 1850,1400"
                stroke={mapLayer === 'satellite' ? '#F59E0B' : '#FEEA8C'}
                strokeWidth="8"
              />

              <path
                d="M 1050,960 L 1020,1420 L 920,1560 L 820,1680 L 750,1750 L 720,1950"
                stroke={mapLayer === 'satellite' ? '#B45309' : '#F9AB00'}
                strokeWidth="10"
              />
              <path
                d="M 1050,960 L 1020,1420 L 920,1560 L 820,1680 L 750,1750 L 720,1950"
                stroke={mapLayer === 'satellite' ? '#F59E0B' : '#FEEA8C'}
                strokeWidth="6.5"
              />

              <path
                d="M 1180,850 L 1220,840 L 1370,810 L 1550,800 L 1800,820"
                stroke={mapLayer === 'satellite' ? '#B45309' : '#F9AB00'}
                strokeWidth="10"
              />
              <path
                d="M 1180,850 L 1220,840 L 1370,810 L 1550,800 L 1800,820"
                stroke={mapLayer === 'satellite' ? '#F59E0B' : '#FEEA8C'}
                strokeWidth="6.5"
              />
            </g>

            {/* ================================================================= */}
            {/* 5 BRIDGES ACROSS RED RIVER                                        */}
            {/* ================================================================= */}
            <g>
              <line x1="1140" y1="440" x2="1220" y2="320" stroke="#DC2626" strokeWidth="4" />
              {[0.15, 0.32, 0.5, 0.68, 0.85].map((t, idx) => {
                const px = 1140 + (1220 - 1140) * t
                const py = 440 + (320 - 440) * t
                return (
                  <g key={idx}>
                    <line x1={px - 8} y1={py + 5} x2={px + 8} y2={py - 5} stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx={px} cy={py} r="3" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                  </g>
                )
              })}
            </g>
            <line x1="1200" y1="800" x2="1330" y2="770" stroke="#78350F" strokeWidth="6" />
            <line x1="1220" y1="840" x2="1370" y2="810" stroke="#4B5563" strokeWidth="5" />
            <line x1="1280" y1="1150" x2="1480" y2="1110" stroke="#4B5563" strokeWidth="7" />
            <line x1="1380" y1="1480" x2="1650" y2="1420" stroke="#4B5563" strokeWidth="8" />

            {/* ================================================================= */}
            {/* RAILROAD TRACK                                                    */}
            {/* ================================================================= */}
            <g fill="none">
              <path
                d="M 1330,770 L 1200,800 L 1030,930 L 1025,1080 L 1245,1100 L 1020,1420 L 920,1560 L 820,1680 L 750,1750 L 720,1950"
                stroke="#1F2937"
                strokeWidth="6"
              />
              <path
                d="M 1330,770 L 1200,800 L 1030,930 L 1025,1080 L 1245,1100 L 1020,1420 L 920,1560 L 820,1680 L 750,1750 L 720,1950"
                stroke="url(#railPattern)"
                strokeWidth="8"
              />
            </g>

            {/* Railway Crossing Sign */}
            <g transform="translate(1245, 1100)">
              <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
              <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">✕</text>
            </g>

            {/* ================================================================= */}
            {/* LIVE TRAFFIC OVERLAY                                              */}
            {/* ================================================================= */}
            {showTrafficLayer && (
              <g fill="none" strokeLinecap="round" opacity="0.85">
                <path d="M 1180,100 L 1200,200 L 1220,320 L 1140,440" stroke="#0F9D58" strokeWidth="3" />
                <path d="M 1120,640 L 1180,880" stroke="#0F9D58" strokeWidth="3" />
                <path d="M 700,1100 L 780,1350 L 920,1560" stroke="#0F9D58" strokeWidth="3" />
                <path d="M 1380,1480 L 1650,1420" stroke="#0F9D58" strokeWidth="3" />
                <path d="M 1140,440 L 1120,640" stroke="#F4B400" strokeWidth="3" />
                <path d="M 1255,1040 L 1330,1200" stroke="#F4B400" strokeWidth="3" />
                <path d="M 1020,1420 L 920,1560" stroke="#0F9D58" strokeWidth="2.5" />
              </g>
            )}

            {/* ================================================================= */}
            {/* CASE-SPECIFIC STREET LABELS ONLY (Zero real street name leaks)    */}
            {/* ================================================================= */}
            <g style={{ paintOrder: 'stroke fill' }} stroke="#FFFFFF" strokeWidth="3.5" fill="#4B5563" fontSize="10.5" fontWeight="600" fontFamily="sans-serif">
              <text x="1235" y="1080">ĐƯỜNG BỜ SÔNG</text>
              <text x="1335" y="1030">ĐƯỜNG BỜ KÈ</text>
              <text x="1090" y="1075">ĐƯỜNG ĐOÀN KẾT</text>
              <text x="1070" y="1170">PHỐ CẦU CẢNG</text>
              <text x="1340" y="1250">ĐƯỜNG CHIẾN THẮNG</text>
              <text x="1025" y="1410">PHỐ VỌNG</text>
              <text x="760" y="1740">PHỐ CẦU BƯƠU</text>
              <text x="1150" y="270">TRỤC CAO TỐC PHÍA BẮC</text>
            </g>

            {/* Area Label */}
            <g fill="#70757A" fontSize="13" fontWeight="800" letterSpacing="3" fontFamily="sans-serif" opacity="0.65">
              <text x="1160" y="1170">PHÂN KHU CẢNG</text>
            </g>

            {/* ================================================================= */}
            {/* NAVIGATION ROUTE POLYLINES                                        */}
            {/* ================================================================= */}
            {/* 1. Alternative Route (Gray Line) */}
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

            {/* 2. Primary Route (Google Maps Blue Polyline with White Casing) */}
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

            {/* REAL-TIME MOVING VEHICLE / NAVIGATION PUCK */}
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
          {activeRoute.points.length > 1 && !isNavigating && (
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
          {baseRoute.alternativePoints && !useAlternativeRoute && !isNavigating && (
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
          {CASE_LOCATIONS.map((loc) => {
            const isOrigin = loc.id === origin.id
            const isDestination = loc.id === destination.id

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
                  /* 2. Destination Pin B: Google Maps Teardrop Red Pin */
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <MapPin className="size-9 text-[#EA4335] fill-[#EA4335] drop-shadow-md" />
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-white shadow-inner" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#EA4335] text-white text-[9.5px] font-bold shadow-md whitespace-nowrap border border-white -mt-1">
                      B: {loc.name}
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
          <button
            onClick={() => {
              setPan({ x: -750, y: -520 })
              setZoom(0.75)
              setIs3DView(false)
            }}
            className="size-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Đặt lại góc nhìn La bàn (Bắc)"
          >
            <Compass className="size-5 text-red-500" />
          </button>

          <button
            onClick={() => setIs3DView(!is3DView)}
            className={cn(
              'size-9 rounded-full shadow-md border flex items-center justify-center cursor-pointer transition-all active:scale-95 text-[11px] font-bold font-mono',
              is3DView
                ? 'bg-[#1A73E8] text-white border-blue-600'
                : 'bg-white text-gray-700 hover:text-[#1A73E8] border-gray-200'
            )}
            title="Góc nhìn 3D nghiêng"
          >
            3D
          </button>

          <button
            onClick={() => setShowLayersSheet(true)}
            className="size-9 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#1A73E8] flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Lớp bản đồ"
          >
            <Layers className="size-4" />
          </button>

          <button
            onClick={handleCenterMyLocation}
            className={cn(
              'size-9 rounded-full shadow-md border flex items-center justify-center cursor-pointer transition-all active:scale-95',
              isCentered
                ? 'bg-[#1A73E8] text-white border-blue-600'
                : 'bg-white text-gray-600 hover:text-[#1A73E8] border-gray-200'
            )}
            title="Định vị về Vị trí của bạn"
          >
            <Crosshair className="size-4" />
          </button>

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
          {droppedPin ? (
            <div className="space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">
                    {droppedPin.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Tọa độ: {droppedPin.x}, {droppedPin.y} • Phân khu Cảng, TP. Hà Nội
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
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
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
      {/* 4. TURN-BY-TURN DIRECTIONS DRAWER                                         */}
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
      {/* 5. LOCATION PICKER MODAL                                                  */}
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

      {/* ========================================================================= */}
      {/* 7. NAVIGATION MODE BOTTOM CONTROL BAR                                     */}
      {/* ========================================================================= */}
      {isNavigating && (
        <div className="absolute bottom-3 inset-x-3 z-40 flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="size-12 rounded-full bg-white shadow-xl border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-[13px] font-bold leading-none font-mono text-gray-900">{navSpeed}</span>
              <span className="text-[7px] text-gray-500 font-bold">km/h</span>
            </div>
            <div className="size-8 rounded-full bg-white border-2 border-red-600 shadow-md flex items-center justify-center font-bold text-[10px] text-gray-900 font-mono">
              40
            </div>
          </div>

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
