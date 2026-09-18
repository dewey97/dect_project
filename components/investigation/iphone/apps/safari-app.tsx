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
  ShieldCheck
} from 'lucide-react'
import type { BrowserHistory } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SafariAppProps {
  history: BrowserHistory[]
  onBackToHome?: () => void
}

export function SafariApp({ history, onBackToHome }: SafariAppProps) {
  const [selectedSearch, setSelectedSearch] = useState<BrowserHistory | null>(null)

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
              {selectedSearch ? 'google.com/search' : 'safari://history'}
            </span>
          </div>
          <RotateCw className="size-3 text-[#8E8E93] shrink-0" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-14 flex flex-col items-center justify-center text-center space-y-4">
        <div className="size-16 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93]">
          <Globe className="size-8 stroke-[1.5]" />
        </div>

        <div className="space-y-1.5 max-w-[260px]">
          <h2 className="text-[16px] font-bold text-white tracking-tight">
            Safari không thể mở trang
          </h2>
          <p className="text-[12px] text-[#8E8E93] leading-relaxed">
            Safari không thể mở trang vì không có kết nối Internet.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#1C1C1E]/80 border border-white/5 text-[11px] text-[#636366] max-w-[260px] font-mono leading-normal">
          Trạng thái: Thiết bị mất sóng (No Service) • Lịch sử duyệt web trống.
        </div>
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
