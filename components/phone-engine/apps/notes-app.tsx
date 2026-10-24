"use client";

import { useState } from "react";
import {
  FileText,
  ArrowLeft,
  ChevronLeft,
  Search,
  Lock,
  Unlock,
  Folder,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Document } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import { EvidenceAnchorItem } from "../core/evidence-anchor-item";

interface NotesAppProps {
  notes?: Document[];
  onBackToHome?: () => void;
}

interface RichNote extends Document {
  isLocked?: boolean;
  pinCode?: string;
  hint?: string;
  folder?: string;
  code?: string;
}

export function NotesApp({ notes, onBackToHome }: NotesAppProps) {
  const [selectedNote, setSelectedNote] = useState<RichNote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<string[]>([]);

  // Fetch notes from Supabase phone_notes (tab: notes)
  const { data: rawData, loading, error, refetch } = usePhoneData("notes");

  const allNotes: RichNote[] = rawData.map(
    (item: Record<string, unknown>, idx: number) => ({
      id: String(item.id || `note-${idx}`),
      title: String(item.title || item.title_or_domain || "Ghi chú không tên"),
      content: String(item.body || item.content_or_url || item.content || ""),
      timestamp: String(item.timestamp || item.created_at || ""),
      meta: String(item.timestamp || item.created_at || ""),
      isLocked: Boolean(item.isLocked),
      isPinned: Boolean(item.is_pinned),
      code: item.code ? String(item.code) : undefined,
    }),
  );

  const filteredNotes = allNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNote && pinInput === selectedNote.pinCode) {
      setUnlockedNoteIds((prev) => [...prev, selectedNote.id]);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedNote ? (
        /* NOTE DETAIL VIEW */
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => {
                setSelectedNote(null);
                setPinError(false);
                setPinInput("");
              }}
              className="flex items-center gap-0.5 text-[#FFD60A] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Ghi chú</span>
            </button>
            <span className="text-[11px] text-[#8E8E93] font-sans">
              {selectedNote.timestamp || selectedNote.meta}
            </span>
          </div>

          {selectedNote.isLocked &&
          !unlockedNoteIds.includes(selectedNote.id) ? (
            /* PIN UNLOCK CHALLENGE VIEW */
            <div className="flex-1 p-5 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="size-14 rounded-full bg-[#FFD60A]/20 text-[#FFD60A] flex items-center justify-center border border-[#FFD60A]/40 shadow-lg">
                <Lock className="size-7" />
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-white">
                  Ghi chú bị khóa
                </h3>
                <p className="text-[11px] text-[#8E8E93] mt-1 max-w-[220px]">
                  {selectedNote.hint ||
                    "Nhập mã PIN 4 chữ số để xem nội dung mật này."}
                </p>
              </div>

              <form
                onSubmit={handleUnlock}
                className="space-y-3 w-full max-w-[200px]"
              >
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-[22px] tracking-[0.5em] font-mono h-11 rounded-xl bg-[#1C1C1E] border border-[#3A3A3C] text-[#FFD60A] focus:outline-none focus:border-[#FFD60A]"
                />
                {pinError && (
                  <div className="text-[10.5px] text-[#FF453A] font-medium">
                    Mật khẩu sai! Hãy kiểm tra gợi ý.
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full h-9 rounded-xl bg-[#FFD60A] text-black font-bold text-[12px] active:scale-95 transition-transform cursor-pointer"
                >
                  Mở khóa
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED / PUBLIC NOTE CONTENT */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[#FFD60A]">
                {selectedNote.isLocked && (
                  <Unlock className="size-4 shrink-0 text-[#30D158]" />
                )}
                <h1 className="text-[18px] font-bold leading-snug">
                  {selectedNote.title}
                </h1>
              </div>
              <div className="text-[13.5px] leading-relaxed text-[#E5E5EA] whitespace-pre-line font-sans p-3.5 rounded-xl bg-[#1C1C1E]/60 border border-white/5">
                {selectedNote.content}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NOTE LIST VIEW */
        <div className="flex flex-col h-full">
          <div className="px-3 pt-2.5 pb-2 bg-[#000000] shrink-0 border-b border-[#1C1C1E]">
            <div className="flex items-center justify-center mb-2">
              <span className="text-[17px] font-semibold tracking-tight text-white">
                Ghi chú
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded-lg bg-[#1C1C1E] pl-8 pr-3 text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#FFD60A]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-10 space-y-3 pt-2">
            <div className="text-[11px] font-semibold text-[#8E8E93] px-2 uppercase tracking-wider flex items-center gap-1">
              <Folder className="size-3 text-[#FFD60A]" /> iCloud • Thư mục Ghi
              chú
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#8E8E93] space-y-2">
                <Loader2 className="size-6 animate-spin text-[#FFD60A]" />
                <span className="text-[12px]">Đang tải ghi chú...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 px-4">
                <FileText className="size-10 text-red-400/60" />
                <div className="text-[13px] text-red-300 font-medium">
                  {error}
                </div>
                <button
                  onClick={refetch}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3.5" /> Thử lại
                </button>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                <FileText className="size-10 text-[#8E8E93]/40" />
                <span className="text-[14px] text-[#8E8E93] font-medium">
                  Không có ghi chú nào
                </span>
                <span className="text-[11px] text-[#8E8E93]/60">0 Ghi chú</span>
                <button
                  onClick={refetch}
                  className="mt-2 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[#8E8E93] hover:text-white text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3" /> Làm mới
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#2C2C2E] rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden">
                {filteredNotes.map((note, idx) => {
                  const isLocked =
                    note.isLocked && !unlockedNoteIds.includes(note.id);
                  const noteCode =
                    note.code ||
                    note.id ||
                    `NOTE-${String(idx + 1).padStart(2, "0")}`;
                  const displayCode =
                    noteCode.startsWith("NOTE-") || noteCode.startsWith("CLUE-")
                      ? noteCode
                      : `NOTE-${String(idx + 1).padStart(2, "0")}`;
                  return (
                    <EvidenceAnchorItem key={note.id} code={displayCode}>
                      <div
                        onClick={() => setSelectedNote(note)}
                        className="p-3 hover:bg-[#2C2C2E]/60 active:bg-[#3A3A3C] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[14px] font-semibold text-white truncate flex items-center gap-1.5">
                            {note.isLocked && (
                              <Lock
                                className={cn(
                                  "size-3.5 shrink-0",
                                  isLocked
                                    ? "text-[#FFD60A]"
                                    : "text-[#30D158]",
                                )}
                              />
                            )}
                            <span className="truncate">{note.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#8E8E93] font-sans shrink-0">
                            {note.timestamp || note.meta}
                          </span>
                          <span className="text-[12px] text-[#A1A1A6] truncate">
                            {isLocked
                              ? "•••••••• (Ghi chú bị khóa bằng mật khẩu)"
                              : note.content.replace(/\n/g, " ")}
                          </span>
                        </div>
                      </div>
                    </EvidenceAnchorItem>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
