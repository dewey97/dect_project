"use client";

import { useEffect } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { EvidenceDetailInspector } from "@/components/investigation/evidence/evidence-detail-inspector";
import type { SelectedView } from "@/components/investigation/evidence/evidence-types";
import { cn } from "@/lib/utils";

export type ReaderMode = "closed" | "docked" | "focus";

/**
 * Khung đọc tài liệu của Bàn hồ sơ (thay kiểu xem "Xem lẻ" cũ):
 * - docked: gắn cạnh phải mặt bàn, vừa đọc vừa đối chiếu bàn ghim.
 * - focus: phủ gần hết màn hình để đọc tập trung.
 * Esc: focus -> docked -> đóng.
 */
export function CanvasReaderPanel({
  mode,
  onModeChange,
  selectedView,
  caseId,
}: {
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  selectedView: SelectedView | null;
  caseId: string;
}) {
  useEffect(() => {
    if (mode === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onModeChange(mode === "focus" ? "docked" : "closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onModeChange]);

  if (mode === "closed") return null;

  const focus = mode === "focus";

  const panel = (
    <section
      aria-label="Khung đọc tài liệu"
      className={cn(
        "flex h-full min-h-0 flex-col border-zinc-800 bg-[#0d0a08] shadow-[0_0_40px_rgba(0,0,0,0.6)]",
        focus ? "w-full max-w-5xl border" : "w-full border-l",
      )}
    >
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-800 px-3">
        <span className="min-w-0 flex-1 font-mono text-xs uppercase tracking-widest text-zinc-400">
          {focus ? "Đọc tập trung" : "Đọc tài liệu"}
        </span>
        <button
          type="button"
          onClick={() => onModeChange(focus ? "docked" : "focus")}
          className="flex size-9 items-center justify-center text-zinc-400 transition hover:text-amber-300 cursor-pointer"
          title={focus ? "Thu về cạnh bàn" : "Đọc tập trung"}
          aria-label={focus ? "Thu về cạnh bàn" : "Đọc tập trung"}
        >
          {focus ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("closed")}
          className="flex size-9 items-center justify-center text-zinc-400 transition hover:text-zinc-100 cursor-pointer"
          title="Đóng khung đọc"
          aria-label="Đóng khung đọc"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <EvidenceDetailInspector selectedView={selectedView} caseId={caseId} />
      </div>
    </section>
  );

  if (focus) {
    return (
      <div
        className="absolute inset-0 z-40 flex justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onModeChange("docked");
        }}
      >
        {panel}
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 right-0 top-0 z-30 w-[max(400px,min(46%,760px))] animate-in slide-in-from-right-4 fade-in duration-150">
      {panel}
    </div>
  );
}
