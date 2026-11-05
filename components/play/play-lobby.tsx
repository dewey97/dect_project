"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  LogOut,
  Minus,
  Plus,
  Share2,
  UserMinus,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { DetectiveAvatar } from "@/components/investigation/detective-avatar";
import { RoomQr } from "@/components/play/room-qr";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
} from "@/components/play/play-ui";
import { roomInviteUrl } from "@/lib/rooms/client";
import { phaseLabel } from "@/lib/rooms/messages";
import { UNRANKED_GAP_MS } from "@/lib/rooms/ranking";
import type { PublicParticipant } from "@/lib/types/room";

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
    <PlayCard className="flex flex-col items-center gap-3 text-center">
      <PlayLabel>Mã phòng</PlayLabel>
      <div
        className="select-all font-mono text-5xl font-extrabold tracking-[0.25em] text-zinc-50"
        aria-label={`Mã phòng ${room.code.split("").join(" ")}`}
      >
        {room.code}
      </div>
      <RoomQr url={url} />
      <p className="text-xs text-zinc-400">
        Quét QR hoặc nhập mã để vào cùng phòng.
      </p>
      <PlayButton variant="secondary" onClick={share} className="w-full">
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Share2 className="size-4" aria-hidden />
        )}
        {copied ? "Đã sao chép link" : "Chia sẻ link mời"}
      </PlayButton>
    </PlayCard>
  );
}

function MemberRow({
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
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2.5">
      <div className="flex items-center gap-3">
        <DetectiveAvatar
          name={p.nickname}
          size="md"
          showOnlineDot
          isOnline={online}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-semibold">{p.nickname}</span>
            {isMe && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                Bạn
              </span>
            )}
            {p.isHost && (
              <span className="inline-flex items-center gap-1 rounded border border-amber-800/50 bg-amber-950/40 px-1.5 py-0.5 text-[10px] text-amber-300">
                <Crown className="size-3" aria-hidden />
                Host
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500">
            {online ? "Đang online" : "Mất kết nối"}
          </div>
        </div>
        {hostControls && !isMe && !confirm && (
          <div className="flex gap-1">
            <PlayButton
              variant="ghost"
              className="w-11 px-0"
              aria-label={`Chuyển quyền Host cho ${p.nickname}`}
              title="Chuyển quyền Host"
              onClick={() => setConfirm("host")}
            >
              <Crown className="size-4" />
            </PlayButton>
            <PlayButton
              variant="ghost"
              className="w-11 px-0"
              aria-label={`Mời ${p.nickname} ra khỏi phòng`}
              title="Mời ra khỏi phòng"
              onClick={() => setConfirm("kick")}
            >
              <UserMinus className="size-4" />
            </PlayButton>
          </div>
        )}
      </div>
      {confirm && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="flex-1 text-zinc-300">
            {confirm === "kick"
              ? `Mời ${p.nickname} ra khỏi phòng?`
              : `Chuyển quyền Host cho ${p.nickname}?`}
          </span>
          <PlayButton
            variant={confirm === "kick" ? "danger" : "primary"}
            onClick={() => run(confirm === "kick" ? "kick" : "transfer")}
          >
            Đồng ý
          </PlayButton>
          <PlayButton variant="secondary" onClick={() => setConfirm(null)}>
            Hủy
          </PlayButton>
        </div>
      )}
      <PlayError>{error}</PlayError>
    </li>
  );
}

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
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span id="lobby-max" className="text-sm text-zinc-300">
          Số người tối đa
        </span>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-labelledby="lobby-max"
        >
          <PlayButton
            variant="secondary"
            className="w-11 px-0"
            aria-label="Giảm số người tối đa"
            disabled={room.maxPlayers <= Math.max(1, participants.length)}
            onClick={() => set(room.maxPlayers - 1)}
          >
            <Minus className="size-4" />
          </PlayButton>
          <output className="min-w-8 text-center font-mono text-lg font-bold">
            {room.maxPlayers}
          </output>
          <PlayButton
            variant="secondary"
            className="w-11 px-0"
            aria-label="Tăng số người tối đa"
            disabled={room.maxPlayers >= 99}
            onClick={() => set(room.maxPlayers + 1)}
          >
            <Plus className="size-4" />
          </PlayButton>
        </div>
      </div>
      <PlayError>{error}</PlayError>
    </div>
  );
}

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
      <PlayButton variant="ghost" onClick={() => setConfirm(true)}>
        <LogOut className="size-4" aria-hidden />
        Rời phòng
      </PlayButton>
    );
  }
  return (
    <PlayCard className="space-y-3 border-red-900/50">
      <p className="text-sm text-zinc-200">
        Rời phòng sẽ giải phóng chỗ của bạn. Quay lại thì vào như người mới nếu
        phòng còn chỗ.
      </p>
      {lastOnline && (
        <p className="text-sm text-amber-300">
          Bạn là người cuối cùng đang online. Nếu cả phòng vắng quá{" "}
          {UNRANKED_GAP_MINUTES} phút, phòng vẫn chơi tiếp nhưng không còn tính
          xếp hạng.
        </p>
      )}
      <div className="flex gap-2">
        <PlayButton
          variant="danger"
          className="flex-1"
          onClick={() => leaveRoom()}
        >
          Rời phòng
        </PlayButton>
        <PlayButton
          variant="secondary"
          className="flex-1"
          onClick={() => setConfirm(false)}
        >
          Ở lại
        </PlayButton>
      </div>
    </PlayCard>
  );
}

