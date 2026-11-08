"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { PlayEntry } from "@/components/play/play-entry";
import { PlayLobby } from "@/components/play/play-lobby";
import { PlayIntro } from "@/components/play/play-intro";
import { PlayShell } from "@/components/play/play-ui";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { normalizeRoomCode } from "@/lib/rooms/code";
import { findSessionByCode } from "@/lib/rooms/client";
import { boardPath, lobbyPath, playPath } from "@/lib/play/routes";
import type { PublicParticipant, PublicRoom } from "@/lib/types/room";

export interface PlayCaseInfo {
  caseId: string;
  title: string;
  synopsis: string | null;
  coverImageUrl: string | null;
  /** Ownership of the current account; null when PLAY_GATING_ENABLED is off. */
  access?: { online: boolean; box: boolean; groupCredits: number } | null;
}

function isInGame(room: PublicRoom | null, me: PublicParticipant | null) {
  return (
    !!room &&
    !!me &&
    !!me.enteredAt &&
    (room.phase === "investigating" || room.phase === "epilogue")
  );
}

/** Mã phòng trên URL hiện tại (`?room=`), đã chuẩn hóa. */
function urlRoomCode(): string | null {
  return normalizeRoomCode(
    new URLSearchParams(window.location.search).get("room"),
  );
}

function Status({ children }: { children: string }) {
  return (
    <p role="status" className="py-20 text-center text-sm text-zinc-400">
      {children}
    </p>
  );
}

/**
 * `/play/<case_id>`: màn vào game (chơi một mình, tạo phòng, nhập mã).
 * Vào được phòng thì chuyển sang `/play/<case_id>/lobby?room=CODE`.
 */
export function PlayRoomClient({ info }: { info: PlayCaseInfo }) {
  const router = useRouter();
  const { room, me, isConnecting } = useRoomSync();
  // F5 / mở lại link phòng mà thiết bị đã có phiên: provider tự nối lại.
  const [autoResuming, setAutoResuming] = useState(false);
  useEffect(() => {
    const code = urlRoomCode();
    setAutoResuming(!!code && !!findSessionByCode(code));
  }, []);

  useEffect(() => {
    if (!room || !me) return;
    const caseId = normalizeCaseId(room.caseId);
    if (isInGame(room, me)) router.replace(boardPath(caseId, room.code));
    else if (room.code) router.replace(lobbyPath(caseId, room.code));
  }, [room, me, router]);

  const body =
    room && me ? (
      <Status>Đang vào phòng chờ…</Status>
    ) : autoResuming && isConnecting ? (
      <Status>Đang kết nối phòng…</Status>
    ) : (
      <PlayEntry
        caseId={info.caseId}
        caseTitle={info.title}
        access={info.access ?? null}
      />
    );

  return <PlayShell>{body}</PlayShell>;
}

/**
 * `/play/<case_id>/lobby?room=CODE`: phòng chờ và intro đồng bộ của phòng.
 * Thiết bị chưa có phiên của mã phòng thì về màn vào game để nhập tên.
 * Phòng đã vào `investigating` và người chơi đã vào cuộc thì sang bàn điều tra.
 */
export function PlayLobbyClient({ info }: { info: PlayCaseInfo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { room, me, leftRoom } = useLobbyState();

  // Không có phiên cho mã này (link chuyển tiếp, máy khác) hoặc vừa rời phòng.
  useEffect(() => {
    const code = urlRoomCode();
    if (!code || !findSessionByCode(code) || leftRoom) {
      router.replace(playPath(info.caseId, leftRoom ? null : code));
    }
  }, [info.caseId, router, leftRoom]);

  // Giữ `?room=<CODE>` khớp phòng hiện tại để F5 tự nối lại; phòng thuộc vụ khác thì đổi vụ.
  const urlRoom = searchParams.get("room");
  useEffect(() => {
    if (!room?.code) return;
    const caseId = normalizeCaseId(room.caseId);
    if (urlRoom !== room.code || caseId !== info.caseId) {
      router.replace(lobbyPath(caseId, room.code), { scroll: false });
    }
  }, [room?.code, room?.caseId, urlRoom, info.caseId, router]);

  useEffect(() => {
    if (isInGame(room, me) && room) {
      router.replace(boardPath(normalizeCaseId(room.caseId), room.code));
    }
  }, [room, me, router]);

  let body: React.ReactNode;
  if (!room || !me) {
    body = <Status>Đang kết nối phòng…</Status>;
  } else if (room.phase === "lobby" || !me.enteredAt) {
    body = (
      <PlayLobby
        caseId={info.caseId}
        caseTitle={info.title}
        caseSynopsis={info.synopsis}
      />
    );
  } else if (room.phase === "intro_scene" || room.phase === "intro_handover") {
    body = <PlayIntro info={info} />;
  } else {
    body = <Status>Đang mở bàn điều tra…</Status>;
  }

  return <PlayShell wide>{body}</PlayShell>;
}

/** room/me của provider, kèm cờ vừa rời phòng (có phòng rồi mất phòng). */
function useLobbyState() {
  const { room, me } = useRoomSync();
  const [hadRoom, setHadRoom] = useState(false);
  useEffect(() => {
    if (room) setHadRoom(true);
  }, [room]);
  return { room, me, leftRoom: hadRoom && !room };
}
