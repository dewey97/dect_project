"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
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
import {
  DetectiveAvatar,
  DetectiveSilhouetteSvg,
} from "@/components/investigation/detective-avatar";
import { RoomQr } from "@/components/play/room-qr";
import { CaseBrief } from "@/components/play/play-intro";
import {
  PlayButton,
  PlayCard,
  PlayError,
} from "@/components/play/play-ui";
import { roomInviteUrl } from "@/lib/rooms/client";
import { boardPath } from "@/lib/play/routes";
import { preloadImage } from "@/lib/utils/image-preloader";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { prefetchCaseCharacters } from "@/components/investigation/contexts/case-characters-context";
import { prefetchBoardModel } from "@/components/investigation/board/canvas/use-board-model";
import { prefetchCaseDossiers } from "@/lib/hooks/use-case-dossiers";
import { prefetchDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import { prefetchCaseEvidence } from "@/lib/hooks/use-case-evidence";
import { phaseLabel } from "@/lib/rooms/messages";
import type { PublicParticipant } from "@/lib/types/room";
import { cn } from "@/lib/utils";

/**
 * Nút rời phòng. Xác nhận có 2 lựa chọn:
 * - Lưu phòng & thoát: giữ chỗ, phòng này thành phòng duy nhất hiện ở [Tiếp tục phòng cũ].
 * - Rời hẳn: trả chỗ, xóa phiên phòng khỏi thiết bị.
 */
function LeaveRoomButton() {
  const { leaveRoom, saveAndExitRoom } = useRoomSync();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="inline-flex min-h-10 items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 cursor-pointer"
      >
        <LogOut className="size-4 text-zinc-400" />
        <span>Rời phòng</span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in zoom-in-95">
      <button
        type="button"
        onClick={() => saveAndExitRoom()}
        className="min-h-10 border border-amber-500/60 bg-amber-500/10 px-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 cursor-pointer"
      >
        Lưu phòng &amp; thoát
      </button>
      <button
        type="button"
        onClick={() => leaveRoom()}
        className="min-h-10 border border-red-800 bg-red-950/60 px-3 text-sm font-semibold text-red-200 transition hover:bg-red-900 cursor-pointer"
      >
        Rời hẳn
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="min-h-10 border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-300 transition hover:bg-zinc-800 cursor-pointer"
      >
        Ở lại
      </button>
    </div>
  );
}

/** Khung ảnh thẻ 3:4 làm chỗ đặt avatar: nền đặc, bóng thám tử đặc bên trong. */
function PortraitFrame({
  tone,
  dashed = false,
  children,
}: {
  tone: "host" | "member" | "empty";
  dashed?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full items-end justify-center overflow-hidden border",
        dashed && "border-dashed",
        tone === "host" && "border-amber-400 bg-zinc-800",
        tone === "member" && "border-zinc-700 bg-zinc-800",
        tone === "empty" && "border-zinc-800 bg-zinc-900",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-[130%] shrink-0 translate-y-[14%] [&_svg]:h-auto [&_svg]:w-full",
          tone === "empty" && "opacity-40",
        )}
      >
        <DetectiveSilhouetteSvg
          size={160}
          color={tone === "host" ? "#b45309" : tone === "member" ? "#52525b" : "#3f3f46"}
        />
      </span>
      {children}
    </div>
  );
}

/** Ô thám tử: khung ảnh thẻ 3:4, tên bên dưới. */
function MemberTile({
  participant,
  isHost,
  online,
  onKick,
}: {
  participant: PublicParticipant;
  isHost: boolean;
  online: boolean;
  onKick?: (sessionId: string) => void;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", !online && "opacity-50")}>
      <PortraitFrame tone={isHost ? "host" : "member"}>
        {isHost && (
          <span
            className="absolute left-0 top-0 flex size-6 items-center justify-center bg-amber-400 text-zinc-950"
            title="Chủ phòng"
          >
            <Crown className="size-3.5 fill-zinc-950" />
          </span>
        )}
        {onKick && (
          <button
            type="button"
            onClick={() => onKick(participant.id)}
            className="absolute right-0 top-0 flex size-9 items-center justify-center text-zinc-500 transition hover:text-red-400 cursor-pointer"
            title="Mời ra khỏi phòng"
            aria-label={`Mời ${participant.nickname} ra khỏi phòng`}
          >
            <UserMinus className="size-4" />
          </button>
        )}
      </PortraitFrame>
      <div className="min-w-0 text-center">
        <p
          className={cn(
            "truncate text-sm font-bold",
            isHost ? "text-amber-300" : "text-zinc-100",
          )}
        >
          {participant.nickname}
        </p>
        {!online && <p className="text-xs text-red-300/80">Mất kết nối</p>}
      </div>
    </div>
  );
}

