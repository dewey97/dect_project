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
  ChevronDown,
} from "lucide-react";
import { PinPoint } from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import { normalizeImageUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { findValidCaseCharacter } from "@/lib/cases/case-000-suspects";

interface AdminCreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (pin: PinPoint) => void;
  onDeletePin?: (pinId: string) => void;
  initialPin?: PinPoint | null;
}

const PRESET_CASE_PHOTOS: Array<{
  label: string;
  url: string;
  defaultCheckpointId?: string;
}> = [
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
    defaultCheckpointId: "cp-000-2a",
  },
  {
    label: "Lê Quang Vũ",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_vu.png",
    defaultCheckpointId: "cp-000-1a",
  },
  {
    label: "Nguyễn Thanh Tùng",
    url: "/images/cases/case_000/pinned_photos_with_tape/pinned_tape_tung.png",
    defaultCheckpointId: "cp-000-1b",
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
    defaultCheckpointId: "cp-000-convergence",
  },
];

interface NoteTemplate {
  label: string;
  url: string;
  defaultLabel?: string;
  defaultCheckpointId?: string;
}

const PRESET_STICKY_TEMPLATES: NoteTemplate[] = [
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
    defaultCheckpointId: "cp-000-0",
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
    defaultCheckpointId: "cp-000-1a",
  },
  {
    label: "Đối chất Tùng",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_tung.png",
    defaultLabel: "ĐỐI CHẤT NGUYỄN THANH TÙNG",
    defaultCheckpointId: "cp-000-1b",
  },
  {
    label: "Đối chất Hà",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_cau_hoi_ha.png",
    defaultLabel: "ĐỐI CHẤT TRẦN THỊ HÀ",
    defaultCheckpointId: "cp-000-1c",
  },
];

const PRESET_DOSSIER_TEMPLATES: NoteTemplate[] = [
  { label: "Giấy A4 trơn", url: "" },
  {
    label: "Mở rộng điều tra",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_mo_rong_dieu_tra.png",
    defaultLabel: "MỞ RỘNG ĐIỀU TRA",
    defaultCheckpointId: "cp-000-0",
  },
  {
    label: "Biên bản khám xét",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_kham_xet_lai.png",
    defaultLabel: "BIÊN BẢN KHÁM XÉT HIỆN TRƯỜNG",
    defaultCheckpointId: "cp-000-convergence",
  },
  {
    label: "Kết luận điều tra",
    url: "/images/cases/case_000/clue_notes/rendered_notes/note_ket_luan_dieu_tra.png",
    defaultLabel: "BẢN KẾT LUẬN ĐIỀU TRA",
    defaultCheckpointId: "cp-000-2b",
  },
];

