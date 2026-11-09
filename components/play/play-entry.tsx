"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  DoorOpen,
  History,
  Minus,
  Plus,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { normalizeRoomCode } from "@/lib/rooms/code";
import { readSavedRoomId } from "@/lib/rooms/client";
import { NICKNAME_MAX_LENGTH, cleanNickname } from "@/lib/rooms/nickname";
import {
  PlayButton,
  PlayCard,
  PlayError,
  inputClass,
} from "@/components/play/play-ui";
import { EvidenceMarker } from "@/components/public/evidence-marker";
import { boardPath } from "@/lib/play/routes";

const NICKNAME_KEY = "dect_player_nickname";
const DEFAULT_MAX_PLAYERS = 4;

function savedNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function rememberNickname(nickname: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname);
  } catch {
    // ignore
  }
}

type Step = "choose" | "create" | "join";

/** Nút quay lại ở góc trên trái của mỗi bước: rõ, đủ lớn để bấm. */
const backClass =
  "mb-4 -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-zinc-300 transition hover:text-amber-400 cursor-pointer";

/**
 * Màn vào game vụ án (spec 2.3) thiết kế chuẩn Figma XPLORE (responsive Mobile & Desktop):
 * - Bước 1 (choose): Lựa chọn phòng chơi (Tạo phòng mới / Tham gia phòng).
 * - Bước 2 (create / join): Nhập thông tin người chơi & mã code / quét QR với các ngàm góc vàng hổ phách.
 */
