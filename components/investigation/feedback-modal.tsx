'use client'

import React, { useState } from 'react'
import { MessageSquare, X, Send, Star, AlertCircle } from 'lucide-react'
import { submitFeedback } from '@/lib/actions/feedback-actions'
import { DbFeedback } from '@/lib/types/database'
import { usePathname } from 'next/navigation'
import { toast } from '@/components/ui/toast'

export function FeedbackModal() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [type, setType] = useState<DbFeedback['type']>('FEEDBACK')
  const [rating, setRating] = useState<number>(0)
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && rating === 0) return

    setIsSubmitting(true)
    const payload: Partial<DbFeedback> = {
      type,
      content,
      contact_info: contact,
      rating_score: type === 'RATING' ? rating : undefined
    }

    const res = await submitFeedback(payload)
    setIsSubmitting(false)
    if (res.success) {
      setIsSuccess(true)
      toast.success('Cảm ơn bạn đã gửi phản hồi góp ý!')
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
        setContent('')
        setRating(0)
        setContact('')
        setType('FEEDBACK')
      }, 2000)
    } else {
      toast.error('Lỗi khi gửi góp ý: ' + res.error)
    }
  }

  if (pathname.startsWith('/studio')) return null

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-zinc-900 border border-white/10 hover:border-primary text-zinc-400 hover:text-zinc-100 rounded-full shadow-2xl transition-all hover:scale-105 hover:bg-zinc-800"
        title="Góp ý / Báo lỗi"
      >
        <MessageSquare className="size-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Góp ý & Báo cáo
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                  <Send className="size-6 ml-1" />
                </div>
                <div>
                  <h4 className="font-medium text-zinc-100">Cảm ơn bạn!</h4>
                  <p className="text-sm text-zinc-500 mt-1">Góp ý của bạn đã được gửi đến nhóm phát triển.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loại góp ý</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary"
                  >
                    <option value="FEEDBACK">💡 Góp ý chung</option>
                    <option value="RATING">⭐ Đánh giá trải nghiệm</option>
                    <option value="BUG">🐞 Báo lỗi (Bug)</option>
                    <option value="TYPO">📝 Lỗi chính tả / Dịch thuật</option>
                    <option value="OTHER">🤔 Khác</option>
                  </select>
                </div>

                {type === 'RATING' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Đánh giá của bạn</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-colors ${rating >= star ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                          <Star className="size-6" fill={rating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nội dung chi tiết</label>
                  <textarea 
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả chi tiết góp ý hoặc lỗi bạn gặp phải..."
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary resize-none"
                    required={type !== 'RATING'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Email liên hệ</span>
                    <span className="text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded">Không bắt buộc</span>
                  </label>
                  <input 
                    type="email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Để lại email nếu bạn muốn nhận phản hồi..."
                    className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <AlertCircle className="size-3" /> Thu thập ẩn danh
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || (type !== 'RATING' && !content.trim()) || (type === 'RATING' && rating === 0)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 font-medium rounded text-sm hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi đi'} <Send className="size-3.5" />
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
