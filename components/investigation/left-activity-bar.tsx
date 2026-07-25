'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { LogOut, FolderOpen } from 'lucide-react'

export function LeftActivityBar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="System navigation sidebar"
      className="hidden lg:flex w-[72px] h-full flex-col items-center justify-between py-5 bg-card/25 border-r border-border/50 select-none shrink-0"
    >
      {/* Top Section: Brand Emblem */}
      <Link href="/" className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity group">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[inset_0_0_10px_rgba(199,145,55,0.1)] relative group-hover:border-primary/45 transition-colors">
          <span className="font-serif text-lg font-black tracking-tighter">N</span>
          <span className="absolute bottom-1 right-1 size-1.5 rounded-full bg-primary" />
        </div>
        <span className="font-sans text-[0.5rem] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
          Nocturne
        </span>
      </Link>

      {/* Middle Section: Navigation Items */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'group relative flex w-full h-[62px] flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active Indicator Line on the left */}
              <span
                className={cn(
                  'absolute left-0 w-[3px] rounded-r-md bg-primary transition-all duration-300',
                  active ? 'h-8 shadow-[0_0_8px_var(--primary)] opacity-100' : 'h-0 opacity-0'
                )}
              />

              {/* Active Background Glow */}
              <span
                className={cn(
                  'absolute inset-x-2 inset-y-1 -z-10 rounded-lg bg-primary/5 transition-opacity duration-300',
                  active ? 'opacity-100' : 'opacity-0'
                )}
              />

              <Icon
                className={cn(
                  'size-5 transition-transform duration-200 group-hover:scale-105 active:scale-95',
                  active ? 'scale-105' : ''
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              
              <span className="font-sans text-[0.55rem] font-bold tracking-tight text-center max-w-[64px] truncate leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section: Exit Case / Back to Dashboard */}
      <div className="w-full flex justify-center">
        <Link
          href="/dashboard"
          title="Thoát hồ sơ"
          className="group relative flex w-full h-[54px] flex-col items-center justify-center gap-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
        >
          <LogOut className="size-4.5 transition-transform group-hover:-translate-x-0.5 active:scale-95" />
          <span className="font-sans text-[0.55rem] font-bold tracking-wider">
            Thoát
          </span>
        </Link>
      </div>
    </aside>
  )
}
