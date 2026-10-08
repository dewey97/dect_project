"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Checkpoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { detectiveAudio } from "@/lib/investigation-audio";

interface CheckpointPickerFormProps {
  checkpoint: Checkpoint;
  hasSuccess: boolean;
  suspectInput: string;
  onSuspectInputChange: (val: string) => void;
  mismatchTypeSelect: string;
  onMismatchTypeSelectChange: (val: string) => void;
  motiveSelect: string;
  onMotiveSelectChange: (val: string) => void;
  selectedEvidenceIds: string[];
  onToggleEvidenceSelect: (id: string) => void;
  subPickerTile: "overview" | "motive" | "alibi";
  onSubPickerTileChange: (tile: "overview" | "motive" | "alibi") => void;
  motiveEvidences: string[];
  onMotiveEvidencesChange: (evs: string[]) => void;
  alibiEvidences: string[];
  onAlibiEvidencesChange: (evs: string[]) => void;
  onBulkEvidenceSelect: (evs: string[]) => void;
}

export function CheckpointPickerForm({
  checkpoint,
  hasSuccess,
  suspectInput,
  onSuspectInputChange,
  mismatchTypeSelect,
  onMismatchTypeSelectChange,
  motiveSelect,
  onMotiveSelectChange,
  selectedEvidenceIds,
  onToggleEvidenceSelect,
  subPickerTile,
  onSubPickerTileChange,
  motiveEvidences,
  onMotiveEvidencesChange,
  alibiEvidences,
  onAlibiEvidencesChange,
  onBulkEvidenceSelect,
}: CheckpointPickerFormProps) {
  const cp = checkpoint;

  return (
    <div className="space-y-4 pt-1">
      {/* Step 1: Suspect Input */}
      {cp.pickerConfig?.suspectLabel && (
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
            {cp.pickerConfig.suspectLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={hasSuccess}
              value={suspectInput}
              onChange={(e) => onSuspectInputChange(e.target.value)}
              className="w-full bg-[#fdfcf9] border-2 border-[#2b1f14] rounded-none px-4 py-2.5 text-base sm:text-lg text-[#0e2b5c] font-[family-name:var(--font-handwriting)] font-bold focus:outline-none focus:border-black transition-colors shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Step 2 (if applicable): Mismatch type / Motive selection */}
      {cp.pickerConfig?.mismatchTypeLabel &&
        cp.pickerConfig.mismatchTypeOptions && (
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
              {cp.pickerConfig.mismatchTypeLabel}
            </label>
            <div className="space-y-2">
              {cp.pickerConfig.mismatchTypeOptions.map((opt, oIdx) => {
                const isSel =
                  mismatchTypeSelect ===
                  (oIdx === 0 ? "mismatch_location" : `mismatch_${oIdx}`);
                const valKey =
                  oIdx === 0 ? "mismatch_location" : `mismatch_${oIdx}`;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={hasSuccess}
                    onClick={() => onMismatchTypeSelectChange(valKey)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none",
                      isSel
                        ? "bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm"
                        : "bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]",
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
        )}

      {cp.pickerConfig?.motiveLabel && cp.pickerConfig.mismatchTypeOptions && (
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
            {cp.pickerConfig.motiveLabel}
          </label>
          <div className="space-y-2">
            {cp.pickerConfig.mismatchTypeOptions.map((opt, oIdx) => {
              const isSel =
                motiveSelect ===
                (oIdx === 0 ? "motive_jealousy" : `motive_${oIdx}`);
              const valKey =
                oIdx === 0 ? "motive_jealousy" : `motive_${oIdx}`;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={hasSuccess}
                  onClick={() => onMotiveSelectChange(valKey)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-none border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer select-none",
                    isSel
                      ? "bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] font-bold shadow-sm"
                      : "bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]",
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
      )}

      {/* Special 2-Tile Sub-Picker Flow for Interrogations (cp-000-1a / cp-000-1b) */}
      {cp.id === "cp-000-1a" || cp.id === "cp-000-1b" ? (
        <div className="space-y-3 pt-1">
          {subPickerTile === "overview" && (
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
                DANH MỤC THẨM TRA & BÓC TÁCH MANH MỐI:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tile 1: CĂN CỨ ĐỘNG CƠ GÂY ÁN */}
                <button
                  type="button"
                  disabled={hasSuccess}
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    onSubPickerTileChange("motive");
                  }}
                  className={cn(
                    "w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group",
                    motiveEvidences.length > 0
                      ? "bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm"
                      : "bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]",
                  )}
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-6 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0",
                          motiveEvidences.length > 0
                            ? "bg-[#2e5220] border-[#193310] text-white"
                            : "bg-white border-[#4a3520] text-[#4a3520]",
                        )}
                      >
                        {motiveEvidences.length > 0 ? "✓" : "1"}
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b]">
                        📌 CĂN CỨ ĐỘNG CƠ GÂY ÁN
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-[#4a3520] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[0.725rem] font-sans leading-snug pl-8 opacity-85">
                    {motiveEvidences.length > 0 ? (
                      <span className="font-bold text-[#1f4014] flex items-center gap-1">
                        <Check className="size-3.5" /> Đã chọn{" "}
                        {motiveEvidences.length} tài liệu chứng minh
                      </span>
                    ) : (
                      <span>
                        Chọn các tài liệu chứng minh động cơ trục lợi & mâu thuẫn
                      </span>
                    )}
                  </div>
                </button>

                {/* Tile 2: BÓC TRẦN LỜI KHAI NGOẠI PHẠM */}
                <button
                  type="button"
                  disabled={hasSuccess}
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    onSubPickerTileChange("alibi");
                  }}
                  className={cn(
                    "w-full text-left p-3.5 border-2 transition-all flex flex-col justify-between cursor-pointer select-none relative group",
                    alibiEvidences.length > 0
                      ? "bg-[#e7f0dc] border-[#2e5220] text-[#193310] shadow-sm"
                      : "bg-[#f4ebd9] border-[#d4c5b0] hover:border-[#4a3520] text-[#3d2f22]",
                  )}
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-6 border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0",
                          alibiEvidences.length > 0
                            ? "bg-[#2e5220] border-[#193310] text-white"
                            : "bg-white border-[#4a3520] text-[#4a3520]",
                        )}
                      >
                        {alibiEvidences.length > 0 ? "✓" : "2"}
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a120b]">
                        📍 BÓC TRẦN LỜI KHAI NGOẠI PHẠM
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-[#4a3520] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[0.725rem] font-sans leading-snug pl-8 opacity-85">
                    {alibiEvidences.length > 0 ? (
                      <span className="font-bold text-[#1f4014] flex items-center gap-1">
                        <Check className="size-3.5" /> Đã chọn{" "}
                        {alibiEvidences.length} tài liệu bẻ gãy ngoại phạm
                      </span>
                    ) : (
                      <span>
                        Chọn các tài liệu bóc trần mốc giờ & lời khai chối bỏ
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Sub-View for Tile 1: MOTIVE */}
          {subPickerTile === "motive" && (
            <div className="space-y-3 p-3 bg-[#eae0cd] border-2 border-[#2b1f14]">
              <div className="flex items-center justify-between border-b border-[#c8b79e] pb-2">
                <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                  📌 TÀI LIỆU: CĂN CỨ ĐỘNG CƠ GÂY ÁN
                </span>
                <button
                  type="button"
                  onClick={() => onSubPickerTileChange("overview")}
                  className="px-2.5 py-1 bg-[#2b1f14] text-[#d9a066] font-mono text-[0.65rem] font-bold uppercase flex items-center gap-1 hover:bg-[#3d2b1c] cursor-pointer"
                >
                  <ArrowLeft className="size-3" /> QUAY LẠI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {cp.pickerConfig?.availableEvidences?.map((ev) => {
                  const isChecked = motiveEvidences.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      disabled={hasSuccess}
                      onClick={() => {
                        detectiveAudio.playPaperRustle();
                        const next = isChecked
                          ? motiveEvidences.filter((i) => i !== ev.id)
                          : [...motiveEvidences, ev.id];
                        onMotiveEvidencesChange(next);
                        onBulkEvidenceSelect(
                          Array.from(new Set([...next, ...alibiEvidences])),
                        );
                      }}
                      className={cn(
                        "text-left p-2 rounded-none border-2 transition-all flex items-center gap-2 cursor-pointer relative select-none",
                        isChecked
                          ? "bg-[#dbe7cf] border-[#2e5220] text-[#193310] font-bold"
                          : "bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]",
                      )}
                    >
                      <div
                        className={cn(
                          "size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white",
                          isChecked
                            ? "border-[#2e5220] text-[#2e5220]"
                            : "border-[#4a3520]",
                        )}
                      >
                        {isChecked && (
                          <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {ev.code && (
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1 py-px bg-[#2e5220] text-white inline-block">
                            {ev.code}
                          </span>
                        )}
                        <span className="text-xs leading-snug block font-bold">
                          {ev.label}
                        </span>
                        {ev.description && (
                          <span className="text-[0.7rem] opacity-75 leading-snug block">
                            {ev.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSubPickerTileChange("overview")}
                  className="px-4 py-1.5 bg-[#2e5220] hover:bg-[#234018] text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="size-3.5" /> XÁC NHẬN CĂN CỨ ĐỘNG CƠ
                </button>
              </div>
            </div>
          )}

          {/* Sub-View for Tile 2: ALIBI */}
          {subPickerTile === "alibi" && (
            <div className="space-y-3 p-3 bg-[#eae0cd] border-2 border-[#2b1f14]">
              <div className="flex items-center justify-between border-b border-[#c8b79e] pb-2">
                <span className="text-xs font-mono font-bold text-[#1a120b] uppercase flex items-center gap-1.5">
                  📍 TÀI LIỆU: BÓC TRẦN LỜI KHAI NGOẠI PHẠM
                </span>
                <button
                  type="button"
                  onClick={() => onSubPickerTileChange("overview")}
                  className="px-2.5 py-1 bg-[#2b1f14] text-[#d9a066] font-mono text-[0.65rem] font-bold uppercase flex items-center gap-1 hover:bg-[#3d2b1c] cursor-pointer"
                >
                  <ArrowLeft className="size-3" /> QUAY LẠI
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {cp.pickerConfig?.availableEvidences?.map((ev) => {
                  const isChecked = alibiEvidences.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      disabled={hasSuccess}
                      onClick={() => {
                        detectiveAudio.playPaperRustle();
                        const next = isChecked
                          ? alibiEvidences.filter((i) => i !== ev.id)
                          : [...alibiEvidences, ev.id];
                        onAlibiEvidencesChange(next);
                        onBulkEvidenceSelect(
                          Array.from(new Set([...motiveEvidences, ...next])),
                        );
                      }}
                      className={cn(
                        "text-left p-2 rounded-none border-2 transition-all flex items-center gap-2 cursor-pointer relative select-none",
                        isChecked
                          ? "bg-[#dbe7cf] border-[#2e5220] text-[#193310] font-bold"
                          : "bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]",
                      )}
                    >
                      <div
                        className={cn(
                          "size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white",
                          isChecked
                            ? "border-[#2e5220] text-[#2e5220]"
                            : "border-[#4a3520]",
                        )}
                      >
                        {isChecked && (
                          <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {ev.code && (
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1 py-px bg-[#2e5220] text-white inline-block">
                            {ev.code}
                          </span>
                        )}
                        <span className="text-xs leading-snug block font-bold">
                          {ev.label}
                        </span>
                        {ev.description && (
                          <span className="text-[0.7rem] opacity-75 leading-snug block">
                            {ev.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSubPickerTileChange("overview")}
                  className="px-4 py-1.5 bg-[#2e5220] hover:bg-[#234018] text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="size-3.5" /> XÁC NHẬN BÁC BỎ NGOẠI PHẠM
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Generic Evidence Selection Grid for other evidence_picker checkpoints */
        cp.pickerConfig?.availableEvidences && (
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#4a3520] block uppercase tracking-wider">
              {cp.pickerConfig.evidenceStepLabel ||
                "DANH MỤC TÀI LIỆU & VẬT CHỨNG LIÊN QUAN (TÍCH CHỌN):"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cp.pickerConfig.availableEvidences.map((ev) => {
                const isChecked = selectedEvidenceIds.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={hasSuccess}
                    onClick={() => onToggleEvidenceSelect(ev.id)}
                    className={cn(
                      "text-left p-2.5 rounded-none border-2 transition-all flex items-center gap-2.5 cursor-pointer relative select-none",
                      isChecked
                        ? "bg-[#eae0cd] border-[#2b1f14] text-[#1a120b] shadow-sm"
                        : "bg-[#f4ebd9] border-[#d4c5b0] text-[#3d2f22] hover:bg-[#ede3cf]",
                    )}
                  >
                    <div
                      className={cn(
                        "size-4 rounded-none border-2 flex items-center justify-center shrink-0 transition-all bg-white",
                        isChecked
                          ? "border-[#2b1f14] text-[#0e2b5c]"
                          : "border-[#4a3520]",
                      )}
                    >
                      {isChecked && (
                        <span className="font-[family-name:var(--font-handwriting)] text-sm font-black leading-none select-none">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      {ev.code && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-px bg-[#2b1f14] text-[#f4e8d8] inline-block">
                          {ev.code}
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#1a120b] leading-snug block">
                        {ev.label}
                      </span>
                      {ev.description && (
                        <span className="text-[0.7rem] text-[#5c4026] leading-snug block">
                          {ev.description}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}
