import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export interface DiscoveredPhoto {
  id?: string
  title: string
  url: string
}

interface HaDiscoveredPhotosPopupProps {
  isOpen: boolean
  photos: DiscoveredPhoto[]
  onContinue: () => void
}

export function HaDiscoveredPhotosPopup({
  isOpen,
  photos,
  onContinue,
}: HaDiscoveredPhotosPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#a88c6f]/30 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-amber-400" />
              <div>
                <h4 className="font-mono font-bold text-sm sm:text-base text-amber-300 uppercase tracking-wider">
                  KHÓA HỘP THIẾC ĐÃ ĐƯỢC MỞ
                </h4>
                <p className="text-xs font-mono text-[#a88c6f]">
                  3 vật chứng giấu kín thu giữ bên trong hộp
                </p>
              </div>
            </div>
          </div>

          {/* VÙNG CHÍNH GIỮA: 3 ẢNH LỘN XỘN XẾP CHỒNG + 3 GẠCH ĐẦU DÒNG GÓC DƯỚI TRÁI */}
          <div className="my-auto flex flex-col items-center justify-center w-full py-2">
            <div className="relative w-full max-w-[540px] aspect-[1/1] sm:h-[460px] flex items-center justify-center">
              {/* Ảnh 1: Phía trên bên phải (rotate-6) */}
              {photos[0] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 6 }}
                  transition={{ duration: 0.4 }}
                  className="absolute top-0 right-2 sm:right-4 w-[56%] sm:w-[54%] aspect-[4/3] z-10 shadow-[0_15px_40px_rgba(0,0,0,0.95)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                >
                  <img
                    src={photos[0].url}
                    alt={photos[0].title}
                    className="w-full h-full object-cover block"
                    onError={(e) => {
                      e.currentTarget.src =
                        '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                    }}
                  />
                </motion.div>
              )}

              {/* Ảnh 2: Phía giữa chếch bên trái (-rotate-2) */}
              {photos[1] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="absolute top-[28%] left-0 sm:left-2 w-[56%] sm:w-[54%] aspect-[4/3] z-20 shadow-[0_18px_45px_rgba(0,0,0,0.98)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                >
                  <img
                    src={photos[1].url}
                    alt={photos[1].title}
                    className="w-full h-full object-cover block"
                    onError={(e) => {
                      e.currentTarget.src =
                        '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                    }}
                  />
                </motion.div>
              )}

              {/* Ảnh 3: Phía dưới chếch bên phải (rotate-2) */}
              {photos[2] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 2 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute bottom-4 right-0 sm:right-4 w-[58%] sm:w-[56%] aspect-[4/3] z-25 shadow-[0_20px_50px_rgba(0,0,0,0.98)] hover:z-30 hover:scale-105 transition-transform cursor-pointer overflow-hidden rounded-none"
                >
                  <img
                    src={photos[2].url}
                    alt={photos[2].title}
                    className="w-full h-full object-cover block"
                    onError={(e) => {
                      e.currentTarget.src =
                        '/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png'
                    }}
                  />
                </motion.div>
              )}

              {/* 3 GẠCH ĐẦU DÒNG NẰM GÓC DƯỚI BÊN TRÁI */}
              <div className="absolute bottom-2 left-2 sm:left-4 z-30 max-w-[42%] text-left space-y-1.5">
                {photos.map((photo, idx) => (
                  <div
                    key={`bullet-${photo.id || idx}`}
                    className="flex items-start gap-1.5 leading-snug"
                  >
                    <span className="text-amber-400 font-mono text-xs select-none">
                      •
                    </span>
                    <span className="font-mono text-xs text-[#f6f1e5] font-medium tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      {photo.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER CTA TIẾP TỤC */}
          <div className="shrink-0 flex items-center justify-end pt-3 border-t border-[#a88c6f]/30">
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto px-7 py-3 bg-[#8c1d1d] hover:bg-[#6e1515] text-[#f6f1e5] font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 border-2 border-[#4a0e0e] shadow-lg active:scale-95 cursor-pointer"
            >
              <span>TIẾP TỤC</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
