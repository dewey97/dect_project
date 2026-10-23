import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { CheckpointHintSection } from "@/components/investigation/checkpoint-hint-section";
import type { Checkpoint } from "@/lib/types/case";

interface FollowupCodeFormProps {
  caseId: string;
  checkpoint?: Checkpoint | null;
  dossierLabel?: string;
  questionText?: string;
  inputLabel?: string;
  placeholder?: string;
  codeInput: string;
  onCodeInputChange: (val: string) => void;
  errorMsg: string;
  onClearError: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function FollowupCodeForm({
  caseId,
  checkpoint,
  dossierLabel,
  questionText,
  inputLabel,
  placeholder,
  codeInput,
  onCodeInputChange,
  errorMsg,
  onClearError,
  onSubmit,
  onClose,
}: FollowupCodeFormProps) {
  const displayDossier =
    dossierLabel || checkpoint?.dossier || "📂 MỞ TÚI HỒ SƠ D";
  const displayQuestion =
    questionText ||
    checkpoint?.question ||
    "Xác định mã khóa số / mật khẩu mở khóa vật chứng đáng ngờ.";
  const displayLabel = inputLabel || "MẬT KHẨU / MÃ KHÓA SỐ:";
  const targetCheckpointId = checkpoint?.id || "";

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] paper-scrollbar"
    >
      {errorMsg && (
        <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* TÚI HỒ SƠ */}
      <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
          {displayDossier.startsWith("📂")
            ? displayDossier
            : `📂 ${displayDossier}`}
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="p-3.5 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
        <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
          YÊU CẦU ĐIỀU TRA:
        </span>
        <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed whitespace-pre-line">
          {displayQuestion}
        </p>
      </div>

      {/* CODE / PASSWORD INPUT BOX */}
      <div className="space-y-2 pt-1">
        <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
          {displayLabel}
        </label>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => {
            onCodeInputChange(e.target.value);
            onClearError();
          }}
          placeholder={placeholder || "Nhập mã khóa số / mật khẩu..."}
          className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-base font-bold placeholder-[#a88c6f]/60 tracking-wider focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
        />
      </div>

      {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM NHẬP */}
      <CheckpointHintSection
        checkpointId={targetCheckpointId}
        caseId={caseId}
      />

      {/* FOOTER */}
      <div className="pt-3 flex items-center justify-between border-t border-[#2b1f14]/20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            detectiveAudio.playPaperRustle();
            onClose();
          }}
          className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
        >
          ĐÓNG
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 shadow-md bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] cursor-pointer active:scale-95"
        >
          <Sparkles className="size-3.5 text-amber-400" />
          <span>XÁC NHẬN MẬT KHẨU</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </form>
  );
}
