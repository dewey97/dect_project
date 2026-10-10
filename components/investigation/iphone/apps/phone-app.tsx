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
  Search,
  Phone as PhoneIcon,
  MessageSquare,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";

interface PhoneAppProps {
  onBackToHome?: () => void;
  initialTab?: "recents" | "keypad" | "contacts";
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
    "recents" | "contacts" | "keypad"
  >(initialTab);
  const [keypadInput, setKeypadInput] = useState("");

  const { data: callsData, loading, error } = usePhoneData("calls");
  const { data: rawContactsData, loading: contactsLoading } = usePhoneData("contacts");

  const [contactsSearch, setContactsSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const contacts = rawContactsData.map((item: any, idx: number) => ({
    id: item.contact_id || `c-${idx + 1}`,
    name: item.name || item.display_name || "Không rõ",
    phone: item.phone_number || "",
    category: item.category || "Người quen",
    note: item.note || "",
  }));

  const filteredContacts = contacts.filter((c: any) =>
    c.name.toLowerCase().includes(contactsSearch.toLowerCase()) ||
    c.phone.includes(contactsSearch),
  );

  const groupedContacts: Record<string, typeof contacts> = {};
  filteredContacts
    .slice()
    .sort((a: any, b: any) => a.name.localeCompare(b.name, "vi"))
    .forEach((c: any) => {
      const firstLetter = c.name.charAt(0).toUpperCase();
      const key = /[A-ZÀ-Ỹ]/.test(firstLetter) ? firstLetter : "#";
      if (!groupedContacts[key]) groupedContacts[key] = [];
      groupedContacts[key].push(c);
    });

  const [recentsFilter, setRecentsFilter] = useState<"all" | "missed">("all");

  const defaultDurations: Record<string, string> = {
    L01: "00:45",
    L02: "01:24",
    L03: "02:18",
    L04: "00:52",
    L05: "03:10",
    L06: "01:05",
    L07: "04:30",
    L08: "00:38",
    L09: "02:05",
    L10: "01:40",
  };

  const recents = callsData.map((item: any, idx: number) => {
    const rawName = item.display_name || item.contact_name || item.caller_name;
    const name = rawName || item.phone_number || "Không rõ";
    const phone = item.phone_number || "";
    const timeFormatted = item.time_str
      ? item.time_str
      : item.timestamp || item.time || "";

    const isMissed =
      item.call_type === "INCOMING_MISSED" ||
      String(item.is_missed).toUpperCase() === "TRUE" ||
      item.is_missed === true;

    const isOutgoing = item.call_type === "OUTGOING";
    const isIncoming =
      item.call_type === "INCOMING" || item.call_type === "INCOMING_ACCEPTED";

    const duration =
      item.duration ||
      item.call_duration ||
      item.duration_str ||
      (!isMissed ? defaultDurations[item.call_id] || defaultDurations[`L0${idx + 1}`] || "01:15" : "");

    return {
      name,
      phone,
      type:
        item.call_type === "INCOMING_MISSED"
          ? "di động"
          : isOutgoing
            ? "cuộc gọi đi"
            : item.label_type || "di động",
      time: timeFormatted,
      duration,
      isMissed,
      isOutgoing,
      isIncoming,
      missedCount: item.missed_count || (isMissed ? 1 : 0),
    };
  });

  const displayedRecents = recents.filter((c: any) =>
    recentsFilter === "missed" ? c.isMissed : true,
  );

  const handleKeypadPress = (num: string) => {
    if (keypadInput.length < 15) {
      setKeypadInput((prev) => prev + num);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9FE] text-[#1A1B1F] select-none overflow-hidden font-sans">
      {/* Top Header bar with exact Figma status bar height offset */}
      <div className="px-3 bg-[#FFFFFF] shrink-0 border-b border-[#E3E2E7] flex items-center justify-between h-[44px]">
        {/* Left Action */}
        {activeTab === "contacts" && selectedContact ? (
          <button
            onClick={() => setSelectedContact(null)}
            className="flex items-center gap-1 text-[#0058BC] text-[15px] font-normal hover:opacity-80 active:opacity-60 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Danh bạ</span>
          </button>
        ) : activeTab === "contacts" ? (
          <span className="text-[16px] font-normal text-[#0058BC] cursor-pointer">
            Nhóm
          </span>
        ) : (
          <button className="text-[16px] font-normal text-[#0058BC] hover:opacity-80 active:opacity-60 cursor-pointer">
            Sửa
          </button>
        )}

        {/* Center: Title / Segmented Control */}
        {activeTab === "recents" ? (
          <div className="flex items-center rounded-lg bg-[#E3E2E7]/70 p-0.5 border border-[#D1D1D6]">
            <button
              onClick={() => setRecentsFilter("all")}
              className={cn(
                "px-3 py-0.5 text-[12px] font-medium rounded-md transition-all cursor-pointer",
                recentsFilter === "all"
                  ? "bg-[#FFFFFF] text-[#000000] shadow-xs"
                  : "text-[#717786] hover:text-[#000000]",
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setRecentsFilter("missed")}
              className={cn(
                "px-3 py-0.5 text-[12px] font-medium rounded-md transition-all cursor-pointer",
                recentsFilter === "missed"
                  ? "bg-[#FFFFFF] text-[#000000] shadow-xs"
                  : "text-[#717786] hover:text-[#000000]",
              )}
            >
              Cuộc gọi nhỡ
            </button>
          </div>
        ) : (
          <span className="text-[17px] font-semibold tracking-tight text-[#1A1B1F]">
            {activeTab === "keypad" && ""}
            {activeTab === "contacts" &&
              (selectedContact ? "" : "Tất cả danh bạ")}
          </span>
        )}

        {/* Right Action */}
        {activeTab === "contacts" && selectedContact ? (
          <button className="text-[15px] font-normal text-[#0058BC] hover:opacity-80 cursor-pointer">
            Sửa
          </button>
        ) : activeTab === "contacts" ? (
          <button
            className="text-[#0058BC] hover:opacity-80 cursor-pointer p-1"
            title="Thêm danh bạ"
          >
            <Plus className="size-5" />
          </button>
        ) : onBackToHome ? (
          <button
            onClick={onBackToHome}
            className="flex items-center text-[#0058BC] text-[13px] font-normal hover:opacity-80 active:opacity-60 cursor-pointer"
            title="Thoát về Trang chính"
          >
            <span>Đóng</span>
          </button>
        ) : (
          <div className="w-8" />
        )}
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
                {displayedRecents.map((call: any, idx: number) => (
                  <div
                    key={idx}
                    className="h-[60px] pl-4 pr-4 py-[10px] flex items-center justify-between hover:bg-[#FAF9FE] active:bg-[#F2F2F7] cursor-pointer transition-colors"
                  >
                    {/* Left: Contact Name + Call Direction Arrow on the right of name */}
                    <div className="min-w-0 pr-3 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[17px] font-normal leading-tight truncate",
                            call.isMissed
                              ? "text-[#BA1A1A] font-medium"
                              : "text-[#000000]",
                          )}
                        >
                          {call.name}
                        </span>

                        {/* Missed count (red) */}
                        {call.isMissed && call.missedCount > 1 && (
                          <span className="text-[15px] font-normal text-[#BA1A1A]">
                            ({call.missedCount})
                          </span>
                        )}

                        {/* Dấu gọi đi / gọi đến đẩy sang bên phải của liên hệ */}
                        {!call.isMissed && call.isOutgoing && (
                          <svg
                            className="w-[11px] h-[11px] text-[#34C759] shrink-0"
                            viewBox="0 0 11 11"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 10L10 1M10 1H3M10 1V8" />
                          </svg>
                        )}
                        {!call.isMissed && call.isIncoming && (
                          <svg
                            className="w-[11px] h-[11px] text-[#007AFF] shrink-0"
                            viewBox="0 0 11 11"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10 1L1 10M1 10H8M1 10V3" />
                          </svg>
                        )}
                      </div>

                      {/* Sub-label: di động, nhà riêng, Cuộc gọi FaceTime... */}
                      <div className="text-[13px] font-normal text-[#8E8E93] mt-0.5 leading-none">
                        {call.type}
                      </div>
                    </div>

                    {/* Right: [Thời lượng]  [Thời điểm] (ĐÃ BỎ ICON THÔNG TIN (i)) */}
                    <div className="flex items-center gap-2 shrink-0 text-right">
                      {call.duration && (
                        <span className="text-[13px] font-mono font-normal text-[#8E8E93]">
                          ({call.duration})
                        </span>
                      )}
                      <span className="text-[14px] font-normal text-[#8E8E93]">
                        {call.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS TAB (Fully integrated into Phone app) */}
        {activeTab === "contacts" && (
          <div className="bg-[#FFFFFF] min-h-full">
            {selectedContact ? (
              /* CONTACT DETAIL VIEW */
              <div className="flex flex-col p-4 space-y-4 animate-in slide-in-from-right-4 duration-150">
                {/* Contact Avatar & Header */}
                <div className="flex flex-col items-center pt-2 pb-2">
                  <div className="size-[72px] rounded-full bg-gradient-to-b from-[#8E8E93] to-[#636366] text-white flex items-center justify-center text-[28px] font-medium shadow-md">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-[22px] font-semibold text-[#1A1B1F] mt-2 text-center">
                    {selectedContact.name}
                  </h2>
                  <span className="text-[13px] text-[#8E8E93] mt-0.5">
                    {selectedContact.category || "Liên hệ cá nhân"}
                  </span>
                </div>

                {/* 4 Quick Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1 pb-2 border-b border-[#E3E2E7]">
                  <button
                    onClick={() => {
                      /* quick message */
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="size-5 text-[#0058BC]" />
                    <span className="text-[11px] text-[#0058BC] font-medium">
                      Nhắn tin
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      /* quick call */
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                  >
                    <PhoneIcon className="size-5 text-[#0058BC]" />
                    <span className="text-[11px] text-[#0058BC] font-medium">
                      Gọi điện
                    </span>
                  </button>
                  <button
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F2F2F7] opacity-60 cursor-not-allowed"
                    title="FaceTime không khả dụng"
                  >
                    <User className="size-5 text-[#8E8E93]" />
                    <span className="text-[11px] text-[#8E8E93] font-medium">
                      FaceTime
                    </span>
                  </button>
                  <button
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F2F2F7] opacity-60 cursor-not-allowed"
                    title="Mail không khả dụng"
                  >
                    <Clock className="size-5 text-[#8E8E93]" />
                    <span className="text-[11px] text-[#8E8E93] font-medium">
                      Gần đây
                    </span>
                  </button>
                </div>

                {/* Details Card */}
                <div className="rounded-xl bg-[#FAF9FE] border border-[#E3E2E7] divide-y divide-[#E3E2E7] overflow-hidden text-sm">
                  {/* Phone number */}
                  <div className="p-3">
                    <div className="text-[11px] font-medium text-[#8E8E93]">
                      Số điện thoại
                    </div>
                    <div className="text-[16px] font-normal text-[#0058BC] mt-0.5">
                      {selectedContact.phone || "Không có số"}
                    </div>
                  </div>

                  {/* Category / Relationship */}
                  <div className="p-3">
                    <div className="text-[11px] font-medium text-[#8E8E93]">
                      Phân loại
                    </div>
                    <div className="text-[14px] text-[#1A1B1F] mt-0.5">
                      {selectedContact.category || "Người quen"}
                    </div>
                  </div>

                  {/* Investigation Note if any */}
                  {selectedContact.note && (
                    <div className="p-3 bg-[#FFFBEA]/60">
                      <div className="text-[11px] font-medium text-[#B45309]">
                        Ghi chú vụ án
                      </div>
                      <div className="text-[13px] text-[#78350F] mt-0.5 whitespace-pre-wrap">
                        {selectedContact.note}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CONTACTS LIST VIEW */
              <div className="flex flex-col">
                {/* Search Bar */}
                <div className="px-3 pt-2 pb-2 bg-[#FAF9FE] border-b border-[#E3E2E7] sticky top-0 z-20">
                  <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-[#E3E2E7]/80 text-[14px] text-[#717786] gap-2">
                    <Search className="size-4 shrink-0" />
                    <input
                      type="text"
                      value={contactsSearch}
                      onChange={(e) => setContactsSearch(e.target.value)}
                      placeholder="Tìm kiếm danh bạ"
                      className="bg-transparent border-none outline-none w-full text-[#1A1B1F] placeholder:text-[#8E8E93] text-[13px]"
                    />
                  </div>
                </div>

                {/* My Card */}
                {!contactsSearch && (
                  <div className="px-4 py-2.5 border-b border-[#E3E2E7] flex items-center gap-3 bg-[#FFFFFF]">
                    <div className="size-9 rounded-full bg-gradient-to-b from-[#8E8E93] to-[#636366] text-white flex items-center justify-center text-sm font-semibold">
                      K
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#1A1B1F]">
                        Nguyễn Văn Khang
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">
                        Thẻ của tôi (Nạn nhân)
                      </span>
                    </div>
                  </div>
                )}

                {/* Contacts Grouped List */}
                {contactsLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-[#717786]">
                    <Loader2 className="size-6 animate-spin mb-2 text-[#0058BC]" />
                    <span className="text-xs">Đang tải danh bạ từ Live CMS...</span>
                  </div>
                ) : Object.keys(groupedContacts).length === 0 ? (
                  <div className="text-center py-12 text-[#717786] text-sm">
                    Không tìm thấy liên hệ phù hợp
                  </div>
                ) : (
                  <div>
                    {Object.entries(groupedContacts).map(([letter, list]) => (
                      <div key={letter}>
                        {/* Section Header */}
                        <div className="bg-[#F2F2F7] px-4 py-0.5 text-[12px] font-semibold text-[#8E8E93] border-b border-[#E3E2E7] sticky top-[49px] z-10">
                          {letter}
                        </div>

                        {/* Contact Rows */}
                        <div className="divide-y divide-[#E3E2E7] bg-[#FFFFFF]">
                          {list.map((c: any) => (
                            <div
                              key={c.id}
                              onClick={() => setSelectedContact(c)}
                              className="h-[44px] px-4 flex items-center justify-between hover:bg-[#FAF9FE] active:bg-[#F2F2F7] cursor-pointer transition-colors"
                            >
                              <span className="text-[16px] font-normal text-[#1A1B1F] truncate pr-2">
                                {c.name}
                              </span>
                              <span className="text-[12px] text-[#8E8E93] shrink-0 font-mono">
                                {c.phone}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Bottom Count */}
                    <div className="text-center py-6 text-[13px] text-[#8E8E93] border-t border-[#E3E2E7] bg-[#FAF9FE]">
                      {filteredContacts.length} liên hệ
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom iOS Phone Tab Bar (3 Tabs: Gần đây, Danh bạ, Bàn phím) */}
      <div className="h-[49px] bg-[#FFFFFF] border-t border-[#E3E2E7] grid grid-cols-3 items-center px-4 shrink-0">
        <button
          onClick={() => setActiveTab("recents")}
          aria-label="Thẻ Gần đây"
          className={cn(
            "flex flex-col items-center justify-center h-full cursor-pointer relative min-h-[44px]",
            activeTab === "recents" ? "text-[#0058BC]" : "text-[#717786]",
          )}
        >
          <Clock className="size-[18px]" />
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
          <User className="size-[19px]" />
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
          <Grid3X3 className="size-[19px]" />
          <span className="text-[10px] font-medium mt-[2px]">Bàn phím</span>
        </button>
      </div>
    </div>
  );
}
