'use client'

import { FileText, FileDown, AlertTriangle, Image as ImageIcon, Lock, FileCode, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileItem {
  id: string
  filename: string
  kind: 'pdf' | 'zip' | 'image' | 'video' | 'binary' | 'unknown' | 'audio'
  size: string
  status: 'secured' | 'corrupted' | 'encrypted' | 'analyzing'
  integrity: string
}

interface FileExplorerProps {
  files: FileItem[]
  onDownload?: (file: FileItem) => void
}

const FILE_ICON = {
  pdf: FileText,
  zip: AlertTriangle,
  image: ImageIcon,
  video: FileCode, // fallback
  binary: FileCode,
  unknown: FileCode,
  audio: FileCode,
}

export function FileExplorer({ files, onDownload }: FileExplorerProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {files.map((file) => {
        const Icon = FILE_ICON[file.kind] || FileCode
        const isCorrupted = file.status === 'corrupted'
        const isEncrypted = file.status === 'encrypted'

        return (
          <div
            key={file.id}
            onClick={() => !isCorrupted && onDownload?.(file)}
            className={cn(
              'flex items-center justify-between rounded-lg border p-3 transition-colors',
              isCorrupted 
                ? 'border-destructive/25 bg-destructive/5'
                : 'border-border bg-card/45 hover:border-primary/20 cursor-pointer'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded border',
                isCorrupted ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-accent/40 border-border/80 text-primary'
              )}>
                {isEncrypted ? <Lock className="size-5" /> : <Icon className="size-5" />}
              </div>
              <div className="min-w-0">
                <span className={cn(
                  'block text-xs font-bold truncate',
                  isCorrupted && 'text-destructive'
                )}>
                  {file.filename}
                </span>
                <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">
                  {file.kind.toUpperCase()} // {file.size} // {file.integrity}
                </span>
              </div>
            </div>
            
            {!isCorrupted && !isEncrypted && (
              <FileDown className="size-4 text-muted-foreground group-hover:text-foreground" />
            )}
          </div>
        )
      })}
    </div>
  )
}