/** Ô trống chờ thám tử vào phòng. */
function EmptyTile() {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <PortraitFrame tone="empty" dashed />
      <p className="text-center text-sm text-zinc-600">Chờ thám tử</p>
    </div>
  );
}

/**
 * Tải trước bàn điều tra khi đang ở phòng chờ: dữ liệu vụ án (nhân vật, hồ sơ, tài liệu,
 * vật chứng, bàn ghim) vào cache của từng hook, ảnh nền / ghim / bìa, và trang bàn điều tra.
 * Bấm Bắt đầu là bàn điều tra đọc cache, không phải chờ "đang đồng bộ".
 * Trả về tỉ lệ đã xong (0..1). Việc lỗi hoặc quá hạn vẫn tính là xong, không chặn ai.
 */
function useBoardPreload(
  caseId: string,
  urls: string[],
  boardHref: string,
  enabled: boolean,
) {
  const router = useRouter();
  const [done, setDone] = useState(0);
  const key = urls.join("|");
  const total = urls.length + 5;

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    router.prefetch(boardHref);
    setDone(0);
    const tick = () => {
      if (alive) setDone((n) => n + 1);
    };
    const tasks: Promise<unknown>[] = [
      prefetchCaseCharacters(caseId),
      prefetchBoardModel(caseId),
      prefetchCaseDossiers(caseId),
      prefetchDossierDocuments(caseId),
      prefetchCaseEvidence(caseId),
      ...key.split("|").map((url) => preloadImage(url, 8000)),
    ];
    tasks.forEach((task) => task.finally(tick));
    return () => {
      alive = false;
    };
  }, [caseId, key, boardHref, enabled, router]);

  return Math.min(1, done / total);
}

const BOARD_ASSETS = [
  "/images/backgrounds/corkboard_vertical_empty.jpg",
  "/images/hero/evidence-board-frame.png",
  "/images/pins/pin-red.png",
  "/images/pins/pin-yellow.png",
  "/images/pins/pin-green.png",
  "/images/pins/pin-blue.png",
  "/images/pins/pin-silver.png",
  "/images/pins/pin-brass.png",
];

interface PlayLobbyProps {
  caseTitle: string;
  /** Ảnh bìa vụ án, tải trước cùng tài nguyên bàn điều tra. */
  coverImageUrl?: string | null;
  caseSynopsis?: string | null;
  caseId?: string;
  /** Trong modal Chơi nhóm của bàn điều tra: bỏ banner chào và lời nhắc. */
  embedded?: boolean;
}

/**
 * Phòng chờ chuyên án (Waiting Room) thiết kế chuẩn 1:1 theo Figma XPLORE:
 * - Hỗ trợ đầy đủ Responsive Mobile & Desktop (Node Figma 412:710 cho Host & 413:1062 cho Member).
 * - Floating Welcome Pill ở trên cùng.
 * - Lưới ô thám tử 3:4 (kèm ô trống) và thanh tải tài nguyên bàn điều tra trước khi bắt đầu.
 * - Khối Thông tin phòng gồm Mã phòng lớn font Mono + QR Code quét nhanh bằng camera điện thoại.
 */
