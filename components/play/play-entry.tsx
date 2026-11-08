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
  QrCode,
  Users,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { normalizeRoomCode } from "@/lib/rooms/code";
import { NICKNAME_MAX_LENGTH, cleanNickname } from "@/lib/rooms/nickname";
import { PlayButton, PlayCard, PlayError } from "@/components/play/play-ui";
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

/**
 * Màn vào game vụ án (spec 2.3) thiết kế chuẩn Figma XPLORE (responsive Mobile & Desktop):
 * - Bước 1 (choose): Lựa chọn phòng chơi (Tạo phòng mới / Tham gia phòng sẵn có).
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

  const oldRooms = savedSessions.filter((s) => s.caseId === caseId);

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
        <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
          <PlayCard className="relative overflow-hidden p-6 sm:p-8 md:p-10">
            {/* Header tiêu đề chuẩn Figma */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-amber-400 mb-2">
                Chọn cách tham gia vụ án
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-serif italic">
                {caseTitle}
              </p>
            </div>

            {/* Hai thẻ chọn phương thức tham gia (Responsive: 1 cột mobile, 2 cột desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {/* Thẻ 1: Tạo phòng chơi mới */}
              <div className="rounded-2xl border border-zinc-800 bg-[#212124]/90 p-6 flex flex-col items-center text-center justify-between hover:border-amber-500/50 hover:bg-[#252529] transition-all group shadow-md">
                <div className="flex flex-col items-center w-full">
                  <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                    <Users className="size-8" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 mb-2">
                    Tạo phòng chơi mới
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Khởi tạo phòng và mời đồng đội cùng tham gia
                  </p>
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
                    <p className="text-[11px] text-amber-400/90 leading-tight pt-1">
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

              {/* Thẻ 2: Tham gia phòng sẵn có */}
              <div className="rounded-2xl border border-zinc-800 bg-[#212124]/90 p-6 flex flex-col items-center text-center justify-between hover:border-amber-500/50 hover:bg-[#252529] transition-all group shadow-md">
                <div className="flex flex-col items-center w-full">
                  <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                    <QrCode className="size-8" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 mb-2">
                    Tham gia phòng sẵn có
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Nhập mã phòng hoặc quét QR để tham gia
                  </p>
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
              <div className="mb-6 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60">
                <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <History className="size-3.5 text-amber-400" />
                  Tiếp tục phòng cũ
                </div>
                <div className="space-y-2">
                  {oldRooms.slice(0, 3).map((s) => (
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
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:border-amber-500/40 hover:bg-zinc-900 transition text-left cursor-pointer"
                    >
                      <span className="font-semibold text-sm text-zinc-200">
                        {s.nickname}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        #{s.code ?? "MỞ LẠI"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Các tùy chọn phụ bên dưới */}
            <div className="flex flex-col items-center gap-3 pt-2">
              {(!access || ownsCase) && (
                <Link
                  href={boardPath(caseId)}
                  className="text-xs text-zinc-400 hover:text-amber-400 transition underline underline-offset-4"
                >
                  Chơi một mình (không qua phòng)
                </Link>
              )}
              <Link
                href={`/cases/${caseId}`}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                Quay lại trang vụ án
              </Link>
            </div>
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
              {/* Header tiêu đề */}
              <div className="text-center pb-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-amber-400 uppercase">
                  Nhập thông tin người chơi
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Khởi tạo phòng chơi cho vụ án: {caseTitle}
                </p>
              </div>

              {/* Trường nhập Tên hiển thị chuẩn Figma */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <label
                    htmlFor="create-nick"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-200"
                  >
                    TÊN HIỂN THỊ:
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
                  className="w-full min-h-12 rounded-xl bg-[#ececed] text-zinc-950 placeholder:text-zinc-500 font-medium px-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner transition"
                />
                <p className="text-[11px] text-zinc-400">
                  Tên dùng để hiển thị trong phòng chờ và trên bảng vụ án.
                </p>
              </div>

              {/* Tùy chỉnh số lượng người chơi */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    SỐ THÁM TỬ TỐI ĐA:
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-[#212124]">
                  <span className="text-xs text-zinc-400">
                    Quy mô đội điều tra
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Giảm số người"
                      onClick={() => setMaxPlayers((n) => Math.max(1, n - 1))}
                      className="size-8 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-200 hover:border-amber-500 transition cursor-pointer"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="font-mono text-lg font-bold text-amber-400 min-w-6 text-center">
                      {maxPlayers}
                    </span>
                    <button
                      type="button"
                      aria-label="Tăng số người"
                      onClick={() => setMaxPlayers((n) => Math.min(8, n + 1))}
                      className="size-8 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-200 hover:border-amber-500 transition cursor-pointer"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <PlayError>{error}</PlayError>

              {/* Nút hành động */}
              <div className="space-y-3 pt-3">
                <PlayButton
                  type="submit"
                  disabled={isConnecting || !canCreate}
                  className="w-full text-base uppercase tracking-wider"
                >
                  {isConnecting ? "Đang tạo phòng…" : "Vào phòng chờ"}
                </PlayButton>

                <button
                  type="button"
                  onClick={() => go("choose")}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" />
                  Quay lại
                </button>
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
              {/* Nếu chưa có mã phòng từ URL QR: Hiển thị Khung quét QR Viewfinder chuẩn Figma */}
              {!pendingRoomCode && (
                <div className="space-y-4">
                  {/* Viewfinder Camera với 4 ngàm góc hổ phách */}
                  <div className="relative w-full max-w-[240px] aspect-square mx-auto rounded-3xl bg-[#212124] border border-zinc-800 flex flex-col items-center justify-center p-6 shadow-inner">
                    {/* 4 ngàm góc vàng hổ phách */}
                    <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-400 rounded-tl-xl" />
                    <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-400 rounded-tr-xl" />
                    <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-400 rounded-bl-xl" />
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-400 rounded-br-xl" />

                    <Camera className="size-14 text-amber-400/90 mb-3 animate-pulse" />
                    <span className="text-xs text-zinc-400 text-center font-medium">
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
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <label
                    htmlFor="join-code"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-200"
                  >
                    NHẬP MÃ CODE TỪ HỘP GAME / MÃ PHÒNG:
                  </label>
                </div>

                {pendingRoomCode ? (
                  <div className="p-4 rounded-xl border border-amber-500/50 bg-[#212124] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      Mã phòng đã nhận:
                    </span>
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-amber-400">
                      #{pendingRoomCode}
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
                    className="w-full min-h-12 rounded-xl bg-[#ececed] text-zinc-950 font-mono text-xl font-bold tracking-widest placeholder:text-zinc-500 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner transition"
                  />
                )}
              </div>

              {/* Trường nhập Tên hiển thị */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  <label
                    htmlFor="join-nick"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-200"
                  >
                    TÊN HIỂN THỊ:
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
                  className="w-full min-h-12 rounded-xl bg-[#ececed] text-zinc-950 placeholder:text-zinc-500 font-medium px-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner transition"
                />
              </div>

              <PlayError>{error}</PlayError>

              {/* Nút hành động */}
              <div className="space-y-3 pt-2">
                <PlayButton
                  type="submit"
                  disabled={isConnecting}
                  className="w-full text-base uppercase tracking-wider"
                >
                  {isConnecting ? "Đang kết nối…" : "Vào phòng chờ"}
                </PlayButton>

                <button
                  type="button"
                  onClick={() => go("choose")}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" />
                  Quay lại
                </button>
              </div>
            </form>
          </PlayCard>
        </div>
      )}
    </div>
  );
}
