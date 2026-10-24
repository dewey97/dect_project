"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Search,
  ChevronRight,
  Info,
  BookmarkCheck,
  X,
  ShieldAlert,
  Loader2,
  SquarePen,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { cn, normalizeImageUrl, normalizeMediaUrl } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { getActiveVictim } from "@/lib/cases/case-characters";
import { getStorageJson, setStorageJson } from "@/lib/storage";
import { EvidenceAnchorItem } from "../core/evidence-anchor-item";

interface MessagesAppProps {
  onBackToHome?: () => void;
}

interface MessageAttachment {
  type: "audio" | "image" | "video";
  url: string;
  duration?: string;
}

interface ParsedMessage {
  id: string;
  sender: string;
  role: "sent" | "received" | string;
  text: string;
  timestamp: string;
  attachment?: MessageAttachment;
  isClue: boolean;
  clueTitle: string;
  clueAnalysis: string;
  code?: string;
}

interface MessageThread {
  id: string;
  name: string;
  phoneNumber: string;
  unread: boolean;
  timestamp: string;
  previewText: string;
  code?: string;
  messages: ParsedMessage[];
}

interface FlatMessageRow {
  id?: string;
  thread_key?: string;
  thread_name?: string;
  thread_phone?: string;
  sender?: string;
  role?: string;
  body?: string;
  timestamp?: string;
  code?: string;
  is_clue?: boolean | string;
  clue_title?: string;
  clue_analysis?: string;
  attachment_type?: string;
  attachment_url?: string;
  attachment_duration?: string;
  slot_index?: number;
}

