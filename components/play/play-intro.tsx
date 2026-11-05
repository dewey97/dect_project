"use client";

import { useRoomSync } from "@/components/investigation/room-sync-context";
import { PlayButton, PlayLabel } from "@/components/play/play-ui";
import { phaseLabel } from "@/lib/rooms/messages";
import type { PlayCaseInfo } from "@/components/play/play-room-client";

/** Màn dẫn truyện intro_scene / intro_handover. Nội dung đầy đủ ở P5. */
export function PlayIntro({ info }: { info: PlayCaseInfo }) {
  const { room, isHost, advancePhase } = useRoomSync();
  if (!room) return null;
  return (
    <>
      <PlayLabel>{phaseLabel(room.phase)}</PlayLabel>
      <h1 className="text-2xl font-bold">{info.title}</h1>
      {isHost ? (
        <PlayButton onClick={() => advancePhase()}>Tiếp tục</PlayButton>
      ) : (
        <p className="text-sm text-zinc-400">Chờ Host chuyển màn.</p>
      )}
    </>
  );
}
