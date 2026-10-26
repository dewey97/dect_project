"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Inbox,
  Eye,
  BookOpen,
  FolderArchive,
  EyeOff,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import type {
  DbCaseCheckpoint,
  DbCaseDossier,
  BoardConfig,
} from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface OffBoardTrayProps {
  checkpoints: DbCaseCheckpoint[];
  dossiers: DbCaseDossier[];
  selectedCheckpointId?: string | null;
  onSelectCheckpoint: (checkpoint: DbCaseCheckpoint) => void;
  onSelectDossier?: (dossier: DbCaseDossier) => void;
  onMoveToBoard: (checkpointId: string) => void;
  className?: string;
}

export function OffBoardTray({
  checkpoints,
  dossiers,
  selectedCheckpointId,
  onSelectCheckpoint,
  onSelectDossier,
  onMoveToBoard,
  className,
}: OffBoardTrayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Lọc các checkpoint không hiển thị trên bảng:
  // 1. Kind === "epilogue"
  // 2. board_config?.hidden === true
  // 3. Hoặc các loại checkpoint phụ không cắm ghim tự động
  const offBoardCheckpoints = checkpoints.filter((cp) => {
    const isEpilogue =
      cp.kind === "epilogue" ||
      cp.type === "epilogue" ||
      cp.checkpoint_id.includes("epilogue");
    const boardCfg = cp.board_config as BoardConfig | null;
    const isExplicitlyHidden = boardCfg?.hidden === true;
    return isEpilogue || isExplicitlyHidden;
  });

  const totalItems = offBoardCheckpoints.length + dossiers.length;

  return (
    <div
      className={cn(
        "flex flex-col border-t border-white/10 bg-[#0c0d14]/95 backdrop-blur-md transition-all duration-200 z-20",
        isExpanded ? "h-40" : "h-9",
        className,
      )}
    >
      {/* Header bar của Tray */}
      <div className="flex h-9 shrink-0 items-center justify-between px-3 border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <Inbox className="size-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            Khay Ngoài Bảng
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-zinc-300">
            {totalItems} mục
          </span>
          <span className="hidden sm:inline text-[10px] text-zinc-500">
            (Hậu án, hồ sơ và các checkpoint ẩn không ghim trên canvas)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          title={isExpanded ? "Thu gọn khay" : "Mở rộng khay"}
        >
          <span className="text-[11px]">{isExpanded ? "Thu gọn" : "Mở khay"}</span>
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronUp className="size-3.5" />
          )}
        </button>
      </div>

      {/* Danh sách items khi mở rộng */}
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-2.5 flex items-center gap-2.5">
          {totalItems === 0 ? (
            <div className="flex items-center justify-center w-full text-xs text-zinc-500 italic py-4">
              Không có mục nào ngoài bảng. Tất cả checkpoints đang hiển thị trên bảng điều tra.
            </div>
          ) : (
            <>
              {/* Checkpoints ngoài bảng */}
              {offBoardCheckpoints.map((cp) => {
                const isEpilogue =
                  cp.kind === "epilogue" ||
                  cp.type === "epilogue" ||
                  cp.checkpoint_id.includes("epilogue");
                const isSelected = selectedCheckpointId === cp.id;

                return (
                  <div
                    key={cp.id}
                    onClick={() => onSelectCheckpoint(cp)}
                    className={cn(
                      "group relative flex flex-col justify-between h-full min-w-[200px] max-w-[240px] rounded-md border p-2 text-left cursor-pointer transition-all duration-150 select-none shrink-0",
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-950/30"
                        : "border-white/10 bg-zinc-900/70 hover:border-white/20 hover:bg-zinc-800/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isEpilogue ? (
                          <BookOpen className="size-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <EyeOff className="size-3.5 text-zinc-400 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider rounded px-1 py-0.2 shrink-0 font-mono",
                            isEpilogue
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-zinc-700/50 text-zinc-300",
                          )}
                        >
                          {isEpilogue ? "HẬU ÁN" : "ẨN KHỎI BẢNG"}
                        </span>
                      </div>

                      {/* Nút Đưa lên bảng (chỉ hiện cho checkpoint thông thường đang ẩn) */}
                      {!isEpilogue && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToBoard(cp.id);
                          }}
                          className="opacity-80 group-hover:opacity-100 flex items-center gap-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-medium transition-colors"
                          title="Đưa ghim lên bảng điều tra"
                        >
                          <Eye className="size-3" />
                          <span>Lên bảng</span>
                        </button>
                      )}
                    </div>

                    <div className="my-1 min-w-0">
                      <div className="text-xs font-medium text-zinc-100 truncate" title={cp.title}>
                        {cp.title || cp.checkpoint_id}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate font-mono">
                        {cp.checkpoint_id}
                      </div>
                    </div>

                    <div className="text-[9px] text-zinc-500 flex items-center justify-between">
                      <span>Loại: {cp.kind || cp.type}</span>
                      {isSelected && (
                        <span className="text-amber-400 font-semibold text-[10px]">Đang chọn</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bộ hồ sơ ngoài bảng */}
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  onClick={() => onSelectDossier?.(dossier)}
                  className="group relative flex flex-col justify-between h-full min-w-[200px] max-w-[240px] rounded-md border border-cyan-500/20 bg-cyan-950/20 hover:border-cyan-500/40 hover:bg-cyan-900/30 p-2 text-left cursor-pointer transition-all duration-150 select-none shrink-0"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FolderArchive className="size-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 font-mono">
                        BỘ HỒ SƠ
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 text-cyan-400 text-[10px] flex items-center gap-0.5">
                      <span>Dossier</span>
                      <ExternalLink className="size-2.5" />
                    </div>
                  </div>

                  <div className="my-1 min-w-0">
                    <div className="text-xs font-medium text-cyan-100 truncate" title={dossier.title}>
                      {dossier.title}
                    </div>
                    <div className="text-[10px] text-cyan-400/70 truncate font-mono">
                      Khóa: {dossier.dossier_key}
                    </div>
                  </div>

                  <div className="text-[9px] text-cyan-400/60 flex items-center justify-between">
                    <span>{dossier.document_codes?.length || 0} tài liệu</span>
                    <span className="text-[9px] text-zinc-500">Dossier Studio</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
