'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DbFeedback } from '@/lib/types/database'
import { updateFeedbackStatus } from '@/lib/actions/feedback-actions'
import { MessageSquare, CheckCircle, XCircle, Clock, Star, Mail } from 'lucide-react'

export function FeedbacksClient({ initialFeedbacks, currentFilter }: { initialFeedbacks: DbFeedback[], currentFilter: string }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, status: string) => {
    setLoadingId(id)
    await updateFeedbackStatus(id, status)
    setLoadingId(null)
    router.refresh()
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'BUG': return <XCircle className="size-4 text-rose-500" />
      case 'RATING': return <Star className="size-4 text-amber-500" />
      case 'TYPO': return <MessageSquare className="size-4 text-blue-400" />
      default: return <MessageSquare className="size-4 text-zinc-400" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Player Feedbacks</h1>
          <p className="text-zinc-400 mt-1">Manage bug reports, ratings, and feedback from players.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'IGNORED'].map(f => (
          <button
            key={f}
            onClick={() => router.push(`/studio/feedbacks?status=${f}`)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${currentFilter === f ? 'bg-primary text-primary-foreground' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {initialFeedbacks.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <MessageSquare className="size-12 mx-auto opacity-20 mb-4" />
            <p>Không có dữ liệu feedback nào.</p>
          </div>
        ) : (
          initialFeedbacks.map(fb => (
            <div key={fb.id} className="bg-zinc-950/50 border border-white/10 rounded-xl p-5 flex gap-4 transition-all hover:border-white/20">
              <div className="pt-1">{getTypeIcon(fb.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-100">{fb.type}</span>
                    {fb.status === 'NEW' && <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">Mới</span>}
                    {fb.status === 'RESOLVED' && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Đã xử lý</span>}
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="size-3" /> {new Date(fb.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {fb.status !== 'RESOLVED' && (
                      <button 
                        onClick={() => handleStatusChange(fb.id, 'RESOLVED')}
                        disabled={loadingId === fb.id}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Đánh dấu Đã xử lý
                      </button>
                    )}
                    {fb.status === 'NEW' && (
                      <button 
                        onClick={() => handleStatusChange(fb.id, 'IN_PROGRESS')}
                        disabled={loadingId === fb.id}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Đang xem xét
                      </button>
                    )}
                  </div>
                </div>

                {fb.type === 'RATING' && fb.rating_score && (
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4" fill={i < fb.rating_score! ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                )}

                {fb.content && (
                  <div className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                    {fb.content}
                  </div>
                )}

                {fb.contact_info && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-2 border-t border-white/5">
                    <Mail className="size-3" /> Liên hệ: <span className="text-zinc-400 font-mono">{fb.contact_info}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
