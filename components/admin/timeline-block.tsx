'use client'

import React, { useRef, useState } from 'react'
import { AlertTriangle, Ghost, Pencil, Trash2, Copy, Check, X } from 'lucide-react'

type TrackEvent = {
  id: string
  title: string
  location: string
  dayOffset?: number
  startMin: number
  endMin: number
  type: 'TRUTH' | 'LIE'
  isFatal?: boolean
}

type TimelineBlockProps = {
  event: TrackEvent
  trackId: string
  isGhost: boolean
  isClash: boolean
  isSelected: boolean
  startMin: number
  endMin: number
  totalMinutes: number
  onSelectEvent: () => void
  onUpdateEvent: (trackId: string, eventId: string, newStartMin: number, newEndMin: number) => void
  onDeleteEvent: (trackId: string, eventId: string) => void
  onDuplicateEvent: (trackId: string, event: TrackEvent) => void
  onSaveDetails: (trackId: string, eventId: string, details: Partial<TrackEvent>) => void
}

const MINIMUM_MINUTES = 15

export function TimelineBlock({ 
  event, trackId, isGhost, isClash, isSelected,
  startMin, endMin, totalMinutes, 
  onSelectEvent, onUpdateEvent, onDeleteEvent, onDuplicateEvent, onSaveDetails
}: TimelineBlockProps) {
  
  const blockRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: event.title, location: event.location })

  // Local drag state for smooth dragging without triggering global history saves
  const [dragState, setDragState] = useState<{ startMin: number, endMin: number } | null>(null)
  const latestDragRef = useRef<{ startMin: number, endMin: number } | null>(null)

  const currentStart = dragState ? dragState.startMin : startMin
  const currentEnd = dragState ? dragState.endMin : endMin

  const leftPercent = (currentStart / totalMinutes) * 100
  const widthPercent = ((currentEnd - currentStart) / totalMinutes) * 100

  // ---------------------------------------------------------
  // DRAG & DROP LOGIC
  // ---------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, action: 'move' | 'resize-left' | 'resize-right') => {
    // Only drag with primary mouse button
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    if (!blockRef.current || !blockRef.current.parentElement) return

    const parentRect = blockRef.current.parentElement.getBoundingClientRect()
    const containerWidth = parentRect.width
    const startClientX = e.clientX

    const initialStart = startMin
    const initialEnd = endMin
    let hasMoved = false

    const handlePointerMove = (moveEvt: PointerEvent) => {
      hasMoved = true
      const deltaX = moveEvt.clientX - startClientX
      const deltaMinutes = (deltaX / containerWidth) * totalMinutes
      const snappedDelta = Math.round(deltaMinutes / 15) * 15

      let newStart = initialStart
      let newEnd = initialEnd

      if (action === 'move') {
        newStart = initialStart + snappedDelta
        newEnd = initialEnd + snappedDelta
        
        if (newStart < 0) {
          newStart = 0
          newEnd = initialEnd - initialStart
        }
        if (newEnd > totalMinutes) {
          newEnd = totalMinutes
          newStart = totalMinutes - (initialEnd - initialStart)
        }
      } else if (action === 'resize-left') {
        newStart = initialStart + snappedDelta
        if (newStart < 0) newStart = 0
        if (newEnd - newStart < MINIMUM_MINUTES) newStart = newEnd - MINIMUM_MINUTES
      } else if (action === 'resize-right') {
        newEnd = initialEnd + snappedDelta
        if (newEnd > totalMinutes) newEnd = totalMinutes
        if (newEnd - newStart < MINIMUM_MINUTES) newEnd = newStart + MINIMUM_MINUTES
      }

      const nextDrag = { startMin: newStart, endMin: newEnd }
      latestDragRef.current = nextDrag
      setDragState(nextDrag)
    }

    const handlePointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      
      const finalDrag = latestDragRef.current
      latestDragRef.current = null
      setDragState(null)

      // If it didn't move much, treat it as a click
      if (!hasMoved && action === 'move') {
        onSelectEvent()
      } else if (finalDrag) {
        onUpdateEvent(trackId, event.id, finalDrag.startMin, finalDrag.endMin)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const formatTime = (minutes: number) => {
    const totalH = Math.floor(minutes / 60) + 18
    const h = totalH >= 24 ? totalH - 24 : totalH
    const m = Math.floor(minutes % 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  const handleSaveEdit = () => {
    onSaveDetails(trackId, event.id, editForm)
    setIsEditing(false)
  }

  // Calculate Popover alignment to prevent bleeding off right edge
  const popoverAlign = leftPercent > 70 ? 'right-0' : 'left-0'

  return (
    <div 
      ref={blockRef}
      className={`absolute top-2 bottom-2 ${isSelected ? 'z-50' : 'z-20'}`}
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
    >
      {/* Event Block Visuals */}
      <div 
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        className={`w-full h-full rounded-md p-2 overflow-hidden border transition-colors cursor-grab active:cursor-grabbing group ${
          isClash ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' :
          isGhost ? 'bg-zinc-900/30 border-dashed border-zinc-600/50 backdrop-blur-sm pointer-events-none' :
          event.isFatal ? 'bg-red-950/40 border-red-900' :
          'bg-zinc-800/80 border-zinc-500 shadow-md hover:border-zinc-300 hover:bg-zinc-700/80'
        } ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 border-primary' : ''}`}
      >
        <div className="flex items-start justify-between pointer-events-none">
          <div className={`text-xs font-semibold truncate ${isGhost ? 'text-zinc-500' : 'text-zinc-100'} ${isClash ? 'text-rose-100' : ''}`}>
            {event.title}
          </div>
          {isClash && <AlertTriangle className="size-3 text-rose-500 shrink-0 ml-1 animate-pulse" />}
          {isGhost && <Ghost className="size-3 text-zinc-600 shrink-0 ml-1" />}
        </div>
        <div className={`text-[9px] font-mono mt-1 truncate pointer-events-none ${isGhost ? 'text-zinc-600' : 'text-zinc-400'} ${isClash ? 'text-rose-300' : ''}`}>
          {event.location} • {formatTime(currentStart)} - {formatTime(currentEnd)}
        </div>

        {/* Resize Handles */}
        {!isGhost && (
          <>
            <div 
              onPointerDown={(e) => handlePointerDown(e, 'resize-left')}
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            />
            <div 
              onPointerDown={(e) => handlePointerDown(e, 'resize-right')}
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            />
          </>
        )}
      </div>

      {/* POPOVER (Google Calendar Style) */}
      {isSelected && (
        <div 
          className={`absolute top-full mt-2 w-72 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4 z-[100] cursor-auto animate-in fade-in slide-in-from-top-2 duration-200 ${popoverAlign}`}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Activity Name</label>
                <input 
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Location</label>
                <input 
                  type="text"
                  value={editForm.location}
                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-1.5 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1">
                  <Check className="size-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-3 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{event.title}</h3>
                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{event.location}</span>
                    <span>{formatTime(startMin)} - {formatTime(endMin)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsEditing(true)} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors" title="Edit details">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => onDuplicateEvent(trackId, event)} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors" title="Duplicate event">
                    <Copy className="size-3.5" />
                  </button>
                  <button onClick={() => onDeleteEvent(trackId, event.id)} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition-colors" title="Delete event">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-zinc-500 bg-zinc-900/50 p-2 rounded flex items-center gap-2 border border-white/5">
                <div className={`size-2 rounded-full ${event.type === 'TRUTH' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {event.type === 'TRUTH' ? 'Objective Truth' : 'Character Alibi (Lie)'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
