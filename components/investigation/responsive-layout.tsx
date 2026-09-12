'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { PageTransition } from '@/components/investigation/page-transition'
import { cn } from '@/lib/utils'
import type { Case, EvidenceDevice, Evidence, TraceCard } from '@/lib/types'

interface ResponsiveLayoutProps {
  children: ReactNode
  activeCase?: Case
  devices?: EvidenceDevice[]
  evidence?: Evidence[]
  traceCards?: TraceCard[]
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const pathname = usePathname()
  const isEvidenceSimulator = pathname.startsWith('/evidence/')

  return (
    <div suppressHydrationWarning className="flex h-dvh w-full justify-center items-center overflow-hidden bg-[#0d0c0a]">
      <main
        suppressHydrationWarning
        className={cn(
          "w-full h-full flex flex-col",
          isEvidenceSimulator ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}

