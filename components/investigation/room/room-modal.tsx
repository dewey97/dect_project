"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, ArrowRight } from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { PlayLobby } from "@/components/play/play-lobby";
import { usePlayCaseId } from "@/lib/hooks/use-play-case-id";
import { playPath } from "@/lib/play/routes";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal Chơi nhóm trong màn điều tra.
 * Đang ở phòng: dùng chung phòng chờ `PlayLobby` của /play (thành viên, mã, QR, rời phòng).
 * Chưa ở phòng: dẫn tới màn vào game `/play/<case_id>`.
 */
export function RoomModal({ isOpen, onClose }: RoomModalProps) {
  const { room, me } = useRoomSync();
  const caseId = usePlayCaseId();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const inRoom = !!room && !!me;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`w-full ${inRoom ? "max-w-2xl" : "max-w-md"} max-h-[90dvh] flex flex-col bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden font-sans`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-zinc-400" />
                <h3
                  id="room-modal-title"
                  className="font-semibold text-sm tracking-wide text-zinc-100 uppercase font-mono"
                >
                  Chơi nhóm
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2.5 -m-1.5 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto">
              {inRoom ? (
                <PlayLobby caseTitle="" caseId={room.caseId} embedded />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Một người trong nhóm tạo phòng, những người khác vào bằng mã
                    4 ký tự hoặc quét QR của phòng. Phòng mới bắt đầu từ 0%,
                    không dùng tiến trình chơi Solo.
                  </p>
                  <Link
                    href={playPath(caseId)}
                    onClick={onClose}
                    className="w-full min-h-11 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Tạo hoặc vào phòng</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
