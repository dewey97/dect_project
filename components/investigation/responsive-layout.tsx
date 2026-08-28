'use client'

import { ReactNode } from 'react'
import { PageTransition } from '@/components/investigation/page-transition'

interface ResponsiveLayoutProps {
  children: ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="flex h-dvh w-full justify-center items-center overflow-hidden bg-[#0d0c0a]">
      <main className="w-full h-full flex flex-col overflow-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}

