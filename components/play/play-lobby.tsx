"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Crown,
  Info,
  LogOut,
  Minus,
  Play,
  Plus,
  Share2,
  Sparkles,
  UserMinus,
  Users,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { DetectiveAvatar } from "@/components/investigation/detective-avatar";
import { RoomQr } from "@/components/play/room-qr";
import {
  PlayButton,
  PlayCard,
  PlayError,
} from "@/components/play/play-ui";
import { roomInviteUrl } from "@/lib/rooms/client";
import { phaseLabel } from "@/lib/rooms/messages";
import type { PublicParticipant } from "@/lib/types/room";
import { cn } from "@/lib/utils";

/** Nút rời phòng với dialog xác nhận */
function LeaveRoomButton() {
  const { leaveRoom } = useRoomSync();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 font-medium transition cursor-pointer"
      >
        <LogOut className="size-3.5 text-zinc-400" />
        <span>Rời phòng</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
      <span className="text-[11px] text-zinc-400">Rời ngay?</span>
      <button
        type="button"
        onClick={() => leaveRoom()}
        className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800 text-[11px] font-bold text-red-200 hover:bg-red-900 transition cursor-pointer"
      >
        Rời
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 hover:bg-zinc-700 transition cursor-pointer"
      >
        Ở lại
      </button>
    </div>
  );
}

