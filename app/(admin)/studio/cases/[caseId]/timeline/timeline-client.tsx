'use client'

import React, { useState, useMemo } from 'react'
import { Clock, Play, ZoomIn, ZoomOut, Ghost, Filter, Settings2, Lock, Undo2, Redo2, Plus, X, Save, Edit3, Trash2 } from 'lucide-react'
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
    let dayOffset = 0
    let startMin = 0
    let endMin = 0
    
    if (ev.start_min < 0) {
      dayOffset = Math.floor(ev.start_min / 1440)
      startMin = ev.start_min - (dayOffset * 1440)
      endMin = ev.end_min - (dayOffset * 1440)
    } else {
      dayOffset = 0
      startMin = ev.start_min
      endMin = ev.end_min
    }
    
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
  const [pastDaysInput, setPastDaysInput] = useState('8 năm trước')
  const [isEditingOffset, setIsEditingOffset] = useState(false)
  const [editOffsetInput, setEditOffsetInput] = useState('')
  
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

  const [tempMilestoneLabels, setTempMilestoneLabels] = useState<Record<number, string>>({})
  const [draggingOffset, setDraggingOffset] = useState<number | null>(null)
  const [draggedLeft, setDraggedLeft] = useState<number>(0)
  const draggedLeftRef = React.useRef(0)

  // Dynamic scanning of milestone labels parsed from existing events
  const milestoneLabels = useMemo(() => {
    const labels: Record<number, string> = {}
    tracks.forEach(track => {
      track.events.forEach(ev => {
        const offset = ev.dayOffset ?? 0
        if (offset < 0 && ev.location && ev.location.includes('|||')) {
          const parts = ev.location.split('|||')
          if (parts.length === 4) {
            labels[offset] = parts[0]
          }
        }
      })
    })
    return { ...tempMilestoneLabels, ...labels }
  }, [tracks, tempMilestoneLabels])

  // Calculate distinct day offsets available in the timeline
  const dayOffsets = useMemo(() => {
    const offsets = new Set<number>()
    // Add Day 0 representing the continuous active timeline
    offsets.add(0)
    // Add any past offsets found in events (negative offsets)
    tracks.forEach(track => {
      track.events.forEach(ev => {
        if ((ev.dayOffset ?? 0) < 0) {
          offsets.add(ev.dayOffset ?? 0)
        }
      })
    })
    // Add any extra past days added by the user
    extraDays.forEach(d => {
      if (d < 0) offsets.add(d)
    })
    return Array.from(offsets).sort((a, b) => a - b)
  }, [tracks, extraDays])

  const caseDays = useMemo(() => dayOffsets.filter(o => o >= 0), [dayOffsets])
  
  // Calculate dynamic duration of the active timeline based on the latest event
  const activeTimelineMinutes = useMemo(() => {
    let maxMin = 1440 // Default 24 hours
    tracks.forEach(track => {
      track.events.forEach(ev => {
        if ((ev.dayOffset ?? 0) >= 0) {
          const absEnd = (ev.dayOffset ?? 0) * 1440 + ev.endMin
          if (absEnd > maxMin) {
            maxMin = absEnd
          }
        }
      })
    })
    // Pad 6 hours (360 minutes) and round to the nearest hour
    const padded = maxMin + 360
    return Math.ceil(padded / 60) * 60
  }, [tracks])

  const totalMinutes = activeTimelineMinutes

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
      
      const totalCanvasMinutes = activeTimelineMinutes

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
  }, [activeDayOffset, activeTimelineMinutes, tracks])

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
    const totalHours = activeTimelineMinutes / 60
    for (let h = 0; h <= totalHours; h++) {
      const hourInDay = h % 24
      const dayIndex = Math.floor(h / 24)
      ticks.push({
        label: `${hourInDay}:00`,
        subLabel: hourInDay === 0 ? `Day ${dayIndex}` : undefined,
        minute: h * 60
      })
      if (h < totalHours) {
        ticks.push({
          label: `${hourInDay}:30`,
          minute: h * 60 + 30
        })
      }
    }
    return ticks
  }, [activeTimelineMinutes])

  const getDayLabel = (offset: number) => {
    if (offset === 0) return 'Day 0'
    if (offset > 0) return `Day ${offset}`
    if (milestoneLabels[offset]) return milestoneLabels[offset]
    
    const absDays = Math.abs(offset)
    if (absDays >= 365) {
      const years = Math.floor(absDays / 365)
      return `${years} năm trước`
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
  const isDraggingRef = React.useRef(false)

  const handleDaySelect = (offset: number) => {
    if (isDraggingRef.current) return // Prevent clicking while or immediately after dragging
    setActiveDayOffset(offset)
    setSelectedEventId(null)
    
    if (offset >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    }
  }

  // Handle horizontal dragging of past milestone nodes
  const handleNodeDragStart = (e: React.PointerEvent<HTMLButtonElement>, offset: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    // Clamp/map initial offset value to represent left coordinate
    let initialLeft = 1150 + offset
    if (offset < -1100) initialLeft = 50
    if (offset > -70) initialLeft = 1080
    
    isDraggingRef.current = false
    setDraggingOffset(offset)
    setDraggedLeft(initialLeft)
    draggedLeftRef.current = initialLeft
    
    const handleMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX
      if (Math.abs(deltaX) > 3) {
        isDraggingRef.current = true
      }
      const newLeft = Math.round(Math.max(50, Math.min(1080, initialLeft + deltaX)))
      setDraggedLeft(newLeft)
      draggedLeftRef.current = newLeft
    }
    
    const handleEnd = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleEnd)
      
      setDraggingOffset(null)
      
      const finalLeft = Math.round(Math.max(50, Math.min(1080, draggedLeftRef.current)))
      const newOffset = finalLeft - 1150
      
      if (newOffset !== offset) {
        // 1. Update all events at offset to newOffset across all character tracks
        const newTracks = tracks.map(t => {
          return {
            ...t,
            events: t.events.map(ev => {
              if (ev.dayOffset === offset) {
                return { ...ev, dayOffset: newOffset }
              }
              return ev
            })
          }
        })
        
        // 2. Update extraDays
        setExtraDays(prev => {
          const filtered = prev.filter(o => o !== offset)
          return [...filtered, newOffset]
        })
        
        // 3. Update tempMilestoneLabels
        setTempMilestoneLabels(prev => {
          const newLabels = { ...prev }
          if (newLabels[offset]) {
            newLabels[newOffset] = newLabels[offset]
            delete newLabels[offset]
          }
          return newLabels
        })
        
        pushState(newTracks)
        setActiveDayOffset(newOffset)
      }
      
      // Delay resetting dragging flag to swallow the trailing click event
      setTimeout(() => {
        isDraggingRef.current = false
      }, 50)
    }
    
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleEnd)
  }

  const handleScroll = () => {
    // Scroll doesn't paginate days anymore on a single continuous timeline
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
      <div className="px-4 py-3 border-b border-white/10 bg-zinc-950/60 flex justify-center shrink-0 select-none">
        <div 
          className="relative h-16 flex items-center shrink-0 w-[1200px]"
        >
          {/* Connecting line */}
          <div 
            className="absolute top-1/2 h-0.5 bg-zinc-800/80 -translate-y-1/2 z-0 left-[50px] right-[50px]"
          />
          
          {dayOffsets.map((offset) => {
            const isActive = activeDayOffset === offset
            const isHistorical = offset < 0
            
            // Calculate absolute left coordinate
            let left = 1150
            if (offset < 0) {
              if (draggingOffset === offset) {
                left = draggedLeft
              } else {
                // If it's a legacy offset that is out of range, clamp it
                if (offset < -1100) {
                  left = 50
                } else if (offset > -70) {
                  left = 1080
                } else {
                  left = 1150 + offset
                }
              }
            }
            
            return (
              <button
                key={offset}
                onClick={() => handleDaySelect(offset)}
                onPointerDown={(e) => {
                  if (offset < 0) {
                    handleNodeDragStart(e, offset)
                  }
                }}
                className="absolute z-10 flex flex-col items-center justify-center group focus:outline-none cursor-pointer w-20 -translate-x-1/2 h-full"
                style={{ left: `${left}px` }}
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
                } ${isHistorical ? 'cursor-ew-resize active:scale-95' : ''}`}>
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
                      ? 'text-rose-450 font-bold tracking-wide scale-105'
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
              style={{ width: `${(zoomLevel / 100) * 2400 * (activeTimelineMinutes / 1440)}px` }}
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
                {tracks.filter(t => t.id !== '__GLOBAL__').map((track, trackIdx) => (
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
          /* Historical Events List Editor - Unified Narrative Track */
          <div className="flex-1 overflow-y-auto bg-zinc-950/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                {isEditingOffset ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs">Quá khứ</span>
                    <input
                      type="text"
                      value={editOffsetInput}
                      onChange={e => setEditOffsetInput(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-primary w-44"
                      placeholder="Mốc thời gian..."
                      autoFocus
                      spellCheck={false}
                    />
                    <button
                      onClick={() => {
                        const newLabel = editOffsetInput.trim()
                        if (newLabel) {
                          const targetOffset = activeDayOffset
                          
                          // 1. Update all events at targetOffset with the new label in location field
                          const newTracks = tracks.map(t => {
                            if (t.id === '__GLOBAL__') {
                              return {
                                ...t,
                                events: t.events.map(ev => {
                                  if (ev.dayOffset === targetOffset) {
                                    const rawLocation = ev.location || ''
                                    const parts = rawLocation.split('|||')
                                    let specificDay = ''
                                    let parsedLoc = ''
                                    let involvedNames: string[] = []

                                    if (parts.length === 4) {
                                      specificDay = parts[1] || ''
                                      parsedLoc = parts[2] || ''
                                      involvedNames = parts[3] ? parts[3].split(',').filter(Boolean) : []
                                    } else if (parts.length === 3) {
                                      specificDay = parts[0] || ''
                                      parsedLoc = parts[1] || ''
                                      involvedNames = parts[2] ? parts[2].split(',').filter(Boolean) : []
                                    } else if (parts.length === 2) {
                                      specificDay = ''
                                      parsedLoc = parts[0] || ''
                                      involvedNames = parts[1] ? parts[1].split(',').filter(Boolean) : []
                                    } else {
                                      specificDay = ''
                                      parsedLoc = rawLocation
                                      involvedNames = []
                                    }
                                    
                                    const newRaw = `${newLabel}|||${specificDay}|||${parsedLoc}|||${involvedNames.join(',')}`
                                    return { ...ev, location: newRaw }
                                  }
                                  return ev
                                })
                              }
                            }
                            return t
                          })
                          
                          setTempMilestoneLabels(prev => ({ ...prev, [targetOffset]: newLabel }))
                          pushState(newTracks)
                          setIsEditingOffset(false)
                        }
                      }}
                      className="px-2 py-1 bg-primary text-primary-foreground font-semibold rounded text-xs hover:bg-primary/90 transition-colors"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsEditingOffset(false)}
                      className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs hover:bg-zinc-700 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs">Quá khứ</span>
                    {getDayLabel(activeDayOffset)}
                    <button
                      onClick={() => {
                        setEditOffsetInput(getDayLabel(activeDayOffset))
                        setIsEditingOffset(true)
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/5 transition-all ml-1"
                      title="Sửa mốc thời gian"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa mốc quá khứ này cùng toàn bộ các sự việc bên trong không?')) {
                          const oldOffset = activeDayOffset
                          const newTracks = tracks.map(t => {
                            if (t.id === '__GLOBAL__') {
                              return {
                                ...t,
                                events: t.events.filter(ev => ev.dayOffset !== oldOffset)
                              }
                            }
                            return t
                          })
                          setExtraDays(prev => prev.filter(o => o !== oldOffset))
                          pushState(newTracks)
                          setActiveDayOffset(0) // Return to Day 0
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-white/5 transition-all"
                      title="Xóa mốc quá khứ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </h3>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  Trục tự sự chung cho các sự kiện xảy ra trong quá khứ.
                </p>
              </div>
              <button
                onClick={() => {
                  const label = getDayLabel(activeDayOffset)
                  const newEvent: TrackEvent = {
                    id: `new-${Date.now()}`,
                    title: 'Sự việc mới',
                    location: `${label}||||||`, // Serialized format: milestoneLabel|||specificDay|||location|||involvedChar1,involvedChar2
                    dayOffset: activeDayOffset,
                    startMin: 0,
                    endMin: 0,
                    type: 'TRUTH'
                  }
                  const newTracks = tracks.map(t => {
                    if (t.id === '__GLOBAL__') {
                      return { ...t, events: [...t.events, newEvent] }
                    }
                    return t
                  })
                  pushState(newTracks)
                }}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="size-3.5" /> Thêm sự việc
              </button>
            </div>

            <div className="space-y-4 max-w-3xl">
              {(() => {
                const globalTrack = tracks.find(t => t.id === '__GLOBAL__')
                const dayEvents = globalTrack ? globalTrack.events.filter(e => e.dayOffset === activeDayOffset) : []
                const availableChars = tracks.filter(t => t.id !== '__GLOBAL__')

                if (dayEvents.length === 0) {
                  return (
                    <div className="bg-zinc-900/20 border border-dashed border-white/5 rounded-xl p-8 text-center">
                      <p className="text-sm text-zinc-500 italic">Chưa có câu chuyện hay sự việc lịch sử nào được ghi nhận cho mốc thời gian này.</p>
                    </div>
                  )
                }

                return dayEvents.map(event => {
                  // Parse location, specific day, and involved characters
                  const rawLocation = event.location || ''
                  const parts = rawLocation.split('|||')
                  let specificDay = ''
                  let parsedLoc = ''
                  let involvedNames: string[] = []

                  if (parts.length === 3) {
                    specificDay = parts[0] || ''
                    parsedLoc = parts[1] || ''
                    involvedNames = parts[2] ? parts[2].split(',').filter(Boolean) : []
                  } else if (parts.length === 2) {
                    specificDay = ''
                    parsedLoc = parts[0] || ''
                    involvedNames = parts[1] ? parts[1].split(',').filter(Boolean) : []
                  } else {
                    specificDay = ''
                    parsedLoc = rawLocation
                    involvedNames = []
                  }

                  return (
                    <div key={event.id} className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 space-y-4 shadow-sm hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Sự việc xảy ra</label>
                          <textarea
                            value={event.title}
                            onChange={e => handleSaveDetails('__GLOBAL__', event.id, { title: e.target.value })}
                            placeholder="Mô tả sự việc chi tiết tại mốc thời gian này..."
                            className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-primary transition-all resize-y min-h-[70px]"
                            spellCheck={false}
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleDeleteEvent('__GLOBAL__', event.id)}
                              className="p-2 bg-zinc-950 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-white/5 rounded-lg transition-colors"
                              title="Xóa sự việc"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                        <div className="md:col-span-1 flex flex-col gap-3">
                          <div>
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Ngày cụ thể</label>
                            <input
                              type="date"
                              value={specificDay}
                              onChange={e => {
                                const newDay = e.target.value
                                const newRaw = `${newDay}|||${parsedLoc}|||${involvedNames.join(',')}`
                                handleSaveDetails('__GLOBAL__', event.id, { location: newRaw })
                              }}
                              className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all dark:[color-scheme:dark]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Địa điểm xảy ra</label>
                            <input
                              type="text"
                              value={parsedLoc}
                              onChange={e => {
                                const newLoc = e.target.value
                                const newRaw = `${specificDay}|||${newLoc}|||${involvedNames.join(',')}`
                                handleSaveDetails('__GLOBAL__', event.id, { location: newRaw })
                              }}
                              placeholder="Nơi chốn"
                              className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-all"
                              spellCheck={false}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Nhân vật tham gia</label>
                          <div className="flex flex-wrap gap-1.5">
                            {availableChars.map(char => {
                              const isChecked = involvedNames.includes(char.name)
                              return (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => {
                                    let newInvolved = [...involvedNames]
                                    if (isChecked) {
                                      newInvolved = newInvolved.filter(name => name !== char.name)
                                    } else {
                                      newInvolved.push(char.name)
                                    }
                                    const newRaw = `${specificDay}|||${parsedLoc}|||${newInvolved.join(',')}`
                                    handleSaveDetails('__GLOBAL__', event.id, { location: newRaw })
                                  }}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                                    isChecked
                                      ? 'bg-primary/20 border-primary/40 text-white font-medium shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                                  }`}
                                >
                                  <div className={`size-4 rounded-full text-[8px] flex items-center justify-center font-bold transition-all ${
                                    isChecked 
                                      ? 'bg-primary text-white' 
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}>
                                    {char.avatar}
                                  </div>
                                  {char.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
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
                  spellCheck={false}
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
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tên mốc thời gian</label>
              <input 
                type="text" 
                value={pastDaysInput}
                onChange={e => setPastDaysInput(e.target.value)}
                placeholder="Ví dụ: 8 năm trước, Thời thơ ấu, Tuần trước..."
                className="w-full bg-zinc-950 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                autoFocus
                spellCheck={false}
              />
              <p className="text-[10px] text-zinc-500 mt-1">Nhập tên gọi cho mốc thời gian quá khứ này (Ví dụ: "Thời thơ ấu", "10 năm trước"...).</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setShowAddPastModal(false)
                  setPastDaysInput('8 năm trước')
                }}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
              >
                Hủy
              </button>
              
              <button 
                onClick={() => {
                  const labelText = pastDaysInput.trim()
                  if (labelText) {
                    // Find the minimum negative offset currently in use to assign a new ordered ID
                    const existingOffsets = dayOffsets.filter(o => o < 0)
                    const minOffset = existingOffsets.length > 0 ? Math.min(...existingOffsets) : 0
                    const newOffset = minOffset - 1
                    
                    setExtraDays(prev => [...prev, newOffset])
                    setTempMilestoneLabels(prev => ({ ...prev, [newOffset]: labelText }))
                    setActiveDayOffset(newOffset)
                    setShowAddPastModal(false)
                    setPastDaysInput('8 năm trước')
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
