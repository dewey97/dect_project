"use client";

import { useState } from "react";
import {
  Clock,
  Grid3X3,
  User,
  Voicemail,
  ChevronLeft,
  Loader2,
  Delete,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

interface PhoneAppProps {
  onBackToHome?: () => void;
  initialTab?: "recents" | "keypad" | "contacts" | "voicemail";
}

// Exact Figma Keypad spec (Frame 22:453)
const KEYPAD_BUTTONS = [
  { num: "1", sub: "" },
  { num: "2", sub: "ABC" },
  { num: "3", sub: "DEF" },
  { num: "4", sub: "GHI" },
  { num: "5", sub: "JKL" },
  { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" },
  { num: "8", sub: "TUV" },
  { num: "9", sub: "WXYZ" },
  { num: "*", sub: "" },
  { num: "0", sub: "+" },
  { num: "#", sub: "" },
];

export function PhoneApp({
  onBackToHome,
  initialTab = "keypad",
}: PhoneAppProps) {
  const [activeTab, setActiveTab] = useState<
    "recents" | "contacts" | "keypad" | "voicemail"
  >(initialTab);
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
          ? "di động"
          : item.call_type === "OUTGOING"
            ? "cuộc gọi đi"
            : "di động",
      time: timeFormatted,
      isMissed,
      isIncoming:
        item.call_type === "INCOMING" || item.call_type === "INCOMING_ACCEPTED",
      missedCount: item.missed_count || (isMissed ? 1 : 0),
    };
  });

  const handleKeypadPress = (num: string) => {
    if (keypadInput.length < 15) {
      setKeypadInput((prev) => prev + num);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9FE] text-[#1A1B1F] select-none overflow-hidden font-sans">
      {/* Top Header bar with exact Figma status bar height offset */}
      <div className="px-3 pt-1 pb-1 bg-[#FFFFFF] shrink-0 border-b border-[#E3E2E7] flex items-center justify-between h-[44px]">
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
          <span className="w-16" />
        )}

        <span className="text-[17px] font-semibold tracking-tight text-[#1A1B1F]">
          {activeTab === "keypad" && ""}
          {activeTab === "recents" && "Gần đây"}
          {activeTab === "contacts" && "Danh bạ"}
          {activeTab === "voicemail" && "Hộp thư thoại"}
        </span>

        <button className="text-[15px] font-normal text-[#0058BC] hover:opacity-80 active:opacity-60 cursor-pointer">
          Sửa
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#FAF9FE]">
        {/* KEYPAD TAB (Figma Frame 22:453) */}
        {activeTab === "keypad" && (
          <div className="flex flex-col items-center justify-between h-full pt-4 pb-6 px-4">
            {/* Displayed Number Area (Node 22:456: height 96px) */}
            <div className="flex flex-col items-center justify-center min-h-[96px] w-full">
              <div className="h-[44px] text-[34px] font-light tracking-tight text-[#1A1B1F] text-center font-sans flex items-center justify-center">
                {keypadInput}
              </div>
              {keypadInput ? (
                <button
                  onClick={() => {
                    /* quick action Add to contacts */
                  }}
                  className="mt-1 text-[13px] font-normal text-[#0058BC] hover:underline cursor-pointer"
                >
                  Thêm số
                </button>
              ) : (
                <div className="h-[22px]" />
              )}
            </div>

            {/* Keypad Grid (Figma Node 22:461: 295x434px, 75x75 buttons, row gap 16, col gap 24) */}
            <div className="flex flex-col gap-[16px] items-center my-auto">
              {/* Rows 1-4 */}
              {[
                [KEYPAD_BUTTONS[0], KEYPAD_BUTTONS[1], KEYPAD_BUTTONS[2]],
                [KEYPAD_BUTTONS[3], KEYPAD_BUTTONS[4], KEYPAD_BUTTONS[5]],
                [KEYPAD_BUTTONS[6], KEYPAD_BUTTONS[7], KEYPAD_BUTTONS[8]],
                [KEYPAD_BUTTONS[9], KEYPAD_BUTTONS[10], KEYPAD_BUTTONS[11]],
              ].map((row, rIdx) => (
                <div key={rIdx} className="flex gap-[24px]">
                  {row.map((k) => (
                    <button
                      key={k.num}
                      onClick={() => handleKeypadPress(k.num)}
                      aria-label={`Số ${k.num} ${k.sub}`}
                      className="size-[75px] rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] active:bg-[#D1D1D6] flex flex-col items-center justify-center transition-colors shadow-xs cursor-pointer select-none"
                    >
                      <span className="text-[34px] font-light text-[#1A1B1F] leading-none tracking-tight">
                        {k.num}
                      </span>
                      {k.sub ? (
                        <span className="text-[9px] font-medium tracking-wider text-[#414755] mt-[2px] leading-none uppercase">
                          {k.sub}
                        </span>
                      ) : (
                        <span className="h-[9px] mt-[2px]" />
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {/* Row 5: Call Button Anchor (Node 22:530: 75x75 green circle #4CD964) + Delete */}
              <div className="flex gap-[24px] items-center justify-center relative w-[273px]">
                <div className="w-[75px]" />
                <button
                  onClick={() => {}}
                  aria-label="Gọi điện"
                  className="size-[75px] rounded-full bg-[#4CD964] hover:bg-[#42C85A] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                  title="Gọi"
                >
                  <svg
                    className="w-[27px] h-[27px] fill-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </button>
                {keypadInput ? (
                  <button
                    onClick={() => setKeypadInput((p) => p.slice(0, -1))}
                    aria-label="Xóa chữ số vừa nhập"
                    className="w-[75px] h-[75px] min-h-[44px] min-w-[44px] flex items-center justify-center text-[#717786] hover:text-[#1A1B1F] active:opacity-60 cursor-pointer"
                    title="Xóa"
                  >
                    <Delete className="size-7" />
                  </button>
                ) : (
                  <div className="w-[75px]" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* RECENTS TAB (Figma Frame 22:582) */}
        {activeTab === "recents" && (
          <div className="bg-[#FFFFFF]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-[#717786]">
                <Loader2 className="size-6 animate-spin mb-2 text-[#0058BC]" />
                <span className="text-xs">Đang tải nhật ký cuộc gọi...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-xs text-red-500">
                Lỗi: {error}
              </div>
            ) : recents.length === 0 ? (
              <div className="text-center py-12 text-[#717786] text-sm">
                Không có cuộc gọi nào
              </div>
            ) : (
              <div className="divide-y divide-[#E3E2E7]">
                {recents.map((call: any, idx: number) => (
                  <div
                    key={idx}
                    className="h-[60px] pl-4 pr-3 py-[10px] flex items-center justify-between hover:bg-[#FAF9FE] active:bg-[#F2F2F7] cursor-pointer transition-colors"
                  >
                    {/* Left: Contact info */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {/* Green incoming icon if applicable (Node 22:608: 9x9 green fill) */}
                      {call.isIncoming && (
                        <svg
                          className="w-[9px] h-[9px] fill-[#34C759] shrink-0"
                          viewBox="0 0 9 9"
                        >
                          <path
                            d="M0 9L9 0M9 0H2M9 0V7"
                            stroke="#34C759"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "text-[17px] font-normal leading-tight truncate",
                              call.isMissed
                                ? "text-[#BA1A1A]"
                                : "text-[#000000]",
                            )}
                          >
                            {call.name}
                          </span>
                          {call.isMissed && call.missedCount > 1 && (
                            <span className="text-[15px] font-normal text-[#BA1A1A]">
                              ({call.missedCount})
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] font-normal text-[#8E8E93] mt-0.5 leading-none">
                          {call.type}
                        </div>
                      </div>
                    </div>

                    {/* Right: Time + Call Details Button (Node 22:600: 18x18 icon #007AFF) */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[14px] font-normal text-[#8E8E93]">
                        {call.time}
                      </span>
                      <button
                        aria-label="Chi tiết cuộc gọi"
                        className="size-[44px] flex items-center justify-center text-[#007AFF] hover:opacity-70 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
                        title="Chi tiết cuộc gọi"
                      >
                        <Info className="size-[18px] stroke-[1.75]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS / VOICEMAIL PLACEHOLDERS */}
        {activeTab === "contacts" && (
          <div className="text-center py-16 text-[#717786] text-sm">
            Danh bạ hệ thống
          </div>
        )}
        {activeTab === "voicemail" && (
          <div className="text-center py-16 text-[#717786] text-sm">
            Không có thư thoại mới
          </div>
        )}
      </div>

      {/* Bottom iOS Phone Tab Bar (Figma Node 22:558: height 49px, 4 Tabs) */}
      <div className="h-[49px] bg-[#FFFFFF] border-t border-[#E3E2E7] grid grid-cols-4 items-center px-1 shrink-0">
        <button
          onClick={() => setActiveTab("recents")}
          aria-label="Thẻ Gần đây"
          className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer relative min-h-[44px]",
            activeTab === "recents" ? "text-[#0058BC]" : "text-[#717786]",
          )}
        >
          <Clock className="size-[17px]" />
          <span className="text-[10px] font-medium mt-[2px]">Gần đây</span>
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          aria-label="Thẻ Danh bạ"
          className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer relative min-h-[44px]",
            activeTab === "contacts" ? "text-[#0058BC]" : "text-[#717786]",
          )}
        >
          <User className="size-[18px]" />
          <span className="text-[10px] font-medium mt-[2px]">Danh bạ</span>
        </button>

        <button
          onClick={() => setActiveTab("keypad")}
          aria-label="Thẻ Bàn phím"
          className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer relative min-h-[44px]",
            activeTab === "keypad" ? "text-[#0058BC]" : "text-[#717786]",
          )}
        >
          <Grid3X3 className="size-[18px]" />
          <span className="text-[10px] font-medium mt-[2px]">Bàn phím</span>
        </button>

        <button
          onClick={() => setActiveTab("voicemail")}
          aria-label="Thẻ Hộp thư thoại"
          className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer relative min-h-[44px]",
            activeTab === "voicemail" ? "text-[#0058BC]" : "text-[#717786]",
          )}
        >
          <Voicemail className="size-[18px]" />
          <span className="text-[10px] font-medium mt-[2px]">
            Hộp thư thoại
          </span>
          {/* Unread Voicemail Badge (Node 22:580: 16x16 red badge #BA1A1A) */}
          <span className="absolute top-[3px] right-[18px] size-[16px] rounded-full bg-[#BA1A1A] text-white font-normal text-[10px] flex items-center justify-center shadow-xs">
            1
          </span>
        </button>
      </div>
    </div>
  );
}
