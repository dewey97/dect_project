"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { isAdminBypassCode } from "@/lib/cases/admin-bypass";
import {
  getStorageItem,
  setStorageItem,
  getStorageJson,
  setStorageJson,
} from "@/lib/storage";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { caseStorageKey } from "@/lib/cases/case-id";
import { CheckpointHintSection } from "@/components/investigation/checkpoint-hint-section";
import { normalizeForMatch } from "@/lib/text";
import { verifyCheckpointOnServer } from "@/lib/checkpoints/client-verify";

function toWords(str: string): string[] {
  return normalizeForMatch(str)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function isPhoneMatch(val: string, validKeywords: string[]): boolean {
  if (isAdminBypassCode(val)) return true;
  const normWords = toWords(val);
  if (normWords.length === 0) return false;

  return validKeywords.some((kw) => {
    const kwWords = toWords(kw);

    if (normWords.join("") === kwWords.join("")) return true;

    if (normWords.length < kwWords.length) {
      return normWords.every((w) => kwWords.includes(w));
    }

    return false;
  });
}

interface PhoneLookupModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string, info: string) => void;
  onOpenPhoneSimulator?: () => void;
}


export function PhoneLookupModal({
  caseId,
  isOpen,
  onClose,
  onSuccess,
  onOpenPhoneSimulator,
}: PhoneLookupModalProps) {
  const sKey = (k: string) => caseStorageKey(caseId, k);
  const { checkpoints } = useCaseCheckpoints(caseId);
  const cp0 = checkpoints.find(
    (c) =>
      c.kind === "phone_lookup" ||
      c.id.includes("-0") ||
      c.id.includes("phone"),
  );

  const inputsList = useMemo(() => {
    const cfg = (cp0 as any)?.answerConfig || (cp0 as any)?.answer_config;
    const rawInputs =
      cfg?.textMatchInputs ||
      cfg?.text_match_inputs ||
      cp0?.textMatchConfig?.inputs;
    if (rawInputs && Array.isArray(rawInputs) && rawInputs.length > 0) {
      return rawInputs.map((item: any, idx: number) => ({
        id: item.id || `phone${idx + 1}`,
        label: item.label || `SĐT #${idx + 1}:`,
        placeholder: item.placeholder || "Nhập tên nghi phạm...",
        validAnswers: item.validAnswers || item.valid_answers || [],
      }));
    }
    return [];
  }, [cp0]);

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isApproved, setIsApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const activeCp = cp0?.id || "";
      if (typeof window !== "undefined") {
        (window as any).__ACTIVE_INVESTIGATION_CHECKPOINT__ = activeCp;
      }
      setStorageItem("active_investigation_checkpoint", activeCp);
      setStorageItem("last_interacted_checkpoint", activeCp);
      localStorage.removeItem("active_suspect_category");
    }

    const data = getStorageJson<Record<string, string>>(
      sKey("phone_inputs"),
      {},
    );
    setInputValues(data);

    const approved = getStorageItem(sKey("reinvestigate_unlocked"));
    if (approved === "true") {
      setIsApproved(true);
    }
  }, [isOpen, cp0, caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasAnyBypass = inputsList.some((inp, idx) => {
      const val =
        inputValues[inp.id] ??
        (idx === 0
          ? inputValues.phone1
          : idx === 1
            ? inputValues.phone2
            : inputValues.phone3) ??
        "";
      return isAdminBypassCode(val);
    });

    if (!hasAnyBypass) {
      const isMissingAny = inputsList.some((inp, idx) => {
        const val =
          inputValues[inp.id] ??
          (idx === 0
            ? inputValues.phone1
            : idx === 1
              ? inputValues.phone2
              : inputValues.phone3) ??
          "";
        return !val.trim();
      });

      if (isMissingAny) {
        setErrorMsg(
          "Vui lòng điền đầy đủ danh tính chủ thể cho các số điện thoại!",
        );
        detectiveAudio.playGlassSound();
        return;
      }

      // 1. Thử chấm điểm trên server-side trước
      const serverResult = await verifyCheckpointOnServer({
        caseId,
        checkpointId: cp0?.id || "",
        inputs: inputValues,
      });

      let isSuccess = false;
      if (serverResult.success && serverResult.correct) {
        isSuccess = true;
      } else {
        // Fallback offline client-side (bảo vệ khi DB chưa migrate cột kind/answer_config)
        const allValid = inputsList.every((inp, idx) => {
          const val =
            inputValues[inp.id] ??
            (idx === 0
              ? inputValues.phone1
              : idx === 1
                ? inputValues.phone2
                : inputValues.phone3) ??
            "";
          return isPhoneMatch(val, inp.validAnswers || []);
        });

        if (allValid) {
          isSuccess = true;
        } else {
          setErrorMsg(
            serverResult.feedback ||
              "Danh tính chủ thể chưa chính xác. Vui lòng đối chiếu lại tài liệu điều tra.",
          );
          detectiveAudio.playGlassSound();
          return;
        }
      }
    }

    detectiveAudio.playStampSound();
    setIsApproved(true);
    setStorageJson(sKey("phone_inputs"), inputValues);
    setStorageItem(sKey("phone_solved"), "true");

    onSuccess("0988200991", "Đã xác minh danh tính SĐT thành công.");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        >
          {/* HEADER BAR */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b4e2e] block">
                MỞ RỘNG ĐIỀU TRA
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                {cp0?.title || "Truy Vết Liên Lạc"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  detectiveAudio.playPaperRustle();
                  onClose();
                }}
                className="p-2 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026] pointer-events-auto"
                title="Đóng"
              >
                <X className="size-5 pointer-events-none" />
              </button>
            </div>
          </div>

          {/* FORM BODY */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5]"
          >
            {/* DESCRIPTION TEXT */}
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm text-[#1a120b] leading-relaxed font-sans">
                {cp0?.question ||
                  "Tổ chức rà soát, tra cứu dữ liệu viễn thông nhằm xác minh, làm rõ thông tin lai lịch & lý do liên hệ của các đối tượng sử dụng các số điện thoại có lịch sử liên lạc trong thời hạn 12 giờ trước thời điểm xảy ra vụ án."}
              </p>
            </div>

            <span className="font-mono text-xs text-[#4a3520] uppercase font-bold tracking-wider block">
              Điền danh tính chủ sở hữu các SĐT sau:
            </span>

            {/* DYNAMIC PHONE INPUT FIELDS */}
            <div className="space-y-3">
              {inputsList.map((inp, idx) => {
                const currentVal =
                  inputValues[inp.id] ??
                  (idx === 0
                    ? inputValues.phone1
                    : idx === 1
                      ? inputValues.phone2
                      : inputValues.phone3) ??
                  "";
                const displayLabel = inp.label.startsWith("SĐT")
                  ? inp.label
                  : `SĐT ${inp.label}:`;
                return (
                  <div key={inp.id || idx} className="space-y-1">
                    <label className="text-xs font-bold text-[#2b1f14] block font-mono">
                      {displayLabel}
                    </label>
                    <input
                      type="text"
                      value={currentVal}
                      placeholder={inp.placeholder || "Nhập tên nghi phạm..."}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputValues((prev) => ({
                          ...prev,
                          [inp.id]: val,
                          [`phone${idx + 1}`]: val,
                        }));
                        if (errorMsg) setErrorMsg("");
                      }}
                      className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-3.5 py-2 text-base text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
                    />
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs text-red-700 font-mono font-bold mt-1">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM */}
            <CheckpointHintSection
              checkpointId={cp0?.id || ""}
              caseId={caseId}
            />

            {/* ACTION FOOTER */}
            <div className="pt-2 flex items-center justify-between gap-2">
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
                className={cn(
                  "text-xs uppercase tracking-wider px-6 py-2.5 rounded-none font-bold transition-all cursor-pointer flex items-center gap-2 border-2 shadow-md font-mono",
                  !isApproved
                    ? "bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-[#2b1f14] active:scale-95"
                    : "bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-950",
                )}
              >
                <span>LIÊN LẠC LẤY THÔNG TIN</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
