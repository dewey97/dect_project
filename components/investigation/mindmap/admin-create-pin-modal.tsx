"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  StickyNote,
  FileText,
  Image as ImageIcon,
  Trash2,
  Check,
  HelpCircle,
  Link2,
  Info,
  Layers,
  Eye,
} from "lucide-react";
import { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";

interface AdminCreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (pin: PinPoint) => void;
  onDeletePin?: (pinId: string) => void;
  initialPin?: PinPoint | null;
}

const PRESET_CASE_PHOTOS = [
  {
    label: "Nạn nhân Khang",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_khang.png",
  },
  {
    label: "Hiện trường Vết Máu",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png",
  },
  {
    label: "Trần Thị Hà",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_ha.png",
  },
  {
    label: "Lê Quang Vũ",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png",
  },
  {
    label: "Nguyễn Thanh Tùng",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png",
  },
  {
    label: "Nguyễn Ngọc Mai",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_mai.png",
  },
  { label: "Vé xe Tùng", url: "/images/cases/case_000/cuong_ve_xe_tung.png" },
  {
    label: "Tin nhắn tống tiền",
    url: "/images/cases/case_000/photo_cheating_sms.jpg",
  },
  { label: "Tủ gỗ trốn tìm", url: "/images/cases/case_000/wardrobe_eyes.jpg" },
  {
    label: "Phòng tái khám xét",
    url: "/images/cases/case_000/photo-reinvestigation-room-realistic.jpg",
  },
];

const PRESET_STICKY_TEMPLATES = [
  { label: "Note vàng trơn", url: "" },
  {
    label: "Bổ sung chứng cứ",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_bo_sung_chung_cu.png",
    defaultLabel: "BỔ SUNG CHỨNG CỨ",
  },
  {
    label: "Nghi vấn vụ án",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_van.png",
    defaultLabel: "NGHI VẤN VỤ ÁN",
  },
  {
    label: "Danh sách nghi phạm",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_nghi_pham.png",
    defaultLabel: "DANH SÁCH NGHI PHẠM",
  },
  {
    label: "Đối chất Vũ",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_vu.png",
    defaultLabel: "ĐỐI CHẤT LÊ QUANG VŨ",
  },
  {
    label: "Đối chất Tùng",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_tung.png",
    defaultLabel: "ĐỐI CHẤT NGUYỄN THANH TÙNG",
  },
  {
    label: "Đối chất Hà",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png",
    defaultLabel: "ĐỐI CHẤT TRẦN THỊ HÀ",
  },
];

const PRESET_DOSSIER_TEMPLATES = [
  { label: "Giấy A4 trơn", url: "" },
  {
    label: "Mở rộng điều tra",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_mo_rong_dieu_tra.png",
    defaultLabel: "MỞ RỘNG ĐIỀU TRA",
  },
  {
    label: "Biên bản khám xét",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_kham_xet_lai.png",
    defaultLabel: "BIÊN BẢN KHÁM XÉT HIỆN TRƯỜNG",
  },
  {
    label: "Kết luận điều tra",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_ket_luan_dieu_tra.png",
    defaultLabel: "BẢN KẾT LUẬN ĐIỀU TRA",
  },
];

const PRESET_SHEET_CHECKPOINTS = [
  {
    id: "cp-000-0",
    label: "CP-000-0 // Tra cứu SĐT kẻ đe dọa",
  },
  {
    id: "cp-000-1a",
    label: "CP-000-1a // Đối chất Hồ sơ A — Lê Quang Vũ",
  },
  {
    id: "cp-000-1b",
    label: "CP-000-1b // Đối chất Hồ sơ B — Nguyễn Thanh Tùng",
  },
  {
    id: "cp-000-2a",
    label: "CP-000-2a // Khám xét Hồ sơ C — Trần Thị Hà",
  },
  {
    id: "cp-000-2b",
    label: "CP-000-2b // Cáo trạng kết án Hung thủ",
  },
];

const NOTE_TEXTAREA_ROWS = 2;

