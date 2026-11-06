"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  FileText,
  LogOut,
  Minus,
  Plus,
  Share2,
  Sparkles,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { DetectiveAvatar } from "@/components/investigation/detective-avatar";
import { RoomQr } from "@/components/play/room-qr";
import {
  PlayButton,
  PlayError,
} from "@/components/play/play-ui";
import { roomInviteUrl } from "@/lib/rooms/client";
import { phaseLabel } from "@/lib/rooms/messages";
import { UNRANKED_GAP_MS } from "@/lib/rooms/ranking";
import type { PublicParticipant } from "@/lib/types/room";
import { cn } from "@/lib/utils";

const UNRANKED_GAP_MINUTES = UNRANKED_GAP_MS / 60_000;

/** Phút đã trôi từ một mốc ISO, cập nhật mỗi 30 giây. Chỉ tính sau khi mount. */
function useElapsedMinutes(since: string | null): number | null {
  const [minutes, setMinutes] = useState<number | null>(null);
  useEffect(() => {
    if (!since) return setMinutes(null);
    const update = () =>
      setMinutes(
        Math.max(0, Math.floor((Date.now() - Date.parse(since)) / 60_000)),
      );
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [since]);
  return minutes;
}

/** Thẻ mã phòng và chia sẻ link mời nhanh có QR Code trực tiếp */
function InviteCard() {
  const { room } = useRoomSync();
  const [copied, setCopied] = useState(false);
  if (!room?.code) return null;
  const url = roomInviteUrl(room.caseId, room.code);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vào phòng điều tra",
          text: `Mã phòng ${room.code}`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Người chơi hủy chia sẻ, hoặc clipboard bị chặn: mã vẫn hiện trên màn hình.
    }
  };

  return (
    <div className="rounded-xl border border-amber-900/40 bg-[#140e0a]/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
        <div className="p-2 rounded-xl bg-[#f4efe6] shadow-md shrink-0 flex items-center justify-center">
          <RoomQr url={url} size={110} />
        </div>
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9a066]">
            Mã Phòng Chuyên Án
          </span>
          <div
            className="select-all font-mono text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-amber-400"
            aria-label={`Mã phòng ${room.code.split("").join(" ")}`}
          >
            {room.code}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            Quét mã QR trực tiếp hoặc sao chép link để đồng đội cùng tham gia.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <button
          type="button"
          onClick={share}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/50 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" aria-hidden />
          ) : (
            <Share2 className="size-4 text-amber-400" aria-hidden />
          )}
          <span>{copied ? "Đã chép link!" : "Sao chép link mời"}</span>
        </button>
      </div>
    </div>
  );
}

