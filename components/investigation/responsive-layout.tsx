'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { EvidencePanel } from './panels/evidence-panel'
import { TracePanel } from './panels/trace-panel'
import { AssistantPanel } from './panels/assistant-panel'
import type { Case, EvidenceDevice, Evidence, TraceCard } from '@/lib/types'
import { BottomNav } from '@/components/investigation/bottom-nav'
import { PageTransition } from '@/components/investigation/page-transition'
import { SystemHeader } from '@/components/investigation/system-header'
import { LeftActivityBar } from './left-activity-bar'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/investigation/settings-context'

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
  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    showTechDetails,
    setShowTechDetails
  } = useSettings()

  // Determine what to display on the right column of the desktop layout to avoid duplication
  const showTraceOnRight = pathname === '/assistant'
  const isConclusionPage = pathname?.startsWith('/assistant/conclusion')

  // Dynamic grid template columns class based on sidebar open states
  const gridColumnsClass = cn(
    "relative z-10 flex-1 flex flex-col lg:grid lg:gap-6 overflow-hidden",
    leftSidebarOpen && rightSidebarOpen && "lg:grid-cols-[300px_1fr_330px]",
    leftSidebarOpen && !rightSidebarOpen && "lg:grid-cols-[300px_1fr]",
    !leftSidebarOpen && rightSidebarOpen && "lg:grid-cols-[1fr_330px]",
    !leftSidebarOpen && !rightSidebarOpen && "lg:grid-cols-[1fr]"
  )

  return (
    <div className="flex min-h-dvh w-full justify-center">
      
      {/* MOBILE LAYOUT VIEWPORT CONTAINER (max-w-[30rem] on mobile, edge-to-edge on desktop) */}
      <div className={cn(
        "relative flex min-h-dvh w-full bg-background transition-all duration-300",
        "max-w-[30rem] border-x border-border lg:border-none lg:max-w-none lg:w-screen lg:h-dvh lg:overflow-hidden flex-col lg:flex-row"
      )}>
        
        {/* COLUMN 0: Left Navigation Sidebar (Desktop only) - Stretches from top to bottom */}
        <LeftActivityBar />

        {/* Right side content pane wrapping header, toolbar and grid workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          <SystemHeader />

        {/* WORKSPACE TOOLBAR & PROGRESS FLOW (Only shown on Desktop) */}
        <div className="hidden lg:flex items-center justify-between border-b border-border/40 py-2.5 px-4 bg-card/10 text-[0.65rem] font-mono select-none z-20">
          {/* Left Side: Left Sidebar Toggle */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="flex items-center gap-1 border border-primary/20 bg-primary/5 rounded px-2.5 py-1 hover:bg-primary/10 transition-colors cursor-pointer text-primary font-bold"
          >
            {leftSidebarOpen ? '◀ Ẩn Tang Vật' : '▶ Hiện Tang Vật'}
          </button>

          {/* Center: System Status Indicator */}
          <div className="flex items-center gap-2 text-primary/80 font-mono text-[0.6rem] tracking-wider">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
            </span>
            <span>SECURE WORKSPACE // CONSOLE ACTIVE</span>
          </div>

          {/* Right Side: Tech Details Toggle & Right Sidebar Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className={cn(
                "flex items-center gap-1.5 border rounded px-2.5 py-1 transition-colors cursor-pointer font-bold",
                showTechDetails 
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" 
                  : "border-border bg-muted/10 text-muted-foreground"
              )}
            >
              {showTechDetails ? '☑ Chi tiết pháp y: Bật' : '☐ Chi tiết pháp y: Tắt'}
            </button>

            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="flex items-center gap-1 border border-primary/20 bg-primary/5 rounded px-2.5 py-1 hover:bg-primary/10 transition-colors cursor-pointer text-primary font-bold"
            >
              {rightSidebarOpen ? 'Ẩn Trợ Lý ▶' : '◀ Hiện Trợ Lý'}
            </button>
          </div>
        </div>

        {/* RESPONSIVE GRID LAYOUT WRAPPER */}
        <div className={gridColumnsClass}>
          {/* COLUMN 1: Evidence List Panel (Hidden on Mobile Page routes, always shown on Desktop) */}
          {leftSidebarOpen && (
            <aside className="hidden lg:flex lg:flex-col border-r border-border/60 pr-6 overflow-y-auto h-full pb-6">
              <span className="label-system mb-4 text-primary block border-b border-primary/20 pb-1 font-bold">
                DANH MỤC HỒ SƠ TANG VẬT
              </span>
              <EvidencePanel activeCase={activeCase} devices={devices} evidence={evidence} />
            </aside>
          )}

          {/* COLUMN 2: Dynamic Page Workspace (Visible on both Mobile and Desktop) */}
          <main className="flex-1 flex flex-col overflow-y-auto h-full px-1 pb-6">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* COLUMN 3: Context Panel (Hidden on Mobile Page routes, always shown on Desktop) */}
          {rightSidebarOpen && (
            <aside className="hidden lg:flex lg:flex-col border-l border-border/60 pl-6 overflow-y-auto h-full pb-6">
              {showTraceOnRight ? (
                <>
                  <span className="label-system mb-4 text-primary block border-b border-primary/20 pb-1 font-bold">
                    KHO LƯU TRỮ TRACE
                  </span>
                  <TracePanel cards={traceCards} />
                </>
              ) : (
                <>
                  <span className="label-system mb-4 text-primary block border-b border-primary/20 pb-1 font-bold">
                    ĐIỀU PHỐI VIÊN MINH
                  </span>
                  <AssistantPanel showHeader={false} />
                </>
              )}
            </aside>
          )}

        </div>

        {/* BOTTOM NAVIGATION BAR (Hidden on Desktop) */}
        <div className="mt-auto lg:hidden">
          <BottomNav />
        </div>

        </div>

      </div>

    </div>
  )
}
