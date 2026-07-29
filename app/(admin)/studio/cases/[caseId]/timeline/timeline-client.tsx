'use client'

import React, { useState, useMemo } from 'react'
import { Clock, Play, ZoomIn, ZoomOut, Ghost, Filter, Settings2, Lock, Undo2, Redo2, Plus, X, Save } from 'lucide-react'
import { TimelineBlock } from '@/components/admin/timeline-block'
import { CharacterPanel } from '@/components/admin/character-panel'
import { DbTimelineEvent } from '@/lib/types/database'
import { saveTimelineEvents } from '@/lib/actions/timeline-actions'
import { saveCharacters } from '@/lib/actions/character-actions'
import { toast } from '@/components/ui/toast'

// --- CONSTANTS ---
const START_HOUR = 0 // 00:00
const END_HOUR = 24  // 24:00
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

// Generate ticks for X-axis (every 30 mins)
const timeTicks = Array.from({ length: ((END_HOUR - START_HOUR) * 2) + 1 }).map((_, i) => {
  const hour = Math.floor(START_HOUR + (i / 2))
  const min = i % 2 === 0 ? '00' : '30'
  const displayHour = hour === 24 ? '0' : hour.toString()
  return `${displayHour}:${min}`
})

// --- TYPES & INITIAL DATA ---
type TrackEvent = {
  id: string
  title: string
  location: string
  dayOffset?: number // 0 for Day 1, 1 for Day 2, -30 for 30 days ago, etc.
  startMin: number // Absolute minutes within the day (0 to 1440)
  endMin: number
  type: 'TRUTH' | 'LIE'
  isFatal?: boolean
}

type Track = {
  id: string
  name: string
  avatar: string
  avatar_url?: string
  role: string
  events: TrackEvent[]
  occupation?: string
  relationship?: string
  quirks?: string
  motive?: string
  secret?: string
  items?: string
  position_x?: number
  position_y?: number
}

// Convert DbTimelineEvent[] to Track[]
function buildInitialTracks(events: DbTimelineEvent[], initialCharacters: any[]): Track[] {
  const tracksMap = new Map<string, Track>()
  
  // 1. Initialize tracks from database characters if available
  if (initialCharacters && initialCharacters.length > 0) {
    initialCharacters.forEach(c => {
      tracksMap.set(c.name, {
        id: c.id,
        name: c.name,
        avatar: c.name.substring(0, 2).toUpperCase(),
        role: c.role || 'SUSPECT',
        occupation: c.occupation || '',
        relationship: c.relationship || '',
        quirks: c.quirks || '',
        motive: c.real_motive || '',
        secret: c.red_herring_secret || '',
        items: c.items || '',
        position_x: c.position_x ?? 0,
        position_y: c.position_y ?? 0,
        events: []
      })
    })
  }

  // 2. Decode events and group by character
  events.forEach(ev => {
    const charName = ev.character_name || 'Unknown'
    if (!tracksMap.has(charName)) {
      tracksMap.set(charName, {
        id: charName,
        name: charName,
        avatar: charName.substring(0, 2).toUpperCase(),
        role: 'SUSPECT',
        events: []
      })
    }
    
    // Decode start_min and end_min into dayOffset and relative minutes
    const dayOffset = Math.floor(ev.start_min / 1440)
    const startMin = ev.start_min - (dayOffset * 1440)
    const endMin = ev.end_min - (dayOffset * 1440)
    
    tracksMap.get(charName)!.events.push({
      id: ev.id,
      title: ev.event_title,
      location: ev.location || '',
      dayOffset,
      startMin,
      endMin,
      type: ev.is_truth ? 'TRUTH' : 'LIE',
      isFatal: ev.is_fatal
    })
  })

  // Ensure a __GLOBAL__ track always exists
  if (!tracksMap.has('__GLOBAL__')) {
    tracksMap.set('__GLOBAL__', {
      id: '__GLOBAL__',
      name: '__GLOBAL__',
      avatar: 'GL',
      role: 'SYSTEM',
      events: []
    })
  }

  return Array.from(tracksMap.values())
}

