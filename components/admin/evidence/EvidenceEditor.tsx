import React, { useState, useEffect } from 'react'
import { X, Image as ImageIcon, MessageSquare, AlignLeft, Upload, FileText, CheckCircle2, ChevronRight, Tags, EyeOff } from 'lucide-react'

interface EvidenceEditorProps {
  node: any
  onClose: () => void
  onSave: (id: string, data: any) => void
}

export default function EvidenceEditor({ node, onClose, onSave }: EvidenceEditorProps) {
  // Local state to hold edits before saving
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (node) {
      setFormData(node.data)
    }
  }, [node])

  if (!node) return null

  const isQuestion = node.type === 'question'

  const handleSave = () => {
    onSave(node.id, formData)
    onClose()
  }

  return (
    <div className="absolute inset-0 z-[300] bg-zinc-950/90 backdrop-blur-md flex animate-in fade-in duration-300">
      
      {/* LEFT: MAIN EDITOR (NOTION STYLE) */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950 border-r border-white/5 relative overflow-y-auto custom-scrollbar">
        
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <span className="hover:text-zinc-200 cursor-pointer transition-colors" onClick={onClose}>Detective Board</span>
            <ChevronRight className="size-4" />
            <span className="text-zinc-200 truncate max-w-[200px]">{formData.label || 'Untitled'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
              <SaveIcon /> Save Changes
            </button>
          </div>
        </div>

        {/* Cover Image Area */}
        <div className="h-64 w-full bg-zinc-900 relative group border-b border-white/5">
          {/* Placeholder for Cover Image */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/50" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-sm font-medium text-white transition-colors">
              <ImageIcon className="size-4" /> Change Cover
            </button>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="max-w-3xl w-full mx-auto px-12 py-12 pb-32">
          
          {/* Title */}
          <input 
            type="text"
            value={formData.label || ''}
            onChange={e => setFormData({ ...formData, label: e.target.value })}
            placeholder={isQuestion ? "Mystery Title..." : "Evidence Title..."}
            className="w-full bg-transparent text-5xl font-bold text-white placeholder:text-zinc-700 outline-none mb-8 leading-tight"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-white/5 rounded-lg mb-8 w-fit">
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Add Text"><AlignLeft className="size-4" /></button>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Add Image"><ImageIcon className="size-4" /></button>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Add Dialogue"><MessageSquare className="size-4" /></button>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Upload File"><Upload className="size-4" /></button>
          </div>

          {/* Body Content */}
          <div className="space-y-6">
            <textarea
              value={formData.desc || ''}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              placeholder={isQuestion ? "Describe the context of this mystery..." : "Write the full story, autopsy report, or witness statement here..."}
              className="w-full h-[400px] bg-transparent text-lg text-zinc-300 placeholder:text-zinc-700 outline-none resize-none leading-relaxed"
            />
          </div>

        </div>
      </div>

      {/* RIGHT: PROPERTIES SIDEBAR */}
      <div className="w-[350px] bg-zinc-950/80 shrink-0 border-l border-white/5 overflow-y-auto">
        <div className="p-6 space-y-8">
          
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Properties</h3>
            
            <div className="space-y-4">
              {/* Common Property: Type */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-400"><FileText className="size-4" /> Node Type</div>
                <div className="text-zinc-200 capitalize bg-white/5 px-2 py-1 rounded font-mono text-xs">{node.type}</div>
              </div>

              {/* Evidence Properties */}
              {!isQuestion && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-400"><Tags className="size-4" /> Category</div>
                  <select 
                    value={formData.category || 'CLUE'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="bg-zinc-900 border border-white/10 rounded text-xs text-zinc-200 px-2 py-1 outline-none"
                  >
                    <option value="CLUE">Clue</option>
                    <option value="FORENSICS">Forensics</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                </div>
              )}

              {/* Question Properties */}
              {isQuestion && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-400"><CheckCircle2 className="size-4" /> Category</div>
                  <select 
                    value={formData.category || 'CORE MYSTERY'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="bg-zinc-900 border border-white/10 rounded text-xs text-zinc-200 px-2 py-1 outline-none"
                  >
                    <option value="CORE MYSTERY">Core Mystery</option>
                    <option value="CORE MYSTERY #1">Core Mystery #1</option>
                    <option value="CORE MYSTERY #2">Core Mystery #2</option>
                    <option value="CORE MYSTERY #3">Core Mystery #3</option>
                    <option value="SUB MYSTERY">Sub Mystery</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Question specific detailed settings */}
          {isQuestion && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Logic & Answers</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-2">Question Type</label>
                  <select 
                    value={formData.questionType || 'MULTIPLE_CHOICE'}
                    onChange={e => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded text-sm text-zinc-200 px-3 py-2 outline-none"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TEXT_INPUT">Text Input</option>
                  </select>
                </div>

                {formData.questionType === 'TEXT_INPUT' ? (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-2">Exact Match Answer</label>
                    <input 
                      type="text"
                      value={formData.textAnswer || ''}
                      onChange={e => setFormData({ ...formData, textAnswer: e.target.value })}
                      className="w-full bg-zinc-900 border border-emerald-500/30 rounded text-sm text-emerald-300 px-3 py-2 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 block mb-2">Choices</label>
                    {(formData.answers || []).map((ans: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <button 
                          onClick={() => setFormData({ ...formData, correctAnswer: idx })}
                          className={`shrink-0 size-8 rounded flex items-center justify-center border text-xs font-bold transition-colors ${
                            formData.correctAnswer === idx ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-white/10 text-zinc-500'
                          }`}
                        >
                          {['A','B','C','D'][idx]}
                        </button>
                        <input 
                          type="text"
                          value={ans}
                          onChange={e => {
                            const newAnswers = [...formData.answers]
                            newAnswers[idx] = e.target.value
                            setFormData({ ...formData, answers: newAnswers })
                          }}
                          className={`flex-1 bg-zinc-900 border rounded text-sm px-3 py-1.5 outline-none transition-colors ${
                            formData.correctAnswer === idx ? 'border-emerald-500/30 text-emerald-200' : 'border-white/10 text-zinc-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden Notes */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <EyeOff className="size-4" /> Hidden GM Notes
            </h3>
            <textarea
              placeholder="Notes for game master only. Players won't see this..."
              className="w-full h-32 bg-rose-500/5 border border-rose-500/20 rounded-lg text-sm text-rose-200/70 p-3 outline-none resize-none placeholder:text-rose-500/30"
            />
          </div>

        </div>
      </div>

    </div>
  )
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}
