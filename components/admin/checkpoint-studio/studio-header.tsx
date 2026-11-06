"use client";

import {
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import { cn } from "@/lib/utils";
import { useBoardEditor } from "./board/use-board-editor";
import { BoardNodeForm } from "./board/board-node-form";
import { Button } from "@/components/ui/button";
import {
  Save,
  Plus,
  Play,
  Pin,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import { CheckpointStudioInspector } from "./studio-inspector";
import { CaseLintResult } from "@/lib/checkpoints/case-linter";
import { Dispatch,SetStateAction } from "react";

export interface CheckpointStudioHeaderProps {
  hasUnsaved: boolean;
  createRow: () => void;
  handleCreateNewCharacter: () => void;
  handlePlaytest: (checkpointId?: string) => void;
  draft: CheckpointStudioDraft | null;
  setIsFloatingBoardOpen: Dispatch<SetStateAction<boolean>>;
  isFloatingBoardOpen: boolean;
  handleSaveAllUnified: () => Promise<void>;
  isBusy: boolean;
  isUnifiedSaving: boolean;
  hasAnyUnsaved: boolean;
  setIsLintModalOpen: Dispatch<SetStateAction<boolean>>;
  lintResult: CaseLintResult;
}

export function CheckpointStudioHeader({
  hasUnsaved,
  createRow,
  handleCreateNewCharacter,
  handlePlaytest,
  draft,
  setIsFloatingBoardOpen,
  isFloatingBoardOpen,
  handleSaveAllUnified,
  isBusy,
  isUnifiedSaving,
  hasAnyUnsaved,
  setIsLintModalOpen,
  lintResult,
}: CheckpointStudioHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#090a0f] px-3 z-30">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
            Checkpoint Studio
          </span>
          {hasUnsaved && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Chưa lưu
            </span>
          )}
        </div>

        {/* Thanh công cụ phải */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Nút Thêm Checkpoint */}
          <Button
            type="button"
            size="sm"
            onClick={createRow}
            className="gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Tạo checkpoint mới"
          >
            <Plus className="size-3.5" />
            <span>Thêm Checkpoint</span>
          </Button>

          {/* Nút Thêm Nhân vật */}
          <Button
            type="button"
            size="sm"
            onClick={handleCreateNewCharacter}
            className="gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Tạo nhân vật mới"
          >
            <Plus className="size-3.5" />
            <span>Thêm Nhân vật</span>
          </Button>

          {/* Nút Chơi thử */}
          <Button
            type="button"
            size="sm"
            onClick={() => handlePlaytest(draft?.checkpointId)}
            className="gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 h-7 px-2.5 font-semibold cursor-pointer"
            title="Chơi thử vụ án"
          >
            <Play className="size-3.5" />
            <span>Chơi thử</span>
          </Button>

          {/* Nút Bật/Tắt Cửa sổ Bảng điều tra nổi (Floating Panel) */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsFloatingBoardOpen((prev) => !prev)}
            className={cn(
              "gap-1 text-xs h-7 px-2.5 font-semibold cursor-pointer border transition-colors",
              isFloatingBoardOpen
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-white/5 text-zinc-400 border-white/10 hover:text-zinc-200",
            )}
            title="Bật/Tắt Cửa sổ Bảng điều tra nổi"
          >
            <Pin className="size-3.5 rotate-45" />
            <span>Bảng điều tra</span>
          </Button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Nút LƯU DUY NHẤT TOÀN STUDIO (Checkpoint, Nhân vật, Bố cục Bảng) */}
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAllUnified}
            disabled={isBusy || isUnifiedSaving}
            className={cn(
              "gap-1.5 text-xs font-bold h-7 px-3.5 shadow-md cursor-pointer transition-all",
              hasAnyUnsaved
                ? "bg-amber-500 text-black hover:bg-amber-400 ring-2 ring-amber-400/50"
                : "bg-white/10 text-zinc-300 hover:bg-white/20",
            )}
            title="Lưu tất cả thay đổi (Ctrl+S)"
          >
            <Save className="size-3.5" />
            <span>{isUnifiedSaving ? "Đang lưu..." : "LƯU TẤT CẢ"}</span>
            {hasAnyUnsaved && (
              <span className="size-1.5 rounded-full bg-amber-950 inline-block animate-ping" />
            )}
          </Button>

          {/* Nút Linter Vụ Án */}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsLintModalOpen(true)}
            className={cn(
              "gap-1 text-xs h-7 px-2",
              lintResult.errorCount > 0
                ? "text-rose-400 bg-rose-950/20"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            title="Kiểm tra logic vụ án (Case Linter)"
          >
            <Sparkles className="size-3.5" />
            <span>Linter</span>
            {lintResult.errorCount > 0 && (
              <span className="rounded bg-rose-500/30 px-1 text-[10px] text-rose-300 font-mono">
                {lintResult.errorCount}
              </span>
            )}
          </Button>
        </div>
      </header>
  );
}
