"use client";

import { useState } from "react";
import {
  Phone,
  Clock,
  Grid3X3,
  User,
  Star,
  Voicemail,
  ChevronLeft,
  Loader2,
  Delete,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { detectiveAudio } from "@/lib/investigation-audio";

interface PhoneAppProps {
  onBackToHome?: () => void;
  initialTab?: "recents" | "keypad" | "contacts" | "favorites" | "voicemail";
}

const KEYPAD_BUTTONS = [
  { num: "1", sub: "" },
  { num: "2", sub: "A B C" },
  { num: "3", sub: "D E F" },
  { num: "4", sub: "G H I" },
  { num: "5", sub: "J K L" },
  { num: "6", sub: "M N O" },
  { num: "7", sub: "P Q R S" },
  { num: "8", sub: "T U V" },
  { num: "9", sub: "W X Y Z" },
  { num: "*", sub: "" },
  { num: "0", sub: "+" },
  { num: "#", sub: "" },
];

export function PhoneApp({
  onBackToHome,
  initialTab = "recents",
}: PhoneAppProps) {
  const [activeTab, setActiveTab] = useState<
    "favorites" | "recents" | "contacts" | "keypad" | "voicemail"
  >(initialTab);
  const [recentsFilter, setRecentsFilter] = useState<"all" | "missed">("all");
  const [keypadInput, setKeypadInput] = useState("");

  const { data: callsData, loading, error } = usePhoneData("calls");

  const recents = callsData.map((item: any) => {
    const rawName = item.display_name || item.contact_name || item.caller_name;
    const name = rawName || item.phone_number || "Không rõ";
    const phone = item.phone_number || "";
    const timeFormatted = item.time_str
      ? item.date_str
        ? `${item.time_str} · ${item.date_str}`
        : item.time_str
      : item.timestamp || item.time || "";

    const isMissed =
      item.call_type === "INCOMING_MISSED" ||
      String(item.is_missed).toUpperCase() === "TRUE" ||
      item.is_missed === true;

    return {
      name,
      phone,
      type:
        item.call_type === "INCOMING_MISSED"
          ? "Cuộc gọi nhỡ"
          : item.call_type === "OUTGOING"
            ? "Cuộc gọi đi"
            : "Cuộc gọi đến",
      time: timeFormatted,
      isMissed,
      duration: item.duration || "",
    };
  });

  const filteredRecents = recents.filter(
    (c: any) => recentsFilter === "all" || c.isMissed,
  );

  const handleKeypadPress = (num: string) => {
    if (keypadInput.length < 15) {
      setKeypadInput((prev) => prev + num);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <div className="px-4 pt-2.5 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E] flex items-center justify-between">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-0.5 text-[#0A84FF] text-[15px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
            title="Thoát về Trang chính"
          >
            <ChevronLeft className="size-5" />
            <span>Trang chính</span>
          </button>
        ) : (
          <span className="w-16" />
        )}

        {/* Center Title or Segment Control for Recents */}
        {activeTab === "recents" ? (
          <div className="flex bg-[#1C1C1E] p-0.5 rounded-[7px] border border-white/10">
            <button
              onClick={() => setRecentsFilter("all")}
              className={cn(
                "px-3 py-1 rounded-[5px] text-[12px] font-medium transition-all cursor-pointer",
                recentsFilter === "all"
                  ? "bg-[#636366] text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-white",
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setRecentsFilter("missed")}
              className={cn(
                "px-3 py-1 rounded-[5px] text-[12px] font-medium transition-all cursor-pointer",
                recentsFilter === "missed"
                  ? "bg-[#636366] text-white shadow-xs"
                  : "text-[#8E8E93] hover:text-white",
              )}
            >
              Cuộc gọi nhỡ
            </button>
          </div>
        ) : (
          <span className="text-[17px] font-semibold tracking-tight text-white">
            {activeTab === "keypad" && "Bàn phím"}
            {activeTab === "favorites" && "Mục yêu thích"}
            {activeTab === "contacts" && "Danh bạ"}
            {activeTab === "voicemail" && "Thư thoại"}
          </span>
        )}

        <button className="text-[15px] font-medium text-[#0A84FF] hover:opacity-80 active:opacity-60 cursor-pointer">
          Sửa
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-1 pb-16">
        {/* RECENTS TAB (Frame 22:582) */}
        {activeTab === "recents" && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-[#8E8E93]">
                <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
                <span className="text-xs">Đang tải lịch sử cuộc gọi...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-xs text-red-400">
                Lỗi: {error}
              </div>
            ) : filteredRecents.length === 0 ? (
              <div className="text-center py-12 text-[#8E8E93] text-sm">
                Không có cuộc gọi nào
              </div>
            ) : (
              <div className="divide-y divide-[#1C1C1E]">
                {filteredRecents.map((call: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-2.5 px-1 flex items-center justify-between hover:bg-[#1C1C1E]/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div
                        className={cn(
                          "text-[17px] font-semibold leading-tight truncate",
                          call.isMissed
                            ? "text-[#BA1A1A] dark:text-[#FF453A]"
                            : "text-white",
                        )}
                      >
                        {call.name}
                      </div>
                      <div className="text-[13px] text-[#8E8E93] flex items-center gap-1.5 mt-0.5 font-normal">
                        <span>{call.type}</span>
                        {call.phone && call.name !== call.phone && (
                          <span className="text-[#636366] font-mono text-[11px]">
                            ({call.phone})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[13px] text-[#8E8E93] font-sans">
                          {call.time}
                        </div>
                        {call.duration && (
                          <div className="text-[11px] text-[#636366] font-sans mt-0.5">
                            {call.duration}
                          </div>
                        )}
                      </div>
                      <button
                        className="size-6 rounded-full flex items-center justify-center text-[#0058BC] dark:text-[#0A84FF] hover:bg-white/10 active:scale-95 transition-all"
                        title="Thông tin chi tiết"
                      >
                        <Info className="size-5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KEYPAD TAB (Frame 22:453) */}
        {activeTab === "keypad" && (
          <div className="flex flex-col items-center justify-center pt-3 pb-4 space-y-4">
            {/* Phone Number Input Display */}
            <div className="h-10 text-[32px] font-light tracking-wider text-white text-center font-sans flex items-center justify-center">
              {keypadInput || " "}
            </div>

            {/* Keypad Grid (Figma: 75px circles, row gap 16px, col gap 24px) */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-[280px]">
              {KEYPAD_BUTTONS.map((k) => (
                <button
                  key={k.num}
                  onClick={() => handleKeypadPress(k.num)}
                  className="size-[72px] sm:size-[75px] rounded-full bg-[#F2F2F7]/15 dark:bg-[#2C2C2E] hover:bg-[#3A3A3C] active:bg-[#545458] text-white flex flex-col items-center justify-center transition-colors shadow-sm cursor-pointer"
                >
                  <span className="text-[28px] sm:text-[30px] font-light leading-none">
                    {k.num}
                  </span>
                  {k.sub ? (
                    <span className="text-[9px] font-semibold tracking-[1px] text-[#AEAEB2] mt-0.5 leading-none uppercase">
                      {k.sub}
                    </span>
                  ) : (
                    <span className="h-[9px] mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Row with Green Call Button (75px circle) & Delete */}
            <div className="grid grid-cols-3 gap-x-6 items-center max-w-[280px] pt-1">
              <div />
              <button
                onClick={() => {}}
                className="size-[72px] sm:size-[75px] rounded-full bg-[#4CD964] sm:bg-[#34C759] hover:bg-[#30D158] active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer mx-auto"
                title="Gọi"
              >
                <Phone className="size-8 fill-current" />
              </button>
              {keypadInput ? (
                <button
                  onClick={() => {
                    setKeypadInput((p) => p.slice(0, -1));
                  }}
                  className="p-3 text-[#8E8E93] hover:text-white active:opacity-60 flex items-center justify-center cursor-pointer"
                  title="Xóa"
                >
                  <Delete className="size-7" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}

        {/* FAVORITES, CONTACTS, VOICEMAIL PLACEHOLDERS */}
        {activeTab === "favorites" && (
          <div className="text-center py-16 text-[#8E8E93] text-sm">
            Chưa có mục yêu thích
          </div>
        )}
        {activeTab === "contacts" && (
          <div className="text-center py-16 text-[#8E8E93] text-sm">
            Mở ứng dụng Danh bạ để xem chi tiết
          </div>
        )}
        {activeTab === "voicemail" && (
          <div className="text-center py-16 text-[#8E8E93] text-sm">
            Không có thư thoại mới
          </div>
        )}
      </div>

      {/* Bottom iOS Phone Tab Bar (Height 50px, 4/5 Tabs) */}
      <div className="h-[52px] bg-[#161618]/90 backdrop-blur-md border-t border-[#2C2C2E] grid grid-cols-4 items-center px-4 shrink-0 text-[#8E8E93] text-[10px]">
        <button
          onClick={() => setActiveTab("recents")}
          className={cn(
            "flex flex-col items-center gap-1 cursor-pointer",
            activeTab === "recents" && "text-[#0058BC] dark:text-[#0A84FF]",
          )}
        >
          <Clock className="size-5" />
          <span>Gần đây</span>
        </button>
        <button
          onClick={() => setActiveTab("keypad")}
          className={cn(
            "flex flex-col items-center gap-1 cursor-pointer",
            activeTab === "keypad" && "text-[#0058BC] dark:text-[#0A84FF]",
          )}
        >
          <Grid3X3 className="size-5" />
          <span>Bàn phím</span>
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={cn(
            "flex flex-col items-center gap-1 cursor-pointer",
            activeTab === "contacts" && "text-[#0058BC] dark:text-[#0A84FF]",
          )}
        >
          <User className="size-5" />
          <span>Danh bạ</span>
        </button>
        <button
          onClick={() => setActiveTab("voicemail")}
          className={cn(
            "flex flex-col items-center gap-1 cursor-pointer",
            activeTab === "voicemail" && "text-[#0058BC] dark:text-[#0A84FF]",
          )}
        >
          <Voicemail className="size-5" />
          <span>Thư thoại</span>
        </button>
      </div>
    </div>
  );
}
