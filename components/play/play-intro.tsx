"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
} from "@/components/play/play-ui";
import { useCaseNarratives } from "@/lib/hooks/use-case-narratives";
import type { PlayCaseInfo } from "@/components/play/play-room-client";
import { SafeImg } from "@/components/ui/safe-img";

/**
 * Màn dẫn truyện & bàn giao hồ sơ đồng bộ (hợp nhất 1 trang duy nhất):
 * - Ngày tháng, bối cảnh hiện trường, độc thoại dẫn truyện.
 * - Thông tin ban đầu & Nhiệm vụ điều tra.
 * - Host bấm [Tiếp nhận vụ án & Bắt đầu phá án] để chuyển thẳng vào bàn điều tra (investigating) và bắt đầu tính giờ.
 */
export function PlayIntro({ info }: { info: PlayCaseInfo }) {
  const {
    room,
    me,
    participants,
    readPhaseById,
    isHost,
    advancePhase,
    markRead,
  } = useRoomSync();
  const endRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phase = room?.phase;

  useEffect(() => {
    const el = endRef.current;
    if (!el || (phase !== "intro_scene" && phase !== "intro_handover")) return;
    if (el.getBoundingClientRect().top <= window.innerHeight) markRead(phase);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) markRead(phase);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, markRead]);

  if (!room || !me || (phase !== "intro_scene" && phase !== "intro_handover"))
    return null;

  const entered = participants.filter((p) => p.enteredAt);
  const readCount = entered.filter((p) => readPhaseById[p.id] === phase).length;

  const next = async () => {
    setBusy(true);
    setError(null);
    const res = await advancePhase();
    setBusy(false);
    if (!res.success) setError(res.error ?? "Không chuyển được màn.");
  };

  return (
    <>
      <article className="space-y-6">
        <CaseBrief info={info} />
      </article>

      <div ref={endRef} aria-hidden className="h-px" />

      {/* Action Footer */}
      <div className="sticky bottom-0 -mx-4 mt-6 space-y-2 border-t border-zinc-800 bg-[#0d0c0a]/95 px-4 py-3 backdrop-blur">
        <p
          className="text-center font-mono text-xs text-zinc-400"
          aria-live="polite"
        >
          {readCount}/{entered.length} thành viên đã đọc
        </p>
        <PlayError>{error}</PlayError>
        {isHost ? (
          <PlayButton
            className="w-full rounded-none py-3 text-sm font-bold uppercase tracking-wider"
            disabled={busy}
            onClick={next}
          >
            {busy ? "Đang mở bàn điều tra…" : "Tiếp nhận vụ án & Bắt đầu phá án"}
          </PlayButton>
        ) : (
          <p className="py-2 text-center text-xs font-mono text-zinc-400" role="status">
            Đang chờ Host tiếp nhận vụ án để vào bàn điều tra…
          </p>
        )}
      </div>
    </>
  );
}

/**
 * Bối cảnh vụ án: ngày, tên vụ, ảnh hiện trường, bối cảnh ban đầu. Hiện ngay trong phòng chờ để cả nhóm đọc trong lúc chờ Host bắt đầu.
 */
export function CaseBrief({
  info,
}: {
  info: Pick<PlayCaseInfo, "caseId" | "title" | "synopsis" | "coverImageUrl">;
}) {
  const { getPhaseNarrative } = useCaseNarratives(info.caseId);
  const narrative = getPhaseNarrative(0);
  return (
    <div className="space-y-6">
      <PlayLabel>{narrative.date || "HÀ NỘI · 1998"}</PlayLabel>

      {/* Bối cảnh dẫn truyện */}
      {narrative.monologue && (
        <div>
          <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300 font-serif italic">
            {narrative.monologue}
          </div>
        </div>
      )}
    </div>
  );
}