/** Thẻ người chơi dạng danh sách thanh lịch chuẩn Figma */
function MemberListItem({
  participant,
  isHost,
  isMe,
  online,
  onKick,
}: {
  participant: PublicParticipant;
  isHost: boolean;
  isMe: boolean;
  online: boolean;
  onKick?: (sessionId: string) => void;
}) {
  const displayName = participant.nickname.toLowerCase().startsWith("thám tử")
    ? participant.nickname
    : `Thám tử ${participant.nickname}`;

  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all relative overflow-hidden",
        isHost
          ? "border-2 border-amber-400/90 bg-[#242427] shadow-md shadow-amber-500/5 ring-1 ring-amber-400/20"
          : "border border-zinc-800/90 bg-[#1f1f22] hover:border-zinc-700",
      )}
    >
      {/* Cụm Avatar + Tên + Vương miện */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <div
            className={cn(
              "rounded-full p-0.5",
              isHost
                ? "bg-gradient-to-tr from-amber-500 to-amber-300"
                : "bg-zinc-700/60",
            )}
          >
            <DetectiveAvatar
              name={participant.nickname}
              size="md"
              className="size-11 sm:size-12 ring-1 ring-black/40"
              isOnline={online}
            />
          </div>

          {/* Vương miện Host */}
          {isHost && (
            <div
              className="absolute -top-1.5 -left-1.5 size-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 flex items-center justify-center shadow-md ring-1 ring-black/60"
              title="Chủ phòng (Host)"
            >
              <Crown className="size-3 fill-zinc-950" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-bold text-sm sm:text-base truncate",
                isHost ? "text-amber-300" : "text-zinc-100",
              )}
            >
              {displayName}
            </span>
            {isMe && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Bạn
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {online ? "Trực tuyến" : "Mất kết nối"}
          </span>
        </div>
      </div>

      {/* Cụm trạng thái Sẵn sàng / Thao tác Host */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
          <Check className="size-3.5 stroke-[2.5]" />
          <span>Sẵn sàng</span>
        </div>

        {onKick && !isHost && (
          <button
            type="button"
            onClick={() => onKick(participant.id)}
            className="size-8 rounded-full border border-zinc-800 hover:border-red-800 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
            title="Mời ra khỏi phòng"
          >
            <UserMinus className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface PlayLobbyProps {
  caseTitle: string;
  caseSynopsis?: string | null;
  caseId?: string;
}

/**
 * Phòng chờ chuyên án (Waiting Room) thiết kế chuẩn 1:1 theo Figma XPLORE:
 * - Hỗ trợ đầy đủ Responsive Mobile & Desktop (Node Figma 412:710 cho Host & 413:1062 cho Member).
 * - Floating Welcome Pill ở trên cùng.
 * - Danh sách thẻ thành viên thám tử bo tròn sang trọng viền vàng hổ phách.
 * - Khối Thông tin phòng gồm Mã phòng lớn font Mono + QR Code quét nhanh bằng camera điện thoại.
 */
export function PlayLobby({
  caseTitle,
  caseSynopsis,
  caseId = "case_000",
}: PlayLobbyProps) {
  const {
    room,
    me,
    participants,
    onlineIds,
    isHost,
    advancePhase,
    enterRoom,
    hostAction,
  } = useRoomSync();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!room || !me) return null;
  const started = room.phase !== "lobby";
  const shown = started
    ? participants.filter((p) => p.enteredAt)
    : participants;

  const act = async (
    fn: () => Promise<{ success: boolean; error?: string }>,
  ) => {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (!res.success) setError(res.error ?? "Không thực hiện được.");
  };

  const inviteUrl = room.code
    ? roomInviteUrl(room.caseId || caseId, room.code)
    : "";

  const copyCode = async () => {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleKick = (participantId: string) => {
    if (!isHost) return;
    hostAction({ action: "kick", participantId });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. WELCOME BANNER (FLOATING PILL TRÊN CÙNG - Chuẩn Figma) */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#27272a]/95 border border-zinc-700/80 shadow-xl backdrop-blur-md text-xs sm:text-sm text-zinc-200">
          <div className="size-6 sm:size-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <DetectiveAvatar
              name={me.nickname}
              size="xs"
              className="size-5 sm:size-6"
            />
          </div>
          <span>
            Chào mừng thám tử{" "}
            <strong className="text-amber-400 font-bold">{me.nickname}</strong>{" "}
            đến với vụ án{" "}
            <strong className="text-amber-400 font-bold">{caseTitle}</strong>!
          </span>
        </div>
      </div>

      {/* 2. CARD CHÍNH CỦA WAITING ROOM (Node Figma 412:710 / 413:1062) */}
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
        <PlayCard className="p-5 sm:p-7 md:p-8 space-y-6">
          {/* Header danh sách thành viên */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="size-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-wide text-zinc-100">
                Danh sách thành viên
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/80 text-amber-400 font-bold">
                {shown.length} / {room.maxPlayers}
              </span>
            </div>

            <LeaveRoomButton />
          </div>

          {/* Danh sách các thẻ thành viên (Thẻ Host viền vàng nổi bật) */}
          <div className="space-y-3">
            {shown.map((p) => {
              const isParticipantHost = Boolean(p.isHost);
              return (
                <MemberListItem
                  key={p.id}
                  participant={p}
                  isHost={isParticipantHost}
                  isMe={p.id === me.id}
                  online={p.id === me.id || onlineIds.has(p.id)}
                  onKick={isHost && !isParticipantHost ? handleKick : undefined}
                />
              );
            })}
          </div>

          {/* 3. KHỐI THÔNG TIN PHÒNG (DÀNH CHO HOST - Có QR Code và Mã phòng #XXXX) */}
          {isHost && (
            <div className="rounded-2xl border border-zinc-800/90 bg-[#202023]/95 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-200">
                <Info className="size-4 text-amber-400" />
                <span>Thông tin phòng</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                {/* QR Code trực tiếp */}
                <div className="p-2.5 bg-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
                  <RoomQr url={inviteUrl} size={110} />
                </div>

                {/* Mã phòng + Lời hướng dẫn */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 flex-1">
                  <span className="text-xs text-zinc-400 font-medium">Mã phòng</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-wider">
                      #{room.code}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="size-8 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer"
                      title="Sao chép mã phòng"
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    Quét QR bằng điện thoại hoặc sao chép link để mời thành viên vào cùng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lời nhắc nhở dưới khối thông tin */}
          <p className="text-xs text-zinc-400 font-serif italic text-center">
            Hãy đảm bảo tất cả thành viên đều đã sẵn sàng để bắt đầu vụ án!
          </p>

          <PlayError>{error}</PlayError>

          {/* 4. NÚT HÀNH ĐỘNG CHÍNH */}
          <div className="space-y-3 pt-2">
            {!started && isHost && (
              <PlayButton
                disabled={busy}
                className="w-full py-4 text-base tracking-wider uppercase font-bold"
                onClick={() => act(advancePhase)}
              >
                <Play className="size-4 fill-zinc-950" />
                <span>Bắt đầu game</span>
              </PlayButton>
            )}

            {!started && !isHost && (
              <div className="space-y-3">
                <div className="w-full py-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold text-center text-sm flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Đang chờ chủ phòng bắt đầu vụ án...</span>
                </div>
              </div>
            )}

            {started && (
              <PlayButton
                disabled={busy}
                className="w-full py-4 text-base tracking-wider uppercase font-bold"
                onClick={() => act(enterRoom)}
              >
                <Sparkles className="size-4" />
                <span>Vào cuộc điều tra</span>
              </PlayButton>
            )}
          </div>
        </PlayCard>
      </div>
    </div>
  );
}
