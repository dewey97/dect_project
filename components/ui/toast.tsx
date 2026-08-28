'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'

export type ToastMessage = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let toastListeners: ((toasts: ToastMessage[]) => void)[] = []
let activeToasts: ToastMessage[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...activeToasts]))
}

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).substring(2)
    activeToasts.push({ id, type: 'success', message })
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 4000)
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substring(2)
    activeToasts.push({ id, type: 'error', message })
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 5000)
  },
  info: (message: string) => {
    const id = Math.random().toString(36).substring(2)
    activeToasts.push({ id, type: 'info', message })
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 4000)
  },
  dismiss: (id: string) => {
    activeToasts = activeToasts.filter(t => t.id !== id)
    notifyListeners()
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      toastListeners = toastListeners.filter(l => l !== setToasts)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[3000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-2xl backdrop-blur-md text-sm animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            t.type === 'success' ? 'bg-zinc-950/95 border-emerald-500/30 text-emerald-300' :
            t.type === 'error' ? 'bg-zinc-950/95 border-rose-500/30 text-rose-300' :
            'bg-zinc-950/95 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {t.type === 'success' && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="size-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="size-4 text-blue-400 shrink-0" />}
            <span className="font-medium text-zinc-100">{t.message}</span>
          </div>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white ml-2"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
