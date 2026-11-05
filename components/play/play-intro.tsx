"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
} from "@/components/play/play-ui";
import { useCaseNarratives } from "@/lib/hooks/use-case-narratives";
import type { PlayCaseInfo } from "@/components/play/play-room-client";

/**
 * Màn dẫn truyện đồng bộ (spec 2.5, 2.6; nội dung theo plan D3):
 * - intro_scene: ảnh bìa + dẫn truyện mở đầu (narrative phase 0 trong Studio).
 * - intro_handover: tóm tắt vụ án + nhiệm vụ. Host bấm [Tiếp nhận vụ án] thì bắt đầu tính giờ.
 * Render ngay bằng nội dung baseline của useCaseNarratives (Zero-Black-Screen),
 * dữ liệu Supabase hydrate đè lên khi tải xong.
 * Mỗi máy báo "đã đọc" qua Presence khi cuộn tới cuối nội dung.
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
  const { getPhaseNarrative } = useCaseNarratives(info.caseId);
  const endRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phase = room?.phase;

  useEffect(() => {
    const el = endRef.current;
    if (!el || (phase !== "intro_scene" && phase !== "intro_handover")) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) markRead(phase);
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, markRead]);

  if (!room || !me || (phase !== "intro_scene" && phase !== "intro_handover"))
    return null;

  const entered = participants.filter((p) => p.enteredAt);
  const readCount = entered.filter((p) => readPhaseById[p.id] === phase).length;
  const narrative = getPhaseNarrative(0);

  const next = async () => {
    setBusy(true);
    setError(null);
    const res = await advancePhase();
    setBusy(false);
    if (!res.success) setError(res.error ?? "Không chuyển được màn.");
  };

  return (
    <>
      {phase === "intro_scene" ? (
        <article className="space-y-4">
          <PlayLabel>{narrative.date}</PlayLabel>
          <h1 className="text-2xl font-bold leading-tight">{info.title}</h1>
          {info.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.coverImageUrl}
              alt={`Hiện trường vụ án ${info.title}`}
              className="aspect-[4/3] w-full rounded-lg border border-zinc-800 object-cover"
            />
          )}
          <div className="whitespace-pre-line text-base leading-relaxed text-zinc-200">
            {narrative.monologue}
          </div>
        </article>
      ) : (
        <article className="space-y-4">
          <PlayLabel>Bàn giao hồ sơ</PlayLabel>
          <h1 className="text-2xl font-bold leading-tight">{info.title}</h1>
          {info.synopsis && (
            <PlayCard>
              <PlayLabel>Thông tin ban đầu</PlayLabel>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-zinc-200">
                {info.synopsis}
              </p>
            </PlayCard>
          )}
          <PlayCard>
            <PlayLabel>Nhiệm vụ</PlayLabel>
            <p className="mt-2 leading-relaxed text-zinc-200">
              Đối chiếu hồ sơ, lời khai và vật chứng. Mọi thành viên đều giải
              được mục tiêu điều tra; ai giải đúng thì cả phòng cùng mở khóa.
              Khi đủ chứng cứ, một người nộp kết luận cho cả phòng.
            </p>
          </PlayCard>
        </article>
      )}

      <div ref={endRef} aria-hidden className="h-px" />

      <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-zinc-800 bg-[#0d0c0a]/95 px-4 py-3 backdrop-blur">
        <p
          className="text-center font-mono text-xs text-zinc-400"
          aria-live="polite"
        >
          {readCount}/{entered.length} đã đọc
        </p>
        <PlayError>{error}</PlayError>
        {isHost ? (
          <PlayButton className="w-full" disabled={busy} onClick={next}>
            {phase === "intro_scene" ? "Tiếp tục" : "Tiếp nhận vụ án"}
          </PlayButton>
        ) : (
          <p className="py-2 text-center text-sm text-zinc-400" role="status">
            Chờ Host chuyển màn.
          </p>
        )}
      </div>
    </>
  );
}
