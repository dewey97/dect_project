"use client";

import React, { useState, useEffect } from "react";
import type { DbCaseBoardNode, BoardNodeKind, BoardConfig } from "@/lib/types/database";
import type { PinPoint } from "@/components/investigation/hero-interactive";
import type { BoardNodeDraft } from "@/lib/actions/board-actions";
import {
  X,
  Trash2,
  Save,
  Tag,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Pin,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardNodeFormProps {
  caseId: string;
  node: DbCaseBoardNode | PinPoint | null;
  onSave: (draft: BoardNodeDraft) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onClose: () => void;
  onLiveUpdate?: (
    nodeId: string,
    patch: { title?: string; config?: Partial<BoardConfig> },
  ) => void;
}

const NOTE_COLORS: Array<{
  value: "yellow" | "white" | "red" | "blue";
  label: string;
  dotClass: string;
}> = [
  { value: "yellow", label: "Vàng", dotClass: "bg-amber-300 border-amber-400" },
  { value: "white", label: "Trắng", dotClass: "bg-zinc-100 border-zinc-300" },
  { value: "blue", label: "Xanh", dotClass: "bg-sky-400 border-sky-500" },
  { value: "red", label: "Đỏ", dotClass: "bg-rose-400 border-rose-500" },
];

const PIN_COLORS: Array<{
  value: "red" | "yellow" | "blue" | "silver" | "brass";
  label: string;
  dotClass: string;
}> = [
  { value: "red", label: "Đỏ", dotClass: "bg-red-500" },
  { value: "yellow", label: "Vàng", dotClass: "bg-amber-400" },
  { value: "blue", label: "Xanh", dotClass: "bg-blue-500" },
  { value: "silver", label: "Bạc", dotClass: "bg-zinc-300" },
  { value: "brass", label: "Đồng", dotClass: "bg-amber-600" },
];

export function BoardNodeForm({
  caseId,
  node,
  onSave,
  onDelete,
  onClose,
  onLiveUpdate,
}: BoardNodeFormProps) {
  const isDbNode = node && "case_slug" in node;
  const dbNode = isDbNode ? (node as DbCaseBoardNode) : null;
  const pinNode = !isDbNode && node ? (node as PinPoint) : null;

  const [title, setTitle] = useState("");
  const [nodeKind, setNodeKind] = useState<BoardNodeKind>("suspects_hub");
  const [pinTitle, setPinTitle] = useState("");
  const [displayMode, setDisplayMode] = useState<"note" | "photo" | "badge">("note");
  const [noteColor, setNoteColor] = useState<"yellow" | "white" | "red" | "blue">("yellow");
  const [pinColor, setPinColor] = useState<"red" | "yellow" | "blue" | "silver" | "brass">("red");
  const [hasPin, setHasPin] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPolaroid, setIsPolaroid] = useState(true);
  const [textScale, setTextScale] = useState(1.0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [zIndex, setZIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dbNode) {
      const cfg = (dbNode.config as any) || {};
      const k = (dbNode.node_kind as BoardNodeKind) || "suspects_hub";
      setNodeKind(k);
      setTitle(dbNode.title || (k === "suspects_hub" ? "Nghi phạm" : ""));
      setPinTitle(cfg.pin_title || dbNode.title || (k === "suspects_hub" ? "Nghi phạm" : ""));
      setDisplayMode(cfg.display_mode || (cfg.photo_url ? "photo" : "note"));
      setNoteColor(cfg.note_color || (k === "suspects_hub" ? "yellow" : "white"));
      setPinColor(cfg.pin_color || (k === "suspects_hub" ? "red" : "yellow"));
      setHasPin(Boolean(cfg.has_pin ?? true));
      setPhotoUrl(cfg.photo_url || "");
      setIsPolaroid(cfg.is_polaroid !== false);
      setTextScale(typeof cfg.text_scale === "number" && cfg.text_scale > 0 ? cfg.text_scale : 1.0);
      setScale(typeof cfg.scale === "number" && cfg.scale > 0 ? cfg.scale : 1.0);
      setRotation(typeof cfg.rotation === "number" ? cfg.rotation : 0);
      setZIndex(typeof cfg.z_index === "number" ? cfg.z_index : 0);
      setIsHidden(cfg.hidden === true);
    } else if (pinNode) {
      setNodeKind((pinNode.nodeKind as BoardNodeKind) || "custom");
      setTitle(pinNode.label || "");
      setPinTitle(pinNode.label || "");
      setDisplayMode(pinNode.displayMode || (pinNode.photoUrl ? "photo" : "note"));
      setNoteColor((pinNode.noteColor as any) || "yellow");
      setPinColor((pinNode.pinColor as any) || "red");
      setHasPin(Boolean(pinNode.hasPin ?? true));
      setPhotoUrl(pinNode.photoUrl || "");
      setIsPolaroid(pinNode.isPolaroid !== false);
      setTextScale(typeof pinNode.textScale === "number" && pinNode.textScale > 0 ? pinNode.textScale : 1.0);
      setScale(typeof pinNode.scale === "number" && pinNode.scale > 0 ? pinNode.scale : 1.0);
      setRotation(typeof pinNode.rotation === "number" ? pinNode.rotation : 0);
      setZIndex(typeof pinNode.zIndex === "number" ? pinNode.zIndex : 0);
      setIsHidden(false);
    }
  }, [dbNode, pinNode]);

  if (!node) return null;

  const broadcastLive = (cfgPatch: Partial<BoardConfig>, titlePatch?: string) => {
    if (!onLiveUpdate) return;
    onLiveUpdate(node.id, {
      title: titlePatch !== undefined ? titlePatch : title,
      config: cfgPatch,
    });
  };

  const handleUpdateCfg = (patch: Partial<BoardConfig>) => {
    if (patch.display_mode !== undefined) setDisplayMode(patch.display_mode);
    if (patch.pin_title !== undefined) setPinTitle(patch.pin_title);
    if (patch.note_color !== undefined) setNoteColor(patch.note_color as any);
    if (patch.pin_color !== undefined) setPinColor(patch.pin_color as any);
    if (patch.has_pin !== undefined) setHasPin(patch.has_pin);
    if (patch.photo_url !== undefined) setPhotoUrl(patch.photo_url);
    if (patch.is_polaroid !== undefined) setIsPolaroid(patch.is_polaroid);
    if (patch.text_scale !== undefined) setTextScale(patch.text_scale);
    if (patch.scale !== undefined) setScale(patch.scale);
    if (patch.rotation !== undefined) setRotation(patch.rotation);
    if (patch.z_index !== undefined) setZIndex(patch.z_index);
    if (patch.hidden !== undefined) setIsHidden(patch.hidden);

    const nextCfg: Partial<BoardConfig> = {
      display_mode: patch.display_mode !== undefined ? patch.display_mode : displayMode,
      pin_title: patch.pin_title !== undefined ? patch.pin_title : pinTitle,
      note_color: patch.note_color !== undefined ? patch.note_color : noteColor,
      pin_color: patch.pin_color !== undefined ? patch.pin_color : pinColor,
      has_pin: patch.has_pin !== undefined ? patch.has_pin : hasPin,
      photo_url: patch.photo_url !== undefined ? patch.photo_url : photoUrl,
      is_polaroid: patch.is_polaroid !== undefined ? patch.is_polaroid : isPolaroid,
      text_scale: patch.text_scale !== undefined ? patch.text_scale : textScale,
      scale: patch.scale !== undefined ? patch.scale : scale,
      rotation: patch.rotation !== undefined ? patch.rotation : rotation,
      z_index: patch.z_index !== undefined ? patch.z_index : zIndex,
      hidden: patch.hidden !== undefined ? patch.hidden : isHidden,
    };
    broadcastLive(nextCfg);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const cfg = dbNode ? ((dbNode.config as any) || {}) : {};
      const draft: BoardNodeDraft = {
        id: node.id,
        caseId,
        nodeKind,
        title: title.trim() || pinTitle.trim() || undefined,
        subjectKey: dbNode?.subject_key || undefined,
        checkpointId: dbNode?.checkpoint_id || undefined,
        slotIndex: dbNode?.slot_index ?? 0,
        config: {
          ...cfg,
          pin_title: pinTitle.trim() || title.trim(),
          display_mode: displayMode,
          note_color: noteColor,
          pin_color: pinColor,
          has_pin: hasPin,
          photo_url: photoUrl.trim() || undefined,
          is_polaroid: isPolaroid,
          text_scale: textScale,
          scale,
          rotation,
          z_index: zIndex,
          hidden: isHidden,
        },
      };

      await onSave(draft);
    } finally {
      setIsSubmitting(false);
    }
  };

  const friendlyKindName =
    nodeKind === "suspects_hub"
      ? "Nghi phạm"
      : nodeKind === "reinvestigate"
        ? "Khám xét hiện trường"
        : nodeKind === "victim"
          ? "Nạn nhân"
          : nodeKind === "victim_phone"
            ? "Điện thoại nạn nhân"
            : nodeKind === "custom"
              ? "Ghi chú tự do"
              : title || "Node Bảng";

  const isDeletable =
    nodeKind === "custom" ||
    node.id.includes(":custom:") ||
    Boolean(!dbNode?.node_kind);

  return (
    <div className="flex h-full w-full flex-col bg-[#0c0c10] text-zinc-100 border-l border-white/10 select-none">
      {/* 1. Header Toolbar: Tiêu đề + Thứ tự lớp + Mắt + Đóng */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#111118]">
        <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs truncate">
          <Tag className="size-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Node Bảng: {friendlyKindName}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cụm điều chỉnh thứ tự lớp Z-Index (chỉ icon, bỏ text số lớp) */}
          <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded border border-white/10">
            <button
              type="button"
              onClick={() => handleUpdateCfg({ z_index: -5 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Dưới cùng"
            >
              <ArrowDownToLine className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => handleUpdateCfg({ z_index: zIndex - 1 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Xuống 1 lớp"
            >
              <ArrowDown className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => handleUpdateCfg({ z_index: zIndex + 1 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Lên 1 lớp"
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => handleUpdateCfg({ z_index: 5 })}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Trên cùng"
            >
              <ArrowUpToLine className="size-3" />
            </button>
          </div>

          {/* Toggle Ẩn / Hiện (chỉ icon con mắt) */}
          <button
            type="button"
            onClick={() => handleUpdateCfg({ hidden: !isHidden })}
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center",
              !isHidden
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                : "bg-zinc-800 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:bg-zinc-700",
            )}
            title={!isHidden ? "Đang hiện trên bảng" : "Đang ẩn khỏi bảng"}
          >
            {!isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>

          {/* Đóng inspector */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Đóng inspector"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Thân form biên tập */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
        {/* Switcher Display Mode */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded border border-white/5">
          <button
            type="button"
            onClick={() => handleUpdateCfg({ display_mode: "note" })}
            className={cn(
              "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
              displayMode === "note"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            <FileText className="size-3" />
            <span>Giấy note</span>
          </button>
          <button
            type="button"
            onClick={() => handleUpdateCfg({ display_mode: "photo" })}
            className={cn(
              "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
              displayMode === "photo"
                ? "bg-purple-500/20 text-purple-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            <ImageIcon className="size-3" />
            <span>Ảnh</span>
          </button>
          <button
            type="button"
            onClick={() => handleUpdateCfg({ display_mode: "badge" })}
            className={cn(
              "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer",
              displayMode === "badge"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            <Tag className="size-3" />
            <span>Thẻ nhãn</span>
          </button>
        </div>

        {/* 3A. Cấu hình Giấy note */}
        {displayMode === "note" && (
          <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
            {/* Label - cùng dòng */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400 shrink-0 w-10">Label</label>
              <input
                type="text"
                value={pinTitle}
                onChange={(e) => handleUpdateCfg({ pin_title: e.target.value })}
                placeholder="Nhập chữ trên note..."
                className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-amber-200 outline-none focus:border-amber-400 placeholder:text-zinc-600 font-sans"
              />
            </div>

            {/* Màu giấy note - cùng dòng, các ô tròn */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Màu giấy</span>
              <div className="flex items-center gap-1.5">
                {NOTE_COLORS.map((nc) => (
                  <button
                    key={nc.value}
                    type="button"
                    onClick={() => handleUpdateCfg({ note_color: nc.value })}
                    className={cn(
                      "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                      noteColor === nc.value
                        ? "border-white ring-2 ring-amber-400 scale-110"
                        : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                    )}
                    title={nc.label}
                  >
                    <span className={cn("size-2.5 rounded-full border", nc.dotClass)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Ghim bấm (Pin) - cùng dòng */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPin}
                  onChange={(e) => handleUpdateCfg({ has_pin: e.target.checked })}
                  className="rounded border-white/20 bg-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <Pin className="size-3 text-amber-400 rotate-45" />
                <span>Pin</span>
              </label>

              {hasPin && (
                <div className="flex items-center gap-1.5">
                  {PIN_COLORS.map((pc) => (
                    <button
                      key={pc.value}
                      type="button"
                      onClick={() => handleUpdateCfg({ pin_color: pc.value })}
                      className={cn(
                        "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        pinColor === pc.value
                          ? "border-white ring-2 ring-amber-400 scale-110"
                          : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                      )}
                      title={pc.label}
                    >
                      <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cỡ chữ trên note - cùng dòng */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Cỡ chữ</span>
              <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                <input
                  type="range"
                  min="0.7"
                  max="1.8"
                  step="0.05"
                  value={textScale}
                  onChange={(e) =>
                    handleUpdateCfg({ text_scale: parseFloat(e.target.value) })
                  }
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-amber-400 font-mono text-[10px] w-8 text-right shrink-0">
                  {textScale.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3B. Cấu hình Ảnh */}
        {displayMode === "photo" && (
          <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
            {/* Khung Polaroid checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPolaroid}
                  onChange={(e) =>
                    handleUpdateCfg({ is_polaroid: e.target.checked })
                  }
                  className="rounded border-white/20 bg-zinc-800 text-purple-500 focus:ring-0 cursor-pointer"
                />
                <span>Khung Polaroid</span>
              </label>
            </div>
            {/* URL ảnh - cùng dòng */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400 shrink-0 w-10">URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => handleUpdateCfg({ photo_url: e.target.value })}
                placeholder="/images/... hoặc https://..."
                className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600 font-mono text-[11px]"
              />
            </div>

            {/* Label - cùng dòng */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400 shrink-0 w-10">Label</label>
              <input
                type="text"
                value={pinTitle}
                onChange={(e) => handleUpdateCfg({ pin_title: e.target.value })}
                placeholder="Nhập tên hoặc chú thích..."
                className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-purple-400 placeholder:text-zinc-600"
              />
            </div>

            {/* Màu ghim polaroid - cùng dòng */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Màu ghim</span>
              <div className="flex items-center gap-1.5">
                {PIN_COLORS.map((pc) => (
                  <button
                    key={pc.value}
                    type="button"
                    onClick={() => handleUpdateCfg({ pin_color: pc.value })}
                    className={cn(
                      "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                      pinColor === pc.value
                        ? "border-purple-400 ring-2 ring-purple-400/50 scale-110"
                        : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                    )}
                    title={pc.label}
                  >
                    <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                  </button>
                ))}
              </div>
            </div>

            {photoUrl && (
              <div className="flex items-center gap-2 pt-1">
                <div className="size-10 rounded border border-white/10 bg-black overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 break-all leading-tight">
                  {pinTitle || title || "Ảnh xem trước"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3C. Cấu hình Thẻ nhãn (Badge) */}
        {displayMode === "badge" && (
          <div className="space-y-2 rounded bg-black/20 p-2.5 border border-white/5">
            {/* Label - cùng dòng */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400 shrink-0 w-10">Label</label>
              <input
                type="text"
                value={pinTitle}
                onChange={(e) => handleUpdateCfg({ pin_title: e.target.value })}
                placeholder="Nhập nhãn định danh..."
                className="flex-1 rounded border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-emerald-200 outline-none focus:border-emerald-400 placeholder:text-zinc-600 font-mono"
              />
            </div>

            {/* Màu thẻ nhãn - cùng dòng, ô tròn */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Màu thẻ</span>
              <div className="flex items-center gap-1.5">
                {NOTE_COLORS.map((nc) => (
                  <button
                    key={nc.value}
                    type="button"
                    onClick={() => handleUpdateCfg({ note_color: nc.value })}
                    className={cn(
                      "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                      noteColor === nc.value
                        ? "border-white ring-2 ring-emerald-400 scale-110"
                        : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                    )}
                    title={nc.label}
                  >
                    <span className={cn("size-2.5 rounded-full border", nc.dotClass)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Ghim bấm (Pin) - cùng dòng */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPin}
                  onChange={(e) => handleUpdateCfg({ has_pin: e.target.checked })}
                  className="rounded border-white/20 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <Pin className="size-3 text-emerald-400 rotate-45" />
                <span>Pin</span>
              </label>

              {hasPin && (
                <div className="flex items-center gap-1.5">
                  {PIN_COLORS.map((pc) => (
                    <button
                      key={pc.value}
                      type="button"
                      onClick={() => handleUpdateCfg({ pin_color: pc.value })}
                      className={cn(
                        "size-5 rounded-full border transition-all cursor-pointer flex items-center justify-center",
                        pinColor === pc.value
                          ? "border-white ring-2 ring-emerald-400 scale-110"
                          : "border-white/20 hover:scale-105 opacity-70 hover:opacity-100",
                      )}
                      title={pc.label}
                    >
                      <span className={cn("size-2.5 rounded-full", pc.dotClass)} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Nút bấm hành động */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-1.5 px-3 rounded bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="size-3.5" />
            <span>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>

          {isDeletable && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Xóa node "${title || pinTitle}" khỏi bảng?`)) {
                  onDelete(node.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              title="Xóa node này"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
