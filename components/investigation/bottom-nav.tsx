'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Investigation navigation"
      className="pb-safe fixed bottom-0 left-0 right-0 w-full z-30 rounded-t-2xl border-t border-border/80 bg-card/85 backdrop-blur-md shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
    >
      <ul className="flex items-stretch justify-around px-2 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200',
                  'active:bg-accent/40',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {/* Active Indicator: Sleek evidence-amber line at top */}
                <span
                  className={cn(
                    'absolute top-0 h-0.5 w-10 rounded-full transition-all duration-300',
                    active ? 'bg-primary shadow-[0_0_10px_var(--primary)] opacity-100' : 'opacity-0 scale-x-50',
                  )}
                />
                
                {/* Active Background Glow */}
                <span
                  className={cn(
                    'absolute inset-x-4 inset-y-1 -z-10 rounded-lg bg-primary/5 transition-opacity duration-300',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />

                <Icon
                  className={cn(
                    'size-5 transition-transform duration-200 group-active:scale-95',
                    active ? 'scale-105' : ''
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