/**
 * Phòng chờ (spec 2.4).
 * - Phòng ở `lobby`: thành viên realtime, mã + QR, Host bắt đầu lúc nào cũng được.
 * - Phòng đã bắt đầu (người vào muộn): người đang chơi, màn hiện tại, [Vào cuộc].
 */
export function PlayLobby({ caseTitle }: { caseTitle: string }) {
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

  return (
    <>
      <header className="space-y-1">
        <PlayLabel>{started ? "Phòng đang chơi" : "Phòng chờ"}</PlayLabel>
        <h1 className="text-2xl font-bold leading-tight">{caseTitle}</h1>
        {started && (
          <p className="text-sm text-zinc-400">
            {phaseLabel(room.phase)}
            {room.startedAt &&
              !room.unrankedAt &&
              elapsed !== null &&
              ` — ${elapsed} phút`}
          </p>
        )}
        {room.unrankedAt && (
          <p className="text-sm text-amber-300">
            Phòng này không còn tính xếp hạng.
          </p>
        )}
      </header>

      <InviteCard />

      <PlayCard className="space-y-3">
        <div className="flex items-center justify-between">
          <PlayLabel>{started ? "Đang chơi" : "Thành viên"}</PlayLabel>
          <span className="font-mono text-xs text-zinc-500">
            {participants.length}/{room.maxPlayers}
          </span>
        </div>
        <ul className="space-y-2" aria-live="polite">
          {shown.map((p) => (
            <MemberRow
              key={p.id}
              p={p}
              isMe={p.id === me.id}
              online={p.id === me.id || onlineIds.has(p.id)}
              hostControls={isHost}
            />
          ))}
        </ul>
        {isHost && !started && <MaxPlayersControl />}
      </PlayCard>

      {!started && (
        <p className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-200">
          Bảng xếp hạng chỉ tính khi chơi liền một mạch. Nếu cả phòng rời quá{" "}
          {UNRANKED_GAP_MINUTES} phút, phòng vẫn chơi tiếp nhưng không xếp hạng.
        </p>
      )}

      <PlayError>{error}</PlayError>

      {!started && isHost && (
        <PlayButton
          disabled={busy}
          className="w-full"
          onClick={() => act(advancePhase)}
        >
          Bắt đầu
        </PlayButton>
      )}
      {!started && !isHost && (
        <p className="text-center text-sm text-zinc-400" role="status">
          Chờ Host bắt đầu.
        </p>
      )}
      {started && (
        <PlayButton
          disabled={busy}
          className="w-full"
          onClick={() => act(enterRoom)}
        >
          Vào cuộc
        </PlayButton>
      )}

      <LeaveButton />
    </>
  );
}
