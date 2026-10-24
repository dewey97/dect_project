"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  BookOpen,
  Users,
  Target,
  PenLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { RoomModal } from "@/components/investigation/room-modal";
import type { useBoardLayout } from "./use-board-layout";
import type { useInvestigationState } from "./use-investigation-state";

export interface CanvasToolbarProps {
  layout: ReturnType<typeof useBoardLayout>;
  state: ReturnType<typeof useInvestigationState>;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  selectedPin?: PinPoint | null;
  hideTitleBadgeOnMobile?: boolean;
  isBoardGame?: boolean;
  onOpenNotebook?: () => void;
}

export function CanvasToolbar({
  layout,
  state,
  isAudioMuted,
  onToggleAudio,
  selectedPin = null,
  hideTitleBadgeOnMobile = false,
  isBoardGame = false,
  onOpenNotebook,
}: CanvasToolbarProps) {
  const { roomCode, nickname, memberCount, broadcastPing } = useRoomSync();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  return (
    <>
      {/* Top Left Header Bar: Status Indicator, Group Play, Audio Toggle, Admin Layout Controls */}
      <div
        className="absolute left-2.5 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-none"
        style={{ top: "max(10px, env(safe-area-inset-top, 10px))" }}
      >
        <div
          className={cn(
            "items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto",
            hideTitleBadgeOnMobile ? "hidden lg:flex" : "flex"
          )}
        >
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">BẢNG ĐIỀU TRA</span>
        </div>

        {/* Group Play Room Button */}
        <button
          type="button"
          onClick={() => setIsRoomModalOpen(true)}
          className={cn(
            "px-2.5 py-1.5 backdrop-blur-md border rounded-lg shadow-lg pointer-events-auto flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer",
            roomCode
              ? "bg-emerald-950/85 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/90"
              : "bg-[#1b140e]/85 hover:bg-[#342417] border-[#593c26]/60 text-[#d9a066]"
          )}
          title={
            roomCode
              ? `Phòng: ${roomCode} • ${memberCount} thám tử đang trực tuyến • Bạn: ${nickname}`
              : "Chơi nhóm đồng bộ (Group ID)"
          }
        >
          <Users className="size-3.5 text-amber-500" />
          <span>{roomCode ? `${roomCode} (${memberCount} 👤)` : "Chơi Nhóm"}</span>
          {roomCode && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        <button
          type="button"
          onClick={onToggleAudio}
          className="p-1.5 bg-[#1b140e]/85 hover:bg-[#342417] backdrop-blur-md border border-[#593c26]/60 text-[#d9a066] transition-colors cursor-pointer rounded-lg shadow-lg pointer-events-auto flex items-center justify-center"
          title={
            isAudioMuted ? "Bật âm thanh trinh thám" : "Tắt âm thanh trinh thám"
          }
        >
          {isAudioMuted ? (
            <VolumeX className="size-4 text-amber-500/60" />
          ) : (
            <Volume2 className="size-4 text-amber-400" />
          )}
        </button>

        {onOpenNotebook && (
          <button
            type="button"
            onClick={onOpenNotebook}
            className="px-2.5 py-1.5 bg-[#1b140e]/85 hover:bg-[#342417] backdrop-blur-md border border-[#593c26]/60 text-[#d9a066] hover:text-[#fef5ec] transition-colors cursor-pointer rounded-lg shadow-lg pointer-events-auto flex items-center gap-1.5 text-xs font-mono font-bold"
            title="Mở sổ tay ghi chép thám tử"
          >
            <PenLine className="size-3.5 text-amber-500" />
            <span>SỔ TAY</span>
          </button>
        )}

        {isBoardGame && (
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle();
              state.setIsGameplayGuideOpen(true);
            }}
            className="p-1.5 bg-[#1b140e]/85 hover:bg-[#342417] backdrop-blur-md border border-[#593c26]/60 text-[#d9a066] hover:text-[#fef5ec] transition-colors cursor-pointer rounded-lg shadow-lg pointer-events-auto flex items-center justify-center"
            title="Sổ tay hướng dẫn gameplay"
            aria-label="Sổ tay hướng dẫn gameplay"
          >
            <BookOpen className="size-4 text-amber-400" />
          </button>
        )}


      </div>

      {/* Quick ping button when a pin is selected */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            data-board-ui="true"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1b140e]/95 backdrop-blur-md rounded-lg border border-amber-500/60 shadow-[0_12px_40px_rgba(0,0,0,0.85)] font-mono text-xs select-none pointer-events-auto"
            style={{
              top: "calc(max(12px, env(safe-area-inset-top, 12px)) + 44px)",
            }}
          >
            <span className="text-amber-200/90 truncate max-w-[140px] sm:max-w-[200px] font-bold text-[11px]">
              {selectedPin.label}
            </span>
            <button
              type="button"
              onClick={() => {
                broadcastPing(selectedPin.id, selectedPin.label || "Ghim điều tra", {
                  x: selectedPin.x,
                  y: selectedPin.y,
                });
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/60 transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
              title="Phát tín hiệu radar chỉ điểm ghim này cho đồng đội"
            >
              <Target className="size-3.5 text-amber-400 animate-pulse" />
              <span>Chỉ điểm 🎯</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />
    </>
  );
}
