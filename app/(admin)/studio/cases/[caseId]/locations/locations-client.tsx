'use client'

import React, { useState } from 'react'
import { InteractiveMap, MapNode } from '@/components/admin/interactive-map'
import { X, Save, Trash } from 'lucide-react'

import { DbLocation } from '@/lib/types/database'
import { saveLocations } from '@/lib/actions/map-actions'

export default function LocationsClient({ caseId, initialLocations }: { caseId: string, initialLocations: DbLocation[] }) {
  const [nodes, setNodes] = useState<MapNode[]>(() => {
    if (!initialLocations || initialLocations.length === 0) return []
    return initialLocations.map(l => ({
      id: l.id,
      x: l.position_x,
      y: l.position_y,
      title: l.title,
      type: (l.type || 'LOCATION') as any,
      details: l.details || ''
    }))
  })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const handleUpdateNode = (id: string, data: Partial<MapNode>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...data } : n))
  }

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
    setSelectedNodeId(null)
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      
      {/* TOOLBAR */}
      <div className="h-14 border-b border-white/10 bg-zinc-900/40 flex items-center justify-between px-4 shrink-0 z-20 relative backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">Interactive Map Engine</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono font-bold tracking-wider uppercase border border-primary/30">Macro Mode</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-xs text-zinc-500">World Map view (Drag to pan, Scroll to zoom, Double-click to pin)</span>
        </div>
        <button 
          onClick={async () => {
            setIsSaving(true)
            const payload = nodes.map(n => ({
              id: n.id.startsWith('node-') ? crypto.randomUUID() : n.id,
              title: n.title,
              type: n.type,
              details: n.details,
              x: n.x,
              y: n.y
            }))
            const res = await saveLocations(caseId, payload)
            setIsSaving(false)
            if (res.success) {
              alert('Saved successfully!')
            } else {
              alert('Error saving: ' + res.error)
            }
          }}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs"
        >
          <Save className="size-3.5" />
          {isSaving ? 'Saving...' : 'Save Map'}
        </button>
      </div>

      {/* EDITOR WORKSPACE */}
      <div className="flex-1 relative">
        <InteractiveMap 
          nodes={nodes} 
          onNodesChange={setNodes} 
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />

        {/* NODE INSPECTOR (Side Panel) */}
        <div 
          className={`absolute top-0 bottom-0 right-0 w-[400px] z-[200] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${selectedNodeId ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedNode && (
            <>
              {/* Panel Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
                <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                  Map Node Properties
                </h3>
                <button onClick={() => setSelectedNodeId(null)} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 space-y-6">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Node Title</label>
                  <input 
                    type="text" 
                    value={selectedNode.title}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { title: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Node Type</label>
                  <select 
                    value={selectedNode.type}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { type: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="CASE">Case Location (Macro)</option>
                    <option value="LOCATION">Room / Area (Micro)</option>
                    <option value="EVIDENCE">Evidence Point (Micro)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Coordinates</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">X</span>
                      <span className="text-sm font-mono text-zinc-300">{Math.round(selectedNode.x)}</span>
                    </div>
                    <div className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Y</span>
                      <span className="text-sm font-mono text-zinc-300">{Math.round(selectedNode.y)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Description / Notes</label>
                  <textarea 
                    value={selectedNode.details || ''}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { details: e.target.value })}
                    placeholder="Enter details about this pin..."
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 h-32 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" 
                  />
                </div>
              </div>

              {/* Panel Footer */}
              <div className="p-4 border-t border-white/5 flex gap-2 shrink-0 bg-zinc-950">
                <button 
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="flex-1 py-2 text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash className="size-3.5" /> Delete
                </button>
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="flex-1 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="size-3.5" /> Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
