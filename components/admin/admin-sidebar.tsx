'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Folders, Users, Clock, Map, Settings, LogOut, Search, ArrowLeft, Edit3, MessageSquare, Play, Bell, Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getUnreadFeedbackCount } from '@/lib/actions/feedback-actions'

const globalNavItems = [
  { name: 'Dashboard', href: '/studio', icon: LayoutDashboard },
  { name: 'Cases', href: '/studio/cases', icon: Folders },
  { name: 'Players', href: '/studio/players', icon: Users },
  { name: 'Feedbacks', href: '/studio/feedbacks', icon: MessageSquare },
  { name: 'Settings', href: '/studio/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getUnreadFeedbackCount().then(res => {
      if (res.success) setUnreadCount(res.count)
    })
  }, [pathname])
  
  // Logic to determine if we are inside a Case Workspace
  // Example path: /studio/cases/123/overview
  const segments = pathname.split('/').filter(Boolean)
  const isCaseWorkspace = segments[0] === 'studio' && segments[1] === 'cases' && segments.length >= 4
  const caseId = isCaseWorkspace ? segments[2] : null

  const caseNavItems = caseId ? [
    { name: 'Story Overview', href: `/studio/cases/${caseId}/overview`, icon: Edit3 },
    { name: 'Timeline', href: `/studio/cases/${caseId}/timeline`, icon: Clock },
    { name: 'Relationship', href: `/studio/cases/${caseId}/relationships`, icon: Network },
    { name: 'Evidence Board', href: `/studio/cases/${caseId}/evidence`, icon: Search },
    { name: 'Locations', href: `/studio/cases/${caseId}/locations`, icon: Map },
  ] : []

  return (
    <aside className="w-64 border-r border-border/40 bg-zinc-950/50 backdrop-blur-sm flex flex-col h-full z-20 relative transition-all duration-300">
      
      {/* HEADER */}
      <div className="p-6 h-24 flex items-center shrink-0 border-b border-border/20">
        {isCaseWorkspace ? (
          <div className="flex flex-col gap-3 w-full">
            <Link href="/studio/cases" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors w-fit">
              <ArrowLeft className="size-3" /> Back to Cases
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                <Folders className="size-3 text-primary" />
              </div>
              <h1 className="font-semibold text-sm leading-tight text-zinc-100 truncate">Case Workspace</h1>
            </div>
          </div>
        ) : (
          <Link href="/studio" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="size-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="font-mono text-primary font-bold text-xs tracking-tighter">AS</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight text-zinc-100">Admin Studio</h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Creator Mode</p>
            </div>
          </Link>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {isCaseWorkspace && (
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Case Tools</p>
          </div>
        )}
        
        {(isCaseWorkspace ? caseNavItems : globalNavItems).map((item) => {
          // Dashboard ('/studio') needs exact match, others can use startsWith
          const isActive = item.href === '/studio' 
            ? pathname === '/studio'
            : pathname.startsWith(item.href)
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                isActive 
                  ? "bg-zinc-800/80 text-zinc-100 shadow-sm border border-white/5" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              <item.icon className={cn("size-4", isActive ? "text-primary" : "text-zinc-500")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-border/40 space-y-2">
        {/* Launch Game / Playtest */}
        <Link 
          href={caseId ? `/play/${caseId}` : '/studio/cases'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all text-xs tracking-wider"
        >
          <Play className="size-4" fill="currentColor" />
          {caseId ? 'PLAYTEST CASE' : 'SELECT CASE TO PLAY'}
        </Link>

        <div className="flex items-center gap-2 pt-2">
          {/* Exit Studio */}
          <Link href="/" className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <LogOut className="size-4" />
            Exit
          </Link>
          
          {/* Notifications */}
          <Link href="/studio/feedbacks" className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800/50">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 animate-pulse border border-zinc-950" />
            )}
          </Link>
        </div>
      </div>
    </aside>
  )
}