export function AdminCreatePinModal({
  isOpen,
  onClose,
  onSavePin,
  onDeletePin,
  initialPin,
}: AdminCreatePinModalProps) {
  const [pinType, setPinType] = useState<"sticky" | "dossier" | "photo">(
    "sticky",
  );
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [noteColor, setNoteColor] = useState<
    "yellow" | "red" | "blue" | "white" | "black"
  >("yellow");
  const [pinColor, setPinColor] = useState<
    "red" | "yellow" | "blue" | "green" | "dark"
  >("red");
  const [photoUrl, setPhotoUrl] = useState("");
  const [noteTextureUrl, setNoteTextureUrl] = useState("");

  const [actionType, setActionType] = useState<
    "info" | "sheet_checkpoint" | "custom_question"
  >("info");
  const [checkpointId, setCheckpointId] = useState("cp-000-0");
  const [questionType, setQuestionType] = useState<
    "text_match_3" | "evidence_picker" | "mcq" | "accusation"
  >("text_match_3");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState("");
  const [hints, setHints] = useState("");
  const [unlockedEvidenceId, setUnlockedEvidenceId] = useState("");

  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialPin) {
      setLabel(initialPin.label || "");
      setDetail(initialPin.detail || "");
      setNoteColor(initialPin.noteColor || "yellow");
      setPinColor((initialPin.color as any) || "red");
      setPhotoUrl(initialPin.photoUrl || "");
      setNoteTextureUrl(initialPin.noteTextureUrl || "");

      if (initialPin.photoUrl) {
        setPinType("photo");
      } else if (
        initialPin.noteColor === "white" ||
        (initialPin.noteTextureUrl &&
          initialPin.noteTextureUrl.includes("white"))
      ) {
        setPinType("dossier");
      } else {
        setPinType("sticky");
      }

      setActionType(initialPin.actionType || "info");
      setCheckpointId(initialPin.checkpointId || "cp-000-0");
      setQuestionType(initialPin.questionType || "text_match_3");
      setQuestion(initialPin.question || "");
      setAnswers(initialPin.answers || "");
      setHints(initialPin.hints || "");
      setUnlockedEvidenceId(initialPin.unlockedEvidenceId || "");
      setRotation(initialPin.rotation ?? 0);
      setScale(initialPin.scale ?? 1);
    } else {
      setLabel("");
      setDetail("");
      setNoteColor("yellow");
      setPinColor("red");
      setPhotoUrl("");
      setNoteTextureUrl("");
      setPinType("sticky");

      setActionType("info");
      setCheckpointId("cp-000-0");
      setQuestionType("text_match_3");
      setQuestion("");
      setAnswers("");
      setHints("");
      setUnlockedEvidenceId("");
      setRotation(0);
      setScale(1);
    }
    setIsPreviewOpen(false);
  }, [initialPin, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!label.trim()) return;

    detectiveAudio.playTypewriterClick();

    const createdPin: PinPoint = {
      id: initialPin?.id || `admin-pin-${Date.now()}`,
      x: initialPin?.x ?? 0.5,
      y: initialPin?.y ?? 0.5,
      label: label.trim(),
      detail: detail.trim(),
      color: pinColor,
      pinColor: pinColor,
      noteColor:
        pinType === "dossier"
          ? "white"
          : pinType === "photo"
            ? undefined
            : noteColor,
      photoUrl: pinType === "photo" ? photoUrl.trim() || undefined : undefined,
      noteTextureUrl:
        pinType !== "photo" ? noteTextureUrl.trim() || undefined : undefined,

      actionType,
      checkpointId:
        actionType === "sheet_checkpoint" ? checkpointId : undefined,
      questionType: actionType === "custom_question" ? questionType : undefined,
      question:
        actionType === "custom_question"
          ? question.trim() || undefined
          : undefined,
      answers:
        actionType === "custom_question"
          ? answers.trim() || undefined
          : undefined,
      hints:
        actionType === "custom_question"
          ? hints.trim() || undefined
          : undefined,
      unlockedEvidenceId:
        actionType === "custom_question"
          ? unlockedEvidenceId.trim() || undefined
          : undefined,

      rotation: rotation !== 0 ? rotation : undefined,
      scale: scale !== 1 ? scale : undefined,
    };

    onSavePin(createdPin);
    onClose();
  };

  const activeCheckpointLabel =
    PRESET_SHEET_CHECKPOINTS.find((c) => c.id === checkpointId)?.label ||
    checkpointId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#141419] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0f0f13]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs font-bold text-amber-400 font-mono tracking-wide">
              {initialPin ? "CHỈNH SỬA NODE" : "THÊM NODE MỚI"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playTypewriterClick();
                setIsPreviewOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-mono font-bold transition-colors"
            >
              <Eye className="size-3.5" />
              <span>XEM TRƯỚC</span>
            </button>
            <button
              type="button"
              onClick={() => {
                detectiveAudio.playPaperRustle();
                onClose();
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1"
        >
          {/* SECTION 1: HÌNH THỨC */}
          <div className="space-y-3 bg-[#181820] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Layers className="size-3.5" />
              <span>1. HÌNH THỨC</span>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setPinType("sticky");
                  setNoteColor("yellow");
                  setNoteTextureUrl("");
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-mono transition-all ${
                  pinType === "sticky"
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <StickyNote className="size-3.5 text-amber-400" />
                <span>Note dính</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setPinType("dossier");
                  setNoteColor("white");
                  setNoteTextureUrl("");
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-mono transition-all ${
                  pinType === "dossier"
                    ? "bg-sky-500/15 border-sky-500 text-sky-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileText className="size-3.5 text-sky-400" />
                <span>Giấy A4</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setPinType("photo");
                  setNoteTextureUrl("");
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-mono transition-all ${
                  pinType === "photo"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ImageIcon className="size-3.5 text-emerald-400" />
                <span>Ảnh</span>
              </button>
            </div>

            {/* Presets Grid */}
            {pinType === "sticky" && (
              <div className="space-y-1 pt-1.5 border-t border-white/5">
                <span className="block text-[11px] font-mono text-zinc-400">
                  Mẫu có sẵn:
                </span>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {PRESET_STICKY_TEMPLATES.map((t, idx) => {
                    const isSelected = noteTextureUrl === t.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick();
                          setNoteTextureUrl(t.url);
                          if (t.defaultLabel) setLabel(t.defaultLabel);
                        }}
                        className={`text-left px-2 py-1 rounded border text-[11px] font-mono truncate transition-all ${
                          isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold"
                            : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pinType === "dossier" && (
              <div className="space-y-1 pt-1.5 border-t border-white/5">
                <span className="block text-[11px] font-mono text-zinc-400">
                  Mẫu có sẵn:
                </span>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {PRESET_DOSSIER_TEMPLATES.map((t, idx) => {
                    const isSelected = noteTextureUrl === t.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick();
                          setNoteTextureUrl(t.url);
                          if (t.defaultLabel) setLabel(t.defaultLabel);
                        }}
                        className={`text-left px-2 py-1 rounded border text-[11px] font-mono truncate transition-all ${
                          isSelected
                            ? "bg-sky-500/25 border-sky-400 text-sky-200 font-bold"
                            : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pinType === "photo" && (
              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="URL ảnh hoặc chọn bên dưới..."
                  className="w-full px-2.5 py-1 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {PRESET_CASE_PHOTOS.map((p, idx) => {
                    const isSelected = photoUrl === p.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick();
                          setPhotoUrl(p.url);
                          if (p.label) setLabel(p.label);
                        }}
                        className={`text-left px-2 py-1 rounded border text-[11px] font-mono truncate transition-all ${
                          isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold"
                            : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors Pickers */}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
              {pinType === "sticky" && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Màu:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "yellow", name: "Vàng", bg: "bg-amber-300" },
                      { id: "red", name: "Đỏ", bg: "bg-red-400" },
                      { id: "blue", name: "Xanh", bg: "bg-sky-300" },
                      { id: "white", name: "Trắng", bg: "bg-zinc-100" },
                      {
                        id: "black",
                        name: "Đen",
                        bg: "bg-zinc-800 border border-white/30",
                      },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.name}
                        onClick={() => setNoteColor(c.id as any)}
                        className={`size-5 rounded-full flex items-center justify-center transition-all ${c.bg} ${
                          noteColor === c.id
                            ? "ring-2 ring-amber-400 scale-110"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        {noteColor === c.id && (
                          <Check
                            className={`size-3 ${c.id === "black" ? "text-white" : "text-black"}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  Đinh ghim:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "red", name: "Đỏ", colorClass: "bg-red-500" },
                    { id: "yellow", name: "Vàng", colorClass: "bg-amber-400" },
                    { id: "blue", name: "Xanh", colorClass: "bg-blue-500" },
                    { id: "green", name: "Lục", colorClass: "bg-emerald-500" },
                    { id: "dark", name: "Đồng", colorClass: "bg-zinc-700" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      onClick={() => setPinColor(p.id as any)}
                      className={`size-5 rounded-full flex items-center justify-center transition-all ${p.colorClass} ${
                        pinColor === p.id
                          ? "ring-2 ring-amber-400 scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {pinColor === p.id && (
                        <Check className="size-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title & Detail */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                  Tiêu đề <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Tiêu đề hiển thị..."
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={NOTE_TEXTAREA_ROWS}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Nội dung ghi chú..."
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: HÀNH ĐỘNG CLICK */}
          <div className="space-y-2.5 bg-[#181820] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <HelpCircle className="size-3.5" />
              <span>2. HÀNH ĐỘNG CLICK</span>
            </div>

            {/* Action Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setActionType("info");
                }}
                className={`py-1.5 px-2 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  actionType === "info"
                    ? "bg-zinc-700/40 border-amber-500 text-amber-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Info className="size-3.5 text-amber-400" />
                <span>Chỉ xem</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setActionType("sheet_checkpoint");
                }}
                className={`py-1.5 px-2 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  actionType === "sheet_checkpoint"
                    ? "bg-blue-500/15 border-blue-500 text-blue-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Link2 className="size-3.5 text-blue-400" />
                <span>Sheet CMS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playTypewriterClick();
                  setActionType("custom_question");
                }}
                className={`py-1.5 px-2 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  actionType === "custom_question"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold"
                    : "border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <HelpCircle className="size-3.5 text-emerald-400" />
                <span>Câu hỏi</span>
              </button>
            </div>

            {/* ACTION: SHEET CHECKPOINT */}
            {actionType === "sheet_checkpoint" && (
              <div className="space-y-1 pt-1.5 border-t border-white/5">
                <label className="block text-[11px] font-mono text-zinc-300">
                  Chọn Checkpoint CMS:
                </label>
                <select
                  value={checkpointId}
                  onChange={(e) => setCheckpointId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {PRESET_SHEET_CHECKPOINTS.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ACTION: CUSTOM QUESTION */}
            {actionType === "custom_question" && (
              <div className="space-y-2 pt-1.5 border-t border-white/5">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "text_match_3", label: "Nhập text/SĐT" },
                    { id: "evidence_picker", label: "Mã chứng cứ" },
                    { id: "mcq", label: "Trắc nghiệm" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        detectiveAudio.playTypewriterClick();
                        setQuestionType(q.id as any);
                      }}
                      className={`py-1 px-1.5 rounded border text-center text-[11px] font-mono transition-all ${
                        questionType === q.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                          : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                    Câu hỏi:
                  </label>
                  <textarea
                    rows={NOTE_TEXTAREA_ROWS}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Nội dung câu hỏi..."
                    className="w-full px-2.5 py-1 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                    Đáp án đúng:
                  </label>
                  <input
                    type="text"
                    value={answers}
                    onChange={(e) => setAnswers(e.target.value)}
                    placeholder={
                      questionType === "evidence_picker"
                        ? "VD: 10, dev-00..."
                        : questionType === "mcq"
                          ? "VD: 1. Gửi tin nhắn..."
                          : "VD: 0988200991..."
                    }
                    className="w-full px-2.5 py-1 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                      Gợi ý:
                    </label>
                    <input
                      type="text"
                      value={hints}
                      onChange={(e) => setHints(e.target.value)}
                      placeholder="Gợi ý..."
                      className="w-full px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 mb-0.5">
                      Mã mở khóa:
                    </label>
                    <input
                      type="text"
                      value={unlockedEvidenceId}
                      onChange={(e) => setUnlockedEvidenceId(e.target.value)}
                      placeholder="VD: dev-05..."
                      className="w-full px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            {initialPin && onDeletePin ? (
              <button
                type="button"
                onClick={() => {
                  detectiveAudio.playPaperRustle();
                  onDeletePin(initialPin.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/80 rounded text-xs font-mono transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>XOÁ NODE</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded text-xs font-mono transition-colors"
              >
                HUỶ
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold rounded text-xs font-mono transition-all"
              >
                <Check className="size-3.5" />
                <span>{initialPin ? "LƯU" : "THÊM"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PLAYER-VIEW PREVIEW OVERLAY */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#f6f1e5] text-[#1a120b] border-4 border-[#2b1f14] shadow-[0_30px_90px_rgba(0,0,0,0.98)] rounded-none overflow-hidden flex flex-col max-h-[85vh] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-[#ede3d1] px-5 py-3.5 border-b-2 border-[#2b1f14] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-[#8c1d1d] shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8c1d1d] truncate">
                  HỒ SƠ TÀI LIỆU // {label || "GHIM ĐIỀU TRA"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors border border-[#5c4026] shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* CONTENT BODY */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-[#f6f1e5]">
              {pinType === "photo" && photoUrl && (
                <div className="relative rounded border-2 border-[#2b1f14] overflow-hidden bg-black/10 max-h-60 flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt={label}
                    className="max-h-56 object-contain"
                  />
                </div>
              )}

              <div>
                <h3 className="font-mono font-bold text-base text-[#1a120b] uppercase tracking-wide">
                  {label || "TIÊU ĐỀ NODE"}
                </h3>
                {detail ? (
                  <p className="mt-2 text-xs sm:text-sm text-[#382618] font-mono leading-relaxed whitespace-pre-line p-3 bg-[#ebdcc4] border border-[#a88c6f]/60 rounded">
                    {detail}
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-mono italic text-[#7a5938]">
                    (Chưa có nội dung chi tiết)
                  </p>
                )}
              </div>

              {/* ACTION: SHEET CHECKPOINT */}
              {actionType === "sheet_checkpoint" && (
                <div className="pt-3 border-t-2 border-[#2b1f14]/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8c1d1d]">
                    <Link2 className="size-4" />
                    <span>MỞ KHÓA CHECKPOINT CMS</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#5c4026] p-2.5 bg-[#ebdcc4] border border-[#a88c6f]/60 rounded">
                    {activeCheckpointLabel}
                  </p>
                </div>
              )}

              {/* ACTION: CUSTOM QUESTION */}
              {actionType === "custom_question" && (
                <div className="pt-3 border-t-2 border-[#2b1f14]/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8c1d1d]">
                    <HelpCircle className="size-4" />
                    <span>CÂU HỎI ĐIỀU TRA:</span>
                  </div>

                  {question ? (
                    <p className="text-xs sm:text-sm font-mono font-bold text-[#2b1f14] p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d]/40">
                      {question}
                    </p>
                  ) : (
                    <p className="text-xs font-mono italic text-[#7a5938]">
                      (Chưa nhập câu hỏi)
                    </p>
                  )}

                  <div>
                    <label className="block text-[11px] font-mono font-semibold text-[#5c4026] mb-1">
                      {questionType === "evidence_picker"
                        ? "Nhập mã thẻ chứng cứ (VD: 10, dev-00):"
                        : "Nhập đáp án suy luận:"}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Người chơi nhập câu trả lời tại đây..."
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-[#2b1f14] rounded-none font-mono text-xs text-[#1a120b] placeholder:text-[#a88c6f]"
                    />
                  </div>

                  {hints && (
                    <div className="text-[11px] font-mono text-[#7a5938] italic">
                      💡 Gợi ý: {hints}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-[#8c1d1d] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#2b1f14] opacity-90"
                  >
                    XÁC NHẬN ĐÁP ÁN
                  </button>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-[#ede3d1] border-t-2 border-[#2b1f14] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#7a5938] uppercase">
                Bản xem trước — không phải màn hình thật
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 bg-[#2b1f14] hover:bg-black text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider transition-colors"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
