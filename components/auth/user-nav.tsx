'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, UserCircle, Terminal } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth]) // <- fix dependency warning safely

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-9 h-9 animate-pulse bg-muted rounded-full" />
    )
  }

  if (user) {
    const firstLetter = user.email?.charAt(0).toUpperCase() || 'U'
    const isSuperAdmin = user.app_metadata?.role === 'super_admin'
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          title="Tài khoản của bạn"
        >
          {firstLetter}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border/60 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Đã đăng nhập bằng</p>
                <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
              </div>
              {isSuperAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive-foreground ml-2">
                  ADMIN
                </span>
              )}
            </div>
            
            <div className="p-1 flex flex-col gap-1">
              {isSuperAdmin && (
                <button 
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/studio')
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors text-left font-medium border border-indigo-500/20 mb-1"
                >
                  <Terminal className="w-4 h-4" />
                  Creator Studio
                </button>
              )}
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-not-allowed opacity-50">
                <UserCircle className="w-4 h-4" />
                Hồ sơ cá nhân
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-not-allowed opacity-50">
                <Settings className="w-4 h-4" />
                Cài đặt
              </button>
            </div>
            
            <div className="border-t border-border/60 mt-1 p-1">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-left text-destructive font-medium"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <button 
      onClick={() => router.push('/login')}
      className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors cursor-pointer flex items-center justify-center"
      title="Đăng nhập"
    >
      <User className="size-5" />
    </button>
  )
}
