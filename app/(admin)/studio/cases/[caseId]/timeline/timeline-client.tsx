'use client'

import React, { useState, useMemo } from 'react'
import { Clock, Play, ZoomIn, ZoomOut, Ghost, Filter, Settings2, Lock, Undo2, Redo2, Plus, X, Save } from 'lucide-react'
import { TimelineBlock } from '@/components/admin/timeline-block'
import { CharacterPanel } from '@/components/admin/character-panel'
import { DbTimelineEvent } from '@/lib/types/database'
import { saveTimelineEvents } from '@/lib/actions/timeline-actions'

// --- CONSTANTS ---
const START_HOUR = 0 // 00:00
const END_HOUR = 24  // 24:00
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

// Generate ticks for X-axis (every 30 mins)
const timeTicks = Array.from({ length: ((END_HOUR - START_HOUR) * 2) + 1 }).map((_, i) => {
  const hour = Math.floor(START_HOUR + (i / 2))
  const min = i % 2 === 0 ? '00' : '30'
  const displayHour = hour === 24 ? '00' : hour.toString().padStart(2, '0')
  return `${displayHour}:${min}`
})

// --- TYPES & INITIAL DATA ---
type TrackEvent = {
  id: string
  title: string
  location: string
  startMin: number // Absolute minutes from START_HOUR
  endMin: number
  type: 'TRUTH' | 'LIE'
  isFatal?: boolean
}

type Track = {
  id: string
  name: string
  avatar: string
  role: string
  events: TrackEvent[]
}

// Convert DbTimelineEvent[] to Track[]
function buildInitialTracks(events: DbTimelineEvent[]): Track[] {
  if (!events || events.length === 0) return []
  
  const tracksMap = new Map<string, Track>()
  
  events.forEach(ev => {
    const charName = ev.character_name || 'Unknown'
    if (!tracksMap.has(charName)) {
      tracksMap.set(charName, {
        id: charName,
        name: charName,
        avatar: charName.substring(0, 2).toUpperCase(),
        role: 'CHARACTER',
        events: []
      })
    }
    
    tracksMap.get(charName)!.events.push({
      id: ev.id,
      title: ev.event_title,
      location: ev.location || '',
      startMin: ev.start_min,
      endMin: ev.end_min,
      type: ev.is_truth ? 'TRUTH' : 'LIE',
      isFatal: ev.is_fatal
    })
  })
  
  return Array.from(tracksMap.values())
}

