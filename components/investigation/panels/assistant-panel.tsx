"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/investigation/screen-header";
import {
  AssistantMessage,
  DetectiveAction,
  SuggestionChip,
  HintCard,
  EvidenceReference,
  CaseWarning,
  RecoveredInformation,
  SystemAlert,
} from "@/components/investigation/assistant-console-components";
import { getAssistantConversation } from "@/lib/content-service";
import { getActiveCase } from "@/lib/mock-data";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import type { AssistantConversation } from "@/lib/types";
import { Shield, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageLog {
  id: string;
  type:
    | "system"
    | "assistant"
    | "detective"
    | "hint"
    | "reference"
    | "warning"
    | "info";
  level?: 1 | 2 | 3;
  text?: string;
  title?: string;
  rows?: { label: string; value: string }[];
  evidenceId?: string;
  previewText?: string;
}

interface AssistantPanelProps {
  showHeader?: boolean;
  className?: string;
}

export function AssistantPanel({
  showHeader = true,
  className,
}: AssistantPanelProps) {
  const router = useRouter();
  const [intel, setIntel] = useState<AssistantConversation | null>(null);

  // Connect to Google Sheets Live CMS for dynamic hints and timeline sync
  const { data: sheetHints } = usePhoneData("hints");
  const { data: sheetTimeline } = usePhoneData("timeline");

  const [messages, setMessages] = useState<MessageLog[]>([
    {
      id: "init-asst",
      type: "assistant",
      text: "Xin chào thám tử, tôi là điều phối viên Minh. Tôi sẽ đồng hành cùng bạn trong vụ án này.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<
    "root" | "hint1" | "hint2" | "hint3" | "timeline" | "messages" | "trace"
  >("root");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load dynamic content from Content Engine Layer
  useEffect(() => {
    async function loadIntel() {
      const activeCase = await getActiveCase();
      const queryId =
        activeCase?.id === "case-01"
          ? "case-001"
          : activeCase?.id || "case-001";
      const data = await getAssistantConversation(queryId);
      if (data) {
        setIntel(data);
        setMessages([
          {
            id: "init-asst",
            type: "assistant",
            text: data.welcomeMessage,
          },
        ]);
      }
    }
    loadIntel();
  }, []);

  // Auto scroll to bottom when messages or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Triggers simulated typing and replies
  function triggerReply(
    detectiveInput: string,
    newBranch: typeof currentBranch,
    replies: Omit<MessageLog, "id">[],
  ) {
    // 1. Add Detective's command
    setMessages((prev) => [
      ...prev,
      { id: `det-${Date.now()}`, type: "detective", text: detectiveInput },
    ]);

    setIsTyping(true);

    // 2. Simulate Operator decoding delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        ...replies.map((r, idx) => ({
          ...r,
          id: `reply-${Date.now()}-${idx}`,
        })),
      ]);
      setCurrentBranch(newBranch);
    }, 1000);
  }

  // Handle chip actions
  function handleChipAction(action: string) {
    if (isTyping || !intel) return;

    // Derive hints from Google Sheets live CMS with fallback to intel
    const hint1Text =
      sheetHints.find((h: any) => Number(h.level) === 1)?.hint_text ||
      intel.hints.find((h) => h.level === 1)?.text ||
      "";
    const hint2Text =
      sheetHints.find((h: any) => Number(h.level) === 2)?.hint_text ||
      intel.hints.find((h) => h.level === 2)?.text ||
      "";
    const hint3Text =
      sheetHints.find((h: any) => Number(h.level) === 3)?.hint_text ||
      intel.hints.find((h) => h.level === 3)?.text ||
      "";

    // Derive timeline rows from Google Sheets live CMS with fallback
    const timelineRows =
      sheetTimeline.length > 0
        ? sheetTimeline.map((item: any) => ({
            label: item.time || item.timestamp || "",
            value: `${item.character ? `[${item.character}] ` : ""}${item.action || item.description || ""}${item.location ? ` @ ${item.location}` : ""}`,
          }))
        : intel.timelineInfo.rows || [];

    switch (action) {
      case "root_timeline":
        triggerReply("Phục dựng nhật ký dòng thời gian nạn nhân", "timeline", [
          {
            type: "system",
            text: "ĐANG PHỤC DỰNG PHÂN VÙNG DỮ LIỆU // DÒNG THỜI GIAN",
          },
          {
            type: "info",
            title: intel.timelineInfo.title,
            rows: timelineRows,
          },
          {
            type: "assistant",
            text: "Dòng thời gian pháp y ghi nhận các mốc di chuyển và hoạt động của các nghi phạm xung quanh thời điểm xảy ra án mạng. Hãy đối chiếu định vị GPS để tìm ra mâu thuẫn ngoại phạm.",
          },
        ]);
        break;

      case "root_messages":
        triggerReply("Xem chỉ mục tin nhắn khôi phục", "messages", [
          {
            type: "reference",
            evidenceId: intel.recoveredMessageRef.evidenceId,
            title: intel.recoveredMessageRef.title,
            previewText: intel.recoveredMessageRef.previewText,
          },
          {
            type: "assistant",
            text: "Các tệp tin nhắn và hội thoại đã khôi phục thành công. Bạn có thể mở chi tiết thiết bị tang vật tương ứng để đọc nội dung.",
          },
        ]);
        break;

      case "root_hint1":
        triggerReply("Yêu cầu gợi ý // Cấp độ 1", "hint1", [
          {
            type: "hint",
            level: 1,
            text: hint1Text,
          },
        ]);
        break;

      case "need_hint2":
        triggerReply("Yêu cầu gợi ý // Cấp độ 2", "hint2", [
          {
            type: "hint",
            level: 2,
            text: hint2Text,
          },
        ]);
        break;

      case "need_hint3":
        triggerReply("Yêu cầu gợi ý // Cấp độ 3", "hint3", [
          {
            type: "warning",
            text: "ĐÃ BẺ KHÓA THÀNH CÔNG CHỈ DẪN TRỰC TIẾP",
          },
          {
            type: "hint",
            level: 3,
            text: hint3Text,
          },
        ]);
        break;

      case "root_trace":
        triggerReply("Xem thông tin phân tích Trace", "trace", [
          {
            type: "assistant",
            text: "Cơ sở dữ liệu Trace đang hoạt động ổn định. Các thông tin thu thập được từ thẻ bài vật lý liên quan đã được đồng bộ đầy đủ.",
          },
        ]);
        break;

      case "reset_root":
        triggerReply("Quay lại menu chính", "root", [
          {
            type: "assistant",
            text: "Đã quay lại danh mục giao thức chính. Hãy chọn yêu cầu tiếp theo của bạn.",
          },
        ]);
        break;

      default:
        break;
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {showHeader && (
        <ScreenHeader
          eyebrow="FIELD INTEL COORDINATION"
          title="Assistant Minh"
          description="Review coordinated timelines, attachments, and graded hints."
        />
      )}

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4">
        {messages.map((msg) => {
          if (msg.type === "system")
            return <SystemAlert key={msg.id}>{msg.text}</SystemAlert>;
          if (msg.type === "detective")
            return <DetectiveAction key={msg.id}>{msg.text}</DetectiveAction>;
          if (msg.type === "hint")
            return (
              <HintCard
                key={msg.id}
                level={msg.level || 1}
                hint={msg.text || ""}
              />
            );
          if (msg.type === "reference")
            return (
              <EvidenceReference
                key={msg.id}
                evidenceId={msg.evidenceId || ""}
                title={msg.title || ""}
                previewText={msg.previewText || ""}
              />
            );
          if (msg.type === "warning")
            return <CaseWarning key={msg.id}>{msg.text}</CaseWarning>;
          if (msg.type === "info")
            return (
              <RecoveredInformation
                key={msg.id}
                title={msg.title || ""}
                dataRows={msg.rows || []}
              />
            );
          return <AssistantMessage key={msg.id}>{msg.text}</AssistantMessage>;
        })}

        {/* Typing Loader Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1 max-w-[85%] self-start bg-muted/90 p-3 px-4 rounded-2xl rounded-tl-sm shadow-sm">
            <div className="flex gap-1">
              <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Bottom Suggestion Action Chips Panel */}
      <div className="border-t border-border bg-background/95 p-3.5 flex flex-col gap-2 mt-auto">
        {currentBranch === "root" && intel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {intel.initialChips.map((chip) => (
              <SuggestionChip
                key={chip.action}
                label={chip.label}
                onClick={() => handleChipAction(chip.action)}
                disabled={isTyping}
              />
            ))}
          </div>
        )}

        {currentBranch === "hint1" && (
          <div className="flex flex-col gap-2">
            <SuggestionChip
              label="Need Level 2 Hint"
              onClick={() => handleChipAction("need_hint2")}
              disabled={isTyping}
            />
            <SuggestionChip
              label="Back to Main Protocols"
              onClick={() => handleChipAction("reset_root")}
              disabled={isTyping}
            />
          </div>
        )}

        {currentBranch === "hint2" && (
          <div className="flex flex-col gap-2">
            <SuggestionChip
              label="Need Level 3 Hint"
              onClick={() => handleChipAction("need_hint3")}
              disabled={isTyping}
            />
            <SuggestionChip
              label="Back to Main Protocols"
              onClick={() => handleChipAction("reset_root")}
              disabled={isTyping}
            />
          </div>
        )}

        {currentBranch === "hint3" && (
          <div className="flex flex-col gap-2">
            <SuggestionChip
              label="Back to Main Protocols"
              onClick={() => handleChipAction("reset_root")}
              disabled={isTyping}
            />
          </div>
        )}

        {(currentBranch === "timeline" ||
          currentBranch === "messages" ||
          currentBranch === "trace") && (
          <div className="flex flex-col gap-2">
            <SuggestionChip
              label="Back to Main Protocols"
              onClick={() => handleChipAction("reset_root")}
              disabled={isTyping}
            />
          </div>
        )}
      </div>
    </div>
  );
}
