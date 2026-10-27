"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Trash2,
  X,
  FileText,
  Link2,
  Flame,
} from "lucide-react";
import type {
  CaseCharacterRole,
  DbCaseCharacter,
  DbCaseCheckpoint,
} from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { SuspectInterrogationConfigForm } from "./sections/suspect-interrogation-config-form";
import { toDraft, createEmptyDraft, type CheckpointStudioDraft } from "@/lib/types/checkpoint-studio";

export interface CharacterEditorProps {
  caseId: string;
  character: DbCaseCharacter | null;
  allCharacters: DbCaseCharacter[];
  checkpoints: DbCaseCheckpoint[];
  onSave: (savedChar: DbCaseCharacter) => void;
  onDelete: (charId: string) => void;
  onDraftChange?: (updatedChar: DbCaseCharacter) => void;
  onInterrogationChange?: (interrogationDraft: CheckpointStudioDraft) => void;
  onOpenInterrogation?: (checkpoint: DbCaseCheckpoint) => void;
  onCreateInterrogationForCharacter?: (character: DbCaseCharacter) => void;
  onClose?: () => void;
}

export function CharacterEditor({
  caseId,
  character,
  allCharacters,
  checkpoints,
  onSave,
  onDelete,
  onDraftChange,
  onInterrogationChange,
  onClose,
}: CharacterEditorProps) {
  const isNew = !character || !character.id;

  const [key, setKey] = useState(character?.key || "");
  const [name, setName] = useState(character?.name || "");
  const [role, setRole] = useState<CaseCharacterRole>(character?.role || "suspect");
  const [avatarUrl, setAvatarUrl] = useState(character?.avatar_url || "");
  const [isEditingAvatarUrl, setIsEditingAvatarUrl] = useState(false);
  const [description, setDescription] = useState(character?.description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (character) {
      setKey(character.key || "");
      setName(character.name || "");
      setRole(character.role || "suspect");
      setAvatarUrl(character.avatar_url || "");
      setIsEditingAvatarUrl(false);
      setDescription(character.description || "");
    } else {
      setKey("");
      setName("");
      setRole("suspect");
      setAvatarUrl("");
      setIsEditingAvatarUrl(true);
      setDescription("");
    }
  }, [character]);

  const resolvedAvatarSrc = normalizeImageUrl(avatarUrl);

  // Đồng bộ draft live ngược lên CheckpointStudioClient ngay khi người dùng gõ
  const notifyLiveChange = (patch: Partial<DbCaseCharacter>) => {
    const cleanName = (patch.name !== undefined ? patch.name : name).trim();
    const effectiveKey =
      key ||
      character?.key ||
      cleanName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/^_+|_+$/g, "") ||
      ("char_" + (character?.id || Date.now().toString(36)));

    const updatedChar: DbCaseCharacter = {
      id: character?.id || "temp_" + effectiveKey,
      case_slug: caseId,
      key: effectiveKey,
      name: cleanName || (character?.name || "Nhân vật mới"),
      role: patch.role !== undefined ? patch.role : role,
      avatar_url: patch.avatar_url !== undefined ? patch.avatar_url : (avatarUrl.trim() || null),
      avatar_code: character?.avatar_code || `avatar_${effectiveKey}`,
      avatar_asset_path: character?.avatar_asset_path || null,
      phones: character?.phones || [],
      aliases: character?.aliases || [],
      description:
        patch.description !== undefined ? patch.description : description.trim(),
      slot_index: character?.slot_index ?? allCharacters.length,
      device: character?.device || null,
      created_at: character?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onDraftChange?.(updatedChar);
  };

  // Quản lý Checkpoint Thẩm tra tự động gắn liền với Nghi phạm
  const [interrogationDraft, setInterrogationDraft] = useState<CheckpointStudioDraft | null>(null);

  useEffect(() => {
    if (role !== "suspect") {
      setInterrogationDraft(null);
      return;
    }
    const matched = checkpoints.find((cp) => {
      const isInterrogation =
        cp.kind === "suspect_interrogation" ||
        cp.type === "evidence_picker" ||
        cp.checkpoint_id.includes("interrogation");
      if (!isInterrogation) return false;
      const sKey = (cp.subject_key || "").toLowerCase();
      const k = (character?.key || key).toLowerCase();
      return (
        (sKey && sKey === k) ||
        (cp.title && name && cp.title.toLowerCase().includes(name.toLowerCase())) ||
        (k && cp.checkpoint_id.toLowerCase().includes(k))
      );
    });

    if (matched) {
      setInterrogationDraft(toDraft(matched));
    } else {
      const charKey = character?.key || key || "suspect";
      const empty = createEmptyDraft(caseId);
      empty.checkpointId = `cp_interrogation_${charKey}`;
      empty.kind = "suspect_interrogation";
      empty.type = "evidence_picker";
      empty.title = `Thẩm tra ${name || "Nghi phạm"}`;
      empty.subjectKey = charKey;
      empty.question = `Xác minh động cơ và mâu thuẫn lời khai của đối tượng.`;
      setInterrogationDraft(empty);
    }
  }, [character, role, key, checkpoints, caseId]);

  const handleInterrogationDraftChange = (patch: Partial<CheckpointStudioDraft>) => {
    setInterrogationDraft((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...patch, title: prev.title || `Thẩm tra ${name}` };
      onInterrogationChange?.(next);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!character?.id) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa nhân vật "${character.name}" khỏi vụ án?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const { deleteCharacter } = await import("@/lib/actions/character-actions");
      const res = await deleteCharacter(character.id);
      if (!res.success) {
        return;
      }
      onDelete(character.id);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d0e14] text-zinc-100 overflow-hidden">
      {/* 1. Header Bar Tinh Gọn (Không lặp lại tên và ảnh) */}
      <div className="h-9 shrink-0 px-3 bg-[#12131b] border-b border-white/10 flex items-center justify-between text-xs select-none">
        <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          HỒ SƠ NHÂN VẬT
        </span>

        <div className="flex items-center gap-1">
          {!isNew && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs h-6 px-1.5 cursor-pointer"
              title="Xóa nhân vật"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-6 rounded hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Form Body (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5 text-xs font-sans">
        {/* Khối Ảnh 3:4 chuẩn tài liệu phẳng (không bo viền) + Tên & Role cùng kích thước bên cạnh */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {/* Ảnh đại diện tỉ lệ 3:4 chuẩn căn cước trinh thám (w-[105px] h-[140px]) */}
            <div className="relative group shrink-0">
              <div className="w-[105px] h-[140px] bg-black/90 border border-white/20 overflow-hidden flex items-center justify-center shadow-lg">
                {resolvedAvatarSrc ? (
                  <img
                    src={resolvedAvatarSrc}
                    alt={name || "Avatar"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback an toàn nếu link trực tiếp
                      const target = e.currentTarget;
                      if (avatarUrl && target.src !== avatarUrl) {
                        target.src = avatarUrl;
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-600 gap-1.5 select-none">
                    <User className="size-8" />
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">3 : 4</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAvatarUrl((prev) => !prev)}
                className="absolute bottom-1 right-1 p-1 bg-black/80 hover:bg-purple-600 border border-white/30 text-zinc-200 hover:text-white shadow-md transition-colors cursor-pointer"
                title="Dán link ảnh đại diện (Drive / Web)"
              >
                <Link2 className="size-3.5" />
              </button>
            </div>

            {/* Bên phải: Tên nhân vật & Role cùng kích thước (h-9) */}
            <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Tên nhân vật
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    notifyLiveChange({ name: e.target.value });
                  }}
                  placeholder="VD: Lê Quang Vũ, Nguyễn Thanh Tùng..."
                  className="w-full h-9 px-2.5 rounded-md bg-black/40 border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as CaseCharacterRole;
                    setRole(newRole);
                    notifyLiveChange({ role: newRole });
                  }}
                  className="w-full h-9 px-2.5 rounded-md bg-[#121218] border border-white/10 text-xs text-zinc-200 outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="victim">Nạn nhân</option>
                  <option value="suspect">Nghi phạm chính</option>
                  <option value="witness">Nhân chứng</option>
                  <option value="related">Người liên quan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ô nhập link ảnh dán nhanh khi bấm icon Link */}
          {isEditingAvatarUrl && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/60 border border-purple-500/40">
              <Link2 className="size-3.5 text-purple-400 shrink-0" />
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  notifyLiveChange({ avatar_url: e.target.value });
                }}
                placeholder="Dán link ảnh Google Drive hoặc URL trực tiếp..."
                className="flex-1 bg-transparent text-[11px] font-mono text-zinc-200 outline-none placeholder:text-zinc-600"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl("");
                    notifyLiveChange({ avatar_url: null });
                  }}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  title="Xóa link ảnh"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mô tả */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-zinc-300">
            Mô tả
          </label>
          <AutoGrowTextarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              notifyLiveChange({ description: e.target.value });
            }}
            minRows={2}
            placeholder="Ghi chú nghề nghiệp, tính cách, quan hệ..."
            className="w-full p-2 rounded-md bg-black/40 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400 text-xs leading-relaxed"
          />
        </div>

        {/* PHẦN THẨM TRA NGHI PHẠM: TỰ ĐỘNG BÊN DƯỚI KHI ROLE LÀ NGHI PHẠM */}
        {role === "suspect" && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Flame className="size-4 text-amber-400" />
              <span>Thẩm tra: {name || "Nghi phạm"}</span>
            </div>

            {interrogationDraft && (
              <SuspectInterrogationConfigForm
                draft={interrogationDraft}
                onChange={handleInterrogationDraftChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
