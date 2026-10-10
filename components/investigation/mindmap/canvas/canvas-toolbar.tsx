"use client";

import React from "react";
import {
  Move,
  Plus,
  Save,
  Loader2,
  RotateCcw,
  RotateCw,
  Minus,
  Pencil,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import type { useBoardLayout } from "./use-board-layout";
import type { useInvestigationState } from "./use-investigation-state";

export interface CanvasToolbarProps {
  layout: ReturnType<typeof useBoardLayout>;
  state: ReturnType<typeof useInvestigationState>;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  selectedPin: PinPoint | null;
  displayPins: PinPoint[];
  onOpenCreatePinModal: () => void;
  onEditSelectedPin: (pin: PinPoint) => void;
}

export function CanvasToolbar({
  layout,
  state,
  isAudioMuted,
  onToggleAudio,
  selectedPin,
  displayPins,
  onOpenCreatePinModal,
  onEditSelectedPin,
}: CanvasToolbarProps) {
  return (
    <>
      {/* Top Left Header Bar: Status Indicator, Audio Toggle, Admin Layout Controls */}
      <div
        className="absolute left-4 z-20 flex items-center gap-2 pointer-events-none"
        style={{ top: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <div className="flex items-center gap-2 bg-[#1b140e]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#593c26]/60 text-xs text-[#d9a066] font-mono shadow-lg pointer-events-auto">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold tracking-wide">BẢNG ĐIỀU TRA</span>
        </div>

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

        {layout.isAdmin && (
          <div
            data-board-ui="true"
            className="flex items-center gap-1.5 bg-[#141419]/90 backdrop-blur-md p-1 rounded-lg border border-amber-500/40 text-xs shadow-xl pointer-events-auto"
          >
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                const next = !layout.isEditMode;
                layout.setIsEditMode(next);
                if (next) {
                  state.setIsShowAllPinsPreview(true);
                } else {
                  layout.setSelectedPinId(null);
                  state.setIsShowAllPinsPreview(false);
                }
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                layout.isEditMode
                  ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)] ring-1 ring-amber-400/60"
                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title={
                layout.isEditMode
                  ? "Thoát chế độ di chuyển & setup"
                  : "Bật chế độ di chuyển & setup node"
              }
            >
              <Move className="size-4" />
            </button>

            {layout.isEditMode && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    onOpenCreatePinModal();
                  }}
                  className="p-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors shadow-sm"
                  title="Thêm ghi chú dính, giấy trắng A4 hoặc ảnh Polaroid"
                >
                  <Plus className="size-4" />
                </button>

                <button
                  type="button"
                  disabled={layout.isSavingLayout || !layout.hasUnsavedChanges}
                  onClick={() => layout.handleSavePinLayout(displayPins)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    layout.hasUnsavedChanges
                      ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer"
                      : "bg-transparent border-transparent text-zinc-600 cursor-default opacity-40"
                  }`}
                  title={
                    layout.isSavingLayout
                      ? "Đang lưu vị trí..."
                      : layout.hasUnsavedChanges
                        ? "Lưu vị trí ghim (có thay đổi chưa lưu)"
                        : "Đã lưu (không có thay đổi mới)"
                  }
                >
                  {layout.isSavingLayout ? (
                    <Loader2 className="size-4 animate-spin text-amber-300" />
                  ) : (
                    <Save
                      className={`size-4 ${layout.hasUnsavedChanges ? "text-white" : "text-zinc-600"}`}
                    />
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Node Toolbar: Active Node Controls (Rotate, Scale, Edit Detail Modal) */}
      <AnimatePresence>
        {layout.isEditMode && selectedPin && (
          <motion.div
            data-board-ui="true"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-0.5 bg-[#1b140e]/95 backdrop-blur-md rounded-lg border border-amber-500/60 shadow-[0_12px_40px_rgba(0,0,0,0.85)] font-mono text-xs select-none pointer-events-auto"
            style={{
              top: "calc(max(12px, env(safe-area-inset-top, 12px)) + 44px)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, -1, 0)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng trái (-1°)"
            >
              <RotateCcw className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 1, 0)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Xoay nghiêng phải (+1°)"
            >
              <RotateCw className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 0, -0.1)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Thu nhỏ kích thước"
            >
              <Minus className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                layout.handleAdjustNodeTransform(selectedPin.id, 0, 0.1)
              }
              className="p-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-colors"
              title="Phóng to kích thước"
            >
              <Plus className="size-3.5" />
            </button>

            <div className="h-3.5 w-px bg-white/15" />

            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                onEditSelectedPin(selectedPin);
              }}
              className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition-colors"
              title="Chỉnh sửa chi tiết nội dung node"
            >
              <Pencil className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
