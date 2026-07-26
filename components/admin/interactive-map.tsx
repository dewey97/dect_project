'use client'

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react'
import { MapPin, X, Plus } from 'lucide-react'

// --- TYPES ---
export type MapNode = {
  id: string
  x: number
  y: number
  title: string
  type: 'CASE' | 'EVIDENCE' | 'LOCATION'
  details?: string
}

type InteractiveMapProps = {
  nodes: MapNode[]
  onNodesChange: (nodes: MapNode[]) => void
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
}

export function InteractiveMap({ nodes, onNodesChange, selectedNodeId, onSelectNode }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Transform State
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  
  // Drag State
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  // Ensure panning only triggers if the map is grabbed, not the pins
  const handleMouseDown = (e: ReactMouseEvent) => {
    // If clicking on a pin, let the pin's onClick handle it
    if ((e.target as HTMLElement).closest('.map-pin')) return
    
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...pan }
    
    // Also clear selection if clicking on empty space
    onSelectNode(null)
  }

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // --- Pan & Zoom State Refs ---
  // To use inside native event listener without stale closures
  const stateRef = useRef({ scale, pan })
  useEffect(() => {
    stateRef.current = { scale, pan }
  }, [scale, pan])

  // Native Wheel Event for Zooming (Non-passive to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault() // Prevent browser scrolling

      const { scale: currentScale, pan: currentPan } = stateRef.current
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate world coordinates
      const worldX = (mouseX - currentPan.x) / currentScale
      const worldY = (mouseY - currentPan.y) / currentScale

      // Determine zoom delta
      // Trackpads use smaller deltas, mice use larger (e.g. 100).
      const zoomSensitivity = e.ctrlKey ? 0.01 : 0.001
      const delta = -e.deltaY * zoomSensitivity
      let newScale = currentScale * Math.exp(delta)
      
      // Clamp
      newScale = Math.max(0.1, Math.min(newScale, 5))

      // Keep world coordinate under mouse
      const newPanX = mouseX - worldX * newScale
      const newPanY = mouseY - worldY * newScale

      setScale(newScale)
      setPan({ x: newPanX, y: newPanY })
    }

    // passive: false is CRUCIAL here
    el.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleNativeWheel)
  }, [])

  // Double Click to Drop Pin
  const handleDoubleClick = (e: ReactMouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const worldX = (mouseX - pan.x) / scale
    const worldY = (mouseY - pan.y) / scale

    const newNode: MapNode = {
      id: `node-${Date.now()}`,
      x: worldX,
      y: worldY,
      title: 'New Location',
      type: 'LOCATION'
    }

    onNodesChange([...nodes, newNode])
    onSelectNode(newNode.id)
  }

  // View reset & manual zoom
  const handleResetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const handleZoom = (factor: number) => {
    // Zoom from center
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const worldX = (centerX - pan.x) / scale
    const worldY = (centerY - pan.y) / scale

    let newScale = scale * factor
    newScale = Math.max(0.1, Math.min(newScale, 5))

    setPan({
      x: centerX - worldX * newScale,
      y: centerY - worldY * newScale
    })
    setScale(newScale)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 flex flex-col">
      {/* Map Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={handleResetView}
          className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors shadow-lg"
        >
          Reset View
        </button>
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-zinc-400 text-xs font-mono rounded-md shadow-lg flex items-center overflow-hidden">
          <button onClick={() => handleZoom(0.8)} className="px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100 transition-colors border-r border-white/10">-</button>
          <span className="px-3 w-14 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => handleZoom(1.25)} className="px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100 transition-colors border-l border-white/10">+</button>
        </div>
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-zinc-400 text-xs px-3 py-1.5 rounded-md shadow-lg flex items-center gap-2">
          <MapPin className="size-3.5 text-primary" /> Double-click to drop pin
        </div>
      </div>

      {/* The Infinite Canvas */}
      <div 
        ref={containerRef}
        className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* World Layer */}
        <div 
          className="absolute inset-0 transform-origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            // Default background: infinite line grid
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            // To make infinite panning look right with a background grid, 
            // the world layer itself must be huge. We simulate this by drawing the grid on a giant element.
            width: '10000px',
            height: '10000px',
            left: '-5000px',
            top: '-5000px'
          }}
        >
          {/* Central Anchor for visual reference (0,0) */}
          <div className="absolute left-[5000px] top-[5000px] size-2 bg-rose-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 shadow-[0_0_20px_rgba(244,63,94,0.5)]"></div>

          {/* Nodes (Pins) */}
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectNode(node.id)
              }}
              className={`map-pin absolute flex flex-col items-center group -translate-x-1/2 -translate-y-full transition-all duration-200 ${selectedNodeId === node.id ? 'z-50 scale-125' : 'z-10 hover:scale-110 hover:z-40'}`}
              style={{
                // Coordinates relative to the 5000x5000 origin
                left: 5000 + node.x,
                top: 5000 + node.y
              }}
            >
              <div className={`px-2 py-1 mb-1 rounded-md text-[10px] font-medium shadow-xl whitespace-nowrap transition-colors ${selectedNodeId === node.id ? 'bg-primary text-primary-foreground' : 'bg-zinc-900 border border-white/10 text-zinc-300 group-hover:bg-zinc-800'}`}>
                {node.title}
              </div>
              <div className={`size-4 rounded-full border-2 shadow-lg ${selectedNodeId === node.id ? 'bg-primary border-primary-foreground animate-pulse' : 'bg-zinc-400 border-zinc-900 group-hover:bg-zinc-200'}`} />
              <div className="w-0.5 h-4 bg-gradient-to-b from-white/50 to-transparent" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
