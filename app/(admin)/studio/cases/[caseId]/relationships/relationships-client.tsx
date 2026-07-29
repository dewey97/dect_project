'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Network, Plus, Trash2, X, Save, ShieldAlert, Link2, Eye, UserMinus, Upload, Loader2, User } from 'lucide-react'
import { saveCharacters, uploadCharacterAvatar } from '@/lib/actions/character-actions'
import { saveRelationships } from '@/lib/actions/relationship-actions'
import { toast } from '@/components/ui/toast'

// --- CUSTOM CHARACTER NODE ---
function CharacterNode({ data, selected }: any) {
  const roleColors: Record<string, string> = {
    VICTIM: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    KILLER: 'border-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    SUSPECT: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    WITNESS: 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    DETECTIVE: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
  }

  const roleTextColors: Record<string, string> = {
    VICTIM: 'text-red-400/90',
    KILLER: 'text-rose-400/90',
    SUSPECT: 'text-amber-400/90',
    WITNESS: 'text-blue-400/90',
    DETECTIVE: 'text-emerald-400/90'
  }

  const roleLabels: Record<string, string> = {
    VICTIM: 'Nạn nhân',
    KILLER: 'Hung thủ',
    SUSPECT: 'Nghi phạm',
    WITNESS: 'Nhân chứng',
    DETECTIVE: 'Thám tử'
  }

  const colorStyle = roleColors[data.role] || 'border-zinc-700'

  return (
    <div className={`group relative flex flex-col items-center transition-all duration-300 w-36 hover:scale-102 ${data.avatar_url ? 'h-44' : 'h-auto py-1'}`}>
      
      {/* Handles neo dây ẩn ở trung tâm */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
      />

      {/* Avatar Container */}
      <div className={`flex items-center justify-center relative transition-all duration-300 rounded-none z-20 ${
        data.avatar_url 
          ? 'w-full aspect-square bg-zinc-950 shadow-lg border-0'
          : `size-11 bg-zinc-950 border ${colorStyle} group-hover:border-white/30`
      }`}>
        {/* NÚT LINK LIÊN KẾT CHUYÊN DỤNG (HIỂN THỊ KHI HOVER ON AVATAR BOX) */}
        <Handle 
          type="source" 
          position={Position.Right} 
          id="connect" 
          className="opacity-0 group-hover:opacity-100 !w-5 !h-5 !bg-zinc-900/90 !border !border-white/10 !rounded flex items-center justify-center !-right-2 !-top-2 cursor-crosshair transition-all duration-200 hover:!bg-primary hover:!border-primary-foreground text-zinc-400 hover:text-white !absolute !z-50"
        >
          <Link2 className="w-3 h-3 pointer-events-none" />
        </Handle>

        {data.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={data.avatar_url} 
            alt={data.name} 
            className="w-full h-full object-contain transition-all duration-500"
          />
        ) : (
          <div className="flex items-center justify-center p-1 text-zinc-500 select-none">
            <User className="size-5 stroke-[1.5]" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Tên và vai trò trôi tự do bên dưới */}
      <div className="mt-1.5 flex flex-col items-center justify-center">
        <div className="text-xs font-semibold text-zinc-100 whitespace-nowrap select-none leading-tight">
          {data.name}
        </div>

        <div className={`text-[8px] font-bold uppercase tracking-widest text-center select-none scale-90 mt-0.5 whitespace-nowrap ${roleTextColors[data.role] || 'text-zinc-500'}`}>
          {roleLabels[data.role] || data.role}
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  character: CharacterNode
}

// Helpers for Edge Styling based on relationship type and affinity score
const getEdgeStyle = (relationType: string, affinityScore: number) => {
  let stroke = '#71717a' // default zinc-400
  let strokeDasharray = undefined

  const type = (relationType || '').toLowerCase()
  if (type.includes('thù') || type.includes('ghét') || type.includes('mâu thuẫn')) {
    stroke = '#ef4444' // red
  } else if (type.includes('yêu') || type.includes('tình nhân') || type.includes('vợ') || type.includes('chồng')) {
    stroke = '#f43f5e' // rose
  } else if (type.includes('đồng phạm') || type.includes('băng đảng') || type.includes('hợp tác')) {
    stroke = '#10b981' // emerald
  } else if (type.includes('gia đình') || type.includes('ruột thịt') || type.includes('bố') || type.includes('mẹ') || type.includes('anh') || type.includes('em')) {
    stroke = '#3b82f6' // blue
  } else if (type.includes('nợ') || type.includes('tiền')) {
    stroke = '#f59e0b' // amber
  }

  // Width is proportional to absolute affinity score
  const thickness = Math.max(1, Math.min(6, Math.abs(affinityScore) / 20))

  return { stroke, strokeWidth: thickness, strokeDasharray }
}

export default function RelationshipsClient({
  caseId,
  initialCharacters,
  initialRelationships
}: {
  caseId: string
  initialCharacters: any[]
  initialRelationships: any[]
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  // Modal creation states
  const [showAddCharModal, setShowAddCharModal] = useState(false)
  const [newCharForm, setNewCharForm] = useState({ name: '', role: 'SUSPECT' })

  // Local character states
  const [characters, setCharacters] = useState<any[]>(initialCharacters)

  // Xử lý upload avatar lên Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedNodeId) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadCharacterAvatar(formData)
      if (result.success && result.url) {
        updateCharacterField('avatar_url', result.url)
        toast.success('Tải ảnh đại diện nhân vật thành công!')
      } else {
        toast.error(result.error || 'Upload ảnh thất bại')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Đã xảy ra lỗi trong quá trình tải ảnh lên.')
    } finally {
      setIsUploading(false)
      // Reset input value để có thể chọn lại cùng 1 file nếu muốn
      e.target.value = ''
    }
  }

  // Convert characters to React Flow Nodes
  const initialNodes: Node[] = useMemo(() => {
    return characters.map((c, index) => {
      let x = c.position_x
      let y = c.position_y

      // Fallback: arrange in circle if positions are 0
      if (x === 0 && y === 0) {
        const angle = (index / (characters.length || 1)) * 2 * Math.PI
        x = 400 + Math.cos(angle) * 200
        y = 250 + Math.sin(angle) * 200
      }

      return {
        id: c.id,
        type: 'character',
        position: { x, y },
        data: { name: c.name, role: c.role, avatar_url: c.avatar_url },
        dragHandle: undefined
      }
    })
  }, [characters])

  // Convert relationships to React Flow Edges
  const initialEdges: Edge[] = useMemo(() => {
    return initialRelationships.map(r => {
      const style = getEdgeStyle(r.relation_type, r.affinity_score)
      return {
        id: r.id || `edge-${r.character_1_id}-${r.character_2_id}`,
        source: r.character_1_id,
        target: r.character_2_id,
        sourceHandle: 'source',
        targetHandle: 'target',
        label: `${r.relation_type} (${r.affinity_score > 0 ? '+' : ''}${r.affinity_score})`,
        style,
        type: 'straight',
        data: { relation_type: r.relation_type, affinity_score: r.affinity_score },
        labelStyle: { fill: '#fff', fontSize: 10, fontWeight: 'bold' },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.8, rx: 4, ry: 4 },
        labelBgPadding: [6, 4]
      }
    })
  }, [initialRelationships])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle new connection creation
  const onConnect = useCallback((params: Connection) => {
    if (params.source === params.target) return // No self-loops

    // Check if relationship already exists
    const duplicate = edges.some(
      e => (e.source === params.source && e.target === params.target) ||
           (e.source === params.target && e.target === params.source)
    )
    if (duplicate) {
      toast.info('Mối quan hệ giữa hai nhân vật này đã tồn tại!')
      return
    }

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: params.source!,
      target: params.target!,
      sourceHandle: 'source',
      targetHandle: 'target',
      type: 'straight',
      label: 'Giao thiệp (0)',
      style: getEdgeStyle('Giao thiệp', 0),
      data: { relation_type: 'Giao thiệp', affinity_score: 0 },
      labelStyle: { fill: '#fff', fontSize: 10, fontWeight: 'bold' },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.8, rx: 4, ry: 4 },
      labelBgPadding: [6, 4]
    }
    setEdges(eds => addEdge(newEdge, eds))
    setSelectedEdgeId(newEdge.id)
    setSelectedNodeId(null)
  }, [edges, setEdges])

  // Select inspector target
  const handlePaneClick = () => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }

  const handleNodeClick = (_e: any, node: Node) => {
    setSelectedNodeId(node.id)
    setSelectedEdgeId(null)
  }

  const handleEdgeClick = (_e: any, edge: Edge) => {
    setSelectedEdgeId(edge.id)
    setSelectedNodeId(null)
  }

  // Character modifications
  const selectedCharacter = characters.find(c => c.id === selectedNodeId)
  
  const updateCharacterField = (field: string, value: any) => {
    if (!selectedNodeId) return
    
    // Update local state
    const updatedChars = characters.map(c => {
      if (c.id !== selectedNodeId) return c
      return { ...c, [field]: value }
    })
    setCharacters(updatedChars)

    // Update node visual representation
    setNodes(nds => nds.map(n => {
      if (n.id !== selectedNodeId) return n
      return {
        ...n,
        data: {
          ...n.data,
          [field === 'name' ? 'name' : field === 'role' ? 'role' : field]: value
        }
      }
    }))
  }

  // Edge modifications
  const selectedEdge = edges.find(e => e.id === selectedEdgeId)

  const updateEdgeField = (field: 'relation_type' | 'affinity_score', value: any) => {
    if (!selectedEdgeId) return
    setEdges(eds => eds.map(e => {
      if (e.id !== selectedEdgeId) return e

      const currentData = e.data || { relation_type: 'Giao thiệp', affinity_score: 0 }
      const newData = { ...currentData, [field]: value }
      const newStyle = getEdgeStyle(newData.relation_type, newData.affinity_score)

      return {
        ...e,
        data: newData,
        style: newStyle,
        label: `${newData.relation_type} (${newData.affinity_score > 0 ? '+' : ''}${newData.affinity_score})`
      }
    }))
  }

  const handleDeleteEdge = () => {
    if (!selectedEdgeId) return
    setEdges(eds => eds.filter(e => e.id !== selectedEdgeId))
    setSelectedEdgeId(null)
  }

  // Delete Character Node
  const handleDeleteCharacter = () => {
    if (!selectedNodeId) return
    if (confirm('Bạn có chắc muốn xoá nhân vật này khỏi vụ án? Việc này sẽ xoá tất cả các quan hệ và sự kiện liên quan.')) {
      setCharacters(prev => prev.filter(c => c.id !== selectedNodeId))
      setNodes(nds => nds.filter(n => n.id !== selectedNodeId))
      setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId))
      setSelectedNodeId(null)
    }
  }

  // Save Sơ đồ & Dữ liệu
  const handleSave = async () => {
    setIsSaving(true)

    // 1. Gather all character node positions
    const charactersPayload = characters.map(c => {
      const node = nodes.find(n => n.id === c.id)
      return {
        ...c,
        position_x: node ? node.position.x : c.position_x,
        position_y: node ? node.position.y : c.position_y
      }
    })

    // Save Characters first to get real database UUIDs
    const resChars = await saveCharacters(caseId, charactersPayload)
    if (!resChars.success || !resChars.data) {
      toast.error(`Có lỗi xảy ra khi lưu nhân vật: ${resChars.error}`)
      setIsSaving(false)
      return
    }

    // Build map of character Name -> real database UUID
    const nameToIdMap = new Map<string, string>()
    resChars.data.forEach((c: any) => {
      nameToIdMap.set(c.name, c.id)
    })

    // 2. Gather and map all relationships using real UUIDs
    const relationshipsPayload = edges.map(e => {
      // Find character names from local state
      const sourceChar = characters.find(c => c.id === e.source)
      const targetChar = characters.find(c => c.id === e.target)

      const sourceUuid = sourceChar ? (nameToIdMap.get(sourceChar.name) || e.source) : e.source
      const targetUuid = targetChar ? (nameToIdMap.get(targetChar.name) || e.target) : e.target

      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
      if (!isUuid(sourceUuid) || !isUuid(targetUuid)) return null

      const item: any = {
        character_1_id: sourceUuid,
        character_2_id: targetUuid,
        relation_type: e.data?.relation_type || 'Giao thiệp',
        affinity_score: e.data?.affinity_score ?? 0
      }
      if (e.id && isUuid(e.id)) {
        item.id = e.id
      }
      return item
    }).filter(Boolean)

    // Save Relationships
    const resRels = await saveRelationships(caseId, relationshipsPayload as any[])

    setIsSaving(false)

    if (resRels.success) {
      toast.success('Đã lưu mối quan hệ và hồ sơ nhân vật thành công!')
    } else {
      toast.error(`Lỗi khi lưu mối quan hệ: ${resRels.error || 'Unknown'}`)
    }
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      
      {/* TOOLBAR */}
      <div className="h-14 border-b border-white/10 bg-zinc-900/40 flex items-center justify-between px-4 shrink-0 z-20 relative backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-zinc-100">Ma Trận Quan Hệ Nhân Vật</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddCharModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-200 font-medium rounded hover:bg-zinc-800 transition-colors text-xs"
          >
            <Plus className="size-3.5" />
            Thêm nhân vật
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {/* WORKSPACE & SIDE PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* React Flow Board */}
        <div className="flex-1 h-full bg-zinc-950/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onPaneClick={handlePaneClick}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            fitView
            connectionMode={ConnectionMode.Loose}
            connectionRadius={150}
            connectionLineType={ConnectionLineType.Straight}
          >
            <Background color="#ffffff" style={{ opacity: 0.03 }} gap={16} variant={BackgroundVariant.Dots} />
            <style>{`
              .react-flow__controls-button {
                background-color: #18181b !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                fill: #a1a1aa !important;
              }
              .react-flow__controls-button:hover {
                background-color: #27272a !important;
              }
            `}</style>
            <Controls className="shadow-xl" showInteractive={false} />
          </ReactFlow>
        </div>

        {/* SIDE INSPECTOR PANEL */}
        <div 
          className={`absolute top-0 bottom-0 right-0 w-[420px] z-50 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${selectedNodeId || selectedEdgeId ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* INSPECT CHARACTER */}
          {selectedNodeId && selectedCharacter && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
                <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  Hồ Sơ Nhân Vật
                </h3>
                <button onClick={handlePaneClick} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {/* HEADER CARD: Ảnh trái + Tên/Vai trò phải */}
                <div className="flex items-start gap-3">
                  {/* Avatar clickable upload */}
                  <label className={`relative w-[75px] h-[100px] bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group/avatar transition-colors rounded-none ${
                    selectedCharacter.avatar_url 
                      ? 'border-0' 
                      : 'border border-white/10 hover:border-primary/50'
                  }`}>
                    {selectedCharacter.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedCharacter.avatar_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex items-center justify-center text-zinc-600 select-none">
                        <User className="size-6 stroke-[1.5]" aria-hidden="true" />
                      </div>
                    )}
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      {isUploading ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                      ) : (
                        <Upload className="size-5 text-white/80" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={isUploading}
                      className="hidden" 
                    />
                  </label>

                  {/* Tên + Vai trò */}
                  <div className="flex-1 space-y-2 pt-1">
                    <input 
                      type="text" 
                      value={selectedCharacter.name} 
                      onChange={e => updateCharacterField('name', e.target.value)} 
                      placeholder="Tên nhân vật..."
                      className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                    />
                    <select 
                      value={selectedCharacter.role} 
                      onChange={e => updateCharacterField('role', e.target.value)} 
                      className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                    >
                      <option value="SUSPECT">Nghi phạm (Suspect)</option>
                      <option value="VICTIM">Nạn nhân (Victim)</option>
                      <option value="KILLER">Hung thủ (Killer)</option>
                      <option value="WITNESS">Nhân chứng (Witness)</option>
                      <option value="DETECTIVE">Thám tử (Detective)</option>
                    </select>
                  </div>
                </div>

                {/* Triple Truth Attributes */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                    <ShieldAlert className="size-4" />
                    Bộ Ba Bản Chất
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Động cơ thực tế (Motive)</label>
                    <textarea 
                      rows={3}
                      value={selectedCharacter.real_motive || ''} 
                      onChange={e => updateCharacterField('real_motive', e.target.value)} 
                      placeholder="Lý do muốn gây hại nạn nhân..."
                      className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 p-2 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Bí mật ngụy tạo (Red Herring Secret)</label>
                    <textarea 
                      rows={3}
                      value={selectedCharacter.red_herring_secret || ''} 
                      onChange={e => updateCharacterField('red_herring_secret', e.target.value)} 
                      placeholder="Hành vi mờ ám muốn che giấu thám tử để tự bào chữa..."
                      className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 p-2 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Chứng cứ ngoại phạm thực tế (Real Alibi)</label>
                    <textarea 
                      rows={3}
                      value={selectedCharacter.real_alibi || ''} 
                      onChange={e => updateCharacterField('real_alibi', e.target.value)} 
                      placeholder="Sự thật chính xác nhân vật ở đâu, làm gì khi án mạng xảy ra..."
                      className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 p-2 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 shrink-0 bg-zinc-900/20">
                <button
                  onClick={handleDeleteCharacter}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-medium rounded transition-colors text-xs"
                >
                  <UserMinus className="size-4" />
                  Xoá Nhân Vật Khỏi Vụ Án
                </button>
              </div>
            </div>
          )}

          {/* INSPECT RELATIONSHIP (EDGE) */}
          {selectedEdgeId && selectedEdge && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
                <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  Thiết Lập Quan Hệ
                </h3>
                <button onClick={handlePaneClick} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Liên kết đối tượng</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-100">
                      {characters.find(c => c.id === selectedEdge.source)?.name || 'Unknown'}
                    </span>
                    <span className="text-zinc-500 px-2">↔</span>
                    <span className="font-medium text-zinc-100">
                      {characters.find(c => c.id === selectedEdge.target)?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Loại quan hệ</label>
                  <input 
                    type="text" 
                    value={(selectedEdge.data as any)?.relation_type || 'Giao thiệp'} 
                    onChange={e => updateEdgeField('relation_type', e.target.value)} 
                    placeholder="e.g. Ruột thịt, Vợ chồng, Thù ghét, Trợ lý"
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    <span>Độ thân thiết / căng thẳng</span>
                    <span className={`font-mono text-xs ${
                      ((selectedEdge.data as any)?.affinity_score ?? 0) < 0 ? 'text-red-400' : 
                      ((selectedEdge.data as any)?.affinity_score ?? 0) > 0 ? 'text-emerald-400' : 'text-zinc-400'
                    }`}>
                      {((selectedEdge.data as any)?.affinity_score ?? 0) > 0 ? '+' : ''}{(selectedEdge.data as any)?.affinity_score ?? 0}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="-100"
                    max="100"
                    step="10"
                    value={(selectedEdge.data as any)?.affinity_score ?? 0}
                    onChange={e => updateEdgeField('affinity_score', parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-500 mt-1 font-mono uppercase">
                    <span>-100 Thù hận</span>
                    <span>0 Xã giao</span>
                    <span>+100 Thân thiết</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 shrink-0 bg-zinc-900/20">
                <button
                  onClick={handleDeleteEdge}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-medium rounded transition-colors text-xs"
                >
                  <Trash2 className="size-4" />
                  Xoá Quan Hệ Này
                </button>
              </div>
            </div>
          )}

        </div>

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
                  const newId = `new-${Date.now()}`
                  const newChar = {
                    id: newId,
                    name: newCharForm.name.trim(),
                    role: newCharForm.role,
                    avatar_url: '',
                    position_x: 350 + Math.random() * 100,
                    position_y: 200 + Math.random() * 100,
                    real_motive: '',
                    real_alibi: '',
                    red_herring_secret: ''
                  }
                  setCharacters(prev => [...prev, newChar])
                  setNodes(nds => [
                    ...nds,
                    {
                      id: newId,
                      type: 'character',
                      position: { x: newChar.position_x, y: newChar.position_y },
                      data: { name: newChar.name, role: newChar.role }
                    }
                  ])
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

    </div>
  )
}
