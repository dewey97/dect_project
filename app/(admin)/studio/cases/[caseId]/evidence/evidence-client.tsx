'use client'

import React, { useState, useCallback } from 'react'
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
  ConnectionMode,
  ConnectionLineType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Search, FileSearch, Fingerprint, HelpCircle, Save, Plus, X, Trash2, Link } from 'lucide-react'
import EvidenceEditor from '@/components/admin/evidence/EvidenceEditor'
import { saveEvidenceBoard } from '@/lib/actions/board-actions'
import { AdminDrawer } from '@/components/admin/admin-drawer'
import { toast } from '@/components/ui/toast'

// --- TYPES ---
export type EvidenceCategory = 'CLUE' | 'FORENSICS' | 'DOCUMENT'
export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_INPUT'

export type EvidenceData = {
  label: string
  category: EvidenceCategory
  icon?: 'file' | 'fingerprint' | 'search'
  color?: string
  desc?: string
}

export type QuestionData = {
  label: string
  category?: string
  questionType: QuestionType
  answers?: string[]
  correctAnswer?: number
  textAnswer?: string
}

export type BoardNode =
  | Node<EvidenceData, 'evidence'>
  | Node<QuestionData, 'question'>

export type EvidenceClientProps = {
  caseId: string
  initialNodes: BoardNode[]
  initialEdges: Edge[]
}

const EVIDENCE_META = {
  CLUE: {
    color: 'text-emerald-400',
    icon: 'search',
  },
  FORENSICS: {
    color: 'text-blue-400',
    icon: 'fingerprint',
  },
  DOCUMENT: {
    color: 'text-amber-400',
    icon: 'file',
  },
} as const

const EVIDENCE_EDGE_STYLE = {
  stroke: '#e4e4e7',
  strokeWidth: 2,
  strokeDasharray: '5,5',
}

const QUESTION_EDGE_STYLE = {
  stroke: '#f43f5e',
  strokeWidth: 2,
}

const createEdge = (
  id: string,
  source: string,
  target: string,
  isQuestionLink = false
): Edge => ({
  id,
  source,
  target,
  sourceHandle: 'source-center',
  targetHandle: 'target',
  type: 'straight',
  animated: !isQuestionLink,
  style: isQuestionLink ? QUESTION_EDGE_STYLE : EVIDENCE_EDGE_STYLE,
})

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const

