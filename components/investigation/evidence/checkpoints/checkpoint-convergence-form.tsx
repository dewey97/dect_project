"use client";

import React from "react";
import type { Checkpoint } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheckpointConvergenceFormProps {
  checkpoint: Checkpoint;
  hasSuccess: boolean;
  selections: Record<string, string>;
  onSelectChange: (suspectId: string, reasonKey: string) => void;
}

export function CheckpointConvergenceForm({
  checkpoint,
  hasSuccess,
  selections,
  onSelectChange,
}: CheckpointConvergenceFormProps) {
  const cp = checkpoint;

  return (
    <div className="space-y-4 pt-1">
      <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
        DANH MỤC BẰNG CHỨNG LOẠI TRỪ TỪNG ĐỐI TƯỢNG:
      </span>

      <div className="space-y-3">
        {cp.convergenceConfig?.suspects.map((s) => (
          <div
            key={s.id}
            className="p-3 rounded-none border-2 border-[#2b1f14]/40 bg-[#f4ebd9] space-y-2"
          >
            <span className="text-xs font-bold text-[#1a120b] block">
              • Đối tượng: {s.name}
            </span>
            <div className="space-y-1.5">
              {s.reasonOptions.map((opt, rIdx) => {
                const valKey =
                  rIdx === 0 ? s.validReasons[0] : `reason_${rIdx}`;
                const isSel = selections[s.id] === valKey;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={hasSuccess}
                    onClick={() => onSelectChange(s.id, valKey)}
                    className={cn(
                      "w-full text-left p-2 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none",
                      isSel
                        ? "bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold"
                        : "bg-[#faf6ee] border-[#d8ccb8] text-[#3d2f22] hover:bg-[#ede3cf]",
                    )}
                  >
                    <div
                      className={cn(
                        "size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white",
                        isSel
                          ? "border-[#2b1f14] text-[#0e2b5c]"
                          : "border-[#4a3520]",
                      )}
                    >
                      {isSel && (
                        <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
