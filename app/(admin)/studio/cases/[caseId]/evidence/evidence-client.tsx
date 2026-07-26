'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
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
  ConnectionMode
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Search, FileSearch, Fingerprint, HelpCircle, Save, Plus, X, Trash2, Link } from 'lucide-react'
import FloatingEdge from '@/components/admin/evidence/FloatingEdge'
import FloatingConnectionLine from '@/components/admin/evidence/FloatingConnectionLine'
import EvidenceEditor from '@/components/admin/evidence/EvidenceEditor'
import { saveEvidenceBoard } from '@/lib/actions/board-actions'

const nodeTypes = {
  evidence: EvidenceNode,
  question: QuestionNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

// --- CUSTOM NODES ---
function EvidenceNode({ data, selected }: any) {
  return (
    <div className={`group bg-zinc-900/90 backdrop-blur-sm border-2 rounded-xl p-4 shadow-2xl w-64 transition-colors relative ${selected ? 'border-primary shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
      
      {/* 
        HANDLE ĐÍCH (ẨN): Giúp hứng đường dây khi người dùng thả chuột ở bất kỳ đâu trên Thẻ 
        Kết hợp với connectionRadius sẽ tạo ra trải nghiệm Drop-anywhere
      */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }} 
      />

      {/* HANDLE NGUỒN (ẨN) - TÂM: Dùng để neo dây vào đúng giữa thẻ */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-center" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }} 
      />

      {/* NÚT LINK CHUYÊN DỤNG (HIỂN THỊ) - Dùng để người dùng nắm kéo */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="connect" 
        className="opacity-0 group-hover:opacity-100 !w-7 !h-7 !bg-zinc-800/80 !border !border-white/10 !rounded-md flex items-center justify-center !right-3 !top-3 cursor-crosshair transition-all duration-200 hover:!bg-emerald-500 hover:!border-emerald-400 text-zinc-500 hover:text-white"
      >
        <Link className="w-3.5 h-3.5 pointer-events-none" />
      </Handle>

      <div className="flex gap-3">
        <div className={`p-2 rounded-lg bg-zinc-950 border border-white/5 shrink-0 h-10 w-10 flex items-center justify-center ${data.color || 'text-emerald-400'}`}>
          {data.icon === 'fingerprint' ? <Fingerprint className="size-5" /> : 
           data.icon === 'search' ? <Search className="size-5" /> :
           <FileSearch className="size-5" />}
        </div>
        <div className="pr-8">
          <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-0.5">{data.category || 'EVIDENCE'}</div>
          <h3 className="text-sm font-medium text-zinc-100 leading-tight">{data.label}</h3>
        </div>
      </div>
      
      {data.desc && (
        <p className="mt-3 text-xs text-zinc-400 line-clamp-2 border-t border-white/5 pt-2">
          {data.desc}
        </p>
      )}
    </div>
  )
}

function QuestionNode({ data, selected }: any) {
  const isText = data.questionType === 'TEXT_INPUT'
  let correctAnswerText = ''
  
  if (isText) {
    correctAnswerText = data.textAnswer || '...'
  } else {
    correctAnswerText = (data.answers && data.answers.length > 0) ? data.answers[data.correctAnswer] : '...'
  }

  return (
    <div className={`group bg-zinc-900/95 backdrop-blur-md border-2 rounded-xl p-5 shadow-2xl w-80 transition-colors relative ${selected ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-rose-500/30 hover:border-rose-500/60'}`}>
      
      {/* HANDLE ĐÍCH (ẨN) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }} 
      />

      {/* HANDLE NGUỒN (ẨN) - TÂM: Dùng để neo dây vào đúng giữa thẻ */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-center" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }} 
      />

      {/* NÚT LINK CHUYÊN DỤNG (HIỂN THỊ) - Dùng để người dùng nắm kéo */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="connect" 
        className="opacity-0 group-hover:opacity-100 !w-7 !h-7 !bg-zinc-800/80 !border !border-white/10 !rounded-md flex items-center justify-center !right-4 !top-4 cursor-crosshair transition-all duration-200 hover:!bg-rose-500 hover:!border-rose-400 text-zinc-500 hover:text-white"
      >
        <Link className="w-3.5 h-3.5 pointer-events-none" />
      </Handle>

      <div className="flex gap-4 items-start pr-8">
        <div className="p-2 rounded-full bg-rose-500/10 border border-rose-500/20 shrink-0 h-12 w-12 flex items-center justify-center text-rose-500 shadow-inner">
          <HelpCircle className="size-6" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <div className={`text-[10px] font-mono tracking-widest uppercase font-bold ${data.category?.includes('SUB') ? 'text-amber-500/80' : 'text-rose-500/80'}`}>
              {data.category || 'CORE MYSTERY'}
            </div>
          </div>
          <h3 className="text-base font-semibold text-zinc-100 leading-snug">{data.label}</h3>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs font-medium px-3 py-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
           {correctAnswerText}
        </div>
      </div>
    </div>
  )
}

// --- MOCK DATA (KỊCH BẢN: ÁN MẠNG PHÒNG KÍN) ---
const ID_EV1 = '11111111-1111-1111-1111-111111111111'
const ID_EV2 = '22222222-2222-2222-2222-222222222222'
const ID_EV3 = '33333333-3333-3333-3333-333333333333'
const ID_EV4 = '44444444-4444-4444-4444-444444444444'
const ID_EV5 = '55555555-5555-5555-5555-555555555555'
const ID_EV6 = '66666666-6666-6666-6666-666666666666'
const ID_Q1 = '77777777-7777-7777-7777-777777777777'
const ID_Q2 = '88888888-8888-8888-8888-888888888888'
const ID_Q3 = '99999999-9999-9999-9999-999999999999'
const ID_QSUB = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

const _initialNodesFallback: Node[] = [
  { 
    id: ID_EV1, type: 'evidence', position: { x: 50, y: 100 }, 
    data: { 
      label: 'Báo cáo khám nghiệm tử thi', category: 'DOCUMENT', icon: 'file', color: 'text-amber-400',
      desc: 'Nạn nhân tắt thở vào khoảng 22:00. Không có dấu hiệu giằng co.'
    } 
  },
  { 
    id: ID_EV2, type: 'evidence', position: { x: 350, y: 100 }, 
    data: { 
      label: 'Vết bầm tím trên cổ', category: 'FORENSICS', icon: 'fingerprint', color: 'text-blue-400',
      desc: 'Vết siết rất mảnh, khoảng 2mm, không phải do tay người hay dây thừng to.'
    } 
  },
  { 
    id: ID_EV3, type: 'evidence', position: { x: 550, y: 100 }, 
    data: { 
      label: 'Chìa khóa dự phòng', category: 'CLUE', icon: 'search', color: 'text-emerald-400',
      desc: 'Nằm gọn trong túi quần nạn nhân. Cửa bị khóa từ bên trong.'
    } 
  },
  { 
    id: ID_EV4, type: 'evidence', position: { x: 800, y: 100 }, 
    data: { 
      label: 'Sợi dây cước câu cá', category: 'FORENSICS', icon: 'fingerprint', color: 'text-blue-400',
      desc: 'Tìm thấy một đoạn dây cước đứt ở ngoài ban công, dính một chút sáp nến.'
    } 
  },
  { 
    id: ID_EV6, type: 'evidence', position: { x: 950, y: 100 }, 
    data: { 
      label: 'Sao kê nợ cờ bạc', category: 'DOCUMENT', icon: 'file', color: 'text-amber-400',
      desc: 'Bác sĩ B đang nợ xã hội đen 2 tỷ, cần tiền gấp.'
    } 
  },
  { 
    id: ID_EV5, type: 'evidence', position: { x: 1250, y: 100 }, 
    data: { 
      label: 'Thẻ ra vào quẹt lúc 22:15', category: 'DOCUMENT', icon: 'file', color: 'text-amber-400',
      desc: 'Lịch sử cửa từ ghi nhận Bác sĩ B rời đi sau giờ tử vong.'
    } 
  },
  { 
    id: ID_Q1, type: 'question', position: { x: 150, y: 350 }, 
    data: { 
      category: 'CORE MYSTERY #1',
      label: 'Cánh cửa phòng bị khóa từ bên trong hay bên ngoài?', 
      questionType: 'MULTIPLE_CHOICE', 
      answers: ['Bên trong bằng chốt', 'Bên ngoài bằng khóa điện tử', 'Không hề bị khóa'], 
      correctAnswer: 1 
    } 
  },
  { 
    id: ID_Q2, type: 'question', position: { x: 550, y: 350 }, 
    data: { 
      category: 'CORE MYSTERY #2',
      label: 'Hung khí gây án thực sự là gì?', 
      questionType: 'MULTIPLE_CHOICE', 
      answers: ['Dao gọt hoa quả', 'Dây thừng', 'Chất độc không màu'], 
      correctAnswer: 2 
    } 
  },
  { 
    id: ID_Q3, type: 'question', position: { x: 1000, y: 350 }, 
    data: { 
      category: 'CORE MYSTERY #3',
      label: 'Ai là hung thủ thực sự?', 
      questionType: 'TEXT_INPUT', 
      textAnswer: 'Bác sĩ B', 
    } 
  },
  { 
    id: ID_QSUB, type: 'question', position: { x: 900, y: 600 }, 
    data: { 
      category: 'SUB MYSTERY',
      label: 'Động cơ gây án?', 
      answers: ['Thù hận tình ái', 'Tống tiền trả nợ cờ bạc', 'Tranh chấp tài sản'],
      correctAnswer: 1, 
    } 
  }
]

const _initialEdgesFallback: Edge[] = [
  { id: 'e1-1', source: ID_EV1, target: ID_Q1, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e3-q2', source: ID_EV3, target: ID_Q2, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e4-q2', source: ID_EV4, target: ID_Q2, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'eq1-q2', source: ID_Q1, target: ID_Q2, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: false, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'eq2-q3', source: ID_Q2, target: ID_Q3, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: false, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'e4-1', source: ID_EV4, target: ID_Q1, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e4-2', source: ID_EV4, target: ID_Q2, sourceHandle: 'source-center', targetHandle: 'target', type: 'straight', animated: true, style: { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' } },
]

export default function EvidenceClient({ 
  caseId, 
  initialNodes, 
  initialEdges 
}: { 
  caseId: string, 
  initialNodes: any[], 
  initialEdges: any[] 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.length > 0 ? initialNodes : _initialNodesFallback)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.length > 0 ? initialEdges : _initialEdgesFallback)
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      const isCoreToCore = sourceNode?.type === 'question' && targetNode?.type === 'question'

      const edgeToConnect = { 
        ...params,
        sourceHandle: 'source-center',
        type: 'straight',
        animated: !isCoreToCore,
        style: isCoreToCore 
          ? { stroke: '#f43f5e', strokeWidth: 2 } 
          : { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' }
      };
      setEdges((eds) => addEdge(edgeToConnect, eds))
    },
    [setEdges, nodes],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const handleUpdateNode = (id: string, dataUpdate: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          n.data = { ...n.data, ...dataUpdate }
        }
        return n
      })
    )
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between h-16 px-6 bg-zinc-950 border-b border-white/5 shrink-0 z-50">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Evidence Board</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Connect clues to form logic chains.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              setIsSaving(true)
              const res = await saveEvidenceBoard(caseId, nodes, edges)
              setIsSaving(false)
              if (res.success) alert('Board Saved Successfully!')
              else alert('Failed to save: ' + res.error)
            }}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            <Save className="size-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />

          <button 
            onClick={() => {
              const newNode: Node = {
                id: crypto.randomUUID(),
                type: 'evidence',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
                data: { label: 'New Evidence', category: 'CLUE', desc: '' }
              }
              setNodes(nds => [...nds, newNode])
              setSelectedNodeId(newNode.id)
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium rounded hover:bg-zinc-700 transition-colors"
          >
            <Plus className="size-3.5" /> Evidence
          </button>
          <button 
            onClick={() => {
              const newNode: Node = {
                id: crypto.randomUUID(),
                type: 'question',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 300 },
                data: { label: 'New Core Mystery?', answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'], correctAnswer: 0 }
              }
              setNodes(nds => [...nds, newNode])
              setSelectedNodeId(newNode.id)
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white text-xs font-medium rounded hover:bg-rose-600 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <HelpCircle className="size-3.5" /> Question
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          connectionLineComponent={FloatingConnectionLine}
          fitView
          fitViewOptions={{ padding: 0.5, maxZoom: 1.5 }}
          className="bg-zinc-950"
          connectionMode={ConnectionMode.Loose}
          connectionRadius={150}
          proOptions={{ hideAttribution: true }}
        >
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
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#ffffff10" />
          <Controls className="shadow-xl" showInteractive={false} />
          <MiniMap 
            className="!bg-zinc-950 !border !border-white/10 rounded-lg overflow-hidden shadow-xl" 
            nodeColor={(n) => {
              if (n.type === 'question') return '#f43f5e'
              return n.data.category === 'FORENSICS' ? '#60a5fa' : n.data.category === 'DOCUMENT' ? '#fbbf24' : '#10b981'
            }}
            maskColor="#00000080"
          />
        </ReactFlow>

        {/* INSPECTOR PANEL */}
        <div 
          className={`absolute top-0 bottom-0 right-0 w-[400px] z-[200] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${selectedNodeId ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedNode && (
            <>
              {/* Panel Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-zinc-900/40">
                <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                  {selectedNode.type === 'question' ? 'Mystery Configuration' : 'Evidence Inspector'}
                </h3>
                <button onClick={() => setSelectedNodeId(null)} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
                  <X className="size-4" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 space-y-6">
                
                {/* SHARED: TITLE */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">
                    {selectedNode.type === 'question' ? 'Core Question (The Mystery)' : 'Evidence Title'}
                  </label>
                  <input 
                    type="text" 
                    value={selectedNode.data.label as string}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { label: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary" 
                  />
                  
                  <button 
                    onClick={() => setIsEditorOpen(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  >
                    <FileSearch className="size-4" /> OPEN FULL EDITOR 📝
                  </button>
                </div>

                {/* EVIDENCE ONLY FIELDS */}
                {selectedNode.type === 'evidence' && (
                  <>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Category</label>
                      <select 
                        value={selectedNode.data.category as string}
                        onChange={(e) => {
                          const val = e.target.value
                          const color = val === 'FORENSICS' ? 'text-blue-400' : val === 'DOCUMENT' ? 'text-amber-400' : 'text-emerald-400'
                          const icon = val === 'FORENSICS' ? 'fingerprint' : val === 'DOCUMENT' ? 'file' : 'search'
                          handleUpdateNode(selectedNode.id, { category: val, color, icon })
                        }}
                        className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                      >
                        <option value="CLUE">Clue (Manh mối chung)</option>
                        <option value="FORENSICS">Forensics (Pháp y/Vân tay)</option>
                        <option value="DOCUMENT">Document (Tài liệu/Giấy tờ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Description / Details</label>
                      <textarea 
                        value={selectedNode.data.desc as string || ''}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { desc: e.target.value })}
                        placeholder="Enter details..."
                        className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 h-32 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" 
                      />
                    </div>
                  </>
                )}

                {/* QUESTION ONLY FIELDS */}
                {selectedNode.type === 'question' && (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Question Type</label>
                      <select 
                        value={(selectedNode.data.questionType as string) || 'MULTIPLE_CHOICE'}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { questionType: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-rose-500"
                      >
                        <option value="MULTIPLE_CHOICE">Multiple Choice (Trắc nghiệm)</option>
                        <option value="TEXT_INPUT">Text Input (Điền từ)</option>
                      </select>
                    </div>

                    {selectedNode.data.questionType === 'TEXT_INPUT' ? (
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Exact Answer (Text)</label>
                        <input 
                          type="text" 
                          value={(selectedNode.data.textAnswer as string) || ''}
                          onChange={(e) => handleUpdateNode(selectedNode.id, { textAnswer: e.target.value })}
                          placeholder="e.g. 1234, John Doe..."
                          className="w-full bg-zinc-900 border border-emerald-500/50 rounded text-sm text-emerald-200 px-3 py-2 focus:outline-none focus:border-emerald-400 placeholder:text-zinc-600" 
                        />
                      </div>
                    ) : (
                      <>
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Multiple Choice Answers</label>
                        {(selectedNode.data.answers as string[]).map((ans, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <button 
                              onClick={() => handleUpdateNode(selectedNode.id, { correctAnswer: idx })}
                              className={`shrink-0 size-6 rounded flex items-center justify-center border transition-colors ${
                                selectedNode.data.correctAnswer === idx 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                  : 'bg-zinc-900 border-white/10 text-zinc-500 hover:bg-zinc-800'
                              }`}
                            >
                              <span className="font-mono text-[10px] font-bold">{['A','B','C','D'][idx]}</span>
                            </button>
                            
                            <input 
                              type="text" 
                              value={ans}
                              onChange={(e) => {
                                const newAnswers = [...(selectedNode.data.answers as string[])]
                                newAnswers[idx] = e.target.value
                                handleUpdateNode(selectedNode.id, { answers: newAnswers })
                              }}
                              className={`flex-1 bg-zinc-900 border rounded text-sm px-3 py-1.5 focus:outline-none transition-colors ${
                                selectedNode.data.correctAnswer === idx ? 'border-emerald-500/50 text-emerald-200' : 'border-white/10 text-zinc-300 focus:border-rose-500'
                              }`} 
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="p-4 border-t border-white/5 flex gap-2 shrink-0 bg-zinc-950">
                <button 
                  onClick={() => {
                    setNodes(nds => nds.filter(n => n.id !== selectedNode.id))
                    setSelectedNodeId(null)
                  }}
                  className="flex-1 py-2 text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="size-3.5" /> Delete Node
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* EVIDENCE EDITOR OVERLAY */}
        {isEditorOpen && selectedNode && (
          <EvidenceEditor 
            node={selectedNode}
            onClose={() => setIsEditorOpen(false)}
            onSave={(id, data) => handleUpdateNode(id, data)}
          />
        )}
      </div>
    </div>
  )
}
