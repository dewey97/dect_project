'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmailItem {
  id: string
  sender: string
  subject: string
  body: string
  timestamp: string
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'UNCLASSIFIED'
  integrity: string
}

interface EmailViewerProps {
  emails: EmailItem[]
}

export function EmailViewer({ emails }: EmailViewerProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const activeEmail = emails.find((e) => e.id === selectedEmailId)

  const CLASSIFICATION_LABELS = {
    RESTRICTED: 'BỊ HẠN CHẾ',
    CONFIDENTIAL: 'BẢO MẬT',
    UNCLASSIFIED: 'THƯỜNG'
  }

  return (
    <div className="flex-1 flex flex-col min-h-[300px]">
      {!selectedEmailId ? (
        // Email list
        <div className="flex flex-col gap-2.5 font-sans">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className="rounded-lg border border-border bg-card/65 p-3 hover:border-primary/20 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start font-sans text-[0.55rem] text-muted-foreground">
                <span>NGƯỜI GỬI: {email.sender}</span>
                <span>{email.timestamp}</span>
              </div>
              <h5 className="text-xs font-bold text-foreground mt-1 truncate">{email.subject}</h5>
              <p className="text-[0.65rem] text-muted-foreground truncate mt-0.5">{email.body}</p>
              
              <div className="mt-2.5 pt-1.5 border-t border-border/20 flex justify-between items-center text-[0.55rem] font-sans">
                <span className={cn(
                  'font-bold tracking-wider',
                  email.classification === 'RESTRICTED' && 'text-destructive/80',
                  email.classification === 'CONFIDENTIAL' && 'text-amber-500/80',
                  email.classification === 'UNCLASSIFIED' && 'text-muted-foreground'
                )}>
                  PHÂN LOẠI MẬT: {CLASSIFICATION_LABELS[email.classification]}
                </span>
                <span className="text-emerald-500 font-medium">TÌNH TRẠNG: {email.integrity}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Reading pane detail
        <div className="flex flex-col gap-3 font-sans">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <button
              onClick={() => setSelectedEmailId(null)}
              className="flex items-center gap-1 font-sans text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all mr-2"
            >
              <ArrowLeft className="size-3.5" /> Quay lại
            </button>
            <span className="text-sm font-bold truncate">{activeEmail?.subject}</span>
          </div>

          <div className="rounded-lg border border-border bg-card/45 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 border-b border-border/25 pb-3 font-sans text-[0.6rem] text-muted-foreground">
              <div>
                <span className="block">TỪ: {activeEmail?.sender}</span>
                <span className="block mt-0.5">NGÀY GỬI: {activeEmail?.timestamp}</span>
              </div>
              <div className="text-right">
                <span className={cn(
                  'font-bold uppercase tracking-wider block',
                  activeEmail?.classification === 'RESTRICTED' && 'text-destructive',
                  activeEmail?.classification === 'CONFIDENTIAL' && 'text-amber-500',
                  activeEmail?.classification === 'UNCLASSIFIED' && 'text-foreground'
                )}>
                  {activeEmail ? CLASSIFICATION_LABELS[activeEmail.classification] : ''}
                </span>
                <span className="block mt-0.5 text-emerald-500 font-semibold">Tài liệu nguyên vẹn</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap pt-1">
              {activeEmail?.body}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
