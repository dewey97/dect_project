"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { isAdminBypassCode } from "@/lib/cases/admin-bypass";
import { getStorageItem, setStorageItem, getStorageJson } from "@/lib/storage";
import { normalizeImageUrl } from "@/lib/utils";
import { useCaseEvidence } from "@/lib/hooks/use-case-evidence";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
// Removed dead HaDiscoveredPhotosPopup
import { FollowupTimeForm } from "./followup/followup-time-form";
import { FollowupChoiceForm } from "./followup/followup-choice-form";
import { FollowupCodeForm } from "./followup/followup-code-form";
import { FollowupTextForm } from "./followup/followup-text-form";
import { caseStorageKey } from "@/lib/cases/case-id";
import { verifyCheckpointOnServer } from "@/lib/checkpoints/client-verify";
import { useOptionalCaseCharacters } from "@/components/investigation/case-characters-context";

interface FollowupQuestionModalProps {
  caseId?: string;
  isOpen: boolean;
  culprit?: string | null;
  subjectKey?: string | null;
  onClose: () => void;
  onSuccess?: (culprit: string, choice?: string) => void;
  onOpenDossier?: (dossierType: "A" | "B" | "C") => void;
  isPhoneSolved?: boolean;
}

const DEFAULT_CHOICE_OPTIONS = [
  { id: "CÓ", label: "CÓ" },
  { id: "KHÔNG", label: "KHÔNG" },
];

