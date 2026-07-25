'use client'

import Link from 'next/link'
import { Target } from 'lucide-react'
import { BrandMark } from '@/components/investigation/brand-mark'
import { CASES } from '@/lib/mock-data'

export function SystemHeader() {
  // Find the active case directly
  const activeCase = CASES.find((c) => c.status === 'active')

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
      {/* Brand & Case Overview Row */}
      <div className="flex flex-col gap-2.5 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">

        {/* Case Info Dashboard Panel */}
        {activeCase ? (
          <div className="rounded-lg border border-border/50 bg-card/40 p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="font-mono text-[0.65rem] text-primary font-bold uppercase tracking-wider">
                  Mã hồ sơ: {activeCase.code}
                </span>
                <h2 className="mt-0.5 font-sans text-base font-bold tracking-tight text-foreground truncate">
                  {activeCase.title}
                </h2>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-mono text-xs font-semibold text-primary">
                  {activeCase.progress}%
                </span>
                <span className="font-sans text-[0.55rem] text-muted-foreground font-semibold uppercase tracking-wider">
                  Tiến độ
                </span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${activeCase.progress}%` }}
              />
            </div>

            {/* Objective & Status banner */}
            <div className="mt-2.5 flex flex-col gap-1 border-t border-border/40 pt-2 text-[0.7rem]">
              <div className="flex items-start gap-1.5">
                <Target className="size-3.5 text-primary shrink-0 mt-0.5 animate-pulse" />
                <p className="font-sans leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground font-mono text-[0.65rem] tracking-wider mr-1">
                    MỤC TIÊU:
                  </span>
                  {activeCase.objective || activeCase.briefing}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/50 p-3 text-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              KHÔNG PHÁT HIỆN VỤ ÁN HOẠT ĐỘNG
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
