'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Case, EvidenceDevice, Evidence, TraceCard } from '@/lib/types'
import { BottomNav } from '@/components/investigation/bottom-nav'
import { PageTransition } from '@/components/investigation/page-transition'
import { SystemHeader } from '@/components/investigation/system-header'
import { LeftActivityBar } from './left-activity-bar'
import { AssistantPanel } from './panels/assistant-panel'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/investigation/settings-context'
import { MessageSquare, X, Minimize2, Shield, Wifi } from 'lucide-react'

interface ResponsiveLayoutProps {
  children: ReactNode
  activeCase?: Case
  devices: EvidenceDevice[]
  evidence: Evidence[]
  traceCards: TraceCard[]
}

export function ResponsiveLayout({
  children,
  activeCase,
  devices,
  evidence,
  traceCards
}: ResponsiveLayoutProps) {
  const pathname = usePathname()
  const { showTechDetails, setShowTechDetails } = useSettings()
  
  // Floating Messenger Chat Box State
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Only show the floating bubble if we are NOT on the main /assistant page
  const showFloatingBubble = pathname !== '/assistant' && !pathname?.startsWith('/assistant/conclusion')

  return (
    <div className="flex min-h-dvh w-full justify-center">
      
      {/* MOBILE LAYOUT VIEWPORT CONTAINER (max-w-[30rem] on mobile, edge-to-edge on desktop) */}
      <div className={cn(
        "relative flex min-h-dvh w-full bg-background transition-all duration-300",
        "max-w-[30rem] border-x border-border lg:border-none lg:max-w-none lg:w-screen lg:h-dvh lg:overflow-hidden flex-col lg:flex-row"
      )}>
        
        {/* COLUMN 0: Left Navigation Sidebar (Desktop only) - Stretches from top to bottom */}
        <LeftActivityBar />

        {/* Right side content pane wrapping header, toolbar and workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {pathname !== '/dashboard' && <SystemHeader />}


          {/* MAIN DYNAMIC PAGE WORKSPACE */}
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 flex flex-col overflow-y-auto h-full px-4 pb-6 pt-4">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>

          {/* FLOATING MESSENGER-STYLE CHAT BUBBLE & POPUP (Desktop only) */}
          {showFloatingBubble && (
            <div className="hidden lg:block fixed bottom-6 right-6 z-50">
              {/* Floating Chat Bubble Button */}
              {!isChatOpen && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="size-14 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative group"
                >
                  <MessageSquare className="size-6 text-background" />
                  
                  {/* Glowing active ping dot */}
                  <span className="absolute -top-0.5 -right-0.5 flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-emerald-500 border border-card"></span>
                  </span>

                  {/* Tooltip on hover */}
                  <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-card border border-border px-3 py-1.5 rounded-lg text-[0.7rem] font-sans font-bold text-foreground shadow-md whitespace-nowrap">
                    Trợ lý Minh
                  </span>
                </button>
              )}

              {/* Messenger-style Popup Chat Window */}
              {isChatOpen && (
                <div className="w-[360px] h-[500px] bg-card/95 backdrop-blur border border-border/80 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                  
                  {/* Chat Header (Messenger Style) */}
                  <div className="bg-muted/40 border-b border-border/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-serif text-sm font-black text-primary">
                        M
                        <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 border border-card" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans text-[0.8rem] font-bold text-foreground leading-none">
                          Điều phối viên Minh
                        </h4>
                        <span className="font-sans text-[0.6rem] text-muted-foreground mt-0.5 block">
                          Đang hoạt động
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Thu nhỏ"
                      >
                        <Minimize2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Body (renders AssistantPanel without header) */}
                  <div className="flex-1 overflow-hidden">
                    <AssistantPanel showHeader={false} className="h-full" />
                  </div>

                </div>
              )}
            </div>
          )}

          {/* BOTTOM NAVIGATION BAR (Hidden on Desktop) */}
          <div className="mt-auto lg:hidden">
            <BottomNav />
          </div>

        </div>

      </div>

    </div>
  )
}