export default function TimelineClient({ 
  caseId, 
  initialEvents, 
  initialCharacters 
}: { 
  caseId: string
  initialEvents: DbTimelineEvent[]
  initialCharacters: any[]
}) {
  const [viewMode, setViewMode] = useState<'truth' | 'lies' | 'compare'>('compare')
  const [isSaving, setIsSaving] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  // Active selected day offset
  const [activeDayOffset, setActiveDayOffset] = useState<number>(0)
  
  // Extra days created manually by the user
  const [extraDays, setExtraDays] = useState<number[]>([])

  // Modal states
  const [showAddCharModal, setShowAddCharModal] = useState(false)
  const [newCharForm, setNewCharForm] = useState({ name: '', role: 'SUSPECT' })
  const [showAddPastModal, setShowAddPastModal] = useState(false)
  const [pastDaysInput, setPastDaysInput] = useState('30')
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<Track[][]>([buildInitialTracks(initialEvents, initialCharacters)])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  // Panning State
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)

  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore if clicking on a block or button
    if (e.button !== 0 && e.button !== 1) return // Allow left click and middle click
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[data-timeline-block]')) return

    setIsPanning(true)
    const container = scrollContainerRef.current
    if (!container) return

    const startX = e.clientX
    const startY = e.clientY
    const startScrollLeft = container.scrollLeft
    const startScrollTop = container.scrollTop

    const handlePanMove = (moveEvt: PointerEvent) => {
      container.scrollLeft = startScrollLeft - (moveEvt.clientX - startX)
      container.scrollTop = startScrollTop - (moveEvt.clientY - startY)
    }

    const handlePanEnd = () => {
      setIsPanning(false)
      window.removeEventListener('pointermove', handlePanMove)
      window.removeEventListener('pointerup', handlePanEnd)
    }

    window.addEventListener('pointermove', handlePanMove)
    window.addEventListener('pointerup', handlePanEnd)
  }

  // Current active tracks
  const tracks = history[historyIndex]

  // Helper to push new state to history
  const pushState = (newTracks: Track[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newTracks)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Keyboard Shortcuts (Ctrl+Z / Cmd+Z)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1)
        } else {
          if (historyIndex > 0) setHistoryIndex(historyIndex - 1)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history])

  // Selection State
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  // Click outside to deselect
  React.useEffect(() => {
    const handleClickOutside = () => setSelectedEventId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  // Calculate distinct day offsets available in the timeline
  const dayOffsets = useMemo(() => {
    const offsets = new Set<number>()
    // Add default Day 1 & Day 2 (offsets 0 and 1)
    offsets.add(0)
    offsets.add(1)
    // Add any offsets found in events
    tracks.forEach(track => {
      track.events.forEach(ev => {
        offsets.add(ev.dayOffset ?? 0)
      })
    })
    // Add any extra days added by the user
    extraDays.forEach(d => offsets.add(d))
    return Array.from(offsets).sort((a, b) => a - b)
  }, [tracks, extraDays])

  const caseDays = useMemo(() => dayOffsets.filter(o => o >= 0), [dayOffsets])
  const caseDaysCount = caseDays.length || 1
  const totalMinutes = caseDaysCount * 1440

  const hasAutoScrolledRef = React.useRef(false)

  // Auto-scroll to the earliest activity block only once when page loads
  React.useEffect(() => {
    if (hasAutoScrolledRef.current) return
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    // Get all events for the current active day (if any), otherwise all events across active case days
    let targetEvents = tracks.flatMap(t => 
      t.events.filter(e => (e.dayOffset ?? 0) === activeDayOffset)
    )

    // Fallback: if no events on current day, look across all case days
    if (targetEvents.length === 0) {
      targetEvents = tracks.flatMap(t => 
        t.events.filter(e => (e.dayOffset ?? 0) >= 0)
      )
    }

    if (targetEvents.length > 0) {
      hasAutoScrolledRef.current = true
      // Find minimum absolute minute from start of timeline
      const minAbsMinute = Math.min(...targetEvents.map(e => (e.dayOffset ?? 0) * 1440 + e.startMin))
      // Leave a 45-minute padding before the first event
      const paddedAbsMinute = Math.max(0, minAbsMinute - 45)
      
      const totalCanvasMinutes = 1440 * caseDaysCount

      const timer = setTimeout(() => {
        if (!scrollContainerRef.current) return
        const scrollWidth = scrollContainerRef.current.scrollWidth
        const scrollPos = (paddedAbsMinute / totalCanvasMinutes) * scrollWidth

        scrollContainerRef.current.scrollTo({
          left: scrollPos,
          behavior: 'smooth'
        })
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [activeDayOffset, caseDaysCount, tracks])

  // Update Event coordinates (drag & drop handler)
  const handleUpdateEvent = (trackId: string, eventId: string, absoluteStart: number, absoluteEnd: number) => {
    const newDayOffset = Math.floor(absoluteStart / 1440)
    const newStartMin = absoluteStart - (newDayOffset * 1440)
    const newEndMin = absoluteEnd - (newDayOffset * 1440)

    const newTracks = tracks.map(track => {
      if (track.id !== trackId) return track
      return {
        ...track,
        events: track.events.map(ev => 
          ev.id === eventId 
            ? { ...ev, dayOffset: newDayOffset, startMin: newStartMin, endMin: newEndMin } 
            : ev
        )
      }
    })
    pushState(newTracks)
  }

  const handleDeleteEvent = (trackId: string, eventId: string) => {
    const newTracks = tracks.map(track => {
      if (track.id !== trackId) return track
      return { ...track, events: track.events.filter(ev => ev.id !== eventId) }
    })
    pushState(newTracks)
    setSelectedEventId(null)
  }

  const handleDuplicateEvent = (trackId: string, event: TrackEvent) => {
    const duplicatedEvent: TrackEvent = {
      ...event,
      id: `dup-${Date.now()}`,
      startMin: event.endMin,
      endMin: event.endMin + (event.endMin - event.startMin)
    }
    const newTracks = tracks.map(track => {
      if (track.id !== trackId) return track
      return { ...track, events: [...track.events, duplicatedEvent] }
    })
    pushState(newTracks)
    setSelectedEventId(duplicatedEvent.id)
  }

  const handleSaveDetails = (trackId: string, eventId: string, details: Partial<TrackEvent>) => {
    const newTracks = tracks.map(track => {
      if (track.id !== trackId) return track
      return {
        ...track,
        events: track.events.map(ev => 
          ev.id === eventId ? { ...ev, ...details } : ev
        )
      }
    })
    pushState(newTracks)
  }

  const handleSaveCharacter = (updatedData: any) => {
    if (!selectedCharacterId) return
    const newTracks = tracks.map(track => {
      if (track.id !== selectedCharacterId) return track
      return {
        ...track,
        id: track.id,
        name: updatedData.name,
        role: updatedData.role,
        avatar_url: updatedData.avatar_url,
        occupation: updatedData.occupation,
        relationship: updatedData.relationship,
        quirks: updatedData.quirks,
        motive: updatedData.motive,
        secret: updatedData.secret,
        items: updatedData.items
      }
    })
    pushState(newTracks)
    setSelectedCharacterId(null)
  }

  const handleDeleteCharacter = (characterId: string) => {
    const newTracks = tracks.filter(t => t.id !== characterId)
    pushState(newTracks)
    setSelectedCharacterId(null)
  }

  // Create new event on Double Click
  const handleCreateEvent = (e: React.MouseEvent<HTMLDivElement>, trackId: string) => {
    // Only trigger if clicking directly on the lane, not on a child block
    if (e.target !== e.currentTarget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickedMinute = (clickX / rect.width) * totalMinutes
    
    // Snap to nearest 15 mins absolute
    const absoluteStartMin = Math.round(clickedMinute / 15) * 15
    const newDayOffset = Math.floor(absoluteStartMin / 1440)
    let startMin = absoluteStartMin - (newDayOffset * 1440)
    let endMin = startMin + 30 // Default duration 30 mins

    if (endMin > 1440) {
      endMin = 1440
      startMin = Math.max(0, endMin - 30)
    }

    const newEvent: TrackEvent = {
      id: `new-${Date.now()}`,
      title: 'New Activity',
      location: 'Unknown',
      dayOffset: newDayOffset,
      startMin,
      endMin,
      type: viewMode === 'lies' ? 'LIE' : 'TRUTH'
    }

    const newTracks = tracks.map(t => {
      if (t.id === trackId) {
        return { ...t, events: [...t.events, newEvent] }
      }
      return t
    })
    pushState(newTracks)
    setSelectedEventId(newEvent.id)
  }

  // Pre-calculate clashes (Real-time collision detection)
  const clashingEventIds = useMemo(() => {
    const clashes = new Set<string>()
    if (viewMode !== 'compare') return clashes // Only detect clash in compare mode

    tracks.forEach(track => {
      for (let i = 0; i < track.events.length; i++) {
        for (let j = i + 1; j < track.events.length; j++) {
          const e1 = track.events[i]
          const e2 = track.events[j]
          // If they occur on the same day and overlap in time
          if (e1.dayOffset === e2.dayOffset && e1.startMin < e2.endMin && e1.endMin > e2.startMin) {
            clashes.add(e1.id)
            clashes.add(e2.id)
          }
        }
      }
    })
    return clashes
  }, [tracks, viewMode])



  const timeTicks = useMemo(() => {
    const ticks = []
    for (let d = 0; d < caseDaysCount; d++) {
      const dayOffset = caseDays[d]
      for (let h = 0; h < 24; h++) {
        ticks.push({
          label: `${h}:${h === 24 ? '00' : '00'}`,
          subLabel: h === 0 ? `Ngày ${dayOffset + 1}` : undefined,
          minute: d * 1440 + h * 60
        })
        ticks.push({
          label: `${h}:30`,
          minute: d * 1440 + h * 60 + 30
        })
      }
    }
    // Add last tick
    ticks.push({
      label: `0:00`,
      subLabel: `Ngày ${caseDaysCount + 1}`,
      minute: caseDaysCount * 1440
    })
    return ticks
  }, [caseDaysCount, caseDays])

  const getDayLabel = (offset: number) => {
    if (offset === 0) return 'Day 0'
    if (offset > 0) return `Ngày ${offset + 1}`
    const absDays = Math.abs(offset)
    if (absDays >= 365) {
      const years = Math.floor(absDays / 365)
      const remDays = absDays % 365
      const months = Math.floor(remDays / 30)
      return `${years} năm${months ? ` ${months} tháng` : ''} trước`
    }
    if (absDays >= 30) {
      const months = Math.floor(absDays / 30)
      const remDays = absDays % 30
      return `${months} tháng${remDays ? ` ${remDays} ngày` : ''} trước`
    }
    return `${absDays} ngày trước`
  }

  // Flag to temporarily disable scroll detection during smooth scroll
  const isScrollingRef = React.useRef(false)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleDaySelect = (offset: number) => {
    setActiveDayOffset(offset)
    setSelectedEventId(null)
    
    if (offset >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const dayIndex = caseDays.indexOf(offset)
      if (dayIndex !== -1) {
        isScrollingRef.current = true
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
        
        const scrollWidth = container.scrollWidth
        const dayWidth = scrollWidth / caseDaysCount
        
        container.scrollTo({
          left: dayIndex * dayWidth,
          behavior: 'smooth'
        })
        
        // Re-enable scroll listener after animation finishes (~300ms)
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false
        }, 500)
      }
    }
  }

  const handleScroll = () => {
    if (isScrollingRef.current || activeDayOffset < 0) return
    const container = scrollContainerRef.current
    if (!container) return
    
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth
    if (scrollWidth === 0) return
    
    const dayWidth = scrollWidth / caseDaysCount
    const currentDayIndex = Math.min(
      caseDaysCount - 1,
      Math.max(0, Math.round(scrollLeft / dayWidth))
    )
    const targetOffset = caseDays[currentDayIndex]
    if (targetOffset !== undefined && targetOffset !== activeDayOffset) {
      setActiveDayOffset(targetOffset)
    }
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      
      {/* TOOLBAR */}
      <div className="h-14 border-b border-white/10 bg-zinc-900/40 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-zinc-100">
          <Clock className="size-4 text-primary" />
          <h2 className="font-medium text-sm">Interactive Timeline</h2>
        </div>

        {/* View Toggles */}
        <div className="flex bg-zinc-950 p-1 rounded-md border border-white/5">
          <button 
            onClick={() => setViewMode('lies')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewMode === 'lies' ? 'bg-zinc-800 text-rose-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Alibi Mode
          </button>
          <button 
            onClick={() => setViewMode('truth')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1 ${viewMode === 'truth' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Lock className="size-3" /> Truth Mode
          </button>
          <button 
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1 ${viewMode === 'compare' ? 'bg-zinc-800 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Ghost className="size-3" /> Compare
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="text-[10px] font-mono text-zinc-500 w-8 text-center">{zoomLevel}%</span>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 50, 400))}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={() => setShowAddPastModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-white/10 hover:border-white/20 text-zinc-300 hover:text-zinc-100 bg-zinc-800/40 rounded transition-colors"
          >
            <Plus className="size-3.5" /> Mốc Quá Khứ
          </button>
          <button
            onClick={() => {
              const currentCaseDays = dayOffsets.filter(o => o >= 0)
              const nextDayOffset = currentCaseDays.length
              setExtraDays(prev => [...prev, nextDayOffset])
              setTimeout(() => {
                handleDaySelect(nextDayOffset)
              }, 50)
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-primary/20 hover:border-primary/40 text-primary hover:text-primary/95 bg-primary/5 rounded transition-colors"
          >
            <Plus className="size-3.5" /> Ngày Tiếp Theo
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={async () => {
              setIsSaving(true)
              const payload = tracks.flatMap(t => t.events.map(e => ({
                id: e.id.startsWith('new-') || e.id.startsWith('dup-') ? crypto.randomUUID() : e.id,
                character_name: t.name,
                event_title: e.title,
                location: e.location,
                start_min: (e.dayOffset || 0) * 1440 + e.startMin,
                end_min: (e.dayOffset || 0) * 1440 + e.endMin,
                is_truth: e.type === 'TRUTH',
                is_fatal: e.isFatal || false
              })))
              
              const [resChars, resEvents] = await Promise.all([
                saveCharacters(caseId, tracks.filter(t => t.id !== '__GLOBAL__')),
                saveTimelineEvents(caseId, payload)
              ])
              
              setIsSaving(false)
              if (resChars.success && resEvents.success) {
                toast.success('Lưu mốc thời gian và nhân vật thành công!')
              } else {
                toast.error(`Lỗi khi lưu:\nNhân vật: ${resChars.error || 'OK'}\nSự kiện: ${resEvents.error || 'OK'}`)
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs ml-2"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* MASTER TIMELINE NAVIGATOR */}
      <div className="px-4 py-3 border-b border-white/10 bg-zinc-950/60 flex justify-center shrink-0 overflow-x-auto select-none">
        
        <div className="flex items-center gap-36 flex-1 justify-center relative mx-auto h-16">
          {/* Connecting line */}
          <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-zinc-800/80 -translate-y-1/2 z-0" />
          
          {dayOffsets.map((offset) => {
            const isActive = activeDayOffset === offset
            const isHistorical = offset < 0
            
            return (
              <button
                key={offset}
                onClick={() => handleDaySelect(offset)}
                className="relative z-10 flex flex-col items-center justify-center group focus:outline-none cursor-pointer min-w-[70px] h-full"
              >
                {/* Circle Node */}
                <div className={`rounded-full flex items-center justify-center border transition-all duration-300 z-10 bg-zinc-950 ${
                  offset === 0
                    ? isActive
                      ? 'size-5 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] scale-110'
                      : 'size-5 border-rose-600/60 shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:border-rose-500'
                    : isActive 
                      ? 'size-3.5 border-primary shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-125' 
                      : isHistorical 
                        ? 'size-3.5 border-zinc-700 group-hover:border-zinc-400 group-hover:scale-110'
                        : 'size-3.5 border-zinc-600 group-hover:border-zinc-300 group-hover:scale-110'
                }`}>
                  <div className={`rounded-full transition-all duration-300 ${
                    offset === 0
                      ? 'size-2 bg-rose-500 animate-pulse'
                      : isActive 
                        ? 'size-1.5 bg-primary' 
                        : isHistorical 
                          ? 'size-1.5 bg-zinc-800 group-hover:bg-zinc-500'
                          : 'size-1.5 bg-zinc-700 group-hover:bg-zinc-400'
                  }`} />
                </div>
                {/* Label (Absolutely positioned below the circle so it doesn't affect vertical alignment) */}
                <span className={`absolute top-[44px] left-1/2 -translate-x-1/2 whitespace-nowrap transition-colors duration-300 text-[10px] font-medium ${
                  offset === 0
                    ? isActive
                      ? 'text-rose-400 font-bold tracking-wide scale-105'
                      : 'text-rose-500/80 font-semibold group-hover:text-rose-400'
                    : isActive 
                      ? 'text-primary font-bold' 
                      : 'text-zinc-500 group-hover:text-zinc-300'
                }`}>
                  {getDayLabel(offset)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* EDITOR WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Y-Axis: Track Headers */}
        <div className="w-56 shrink-0 border-r border-white/10 bg-zinc-950/80 flex flex-col relative z-20">
          <div className="h-10 border-b border-white/10 bg-zinc-900/50 flex items-center px-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Cast & Tracks</span>
          </div>
          <div className="flex-1 overflow-auto scrollbar-none">
            {tracks.filter(t => t.id !== '__GLOBAL__').map(track => (
              <button 
                key={track.id} 
                onClick={() => setSelectedCharacterId(track.id)}
                className="w-full text-left h-20 border-b border-white/5 flex items-center px-4 hover:bg-white/[0.05] transition-colors focus:outline-none focus:bg-white/[0.05]"
              >
                <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 border border-white/5 mr-3 shrink-0">
                  {track.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{track.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{track.role}</div>
                </div>
              </button>
            ))}
            <button 
              onClick={() => setShowAddCharModal(true)}
              className="w-full h-14 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] border-b border-white/5 transition-colors"
            >
              <Plus className="size-4" /> Add Character
            </button>
          </div>
        </div>

        {/* Character Side Panel (Slide Over from Right) */}
        <CharacterPanel 
          key={selectedCharacterId || 'none'}
          isOpen={!!selectedCharacterId}
          character={tracks.find(t => t.id === selectedCharacterId) as any}
          onClose={() => setSelectedCharacterId(null)}
          onSave={handleSaveCharacter}
          onDelete={handleDeleteCharacter}
        />

        {/* X-Axis: Canvas or Historical List Editor */}
        {activeDayOffset >= 0 ? (
          <div 
            ref={scrollContainerRef}
            onPointerDown={handlePanStart}
            onScroll={handleScroll}
            className={`flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <div 
              className="h-full flex flex-col relative transition-all duration-300"
              style={{ width: `${(zoomLevel / 100) * 2400 * caseDaysCount}px` }}
            >
              
              {/* Time Ticks Header */}
              <div className="h-10 border-b border-white/10 bg-zinc-900/90 sticky top-0 z-10 flex">
                {timeTicks.map((tick, i) => {
                  const isHalfHour = tick.label.endsWith(':30')
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 border-l relative h-full ${tick.subLabel ? 'border-l-primary/30 border-l-2' : 'border-l-white/5'}`}
                      style={{ left: `${(tick.minute / totalMinutes) * 100}%`, position: 'absolute' }}
                    >
                      {!isHalfHour && (
                        <span className="absolute -left-3 top-3 text-[10px] font-mono text-zinc-500">
                          {tick.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Tracks Container */}
              <div className="flex-1 relative">
                {/* Render Vertical Grid Lines */}
                {timeTicks.map((tick, i) => (
                  <div 
                    key={`grid-${i}`} 
                    className={`absolute top-0 bottom-0 border-l pointer-events-none ${tick.subLabel ? 'border-l-primary/10 border-l-2' : 'border-l-dashed border-l-white/[0.03]'}`}
                    style={{ left: `${(tick.minute / totalMinutes) * 100}%` }}
                  />
                ))}

                {/* Render Track Lanes */}
                {tracks.map((track, trackIdx) => (
                  <div 
                    key={`lane-${track.id}`} 
                    className="absolute w-full h-20 border-b border-white/5 hover:bg-white/[0.02] transition-colors" 
                    style={{ top: `${trackIdx * 5}rem` }}
                    onDoubleClick={(e) => handleCreateEvent(e, track.id)}
                    title="Double-click to add a new event"
                  >
                    
                    {/* Render Events inside the lane */}
                    {track.events.map(event => {
                      // Hide historical events on the canvas
                      if ((event.dayOffset ?? 0) < 0) return null
                      
                      // Filter based on view mode
                      if (viewMode === 'truth' && event.type === 'LIE') return null
                      if (viewMode === 'lies' && event.type === 'TRUTH') return null

                      const isGhost = viewMode === 'compare' && event.type === 'LIE'
                      const isClash = clashingEventIds.has(event.id)
                      
                      return (
                        <TimelineBlock
                          key={event.id}
                          event={event}
                          trackId={track.id}
                          isGhost={isGhost}
                          isClash={isClash}
                          isSelected={selectedEventId === event.id}
                          startMin={(event.dayOffset ?? 0) * 1440 + event.startMin}
                          endMin={(event.dayOffset ?? 0) * 1440 + event.endMin}
                          totalMinutes={totalMinutes}
                          onSelectEvent={() => {
                            setTimeout(() => setSelectedEventId(event.id), 0)
                          }}
                          onUpdateEvent={handleUpdateEvent}
                          onDeleteEvent={handleDeleteEvent}
                          onDuplicateEvent={handleDuplicateEvent}
                          onSaveDetails={handleSaveDetails}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

            </div>
          </div>
        ) : (
          /* Historical Events List Editor */
          <div className="flex-1 overflow-y-auto bg-zinc-950/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">{getDayLabel(activeDayOffset)}</h3>
                <p className="text-xs text-zinc-400 mt-1">Các mốc sự kiện quan trọng trong quá khứ được sắp xếp theo nhân vật.</p>
              </div>
            </div>

            <div className="space-y-6 max-w-3xl">
              {tracks.map(track => {
                const dayEvents = track.events.filter(e => e.dayOffset === activeDayOffset)
                
                return (
                  <div key={track.id} className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                          {track.avatar}
                        </div>
                        <span className="text-sm font-semibold text-zinc-300">{track.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newEvent: TrackEvent = {
                            id: `new-${Date.now()}`,
                            title: 'Mốc sự kiện mới',
                            location: 'Hiện trường',
                            dayOffset: activeDayOffset,
                            startMin: 0,
                            endMin: 0,
                            type: 'TRUTH'
                          }
                          const newTracks = tracks.map(t => {
                            if (t.id === track.id) {
                              return { ...t, events: [...t.events, newEvent] }
                            }
                            return t
                          })
                          pushState(newTracks)
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        <Plus className="size-3" /> Thêm sự kiện
                      </button>
                    </div>

                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">Chưa có sự kiện nào được ghi nhận cho nhân vật này.</p>
                    ) : (
                      <div className="space-y-3">
                        {dayEvents.map(event => (
                          <div key={event.id} className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-lg border border-white/5">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Tên sự kiện</label>
                                <input
                                  type="text"
                                  value={event.title}
                                  onChange={e => handleSaveDetails(track.id, event.id, { title: e.target.value })}
                                  placeholder="Sự việc xảy ra"
                                  className="w-full bg-zinc-900 border border-white/5 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Địa điểm</label>
                                <input
                                  type="text"
                                  value={event.location}
                                  onChange={e => handleSaveDetails(track.id, event.id, { location: e.target.value })}
                                  placeholder="Nơi chốn"
                                  className="w-full bg-zinc-900 border border-white/5 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Tính chất</label>
                                <select
                                  value={event.type}
                                  onChange={e => handleSaveDetails(track.id, event.id, { type: e.target.value as any })}
                                  className="w-full bg-zinc-900 border border-white/5 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-primary"
                                >
                                  <option value="TRUTH">Sự thật khách quan (Truth)</option>
                                  <option value="LIE">Lời khai ngoại phạm (Lie)</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center self-end pb-1.5">
                              <button
                                onClick={() => handleDeleteEvent(track.id, event.id)}
                                className="p-1.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-white/5 rounded transition-colors"
                                title="Xóa mốc sự kiện"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* CREATE CHARACTER MODAL */}
      {showAddCharModal && (
        <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-96 bg-zinc-900 border border-white/10 rounded-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Plus className="size-4 text-primary animate-pulse" />
              Tạo Nhân Vật Mới
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tên nhân vật</label>
                <input 
                  type="text" 
                  value={newCharForm.name}
                  onChange={e => setNewCharForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên nhân vật..."
                  className="w-full bg-zinc-950 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Vai trò kịch bản</label>
                <select 
                  value={newCharForm.role}
                  onChange={e => setNewCharForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="SUSPECT">Nghi phạm (Suspect)</option>
                  <option value="VICTIM">Nạn nhân (Victim)</option>
                  <option value="KILLER">Hung thủ (Killer)</option>
                  <option value="WITNESS">Nhân chứng (Witness)</option>
                  <option value="DETECTIVE">Thám tử (Detective)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowAddCharModal(false)
                  setNewCharForm({ name: '', role: 'SUSPECT' })
                }}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
              >
                Hủy
              </button>
              
              <button 
                onClick={() => {
                  if (!newCharForm.name.trim()) return
                  const newTrack: Track = {
                    id: `new-${Date.now()}`,
                    name: newCharForm.name.trim(),
                    avatar: newCharForm.name.substring(0, 2).toUpperCase(),
                    role: newCharForm.role,
                    events: []
                  }
                  pushState([...tracks, newTrack])
                  setShowAddCharModal(false)
                  setNewCharForm({ name: '', role: 'SUSPECT' })
                }}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors"
              >
                Tạo nhân vật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PAST MILESTONE MODAL */}
      {showAddPastModal && (
        <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-96 bg-zinc-900 border border-white/10 rounded-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Plus className="size-4 text-primary animate-pulse" />
              Tạo Mốc Quá Khứ Mới
            </h3>
            
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Số ngày trước vụ án</label>
              <input 
                type="number" 
                value={pastDaysInput}
                onChange={e => setPastDaysInput(e.target.value)}
                placeholder="e.g. 30, 7, 3"
                className="w-full bg-zinc-950 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                autoFocus
              />
              <p className="text-[10px] text-zinc-500 mt-1">Nhập số ngày trước ngày xảy ra vụ án (ví dụ nhập 30 để tạo mốc "30 ngày trước").</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowAddPastModal(false)
                  setPastDaysInput('30')
                }}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
              >
                Hủy
              </button>
              
              <button 
                onClick={() => {
                  const val = parseInt(pastDaysInput, 10)
                  if (!isNaN(val) && val > 0) {
                    const newOffset = -val
                    setActiveDayOffset(newOffset)
                    setShowAddPastModal(false)
                    setPastDaysInput('30')
                  }
                }}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors"
              >
                Tạo mốc
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
