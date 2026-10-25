"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { TypewriterNarrator } from "@/components/investigation/evidence/typewriter-narrator";
import { detectiveAudio } from "@/lib/investigation-audio";
import { useCaseCheckpoints } from "@/lib/hooks/use-case-checkpoints";
import { useOptionalCaseCharacters } from "@/components/investigation/case-characters-context";

interface CulpritEpilogueModalProps {
  isOpen: boolean;
  culprit?: string | null;
  subjectKey?: string | null;
  choice?: string | null;
  onClose: () => void;
  onOpenDossier?: (dossierType: "A" | "B" | "C") => void;
  onOpenFollowupQuestion?: (
    targetCulprit?: string,
  ) => void;
  onOpenIndictment?: () => void;
  caseId?: string;
}

export function CulpritEpilogueModal({
  isOpen,
  culprit,
  subjectKey,
  choice,
  onClose,
  onOpenDossier: _onOpenDossier,
  onOpenFollowupQuestion,
  onOpenIndictment,
  caseId,
}: CulpritEpilogueModalProps) {
  const charactersContext = useOptionalCaseCharacters();
  const characters = charactersContext?.characters || [];
  const { checkpoints } = useCaseCheckpoints(caseId);
  const [isNarrativeComplete, setIsNarrativeComplete] = useState(false);
  const [internalChoice, setInternalChoice] = useState<
    "CÓ" | "KHÔNG" | "tin" | "khong_tin" | null
  >(
    choice === "CÓ" ||
      choice === "KHÔNG" ||
      choice === "tin" ||
      choice === "khong_tin"
      ? (choice as "CÓ" | "KHÔNG" | "tin" | "khong_tin")
      : null,
  );

  const targetCulprit = subjectKey || culprit || null;

  React.useEffect(() => {
    setIsNarrativeComplete(false);
    if (
      choice === "CÓ" ||
      choice === "KHÔNG" ||
      choice === "tin" ||
      choice === "khong_tin"
    ) {
      setInternalChoice(choice as "CÓ" | "KHÔNG" | "tin" | "khong_tin");
    } else {
      setInternalChoice(null);
    }
  }, [targetCulprit, choice, isOpen]);

  if (!isOpen || !targetCulprit) return null;

  const matchedCharacter = characters.find(
    (c) =>
      c.key === targetCulprit ||
      c.key.toLowerCase() === targetCulprit.toLowerCase() ||
      c.name.toLowerCase() === targetCulprit.toLowerCase(),
  );

  const isCulpritSolved =
    choice === "solved_box" ||
    choice === "solved" ||
    choice === "matched_3_tiles" ||
    choice === "matched_3_tiles_indictment" ||
    choice === "indictment_ready";
  const isQuestionSolved = Boolean(choice) && !isCulpritSolved;
  const showTwoChoiceButtons =
    isQuestionSolved &&
    !internalChoice;

  const matchedCp = checkpoints.find(
    (c) =>
      (c.subjectKey &&
        (c.subjectKey.toLowerCase() === targetCulprit.toLowerCase() ||
          c.subjectKey.toLowerCase() ===
            matchedCharacter?.key.toLowerCase())) ||
      c.id.toLowerCase() === targetCulprit.toLowerCase() ||
      c.id.toLowerCase().includes(targetCulprit.toLowerCase()) ||
      c.title?.toLowerCase().includes(targetCulprit.toLowerCase()),
  );

  const suspectName =
    matchedCharacter?.name ||
    matchedCp?.title?.replace(/^Hồ sơ\s*[:\s]*/i, "") ||
    targetCulprit ||
    "Nghi phạm";

  const getCheckpointMonologue = (cpId: string) => {
    const cp = checkpoints.find((c) => c.id === cpId || c.id.endsWith(cpId));
    if (cp?.storyConfig?.monologue) return cp.storyConfig.monologue;
    // Tìm checkpoint epilogue tổng kết chứa epilogueStories (L1 fix)
    const merged = checkpoints.find(
      (c) =>
        c.kind === "epilogue" ||
        (c.epilogueStories && c.epilogueStories.length > 0),
    );
    if (merged?.epilogueStories) {
      const match = merged.epilogueStories.find(
        (s) => s.id === cpId || s.id?.endsWith(cpId),
      );
      if (match?.monologue) return match.monologue;
    }
    return cp?.storyConfig?.monologue || "";
  };

  const dateLabel = isCulpritSolved
    ? `BẢN KẾT LUẬN ĐIỀU TRA — KẾT ÁN THỦ PHẠM ${suspectName.toUpperCase()}`
    : `THÔNG BÁO ĐIỀU TRA — ${suspectName.toUpperCase()}`;

  let storyText = "";

  if (isCulpritSolved) {
    // Narrative kết án trực tiếp từ checkpoint indictment hoặc epilogue
    const dynamicIndictmentCp = checkpoints.find(
      (c) =>
        c.kind === "indictment" ||
        c.kind === "epilogue" ||
        c.id.includes("indictment"),
    );
    storyText =
      dynamicIndictmentCp?.narrative ||
      dynamicIndictmentCp?.storyConfig?.monologue ||
      getCheckpointMonologue(dynamicIndictmentCp?.id || "") ||
      getCheckpointMonologue("cp-epilogue-ha") ||
      `Toàn bộ vật chứng chí mạng đã vạch trần tội ác!\n\nBức tường ngoại phạm của ${suspectName} hoàn toàn sụp đổ.\n\nĐã có đủ căn cứ pháp lý đanh thép để khởi tố và định tội hung thủ!`;
  } else if (showTwoChoiceButtons) {
    storyText = `Toàn bộ hành tung của ${suspectName} trong đêm xảy ra vụ án đã được thu thập & phân tích. Các mảnh ghép đã dần lộ diện.\n\nDựa vào những gì đang nắm giữ, bạn có tin đối tượng này vô tội?`;
  } else if (internalChoice === "CÓ" || internalChoice === "tin") {
    storyText = `Bạn lựa chọn tạm thời tin tưởng ${suspectName}.\n\nHãy chuyển hướng điều tra vụ án.\nTuy nhiên, xin các thám tử nhớ rằng: Một người chỉ được kết luận vô tội khi bạn tìm ra được hung thủ thực sự.`;
  } else if (internalChoice === "KHÔNG" || internalChoice === "khong_tin") {
    storyText = `Bạn không tin đối tượng ${suspectName} vô tội.\n\nHãy lập tức mở rộng điều tra, truy quét thêm các manh mối để chứng minh suy luận của mình.`;
  } else {
    const suspectCp =
      checkpoints.find(
        (c) =>
          c.kind === "suspect_interrogation" &&
          (c.subjectKey === targetCulprit ||
            c.id?.endsWith(`-${targetCulprit}`)),
      ) || matchedCp;
    const epilogueCp = checkpoints.find(
      (c) =>
        c.kind === "epilogue" &&
        (c.subjectKey === targetCulprit || c.id?.includes(targetCulprit)),
    );
    storyText =
      suspectCp?.narrative ||
      suspectCp?.storyConfig?.monologue ||
      epilogueCp?.narrative ||
      epilogueCp?.storyConfig?.monologue ||
      getCheckpointMonologue(suspectCp?.id || "") ||
      getCheckpointMonologue(epilogueCp?.id || "") ||
      `Hồ sơ điều tra của đối tượng ${suspectName} đã được ghi nhận vào hệ thống.`;
  }

  let ctaButtonText = "TIẾP TỤC ĐIỀU TRA";
  if (isCulpritSolved) {
    ctaButtonText = "LẬP BẢN CÁO TRẠNG ĐỊNH TỘI";
  } else if (!choice && !internalChoice) {
    ctaButtonText = "Bắt đầu điều tra";
  } else if (internalChoice === "tin") {
    ctaButtonText = "Chuyển hướng điều tra";
  } else if (internalChoice === "khong_tin") {
    ctaButtonText = "Mở rộng điều tra";
  }

  const handleCtaClick = () => {
    detectiveAudio.playStampSound();
    if (isCulpritSolved) {
      onClose();
      if (onOpenIndictment) {
        onOpenIndictment();
      }
      return;
    }
    if (!choice && !internalChoice) {
      onClose();
      if (onOpenFollowupQuestion) {
        onOpenFollowupQuestion(targetCulprit || undefined);
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none pt-safe">
        {/* CRT Scanlines effect */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Main Fullscreen Cinematic Container */}
        <div className="relative z-20 flex-1 h-full flex flex-col justify-between items-center p-4 sm:p-8 max-w-3xl mx-auto w-full overflow-hidden">
          <div className="space-y-6 w-full flex-1 flex flex-col items-start my-auto py-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Top Date / Subject Header */}
            <div className="font-mono text-xs sm:text-sm text-[#d9a066] font-bold tracking-widest uppercase border-b border-[#261b12] pb-3 w-full flex items-center justify-between shrink-0">
              <span>{dateLabel}</span>
            </div>

            {/* Typewriter Monologue */}
            <div className="pt-2 w-full flex-1 overflow-y-auto custom-scrollbar">
              <TypewriterNarrator
                key={`${targetCulprit}-${internalChoice || (showTwoChoiceButtons ? "choice" : "default")}`}
                text={storyText}
                speed={12}
                onComplete={() => setIsNarrativeComplete(true)}
              />
            </div>
          </div>

          {/* Bottom Action Area */}
          {showTwoChoiceButtons ? (
            <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle();
                  setInternalChoice("tin");
                }}
                className="py-3.5 bg-[#2e5220] hover:bg-[#203a16] text-[#f6f1e5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#193310] active:scale-[0.99]"
              >
                <span>CÓ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playGlassSound();
                  setInternalChoice("khong_tin");
                }}
                className="py-3.5 bg-[#8c1d1d] hover:bg-[#a82424] text-[#fff5f5] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 border-2 border-[#5c1313] active:scale-[0.99]"
              >
                <span>KHÔNG</span>
              </button>
            </div>
          ) : (
            <div className="w-full pt-4 pb-2 shrink-0 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full py-3.5 bg-[#d9a066] hover:bg-[#c98f55] text-[#1a0f07] font-mono text-sm font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] animate-fade-in"
              >
                <Search className="size-4.5" />
                <span>{ctaButtonText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