const PRESET_SHEET_CHECKPOINTS = [
  {
    id: "cp-000-0",
    label: "CP-000-0 // Tra cứu 3 SĐT ẩn danh (Ban Đầu)",
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
    id: "cp-000-convergence",
    label: "CP-000-convergence // Nút hội tụ — Khám xét lại hiện trường",
  },
  {
    id: "cp-000-2a",
    label: "CP-000-2a // Khám xét Hồ sơ C — Trần Thị Hà",
  },
  {
    id: "cp-000-2b",
    label: "CP-000-2b // Cáo trạng kết án Hung thủ (Hồ sơ C)",
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
  const [isNoteColorOpen, setIsNoteColorOpen] = useState(false);
  const [isPinColorOpen, setIsPinColorOpen] = useState(false);

  // Fetch live photos & checkpoints from Google Sheets
  const { data: sheetPhotos } = usePhoneData("photos");
  const { data: sheetCheckpoints } = usePhoneData("checkpoints");

  const combinedCheckpoints = React.useMemo(() => {
    const list = [...PRESET_SHEET_CHECKPOINTS];
    if (Array.isArray(sheetCheckpoints)) {
      sheetCheckpoints.forEach((cp: any) => {
        const cpId = cp.checkpoint_id || cp.id;
        if (cpId && !list.some((item) => item.id === cpId)) {
          list.push({
            id: cpId,
            label: `${cpId} // ${cp.title || cp.question || cp.label || "Checkpoint"}`,
          });
        }
      });
    }
    return list;
  }, [sheetCheckpoints]);

  const combinedPhotos = React.useMemo(() => {
    const list = [...PRESET_CASE_PHOTOS];
    if (Array.isArray(sheetPhotos)) {
      sheetPhotos.forEach((item: any, idx: number) => {
        const rawUrl =
          item.drive_url ||
          item.url ||
          item.link ||
          item.link_anh ||
          item.photo_url ||
          item.image_url ||
          item.duong_dan ||
          item.link_drive ||
          item.url_drive;
        if (rawUrl) {
          const normUrl = normalizeImageUrl(rawUrl);
          const label =
            item.title ||
            item.Title ||
            item.ten_anh ||
            item["tên ảnh"] ||
            item.name ||
            item.filename ||
            item.photo_id ||
            `Ảnh Sheet #${idx + 1}`;
          if (!list.some((p) => p.url === normUrl || p.url === rawUrl)) {
            list.push({
              label: `[Sheet] ${label}`,
              url: normUrl,
            });
          }
        }
      });
    }
    return list;
  }, [sheetPhotos]);

  useEffect(() => {
    if (initialPin) {
      const char =
        findValidCaseCharacter(initialPin.label) ||
        findValidCaseCharacter(initialPin.id);
      const isCrimeScene =
        initialPin.id.includes("crime-scene") ||
        initialPin.id.includes("thi-the") ||
        (initialPin.label &&
          initialPin.label.toLowerCase().includes("hiện trường"));
      const isSuspectPhoto = Boolean(
        initialPin.photoUrl ||
        char?.avatarUrl ||
        isCrimeScene ||
        initialPin.id.startsWith("node-suspect-") ||
        initialPin.id.startsWith("photo-") ||
        initialPin.id.includes("victim") ||
        initialPin.id.includes("khang"),
      );
      const resolvedPhoto =
        initialPin.photoUrl ||
        char?.avatarUrl ||
        (isCrimeScene
          ? "/images/cases/case_000/pinned_photos_with_tape/pinned_photo_crime_scene_v2.png"
          : "");

      const labelLower = (initialPin.label || "").toLowerCase();
      const idLower = (initialPin.id || "").toLowerCase();
      const detailLower = (initialPin.detail || "").toLowerCase();

      const detectedCp =
        initialPin.checkpointId ||
        (char?.id === "vu" ||
        idLower.includes("vu") ||
        labelLower.includes("vũ") ||
        detailLower.includes("vũ")
          ? "cp-000-1a"
          : char?.id === "tung" ||
              idLower.includes("tung") ||
              labelLower.includes("tùng") ||
              detailLower.includes("tùng")
            ? "cp-000-1b"
            : char?.id === "ha" ||
                idLower.includes("ha") ||
                labelLower.includes("hà") ||
                detailLower.includes("hà")
              ? "cp-000-1c"
              : labelLower.includes("sđt") ||
                  labelLower.includes("nghi vấn") ||
                  idLower.includes("phone")
                ? "cp-000-0"
                : labelLower.includes("khám xét") ||
                    idLower.includes("reinvestigate")
                  ? "cp-000-convergence"
                  : labelLower.includes("cáo trạng") ||
                      labelLower.includes("kết luận") ||
                      idLower.includes("indictment")
                    ? "cp-000-2b"
                    : undefined);

      setLabel(initialPin.label || (char ? char.canonicalName : ""));
      setDetail(initialPin.detail || "");
      setNoteColor(initialPin.noteColor || "yellow");
      setPinColor((initialPin.color as any) || "red");
      setPhotoUrl(resolvedPhoto);
      setNoteTextureUrl(initialPin.noteTextureUrl || "");

      if (isSuspectPhoto) {
        setPinType("photo");
      } else if (
        initialPin.noteColor === "white" ||
        (initialPin.noteTextureUrl &&
          initialPin.noteTextureUrl.includes("white")) ||
        idLower.includes("dossier")
      ) {
        setPinType("dossier");
      } else {
        setPinType("sticky");
      }

      const resolvedAction =
        initialPin.actionType === "custom_question"
          ? "sheet_checkpoint"
          : detectedCp
            ? "sheet_checkpoint"
            : initialPin.actionType || "info";

      setActionType(resolvedAction);
      setCheckpointId(detectedCp || initialPin.checkpointId || "cp-000-0");
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
    // Ảnh không cần tiêu đề: ảnh render trực tiếp trên bảng, không hiện chữ nào.
    const isPhotoPin = pinType === "photo";
    if (!isPhotoPin && !label.trim()) return;
    if (isPhotoPin && !photoUrl.trim()) return;

    detectiveAudio.playTypewriterClick();

    const createdPin: PinPoint = {
      id: initialPin?.id || `admin-pin-${Date.now()}`,
      x: initialPin?.x ?? 0.5,
      y: initialPin?.y ?? 0.5,
      label: label.trim(),
      detail: isPhotoPin ? "" : detail.trim(),
      color: pinColor,
      pinColor: pinColor,
      noteColor:
        pinType === "dossier"
          ? "white"
          : pinType === "photo"
            ? undefined
            : noteColor,
      photoUrl:
        pinType === "photo"
          ? normalizeImageUrl(photoUrl) || undefined
          : undefined,
      noteTextureUrl:
        pinType !== "photo"
          ? normalizeImageUrl(noteTextureUrl) || undefined
          : undefined,

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
                          if (t.defaultCheckpointId) {
                            setActionType("sheet_checkpoint");
                            setCheckpointId(t.defaultCheckpointId);
                          }
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
                          if (t.defaultCheckpointId) {
                            setActionType("sheet_checkpoint");
                            setCheckpointId(t.defaultCheckpointId);
                          }
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
              <div className="space-y-2 pt-1.5 border-t border-white/5">
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>
                    Chọn ảnh hồ sơ ({combinedPhotos.length} mẫu & Sheets):
                  </span>
                  {photoUrl && (
                    <span className="text-emerald-400 font-bold">
                      ✓ Đã chọn ảnh
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {combinedPhotos.map((p, idx) => {
                    const isSelected =
                      photoUrl === p.url ||
                      normalizeImageUrl(photoUrl) === p.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick();
                          setPhotoUrl(p.url);
                          if (p.label) {
                            const cleanLabel = p.label.replace(
                              /^\[Sheet\]\s*/,
                              "",
                            );
                            setLabel(cleanLabel);
                            const cp =
                              (p as any).defaultCheckpointId ||
                              (cleanLabel.toLowerCase().includes("vũ")
                                ? "cp-000-1a"
                                : cleanLabel.toLowerCase().includes("tùng")
                                  ? "cp-000-1b"
                                  : cleanLabel.toLowerCase().includes("hà")
                                    ? "cp-000-2a"
                                    : undefined);
                            if (cp) {
                              setActionType("sheet_checkpoint");
                              setCheckpointId(cp);
                            }
                          }
                        }}
                        className={`text-left px-2 py-1.5 rounded border text-[11px] font-mono truncate transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200"
                        }`}
                        title={p.label}
                      >
                        <span className="truncate flex-1">
                          {isSelected ? "✓ " : ""}
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors Pickers: Dropdown Popover */}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5 relative">
              {pinType === "sticky" && (
                <div className="relative">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-zinc-400">
                      Màu note:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        detectiveAudio.playTypewriterClick();
                        setIsNoteColorOpen((prev) => !prev);
                        setIsPinColorOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-[11px] font-mono text-zinc-200 transition-colors"
                    >
                      <span
                        className={`size-3 rounded-full ${
                          noteColor === "yellow"
                            ? "bg-amber-300"
                            : noteColor === "red"
                              ? "bg-red-400"
                              : noteColor === "blue"
                                ? "bg-sky-300"
                                : noteColor === "white"
                                  ? "bg-zinc-100"
                                  : "bg-zinc-800 border border-white/30"
                        }`}
                      />
                      <span className="capitalize">
                        {noteColor === "yellow"
                          ? "Vàng"
                          : noteColor === "red"
                            ? "Đỏ"
                            : noteColor === "blue"
                              ? "Xanh"
                              : noteColor === "white"
                                ? "Trắng"
                                : "Đen"}
                      </span>
                      <ChevronDown className="size-3 text-zinc-400" />
                    </button>
                  </div>

                  {isNoteColorOpen && (
                    <div className="absolute top-full left-0 mt-1 z-30 w-36 bg-[#16161c] border border-amber-500/40 rounded-lg p-1 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
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
                          onClick={() => {
                            detectiveAudio.playTypewriterClick();
                            setNoteColor(c.id as any);
                            setIsNoteColorOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-mono transition-colors ${
                            noteColor === c.id
                              ? "bg-amber-500/20 text-amber-200 font-bold"
                              : "text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`size-3 rounded-full ${c.bg}`} />
                            <span>{c.name}</span>
                          </div>
                          {noteColor === c.id && (
                            <Check className="size-3 text-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Đinh ghim:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      detectiveAudio.playTypewriterClick();
                      setIsPinColorOpen((prev) => !prev);
                      setIsNoteColorOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-[11px] font-mono text-zinc-200 transition-colors"
                  >
                    <span
                      className={`size-3 rounded-full ${
                        pinColor === "red"
                          ? "bg-red-500"
                          : pinColor === "yellow"
                            ? "bg-amber-400"
                            : pinColor === "blue"
                              ? "bg-blue-500"
                              : pinColor === "green"
                                ? "bg-emerald-500"
                                : "bg-zinc-700"
                      }`}
                    />
                    <span className="capitalize">
                      {pinColor === "red"
                        ? "Đỏ"
                        : pinColor === "yellow"
                          ? "Vàng"
                          : pinColor === "blue"
                            ? "Xanh"
                            : pinColor === "green"
                              ? "Lục"
                              : "Đồng"}
                    </span>
                    <ChevronDown className="size-3 text-zinc-400" />
                  </button>
                </div>

                {isPinColorOpen && (
                  <div className="absolute top-full right-0 mt-1 z-30 w-36 bg-[#16161c] border border-amber-500/40 rounded-lg p-1 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { id: "red", name: "Đỏ", colorClass: "bg-red-500" },
                      {
                        id: "yellow",
                        name: "Vàng",
                        colorClass: "bg-amber-400",
                      },
                      { id: "blue", name: "Xanh", colorClass: "bg-blue-500" },
                      {
                        id: "green",
                        name: "Lục",
                        colorClass: "bg-emerald-500",
                      },
                      { id: "dark", name: "Đồng", colorClass: "bg-zinc-700" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          detectiveAudio.playTypewriterClick();
                          setPinColor(p.id as any);
                          setIsPinColorOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-mono transition-colors ${
                          pinColor === p.id
                            ? "bg-amber-500/20 text-amber-200 font-bold"
                            : "text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-3 rounded-full ${p.colorClass}`}
                          />
                          <span>{p.name}</span>
                        </div>
                        {pinColor === p.id && (
                          <Check className="size-3 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title & Detail (Only for sticky note & dossier, hidden for photo cards) */}
            {pinType !== "photo" && (
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
            )}
          </div>

          {/* SECTION 2: HÀNH ĐỘNG CLICK */}
          <div className="space-y-2.5 bg-[#181820] p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <HelpCircle className="size-3.5" />
              <span>2. HÀNH ĐỘNG KHI CLICK VÀO GHIM</span>
            </div>

            {/* Action Type Selector: 2 options only */}
            <div className="grid grid-cols-2 gap-2">
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
                <span>Chỉ xem thông tin</span>
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
                <span>Mở Checkpoint (Sheet CMS)</span>
              </button>
            </div>

            {/* ACTION: SHEET CHECKPOINT SELECTOR */}
            {actionType === "sheet_checkpoint" && (
              <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono text-zinc-300">
                    Chọn Checkpoint CMS từ Google Sheet:
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    ✓ Quản lý câu hỏi trên Sheet
                  </span>
                </div>
                <select
                  value={checkpointId}
                  onChange={(e) => setCheckpointId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {combinedCheckpoints.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] font-mono text-zinc-400 italic">
                  💡 Câu hỏi, đáp án đúng và gợi ý được đồng bộ realtime 100% từ
                  tab "checkpoints" trên Google Sheet.
                </p>
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
