"use client";

import { useState, useEffect } from "react";
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
import { getStorageJson, setStorageJson } from "@/lib/storage";

interface MessagesAppProps {
  onBackToHome?: () => void;
}

export function MessagesApp({ onBackToHome }: MessagesAppProps) {
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingClue, setInspectingClue] = useState<any | null>(null);
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

  // Global audio element reference
  useEffect(() => {
    return () => {
      // Cleanup audio playback on unmount
      if (activeAudioId) {
        setIsPlayingAudio(false);
      }
    };
  }, [activeAudioId]);

  // Map CMS rows to thread objects
  const threads = rawMessagesData.map((item: any, idx: number) => {
    let parsedMessages: any[] = [];

    if (item.messages_json) {
      try {
        parsedMessages =
          typeof item.messages_json === "string"
            ? JSON.parse(item.messages_json)
            : item.messages_json;
      } catch {}
    }

    if (parsedMessages.length === 0 && item.messages_text) {
      const lines = String(item.messages_text)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      parsedMessages = lines.map((line, mIdx) => {
        const isSent = line.startsWith(">");
        let cleanLine = isSent ? line.substring(1).trim() : line;

        let clueTitle = "";
        let clueAnalysis = "";
        let isClue = false;

        // 1. Parse [CLUE: title | analysis]
        const clueMatch = cleanLine.match(
          /\[CLUE:\s*([^|]+)\s*\|\s*([^\]]+)\]$/i,
        );
        if (clueMatch) {
          isClue = true;
          clueTitle = clueMatch[1].trim();
          clueAnalysis = clueMatch[2].trim();
          cleanLine = cleanLine
            .replace(/\[CLUE:\s*([^|]+)\s*\|\s*([^\]]+)\]$/i, "")
            .trim();
        }

        // 2. Parse attachments: [AUDIO: url | duration], [IMAGE: url], [VIDEO: url]
        let attachment: any = null;

        const audioMatch = cleanLine.match(
          /\[AUDIO:\s*([^|\]]+)(?:\s*\|\s*([^\]]+))?\]/i,
        );
        if (audioMatch) {
          const rawUrl = audioMatch[1].trim();
          const duration = audioMatch[2]?.trim() || "0:08";
          attachment = {
            type: "audio",
            url: normalizeMediaUrl(rawUrl),
            duration,
          };
          cleanLine = cleanLine.replace(audioMatch[0], "").trim();
        }

        // Support Vietnamese tag with or without link:
        // Cú pháp 1: 🎙️ [Tin nhắn thoại 0:08 | https://drive.google.com/...]
        // Cú pháp 2: 🎙️ [Tin nhắn thoại | https://drive.google.com/... | 0:08]
        // Cú pháp 3: 🎙️ [Tin nhắn thoại 0:08] (không link -> dùng mặc định)
        if (!attachment) {
          const vnAudioWithLinkMatch = cleanLine.match(
            /(?:🎙️\s*)?\[(?:Tin nhắn thoại|Thư thoại|Voice|Audio)\s*(?:([0-9:]+)\s*\|\s*([^\]|]+)|([^\]|]+)\s*\|\s*([0-9:]+)|([^\]|]+))\]/i,
          );
          if (vnAudioWithLinkMatch) {
            let duration = "0:08";
            let rawUrl = "";

            if (vnAudioWithLinkMatch[1] && vnAudioWithLinkMatch[2]) {
              duration = vnAudioWithLinkMatch[1].trim();
              rawUrl = vnAudioWithLinkMatch[2].trim();
            } else if (vnAudioWithLinkMatch[3] && vnAudioWithLinkMatch[4]) {
              rawUrl = vnAudioWithLinkMatch[3].trim();
              duration = vnAudioWithLinkMatch[4].trim();
            } else if (vnAudioWithLinkMatch[5]) {
              const part = vnAudioWithLinkMatch[5].trim();
              if (/^[0-9:]+$/.test(part)) {
                duration = part;
              } else if (part.includes("http") || part.includes("/") || part.includes("drive")) {
                rawUrl = part;
              }
            }

            if (!rawUrl) {
              rawUrl =
                item.contact_name === "Hà"
                  ? "/audio/ha_voicemail_2032.mp3"
                  : "/audio/voice_khang.mp3";
            }

            attachment = {
              type: "audio",
              url: normalizeMediaUrl(rawUrl),
              duration,
            };
            cleanLine = cleanLine.replace(vnAudioWithLinkMatch[0], "").trim();
          }
        }

        const imageMatch = cleanLine.match(/\[IMAGE:\s*([^\]]+)\]/i);
        if (imageMatch) {
          const rawUrl = imageMatch[1].trim();
          attachment = {
            type: "image",
            url: normalizeImageUrl(rawUrl),
          };
          cleanLine = cleanLine.replace(imageMatch[0], "").trim();
        }

        const videoMatch = cleanLine.match(/\[VIDEO:\s*([^\]]+)\]/i);
        if (videoMatch) {
          const rawUrl = videoMatch[1].trim();
          attachment = {
            type: "video",
            url: normalizeMediaUrl(rawUrl),
          };
          cleanLine = cleanLine.replace(videoMatch[0], "").trim();
        }

        // 3. Parse Timestamp: (24/07 • 20:32) or (20:32)
        let timestamp = "";
        const tsMatch = cleanLine.match(/^\(([^)]+)\)\s*(.*)$/);
        let text = cleanLine;

        if (tsMatch) {
          timestamp = tsMatch[1].trim();
          text = tsMatch[2].trim();
        }

        return {
          id: `msg-${idx}-${mIdx}`,
          sender: isSent ? "Khang" : item.contact_name || "Khác",
          role: isSent ? "sent" : "received",
          text,
          timestamp,
          attachment,
          isClue,
          clueTitle,
          clueAnalysis,
        };
      });
    }

    const isUnread = item.unread === "TRUE" || item.unread === true;

    return {
      id: item.message_id || `conv-${idx + 1}`,
      name: item.contact_name || item.name || "Không tên",
      phoneNumber: item.phone_number || "",
      unread: isUnread,
      timestamp: item.timestamp || "",
      previewText:
        item.preview_text ||
        (parsedMessages.length > 0
          ? parsedMessages[parsedMessages.length - 1].attachment?.type === "audio"
            ? "🎙️ Tin nhắn thoại"
            : parsedMessages[parsedMessages.length - 1].attachment?.type === "image"
            ? "📷 Hình ảnh"
            : parsedMessages[parsedMessages.length - 1].attachment?.type === "video"
            ? "📹 Video"
            : parsedMessages[parsedMessages.length - 1].text
          : ""),
      messages: parsedMessages.map((m: any, mIdx: number) => ({
        id: m.id || `msg-${idx}-${mIdx}`,
        sender: m.sender || m.role || item.contact_name,
        role: m.role || (m.sender === "Khang" ? "sent" : "received"),
        text: m.text || m.content || "",
        timestamp: m.timestamp || "",
        attachment: m.attachment || (m.media_url ? {
          type: m.media_type || "image",
          url: m.media_type === "audio" || m.media_type === "video" ? normalizeMediaUrl(m.media_url) : normalizeImageUrl(m.media_url),
          duration: m.duration
        } : undefined),
        isClue: m.isClue || m.is_clue === "TRUE" || m.is_clue === true,
        clueTitle: m.clueTitle || m.clue_title || "",
        clueAnalysis: m.clueAnalysis || m.clue_analysis || "",
      })),
    };
  });

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
  const [loadedDurations, setLoadedDurations] = useState<Record<string, string>>({});

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
    (t: any) =>
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
                  (m: any) => m.isClue,
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
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 flex flex-col justify-start pb-10">
            <div className="text-center my-1">
              <span className="text-[11px] text-[#717786] bg-[#E9E7ED] px-3 py-1 rounded-full font-medium">
                iMessage · iSMS
              </span>
            </div>

            {selectedThread.messages.map((msg: any) => {
              const isMe = msg.role === "sent";
              const isPinned = pinnedClueIds.includes(msg.id);
              const attachment = msg.attachment;

              return (
                <div
                  key={msg.id}
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
                        onClick={() => togglePlayAudio(msg.id, attachment.url)}
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
                          {[30, 70, 45, 90, 60, 100, 40, 80, 50, 85, 30, 95, 60, 40, 70].map(
                            (heightPercent, barIdx) => {
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
                            },
                          )}
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
                      {attachment.url.includes("lh3.googleusercontent.com") || attachment.url.includes("image-proxy") || attachment.url.endsWith(".gif") ? (
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
                        "rounded-[18px] px-3.5 py-2 text-[15px] leading-relaxed shadow-xs relative transition-all font-normal",
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
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* 2. CONVERSATION LIST VIEW (Figma Frame 22:755 - Light Theme 100%)  */
        /* ------------------------------------------------------------------ */
        <div className="flex flex-col h-full bg-[#FAF9FE]">
          {/* Top Nav Header (Figma Node 22:820 - 375x68px, white bg) */}
          <div className="px-4 pt-1 pb-2 bg-[#FFFFFF] border-b border-[#E3E2E7] shrink-0">
            <div className="flex items-center justify-between h-[44px]">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#0058BC] text-[15px] font-normal hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát về Trang chính"
                >
                  <ChevronLeft className="size-5" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <button className="text-[15px] font-normal text-[#0058BC] hover:opacity-80 active:opacity-60 cursor-pointer">
                  Sửa
                </button>
              )}

              {/* Title (Figma Node 22:843: 17px semi-bold #1A1B1F) */}
              <span className="text-[17px] font-semibold tracking-tight text-[#1A1B1F]">
                Tin nhắn
              </span>

              {/* New Message Icon (Figma Node 22:847: 18x18 icon #0058BC) */}
              <button
                aria-label="Soạn tin nhắn mới"
                className="text-[#0058BC] hover:opacity-80 active:opacity-60 p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <SquarePen className="size-[18px] stroke-[1.75]" />
              </button>
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
              <span className="text-xs">Đang tải tin nhắn từ Live CMS...</span>
            </div>
          ) : error ? (
            <div className="flex-1 p-4 text-center text-xs text-[#FF3B30]">
              Lỗi: {error}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-[#E3E2E7] bg-[#FAF9FE] pb-10">
              {filteredThreads.map((thread: any) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className="flex items-center h-[86px] px-4 py-[12px] hover:bg-[#FFFFFF] active:bg-[#EEEFF1] cursor-pointer transition-colors bg-[#FAF9FE]"
                >
                  {/* Conversation Row Text Body */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
                    {/* Header line: Sender Name + Timestamp */}
                    <div className="flex items-center justify-between">
                      <span className="text-[17px] font-semibold text-[#1A1B1F] truncate leading-tight">
                        {thread.name}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] font-normal shrink-0 ml-2",
                          thread.unread
                            ? "text-[#0058BC] font-medium"
                            : "text-[#717786]",
                        )}
                      >
                        {thread.timestamp}
                      </span>
                    </div>

                    {/* Preview Text Line (Figma Node 22:766: 15px #414755) */}
                    <p className="text-[15px] font-normal text-[#414755] truncate mt-1 leading-snug">
                      {thread.previewText}
                    </p>
                  </div>

                  {/* Chevron Mũi Tên > (Figma Node 22:769: 6x10 chevron #C1C6D7) */}
                  <ChevronRight className="w-[6px] h-[10px] text-[#C1C6D7] shrink-0 ml-1" />
                </div>
              ))}
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
                {mediaPreview.title || (mediaPreview.type === "image" ? "Xem hình ảnh" : "Phát video")}
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
