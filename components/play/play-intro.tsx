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
  const { getPhaseNarrative } = useCaseNarratives(info.caseId);
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
  const narrative = getPhaseNarrative(0);

  const next = async () => {
    setBusy(true);
    setError(null);
    const res = await advancePhase();
    setBusy(false);
    if (!res.success) setError(res.error ?? "Không chuyển được màn.");
  };

  const coverSrc =
    info.coverImageUrl && !info.coverImageUrl.includes("crime_scene_360")
      ? info.coverImageUrl
      : "/poster_c0.webp";

  return (
    <>
      <article className="space-y-6">
        {/* Header Ngày & Tiêu đề vụ án */}
        <div className="space-y-1">
          <PlayLabel>{narrative.date || "HÀ NỘI · 1998"}</PlayLabel>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100 sm:text-3xl">
            {info.title}
          </h1>
        </div>

        {/* Ảnh hiện trường vụ án */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 flex items-center justify-center">
          <SafeImg
            src={coverSrc}
            fallbackSrc="/poster_c0.webp"
            alt={`Hiện trường vụ án ${info.title}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Bối cảnh dẫn truyện */}
        {narrative.monologue && (
          <div className="rounded-none border border-zinc-800/80 bg-zinc-950/60 p-4">
            <PlayLabel>Bối cảnh ban đầu</PlayLabel>
            <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300 font-serif italic">
              {narrative.monologue}
            </div>
          </div>
        )}

        {/* Thông tin ban đầu & Tóm tắt vụ án */}
        {info.synopsis && (
          <PlayCard>
            <PlayLabel>Thông tin ban đầu</PlayLabel>
            <p className="mt-2 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-zinc-200">
              {info.synopsis}
            </p>
          </PlayCard>
        )}

        {/* Nhiệm vụ phá án */}
        <PlayCard>
          <PlayLabel>Nhiệm vụ điều tra</PlayLabel>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-200">
            Đối chiếu hồ sơ tài liệu, giải mã mâu thuẫn lời khai và xâu chuỗi vật chứng hiện trường.
            Mọi thành viên đều có thể giải câu hỏi checkpoint; khi một người giải đúng, cả phòng cùng mở khóa manh mối mới.
            Khi đã nắm vững động cơ và chứng cứ xác thực, tiến hành thẩm tra nghi phạm và kết luận vụ án.
          </p>
        </PlayCard>
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
