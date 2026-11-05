"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Copy, Check, LogOut, ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { DetectiveAvatar } from "@/components/investigation/detective-avatar";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { roomInviteUrl } from "@/lib/rooms/client";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Vụ án đang mở, đọc từ URL (`?case_id=`), để dẫn tới màn vào game của đúng vụ. */
function currentCaseId(): string {
  if (typeof window === "undefined") return normalizeCaseId(null);
  const params = new URLSearchParams(window.location.search);
  return normalizeCaseId(params.get("case_id") || params.get("caseId"));
}

/**
 * Modal phòng trong màn điều tra (plan D5).
 * Chưa ở phòng: dẫn tới màn vào game `/play/<case_id>` (tạo/vào phòng ở đó).
 * Đang ở phòng: mã phòng, link mời, thành viên, Rời phòng.
 */
export function RoomModal({ isOpen, onClose }: RoomModalProps) {
  const { room, roomCode, me, participants, onlineIds, leaveRoom } =
    useRoomSync();

  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) setConfirmLeave(false);
  }, [isOpen]);

  const handleCopyLink = async () => {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(
        roomInviteUrl(room.caseId, room.code),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bị chặn: người chơi vẫn đọc mã phòng trên màn hình.
    }
  };

  if (!isMounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-zinc-400" />
                <h3
                  id="room-modal-title"
                  className="font-semibold text-sm tracking-wide text-zinc-100 uppercase font-mono"
                >
                  Chơi nhóm
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2.5 -m-1.5 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {room && roomCode ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col items-center text-center space-y-2">
                    <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      {room.code ? "Mã phòng" : "Phòng đã kết thúc"}
                    </div>
                    {room.code && (
                      <div className="text-3xl font-extrabold text-white tracking-widest font-mono select-all">
                        {room.code}
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                      Tiến trình điều tra, manh mối và kết luận đồng bộ cho cả
                      phòng.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-0.5">
                      <Users className="size-3.5" />
                      <span>
                        Thành viên ({participants.length}/{room.maxPlayers})
                      </span>
                    </div>

                    <ul className="space-y-2 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                      {participants.map((p) => {
                        const isMe = p.id === me?.id;
                        const online = isMe || onlineIds.has(p.id);
                        return (
                          <li
                            key={p.id}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-xl border",
                              isMe
                                ? "bg-zinc-900 border-zinc-700/80"
                                : "bg-zinc-900/40 border-zinc-800/80",
                            )}
                          >
                            <DetectiveAvatar
                              name={p.nickname}
                              size="md"
                              showOnlineDot
                              isOnline={online}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm text-zinc-100 truncate">
                                  {p.nickname}
                                </span>
                                {isMe && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                                    Bạn
                                  </span>
                                )}
                                {p.isHost && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/40 border border-amber-800/50 text-amber-300">
                                    <Crown className="size-3" aria-hidden />
                                    Host
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {online ? "Đang trực tuyến" : "Mất kết nối"}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {confirmLeave ? (
                    <div className="p-3 rounded-xl border border-red-900/50 bg-red-950/20 space-y-2">
                      <p className="text-xs text-zinc-200">
                        Rời phòng sẽ giải phóng chỗ của bạn. Quay lại thì vào
                        như người mới nếu phòng còn chỗ.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await leaveRoom();
                            onClose();
                          }}
                          className="flex-1 min-h-11 px-3 bg-red-900/60 hover:bg-red-800/70 rounded-lg text-xs font-semibold text-red-100 cursor-pointer"
                        >
                          Rời phòng
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmLeave(false)}
                          className="flex-1 min-h-11 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Ở lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      {room.code && (
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="flex-1 min-h-11 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-100 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="size-4 text-emerald-400" />
                              <span>Đã sao chép link mời</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-4 text-zinc-300" />
                              <span>Sao chép link mời</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmLeave(true)}
                        className="min-h-11 px-3 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 rounded-xl text-zinc-300 hover:text-red-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        <span>Rời phòng</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Một người trong nhóm tạo phòng, những người khác vào bằng mã
                    4 ký tự hoặc quét QR của phòng. Phòng mới bắt đầu từ 0%,
                    không dùng tiến trình chơi Solo.
                  </p>
                  <Link
                    href={`/play/${currentCaseId()}`}
                    onClick={onClose}
                    className="w-full min-h-11 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>Tạo hoặc vào phòng</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
