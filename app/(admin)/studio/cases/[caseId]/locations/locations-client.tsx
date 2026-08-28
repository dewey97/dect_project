'use client'

import React, { useState } from 'react'
import { InteractiveMap, MapNode } from '@/components/admin/interactive-map'
import { Save, Trash } from 'lucide-react'
import { AdminDrawer } from '@/components/admin/admin-drawer'
import { toast } from '@/components/ui/toast'

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
            <span className="text-sm font-semibold text-zinc-100">Bản Đồ Địa Điểm Vụ Án</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono font-bold tracking-wider uppercase border border-primary/30">Macro Mode</span>
          </div>
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
              toast.success('Lưu bản đồ địa điểm thành công!')
            } else {
              toast.error('Lỗi khi lưu bản đồ: ' + res.error)
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
        {selectedNode && (
          <AdminDrawer
            isOpen={!!selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
            title="Thông Tin Địa Điểm"
            footer={
              <button 
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-medium rounded transition-colors text-xs"
              >
                <Trash className="size-3.5" /> Xóa địa điểm khỏi bản đồ
              </button>
            }
          >
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tên địa điểm</label>
              <input 
                type="text" 
                value={selectedNode.title}
                onChange={(e) => handleUpdateNode(selectedNode.id, { title: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary" 
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Loại địa điểm</label>
              <select 
                value={selectedNode.type}
                onChange={(e) => handleUpdateNode(selectedNode.id, { type: e.target.value as any })}
                className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
              >
                <option value="CASE">Địa điểm vụ án (Macro Location)</option>
                <option value="LOCATION">Khu vực / Phòng ốc (Micro Area)</option>
                <option value="EVIDENCE">Điểm phát hiện chứng cứ (Evidence Point)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tọa độ trên bản đồ</label>
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
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Mô tả / Ghi chú địa điểm</label>
              <textarea 
                value={selectedNode.details || ''}
                onChange={(e) => handleUpdateNode(selectedNode.id, { details: e.target.value })}
                placeholder="Nhập thông tin mô tả, manh mối, hoặc ghi chú về địa điểm này..."
                className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 p-2 h-32 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" 
              />
            </div>
          </AdminDrawer>
        )}
      </div>
    </div>
  )
}
