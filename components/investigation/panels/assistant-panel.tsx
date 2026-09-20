"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  getCheckpointHints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import type { AssistantConversation } from "@/lib/types";
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
  level?: number;
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

  // Dynamic Google Sheets Live CMS data
  const { data: sheetCheckpoints } =
    usePhoneData<SheetCheckpointRow>("checkpoints");
  const { data: sheetTimeline } = usePhoneData("timeline");

  // Extract all dynamic hints directly from Google Sheet (unlimited levels)
  const activeHints = useMemo(() => {
    const firstCp = sheetCheckpoints[0];
    const extracted = getCheckpointHints(firstCp);
    if (extracted.length > 0) return extracted;
    return intel?.hints.map((h) => h.text) || [];
  }, [sheetCheckpoints, intel]);

  const [messages, setMessages] = useState<MessageLog[]>([
    {
      id: "init-asst",
      type: "assistant",
      text: "Xin chào thám tử, tôi là điều phối viên Minh. Tôi sẽ đồng hành cùng bạn trong vụ án này.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);
  const [currentBranch, setCurrentBranch] = useState<
    "root" | "hint" | "timeline" | "messages" | "trace"
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

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function triggerReply(
    detectiveInput: string,
    newBranch: typeof currentBranch,
    replies: Omit<MessageLog, "id">[],
  ) {
    setMessages((prev) => [
      ...prev,
      { id: `det-${Date.now()}`, type: "detective", text: detectiveInput },
    ]);

    setIsTyping(true);

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

  // Handle requesting hint level N (1-indexed)
  function handleRequestHintLevel(targetLevel: number) {
    if (isTyping || activeHints.length === 0) return;

    const hintText = activeHints[targetLevel - 1] || "";
    const isFinalHint = targetLevel === activeHints.length;

    const replies: Omit<MessageLog, "id">[] = [];
    if (isFinalHint && targetLevel >= 3) {
      replies.push({
        type: "warning",
        text: "ĐÃ BẺ KHÓA THÀNH CÔNG CHỈ DẪN TRỰC TIẾP",
      });
    }

    replies.push({
      type: "hint",
      level: targetLevel,
      text: hintText,
    });

    setCurrentHintLevel(targetLevel);
    triggerReply(`Yêu cầu gợi ý // Cấp độ ${targetLevel}`, "hint", replies);
  }

  function handleChipAction(action: string) {
    if (isTyping || !intel) return;

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
      case "root_hint":
        handleRequestHintLevel(1);
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
        setCurrentHintLevel(0);
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
                level={(msg.level as 1 | 2 | 3) || 1}
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

      {/* Dynamic Action Chips */}
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

        {/* Multi-level hints navigation: dynamically offer next level if exists in Sheet */}
        {currentBranch === "hint" && (
          <div className="flex flex-col gap-2">
            {currentHintLevel < activeHints.length && (
              <SuggestionChip
                label={`Need Level ${currentHintLevel + 1} Hint (${currentHintLevel + 1}/${activeHints.length})`}
                onClick={() => handleRequestHintLevel(currentHintLevel + 1)}
                disabled={isTyping}
              />
            )}
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