export function FollowupQuestionModal({
  caseId = "case-000",
  isOpen,
  culprit,
  subjectKey,
  onClose,
  onSuccess,
  onOpenDossier,
  isPhoneSolved,
}: FollowupQuestionModalProps) {
  const targetCulprit = subjectKey || culprit || null;
  const charactersContext = useOptionalCaseCharacters();
  const characters = charactersContext?.characters || [];
  const normalizedCaseId = useMemo(() => caseId.replace(/-/g, "_"), [caseId]);
  const { checkpoints } = useCaseCheckpoints(caseId);

  const matchedCharacter = useMemo(() => {
    if (!targetCulprit) return null;
    const low = targetCulprit.toLowerCase().trim();
    return characters.find(
      (c) => c.key.toLowerCase() === low || c.name.toLowerCase() === low,
    );
  }, [characters, targetCulprit]);

  // Input states theo từng nhóm generic input
  const [timeInput, setTimeInput] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [showPhotoPopup, setShowPhotoPopup] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch photos dynamically from Supabase case_evidence
  const { rawEvidence: rawSheetPhotos } = useCaseEvidence(caseId);

  // 1. Tự động nhận diện Checkpoint tương ứng với đối tượng đang thẩm vấn
  const activeCheckpoint = useMemo(() => {
    if (!targetCulprit) return null;
    const cLow = targetCulprit.toLowerCase().trim();
    const charKeyLow = matchedCharacter?.key.toLowerCase().trim();
    return (
      checkpoints.find(
        (cp) =>
          cp.kind === "followup" &&
          ((cp.subjectKey &&
            (cp.subjectKey.toLowerCase().trim() === cLow ||
              cp.subjectKey.toLowerCase().trim() === charKeyLow)) ||
            (cp.followupOf &&
              (cp.followupOf.toLowerCase().trim() === cLow ||
                cp.followupOf.toLowerCase().trim() === charKeyLow))),
      ) ||
      checkpoints.find(
        (cp) =>
          cp.subjectKey &&
          (cp.subjectKey.toLowerCase().trim() === cLow ||
            cp.subjectKey.toLowerCase().trim() === charKeyLow),
      ) ||
      checkpoints.find(
        (cp) =>
          cp.followupOf &&
          (cp.followupOf.toLowerCase().trim() === cLow ||
            cp.followupOf.toLowerCase().trim() === charKeyLow),
      ) ||
      checkpoints.find((cp) => cp.id === `cp-${cLow}-followup`) ||
      checkpoints.find((cp) => cp.id === `cp-${cLow}`) ||
      checkpoints.find((cp) => {
        const titleLower = (cp.title || "").toLowerCase();
        const qLower = (cp.question || "").toLowerCase();
        return titleLower.includes(cLow) || qLower.includes(cLow);
      }) ||
      null
    );
  }, [checkpoints, targetCulprit, matchedCharacter]);

  // 2. Xác định Loại Form tương tác tổng quan (time | choice | code | text)
  const questionType = useMemo<"time" | "choice" | "code" | "text">(() => {
    const rawType = (
      activeCheckpoint?.inputType ||
      activeCheckpoint?.questionType ||
      activeCheckpoint?.type
    )
      ?.toString()
      .toLowerCase()
      .trim();

    if (rawType === "time") return "time";
    if (
      rawType === "choice" ||
      rawType === "select" ||
      (activeCheckpoint?.options && activeCheckpoint.options.length > 0)
    ) {
      return "choice";
    }
    if (rawType === "code" || rawType === "password" || rawType === "passcode")
      return "code";
    if (rawType === "text") return "text";

    return "text";
  }, [activeCheckpoint, targetCulprit]);

  // Tên hiển thị của nhân vật
  const suspectDisplayLabel = useMemo(() => {
    if (!targetCulprit) return "";
    if (matchedCharacter?.name) return matchedCharacter.name;
    if (activeCheckpoint?.suspectLabel) return activeCheckpoint.suspectLabel;

    if (Array.isArray(rawSheetPhotos)) {
      const match = rawSheetPhotos.find((p: any) => {
        const code = String(p.code || p.photo_code || "").toLowerCase();
        return code === targetCulprit || code === `avatar_${targetCulprit}`;
      });
      if (match) {
        return String((match as any).label || match.title || "")
          .replace(
            /^(Ảnh chân dung|Ảnh thẻ|Ảnh|Chân dung|Nạn nhân|Nghi phạm|Nhân chứng)\s+/i,
            "",
          )
          .replace(/\s*\([^)]*\)/g, "")
          .trim();
      }
    }
    return targetCulprit;
  }, [targetCulprit, matchedCharacter, activeCheckpoint, rawSheetPhotos]);

  // Tiêu đề modal câu hỏi
  const modalTitle = useMemo(() => {
    if (activeCheckpoint?.title) return activeCheckpoint.title;
    if (questionType === "code") return "HỒ SƠ MỞ RỘNG // HỘP THIẾC ĐÁNG NGỜ";
    if (questionType === "time")
      return "CÂU HỎI ĐIỀU TRA // XÁC MINH MỐC THỜI GIAN";
    if (questionType === "choice") return "HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN";
    return "HỒ SƠ MỞ RỘNG // CÂU HỎI SUY LUẬN";
  }, [activeCheckpoint, questionType]);

  // Lấy danh sách ảnh vật chứng khám xét (D-06, D-05, D-04) từ Live CMS
  const discoveredPhotos = useMemo(() => {
    if (!rawSheetPhotos || rawSheetPhotos.length === 0) return [];

    const mappedPhotos = rawSheetPhotos
      .filter((p: any) =>
        Boolean(p.drive_url || p.direct_cdn_url || p.url || p.local_file_path),
      )
      .map((p: any, idx: number) => ({
        id: (p.code || p.photo_code || `photo-ev-${idx}`).trim(),
        title: (
          p.label ||
          p.title ||
          p.file_name ||
          `Vật chứng #${idx + 1}`
        ).trim(),
        url: normalizeImageUrl(
          p.direct_cdn_url || p.drive_url || p.url || p.local_file_path || "",
        ),
      }));

    const TARGET_CODES =
      activeCheckpoint?.photoCodes && activeCheckpoint.photoCodes.length >= 3
        ? activeCheckpoint.photoCodes
        : ["D-06", "D-05", "D-04"];

    const discovered: Array<{ id: string; title: string; url: string }> = [];

    for (const code of TARGET_CODES) {
      const cleanCode = code.trim().toLowerCase();
      const normCode = cleanCode.replace(/[-_\s]/g, "");

      const found = mappedPhotos.find((p) => {
        const pid = p.id.toLowerCase();
        const pidNorm = pid.replace(/[-_\s]/g, "");
        const ptitle = p.title.toLowerCase();
        return (
          pid === cleanCode ||
          pidNorm === normCode ||
          ptitle.startsWith(cleanCode) ||
          ptitle.startsWith(`${cleanCode}:`) ||
          ptitle.includes(`[${cleanCode}]`) ||
          ptitle.includes(`(${cleanCode})`)
        );
      });

      if (found && !discovered.some((item) => item.id === found.id)) {
        discovered.push(found);
      }
    }

    if (discovered.length < 3) {
      const codeFallbacks: Array<{ code: string; keywords: string[] }> = [
        { code: "D-06", keywords: ["d-06", "d06", "bùa", "túi bùa"] },
        { code: "D-05", keywords: ["d-05", "d05", "kéo"] },
        { code: "D-04", keywords: ["d-04", "d04", "tóc", "túi zip"] },
      ];

      for (const fb of codeFallbacks) {
        if (discovered.length >= 3) break;
        const alreadyHas = discovered.some((d) => {
          const did = d.id.toLowerCase();
          return (
            did.includes(fb.code.toLowerCase()) ||
            fb.keywords.some(
              (kw) => did.includes(kw) || d.title.toLowerCase().includes(kw),
            )
          );
        });
        if (alreadyHas) continue;

        const found = mappedPhotos.find((p) => {
          const pid = p.id.toLowerCase();
          const ptitle = p.title.toLowerCase();
          return (
            fb.keywords.some((kw) => pid.includes(kw) || ptitle.includes(kw)) &&
            !discovered.some((d) => d.id === p.id)
          );
        });

        if (found) {
          discovered.push(found);
        }
      }
    }

    if (discovered.length < 3) {
      for (const p of mappedPhotos) {
        const t = p.title.toLowerCase();
        if (t.includes("chân dung") || p.id.toLowerCase().startsWith("avatar_"))
          continue;
        if (!discovered.some((item) => item.id === p.id)) {
          discovered.push(p);
        }
        if (discovered.length >= 3) break;
      }
    }

    return discovered.slice(0, 3);
  }, [rawSheetPhotos, activeCheckpoint]);

  const openTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
    }
  }, [isOpen]);

  // Preload ảnh nếu là dạng câu hỏi mở hộp vật chứng
  useEffect(() => {
    if (!isOpen || questionType !== "code" || discoveredPhotos.length === 0)
      return;
    discoveredPhotos.forEach((photo) => {
      if (photo.url) {
        const img = new Image();
        img.src = photo.url;
      }
    });
  }, [isOpen, questionType, discoveredPhotos]);

  // Khôi phục giá trị đã lưu khi mở modal
  useEffect(() => {
    if (!targetCulprit || !isOpen) return;
    setErrorMsg("");
    setShowPhotoPopup(false);

    if (questionType === "code") {
      setCodeInput("");
    } else if (questionType === "time") {
      const savedTime =
        getStorageItem(caseStorageKey(caseId, `followup_${targetCulprit}`)) ||
        getStorageItem(caseStorageKey(caseId, "followup_vu"));
      setTimeInput(savedTime || "");
    } else if (questionType === "choice") {
      const savedChoice =
        getStorageItem(caseStorageKey(caseId, `followup_${targetCulprit}`)) ||
        getStorageItem(caseStorageKey(caseId, "followup_tung"));
      setSelectedChoice(savedChoice || null);
    } else {
      const savedText = getStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}`),
      );
      setTextInput(savedText || "");
      setSelectedChoice(savedText || null);
    }
  }, [targetCulprit, isOpen, questionType, caseId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetCulprit) return null;

  // 1. Xử lý nộp đáp án Mốc Thời Gian (Time Form)
  const handleSubmitTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAnswer = timeInput.trim();
    const normalized = rawAnswer.toLowerCase().replace(/\s+/g, "");
    if (!normalized) {
      setErrorMsg("Vui lòng nhập mốc thời gian!");
      detectiveAudio.playGlassSound();
      return;
    }

    const isBypass = isAdminBypassCode(normalized);
    let isCorrect = isBypass;

    if (!isBypass && activeCheckpoint?.id) {
      // 1. Thử chấm server-side trước
      const serverResult = await verifyCheckpointOnServer({
        caseId: normalizedCaseId,
        checkpointId: activeCheckpoint.id,
        answer: rawAnswer,
      });

      if (serverResult.success) {
        isCorrect = serverResult.correct;
        // If server returned `success: true` but `correct: false`, try client-side fallback
        if (!isCorrect) {
          const expected = (activeCheckpoint.correctAnswer || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");
          isCorrect =
            Boolean(expected) &&
            (normalized === expected ||
              normalized === expected.replace(":", "h") ||
              normalized === expected.replace("h", ":"));
        }
      } else {
        // Server did not succeed, fallback offline client-side
        const expected = (activeCheckpoint.correctAnswer || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "");
        isCorrect =
          Boolean(expected) &&
          (normalized === expected ||
            normalized === expected.replace(":", "h") ||
            normalized === expected.replace("h", ":"));
      }
    }

    if (isCorrect) {
      detectiveAudio.playStampSound();
      setErrorMsg("");
      const finalAnswer = activeCheckpoint?.correctAnswer || timeInput.trim();
      setStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}`),
        finalAnswer,
      );
      if (onSuccess) {
        onSuccess(targetCulprit, finalAnswer);
      }
      onClose();
    } else {
      detectiveAudio.playGlassSound();
      setErrorMsg(
        "⚠️ Đáp án chưa chính xác. Vui lòng kiểm tra lại mốc thời gian trong tài liệu!",
      );
    }
  };

  // 2. Xử lý nộp đáp án Trắc nghiệm (Choice Form)
  const handleSubmitChoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChoice) {
      setErrorMsg("Vui lòng tích chọn một phương án trả lời!");
      detectiveAudio.playGlassSound();
      return;
    }

    const isBypass = isAdminBypassCode(selectedChoice);
    const selectedLabel =
      choiceOptions.find((opt) => opt.id === selectedChoice)?.label ??
      selectedChoice;
    let isCorrect = isBypass;

    if (!isBypass && activeCheckpoint?.id) {
      const serverResult = await verifyCheckpointOnServer({
        caseId: normalizedCaseId,
        checkpointId: activeCheckpoint.id,
        answer: selectedLabel,
      });

      if (serverResult.success && serverResult.correct) {
        isCorrect = true;
      } else {
        // Fallback offline client-side
        const expected = (activeCheckpoint.correctAnswer || "")
          .trim()
          .toLowerCase();
        isCorrect =
          !expected ||
          selectedLabel.trim().toLowerCase() === expected ||
          selectedChoice.trim().toLowerCase() === expected;
      }
    }

    if (isCorrect) {
      detectiveAudio.playStampSound();
      setErrorMsg("");
      setStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}`),
        selectedChoice,
      );
      if (onSuccess) {
        onSuccess(targetCulprit, selectedChoice);
      }
      onClose();
    } else {
      detectiveAudio.playGlassSound();
      setErrorMsg(
        "⚠️ Đáp án chưa chính xác. Vui lòng rà soát lại các manh mối!",
      );
    }
  };

  // 3. Xử lý nộp đáp án Mật mã / Khóa số (Code Form)
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = codeInput.trim().toLowerCase().replace(/\s+/g, "");
    if (!rawVal) {
      setErrorMsg("Vui lòng nhập mã khóa số / mật khẩu!");
      detectiveAudio.playGlassSound();
      return;
    }

    const isMasterBypass = isAdminBypassCode(rawVal);
    let isCorrect = isMasterBypass;

    if (!isMasterBypass && activeCheckpoint?.id) {
      const serverResult = await verifyCheckpointOnServer({
        caseId: normalizedCaseId,
        checkpointId: activeCheckpoint.id,
        answer: codeInput.trim(),
      });

      if (serverResult.success) {
        isCorrect = serverResult.correct;
      } else {
        // Fallback offline
        const expected = (activeCheckpoint.correctAnswer || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "");
        isCorrect =
          Boolean(expected) &&
          (rawVal === expected ||
            (expected.length >= 6 && expected.includes(rawVal)));
      }
    }

    if (isCorrect) {
      detectiveAudio.playStampSound();
      setErrorMsg("");
      setStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}_password`),
        rawVal,
      );
      setStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}`),
        rawVal || "solved",
      );
      if (onSuccess) onSuccess(targetCulprit, rawVal || "solved");
      onClose();
    } else {
      detectiveAudio.playGlassSound();
      setErrorMsg(
        "⚠️ Mật khẩu chưa chính xác. Hãy rà soát lại các manh mối và ghi chú liên quan!",
      );
    }
  };

  // 4. Xử lý nộp đáp án Tự luận (Text Form)
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = textInput.trim();
    if (!rawVal && !selectedChoice) {
      setErrorMsg("Vui lòng nhập câu trả lời hoặc chọn một phương án!");
      detectiveAudio.playGlassSound();
      return;
    }

    const finalVal = selectedChoice || rawVal;
    const isBypass = isAdminBypassCode(finalVal);
    let isCorrect = isBypass;

    if (!isBypass && activeCheckpoint?.id) {
      const serverResult = await verifyCheckpointOnServer({
        caseId: normalizedCaseId,
        checkpointId: activeCheckpoint.id,
        answer: finalVal,
      });

      if (serverResult.success) {
        isCorrect = serverResult.correct;
      } else {
        const expected = (activeCheckpoint.correctAnswer || "")
          .trim()
          .toLowerCase();
        isCorrect =
          !expected ||
          finalVal.toLowerCase().replace(/\s+/g, "") ===
            expected.replace(/\s+/g, "");
      }
    }

    if (isCorrect) {
      detectiveAudio.playStampSound();
      setErrorMsg("");
      setStorageItem(
        caseStorageKey(caseId, `followup_${targetCulprit}`),
        finalVal,
      );
      if (onSuccess) {
        onSuccess(targetCulprit, finalVal);
      }
      onClose();
    } else {
      detectiveAudio.playGlassSound();
      setErrorMsg(
        "⚠️ Đáp án chưa chính xác. Vui lòng kiểm tra lại tài liệu điều tra!",
      );
    }
  };

  const handleFinishAfterPhotoPopup = () => {
    detectiveAudio.playStampSound();
    setShowPhotoPopup(false);
    if (onSuccess) {
      onSuccess(targetCulprit, "solved_box");
    }
    onClose();
  };

  const choiceQuestionText =
    activeCheckpoint?.question ||
    "Toàn bộ lời khai và hành tung của đối tượng đã được thu thập & phân tích.\n\nDựa vào những gì đang nắm giữ, bạn đưa ra nhận định thế nào về đối tượng này?";

  const choiceOptions = useMemo(() => {
    if (activeCheckpoint?.options && activeCheckpoint.options.length > 0) {
      return activeCheckpoint.options.map((opt) => ({
        id: opt,
        label: opt,
      }));
    }
    return DEFAULT_CHOICE_OPTIONS;
  }, [activeCheckpoint]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (Date.now() - openTimeRef.current < 350) return;
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[92vh] cursor-default"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="size-5 text-amber-800" />
              <div>
                <h3 className="font-mono font-bold text-xs sm:text-sm md:text-base text-[#1a120b] uppercase tracking-wider">
                  {modalTitle}
                </h3>
                {suspectDisplayLabel && (
                  <span className="font-mono text-xs font-bold text-[#8c1d1d] block mt-0.5">
                    Đối tượng: {suspectDisplayLabel}
                  </span>
                )}
              </div>
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

          {/* DYNAMIC FORM ROUTER THEO QUESTION TYPE */}
          {questionType === "time" && (
            <FollowupTimeForm
              caseId={caseId}
              checkpoint={activeCheckpoint}
              timeInput={timeInput}
              onTimeInputChange={setTimeInput}
              errorMsg={errorMsg}
              onClearError={() => setErrorMsg("")}
              onSubmit={handleSubmitTime}
              onClose={onClose}
            />
          )}

          {questionType === "choice" && (
            <FollowupChoiceForm
              caseId={caseId}
              checkpoint={activeCheckpoint}
              questionText={choiceQuestionText}
              options={choiceOptions}
              selectedOption={selectedChoice}
              onSelectOption={(id) => {
                setSelectedChoice(id);
                setErrorMsg("");
              }}
              errorMsg={errorMsg}
              onClearError={() => setErrorMsg("")}
              onSubmit={handleSubmitChoice}
              onClose={onClose}
            />
          )}

          {questionType === "code" && (
            <FollowupCodeForm
              caseId={caseId}
              checkpoint={activeCheckpoint}
              codeInput={codeInput}
              onCodeInputChange={setCodeInput}
              errorMsg={errorMsg}
              onClearError={() => setErrorMsg("")}
              onSubmit={handleSubmitCode}
              onClose={onClose}
            />
          )}

          {questionType === "text" && (
            <FollowupTextForm
              caseId={caseId}
              checkpoint={activeCheckpoint}
              textInput={textInput}
              onTextInputChange={setTextInput}
              options={activeCheckpoint?.options}
              selectedOption={selectedChoice}
              onSelectOption={setSelectedChoice}
              errorMsg={errorMsg}
              onClearError={() => setErrorMsg("")}
              onSubmit={handleSubmitText}
              onClose={onClose}
            />
          )}
        </motion.div>
      </div>

      {/* Kết thúc modal câu hỏi phụ */}
    </AnimatePresence>
  );
}
