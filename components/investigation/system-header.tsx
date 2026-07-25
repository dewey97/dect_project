'use client'

import Link from 'next/link'
import { Target } from 'lucide-react'
import { BrandMark } from '@/components/investigation/brand-mark'
import { CASES } from '@/lib/mock-data'

export function SystemHeader() {
  // Find the active case directly
  const activeCase = CASES.find((c) => c.status === 'active')

  return (
    <header className="sticky top-0 z-30 border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="px-4 py-3.5 flex items-center justify-between">
        {activeCase ? (
          <h2 className="font-sans text-xs font-black tracking-[0.25em] text-primary uppercase">
            CHUYÊN ÁN: {activeCase.title.replace('Vụ án ', '')}
          </h2>
        ) : (
          <h2 className="font-sans text-xs font-black tracking-[0.25em] text-muted-foreground uppercase">
            CHƯA CÓ CHUYÊN ÁN HOẠT ĐỘNG
          </h2>
        )}
      </div>
    </header>
  )
}