/** Ô hiển thị một điều tra viên (Player Slot) */
function PlayerSlotCard({
  p,
  isMe,
  online,
  hostControls,
}: {
  p: PublicParticipant;
  isMe: boolean;
  online: boolean;
  hostControls: boolean;
}) {
  const { hostAction } = useRoomSync();
  const [confirm, setConfirm] = useState<"kick" | "host" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: "kick" | "transfer") => {
    setError(null);
    const res = await hostAction({ action, participantId: p.id });
    if (!res.success) setError(res.error ?? "Không thực hiện được.");
    setConfirm(null);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border p-3.5 sm:p-4 flex flex-col items-center text-center transition-all duration-200 group",
        isMe
          ? "border-amber-600/70 bg-[#18110b]/95 shadow-[0_0_20px_rgba(217,160,102,0.12)]"
          : "border-zinc-800 bg-[#120e0a]/80 hover:border-zinc-700",
      )}
    >
      {/* Vòng Avatar */}
      <div className="relative mb-2.5">
        <DetectiveAvatar
          name={p.nickname}
          size="lg"
          showOnlineDot
          isOnline={online}
          className="size-13 sm:size-15"
        />
        {p.isHost && (
          <div
            title="Trưởng ban điều tra (Host)"
            className="absolute -top-1.5 -right-1.5 bg-amber-500 text-zinc-950 p-1 rounded-full shadow-md"
          >
            <Crown className="size-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Thông tin tên & Tag */}
      <div className="w-full">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-semibold text-zinc-100 text-xs sm:text-sm truncate max-w-[120px]">
            {p.nickname}
          </span>
          {isMe && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-300">
              Bạn
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] sm:text-[11px] font-mono">
          <span
            className={cn(
              "size-1.5 rounded-full inline-block",
              online ? "bg-emerald-500 animate-pulse" : "bg-zinc-600",
            )}
          />
          <span className={online ? "text-emerald-400" : "text-zinc-500"}>
            {online ? "Đang online" : "Mất kết nối"}
          </span>
        </div>
      </div>

      {/* Nút hành động của Host */}
      {hostControls && !isMe && !confirm && (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 w-full flex items-center justify-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-amber-300 hover:bg-amber-950/40 rounded flex items-center gap-1 transition-colors"
            title="Chuyển quyền Host"
            onClick={() => setConfirm("host")}
          >
            <Crown className="size-3" />
            <span>Host</span>
          </button>
          <button
            type="button"
            className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-red-400 hover:bg-red-950/40 rounded flex items-center gap-1 transition-colors"
            title="Mời ra khỏi phòng"
            onClick={() => setConfirm("kick")}
          >
            <UserMinus className="size-3" />
            <span>Kích</span>
          </button>
        </div>
      )}

      {/* Xác nhận thao tác */}
      {confirm && (
        <div className="mt-2 p-1.5 rounded bg-zinc-950 border border-zinc-700/80 w-full text-xs space-y-1 animate-in fade-in">
          <p className="text-zinc-300 text-[10px]">
            {confirm === "kick" ? "Mời ra?" : "Chuyển Host?"}
          </p>
          <div className="flex gap-1 justify-center">
            <button
              type="button"
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold text-white",
                confirm === "kick" ? "bg-red-600" : "bg-amber-600",
              )}
              onClick={() => run(confirm === "kick" ? "kick" : "transfer")}
            >
              OK
            </button>
            <button
              type="button"
              className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300"
              onClick={() => setConfirm(null)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/** Ô trống chờ người chơi gia nhập */
function EmptySlotCard({ onInvite }: { onInvite?: () => void }) {
  return (
    <div
      onClick={onInvite}
      role="button"
      tabIndex={0}
      title="Bấm để sao chép link mời bạn bè gia nhập"
      className="relative rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/20 hover:border-amber-700/50 hover:bg-amber-950/10 p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer min-h-[130px] group"
    >
      <div className="size-12 sm:size-14 rounded-full border border-dashed border-zinc-700/70 flex items-center justify-center mb-2.5 text-zinc-600 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors">
        <UserPlus className="size-5 sm:size-6" />
      </div>
      <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
        Chờ thám tử...
      </span>
      <span className="text-[10px] font-mono text-amber-500/70 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Share2 className="size-2.5" /> Mời thêm bạn
      </span>
    </div>
  );
}

/** Bộ điều chỉnh số người tối đa */
function MaxPlayersControl() {
  const { room, participants, hostAction } = useRoomSync();
  const [error, setError] = useState<string | null>(null);
  if (!room) return null;
  const set = async (n: number) => {
    setError(null);
    const res = await hostAction({ action: "max_players", maxPlayers: n });
    if (!res.success) setError(res.error ?? "Không sửa được.");
  };
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1">
      <span id="lobby-max" className="text-xs font-mono text-zinc-400 uppercase">
        Giới hạn số người
      </span>
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-labelledby="lobby-max"
      >
        <button
          type="button"
          className="size-7 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
          aria-label="Giảm số người tối đa"
          disabled={room.maxPlayers <= Math.max(1, participants.length)}
          onClick={() => set(room.maxPlayers - 1)}
        >
          <Minus className="size-3.5" />
        </button>
        <output className="min-w-6 text-center font-mono text-sm font-bold text-amber-400">
          {room.maxPlayers}
        </output>
        <button
          type="button"
          className="size-7 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
          aria-label="Tăng số người tối đa"
          disabled={room.maxPlayers >= 99}
          onClick={() => set(room.maxPlayers + 1)}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <PlayError>{error}</PlayError>
    </div>
  );
}

/** Nút rời phòng */
function LeaveButton() {
  const { leaveRoom, room, participants, onlineIds, me } = useRoomSync();
  const [confirm, setConfirm] = useState(false);
  const lastOnline =
    !!room?.startedAt &&
    !room.endedAt &&
    !room.unrankedAt &&
    participants.every((p) => p.id === me?.id || !onlineIds.has(p.id));

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors py-1"
      >
        <LogOut className="size-3.5" aria-hidden />
        <span>Rời phòng điều tra</span>
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 space-y-2.5">
      <p className="text-xs text-zinc-300">
        Rời phòng sẽ giải phóng vị trí của bạn. Bạn có chắc muốn rời đi?
      </p>
      {lastOnline && (
        <p className="text-xs text-amber-300">
          Bạn là người cuối cùng đang online. Nếu cả phòng vắng quá {UNRANKED_GAP_MINUTES} phút,
          phòng vẫn tiếp tục nhưng không xếp hạng.
        </p>
      )}
      <div className="flex gap-2">
        <PlayButton
          variant="danger"
          className="flex-1 py-1.5 text-xs min-h-9"
          onClick={() => leaveRoom()}
        >
          Xác nhận rời
        </PlayButton>
        <PlayButton
          variant="secondary"
          className="flex-1 py-1.5 text-xs min-h-9"
          onClick={() => setConfirm(false)}
        >
          Ở lại
        </PlayButton>
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
 * Phòng chờ chuyên án (Lobby & Briefing Room).
 * Responsive hoàn chỉnh cho Mobile & Desktop:
 * - Desktop: Bento 2 cột (Cột trái: Các ô điều tra viên + Thanh loading; Cột phải: Dẫn truyện vụ án + Mẹo nghiệp vụ).
 * - Mobile: Dạng thẻ xếp chồng tối ưu cho màn hình dọc, thao tác 1 chạm.
 */
export function PlayLobby({
  caseTitle,
  caseSynopsis,
  caseId = "case_000",
}: PlayLobbyProps) {
  const { room, me, participants, onlineIds, isHost, advancePhase, enterRoom } =
    useRoomSync();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elapsed = useElapsedMinutes(room?.startedAt ?? null);

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
  const copyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
    }
  };

  // Tính số lượng ô trống cần hiển thị (tối thiểu 4 ô hoặc room.maxPlayers)
  const maxSlots = Math.max(room.maxPlayers, 4);
  const emptySlotsCount = Math.max(0, maxSlots - shown.length);

  // Tiến trình sẵn sàng phòng chơi
  const readinessPercent = Math.min(
    100,
    Math.round((shown.length / Math.max(1, room.maxPlayers)) * 100),
  );

  return (
    <div className="w-full space-y-6">
      {/* 1. HEADER CHUNG CỦA PHÒNG CHỜ */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-zinc-50">
            {caseTitle}
          </h1>
          {started && (
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {phaseLabel(room.phase)}
              {room.startedAt &&
                !room.unrankedAt &&
                elapsed !== null &&
                ` — Đã trôi qua ${elapsed} phút`}
            </p>
          )}
          {room.unrankedAt && (
            <p className="text-xs text-amber-300 font-mono mt-0.5">
              Phòng này không còn tính xếp hạng.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LeaveButton />
        </div>
      </header>

      {/* 2. KHU VỰC NỘI DUNG: BỐ CỤC 2 CỘT TRÊN DESKTOP, CUỘN DỌC TRÊN MOBILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (COL 1-7): CÁC Ô NGƯỜI CHƠI & THANH TIẾN TRÌNH */}
        <div className="lg:col-span-7 space-y-5">
          {/* THẺ MÃ PHÒNG VÀ NÚT CHIA SẺ */}
          <InviteCard />

          {/* LƯỚI CÁC Ô NGƯỜI CHƠI (PLAYER ROSTER) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">
                  {started ? "Lực Lượng Đang Phá Án" : "Đội Ngũ Điều Tra Viên"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">
                  {shown.length} / {room.maxPlayers}
                </span>
              </div>
              {isHost && !started && <MaxPlayersControl />}
            </div>

            {/* Grid các ô thám tử */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shown.map((p) => (
                <PlayerSlotCard
                  key={p.id}
                  p={p}
                  isMe={p.id === me.id}
                  online={p.id === me.id || onlineIds.has(p.id)}
                  hostControls={isHost}
                />
              ))}

              {/* Các ô trống */}
              {!started &&
                Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <EmptySlotCard key={`empty-slot-${i}`} onInvite={copyInvite} />
                ))}
            </div>
          </div>

          {/* THANH TIẾN TRÌNH / LOADING SẴN SÀNG */}
          <div className="rounded-xl border border-[#d9a066]/30 bg-[#120e0a]/90 p-4 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-semibold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                Tiến Trình Chuẩn Bị Bàn Điều Tra
              </span>
              <span className="text-amber-400 font-bold">
                {readinessPercent}% Sẵn Sàng
              </span>
            </div>

            <div className="w-full h-2 bg-[#1c1510] rounded-full overflow-hidden border border-white/5 relative">
              <div
                className="h-full bg-gradient-to-r from-amber-700 via-[#d9a066] to-amber-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(217,160,102,0.5)]"
                style={{ width: `${Math.max(12, readinessPercent)}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-zinc-400 text-center">
              {shown.length >= 2
                ? "Lực lượng ban chuyên án đã sẵn sàng mở bàn điều tra."
                : "Đang chờ thêm điều tra viên tham gia để bắt đầu phá án."}
            </p>
          </div>

          <PlayError>{error}</PlayError>

          {/* NÚT HÀNH ĐỘNG CHÍNH */}
          {!started && isHost && (
            <PlayButton
              disabled={busy}
              className="w-full py-3.5 text-base shadow-[0_0_25px_rgba(245,158,11,0.2)] font-bold tracking-wide"
              onClick={() => act(advancePhase)}
            >
              <Sparkles className="size-5" />
              <span>BẮT ĐẦU ĐIỀU TRA</span>
            </PlayButton>
          )}

          {!started && !isHost && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 py-3.5 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-amber-400 animate-ping" />
              <span>Đang chờ Trưởng ban điều tra (Host) phát lệnh bắt đầu...</span>
            </div>
          )}

          {started && (
            <PlayButton
              disabled={busy}
              className="w-full py-3.5 text-base shadow-[0_0_25px_rgba(245,158,11,0.2)] font-bold tracking-wide"
              onClick={() => act(enterRoom)}
            >
              <Sparkles className="size-5" />
              <span>VÀO CUỘC NGAY</span>
            </PlayButton>
          )}
        </div>

        {/* CỘT PHẢI (COL 8-12): DẪN TRUYỆN VỤ ÁN */}
        <div className="lg:col-span-5">
          {/* THẺ DẪN TRUYỆN VỤ ÁN */}
          <div className="rounded-xl border border-[#d9a066]/30 bg-[#120e0a]/90 p-5 sm:p-6 relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="size-4 text-[#d9a066]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d9a066] font-bold">
                Dẫn Truyện Vụ Án
              </span>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed italic border-l-2 border-amber-600/50 pl-3 py-1">
              {caseSynopsis ||
                "Nạn nhân được phát hiện tử vong tại hiện trường với nhiều dấu hiệu đáng ngờ. Toàn bộ các đối tượng tình nghi đều có mặt trong khoảng thời gian xảy ra án mạng với những mâu thuẫn phức tạp về quyền lợi và tiền bạc. Ban chuyên án cần khẩn trương thu thập chứng cứ, đối chiếu lời khai và lật mở động cơ gây án."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