export function MessagesApp({ onBackToHome }: MessagesAppProps) {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingClue, setInspectingClue] = useState<ParsedMessage | null>(
    null,
  );
  const [pinnedClueIds, setPinnedClueIds] = useState<string[]>([]);
  const [pinnedNotification, setPinnedNotification] = useState<string | null>(
    null,
  );

  // Audio Playback State
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useState<HTMLAudioElement | null>(null)[0];

  // Media preview modal (Image lightbox or Video popup)
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "video";
    url: string;
    title?: string;
  } | null>(null);

  // Fetch messages live from Google Sheets CMS
  const { data: rawMessagesData, loading, error } = usePhoneData("messages");

  // Ref to message stream container to auto-scroll to latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest messages when opening a conversation
  useEffect(() => {
    if (selectedThread) {
      // Use requestAnimationFrame / small timeout to guarantee DOM rendered
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedThread?.id]);

  // Global audio element reference
  useEffect(() => {
    return () => {
      // Cleanup audio playback on unmount
      if (activeAudioId) {
        setIsPlayingAudio(false);
      }
    };
  }, [activeAudioId]);

  // Đọc danh sách tin nhắn phẳng (flat rows) từ bảng phone_messages,
  // nhóm theo thread_key và sắp xếp tuần tự theo slot_index.
  const threads: MessageThread[] = useMemo(() => {
    if (!Array.isArray(rawMessagesData) || rawMessagesData.length === 0) {
      return [];
    }

    const threadMap = new Map<
      string,
      {
        id: string;
        name: string;
        phoneNumber: string;
        code?: string;
        unread: boolean;
        messages: Array<{
          msg: ParsedMessage;
          slotIndex: number;
        }>;
      }
    >();

    const rows = rawMessagesData as FlatMessageRow[];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = String(
        row.thread_key || row.thread_name || `thread_${i}`,
      ).trim();
      const threadName = String(row.thread_name || key).trim();
      const threadPhone = String(row.thread_phone || "").trim();

      if (!threadMap.has(key)) {
        threadMap.set(key, {
          id: key,
          name: threadName,
          phoneNumber: threadPhone,
          unread: false,
          messages: [],
        });
      }

      const thread = threadMap.get(key)!;
      if (!thread.phoneNumber && threadPhone) {
        thread.phoneNumber = threadPhone;
      }
      if (row.code && !thread.code) {
        thread.code = row.code;
      }

      // Chuẩn hóa role thành "sent" | "received"
      const roleStr = String(row.role || "")
        .toLowerCase()
        .trim();
      const isSent =
        roleStr === "sent" ||
        roleStr === "me" ||
        roleStr === "victim" ||
        row.sender === "Nạn nhân" ||
        row.sender === "Tôi";
      const role = isSent ? "sent" : "received";

      // Đính kèm phương tiện
      let attachment: MessageAttachment | undefined = undefined;
      if (row.attachment_url && row.attachment_url.trim().length > 0) {
        const rawUrl = row.attachment_url.trim();
        const aType =
          row.attachment_type === "audio" || row.attachment_type === "video"
            ? row.attachment_type
            : "image";
        attachment = {
          type: aType,
          url:
            aType === "image"
              ? normalizeImageUrl(rawUrl)
              : normalizeMediaUrl(rawUrl),
          duration:
            row.attachment_duration || (aType === "audio" ? "0:08" : undefined),
        };
      }

      const isClue =
        row.is_clue === true ||
        row.is_clue === "true" ||
        row.is_clue === "TRUE";

      const parsed: ParsedMessage = {
        id: row.id || `msg-${key}-${i}`,
        sender: row.sender || (isSent ? "Nạn nhân" : threadName),
        role,
        text: row.body || "",
        timestamp: row.timestamp || "",
        attachment,
        isClue,
        clueTitle: row.clue_title || "",
        clueAnalysis: row.clue_analysis || "",
        code: row.code || undefined,
      };

      thread.messages.push({
        msg: parsed,
        slotIndex: typeof row.slot_index === "number" ? row.slot_index : i,
      });
    }

    return Array.from(threadMap.values()).map((t) => {
      // Sắp xếp tin nhắn trong thread theo slot_index tăng dần
      t.messages.sort((a, b) => a.slotIndex - b.slotIndex);
      const sortedMsgs = t.messages.map((m) => m.msg);
      const lastMsg = sortedMsgs[sortedMsgs.length - 1];

      const previewText = lastMsg
        ? lastMsg.attachment?.type === "audio"
          ? "🎙️ Tin nhắn thoại"
          : lastMsg.attachment?.type === "image"
            ? "📷 Hình ảnh"
            : lastMsg.attachment?.type === "video"
              ? "📹 Video"
              : lastMsg.text
        : "";

      return {
        id: t.id,
        name: t.name,
        phoneNumber: t.phoneNumber,
        unread: t.unread,
        timestamp: lastMsg?.timestamp || "",
        previewText,
        code: t.code,
        messages: sortedMsgs,
      };
    });
  }, [rawMessagesData]);

  useEffect(() => {
    setPinnedClueIds(getStorageJson<string[]>("khang_phone_pinned_clues", []));
  }, []);

  const togglePinClue = (clueId: string, title?: string) => {
    setPinnedClueIds((prev) => {
      const next = prev.includes(clueId)
        ? prev.filter((id) => id !== clueId)
        : [...prev, clueId];
      setStorageJson("khang_phone_pinned_clues", next);
      return next;
    });
    setPinnedNotification(
      pinnedClueIds.includes(clueId)
        ? "Đã gỡ manh mối"
        : `Đã ghim: ${title || "Manh mối"}`,
    );
    setTimeout(() => setPinnedNotification(null), 2500);
  };

  // Audio durations dynamically loaded from files (msgId -> mm:ss)
  const [loadedDurations, setLoadedDurations] = useState<
    Record<string, string>
  >({});

  // Helper format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play audio toggle
  const togglePlayAudio = (msgId: string, audioUrl: string) => {
    const existingAudio = document.getElementById(
      "msg-active-audio",
    ) as HTMLAudioElement;

    if (activeAudioId === msgId && isPlayingAudio) {
      if (existingAudio) existingAudio.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (existingAudio) {
      existingAudio.pause();
      existingAudio.remove();
    }

    const audio = new Audio(audioUrl);
    audio.id = "msg-active-audio";
    setActiveAudioId(msgId);
    setIsPlayingAudio(true);
    setAudioProgress(0);

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setLoadedDurations((prev) => ({
          ...prev,
          [msgId]: formatTime(audio.duration),
        }));
      }
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
      setActiveAudioId(null);
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      setActiveAudioId(null);
    };

    audio.play().catch((err) => {
      console.warn("Could not play audio message:", err);
      setIsPlayingAudio(false);
    });
  };

  const filteredThreads = threads.filter(
    (t: MessageThread) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.previewText.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-[#FAF9FE] text-[#1A1B1F] select-none overflow-hidden font-sans relative">
      {/* Pinned Clue Toast Notification */}
      {pinnedNotification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#FFFFFF]/95 border border-[#0058BC]/30 shadow-lg text-[11px] text-[#0058BC] font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <BookmarkCheck className="size-3.5 text-[#0058BC]" />
          <span>{pinnedNotification}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. THREAD DETAIL VIEW (Conversation Messages)                      */}
      {/* ------------------------------------------------------------------ */}
      {selectedThread ? (
        <div className="flex flex-col h-full bg-[#FAF9FE] animate-in slide-in-from-right-4 duration-200">
          {/* Light Header per Figma Specs */}
          <div className="flex items-center justify-between px-3 h-[44px] bg-[#FFFFFF] border-b border-[#E3E2E7] shrink-0 z-10">
            <button
              onClick={() => {
                const existingAudio = document.getElementById(
                  "msg-active-audio",
                ) as HTMLAudioElement;
                if (existingAudio) {
                  existingAudio.pause();
                  existingAudio.remove();
                }
                setIsPlayingAudio(false);
                setActiveAudioId(null);
                setSelectedThread(null);
              }}
              className="flex items-center gap-0.5 text-[#0058BC] text-[15px] font-normal hover:opacity-80 active:opacity-60 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
              <span>Tin nhắn</span>
            </button>

            <span className="text-[17px] font-semibold tracking-tight text-[#1A1B1F] truncate max-w-[160px]">
              {selectedThread.name}
            </span>

            <button
              onClick={() => {
                const firstClue = selectedThread.messages.find(
                  (m: ParsedMessage) => m.isClue,
                );
                if (firstClue) setInspectingClue(firstClue);
              }}
              className="text-[#0058BC] hover:opacity-80 active:opacity-60 p-1 cursor-pointer"
              title="Chi tiết manh mối"
            >
              <Info className="size-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Messages Bubble Stream */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-2 flex flex-col justify-start pb-8 scroll-smooth">
            <div className="text-center my-0.5">
              <span className="text-[11px] text-[#717786] bg-[#E9E7ED] px-2.5 py-0.5 rounded-full font-medium">
                iMessage · iSMS
              </span>
            </div>

            {selectedThread.messages.map((msg: ParsedMessage, mIdx: number) => {
              const isMe = msg.role === "sent";
              const isPinned = pinnedClueIds.includes(msg.id);
              const attachment = msg.attachment;
              const msgCode =
                msg.code ||
                (msg.isClue
                  ? `CLUE-${String(mIdx + 1).padStart(2, "0")}`
                  : `MSG-${String(mIdx + 1).padStart(2, "0")}`);

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col w-full",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  <EvidenceAnchorItem
                    code={msgCode}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      isMe ? "self-end items-end" : "self-start items-start",
                    )}
                  >
                    {/* ATTACHMENT: AUDIO / VOICE MESSAGE */}
                    {attachment?.type === "audio" && (
                      <div
                        className={cn(
                          "rounded-[20px] p-2.5 px-3.5 mb-1 shadow-xs relative transition-all flex items-center gap-3 min-w-[210px]",
                          isMe
                            ? "bg-[#0058BC] text-white rounded-br-[4px]"
                            : "bg-[#E9E7ED] text-[#1A1B1F] rounded-bl-[4px]",
                        )}
                      >
                        <button
                          onClick={() =>
                            togglePlayAudio(msg.id, attachment.url)
                          }
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs",
                            isMe
                              ? "bg-white text-[#0058BC] hover:bg-slate-100"
                              : "bg-[#0058BC] text-white hover:bg-[#004899]",
                          )}
                          title="Nghe tin nhắn thoại"
                        >
                          {activeAudioId === msg.id && isPlayingAudio ? (
                            <Pause className="size-4 fill-current" />
                          ) : (
                            <Play className="size-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1",
                                isMe ? "text-white/80" : "text-[#717786]",
                              )}
                            >
                              <Volume2 className="size-3" /> Tin nhắn thoại
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-mono",
                                isMe ? "text-white/90" : "text-[#414755]",
                              )}
                            >
                              {loadedDurations[msg.id] ||
                                attachment.duration ||
                                "0:08"}
                            </span>
                          </div>

                          {/* Audio Waveform visualization */}
                          <div className="h-3 flex items-center gap-[3px] w-full">
                            {[
                              30, 70, 45, 90, 60, 100, 40, 80, 50, 85, 30, 95,
                              60, 40, 70,
                            ].map((heightPercent, barIdx) => {
                              const barThreshold = (barIdx / 15) * 100;
                              const isPast =
                                activeAudioId === msg.id &&
                                audioProgress >= barThreshold;
                              return (
                                <div
                                  key={barIdx}
                                  className={cn(
                                    "flex-1 rounded-full transition-colors",
                                    isMe
                                      ? isPast
                                        ? "bg-white"
                                        : "bg-white/40"
                                      : isPast
                                        ? "bg-[#0058BC]"
                                        : "bg-[#C1C6D7]",
                                  )}
                                  style={{ height: `${heightPercent}%` }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {isPinned && (
                          <span className="absolute -top-1 -right-1 size-4 bg-[#FF3B30] rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                            ★
                          </span>
                        )}
                      </div>
                    )}

                    {/* ATTACHMENT: IMAGE */}
                    {attachment?.type === "image" && (
                      <div
                        onClick={() =>
                          setMediaPreview({
                            type: "image",
                            url: attachment.url,
                            title: msg.text || "Ảnh đính kèm",
                          })
                        }
                        className={cn(
                          "rounded-[16px] overflow-hidden mb-1 shadow-xs border border-[#E3E2E7] cursor-pointer hover:opacity-95 transition-opacity max-w-[240px] relative group",
                          isMe ? "rounded-br-[4px]" : "rounded-bl-[4px]",
                        )}
                      >
                        <img
                          src={attachment.url}
                          alt="Đính kèm"
                          className="w-full max-h-[220px] object-cover bg-black/5"
                          loading="lazy"
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-3.5" />
                        </div>
                        {isPinned && (
                          <span className="absolute top-1.5 right-1.5 size-4 bg-[#FF3B30] rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                            ★
                          </span>
                        )}
                      </div>
                    )}

                    {/* ATTACHMENT: VIDEO / ANIMATED GIF */}
                    {attachment?.type === "video" && (
                      <div
                        onClick={() =>
                          setMediaPreview({
                            type: "video",
                            url: attachment.url,
                            title: msg.text || "Video đính kèm",
                          })
                        }
                        className={cn(
                          "rounded-[16px] overflow-hidden mb-1 shadow-xs border border-[#E3E2E7] cursor-pointer hover:opacity-95 transition-opacity max-w-[240px] relative bg-black aspect-video flex items-center justify-center group",
                          isMe ? "rounded-br-[4px]" : "rounded-bl-[4px]",
                        )}
                      >
                        {/* If it's a GIF or image proxy, render the live animated preview */}
                        {attachment.url.includes("lh3.googleusercontent.com") ||
                        attachment.url.includes("image-proxy") ||
                        attachment.url.endsWith(".gif") ? (
                          <img
                            src={attachment.url}
                            alt="Video Preview"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <video
                            src={attachment.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        )}

                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="size-10 rounded-full bg-white/80 group-hover:bg-white text-[#1A1B1F] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                            <Play className="size-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        <span className="absolute bottom-1.5 left-2 text-[10px] text-white/90 font-medium flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                          <Film className="size-3" /> Video
                        </span>
                        {isPinned && (
                          <span className="absolute top-1.5 right-1.5 size-4 bg-[#FF3B30] rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                            ★
                          </span>
                        )}
                      </div>
                    )}

                    {/* REGULAR TEXT BUBBLE (If text exists) */}
                    {Boolean(msg.text) && (
                      <div
                        className={cn(
                          "rounded-[18px] px-3 py-1.5 text-[14.5px] leading-snug shadow-xs relative transition-all font-normal",
                          isMe
                            ? "bg-[#0058BC] text-white rounded-br-[4px]"
                            : "bg-[#E9E7ED] text-[#1A1B1F] rounded-bl-[4px]",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        {isPinned && !attachment && (
                          <span className="absolute -top-1 -right-1 size-4 bg-[#FF3B30] rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                            ★
                          </span>
                        )}
                      </div>
                    )}

                    {msg.timestamp && (
                      <span className="text-[11px] text-[#717786] font-normal mt-0.5 px-1">
                        {msg.timestamp}
                      </span>
                    )}
                  </EvidenceAnchorItem>
                </div>
              );
            })}
            {/* Invisible bottom anchor for auto-scroll */}
            <div ref={messagesEndRef} className="h-2 shrink-0" />
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* 2. CONVERSATION LIST VIEW (Figma Frame 22:755 - Light Theme 100%)  */
        /* ------------------------------------------------------------------ */
        <div className="flex flex-col h-full bg-[#FAF9FE]">
          {/* Top Nav Header (Figma Node 22:820 - 375x68px, white bg) */}
          <div className="px-4 pt-1 pb-2 bg-[#FFFFFF] border-b border-[#E3E2E7] shrink-0">
            <div className="flex items-center justify-center h-[44px]">
              {/* Title (Figma Node 22:843: 17px semi-bold #1A1B1F) */}
              <span className="text-[17px] font-semibold tracking-tight text-[#1A1B1F]">
                Tin nhắn
              </span>
            </div>

            {/* iOS Search Bar (Figma Node 22:849: 343x36px, fill #EEEFF1, placeholder #717786) */}
            <div className="relative mt-1 mb-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#717786]" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                aria-label="Tìm kiếm tin nhắn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] rounded-[10px] bg-[#EEEFF1] pl-9 pr-3 text-[15px] text-[#1A1B1F] placeholder-[#717786] focus:outline-none focus:ring-1 focus:ring-[#0058BC] transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#717786]">
              <Loader2 className="size-6 animate-spin mb-2 text-[#0058BC]" />
              <span className="text-xs">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex-1 p-4 text-center text-xs text-[#FF3B30]">
              Lỗi: {error}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#E3E2E7] bg-[#FAF9FE] pb-10">
              {filteredThreads.map((thread: MessageThread, idx: number) => {
                const threadCode =
                  thread.code ||
                  thread.id ||
                  `MSG-${String(idx + 1).padStart(2, "0")}`;
                const displayCode =
                  threadCode.startsWith("MSG-") ||
                  threadCode.startsWith("CLUE-")
                    ? threadCode
                    : `MSG-${String(idx + 1).padStart(2, "0")}`;
                return (
                  <EvidenceAnchorItem key={thread.id} code={displayCode}>
                    <div
                      onClick={() => setSelectedThread(thread)}
                      className="flex items-center min-h-[62px] px-3.5 py-2 hover:bg-[#FFFFFF] active:bg-[#EEEFF1] cursor-pointer transition-colors bg-[#FAF9FE]"
                    >
                      {/* Conversation Row Text Body */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Header line: Sender Name + Timestamp */}
                        <div className="flex items-center justify-between">
                          <span className="text-[16px] font-semibold text-[#1A1B1F] truncate leading-tight">
                            {thread.name}
                          </span>
                          <span
                            className={cn(
                              "text-[12px] font-normal shrink-0 ml-2 font-sans",
                              thread.unread
                                ? "text-[#0058BC] font-semibold"
                                : "text-[#8E8E93]",
                            )}
                          >
                            {thread.timestamp}
                          </span>
                        </div>

                        {/* Preview Text Line */}
                        <p className="text-[13.5px] font-normal text-[#636366] truncate mt-0.5 leading-snug">
                          {thread.previewText}
                        </p>
                      </div>
                    </div>
                  </EvidenceAnchorItem>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Clue Inspector Modal */}
      {inspectingClue && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs p-4 flex flex-col justify-center items-center animate-in fade-in-50">
          <div className="w-full max-w-[300px] rounded-2xl bg-[#FFFFFF] border border-[#E3E2E7] p-4 shadow-2xl space-y-3 text-[#1A1B1F]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E2E7]">
              <span className="text-[12px] font-bold text-[#0058BC] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="size-4 text-[#0058BC]" /> Manh Mối Điều
                Tra
              </span>
              <button
                onClick={() => setInspectingClue(null)}
                className="text-[#717786] hover:text-[#1A1B1F] p-1 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2 text-left">
              <div className="text-[13px] font-bold text-[#1A1B1F]">
                {inspectingClue.clueTitle || "Manh mối mấu chốt"}
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF9FE] border border-[#E3E2E7] text-[12px] text-[#414755] italic">
                "{inspectingClue.text}"
              </div>
              <div className="text-[12px] text-[#717786] leading-relaxed">
                {inspectingClue.clueAnalysis}
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  togglePinClue(inspectingClue.id, inspectingClue.clueTitle);
                  setInspectingClue(null);
                }}
                className={cn(
                  "w-full py-2.5 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  pinnedClueIds.includes(inspectingClue.id)
                    ? "bg-[#E9E7ED] text-[#FF3B30] border border-[#FF3B30]/30"
                    : "bg-[#0058BC] text-white hover:bg-[#004696]",
                )}
              >
                <BookmarkCheck className="size-4" />
                {pinnedClueIds.includes(inspectingClue.id)
                  ? "Đã ghim vào sổ tay"
                  : "Ghim vào sổ tay"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Media Preview Modal (Image Lightbox / Video Player) */}
      {mediaPreview && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex flex-col justify-center items-center animate-in fade-in-50">
          <div className="w-full max-w-[340px] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 text-white/80">
              <span className="text-[12px] font-medium truncate max-w-[240px]">
                {mediaPreview.title ||
                  (mediaPreview.type === "image"
                    ? "Xem hình ảnh"
                    : "Phát video")}
              </span>
              <button
                onClick={() => setMediaPreview(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center max-h-[460px]">
              {mediaPreview.type === "image" ||
              mediaPreview.url.includes("lh3.googleusercontent.com") ||
              mediaPreview.url.includes("image-proxy") ||
              mediaPreview.url.endsWith(".gif") ? (
                <img
                  src={mediaPreview.url}
                  alt="Xem chi tiết"
                  className="w-full max-h-[460px] object-contain"
                />
              ) : (
                <video
                  src={mediaPreview.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[460px] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