export function PlayEntry({
  caseId,
  caseTitle,
  access = null,
}: {
  caseId: string;
  caseTitle: string;
  /** null when PLAY_GATING_ENABLED is off: no ownership rules shown. */
  access?: { online: boolean; box: boolean; groupCredits: number } | null;
}) {
  const ownsCase = !!access && (access.box || access.online);
  const canSolo = !access || ownsCase;
  const canCreate =
    !access || access.box || (access.online && access.groupCredits > 0);
  const createNote = !access
    ? null
    : access.box
      ? "Bộ hộp: tạo phòng miễn phí."
      : access.online
        ? access.groupCredits > 0
          ? `Còn ${access.groupCredits} lượt tạo phòng nhóm. Mỗi phòng tốn 1 lượt.`
          : "Hết lượt tạo phòng nhóm. Vẫn chơi một mình được."
        : "Chỉ người đã mua vụ án mới tạo phòng. Bạn vẫn vào phòng bạn bè bằng mã.";

  const {
    pendingRoomCode,
    savedSessions,
    createRoom,
    joinRoom,
    resumeRoom,
    isConnecting,
    exitReason,
    clearExitReason,
  } = useRoomSync();

  const [step, setStep] = useState<Step>(pendingRoomCode ? "join" : "choose");
  // Đọc localStorage sau khi mount: lần render đầu phải khớp HTML từ server.
  const [nickname, setNickname] = useState("");
  useEffect(() => {
    const saved = savedNickname();
    if (saved) setNickname((current) => current || saved);
  }, []);
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [code, setCode] = useState(pendingRoomCode ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingRoomCode) {
      setCode(pendingRoomCode);
      setStep("join");
    }
  }, [pendingRoomCode]);

  // Chỉ phòng người chơi đã chọn "Lưu phòng & thoát" (tối đa một phòng).
  const [savedRoomId, setSavedRoomId] = useState<string | null>(null);
  useEffect(() => {
    setSavedRoomId(readSavedRoomId());
  }, [savedSessions]);
  const oldRooms = savedSessions.filter(
    (s) => s.roomId === savedRoomId && s.caseId === caseId,
  );

  const exitMessage =
    exitReason === "kicked"
      ? "Bạn đã bị Host mời ra khỏi phòng."
      : exitReason === "closed"
        ? "Phòng đã bị hủy hoặc không còn tồn tại."
        : exitReason === "invalid" || exitReason === "left_elsewhere"
          ? "Phiên phòng trên thiết bị này không còn hợp lệ. Vào lại bằng mã phòng."
          : null;

  const go = (next: Step) => {
    setError(null);
    clearExitReason();
    setStep(next);
  };

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault();
    const nick = cleanNickname(nickname);
    if (!nick) return setError("Vui lòng nhập tên hiển thị (1–20 ký tự).");
    rememberNickname(nick);
    const res = await createRoom({ caseId, maxPlayers, nickname: nick });
    if (!res.success) setError(res.error ?? "Không tạo được phòng.");
  };

  const submitJoin = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeRoomCode(code);
    if (!normalized) return setError("Mã phòng gồm 4 ký tự.");
    const nick = cleanNickname(nickname);
    if (!nick) return setError("Vui lòng nhập tên hiển thị (1–20 ký tự).");
    rememberNickname(nick);
    const res = await joinRoom(normalized, nick);
    if (!res.success) setError(res.error ?? "Không vào được phòng.");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Thông báo lỗi thoát phòng nếu có */}
      <div className="w-full max-w-xl mb-4">
        <PlayError>{exitMessage}</PlayError>
      </div>

      {/* ========================================================= */}
      {/* BƯỚC 1: LỰA CHỌN PHÒNG CHƠI (Node Figma 410:568 / 418:1814) */}
      {/* ========================================================= */}
      {step === "choose" && (
        <div
          className={`w-full ${canSolo ? "max-w-4xl" : "max-w-2xl"} animate-in fade-in zoom-in-95 duration-200`}
        >
          <PlayCard className="relative p-5 sm:p-8 md:p-10">
            <Link
              href={`/cases/${caseId}`}
              className={backClass}
            >
              <ArrowLeft className="size-4" />
              Quay lại trang vụ án
            </Link>

            {/* Header tiêu đề */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-50">
                {caseTitle}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-zinc-400">
                Phá án một mình hay cùng đồng đội?
              </p>
            </div>

            {/* Các thẻ chọn cách tham gia: Chơi một mình (nếu được), Tạo phòng, Tham gia phòng */}
            <div
              className={`grid grid-cols-1 gap-4 sm:gap-5 ${canSolo ? "md:grid-cols-3" : "md:grid-cols-2"}`}
            >
              {/* Thẻ 1: Chơi một mình */}
              {canSolo && (
                <div className="border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 flex flex-col justify-between gap-6 hover:border-amber-500/50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-end gap-3">
                      <EvidenceMarker n={1} className="shrink-0 -rotate-[3deg]" />
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-200">
                        Chơi một mình
                      </h2>
                    </div>
                  </div>
                  <Link
                    href={boardPath(caseId)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-none bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105"
                  >
                    Chơi ngay
                  </Link>
                </div>
              )}
              {/* Thẻ: Tạo phòng chơi mới */}
              <div className="border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 flex flex-col justify-between gap-6 hover:border-amber-500/50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-3">
                    <EvidenceMarker n={canSolo ? 2 : 1} className="shrink-0 -rotate-[6deg]" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-200">
                      Tạo phòng chơi mới
                    </h2>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <PlayButton
                    className="w-full"
                    disabled={!canCreate}
                    onClick={() => go("create")}
                  >
                    Tạo phòng ngay
                  </PlayButton>
                  {createNote && !canCreate && (
                    <p className="text-xs text-amber-400/90 leading-tight pt-1">
                      {ownsCase ? "Mua thêm lượt tạo phòng" : "Cần mua vụ án"}{" "}
                      <Link
                        href={`/cases/${caseId}#online`}
                        className="underline underline-offset-2 font-semibold hover:text-amber-300"
                      >
                        tại đây
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Thẻ: Tham gia phòng */}
              <div className="border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 flex flex-col justify-between gap-6 hover:border-amber-500/50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-3">
                    <EvidenceMarker n={canSolo ? 3 : 2} className="shrink-0 rotate-[5deg]" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-200">
                      Tham gia phòng
                    </h2>
                  </div>
                </div>

                <div className="w-full">
                  <PlayButton className="w-full" onClick={() => go("join")}>
                    Tham gia ngay
                  </PlayButton>
                </div>
              </div>

            </div>

            {/* Danh sách phòng cũ đã tham gia (nếu có) */}
            {oldRooms.length > 0 && (
              <div className="mt-6 p-4 border border-zinc-800 bg-zinc-900/50">
                <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <History className="size-3.5 text-amber-400" />
                  Tiếp tục phòng cũ
                </div>
                <div className="space-y-2">
                  {oldRooms.map((s) => (
                    <button
                      key={s.roomId}
                      type="button"
                      disabled={isConnecting}
                      onClick={async () => {
                        setError(null);
                        const res = await resumeRoom(s.roomId);
                        if (!res.success)
                          setError(res.error ?? "Không mở lại được phòng.");
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 border border-zinc-800 bg-zinc-950/70 hover:border-amber-500/40 hover:bg-zinc-900 transition text-left cursor-pointer"
                    >
                      <span className="font-semibold text-sm text-zinc-200">
                        {s.nickname}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {s.code ?? "MỞ LẠI"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </PlayCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* BƯỚC 2A: TẠO PHÒNG - NHẬP THÔNG TIN (Node Figma 420:2112 / 390:1521) */}
      {/* ========================================================= */}
      {step === "create" && (
        <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <PlayCard className="p-6 sm:p-8">
            <form onSubmit={submitCreate} className="space-y-6">
              <button
                type="button"
                onClick={() => go("choose")}
                className={backClass}
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>

              {/* Header tiêu đề */}
              <div className="text-center pb-2">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400 mb-2">
                  {caseTitle}
                </p>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-50">
                  Tạo phòng chơi mới
                </h1>
              </div>

              {/* Trường nhập Tên hiển thị chuẩn Figma */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="create-nick"
                    className="font-mono text-xs font-medium uppercase tracking-widest text-zinc-400"
                  >
                    Tên hiển thị
                  </label>
                </div>
                <input
                  id="create-nick"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={NICKNAME_MAX_LENGTH}
                  autoComplete="nickname"
                  placeholder="Nhập tên của bạn"
                  className={inputClass}
                />
                <p className="text-xs text-zinc-500">
                  Tên dùng để hiển thị trong phòng chờ và trên bảng vụ án.
                </p>
              </div>

              {/* Số thám tử tối đa: nhãn và nút +/- trên cùng một dòng */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span
                  id="max-players-label"
                  className="font-mono text-xs font-medium uppercase tracking-widest text-zinc-400"
                >
                  Số thám tử tối đa
                </span>
                <div
                  role="group"
                  aria-labelledby="max-players-label"
                  className="flex items-center gap-3"
                >
                  <button
                    type="button"
                    aria-label="Giảm số người"
                    onClick={() => setMaxPlayers((n) => Math.max(1, n - 1))}
                    className="size-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200 hover:border-amber-500 transition cursor-pointer"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span
                    aria-live="polite"
                    className="font-mono text-lg font-bold text-amber-400 min-w-6 text-center"
                  >
                    {maxPlayers}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng số người"
                    onClick={() => setMaxPlayers((n) => Math.min(8, n + 1))}
                    className="size-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200 hover:border-amber-500 transition cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <PlayError>{error}</PlayError>

              {/* Nút hành động */}
              <div className="space-y-3 pt-3">
                <PlayButton
                  type="submit"
                  disabled={isConnecting || !canCreate}
                  className="w-full"
                >
                  {isConnecting ? "Đang tạo phòng…" : "Vào phòng chờ"}
                </PlayButton>

              </div>
            </form>
          </PlayCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* BƯỚC 2B: THAM GIA PHÒNG & QUÉT QR (Node Figma 390:1510 / 405:325) */}
      {/* ========================================================= */}
      {step === "join" && (
        <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
          <PlayCard className="p-6 sm:p-8">
            <form onSubmit={submitJoin} className="space-y-6">
              <button
                type="button"
                onClick={() => go("choose")}
                className={backClass}
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>

              {/* Nếu chưa có mã phòng từ URL QR: Hiển thị Khung quét QR Viewfinder chuẩn Figma */}
              {!pendingRoomCode && (
                <div className="space-y-4">
                  {/* Viewfinder Camera với 4 ngàm góc hổ phách */}
                  <div className="relative w-full max-w-[240px] aspect-square mx-auto bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center p-6">
                    {/* 4 ngàm góc vàng hổ phách */}
                    <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-400" />

                    <Camera className="size-14 text-amber-400/90 mb-3 animate-pulse" />
                    <span className="text-sm text-zinc-400 text-center">
                      Quét mã QR để tiếp tục
                    </span>
                  </div>

                  {/* Dòng phân cách "hoặc" */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 border-b border-dashed border-zinc-700/80" />
                    <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
                      hoặc
                    </span>
                    <div className="flex-1 border-b border-dashed border-zinc-700/80" />
                  </div>
                </div>
              )}

              {/* Nhập mã phòng hoặc hiển thị mã phòng đã có */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="join-code"
                    className="font-mono text-xs font-medium uppercase tracking-widest text-zinc-400"
                  >
                    Mã phòng
                  </label>
                </div>

                {pendingRoomCode ? (
                  <div className="p-4 border border-amber-500/50 bg-zinc-900/50 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      Mã phòng đã nhận:
                    </span>
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-amber-400">
                      {pendingRoomCode}
                    </span>
                  </div>
                ) : (
                  <input
                    id="join-code"
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Nhập mã code (VD: 4827)"
                    className={`${inputClass} font-mono text-xl font-bold tracking-widest placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal`}
                  />
                )}
              </div>

              {/* Trường nhập Tên hiển thị */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="join-nick"
                    className="font-mono text-xs font-medium uppercase tracking-widest text-zinc-400"
                  >
                    Tên hiển thị
                  </label>
                </div>
                <input
                  id="join-nick"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={NICKNAME_MAX_LENGTH}
                  autoComplete="nickname"
                  placeholder="Nhập tên của bạn"
                  className={inputClass}
                />
              </div>

              <PlayError>{error}</PlayError>

              {/* Nút hành động */}
              <div className="space-y-3 pt-2">
                <PlayButton
                  type="submit"
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? "Đang kết nối…" : "Vào phòng chờ"}
                </PlayButton>

              </div>
            </form>
          </PlayCard>
        </div>
      )}
    </div>
  );
}
