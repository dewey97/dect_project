'use client'

import { cn } from '@/lib/utils'

export interface DocumentItem {
  id: string
  title: string
  content: string
  meta: string
  damaged?: boolean
}

interface DocumentViewerProps {
  documents: DocumentItem[]
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  return (
    <div className="flex flex-col gap-3 font-serif">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={cn(
            'bg-aged-paper rounded-lg border border-amber-900/25 p-4 shadow-md flex flex-col gap-2 relative',
            doc.damaged && 'opacity-85'
          )}
        >
          <div className={cn(
            'absolute top-2 right-2 font-mono text-[0.5rem] uppercase tracking-widest',
            doc.damaged ? 'text-red-800/60' : 'text-amber-900/60'
          )}>
            {doc.meta}
          </div>
          <h5 className={cn(
            'font-sans text-xs font-bold border-b border-amber-900/20 pb-1 uppercase tracking-wide',
            doc.damaged && 'text-red-900/85'
          )}>
            {doc.title}
          </h5>
          {doc.damaged ? (
            <p className="text-xs leading-relaxed text-amber-950/80 pt-1 font-mono text-[0.7rem] break-all">
              {doc.content}
            </p>
          ) : (
            <p className="text-xs leading-relaxed italic text-amber-950/90 pt-1 whitespace-pre-wrap">
              "{doc.content}"
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
