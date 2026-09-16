'use client'

import { useState } from 'react'
import {
  Globe,
  Search,
  BookOpen,
  Share,
  Layers,
  ArrowLeft,
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
}

export function SafariApp({ history }: SafariAppProps) {
  const [selectedSearch, setSelectedSearch] = useState<BrowserHistory | null>(null)

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top URL Bar */}
      <div className="px-3 pt-3 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
        <div className="h-8 rounded-xl bg-[#2C2C2E] border border-[#3A3A3C] px-3 flex items-center justify-between text-[#8E8E93] text-[12px]">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="size-3.5 text-[#30D158]" />
            <span className="text-white font-medium text-[11px] truncate">
              {selectedSearch ? 'google.com/search' : 'safari://history'}
            </span>
          </div>
          <RotateCw className="size-3 text-[#8E8E93]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-14">
        {selectedSearch ? (
          /* Google Search Result Mockup */
          <div className="space-y-3 animate-in fade-in-50 duration-200">
            <button
              onClick={() => setSelectedSearch(null)}
              className="flex items-center gap-1 text-[#0A84FF] text-[12px] font-medium mb-2"
            >
              <ArrowLeft className="size-3.5" /> Quay lại lịch sử
            </button>

            {/* Google Query Header */}
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E]">
              <div className="text-[10px] text-[#8E8E93] uppercase font-mono">Từ khóa tìm kiếm:</div>
              <div className="text-[14px] font-bold text-white mt-0.5">{selectedSearch.label}</div>
              <div className="text-[10px] text-[#8E8E93] mt-1 font-mono">Thời gian tra cứu: {selectedSearch.time}</div>
            </div>

            {/* Mock Search Result 1 */}
            <div className="p-3 rounded-xl bg-[#1C1C1E]/80 border border-[#2C2C2E] space-y-1">
              <div className="text-[10px] text-[#30D158] flex items-center gap-1">
                <span>suckhoedoisong.vn › than-kinh</span>
              </div>
              <div className="text-[13px] font-semibold text-[#0A84FF]">
                Hiện tượng ngầy ngật, tê liệt tứ chi sau khi uống trà là biểu hiện của chất gì?
              </div>
              <p className="text-[11.5px] text-[#A1A1A6] leading-relaxed">
                Trà hoa cúc nguyên chất chỉ có tác dụng thư giãn nhẹ. Nếu xuất hiện triệu chứng mê man li bì, nặng trĩu cơ thể mất kiểm soát, cần cảnh giác nguy cơ bị trộn các dẫn xuất thuốc an thần gây ức chế thần kinh...
              </p>
            </div>

            {/* Mock Search Result 2 */}
            <div className="p-3 rounded-xl bg-[#1C1C1E]/80 border border-[#2C2C2E] space-y-1">
              <div className="text-[10px] text-[#30D158]">
                <span>vinmec.com › hoi-dap-bac-si</span>
              </div>
              <div className="text-[13px] font-semibold text-[#0A84FF]">
                Liều lượng an toàn của Diazepam và các phản ứng phụ khi dùng lâu dài
              </div>
              <p className="text-[11.5px] text-[#A1A1A6] leading-relaxed">
                Dùng liều thấp liên tục khiến bệnh nhân luôn ở trạng thái ngủ gà ngủ gật, giảm khả năng vận động và phụ thuộc vào người chăm sóc...
              </p>
            </div>
          </div>
        ) : (
          /* Browser History List */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-white">
                <Clock className="size-4 text-[#0A84FF]" />
                <span>Lịch sử tra cứu gần đây</span>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-mono">{history.length} mục</span>
            </div>

            <div className="divide-y divide-[#2C2C2E] rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSearch(item)}
                  className="p-3 hover:bg-[#2C2C2E]/60 active:bg-[#3A3A3C] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[12.5px] font-medium text-white line-clamp-2">
                      {item.label}
                    </div>
                    <ExternalLink className="size-3 text-[#8E8E93] shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8E8E93] font-mono">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span className="text-[#30D158]">{item.status}</span>
                  </div>
                </div>
              ))}
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