// --- CUSTOM NODES ---
function EvidenceNode({ data, selected }: { data: EvidenceData; selected?: boolean }) {
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
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
      />

      {/* HANDLE NGUỒN (ẨN) - TÂM: Dùng để neo dây vào đúng giữa thẻ */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-center" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
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

function QuestionNode({ data, selected }: { data: QuestionData; selected?: boolean }) {
  const isText = data.questionType === 'TEXT_INPUT'
  const correctAnswerText = isText
    ? data.textAnswer || '...'
    : data.answers?.[data.correctAnswer ?? 0] || '...'

  return (
    <div className={`group bg-zinc-900/95 backdrop-blur-md border-2 rounded-xl p-5 shadow-2xl w-80 transition-colors relative ${selected ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-rose-500/30 hover:border-rose-500/60'}`}>
      
      {/* HANDLE ĐÍCH (ẨN) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
      />

      {/* HANDLE NGUỒN (ẨN) - TÂM: Dùng để neo dây vào đúng giữa thẻ */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="source-center" 
        style={{ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }} 
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

const nodeTypes = {
  evidence: EvidenceNode,
  question: QuestionNode,
}

export default function EvidenceClient({ 
  caseId, 
  initialNodes, 
  initialEdges 
}: EvidenceClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<BoardNode>(
    initialNodes && initialNodes.length > 0 ? initialNodes : []
  )
  
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialEdges && initialEdges.length > 0 
      ? (initialEdges as Edge[]).map(e => ({
          ...e,
          sourceHandle: 'source-center',
          targetHandle: 'target',
          type: 'straight'
        }))
      : []
  )
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return

      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)
      const isQuestionLink = sourceNode?.type === 'question' && targetNode?.type === 'question'

      const newEdge = createEdge(
        `edge-${Date.now()}`,
        connection.source!,
        connection.target!,
        isQuestionLink
      )
      
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges, nodes],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setIsEditorOpen(false)
    setSelectedNodeId(node.id)
  }, [])

  const handleUpdateNode = useCallback(
    (id: string, dataUpdate: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? ({ ...n, data: { ...n.data, ...dataUpdate } } as BoardNode) : n
        )
      )
    },
    [setNodes]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      )
      setSelectedNodeId(null)
      setIsEditorOpen(false)
    },
    [setNodes, setEdges]
  )

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const res = await saveEvidenceBoard(caseId, nodes, edges)
      if (!res.success) {
        throw new Error(res.error || 'Không thể lưu board')
      }
      toast.success('Lưu board thành công!')
    } catch (error: any) {
      toast.error('Lưu thất bại: ' + (error?.message || 'Có lỗi xảy ra'))
    } finally {
      setIsSaving(false)
    }
  }, [caseId, nodes, edges])

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const getAnswers = (node: Node<any>) =>
    Array.isArray(node.data.answers)
      ? (node.data.answers as string[])
      : ['', '', '', '']

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* TOOLBAR */}
      <div className="h-14 border-b border-white/10 bg-zinc-900/40 flex items-center justify-between px-4 shrink-0 z-20 relative backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-zinc-100">Bảng Manh Mối & Chứng Cứ</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              const newNode: BoardNode = {
                id: crypto.randomUUID(),
                type: 'evidence',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
                data: { label: 'Manh mối mới', category: 'CLUE', desc: '' }
              }
              setNodes(nds => [...nds, newNode])
              setSelectedNodeId(newNode.id)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-200 font-medium rounded hover:bg-zinc-800 transition-colors text-xs"
          >
            <Plus className="size-3.5" />
            Thêm chứng cứ
          </button>

          <button 
            type="button"
            onClick={() => {
              const newNode: BoardNode = {
                id: crypto.randomUUID(),
                type: 'question',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 300 },
                data: { label: 'Bí ẩn cốt lõi mới?', questionType: 'MULTIPLE_CHOICE', answers: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'], correctAnswer: 0 }
              }
              setNodes(nds => [...nds, newNode])
              setSelectedNodeId(newNode.id)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 border border-rose-500/30 text-rose-400 font-medium rounded hover:bg-rose-950/60 transition-colors text-xs"
          >
            <HelpCircle className="size-3.5" />
            Thêm câu hỏi
          </button>

          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs"
          >
            <Save className="size-3.5" />
            {isSaving ? 'Saving...' : 'Save Board'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedNodeId(null)
            setIsEditorOpen(false)
          }}
          fitView
          fitViewOptions={{ padding: 0.5, maxZoom: 1.5 }}
          className="bg-zinc-950"
          connectionMode={ConnectionMode.Loose}
          connectionRadius={150}
          connectionLineType={ConnectionLineType.Straight}
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
        {selectedNode && (
          <AdminDrawer
            isOpen={!!selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
            title={selectedNode.type === 'question' ? 'Cấu Hình Câu Hỏi Bí Ẩn' : 'Thông Tin Manh Mối'}
            footer={
              <button 
                type="button"
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-medium rounded transition-colors text-xs"
              >
                <Trash2 className="size-3.5" /> Xóa thực thể khỏi bảng
              </button>
            }
          >
            {/* SHARED: TITLE */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                {selectedNode.type === 'question' ? 'Câu hỏi cốt lõi (Bí ẩn cần giải)' : 'Tên manh mối / Chứng cứ'}
              </label>
              <input 
                type="text" 
                value={selectedNode.data.label as string}
                onChange={(e) => handleUpdateNode(selectedNode.id, { label: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary" 
              />
              
              <button 
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
              >
                <FileSearch className="size-4" /> MỞ TRÌNH SOẠN THẢO CHI TIẾT 📝
              </button>
            </div>

            {/* EVIDENCE ONLY FIELDS */}
            {selectedNode.type === 'evidence' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Phân loại chứng cứ</label>
                  <select 
                    value={selectedNode.data.category as string}
                    onChange={(e) => {
                      const category = e.target.value as EvidenceCategory
                      handleUpdateNode(selectedNode.id, { 
                        category, 
                        ...EVIDENCE_META[category] 
                      })
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 px-3 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="CLUE">Clue (Manh mối chung)</option>
                    <option value="FORENSICS">Forensics (Pháp y/Vân tay)</option>
                    <option value="DOCUMENT">Document (Tài liệu/Giấy tờ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Mô tả chi tiết manh mối</label>
                  <textarea 
                    value={String(selectedNode.data.desc ?? '')}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { desc: e.target.value })}
                    placeholder="Nhập thông tin mô tả chi tiết của manh mối..."
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-100 p-2 h-32 focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700" 
                  />
                </div>
              </>
            )}

            {/* QUESTION ONLY FIELDS */}
            {selectedNode.type === 'question' && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Loại câu hỏi trả lời</label>
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
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Đáp án chính xác (Văn bản)</label>
                    <input 
                      type="text" 
                      value={(selectedNode.data.textAnswer as string) || ''}
                      onChange={(e) => handleUpdateNode(selectedNode.id, { textAnswer: e.target.value })}
                      placeholder="e.g. 1234, Tên hung thủ..."
                      className="w-full bg-zinc-900 border border-emerald-500/50 rounded text-sm text-emerald-200 px-3 py-2 focus:outline-none focus:border-emerald-400 placeholder:text-zinc-600" 
                    />
                  </div>
                ) : (
                  <>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Các lựa chọn trắc nghiệm</label>
                    {getAnswers(selectedNode).map((ans, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <button 
                          type="button"
                          onClick={() => handleUpdateNode(selectedNode.id, { correctAnswer: idx })}
                          className={`shrink-0 size-6 rounded flex items-center justify-center border transition-colors ${
                            selectedNode.data.correctAnswer === idx 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'bg-zinc-900 border-white/10 text-zinc-500 hover:bg-zinc-800'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-bold">{ANSWER_LABELS[idx] ?? idx + 1}</span>
                        </button>
                        
                        <input 
                          type="text" 
                          value={ans}
                          onChange={(e) => {
                            const newAnswers = [...getAnswers(selectedNode)]
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
          </AdminDrawer>
        )}
        
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