export default function TimelineClient({ caseId, initialEvents }: { caseId: string, initialEvents: DbTimelineEvent[] }) {
  const [viewMode, setViewMode] = useState<'truth' | 'lies' | 'compare'>('compare')
  const [isSaving, setIsSaving] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<Track[][]>([buildInitialTracks(initialEvents)])
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

  // Update Event coordinates (drag & drop handler)
  const handleUpdateEvent = (trackId: string, eventId: string, newStart: number, newEnd: number) => {
    const newTracks = tracks.map(track => {
      if (track.id !== trackId) return track
      return {
        ...track,
        events: track.events.map(ev => 
          ev.id === eventId ? { ...ev, startMin: newStart, endMin: newEnd } : ev
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

  // Create new event on Double Click
  const handleCreateEvent = (e: React.MouseEvent<HTMLDivElement>, trackId: string) => {
    // Only trigger if clicking directly on the lane, not on a child block
    if (e.target !== e.currentTarget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickedMinute = (clickX / rect.width) * TOTAL_MINUTES
    
    // Snap to nearest 15 mins
    let startMin = Math.round(clickedMinute / 15) * 15
    let endMin = startMin + 30 // Default duration 30 mins

    if (endMin > TOTAL_MINUTES) {
      endMin = TOTAL_MINUTES
      startMin = Math.max(0, endMin - 30)
    }

    const newEvent: TrackEvent = {
      id: `new-${Date.now()}`,
      title: 'New Activity',
      location: 'Unknown',
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
          // If they overlap in time (e1.start < e2.end AND e1.end > e2.start)
          if (e1.startMin < e2.endMin && e1.endMin > e2.startMin) {
            clashes.add(e1.id)
            clashes.add(e2.id)
          }
        }
      }
    })
    return clashes
  }, [tracks, viewMode])

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
            <Ghost className="size-3" /> Compare (Clash Detect)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { if (historyIndex > 0) setHistoryIndex(historyIndex - 1) }}
            disabled={historyIndex === 0}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </button>
          <button 
            onClick={() => { if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1) }}
            disabled={historyIndex === history.length - 1}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="size-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
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
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={async () => {
              setIsSaving(true)
              const payload = tracks.flatMap(t => t.events.map(e => ({
                id: e.id.startsWith('new-') || e.id.startsWith('dup-') ? crypto.randomUUID() : e.id,
                character_name: t.name,
                event_title: e.title,
                location: e.location,
                start_min: e.startMin,
                end_min: e.endMin,
                is_truth: e.type === 'TRUTH',
                is_fatal: e.isFatal || false
              })))
              const res = await saveTimelineEvents(caseId, payload)
              setIsSaving(false)
              if (res.success) {
                alert('Saved successfully!')
              } else {
                alert('Error saving: ' + res.error)
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

      {/* EDITOR WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Y-Axis: Track Headers */}
        <div className="w-56 shrink-0 border-r border-white/10 bg-zinc-950/80 flex flex-col relative z-20">
          <div className="h-10 border-b border-white/10 bg-zinc-900/50 flex items-center px-4">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Cast & Tracks</span>
          </div>
          <div className="flex-1 overflow-auto scrollbar-none">
            {tracks.map(track => (
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
              onClick={() => {
                const name = prompt('Nhập tên nhân vật mới:')
                if (name) {
                  const newTrack: Track = {
                    id: name,
                    name: name,
                    avatar: name.substring(0, 2).toUpperCase(),
                    role: 'CHARACTER',
                    events: []
                  }
                  pushState([...tracks, newTrack])
                }
              }}
              className="w-full h-14 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] border-b border-white/5 transition-colors"
            >
              <Plus className="size-4" /> Add Character
            </button>
          </div>
        </div>

        {/* Character Side Panel (Slide Over from Right) */}
        <CharacterPanel 
          isOpen={!!selectedCharacterId}
          character={tracks.find(t => t.id === selectedCharacterId) as any}
          onClose={() => setSelectedCharacterId(null)}
        />

        {/* X-Axis: Canvas (Scrollable horizontally) */}
        <div 
          ref={scrollContainerRef}
          onPointerDown={handlePanStart}
          className={`flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div 
            className="h-full flex flex-col relative transition-all duration-300"
            style={{ width: `${Math.max(100, zoomLevel)}%`, minWidth: '2400px' }}
          >
            
            {/* Time Ticks Header */}
            <div className="h-10 border-b border-white/10 bg-zinc-900/90 sticky top-0 z-10 flex">
              {timeTicks.map((tick, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-l border-white/5 relative"
                  style={{ left: `${(i / (timeTicks.length - 1)) * 100}%`, position: 'absolute', height: '100%' }}
                >
                  <span className="absolute -left-3.5 top-3 text-[10px] font-mono text-zinc-500">{tick}</span>
                </div>
              ))}
            </div>

            {/* Tracks Container */}
            <div className="flex-1 relative">
              {/* Render Vertical Grid Lines */}
              {timeTicks.map((_, i) => (
                <div 
                  key={`grid-${i}`} 
                  className="absolute top-0 bottom-0 border-l border-dashed border-white/[0.03] pointer-events-none"
                  style={{ left: `${(i / (timeTicks.length - 1)) * 100}%` }}
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
                        startMin={event.startMin}
                        endMin={event.endMin}
                        totalMinutes={TOTAL_MINUTES}
                        onSelectEvent={() => {
                          // Allow react to finish before setting state to avoid click-away conflicts
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

      </div>
    </div>
  )
}
