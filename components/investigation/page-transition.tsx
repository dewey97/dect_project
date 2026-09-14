'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      suppressHydrationWarning
      className="animate-fade-slide-up w-full h-full overflow-hidden min-h-0 min-w-0"
    >
      {children}
    </div>
  )
}
