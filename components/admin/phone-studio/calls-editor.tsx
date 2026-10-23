"use client";

import React, { useState, useTransition } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Trash2,
  Key,
  Upload,
  CheckCircle,
  AlertCircle,
  Music,
} from "lucide-react";
import type { DbPhoneCall } from "@/lib/types/database";
import {
  upsertPhoneCall,
  deletePhoneCall,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";

interface CallsEditorProps {
  caseId: string;
  initialCalls: DbPhoneCall[];
  onCallsChange: (calls: DbPhoneCall[]) => void;
}

export function CallsEditor({
  caseId,
  initialCalls,
  onCallsChange,
}: CallsEditorProps) {
  const [calls, setCalls] = useState<DbPhoneCall[]>(initialCalls);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  // Form state
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callType, setCallType] = useState<"incoming" | "outgoing" | "missed">(
    "missed",
  );
  const [timestamp, setTimestamp] = useState("21:14");
  const [duration, setDuration] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isClue, setIsClue] = useState(false);
  const [clueCode, setClueCode] = useState("");
  const [clueTitle, setClueTitle] = useState("");
  const [clueAnalysis, setClueAnalysis] = useState("");

  const handleAddCall = () => {
    if (!contactName.trim()) {
      alert("Vui lòng nhập tên người liên hệ hoặc số điện thoại");
      return;
    }

    const nextSlot =
      calls.length > 0 ? Math.max(...calls.map((c) => c.slot_index)) + 1 : 0;

    startTransition(async () => {
      const res = await upsertPhoneCall({
        case_slug: caseId,
        contact_name: contactName.trim(),
        phone_number: phoneNumber.trim() || null,
        call_type: callType,
        timestamp: timestamp.trim() || null,
        duration: duration.trim() || null,
        audio_url: audioUrl.trim() || null,
        is_key_clue: isClue,
        clue_title: clueTitle.trim() || null,
        clue_analysis: clueAnalysis.trim() || null,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...calls, res.data];
        setCalls(updated);
        onCallsChange(updated);
        setContactName("");
        setPhoneNumber("");
        setDuration("");
        setAudioUrl("");
        setIsClue(false);
        setClueCode("");
        setClueTitle("");
        setClueAnalysis("");
        setStatusMsg({
          type: "success",
          text: "Đã thêm cuộc gọi vào nhật ký.",
        });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm cuộc gọi.",
        });
      }
    });
  };

  const handleDeleteCall = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi cuộc gọi này?")) return;

    const filtered = calls.filter((c) => c.id !== id);
    setCalls(filtered);
    onCallsChange(filtered);

    startTransition(async () => {
      const res = await deletePhoneCall(id);
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Lỗi xóa cuộc gọi." });
      }
    });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "audio");
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        setAudioUrl(res.data.url);
      } else {
        alert(res.error || "Lỗi upload file ghi âm");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming className="size-4 text-emerald-400" />;
      case "outgoing":
        return <PhoneOutgoing className="size-4 text-sky-400" />;
      case "missed":
      default:
        return <PhoneMissed className="size-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Phone className="size-4 text-emerald-400" />
            Nhật ký Cuộc gọi (Phone App / Recents)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Biên soạn lịch sử cuộc gọi đến, đi, cuộc gọi nhỡ và file ghi âm lén
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

      {/* Calls Table List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Lịch sử cuộc gọi ({calls.length})
          </h3>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {calls.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Chưa có cuộc gọi nào được lưu.
            </div>
          ) : (
            calls.map((c) => (
              <div
                key={c.id}
                className={`p-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors ${
                  c.is_key_clue ? "bg-amber-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shrink-0">
                    {getCallIcon(c.call_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          c.call_type === "missed"
                            ? "text-red-400"
                            : "text-zinc-100"
                        }`}
                      >
                        {c.contact_name}
                      </span>
                      {c.phone_number && (
                        <span className="font-mono text-[11px] text-zinc-500">
                          ({c.phone_number})
                        </span>
                      )}
                      {c.is_key_clue && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/60 font-mono">
                          <Key className="size-2.5" /> MANH MỐI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                      <span>{c.timestamp || "Không rõ giờ"}</span>
                      {c.duration && <span>• {c.duration}</span>}
                      {c.audio_url && (
                        <span className="flex items-center gap-0.5 text-sky-400">
                          <Music className="size-3" /> Có ghi âm
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCall(c.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                  title="Xóa cuộc gọi"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Call Form Box */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300">
          Thêm cuộc gọi vào nhật ký
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Tên liên hệ / Số gọi
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A..."
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              placeholder="0987.654.321"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Loại cuộc gọi
            </label>
            <select
              value={callType}
              onChange={(e) =>
                setCallType(
                  e.target.value as "incoming" | "outgoing" | "missed",
                )
              }
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            >
              <option value="missed">Cuộc gọi nhỡ (Missed)</option>
              <option value="incoming">Cuộc gọi đến (Incoming)</option>
              <option value="outgoing">Cuộc gọi đi (Outgoing)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Thời gian gọi
            </label>
            <input
              type="text"
              placeholder="21:14"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Thời lượng đàm thoại
            </label>
            <input
              type="text"
              placeholder="VD: 1 phút 24 giây (để trống nếu gọi nhỡ)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              File ghi âm cuộc gọi (Audio)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL file audio (.mp3, .m4a)..."
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer shrink-0">
                <Upload className="size-3.5" />
                {audioUrl ? "Đã có" : "Tải lên"}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Clue configuration */}
        <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isClue}
              onChange={(e) => setIsClue(e.target.checked)}
              className="accent-amber-400 rounded"
            />
            <Key className="size-3.5 text-amber-400" />
            Đánh dấu cuộc gọi này là Manh mối chính của vụ án
          </label>

          {isClue && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
              <input
                type="text"
                placeholder="Tiêu đề manh mối (vd: Cuộc gọi bất thường lúc nửa đêm)..."
                value={clueTitle}
                onChange={(e) => setClueTitle(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="Phân tích nội dung / manh mối..."
                value={clueAnalysis}
                onChange={(e) => setClueAnalysis(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddCall}
          disabled={isPending || !contactName.trim()}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="size-4" /> Thêm vào nhật ký cuộc gọi
        </button>
      </div>
    </div>
  );
}
