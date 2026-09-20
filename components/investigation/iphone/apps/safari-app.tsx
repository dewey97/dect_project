'use client'

import { useState } from 'react'
import {
  Globe,
  Search,
  BookOpen,
  Share,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ArrowRight,
  RotateCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react'
import type { BrowserHistory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface SafariAppProps {
  history?: BrowserHistory[]
  onBackToHome?: () => void
}

export function SafariApp({ onBackToHome }: SafariAppProps) {
  const { data: rawData, loading } = usePhoneData('notes_and_browser')

  // Filter items where type == 'SAFARI'
  const safariItems = rawData.filter((item: any) => String(item.type).toUpperCase() === 'SAFARI')

  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top URL Bar */}
      <div className="px-3 pt-3 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
        <div className="h-8 rounded-xl bg-[#2C2C2E] border border-[#3A3A3C] px-2 flex items-center justify-between text-[#8E8E93] text-[12px]">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[11px] font-semibold hover:underline cursor-pointer mr-1 shrink-0"
              title="Thoát ứng dụng về Màn hình chính"
            >
              <ChevronLeft className="size-3.5 text-[#0A84FF]" />
              <span>Home</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 truncate flex-1 justify-center">
            <ShieldCheck className="size-3.5 text-[#30D158] shrink-0" />
            <span className="text-white font-medium text-[11px] truncate">
              {selectedItem ? (selectedItem.title_or_domain || 'safari://view') : 'safari://history'}
            </span>
          </div>
          <RotateCw className="size-3 text-[#8E8E93] shrink-0" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8E8E93] space-y-2">
            <Loader2 className="size-6 animate-spin text-[#0A84FF]" />
            <span className="text-[12px]">Đang tải lịch sử Safari...</span>
          </div>
        ) : safariItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-14 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93]">
              <Globe className="size-7 stroke-[1.5]" />
            </div>
            <div className="space-y-1 max-w-[240px]">
              <h2 className="text-[14px] font-bold text-white tracking-tight">Lịch sử trống</h2>
              <p className="text-[11px] text-[#8E8E93]">Không tìm thấy dữ liệu tìm kiếm duyệt web.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8E8E93] flex items-center gap-1">
                <Clock className="size-3 text-[#0A84FF]" /> Lịch sử tìm kiếm & Trang đã xem
              </span>
              <span className="text-[10px] text-[#636366]">{safariItems.length} mục</span>
            </div>

            <div className="space-y-1.5">
              {safariItems.map((item: any, idx: number) => {
                const title = item.title_or_domain || 'Trang web'
                const content = item.content_or_url || ''
                const timestamp = item.timestamp || ''
                const category = item.category || 'Lịch sử'
                const clueTag = item.clue_tag || ''

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(selectedItem === item ? null : item)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5',
                      selectedItem === item
                        ? 'bg-[#1C1C1E] border-[#0A84FF]/50 ring-1 ring-[#0A84FF]/30'
                        : 'bg-[#161618] border-[#2C2C2E] hover:bg-[#1C1C1E]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="size-3.5 text-[#0A84FF] shrink-0" />
                        <span className="text-[12px] font-semibold text-white truncate">{title}</span>
                      </div>
                      <span className="text-[10px] text-[#8E8E93] shrink-0">{timestamp}</span>
                    </div>

                    <p className="text-[11px] text-[#C7C7CC] line-clamp-2 leading-relaxed pl-5 font-mono">
                      {content}
                    </p>

                    <div className="flex items-center justify-between pl-5 pt-0.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C2C2E] text-[#8E8E93]">{category}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Safari Bottom Navigation Bar */}
      <div className="h-11 bg-[#161618]/90 backdrop-blur-md border-t border-[#2C2C2E] flex items-center justify-between px-6 shrink-0 text-[#0A84FF]">
        <ArrowLeft className="size-4 opacity-50" />
        <ArrowRight className="size-4 opacity-50" />
        <Share className="size-4" />
        <BookOpen className="size-4" />
        <Layers className="size-4" />
      </div>
    </div>
  )
}

