'use client'

import { useState } from 'react'
import { Image as ImageIcon, ArrowLeft, MapPin, HardDrive, Info, Share, Trash2, Heart } from 'lucide-react'
import type { Photo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PhotosAppProps {
  photos: Photo[]
}

export function PhotosApp({ photos }: PhotosAppProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedPhoto ? (
        /* PHOTO DETAIL VIEW */
        <div className="flex flex-col h-full animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Thư viện</span>
            </button>
            <div className="text-center">
              <div className="text-[11px] font-semibold text-white">Ảnh vật chứng</div>
              <div className="text-[9px] text-[#8E8E93]">Hôm nay • 20:40</div>
            </div>
            <button className="text-[#0A84FF] p-1">
              <Heart className="size-4" />
            </button>
          </div>

          {/* Photo Display */}
          <div className="flex-1 bg-[#09090B] flex flex-col items-center justify-center p-3 overflow-hidden">
            <div className="relative w-full max-h-[220px] rounded-xl overflow-hidden border border-[#2C2C2E] bg-[#18181B] flex flex-col items-center justify-center shadow-lg">
              <img
                src={`/photos/${selectedPhoto.filename.replace(/\.jpg$/, '.png')}`}
                alt={selectedPhoto.filename}
                className="w-full h-full object-contain max-h-[220px]"
                onError={(e) => {
                  // Fallback if image not directly in public/photos/
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div className="p-4 text-center">
                <ImageIcon className="size-8 text-[#8E8E93] mx-auto mb-1.5 opacity-60" />
                <span className="text-[11px] font-mono text-[#D1D1D6]">{selectedPhoto.filename}</span>
              </div>
            </div>

            {/* EXIF Metadata Card */}
            <div className="w-full mt-3 p-3 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-2">
              <div className="flex items-center justify-between text-[11px] border-b border-[#2C2C2E] pb-1.5 font-mono">
                <span className="text-[#8E8E93] flex items-center gap-1.5">
                  <HardDrive className="size-3.5 text-[#0A84FF]" /> Dung lượng
                </span>
                <span className="text-white font-semibold">{selectedPhoto.size}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5 font-mono">
                <span className="text-[#8E8E93] flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-[#FF453A]" /> Vị trí chụp
                </span>
                <span className="text-white font-semibold text-right max-w-[150px] truncate">
                  {selectedPhoto.location}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-11 bg-[#161618] border-t border-[#2C2C2E] flex items-center justify-between px-6 shrink-0 text-[#0A84FF]">
            <Share className="size-4" />
            <Heart className="size-4" />
            <Info className="size-4" />
            <Trash2 className="size-4 text-[#FF453A]" />
          </div>
        </div>
      ) : (
        /* PHOTO GRID VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <span className="text-[20px] font-bold tracking-tight text-white">Thư viện ảnh</span>
            <div className="text-[11px] text-[#8E8E93] mt-0.5">{photos.length} ảnh đã trích xuất</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 pb-10">
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="aspect-square rounded-lg bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden hover:opacity-80 active:scale-95 cursor-pointer flex flex-col items-center justify-center p-1 relative group"
                >
                  <img
                    src={`/photos/${photo.filename.replace(/\.jpg$/, '.png')}`}
                    alt={photo.filename}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <ImageIcon className="size-5 text-[#8E8E93] opacity-40 group-hover:text-[#0A84FF] transition-colors" />
                  <span className="text-[8px] font-mono text-[#8E8E93] truncate w-full text-center mt-1">
                    {photo.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
