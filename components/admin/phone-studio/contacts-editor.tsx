"use client";

import React, { useState, useTransition } from "react";
import {
  Users,
  Plus,
  Trash2,
  Upload,
  User,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { DbPhoneContact, DbCaseCharacter } from "@/lib/types/database";
import {
  upsertPhoneContact,
  deletePhoneContact,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";

interface ContactsEditorProps {
  caseId: string;
  initialContacts: DbPhoneContact[];
  characters?: DbCaseCharacter[];
  onContactsChange: (contacts: DbPhoneContact[]) => void;
}

export function ContactsEditor({
  caseId,
  initialContacts,
  characters = [],
  onContactsChange,
}: ContactsEditorProps) {
  const [contacts, setContacts] = useState<DbPhoneContact[]>(initialContacts);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  // Form state
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("Bạn bè");
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleAddContact = () => {
    if (!name.trim()) {
      alert("Vui lòng nhập họ tên liên hệ");
      return;
    }

    const nextSlot =
      contacts.length > 0
        ? Math.max(...contacts.map((c) => c.slot_index)) + 1
        : 0;

    startTransition(async () => {
      const res = await upsertPhoneContact({
        case_slug: caseId,
        name: name.trim(),
        display_name: displayName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        category: category.trim() || null,
        note: note.trim() || null,
        is_saved: isSaved,
        is_suspicious: isSuspicious,
        avatar_url: avatarUrl.trim() || null,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...contacts, res.data];
        setContacts(updated);
        onContactsChange(updated);
        setName("");
        setDisplayName("");
        setPhoneNumber("");
        setNote("");
        setAvatarUrl("");
        setIsSuspicious(false);
        setStatusMsg({ type: "success", text: "Đã thêm liên hệ vào danh bạ." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm liên hệ.",
        });
      }
    });
  };

  const handleDeleteContact = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;

    const filtered = contacts.filter((c) => c.id !== id);
    setContacts(filtered);
    onContactsChange(filtered);

    startTransition(async () => {
      const res = await deletePhoneContact(id);
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Lỗi xóa liên hệ." });
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);
      } else {
        alert(res.error || "Lỗi upload ảnh avatar");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const handleAutoFillFromCharacter = (char: DbCaseCharacter) => {
    setName(char.name);
    setDisplayName(char.name);
    setCategory(
      char.role === "suspect"
        ? "Nghi phạm"
        : char.role === "witness"
          ? "Nhân chứng"
          : "Khác",
    );
    setNote(char.description || "");
    if (char.phones && char.phones.length > 0) {
      setPhoneNumber(char.phones[0]);
    }
    if (char.avatar_code)
      setAvatarUrl(`/images/cases/${caseId}/avatars/${char.avatar_code}.png`);
    if (char.role === "suspect") setIsSuspicious(true);
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Users className="size-4 text-sky-400" />
            Danh bạ Điện thoại (Contacts App)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quản lý danh sách liên hệ đã lưu, số điện thoại, ghi chú quan hệ và
            đối tượng nghi vấn
          </p>
        </div>
      </div>

      {statusMsg.type === "success" && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}
      {statusMsg.type === "error" && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Characters Quick Autofill Bar */}
      {characters.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-400" />
            Điền nhanh từ Hồ sơ Nhân vật vụ án:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {characters.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => handleAutoFillFromCharacter(char)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{char.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({char.role})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contacts List Grid */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Danh sách liên hệ ({contacts.length})
          </h3>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Chưa có liên hệ nào trong danh bạ.
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className={`p-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors ${
                  c.is_suspicious ? "bg-amber-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {c.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="size-5 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-100">
                        {c.name}
                      </span>
                      {c.display_name && c.display_name !== c.name && (
                        <span className="text-xs text-zinc-400">
                          ({c.display_name})
                        </span>
                      )}
                      {c.category && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
                          {c.category}
                        </span>
                      )}
                      {c.is_suspicious && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/60">
                          <ShieldAlert className="size-2.5" /> Nghi vấn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                      <span>{c.phone_number || "Không có SĐT"}</span>
                      {c.note && (
                        <span className="font-sans text-zinc-500">
                          • {c.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                  title="Xóa liên hệ"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Contact Form Box */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300">
          Thêm người liên hệ mới
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="VD: Hoàng Minh..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Biệt danh / Tên lưu trên máy
            </label>
            <input
              type="text"
              placeholder="VD: Minh Còi, Sếp..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              placeholder="0912.345.678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Nhóm danh bạ (Category)
            </label>
            <input
              type="text"
              placeholder="Gia đình, Bạn bè, Công việc..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Ghi chú quan hệ / Manh mối
            </label>
            <input
              type="text"
              placeholder="Quan hệ với nạn nhân..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Ảnh đại diện (Avatar)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL ảnh hoặc tải file..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer shrink-0">
                <Upload className="size-3.5" />
                {avatarUrl ? "Đã có" : "Tải ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isSaved}
              onChange={(e) => setIsSaved(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            Đã lưu vào danh bạ máy
          </label>

          <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isSuspicious}
              onChange={(e) => setIsSuspicious(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <ShieldAlert className="size-3.5 text-amber-400" />
            Đánh dấu đối tượng nghi vấn
          </label>
        </div>

        <button
          type="button"
          onClick={handleAddContact}
          disabled={isPending || !name.trim()}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer mt-2"
        >
          <Plus className="size-4" /> Thêm vào danh bạ
        </button>
      </div>
    </div>
  );
}
