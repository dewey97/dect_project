"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Unlock,
  CheckSquare,
  Square,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import { normalizeImageUrl } from "@/lib/utils";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { parseAnswersColumn } from "@/lib/cms/checkpoint-cms";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { isVietnameseTextMatch } from "@/lib/finding-matcher";

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
  const [selectedOption, setSelectedOption] = useState<string>("");

  // States for text_match_3 (3 phone lookup)
  const [phoneInput1, setPhoneInput1] = useState("");
  const [phoneInput2, setPhoneInput2] = useState("");
  const [phoneInput3, setPhoneInput3] = useState("");

  // States for evidence_picker
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  // Fetch live checkpoints from Google Sheets Live CMS
  const { checkpoints } = useCaseCheckpoints("case-000");

  // Auto-detect target checkpoint ID with smart fallback for suspect names & node IDs
  const targetCpId = useMemo(() => {
    if (!pin) return "";
    if (pin.checkpointId) return pin.checkpointId;

    const pid = (pin.id || "").toLowerCase();
    if (pid === "c0-pin-phone" || pid.includes("phone")) return "cp-000-0";
    if (
      pid === "c0-pin-followup-vu" ||
      pid === "node-suspect-vu" ||
      pid.includes("vu")
    )
      return "cp-000-1a";
    if (
      pid === "c0-pin-followup-tung" ||
      pid === "node-suspect-tung" ||
      pid.includes("tung")
    )
      return "cp-000-1b";
    if (
      pid === "c0-pin-followup-ha" ||
      pid === "node-suspect-ha" ||
      pid.includes("ha")
    )
      return "cp-000-1c";
    if (
      pid === "c0-pin-reinvestigate" ||
      pid.includes("reinvestigate") ||
      pid.includes("kham-xet")
    )
      return "cp-000-convergence";
    if (
      pid === "c0-pin-indictment" ||
      pid.includes("indictment") ||
      pid.includes("cao-trang")
    )
      return "cp-000-2b";

    const text = `${pin.label || ""} ${pin.detail || ""}`.toLowerCase();
    if (text.includes("vũ") || text.includes("vu")) return "cp-000-1a";
    if (text.includes("tùng") || text.includes("tung")) return "cp-000-1b";
    if (text.includes("hà") || text.includes("ha")) return "cp-000-1c";
    if (
      text.includes("sđt") ||
      text.includes("danh tính") ||
      text.includes("nghi vấn") ||
      text.includes("điện thoại")
    )
      return "cp-000-0";
    if (
      text.includes("khám xét") ||
      text.includes("tái khám") ||
      text.includes("hội tụ")
    )
      return "cp-000-convergence";
    if (
      text.includes("cáo trạng") ||
      text.includes("kết luận") ||
      text.includes("định tội")
    )
      return "cp-000-2b";

    return "";
  }, [pin]);

  // Lookup matching checkpoint from live CMS or fallback
  const matchedCheckpoint = useMemo(() => {
    if (!pin) return null;
    if (targetCpId) {
      const found = checkpoints.find(
        (cp) => cp.id.toLowerCase().trim() === targetCpId.toLowerCase().trim(),
      );
      if (found) return found;
    }
    return (
      checkpoints.find(
        (cp) =>
          (cp as any).nodeId?.toLowerCase().trim() ===
          pin.id.toLowerCase().trim(),
      ) || null
    );
  }, [checkpoints, targetCpId, pin]);

  // Reset inputs when pin changes
  useEffect(() => {
    setUserInput("");
    setSelectedOption("");
    setPhoneInput1("");
    setPhoneInput2("");
    setPhoneInput3("");
    setSelectedSuspect("");
    setSelectedEvidences([]);
    setFeedback(null);
    setIsSolved(Boolean(pin?.isSolved));
    setActiveHintIdx(0);
  }, [pin, isOpen]);

  const isQuestionNode =
    Boolean(matchedCheckpoint) ||
    pin?.actionType === "sheet_checkpoint" ||
    pin?.actionType === "custom_question" ||
    Boolean(targetCpId) ||
    Boolean(pin?.question);

  const questionTitle =
    matchedCheckpoint?.title || pin?.label || "HỒ SƠ ĐIỀU TRA";

  const questionText =
    matchedCheckpoint?.question ||
    pin?.question ||
    (isQuestionNode
      ? "Hãy suy luận và đưa ra câu trả lời dựa trên manh mối đã thu thập."
      : "");

  // Graded hints extracted strictly from live Sheet checkpoint (or pin.hints)
  const hintsList = useMemo<string[]>(() => {
    if (matchedCheckpoint?.hintsList && matchedCheckpoint.hintsList.length > 0) {
      return matchedCheckpoint.hintsList;
    }
    if (matchedCheckpoint?.hint) {
      return [matchedCheckpoint.hint];
    }
    if (pin?.hints) {
      return [pin.hints];
    }
    return [];
  }, [matchedCheckpoint, pin]);

  const [activeHintIdx, setActiveHintIdx] = useState<number>(0);

  const unlockedEvidence =
    matchedCheckpoint?.unlockedEvidenceId || pin?.unlockedEvidenceId || "";

  const checkpointType = matchedCheckpoint?.type || pin?.questionType || "text";

  if (!isOpen || !pin) return null;

  // Answer checking logic
  const handleCheckAnswer = (answerOverride?: string) => {
    detectiveAudio.playTypewriterClick();
    let isCorrect = false;

    // CASE 1: Evidence Picker (Suspect verification + evidence selection)
    if (
      checkpointType === "evidence_picker" &&
      matchedCheckpoint?.pickerConfig
    ) {
      const config = matchedCheckpoint.pickerConfig;
      const suspectName = selectedSuspect.trim().toLowerCase();

      const validSuspects = (config.validSuspects || []).map((s) =>
        s.toLowerCase(),
      );
      const isSuspectCorrect =
        validSuspects.length === 0 ||
        validSuspects.some(
          (s) =>
            s === suspectName ||
            suspectName.includes(s) ||
            s.includes(suspectName),
        );

      const requiredEvs = (config.requiredEvidenceIds || []).map((id) =>
        id.toLowerCase(),
      );
      const userSelected = selectedEvidences.map((id) => id.toLowerCase());

      const hasAllRequiredEvidences = requiredEvs.every(
        (req) =>
          userSelected.includes(req) ||
          userSelected.some((sel) => sel.includes(req) || req.includes(sel)),
      );

      if (isSuspectCorrect && hasAllRequiredEvidences) {
        isCorrect = true;
      }
    }
    // CASE 2: Text Match 3 (3 phone numbers)
    else if (
      checkpointType === "text_match_3" &&
      matchedCheckpoint?.textMatchConfig?.inputs
    ) {
      const inputsConfig = matchedCheckpoint.textMatchConfig.inputs;
      const val1 = phoneInput1.trim().toLowerCase();
      const val2 = phoneInput2.trim().toLowerCase();
      const val3 = phoneInput3.trim().toLowerCase();

      const check1 = (inputsConfig[0]?.validAnswers || []).some(
        (a) => isVietnameseTextMatch(val1, a),
      );
      const check2 = (inputsConfig[1]?.validAnswers || []).some(
        (a) => isVietnameseTextMatch(val2, a),
      );
      const check3 = (inputsConfig[2]?.validAnswers || []).some(
        (a) => isVietnameseTextMatch(val3, a),
      );

      if (check1 && check2 && check3) {
        isCorrect = true;
      }
    }
    // CASE 3: MCQ or Standard Text Match
    else {
      const ans = (answerOverride !== undefined ? answerOverride : userInput)
        .trim()
        .toLowerCase();
      const expected = (pin.answers || "").trim().toLowerCase();

      if (ans) {
        if (expected && (expected.includes(ans) || ans.includes(expected))) {
          isCorrect = true;
        } else if (expected) {
          const cleanExpected = expected.replace(/[^a-z0-9à-ỹ]/g, "");
          const cleanAns = ans.replace(/[^a-z0-9à-ỹ]/g, "");
          if (cleanExpected.length > 0 && cleanExpected.includes(cleanAns)) {
            isCorrect = true;
          }
        } else {
          // If no rigid answer set, accept non-empty input
          isCorrect = true;
        }
      }
    }

    if (isCorrect) {
      detectiveAudio.playTypewriterClick();
      setFeedback({
        type: "success",
        message: unlockedEvidence
          ? `CHÍNH XÁC! Suy luận hoàn toàn trùng khớp. Đã mở khóa manh mối [${unlockedEvidence}].`
          : "CHÍNH XÁC! Suy luận chính xác. Đã mở khóa tình tiết vụ án.",
      });
      setIsSolved(true);
      if (onSolve) onSolve(pin.id);
    } else {
      detectiveAudio.playPaperRustle();
      setFeedback({
        type: "error",
        message:
          "CHƯA CHÍNH XÁC! Hãy kiểm tra lại hiện trường, lời khai và mã chứng cứ.",
      });
    }
  };

  const toggleEvidenceSelect = (evId: string) => {
    detectiveAudio.playTypewriterClick();
    setSelectedEvidences((prev) =>
      prev.includes(evId) ? prev.filter((id) => id !== evId) : [...prev, evId],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-4 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[88vh] font-sans">
        {/* HEADER */}
        <div className="bg-[#ede3d1] px-5 py-3.5 border-b-2 border-[#2b1f14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#8c1d1d]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c1d1d]">
              HỒ SƠ TÀI LIỆU // {questionTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isQuestionNode && (targetCpId || matchedCheckpoint?.id) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  detectiveAudio.playTypewriterClick();
                  emitInvestigationEvent("OPEN_HINT", {
                    checkpointId: targetCpId || matchedCheckpoint?.id,
                  });
                }}
                className="px-2 py-1 bg-[#dfd3bd] hover:bg-[#d4c5ab] text-[#8c1d1d] hover:text-[#6e1515] border border-[#a88c6f] font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                title="Mở gợi ý phá án chuyên sâu"
              >
                <Lightbulb className="size-3 text-[#8c1d1d]" />
                <span className="hidden sm:inline">GỢI Ý</span>
              </button>
            )}

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
              {pin.label || questionTitle}
            </h3>
            {pin.detail && (
              <p className="mt-2 text-xs sm:text-sm text-[#382618] font-mono leading-relaxed whitespace-pre-line p-3 bg-[#ebdcc4] border border-[#a88c6f]/60 rounded">
                {pin.detail}
              </p>
            )}
          </div>

          {/* Checkpoint / Question Section */}
          {isQuestionNode && (
            <div className="pt-3 border-t-2 border-[#2b1f14]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8c1d1d]">
                  <HelpCircle className="size-4" />
                  <span>CÂU HỎI ĐIỀU TRA:</span>
                </div>
                {targetCpId && (
                  <span className="text-[10px] font-mono bg-[#8c1d1d]/10 text-[#8c1d1d] px-2 py-0.5 border border-[#8c1d1d]/30 font-bold">
                    {targetCpId.toUpperCase()}
                  </span>
                )}
              </div>

              {questionText && (
                <div className="text-xs sm:text-sm font-mono font-bold text-[#2b1f14] p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d]/40 leading-relaxed whitespace-pre-line">
                  {questionText}
                </div>
              )}

              {/* Form Input Container */}
              {!isSolved ? (
                <div className="space-y-3">
                  {/* TYPE A: EVIDENCE PICKER */}
                  {checkpointType === "evidence_picker" &&
                  matchedCheckpoint?.pickerConfig ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#5c4026] mb-1">
                          {matchedCheckpoint.pickerConfig.suspectLabel ||
                            "Tên đối tượng tình nghi:"}
                        </label>
                        <input
                          type="text"
                          value={selectedSuspect}
                          onChange={(e) => setSelectedSuspect(e.target.value)}
                          placeholder="Nhập tên đối tượng (VD: Lê Quang Vũ)..."
                          className="w-full px-3 py-2 bg-white border-2 border-[#2b1f14] font-mono text-xs text-[#1a120b] focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-[#5c4026] mb-1.5">
                          {matchedCheckpoint.pickerConfig.evidenceStepLabel ||
                            "Chọn tài liệu & chứng cứ buộc tội:"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 border border-[#2b1f14]/30 bg-[#ebdcc4]/40 rounded">
                          {(
                            matchedCheckpoint.pickerConfig.availableEvidences ||
                            []
                          ).map((ev) => {
                            const isChecked =
                              selectedEvidences.includes(ev.id) ||
                              Boolean(
                                ev.code && selectedEvidences.includes(ev.code),
                              );
                            return (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => toggleEvidenceSelect(ev.id)}
                                className={`p-2 border text-left font-mono text-[11px] flex items-start gap-2 transition-all ${
                                  isChecked
                                    ? "bg-[#8c1d1d] text-[#f6f1e5] border-[#2b1f14] font-bold"
                                    : "bg-white text-[#1a120b] border-[#2b1f14]/30 hover:border-[#8c1d1d]"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="size-3.5 shrink-0 mt-0.5 text-amber-300" />
                                ) : (
                                  <Square className="size-3.5 shrink-0 mt-0.5 text-[#5c4026]" />
                                )}
                                <div className="truncate">
                                  <span className="font-bold block">
                                    [{ev.code}] {ev.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : checkpointType === "text_match_3" &&
                    matchedCheckpoint?.textMatchConfig?.inputs ? (
                    /* TYPE B: TEXT MATCH 3 (3 PHONE NUMBERS) */
                    <div className="space-y-2.5">
                      {matchedCheckpoint.textMatchConfig.inputs.map(
                        (inp, idx) => (
                          <div key={inp.id}>
                            <label className="block text-[11px] font-mono font-semibold text-[#5c4026] mb-1">
                              {inp.label}
                            </label>
                            <input
                              type="text"
                              value={
                                idx === 0
                                  ? phoneInput1
                                  : idx === 1
                                    ? phoneInput2
                                    : phoneInput3
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (idx === 0) setPhoneInput1(val);
                                else if (idx === 1) setPhoneInput2(val);
                                else setPhoneInput3(val);
                              }}
                              placeholder={inp.placeholder}
                              className="w-full px-3 py-2 bg-white border-2 border-[#2b1f14] font-mono text-xs text-[#1a120b] focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    /* TYPE C: STANDARD TEXT INPUT */
                    <div>
                      <label className="block text-[11px] font-mono font-semibold text-[#5c4026] mb-1">
                        Nhập đáp án suy luận:
                      </label>
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Nhập câu trả lời..."
                        className="w-full px-3.5 py-2.5 bg-white border-2 border-[#2b1f14] font-mono text-xs text-[#1a120b] focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
                      />
                    </div>
                  )}

                  {/* Hints Display — Multi-level from Google Sheets */}
                  {hintsList.length > 0 && (
                    <div className="p-2.5 bg-[#ebdcc4]/80 border-2 border-[#a88c6f]/60 rounded-none space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#8c1d1d] uppercase border-b border-[#a88c6f]/30 pb-1">
                        <span className="flex items-center gap-1">
                          <Lightbulb className="size-3 text-[#8c1d1d]" />
                          GỢI Ý MỨC {activeHintIdx + 1}/{hintsList.length}
                        </span>
                        {hintsList.length > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={activeHintIdx === 0}
                              onClick={() => {
                                detectiveAudio.playTypewriterClick();
                                setActiveHintIdx((prev) => Math.max(prev - 1, 0));
                              }}
                              className="p-0.5 bg-[#dfd3bd] hover:bg-[#d4c5ab] disabled:opacity-30 disabled:cursor-not-allowed border border-[#4a3520] cursor-pointer"
                              title="Gợi ý trước"
                            >
                              <ChevronLeft className="size-3" />
                            </button>
                            <button
                              type="button"
                              disabled={activeHintIdx >= hintsList.length - 1}
                              onClick={() => {
                                detectiveAudio.playTypewriterClick();
                                setActiveHintIdx((prev) => Math.min(prev + 1, hintsList.length - 1));
                              }}
                              className="p-0.5 bg-[#dfd3bd] hover:bg-[#d4c5ab] disabled:opacity-30 disabled:cursor-not-allowed border border-[#4a3520] cursor-pointer"
                              title="Gợi ý sâu hơn"
                            >
                              <ChevronRight className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#3d2c1e] italic leading-relaxed">
                        {hintsList[activeHintIdx]}
                      </p>
                    </div>
                  )}

                  {/* Feedback Banner */}
                  {feedback && (
                    <div
                      className={`p-2.5 rounded font-mono text-xs flex items-center gap-2 ${
                        feedback.type === "success"
                          ? "bg-emerald-950/10 border border-emerald-700 text-emerald-900 font-bold"
                          : "bg-red-950/10 border border-red-700 text-red-900"
                      }`}
                    >
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-700" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-red-700" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleCheckAnswer()}
                    className="w-full py-2.5 bg-[#8c1d1d] hover:bg-[#6b1616] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider transition-colors border-2 border-[#2b1f14]"
                  >
                    XÁC NHẬN ĐÁP ÁN
                  </button>
                </div>
              ) : (
                /* Solved State */
                <div className="p-4 bg-emerald-900/15 border-2 border-emerald-700 text-emerald-950 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="size-5 shrink-0" />
                    <span>ĐÃ GIẢI QUYẾT XONG CÂU HỎI!</span>
                  </div>
                  {unlockedEvidence && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-500/10 p-2 border border-emerald-600/30">
                      <Unlock className="size-4" />
                      <span>
                        Manh mối mở khóa: <strong>{unlockedEvidence}</strong>
                      </span>
                    </div>
                  )}
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
