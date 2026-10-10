"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectiveAudio } from "@/lib/investigation-audio";

export interface CanvasPhotoZoomProps {
  zoomedPhotoUrl: string | null;
  zoomOrigin: { x: number; y: number } | null;
  zoomOpenTimeRef: React.RefObject<number>;
  onClose: () => void;
}

export function CanvasPhotoZoom({
  zoomedPhotoUrl,
  zoomOrigin,
  zoomOpenTimeRef,
  onClose,
}: CanvasPhotoZoomProps) {
  useEffect(() => {
    if (!zoomedPhotoUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        detectiveAudio.playPaperRustle();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedPhotoUrl, onClose]);

  return (
    <AnimatePresence>
      {zoomedPhotoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            e.stopPropagation();
            if (Date.now() - (zoomOpenTimeRef.current || 0) < 120) return;
            detectiveAudio.playPaperRustle();
            onClose();
          }}
          className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-pointer select-none"
        >
          <motion.div
            initial={{
              scale: 0.2,
              opacity: 0.2,
              x: zoomOrigin?.x ?? 0,
              y: zoomOrigin?.y ?? 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              scale: 0.2,
              opacity: 0,
              x: zoomOrigin?.x ?? 0,
              y: zoomOrigin?.y ?? 0,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 320,
              mass: 0.8,
            }}
            className="relative max-w-[92vw] max-h-[90vh] flex items-center justify-center"
          >
            <img
              src={zoomedPhotoUrl}
              alt="Ảnh tư liệu phóng to"
              className="max-h-[85vh] max-w-[85vw] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-none select-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
