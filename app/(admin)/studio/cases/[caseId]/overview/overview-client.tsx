'use client'

import React, { useState, useRef } from 'react'
import { FileText, Save, Image as ImageIcon, X } from 'lucide-react'
import { updateCaseOverview } from '@/lib/actions/case-actions'
import { DbCase } from '@/lib/types/database'

export function OverviewClient({ initialData }: { initialData: DbCase }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialData.cover_image_url)
  const [isSaving, setIsSaving] = useState(false)
  
  const [title, setTitle] = useState(initialData.title || '')
  const [synopsis, setSynopsis] = useState(initialData.synopsis || '')
  const [fullStory, setFullStory] = useState(initialData.full_story || '')
  const [status, setStatus] = useState(initialData.status || 'DRAFT')
  const [difficulty, setDifficulty] = useState(initialData.difficulty || 1)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn ảnh dưới 2MB để lưu vào database tạm thời.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateCaseOverview(initialData.id, {
      title,
      synopsis,
      full_story: fullStory,
      status: status as any,
      difficulty: Number(difficulty),
      cover_image_url: coverUrl
    })
    setIsSaving(false)
    if (res.success) {
      alert('Đã lưu thành công!')
    } else {
      alert('Lỗi: ' + res.error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Case Overview</h1>
          <p className="text-zinc-400 mt-1">Manage the core narrative and settings for this mystery.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
        >
          <Save className="size-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Left Column: Cover & Meta */}
        <div className="col-span-1 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Cover Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[3/4] bg-zinc-900/50 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/40 hover:bg-zinc-800/50 transition-all cursor-pointer group overflow-hidden"
            >
              {coverUrl ? (
                <>
                  <img src={coverUrl} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <ImageIcon className="size-8 mb-2" />
                    <span className="text-xs font-medium text-white">Change Cover</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setCoverUrl(null)
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-rose-500/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <ImageIcon className="size-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Upload Cover</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors text-zinc-100"
            >
              <option value="DRAFT">Draft (Not visible to players)</option>
              <option value="IN_REVIEW">In Review (Playtesting)</option>
              <option value="PUBLISHED">Published (Live)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Difficulty Level</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors text-zinc-100"
            >
              <option value="1">1 - Tutorial / Very Easy</option>
              <option value="2">2 - Easy</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Hard</option>
              <option value="5">5 - Master Detective</option>
            </select>
          </div>
        </div>

        {/* Right Column: Narrative */}
        <div className="col-span-2 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Case Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-2.5 px-4 text-base focus:outline-none focus:border-primary transition-colors text-white placeholder:text-zinc-600 font-bold"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Synopsis (Brief summary for players)</label>
            <textarea 
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Một vụ án mạng bí ẩn xảy ra trong một căn phòng khóa kín từ bên trong..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors text-zinc-300 placeholder:text-zinc-600 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <FileText className="size-4" /> Full Story / GM Notes
            </label>
            <textarea 
              rows={12}
              value={fullStory}
              onChange={(e) => setFullStory(e.target.value)}
              placeholder="Write the complete story outline, truths, red herrings, and game master notes here..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors text-zinc-300 placeholder:text-zinc-600 resize-none leading-relaxed"
            />
          </div>
        </div>

      </div>

    </div>
  )
}
