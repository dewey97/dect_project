"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { PlayEntry } from "@/components/play/play-entry";
import { PlayLobby } from "@/components/play/play-lobby";
import { PlayIntro } from "@/components/play/play-intro";
import { PlayShell } from "@/components/play/play-ui";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { normalizeRoomCode } from "@/lib/rooms/code";
import { findSessionByCode } from "@/lib/rooms/client";

export interface PlayCaseInfo {
  caseId: string;
  title: string;
  synopsis: string | null;
  coverImageUrl: string | null;
  /** Ownership of the current account; null when PLAY_GATING_ENABLED is off. */
  access?: { online: boolean; box: boolean; groupCredits: number } | null;
}

/**
 * Điều hướng theo trạng thái phòng (spec 2.1):
 * chưa ở phòng → màn vào game; lobby / người vào muộn → phòng chờ;
 * intro_scene / intro_handover → màn dẫn truyện; investigating / epilogue → bàn điều tra.
 */
export function PlayRoomClient({ info }: { info: PlayCaseInfo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { room, me, isConnecting } = useRoomSync();
  // F5 / mở lại link phòng mà thiết bị đã có phiên: provider tự nối lại, hiện trạng thái chờ
  // thay vì màn vào game. Các thao tác khác (tạo, vào phòng) giữ nguyên form để không mất lỗi.
  const [autoResuming, setAutoResuming] = useState(false);
  useEffect(() => {
    const code = normalizeRoomCode(
      new URLSearchParams(window.location.search).get("room"),
    );
    setAutoResuming(!!code && !!findSessionByCode(code));
  }, []);

  const inGame =
    !!room &&
    !!me &&
    !!me.enteredAt &&
    (room.phase === "investigating" || room.phase === "epilogue");

  // Giữ `?room=<CODE>` trên URL để F5 tự nối lại phòng (router của Next có thể ghi đè
  // URL đã sửa bằng history.replaceState).
  const urlRoom = searchParams.get("room");
  useEffect(() => {
    if (
      room?.code &&
      urlRoom !== room.code &&
      normalizeCaseId(room.caseId) === info.caseId
    ) {
      router.replace(`/play/${info.caseId}?room=${room.code}`, {
        scroll: false,
      });
    }
  }, [room?.code, room?.caseId, urlRoom, info.caseId, router]);

  // Phòng thuộc vụ án khác (mở link cũ): chuyển về đúng vụ của phòng.
  useEffect(() => {
    if (room?.code && normalizeCaseId(room.caseId) !== info.caseId) {
      router.replace(`/play/${room.caseId}?room=${room.code}`);
    }
  }, [room?.caseId, room?.code, info.caseId, router]);

  useEffect(() => {
    if (!inGame || !room) return;
    const qs = new URLSearchParams({ case_id: room.caseId });
    if (room.code) qs.set("room", room.code);
    router.replace(`/evidence/web?${qs.toString()}`);
  }, [inGame, room, router]);

  let body: React.ReactNode;
  if (!room || !me) {
    body =
      autoResuming && isConnecting ? (
        <p role="status" className="py-20 text-center text-sm text-zinc-400">
          Đang kết nối phòng…
        </p>
      ) : (
        <PlayEntry
          caseId={info.caseId}
          caseTitle={info.title}
          access={info.access ?? null}
        />
      );
  } else if (room.phase === "lobby" || !me.enteredAt) {
    body = <PlayLobby caseTitle={info.title} />;
  } else if (room.phase === "intro_scene" || room.phase === "intro_handover") {
    body = <PlayIntro info={info} />;
  } else {
    body = (
      <p role="status" className="py-20 text-center text-sm text-zinc-400">
        Đang mở bàn điều tra…
      </p>
    );
  }

  return <PlayShell>{body}</PlayShell>;
}
