"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  MessageSquare,
  Save,
  CheckCircle,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import type { DbPhoneMessage } from "@/lib/types/database";
import { slugifyVietnamese } from "@/lib/utils/text";
import {
  savePhoneMessagesBatch,
  deletePhoneThread,
  uploadPhoneAsset,
  type BatchMessageItemInput,
} from "@/lib/actions/phone-actions";
import { MessagesPasteModal } from "./messages-paste-modal";
import { MessagesThreadPanel } from "./messages-thread-panel";
import { MessagesThreadList } from "./messages-thread-list";

interface MessagesEditorProps {
  caseId: string;
  initialMessages: DbPhoneMessage[];
  onMessagesChange: (messages: DbPhoneMessage[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

export interface DraftMessageItem extends BatchMessageItemInput {
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
  onBusyChange,
}: MessagesEditorProps) {
  const [messages, setMessages] = useState<DbPhoneMessage[]>(initialMessages);
  const [activeThreadKey, setActiveThreadKey] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onBusyChange?.(isPending);
  }, [isPending, onBusyChange]);
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
    const generatedKey = `thread_${slugifyVietnamese(cleanName)}`;

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

    onBusyChange?.(true);
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

    onBusyChange?.(true);
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
        <MessagesThreadList
  threads={threads}
  setIsCreatingThread={setIsCreatingThread}
  isCreatingThread={isCreatingThread}
  newThreadName={newThreadName}
  setNewThreadName={setNewThreadName}
  newThreadPhone={newThreadPhone}
  setNewThreadPhone={setNewThreadPhone}
  handleStartCreateThread={handleStartCreateThread}
  activeThreadKey={activeThreadKey}
  setActiveThreadKey={setActiveThreadKey}
  handleDeleteThread={handleDeleteThread}
/>

        {/* RIGHT COLUMN: Table-Based Message Batch Editor (w-3/4) */}
        <MessagesThreadPanel
  activeThreadKey={activeThreadKey}
  threadName={threadName}
  setThreadName={setThreadName}
  setHasUnsavedChanges={setHasUnsavedChanges}
  threadPhone={threadPhone}
  setThreadPhone={setThreadPhone}
  setIsPasteModalOpen={setIsPasteModalOpen}
  handleAddRow={handleAddRow}
  draftMessages={draftMessages}
  handleMoveRow={handleMoveRow}
  handleUpdateRow={handleUpdateRow}
  handleUploadAttachment={handleUploadAttachment}
  handleDeleteRow={handleDeleteRow}
/>
      </div>

      {/* QUICK PASTE TEXT MODAL */}
      {isPasteModalOpen && (
        <MessagesPasteModal
  setIsPasteModalOpen={setIsPasteModalOpen}
  pasteRawText={pasteRawText}
  setPasteRawText={setPasteRawText}
  handleApplyPastedBlock={handleApplyPastedBlock}
/>
      )}
    </div>
  );
}
