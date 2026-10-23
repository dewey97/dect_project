"use client";

import React, { useState, useTransition } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Upload,
  Key,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User,
  Paperclip,
} from "lucide-react";
import type { DbPhoneMessage } from "@/lib/types/database";
import {
  upsertPhoneMessage,
  deletePhoneMessage,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";

interface MessagesEditorProps {
  caseId: string;
  initialMessages: DbPhoneMessage[];
  onMessagesChange: (messages: DbPhoneMessage[]) => void;
}

export function MessagesEditor({
  caseId,
  initialMessages,
  onMessagesChange,
}: MessagesEditorProps) {
  const [messages, setMessages] = useState<DbPhoneMessage[]>(initialMessages);
  const [activeThreadKey, setActiveThreadKey] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  // Group messages into threads
  const threads = React.useMemo(() => {
    const map = new Map<
      string,
      {
        thread_key: string;
        thread_name: string;
        phone_number: string | null;
        messages: DbPhoneMessage[];
      }
    >();

    for (const msg of messages) {
      const key = msg.thread_key || "default";
      if (!map.has(key)) {
        map.set(key, {
          thread_key: key,
          thread_name: msg.thread_name || key,
          phone_number: msg.thread_phone || null,
          messages: [],
        });
      }
      map.get(key)!.messages.push(msg);
    }

    // Sort messages in each thread by slot_index
    for (const thread of map.values()) {
      thread.messages.sort((a, b) => a.slot_index - b.slot_index);
    }

    return Array.from(map.values());
  }, [messages]);

  // Set active thread if not set
  React.useEffect(() => {
    if (!activeThreadKey && threads.length > 0) {
      setActiveThreadKey(threads[0].thread_key);
    }
  }, [threads, activeThreadKey]);

  const activeThread = threads.find((t) => t.thread_key === activeThreadKey);

  // New Thread Form state
  const [newThreadKey, setNewThreadKey] = useState("");
  const [newThreadName, setNewThreadName] = useState("");
  const [newThreadPhone, setNewThreadPhone] = useState("");

  // New Message Form state
  const [msgSender, setMsgSender] = useState("");
  const [msgRole, setMsgRole] = useState<"me" | "them">("them");
  const [msgBody, setMsgBody] = useState("");
  const [msgTime, setMsgTime] = useState("20:45");
  const [msgAttachment, setMsgAttachment] = useState("");
  const [msgIsClue, setMsgIsClue] = useState(false);
  const [msgClueCode, setMsgClueCode] = useState("");
  const [msgClueTitle, setMsgClueTitle] = useState("");
  const [msgClueAnalysis, setMsgClueAnalysis] = useState("");

  const handleCreateThread = () => {
    if (!newThreadName.trim()) {
      alert("Vui lòng nhập tên người trò chuyện");
      return;
    }
    const key =
      newThreadKey.trim() ||
      newThreadName.trim().toLowerCase().replace(/\s+/g, "_");

    // Add first initial message to create the thread in DB
    startTransition(async () => {
      const res = await upsertPhoneMessage({
        case_slug: caseId,
        thread_key: key,
        thread_name: newThreadName.trim(),
        thread_phone: newThreadPhone.trim() || null,
        sender: newThreadName.trim(),
        role: "them",
        body: "Xin chào...",
        timestamp: "20:00",
        slot_index: 0,
      });

      if (res.success && res.data) {
        const updated = [...messages, res.data];
        setMessages(updated);
        onMessagesChange(updated);
        setActiveThreadKey(key);
        setNewThreadName("");
        setNewThreadKey("");
        setNewThreadPhone("");
        setStatusMsg({ type: "success", text: "Đã tạo đoạn hội thoại mới." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể tạo hội thoại.",
        });
      }
    });
  };

  const handleSendMessage = () => {
    if (!activeThreadKey || !msgBody.trim()) return;

    const threadObj = activeThread;
    const nextSlot =
      threadObj && threadObj.messages.length > 0
        ? Math.max(...threadObj.messages.map((m) => m.slot_index)) + 1
        : 0;

    const senderName =
      msgSender.trim() ||
      (msgRole === "me" ? "Tôi" : threadObj?.thread_name || "Họ");

    startTransition(async () => {
      const res = await upsertPhoneMessage({
        case_slug: caseId,
        thread_key: activeThreadKey,
        thread_name: threadObj?.thread_name || activeThreadKey,
        thread_phone: threadObj?.phone_number || null,
        sender: senderName,
        role: msgRole,
        body: msgBody.trim(),
        timestamp: msgTime.trim() || "21:00",
        attachment_url: msgAttachment.trim() || null,
        is_clue: msgIsClue,
        code: msgClueCode.trim() || null,
        clue_title: msgClueTitle.trim() || null,
        clue_analysis: msgClueAnalysis.trim() || null,
        slot_index: nextSlot,
      });

      if (res.success && res.data) {
        const updated = [...messages, res.data];
        setMessages(updated);
        onMessagesChange(updated);
        setMsgBody("");
        setMsgAttachment("");
        setMsgIsClue(false);
        setMsgClueCode("");
        setMsgClueTitle("");
        setMsgClueAnalysis("");
        setStatusMsg({ type: "success", text: "Đã thêm tin nhắn." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể gửi tin nhắn.",
        });
      }
    });
  };

  const handleDeleteMessage = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return;

    const filtered = messages.filter((m) => m.id !== id);
    setMessages(filtered);
    onMessagesChange(filtered);

    startTransition(async () => {
      const res = await deletePhoneMessage(id);
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Lỗi xóa tin nhắn." });
      }
    });
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "photos");
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        setMsgAttachment(res.data.url);
      } else {
        alert(res.error || "Lỗi upload ảnh đính kèm");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="size-4 text-emerald-400" />
            Biên tập Tin nhắn & Hội thoại (Messages App)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tạo các luồng chat SMS/iMessage, thiết lập manh mối phá án và tin
            nhắn ẩn giấu
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

      {/* 2-Pane Split: Left Thread List | Right Active Thread Chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[480px]">
        {/* Left Column: Thread List */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Đoạn hội thoại ({threads.length})
            </h3>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[360px] pr-1">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                Chưa có cuộc trò chuyện nào.
              </div>
            ) : (
              threads.map((t) => {
                const isActive = t.thread_key === activeThreadKey;
                const clueCount = t.messages.filter((m) => m.is_clue).length;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <button
                    key={t.thread_key}
                    type="button"
                    onClick={() => setActiveThreadKey(t.thread_key)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? "bg-sky-950/50 border-sky-600/70 text-zinc-100"
                        : "bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="size-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300">
                      <User className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate">
                          {t.thread_name}
                        </span>
                        {clueCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-700/60">
                            <Key className="size-2.5" /> {clueCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {lastMsg
                          ? lastMsg.body
                          : t.phone_number || "Chưa có tin nhắn"}
                      </p>
                    </div>
                    <ChevronRight className="size-3.5 text-zinc-600 shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* New Thread Form */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-xs font-medium text-zinc-400">
              Tạo hội thoại mới
            </span>
            <input
              type="text"
              placeholder="Tên đối tượng (vd: Hoàng Minh)..."
              value={newThreadName}
              onChange={(e) => setNewThreadName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              placeholder="Số điện thoại (tùy chọn)..."
              value={newThreadPhone}
              onChange={(e) => setNewThreadPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={handleCreateThread}
              disabled={isPending || !newThreadName.trim()}
              className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
            >
              <Plus className="size-3.5" /> Tạo cuộc trò chuyện
            </button>
          </div>
        </div>

        {/* Right Column: Chat History & Send Form */}
        <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    {activeThread.thread_name}
                    {activeThread.phone_number && (
                      <span className="font-mono text-xs text-zinc-400">
                        ({activeThread.phone_number})
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    key: {activeThread.thread_key} •{" "}
                    {activeThread.messages.length} tin nhắn
                  </span>
                </div>
              </div>

              {/* Message Bubbles Preview */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/80">
                {activeThread.messages.map((m) => {
                  const isMe = m.role === "me";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col group ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {m.sender}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono">
                          {m.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 p-0.5 transition-opacity cursor-pointer"
                          title="Xóa tin nhắn này"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs relative ${
                          isMe
                            ? "bg-sky-600 text-white rounded-br-xs"
                            : "bg-zinc-800 text-zinc-200 rounded-bl-xs border border-zinc-700/60"
                        } ${
                          m.is_clue
                            ? "ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                            : ""
                        }`}
                      >
                        {m.attachment_url && (
                          <div className="mb-1.5 rounded-lg overflow-hidden max-w-[200px] max-h-[140px] border border-black/30">
                            <img
                              src={m.attachment_url}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {m.body}
                        </p>

                        {m.is_clue && (
                          <div className="mt-1 pt-1 border-t border-amber-400/30 text-[10px] text-amber-200 flex items-center gap-1 font-mono">
                            <Key className="size-2.5" />
                            <span>
                              {m.code ? `[${m.code}] ` : ""}
                              {m.clue_title || "Manh mối chính"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Message Box */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">
                      Vai trò người gửi
                    </label>
                    <select
                      value={msgRole}
                      onChange={(e) =>
                        setMsgRole(e.target.value as "me" | "them")
                      }
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="them">Họ gửi đến (them)</option>
                      <option value="me">Nạn nhân gửi đi (me)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">
                      Tên người gửi (Sender)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Hoàng Minh..."
                      value={msgSender}
                      onChange={(e) => setMsgSender(e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">
                      Giờ hiển thị
                    </label>
                    <input
                      type="text"
                      placeholder="21:15"
                      value={msgTime}
                      onChange={(e) => setMsgTime(e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">
                      Đính kèm ảnh
                    </label>
                    <label className="w-full px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center gap-1 cursor-pointer">
                      <Paperclip className="size-3" />
                      {msgAttachment ? "Đã đính kèm ảnh" : "Tải ảnh"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAttachmentUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Message Body Input */}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Nội dung tin nhắn..."
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isPending || !msgBody.trim()}
                    className="px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Send className="size-4" />
                  </button>
                </div>

                {/* Clue Metadata Accordion */}
                <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msgIsClue}
                      onChange={(e) => setMsgIsClue(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    <Key className="size-3.5 text-amber-400" />
                    Đánh dấu tin nhắn này là Manh mối / Bằng chứng quan trọng
                  </label>

                  {msgIsClue && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs">
                      <div>
                        <input
                          type="text"
                          placeholder="Mã chứng cứ (vd: c0-msg-01)..."
                          value={msgClueCode}
                          onChange={(e) => setMsgClueCode(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Tiêu đề manh mối..."
                          value={msgClueTitle}
                          onChange={(e) => setMsgClueTitle(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Phân tích / Gợi ý suy luận..."
                          value={msgClueAnalysis}
                          onChange={(e) => setMsgClueAnalysis(e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs">
              <MessageSquare className="size-8 text-zinc-700 mb-2" />
              Chọn hoặc tạo một đoạn hội thoại ở cột bên trái để bắt đầu biên
              tập tin nhắn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