export function PlayLobby({
  caseTitle,
  coverImageUrl,
  caseSynopsis,
  caseId = "case_000",
  embedded = false,
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
  // Lời chào chỉ hiện như một thông báo ngắn rồi tự ẩn.
  const [showWelcome, setShowWelcome] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setShowWelcome(false), 3500);
    return () => window.clearTimeout(id);
  }, []);

  const cover =
    coverImageUrl && !coverImageUrl.includes("crime_scene_360")
      ? coverImageUrl
      : "/poster_c0.webp";
  const preload = useBoardPreload(
    normalizeCaseId(room?.caseId || caseId),
    [cover, ...BOARD_ASSETS],
    boardPath(room?.caseId || caseId),
    !embedded,
  );
  const assetsReady = embedded || preload >= 1;

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

  // Chia sẻ link mời: dùng bảng chia sẻ của máy nếu có, không thì chép link.
  const shareInvite = async () => {
    if (!inviteUrl) return;
    const shareData = {
      title: `Vào phòng ${caseTitle}`,
      text: `Vào phòng chơi "${caseTitle}" với mình, mã phòng ${room.code}`,
      url: inviteUrl,
    };
    try {
      if (typeof navigator.share === "function" && navigator.canShare?.(shareData) !== false) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
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
      {/* 1. Lời chào: toast ngắn ở mép trên, tự ẩn sau vài giây */}
      {!embedded && showWelcome && (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-center gap-2.5 border border-zinc-700 bg-zinc-950/95 px-4 py-2.5 text-sm text-zinc-200 shadow-xl">
            <DetectiveAvatar name={me.nickname} size="xs" className="shrink-0" />
            <span>
              Chào mừng thám tử{" "}
              <strong className="font-bold text-amber-400">{me.nickname}</strong>{" "}
              đến với vụ án{" "}
              <strong className="font-bold text-amber-400">{caseTitle}</strong>!
            </span>
          </div>
        </div>
      )}

      {/* 2. Phòng chờ: bối cảnh vụ án (trái) + đội điều tra (phải). Trong modal bàn điều tra chỉ còn đội. */}
      <div
        className={cn(
          "w-full animate-in fade-in zoom-in-95 duration-200",
          embedded
            ? "max-w-2xl"
            : "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        <section className="space-y-6">
          {/* Header danh sách thành viên */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
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

          {/* Lưới ô thám tử 3:4, kèm ô trống tới số người tối đa */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {shown.map((p) => {
              const isParticipantHost = Boolean(p.isHost);
              return (
                <MemberTile
                  key={p.id}
                  participant={p}
                  isHost={isParticipantHost}
                  online={p.id === me.id || onlineIds.has(p.id)}
                  onKick={isHost && !isParticipantHost ? handleKick : undefined}
                />
              );
            })}
            {!started &&
              Array.from({
                length: Math.max(0, room.maxPlayers - shown.length),
              }).map((_, i) => <EmptyTile key={`empty-${i}`} />)}
          </div>

          {/* 3. KHỐI THÔNG TIN PHÒNG (DÀNH CHO HOST - Có QR Code và Mã phòng #XXXX) */}
          {isHost && (
            <div className="border border-zinc-800 bg-zinc-900 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                {/* QR Code trực tiếp */}
                <div className="shrink-0">
                  <RoomQr url={inviteUrl} size={120} />
                </div>

                {/* Mã phòng + Lời hướng dẫn */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 flex-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Mã phòng</span>
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-[0.2em]">
                    {room.code}
                  </span>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Bạn bè quét QR, nhập mã hoặc mở link mời để vào phòng.
                  </p>
                  <button
                    type="button"
                    onClick={shareInvite}
                    className="mt-1 inline-flex min-h-10 items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 transition-colors hover:border-amber-500/60 hover:text-amber-300 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 text-emerald-400" />
                        Đã chép link mời
                      </>
                    ) : (
                      <>
                        <Share2 className="size-4" />
                        Chia sẻ link mời
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thanh tải tài nguyên bàn điều tra */}
          {!embedded && !started && (
            <div className="space-y-1.5" aria-live="polite">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest">
                <span className={assetsReady ? "text-emerald-400" : "text-zinc-400"}>
                  {assetsReady ? "Hồ sơ đã sẵn sàng" : "Đang tải hồ sơ vụ án"}
                </span>
                <span className="tabular-nums text-zinc-500">
                  {Math.round(preload * 100)}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Tải tài nguyên vụ án"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(preload * 100)}
                className="h-1 w-full bg-zinc-800"
              >
                <div
                  className={cn(
                    "h-full transition-[width] duration-300",
                    assetsReady ? "bg-emerald-400" : "bg-amber-400",
                  )}
                  style={{ width: `${Math.round(preload * 100)}%` }}
                />
              </div>
            </div>
          )}

          <PlayError>{error}</PlayError>

          {/* 4. NÚT HÀNH ĐỘNG CHÍNH */}
          <div className="space-y-3 pt-2">
            {!started && isHost && (
              <PlayButton
                disabled={busy || !assetsReady}
                className="w-full py-4 text-base tracking-wider uppercase font-bold"
                onClick={() => act(advancePhase)}
              >
                <Play className="size-4 fill-zinc-950" />
                <span>{assetsReady ? "Bắt đầu game" : "Đang tải hồ sơ…"}</span>
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

            {started && !me.enteredAt && (
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
        </section>
        {!embedded && (
          <PlayCard className="p-5 sm:p-7">
            <CaseBrief
              info={{
                caseId: room.caseId || caseId,
                title: caseTitle,
                synopsis: caseSynopsis ?? null,
                coverImageUrl: coverImageUrl ?? null,
              }}
            />
          </PlayCard>
        )}
      </div>
    </div>
  );
}
