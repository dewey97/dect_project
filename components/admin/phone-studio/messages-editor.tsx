"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Upload,
  Key,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  User,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
  X,
  Phone,
  FileText,
  Paperclip,
} from "lucide-react";
import type { DbPhoneMessage } from "@/lib/types/database";
import {
  savePhoneMessagesBatch,
  deletePhoneThread,
  uploadPhoneAsset,
  type BatchMessageItemInput,
} from "@/lib/actions/phone-actions";

interface MessagesEditorProps {
  caseId: string;
  initialMessages: DbPhoneMessage[];
  onMessagesChange: (messages: DbPhoneMessage[]) => void;
}

interface DraftMessageItem extends BatchMessageItemInput {
  clientKey: string;
}

/**
 * Trình phân tích văn bản dán hàng loạt hỗ trợ nhiều định dạng:
 * - JSON: [{ sender, role, body, timestamp }]
 * - Kịch bản: "Tên: Nội dung [20:15]" hoặc "(20:15) Tên: Nội dung"
 * - Dấu ">" ở đầu dòng: Tin gửi đi từ nạn nhân
 */
function parsePastedBlock(
  rawText: string,
  defaultContact: string,
): DraftMessageItem[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // 1. Định dạng JSON
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => {
          const roleStr = String(item.role || "")
            .toLowerCase()
            .trim();
          const isSent =
            roleStr === "sent" ||
            roleStr === "me" ||
            roleStr === "victim" ||
            item.sender === "Nạn nhân" ||
            item.sender === "Tôi";

          return {
            clientKey: `pasted-${Date.now()}-${idx}`,
            sender: item.sender || (isSent ? "Nạn nhân" : defaultContact),
            role: isSent ? "sent" : "received",
            body: item.body || item.text || "",
            timestamp: item.timestamp || null,
            code: item.code || null,
            is_clue: Boolean(item.is_clue || item.isClue),
            clue_title: item.clue_title || item.clueTitle || null,
            clue_analysis: item.clue_analysis || item.clueAnalysis || null,
            attachment_url: item.attachment_url || item.attachmentUrl || null,
            attachment_type: item.attachment_type || null,
            attachment_duration: item.attachment_duration || null,
          };
        });
      }
    } catch {}
  }

  // 2. Kịch bản phân dòng
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const items: DraftMessageItem[] = [];
  let lastTimestamp = "20:00";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Phát hiện tin gửi đi qua tiền tố ">"
    let isSent = false;
    if (line.startsWith(">")) {
      isSent = true;
      line = line.substring(1).trim();
    }

    // Bóc tách nhãn thời gian [20:15] hoặc (20:15)
    let timestamp = lastTimestamp;
    const timeMatch = line.match(
      /[\[\(]([0-9]{1,2}:[0-9]{2}|[0-9]{1,2}\/[0-9]{1,2}[^\]\)]*)[\]\)]/,
    );
    if (timeMatch) {
      timestamp = timeMatch[1].trim();
      lastTimestamp = timestamp;
      line = line.replace(timeMatch[0], "").trim();
    }

    // Bóc tách người gửi: "Hoàng Minh: nội dung..."
    let sender = isSent ? "Nạn nhân" : defaultContact;
    let body = line;
    const colonMatch = line.match(/^([^:\n]{1,30}):\s*(.*)$/);
    if (colonMatch) {
      const parsedSender = colonMatch[1].trim();
      body = colonMatch[2].trim();
      const lower = parsedSender.toLowerCase();
      if (
        lower === "tôi" ||
        lower === "nạn nhân" ||
        lower === "nan nhan" ||
        lower === "khang" ||
        isSent
      ) {
        isSent = true;
        sender = "Nạn nhân";
      } else {
        sender = parsedSender;
        isSent = false;
      }
    }

    // Bóc tách tag đính kèm
    let attachment_url: string | null = null;
    let attachment_type: string | null = null;
    let attachment_duration: string | null = null;

    const imgMatch = body.match(/\[IMAGE:\s*([^\]]+)\]/i);
    if (imgMatch) {
      attachment_url = imgMatch[1].trim();
      attachment_type = "image";
      body = body.replace(imgMatch[0], "").trim();
    }

    const audioMatch = body.match(
      /\[AUDIO:\s*([^|\]]+)(?:\s*\|\s*([^\]]+))?\]/i,
    );
    if (audioMatch) {
      attachment_url = audioMatch[1].trim();
      attachment_type = "audio";
      attachment_duration = audioMatch[2]?.trim() || "0:08";
      body = body.replace(audioMatch[0], "").trim();
    }

    if (body || attachment_url) {
      items.push({
        clientKey: `pasted-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        sender,
        role: isSent ? "sent" : "received",
        body,
        timestamp,
        attachment_url,
        attachment_type,
        attachment_duration,
        is_clue: false,
      });
    }
  }

  return items;
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

    // Sắp xếp các tin nhắn trong từng thread theo slot_index
    for (const thread of map.values()) {
      thread.messages.sort((a, b) => a.slot_index - b.slot_index);
    }

    return Array.from(map.values());
  }, [messages]);

  // Set active thread if not set
  useEffect(() => {
    if (!activeThreadKey && threads.length > 0) {
      setActiveThreadKey(threads[0].thread_key);
    }
  }, [threads, activeThreadKey]);

  const activeThread = threads.find((t) => t.thread_key === activeThreadKey);

  // Editable draft states for the active thread
  const [threadName, setThreadName] = useState<string>("");
  const [threadPhone, setThreadPhone] = useState<string>("");
  const [draftMessages, setDraftMessages] = useState<DraftMessageItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Synchronize draft messages when active thread changes
  useEffect(() => {
    if (activeThread) {
      setThreadName(activeThread.thread_name);
      setThreadPhone(activeThread.phone_number || "");
      setDraftMessages(
        activeThread.messages.map((m) => ({
          ...m,
          clientKey: m.id,
          role: m.role === "sent" || m.role === "me" ? "sent" : "received",
        })),
      );
      setHasUnsavedChanges(false);
    } else {
      setThreadName("");
      setThreadPhone("");
      setDraftMessages([]);
      setHasUnsavedChanges(false);
    }
  }, [activeThreadKey, activeThread]);

  // New Thread Form state
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [newThreadPhone, setNewThreadPhone] = useState("");

  // Paste Text Modal state
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");

  // Handle Thread Creation (Without fake initial message)
  const handleStartCreateThread = () => {
    if (!newThreadName.trim()) {
      alert("Vui lòng nhập tên người trò chuyện");
      return;
    }
    const cleanName = newThreadName.trim();
    const generatedKey = `thread_${cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")}`;

    // Switch view to new thread draft with 1 empty row
    setActiveThreadKey(generatedKey);
    setThreadName(cleanName);
    setThreadPhone(newThreadPhone.trim());
    setDraftMessages([
      {
        clientKey: `draft-init-${Date.now()}`,
        sender: cleanName,
        role: "received",
        body: "",
        timestamp: "20:00",
        is_clue: false,
      },
    ]);
    setHasUnsavedChanges(true);
    setIsCreatingThread(false);
    setNewThreadName("");
    setNewThreadPhone("");
  };

  // Add Message Row
  const handleAddRow = () => {
    const lastMsg = draftMessages[draftMessages.length - 1];
    const newRole: "sent" | "received" =
      lastMsg?.role === "received" ? "sent" : "received";
    const newSender =
      newRole === "sent" ? "Nạn nhân" : threadName || "Đối tượng";

    const newItem: DraftMessageItem = {
      clientKey: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: newSender,
      role: newRole,
      body: "",
      timestamp: lastMsg?.timestamp || "20:00",
      is_clue: false,
    };

    setDraftMessages((prev) => [...prev, newItem]);
    setHasUnsavedChanges(true);
  };

  // Update Field in Row
  const handleUpdateRow = (
    index: number,
    field: keyof DraftMessageItem,
    value: unknown,
  ) => {
    setDraftMessages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Move Row Up / Down
  const handleMoveRow = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftMessages.length) return;

    setDraftMessages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Delete Row
  const handleDeleteRow = (index: number) => {
    setDraftMessages((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  // Apply Pasted Block
  const handleApplyPastedBlock = () => {
    const parsed = parsePastedBlock(pasteRawText, threadName || "Đối tượng");
    if (parsed.length === 0) {
      alert("Không tìm thấy dòng tin nhắn hợp lệ để chèn.");
      return;
    }

    setDraftMessages((prev) => [...prev, ...parsed]);
    setHasUnsavedChanges(true);
    setPasteRawText("");
    setIsPasteModalOpen(false);
    setStatusMsg({
      type: "success",
      text: `Đã chèn ${parsed.length} dòng tin nhắn vào bảng.`,
    });
    setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
  };

  // Batch Save Thread Messages
  const handleSaveBatch = () => {
    if (!activeThreadKey) return;

    startTransition(async () => {
      setStatusMsg({ type: "idle" });

      const cleanPayload: BatchMessageItemInput[] = draftMessages
        .filter((m) => (m.body && m.body.trim().length > 0) || m.attachment_url)
        .map((m) => ({
          id: m.id,
          sender: m.sender,
          role: m.role,
          body: m.body,
          timestamp: m.timestamp,
          code: m.code,
          is_clue: m.is_clue,
          clue_title: m.clue_title,
          clue_analysis: m.clue_analysis,
          attachment_type: m.attachment_type,
          attachment_url: m.attachment_url,
          attachment_duration: m.attachment_duration,
        }));

      const res = await savePhoneMessagesBatch(
        caseId,
        activeThreadKey,
        cleanPayload,
        {
          thread_name: threadName.trim() || activeThreadKey,
          thread_phone: threadPhone.trim() || null,
        },
      );

      if (res.success && res.data) {
        // Cập nhật lại toàn bộ danh sách messages của vụ án
        const otherThreadMsgs = messages.filter(
          (m) => m.thread_key !== activeThreadKey,
        );
        const nextAll = [...otherThreadMsgs, ...res.data];
        setMessages(nextAll);
        onMessagesChange(nextAll);
        setHasUnsavedChanges(false);

        setStatusMsg({
          type: "success",
          text: `Đã lưu thành công ${res.data.length} tin nhắn cho hội thoại "${threadName}".`,
        });
        setTimeout(() => setStatusMsg({ type: "idle" }), 4000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể lưu hội thoại.",
        });
      }
    });
  };

  // Delete Entire Thread
  const handleDeleteThread = (key: string, name: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa toàn bộ đoạn hội thoại với "${name}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deletePhoneThread(caseId, key);
      if (res.success) {
        const remaining = messages.filter((m) => m.thread_key !== key);
        setMessages(remaining);
        onMessagesChange(remaining);
        if (activeThreadKey === key) {
          setActiveThreadKey("");
        }
        setStatusMsg({
          type: "success",
          text: `Đã xóa hội thoại "${name}".`,
        });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Lỗi khi xóa hội thoại.",
        });
      }
    });
  };

  // Upload Attachment File
  const handleUploadAttachment = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folder",
        file.type.startsWith("audio") ? "audio" : "photos",
      );
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        handleUpdateRow(index, "attachment_url", res.data.url);
        handleUpdateRow(
          index,
          "attachment_type",
          file.type.startsWith("audio") ? "audio" : "image",
        );
      } else {
        alert(res.error || "Lỗi khi tải lên file đính kèm.");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="size-4 text-emerald-400" />
            Biên tập Tin nhắn Hàng loạt (Batch Messages Editor)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tin nhắn &amp; Hội thoại — Soạn thảo dạng bảng, dán kịch bản hội
            thoại nhanh, chuẩn hóa vai trò người gửi và ghim manh mối
          </p>
        </div>
        {activeThreadKey && (
          <button
            type="button"
            onClick={handleSaveBatch}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white font-medium text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm ${
              hasUnsavedChanges
                ? "bg-emerald-600 hover:bg-emerald-500 animate-pulse"
                : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            <Save className="size-3.5" />
            {isPending ? "Đang lưu..." : "Lưu hội thoại (Batch)"}
          </button>
        )}
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

      {/* 2-Pane Split: Left Thread List | Right Active Thread Table Editor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[520px]">
        {/* LEFT COLUMN: Thread List (w-1/4) */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Đoạn hội thoại ({threads.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingThread((prev) => !prev)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Tạo mới
            </button>
          </div>

          {/* Form Tạo Hội Thoại Mới (Không tin mồi) */}
          {isCreatingThread && (
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-sky-800/60 space-y-2 animate-in fade-in">
              <span className="text-[11px] font-semibold text-sky-400 block">
                Thông tin người trò chuyện
              </span>
              <input
                type="text"
                placeholder="Tên đối tượng (VD: Hoàng Minh)..."
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Số điện thoại (tùy chọn)..."
                value={newThreadPhone}
                onChange={(e) => setNewThreadPhone(e.target.value)}
                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartCreateThread}
                  className="flex-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs cursor-pointer"
                >
                  Bắt đầu soạn
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingThread(false)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Danh Sách Hội Thoại */}
          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                Chưa có cuộc trò chuyện nào. Bấm &quot;Tạo mới&quot; để bắt đầu.
              </div>
            ) : (
              threads.map((t) => {
                const isActive = t.thread_key === activeThreadKey;
                const clueCount = t.messages.filter((m) => m.is_clue).length;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <div
                    key={t.thread_key}
                    onClick={() => setActiveThreadKey(t.thread_key)}
                    className={`group w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? "bg-sky-950/50 border-sky-600/70 text-zinc-100"
                        : "bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="size-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300">
                      <User className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate">
                          {t.thread_name}
                        </span>
                        <div className="flex items-center gap-1">
                          {clueCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-700/60">
                              <Key className="size-2.5" /> {clueCount}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {t.messages.length}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.body : t.phone_number || "Trống"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(t.thread_key, t.thread_name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                      title="Xóa cuộc trò chuyện này"
                    >
                      <Trash2 className="size-3" />
                    </button>
                    <ChevronRight className="size-3.5 text-zinc-600 shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Table-Based Message Batch Editor (w-3/4) */}
        <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col space-y-4">
          {!activeThreadKey ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <MessageSquare className="size-8 mb-2 opacity-40 text-zinc-400" />
              <p className="text-sm">
                Chọn một đoạn hội thoại bên trái hoặc tạo mới để bắt đầu biên
                tập hàng loạt.
              </p>
            </div>
          ) : (
            <>
              {/* Thread Info Bar & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  <div className="flex-1 max-w-[220px]">
                    <label className="block text-[10px] font-medium text-zinc-400 mb-0.5">
                      Tên người trò chuyện
                    </label>
                    <input
                      type="text"
                      value={threadName}
                      onChange={(e) => {
                        setThreadName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex-1 max-w-[180px]">
                    <label className="block text-[10px] font-medium text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Phone className="size-2.5" /> Số thuê bao
                    </label>
                    <input
                      type="text"
                      value={threadPhone}
                      onChange={(e) => {
                        setThreadPhone(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="09xx.xxx.xxx"
                      className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono pt-3">
                    Key: {activeThreadKey}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasteModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                    title="Dán nhanh khối văn bản hội thoại"
                  >
                    <ClipboardPaste className="size-3.5 text-sky-400" />
                    Dán kịch bản
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-700/60 hover:bg-sky-900 text-sky-200 text-xs font-medium cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Thêm dòng
                  </button>
                </div>
              </div>

              {/* Messages Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[520px] rounded-lg border border-zinc-800 bg-zinc-950/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-zinc-800">
                    <tr>
                      <th className="py-2 px-2 w-12 text-center">#</th>
                      <th className="py-2 px-2 w-24">Giờ (Time)</th>
                      <th className="py-2 px-2 w-36">Người gửi / Vai trò</th>
                      <th className="py-2 px-2 min-w-[200px]">
                        Nội dung tin nhắn
                      </th>
                      <th className="py-2 px-2 w-32">Đính kèm</th>
                      <th className="py-2 px-2 w-28 text-center">Manh mối</th>
                      <th className="py-2 px-2 w-16 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {draftMessages.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-zinc-500 text-xs"
                        >
                          Chưa có tin nhắn nào trong hội thoại này. Bấm
                          &quot;Thêm dòng&quot; hoặc &quot;Dán kịch bản&quot; để
                          nạp dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      draftMessages.map((msg, idx) => {
                        const isSent = msg.role === "sent";

                        return (
                          <tr
                            key={msg.clientKey || idx}
                            className={`group hover:bg-zinc-900/40 transition-colors ${
                              msg.is_clue ? "bg-amber-950/20" : ""
                            }`}
                          >
                            {/* STT & Di chuyển */}
                            <td className="py-2 px-1 text-center font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-0.5">
                                <span>{idx + 1}</span>
                                <div className="flex flex-col ml-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-0.5 hover:text-sky-400 disabled:opacity-20 cursor-pointer"
                                    title="Di chuyển lên"
                                  >
                                    <ArrowUp className="size-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(idx, "down")}
                                    disabled={idx === draftMessages.length - 1}
                                    className="p-0.5 hover:text-sky-400 disabled:opacity-20 cursor-pointer"
                                    title="Di chuyển xuống"
                                  >
                                    <ArrowDown className="size-2.5" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Giờ (Time) */}
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={msg.timestamp || ""}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    idx,
                                    "timestamp",
                                    e.target.value,
                                  )
                                }
                                placeholder="20:15"
                                className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                              />
                            </td>

                            {/* Người gửi / Vai trò */}
                            <td className="py-2 px-2 space-y-1">
                              <input
                                type="text"
                                value={msg.sender || ""}
                                onChange={(e) =>
                                  handleUpdateRow(idx, "sender", e.target.value)
                                }
                                placeholder={isSent ? "Nạn nhân" : threadName}
                                className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateRow(idx, "role", "sent");
                                    if (
                                      !msg.sender ||
                                      msg.sender === threadName
                                    ) {
                                      handleUpdateRow(
                                        idx,
                                        "sender",
                                        "Nạn nhân",
                                      );
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                    isSent
                                      ? "bg-blue-600 text-white"
                                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  Gửi đi (me)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateRow(idx, "role", "received");
                                    if (msg.sender === "Nạn nhân") {
                                      handleUpdateRow(
                                        idx,
                                        "sender",
                                        threadName,
                                      );
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                    !isSent
                                      ? "bg-emerald-600 text-white"
                                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  Nhận (them)
                                </button>
                              </div>
                            </td>

                            {/* Nội dung */}
                            <td className="py-2 px-2">
                              <textarea
                                rows={2}
                                value={msg.body || ""}
                                onChange={(e) =>
                                  handleUpdateRow(idx, "body", e.target.value)
                                }
                                placeholder="Nhập nội dung tin nhắn..."
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-xs text-zinc-100 focus:outline-none focus:border-sky-500 resize-y min-h-[38px]"
                              />
                            </td>

                            {/* Đính kèm */}
                            <td className="py-2 px-2 space-y-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={msg.attachment_url || ""}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      idx,
                                      "attachment_url",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="URL ảnh / audio..."
                                  className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[10px] text-zinc-300 focus:outline-none focus:border-sky-500 font-mono truncate"
                                />
                                <label className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer shrink-0">
                                  <Paperclip className="size-3" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,audio/*"
                                    onChange={(e) =>
                                      handleUploadAttachment(e, idx)
                                    }
                                  />
                                </label>
                              </div>
                              {msg.attachment_url && (
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                  <select
                                    value={msg.attachment_type || "image"}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "attachment_type",
                                        e.target.value,
                                      )
                                    }
                                    className="bg-zinc-900 border border-zinc-700 rounded px-1 py-0.5 text-[10px] text-zinc-200"
                                  >
                                    <option value="image">Ảnh</option>
                                    <option value="audio">Âm thanh</option>
                                    <option value="video">Video</option>
                                  </select>
                                  {msg.attachment_type === "audio" && (
                                    <input
                                      type="text"
                                      value={msg.attachment_duration || "0:08"}
                                      onChange={(e) =>
                                        handleUpdateRow(
                                          idx,
                                          "attachment_duration",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="0:08"
                                      className="w-12 px-1 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono"
                                    />
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Manh mối phá án */}
                            <td className="py-2 px-2 text-center">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(msg.is_clue)}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      idx,
                                      "is_clue",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                                />
                                <span className="text-[11px] text-zinc-400">
                                  Clue
                                </span>
                              </label>
                              {msg.is_clue && (
                                <div className="mt-1 space-y-1 text-left">
                                  <input
                                    type="text"
                                    value={msg.code || ""}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "code",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Mã (MSG-01)"
                                    className="w-full px-1 py-0.5 bg-zinc-900 border border-amber-800/80 rounded text-[10px] text-amber-300 font-mono"
                                  />
                                  <input
                                    type="text"
                                    value={msg.clue_title || ""}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "clue_title",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tiêu đề..."
                                    className="w-full px-1 py-0.5 bg-zinc-900 border border-amber-800/80 rounded text-[10px] text-zinc-200"
                                  />
                                </div>
                              )}
                            </td>

                            {/* Xóa dòng */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                                title="Xóa dòng tin nhắn này"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QUICK PASTE TEXT MODAL */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <ClipboardPaste className="size-4 text-sky-400" />
                Dán khối văn bản hội thoại (Batch Paste)
              </h3>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <p>Hỗ trợ các định dạng kịch bản phổ biến:</p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <li>Nam: Alo anh, tối nay có rảnh không? [20:15]</li>
                <li>&gt; Tôi: 9h tối tôi mới về đến nhà</li>
                <li>(20:20) Hà: Anh nhớ mua đồ ăn về nhé</li>
                <li>
                  Hoặc dán mảng JSON: [{`"sender": "Nam", "body": "..."`}]
                </li>
              </ul>
            </div>

            <textarea
              rows={8}
              value={pasteRawText}
              onChange={(e) => setPasteRawText(e.target.value)}
              placeholder="Dán khối văn bản kịch bản vào đây..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 font-mono focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyPastedBlock}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer"
              >
                Chèn vào bảng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
