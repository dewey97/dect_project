"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from "lucide-react";
import { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import { normalizeImageUrl } from "@/lib/utils";

interface CustomPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: PinPoint | null;
  onSolve?: (pinId: string) => void;
}

export function CustomPinModal({
  isOpen,
  onClose,
  pin,
  onSolve,
}: CustomPinModalProps) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  if (!isOpen || !pin) return null;

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    detectiveAudio.playTypewriterClick();

    const expected = (pin.answers || "").trim().toLowerCase();
    const input = userInput.trim().toLowerCase();

    // Direct match or partial keyword match check
    let isCorrect = false;
    if (expected.includes(input) || input.includes(expected)) {
      isCorrect = true;
    } else {
      // Stripping punctuation & spaces
      const cleanExpected = expected.replace(/[^a-z0-9]/g, "");
      const cleanInput = input.replace(/[^a-z0-9]/g, "");
      if (cleanExpected.length > 0 && cleanExpected.includes(cleanInput)) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      detectiveAudio.playTypewriterClick();
      setFeedback({
        type: "success",
        message: "CHÍNH XÁC! Suy luận chính xác. Đã mở khóa tình tiết mới.",
      });
      setIsSolved(true);
      if (onSolve) onSolve(pin.id);
    } else {
      detectiveAudio.playPaperRustle();
      setFeedback({
        type: "error",
        message: "CHƯA CHÍNH XÁC! Hãy kiểm tra lại chứng cứ & lời khai.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-4 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[85vh] font-sans">
        {/* HEADER */}
        <div className="bg-[#ede3d1] px-5 py-3.5 border-b-2 border-[#2b1f14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#8c1d1d]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c1d1d]">
              HỒ SƠ TÀI LIỆU // {pin.label || "GHIM ĐIỀU TRA"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              detectiveAudio.playPaperRustle();
              onClose();
            }}
            className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors border border-[#5c4026]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-[#f6f1e5]">
          {/* Photo view if photo type */}
          {pin.photoUrl && (
            <div className="relative rounded border-2 border-[#2b1f14] overflow-hidden bg-black/10 max-h-60 flex items-center justify-center">
              <img
                src={normalizeImageUrl(pin.photoUrl)}
                alt={pin.label}
                className="max-h-56 object-contain"
              />
            </div>
          )}

          {/* Title & Detail */}
          <div>
            <h3 className="font-mono font-bold text-base text-[#1a120b] uppercase tracking-wide">
              {pin.label}
            </h3>
            {pin.detail && (
              <p className="mt-2 text-xs sm:text-sm text-[#382618] font-mono leading-relaxed whitespace-pre-line p-3 bg-[#ebdcc4] border border-[#a88c6f]/60 rounded">
                {pin.detail}
              </p>
            )}
          </div>

          {/* Custom Question Form */}
          {pin.actionType === "custom_question" && (
            <div className="pt-3 border-t-2 border-[#2b1f14]/20 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8c1d1d]">
                <HelpCircle className="size-4" />
                <span>CÂU HỎI ĐIỀU TRA:</span>
              </div>

              {pin.question && (
                <p className="text-xs sm:text-sm font-mono font-bold text-[#2b1f14] p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d]/40">
                  {pin.question}
                </p>
              )}

              {/* Input Form */}
              {!isSolved ? (
                <form onSubmit={handleCheckAnswer} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold text-[#5c4026] mb-1">
                      {pin.questionType === "evidence_picker"
                        ? "Nhập mã thẻ chứng cứ (VD: 10, dev-00):"
                        : "Nhập đáp án suy luận:"}
                    </label>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-[#2b1f14] rounded-none font-mono text-xs text-[#1a120b] focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                    />
                  </div>

                  {pin.hints && (
                    <div className="text-[11px] font-mono text-[#7a5938] italic">
                      💡 Gợi ý: {pin.hints}
                    </div>
                  )}

                  {feedback && (
                    <div
                      className={`p-2.5 rounded font-mono text-xs flex items-center gap-2 ${
                        feedback.type === "success"
                          ? "bg-emerald-950/10 border border-emerald-700 text-emerald-900"
                          : "bg-red-950/10 border border-red-700 text-red-900"
                      }`}
                    >
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#8c1d1d] hover:bg-[#6b1616] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider transition-colors border-2 border-[#2b1f14]"
                  >
                    XÁC NHẬN ĐÁP ÁN
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-900/10 border-2 border-emerald-700 text-emerald-900 font-mono text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-5" />
                  <span>ĐÃ GIẢI QUYẾT XONG CÂU HỎI NÀY!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-[#ede3d1] border-t-2 border-[#2b1f14] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2b1f14] hover:bg-black text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
}
