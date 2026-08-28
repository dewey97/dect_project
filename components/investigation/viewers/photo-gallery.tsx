'use client'

import { Image as ImageIcon, AlertTriangle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhotoItem {
  id: string
  filename: string
  size: string
  location: string
  status: 'recovered' | 'corrupted' | 'encrypted'
}

interface PhotoGalleryProps {
  photos: PhotoItem[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className={cn(
            'group relative rounded-lg border bg-card overflow-hidden flex flex-col',
            photo.status === 'corrupted' ? 'border-destructive/20 bg-destructive/5' : 'border-border'
          )}
        >
          {/* Thumbnail Preview Area */}
          <div className="h-28 bg-accent/40 flex flex-col items-center justify-center relative p-3 text-center">
            {photo.status === 'recovered' && (
              <>
                <ImageIcon className="size-8 text-primary" />
                <div className="absolute top-1.5 right-1.5 font-mono text-[0.5rem] bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-1 rounded uppercase font-bold">
                  Khôi phục
                </div>
              </>
            )}

            {photo.status === 'corrupted' && (
              <>
                <AlertTriangle className="size-6 text-destructive/70 mb-1" />
                <span className="font-mono text-[0.55rem] text-destructive uppercase tracking-wider font-bold">
                  DỮ_LIỆU_HỎNG
                </span>
              </>
            )}

            {photo.status === 'encrypted' && (
              <>
                <Lock className="size-6 text-muted-foreground/80 mb-1" />
                <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider font-bold">
                  BỊ_MÃ_HÓA
                </span>
              </>
            )}
          </div>

          {/* Details footer */}
          <div className="p-2 border-t border-border bg-muted/20 font-mono text-[0.55rem] text-muted-foreground">
            <span className="block text-foreground truncate">{photo.filename}</span>
            <span>
              {photo.size} // {photo.location}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
