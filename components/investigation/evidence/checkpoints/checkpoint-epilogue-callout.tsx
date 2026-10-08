"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { emitInvestigationEvent } from "@/lib/investigation-events";

interface CheckpointEpilogueCalloutProps {
  onReset: () => void;
}

export function CheckpointEpilogueCallout({ onReset }: CheckpointEpilogueCalloutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-[#16100b] border-2 border-[#b87333] shadow-2xl space-y-5 relative overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-2.5 text-amber-400 font-mono text-sm font-bold uppercase tracking-wider border-b border-[#382618] pb-3">
        <CheckCircle2 className="size-5 text-emerald-400" />
        <span>HỒ SƠ KHÓA ÁN // ĐÃ GIẢI MÃ TOÀN BỘ CHUYÊN ÁN #000</span>
      </div>

      <p className="text-xs sm:text-sm text-[#dfd0bf] font-serif leading-relaxed">
        Toàn bộ mâu thuẫn mốc giờ, động cơ trục lợi và bộ vật chứng buộc tội
        chí mạng của chuyên án{" "}
        <strong className="text-amber-300">TRỐN TÌM</strong> đã được bóc
        tách chuẩn xác. Bạn đã bóc trần ngoại phạm giả mạo VTV3, còi tàu
        20:32 và lọn tóc mai dính máu ADN của bị can{" "}
        <strong className="text-red-400">Trần Thị Hà</strong>.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => emitInvestigationEvent("OPEN_EPILOGUE")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 rounded-xl"
        >
          <span>📖 ĐỌC KÝ SỰ HẬU ÁN (EPILOGUE)</span>
        </button>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#261d15] hover:bg-[#382b1f] text-[#d9a066] border border-[#4a3a2c] font-mono text-xs font-bold transition-all cursor-pointer rounded-xl"
        >
          <span>🔄 PHÁ ÁN LẠI (RESET)</span>
        </button>
      </div>
    </motion.div>
  );
}
