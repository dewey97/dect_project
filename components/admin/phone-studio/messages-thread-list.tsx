"use client";

import React from "react";
import {
  Plus,
  Trash2,
  Key,
  ChevronRight,
  User,
  X,
  Phone,
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

export interface MessagesThreadListProps {
  threads: { thread_key: string; thread_name: string; phone_number: string | null; messages: DbPhoneMessage[]; }[];
  setIsCreatingThread: React.Dispatch<React.SetStateAction<boolean>>;
  isCreatingThread: boolean;
  newThreadName: string;
  setNewThreadName: React.Dispatch<React.SetStateAction<string>>;
  newThreadPhone: string;
  setNewThreadPhone: React.Dispatch<React.SetStateAction<string>>;
  handleStartCreateThread: () => void;
  activeThreadKey: string;
  setActiveThreadKey: React.Dispatch<React.SetStateAction<string>>;
  handleDeleteThread: (key: string, name: string) => void;
}

export function MessagesThreadList({
  threads,
  setIsCreatingThread,
  isCreatingThread,
  newThreadName,
  setNewThreadName,
  newThreadPhone,
  setNewThreadPhone,
  handleStartCreateThread,
  activeThreadKey,
  setActiveThreadKey,
  handleDeleteThread,
}: MessagesThreadListProps) {
  return (
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
  );
}
