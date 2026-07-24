'use client'

import { useState } from 'react'
import { MessageSquare, ArrowLeft, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  sender: string
  role: 'sent' | 'received' | 'corrupted'
  text: string
  timestamp: string
}

export interface ChatThread {
  id: string
  name: string
  timestamp: string
  previewText: string
  recoveryProgress: number
  messages: ChatMessage[]
  unread?: boolean
}

interface ConversationViewerProps {
  threads: ChatThread[]
}

export function ConversationViewer({ threads }: ConversationViewerProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const activeThread = threads.find((t) => t.id === selectedThreadId)

  return (
    <div className="flex-1 flex flex-col min-h-[300px]">
      {!selectedThreadId ? (
        // Thread list
        <div className="flex flex-col gap-2.5">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className="flex items-center gap-3 rounded-lg border border-border/80 bg-card/60 p-3 hover:border-primary/30 cursor-pointer transition-colors"
            >
              <div className="flex size-10 items-center justify-center rounded bg-accent">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold">{thread.name}</span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">{thread.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{thread.previewText}</p>
              </div>
              {thread.unread ? (
                <span className="flex size-2 rounded-full bg-primary" title="Chưa đọc" />
              ) : (
                <span className="font-mono text-[0.55rem] text-muted-foreground border border-border px-1 py-0.5 rounded bg-muted/30">
                  {thread.recoveryProgress}% KHÔI PHỤC
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Conversation Detail view
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-3">
            <button
              onClick={() => setSelectedThreadId(null)}
              className="flex items-center gap-1 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all mr-2"
            >
              <ArrowLeft className="size-3.5" /> Quay lại
            </button>
            <span className="text-sm font-bold">{activeThread?.name}</span>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-end pb-4 font-sans">
            {activeThread?.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col max-w-[80%] rounded-lg p-3 border',
                  msg.role === 'received' && 'self-start bg-card/50 border-border',
                  msg.role === 'sent' && 'self-end bg-primary/5 border-primary/25 text-right',
                  msg.role === 'corrupted' && 'self-start bg-destructive/5 border-destructive/20 bg-destructive/5'
                )}
              >
                <span className={cn(
                  'font-mono text-[0.55rem] uppercase mb-1',
                  msg.role === 'sent' ? 'text-primary/70' : 'text-muted-foreground'
                )}>
                  {msg.role === 'corrupted' ? 'PHÂN ĐOẠN DỮ LIỆU BỊ HỎNG' : `${msg.sender.toUpperCase()} // ${msg.timestamp}`}
                </span>
                
                {msg.role === 'corrupted' ? (
                  <>
                    <p className="font-mono text-[0.7rem] leading-relaxed text-muted-foreground select-none">
                      {msg.text}
                    </p>
                    <span className="text-[0.55rem] text-destructive font-semibold font-mono mt-1 flex items-center gap-1">
                      <AlertTriangle className="size-3" /> LỖI TOÀN VẸN: PHÂN VÙNG BỊ HỦY HOẠI
                    </span>
                  </>
                ) : (
                  <p className="text-xs leading-relaxed text-foreground">{msg.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
