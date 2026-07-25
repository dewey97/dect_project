'use client'

import { useState, useEffect } from 'react'
import { AssistantPanel } from '@/components/investigation/panels/assistant-panel'
import { getActiveCase } from '@/lib/mock-data'
import type { Case } from '@/lib/types'
import { Search, Phone, Info, Calendar, MapPin, ShieldAlert, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AssistantPage() {
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [selectedChat, setSelectedChat] = useState<'minh' | 'emergency'>('minh')

  useEffect(() => {
    async function loadCase() {
      const c = await getActiveCase()
      if (c) setActiveCase(c)
    }
    loadCase()
  }, [])

  return (
    <div className="flex-1 flex h-[calc(100vh-140px)] border border-border/80 rounded-xl bg-card/25 overflow-hidden shadow-sm">
      
      {/* 1. LEFT COLUMN: Chat Conversations List (Messenger Sidebar style) */}
      <div className="hidden md:flex flex-col w-[260px] border-r border-border/50 h-full bg-card/40 shrink-0">
        {/* Header Search Bar */}
        <div className="p-4 border-b border-border/40">
          <h3 className="font-sans text-sm font-bold text-foreground mb-2">Đoạn chat</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-muted/60 border border-border/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/45 transition-colors"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {/* Chat Item: Điều phối viên Minh */}
          <button
            onClick={() => setSelectedChat('minh')}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer",
              selectedChat === 'minh' ? "bg-primary/10 border border-primary/20 text-primary" : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-serif text-sm font-black text-primary shrink-0">
              M
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-foreground block truncate">
                  Điều phối viên Minh
                </span>
                <span className="font-sans text-[0.55rem] text-muted-foreground">1m</span>
              </div>
              <span className="font-sans text-[0.6rem] text-muted-foreground truncate block">
                Hệ thống đang đồng bộ...
              </span>
            </div>
          </button>

          {/* Chat Item: Tổng đài khẩn cấp */}
          <button
            onClick={() => setSelectedChat('emergency')}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer",
              selectedChat === 'emergency' ? "bg-primary/10 border border-primary/20 text-primary" : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative size-9 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
              <Phone className="size-4" />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-zinc-500 border-2 border-card" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-foreground block truncate">
                  Tổng đài khẩn cấp
                </span>
                <span className="font-sans text-[0.55rem] text-muted-foreground">2h</span>
              </div>
              <span className="font-sans text-[0.6rem] text-muted-foreground truncate block">
                Đã ghi nhận cuộc gọi báo án...
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. CENTER COLUMN: Active Chat Messages Window */}
      <div className="flex-1 flex flex-col h-full bg-card/10 overflow-hidden relative">
        {selectedChat === 'minh' ? (
          <AssistantPanel showHeader={false} className="h-full" />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Simple Emergency Call Log View */}
            <div className="border-b border-border/40 px-4 py-3 flex items-center gap-3">
              <div className="size-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <Phone className="size-4" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-foreground">Tổng đài Khẩn cấp 113</h4>
                <span className="font-sans text-[0.55rem] text-muted-foreground">Ghi âm cuộc gọi báo án</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-[0.65rem]">
              <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-3 text-destructive">
                <ShieldAlert className="size-4 mb-1.5 animate-pulse" />
                <p className="font-sans font-bold uppercase tracking-wider mb-1">GHI ÂM ĐÃ KHÔI PHỤC</p>
                <p className="font-sans font-normal normal-case leading-relaxed">
                  "Alo? Cảnh sát quận Bắc đúng không? Tôi phát hiện một thi thể ở căn nhà cũ khu giải tỏa... Có vẻ như nạn nhân ngã đập đầu, máu chảy rất nhiều... Nhanh lên!"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT COLUMN: Active Chat Information Sidebar (Messenger Right Bar style) */}
      {selectedChat === 'minh' && (
        <div className="hidden lg:flex flex-col w-[260px] border-l border-border/50 h-full bg-card/40 p-4 overflow-y-auto shrink-0 font-sans gap-5">
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-2 pb-4 border-b border-border/30 text-center">
            <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-serif text-2xl font-black text-primary shadow-sm relative">
              M
              <span className="absolute bottom-0 right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Điều phối viên Minh</h4>
              <span className="text-[0.6rem] text-muted-foreground uppercase font-mono tracking-wider">AI Investigation Suite</span>
            </div>
          </div>

          {/* Active Case Info widget */}
          {activeCase && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[0.55rem] font-mono font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-1">
                Chi tiết hồ sơ
              </span>
              
              <div className="flex items-start gap-2 text-[0.65rem] leading-relaxed">
                <Award className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground font-mono block">
                    {activeCase.code}
                  </span>
                  <span className="text-muted-foreground">{activeCase.title}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[0.65rem] leading-relaxed">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block">Địa điểm</span>
                  <span className="text-muted-foreground">{activeCase.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline of facts */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[0.55rem] font-mono font-bold text-primary uppercase tracking-widest border-b border-border/40 pb-1">
              Nhật ký dòng thời gian
            </span>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 text-[0.65rem]">
                <Calendar className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-foreground font-mono">10:00</span>
                  <p className="text-muted-foreground mt-0.5">Trần Ngọc Mai và Khang cãi nhau tại hiện trường.</p>
                </div>
              </div>
              
              <div className="flex gap-2 text-[0.65rem]">
                <Calendar className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-foreground font-mono">15:30</span>
                  <p className="text-muted-foreground mt-0.5">Lê Quang Vũ lập hồ sơ khống diện tích.</p>
                </div>
              </div>

              <div className="flex gap-2 text-[0.65rem]">
                <Calendar className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-foreground font-mono">20:45</span>
                  <p className="text-muted-foreground mt-0.5">Vũ lẻn lại hiện trường để tìm bản vẽ sửa nhà.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
