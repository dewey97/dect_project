'use client'

import { useState } from 'react'
import { Image as ImageIcon, ArrowLeft, ChevronLeft, MapPin, HardDrive, Info, Share, Trash2, Heart, Folder } from 'lucide-react'
import type { Photo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PhotosAppProps {
  photos: Photo[]
  onBackToHome?: () => void
}

export function PhotosApp({ photos, onBackToHome }: PhotosAppProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showExifInfo, setShowExifInfo] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'deleted'>('all')

  const deletedPhotos: Photo[] = [
    {
      id: 'p-deleted-01',
      filename: 'trich_do_dat_14_bo_song_sua.jpg',
      caption: 'Ảnh trích đo thửa đất 14 Bờ Sông (Đã chỉnh sửa diện tích lên 120m2)',
      timestamp: '23/07/2016 17:45',
      size: '3.8 MB',
      location: 'Ban QLDA Quy Hoạch Đống Đa',
      status: 'recovered'
    }
  ]

  const currentPhotos = activeTab === 'all' ? photos : deletedPhotos

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedPhoto ? (
        /* PHOTO DETAIL VIEW */
        <div className="flex flex-col h-full animate-in fade-in-50 duration-200 relative">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => {
                setSelectedPhoto(null)
                setShowExifInfo(false)
              }}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Thư viện</span>
            </button>
            <div className="text-center">
              <div className="text-[11px] font-semibold text-white">Ảnh vật chứng</div>
              <div className="text-[9px] text-[#8E8E93]">{selectedPhoto.timestamp}</div>
            </div>
            <button
              onClick={() => setShowExifInfo(!showExifInfo)}
              className={cn('p-1 transition-colors', showExifInfo ? 'text-[#0A84FF]' : 'text-[#8E8E93]')}
              title="Xem thông số EXIF"
            >
              <Info className="size-4" />
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

          {/* EXIF Metadata Drawer Modal */}
          {showExifInfo && (
            <div className="absolute inset-x-0 bottom-11 bg-[#1C1C1E]/95 backdrop-blur-md border-t border-[#2C2C2E] p-3.5 space-y-2.5 animate-in slide-in-from-bottom-4 shadow-2xl z-30">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0A84FF]">
                <span>THÔNG SỐ CAMERA EXIF</span>
                <button onClick={() => setShowExifInfo(false)} className="text-[#8E8E93] hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-[#D1D1D6]">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[#8E8E93] block text-[9px]">THIẾT BỊ</span>
                  <span className="font-bold text-white">Apple iPhone 5s</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[#8E8E93] block text-[9px]">CẢM BIẾN</span>
                  <span className="font-bold text-white">8MP iSight (1.5µm)</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[#8E8E93] block text-[9px]">KHẨU ĐỘ / TIÊU CỰ</span>
                  <span className="font-bold text-white">f/2.2 • 29mm</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[#8E8E93] block text-[9px]">TỐC ĐỘ / ISO</span>
                  <span className="font-bold text-white">1/30s • ISO 64</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="h-11 bg-[#161618] border-t border-[#2C2C2E] flex items-center justify-between px-6 shrink-0 text-[#0A84FF]">
            <Share className="size-4" />
            <Heart className="size-4" />
            <button onClick={() => setShowExifInfo(!showExifInfo)} className={cn(showExifInfo && 'text-white')}>
              <Info className="size-4" />
            </button>
            <Trash2 className="size-4 text-[#FF453A]" />
          </div>
        </div>
      ) : (
        /* PHOTO GRID VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-between mb-1">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#0A84FF] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát ứng dụng về Màn hình chính"
                >
                  <ChevronLeft className="size-4" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <span className="w-12" />
              )}
              <span className="text-[17px] font-bold tracking-tight text-white">Thư viện ảnh</span>
              <span className="w-12" />
            </div>

            {/* Album selector tabs */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-3 py-1 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer',
                  activeTab === 'all'
                    ? 'bg-[#0A84FF] text-white shadow'
                    : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white'
                )}
              >
                Tất cả ảnh ({photos.length})
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={cn(
                  'px-3 py-1 rounded-full text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1',
                  activeTab === 'deleted'
                    ? 'bg-[#FF453A] text-white shadow'
                    : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-white'
                )}
              >
                <Trash2 className="size-3" /> Đã xóa gần đây ({deletedPhotos.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 pb-10">
            <div className="grid grid-cols-3 gap-1.5">
              {currentPhotos.map((photo) => (
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
                  {activeTab === 'deleted' && (
                    <span className="absolute top-1 right-1 text-[8px] font-mono bg-[#FF453A] text-white px-1 rounded font-bold">
                      29 ngày
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
