"use client";

import React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
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
import type { DraftMessageItem } from "./messages-editor";

export interface MessagesThreadPanelProps {
  activeThreadKey: string;
  threadName: string;
  setThreadName: React.Dispatch<React.SetStateAction<string>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  threadPhone: string;
  setThreadPhone: React.Dispatch<React.SetStateAction<string>>;
  setIsPasteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddRow: () => void;
  draftMessages: DraftMessageItem[];
  handleMoveRow: (index: number, direction: "up" | "down") => void;
  handleUpdateRow: (index: number, field: keyof DraftMessageItem, value: unknown) => void;
  handleUploadAttachment: (e: React.ChangeEvent<HTMLInputElement>, index: number) => Promise<void>;
  handleDeleteRow: (index: number) => void;
}

export function MessagesThreadPanel({
  activeThreadKey,
  threadName,
  setThreadName,
  setHasUnsavedChanges,
  threadPhone,
  setThreadPhone,
  setIsPasteModalOpen,
  handleAddRow,
  draftMessages,
  handleMoveRow,
  handleUpdateRow,
  handleUploadAttachment,
  handleDeleteRow,
}: MessagesThreadPanelProps) {
  return (
    <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col space-y-4">
          {!activeThreadKey ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <MessageSquare className="size-8 mb-2 opacity-40 text-zinc-400" />
              <p className="text-sm">
                Chọn một đoạn hội thoại bên trái hoặc tạo mới để bắt đầu biên
                tập hàng loạt.
              </p>
            </div>
          ) : (
            <>
              {/* Thread Info Bar & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  <div className="flex-1 max-w-[220px]">
                    <label className="block text-[10px] font-medium text-zinc-400 mb-0.5">
                      Tên người trò chuyện
                    </label>
                    <input
                      type="text"
                      value={threadName}
                      onChange={(e) => {
                        setThreadName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex-1 max-w-[180px]">
                    <label className="block text-[10px] font-medium text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Phone className="size-2.5" /> Số thuê bao
                    </label>
                    <input
                      type="text"
                      value={threadPhone}
                      onChange={(e) => {
                        setThreadPhone(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="09xx.xxx.xxx"
                      className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono pt-3">
                    Key: {activeThreadKey}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasteModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
                    title="Dán nhanh khối văn bản hội thoại"
                  >
                    <ClipboardPaste className="size-3.5 text-sky-400" />
                    Dán kịch bản
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-700/60 hover:bg-sky-900 text-sky-200 text-xs font-medium cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Thêm dòng
                  </button>
                </div>
              </div>

              {/* Messages Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[520px] rounded-lg border border-zinc-800 bg-zinc-950/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-zinc-800">
                    <tr>
                      <th className="py-2 px-2 w-12 text-center">#</th>
                      <th className="py-2 px-2 w-24">Giờ (Time)</th>
                      <th className="py-2 px-2 w-36">Người gửi / Vai trò</th>
                      <th className="py-2 px-2 min-w-[200px]">
                        Nội dung tin nhắn
                      </th>
                      <th className="py-2 px-2 w-32">Đính kèm</th>
                      <th className="py-2 px-2 w-28 text-center">Manh mối</th>
                      <th className="py-2 px-2 w-16 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {draftMessages.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-zinc-500 text-xs"
                        >
                          Chưa có tin nhắn nào trong hội thoại này. Bấm
                          &quot;Thêm dòng&quot; hoặc &quot;Dán kịch bản&quot; để
                          nạp dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      draftMessages.map((msg, idx) => {
                        const isSent = msg.role === "sent";

                        return (
                          <tr
                            key={msg.clientKey || idx}
                            className={`group hover:bg-zinc-900/40 transition-colors ${
                              msg.is_clue ? "bg-amber-950/20" : ""
                            }`}
                          >
                            {/* STT & Di chuyển */}
                            <td className="py-2 px-1 text-center font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-0.5">
                                <span>{idx + 1}</span>
                                <div className="flex flex-col ml-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-0.5 hover:text-sky-400 disabled:opacity-20 cursor-pointer"
                                    title="Di chuyển lên"
                                  >
                                    <ArrowUp className="size-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(idx, "down")}
                                    disabled={idx === draftMessages.length - 1}
                                    className="p-0.5 hover:text-sky-400 disabled:opacity-20 cursor-pointer"
                                    title="Di chuyển xuống"
                                  >
                                    <ArrowDown className="size-2.5" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Giờ (Time) */}
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={msg.timestamp || ""}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    idx,
                                    "timestamp",
                                    e.target.value,
                                  )
                                }
                                placeholder="20:15"
                                className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                              />
                            </td>

                            {/* Người gửi / Vai trò */}
                            <td className="py-2 px-2 space-y-1">
                              <input
                                type="text"
                                value={msg.sender || ""}
                                onChange={(e) =>
                                  handleUpdateRow(idx, "sender", e.target.value)
                                }
                                placeholder={isSent ? "Nạn nhân" : threadName}
                                className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateRow(idx, "role", "sent");
                                    if (
                                      !msg.sender ||
                                      msg.sender === threadName
                                    ) {
                                      handleUpdateRow(
                                        idx,
                                        "sender",
                                        "Nạn nhân",
                                      );
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                    isSent
                                      ? "bg-blue-600 text-white"
                                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  Gửi đi (me)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateRow(idx, "role", "received");
                                    if (msg.sender === "Nạn nhân") {
                                      handleUpdateRow(
                                        idx,
                                        "sender",
                                        threadName,
                                      );
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                                    !isSent
                                      ? "bg-emerald-600 text-white"
                                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  Nhận (them)
                                </button>
                              </div>
                            </td>

                            {/* Nội dung */}
                            <td className="py-2 px-2">
                              <textarea
                                rows={2}
                                value={msg.body || ""}
                                onChange={(e) =>
                                  handleUpdateRow(idx, "body", e.target.value)
                                }
                                placeholder="Nhập nội dung tin nhắn..."
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-xs text-zinc-100 focus:outline-none focus:border-sky-500 resize-y min-h-[38px]"
                              />
                            </td>

                            {/* Đính kèm */}
                            <td className="py-2 px-2 space-y-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={msg.attachment_url || ""}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      idx,
                                      "attachment_url",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="URL ảnh / audio..."
                                  className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded text-[10px] text-zinc-300 focus:outline-none focus:border-sky-500 font-mono truncate"
                                />
                                <label className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer shrink-0">
                                  <Paperclip className="size-3" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,audio/*"
                                    onChange={(e) =>
                                      handleUploadAttachment(e, idx)
                                    }
                                  />
                                </label>
                              </div>
                              {msg.attachment_url && (
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                  <select
                                    value={msg.attachment_type || "image"}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "attachment_type",
                                        e.target.value,
                                      )
                                    }
                                    className="bg-zinc-900 border border-zinc-700 rounded px-1 py-0.5 text-[10px] text-zinc-200"
                                  >
                                    <option value="image">Ảnh</option>
                                    <option value="audio">Âm thanh</option>
                                    <option value="video">Video</option>
                                  </select>
                                  {msg.attachment_type === "audio" && (
                                    <input
                                      type="text"
                                      value={msg.attachment_duration || "0:08"}
                                      onChange={(e) =>
                                        handleUpdateRow(
                                          idx,
                                          "attachment_duration",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="0:08"
                                      className="w-12 px-1 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono"
                                    />
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Manh mối phá án */}
                            <td className="py-2 px-2 text-center">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(msg.is_clue)}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      idx,
                                      "is_clue",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                                />
                                <span className="text-[11px] text-zinc-400">
                                  Clue
                                </span>
                              </label>
                              {msg.is_clue && (
                                <div className="mt-1 space-y-1 text-left">
                                  <input
                                    type="text"
                                    value={msg.code || ""}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "code",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Mã (MSG-01)"
                                    className="w-full px-1 py-0.5 bg-zinc-900 border border-amber-800/80 rounded text-[10px] text-amber-300 font-mono"
                                  />
                                  <input
                                    type="text"
                                    value={msg.clue_title || ""}
                                    onChange={(e) =>
                                      handleUpdateRow(
                                        idx,
                                        "clue_title",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tiêu đề..."
                                    className="w-full px-1 py-0.5 bg-zinc-900 border border-amber-800/80 rounded text-[10px] text-zinc-200"
                                  />
                                </div>
                              )}
                            </td>

                            {/* Xóa dòng */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                                title="Xóa dòng tin nhắn này"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
  );
}
