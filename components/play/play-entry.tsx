"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, DoorOpen, History, Minus, Plus, Users } from "lucide-react";
import { useRoomSync } from "@/components/investigation/room-sync-context";
import { normalizeRoomCode } from "@/lib/rooms/code";
import { NICKNAME_MAX_LENGTH, cleanNickname } from "@/lib/rooms/nickname";
import {
  PlayButton,
  PlayCard,
  PlayError,
  PlayLabel,
  inputClass,
} from "@/components/play/play-ui";

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

function NicknameField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-200">
        Nickname của bạn
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={NICKNAME_MAX_LENGTH}
        autoComplete="nickname"
        enterKeyHint="go"
        placeholder="VD: Vy, Nam, An"
        className={inputClass}
      />
      <p className="text-xs text-zinc-500">1–20 ký tự. Không cần tài khoản.</p>
    </div>
  );
}

type Step = "choose" | "create" | "join";

/**
 * Màn vào game (spec 2.3): [Tạo phòng] / [Vào phòng], nickname, [Tiếp tục phòng cũ].
 * Có `?room=<CODE>` (QR động) thì vào thẳng bước nickname.
 */
export function PlayEntry({
  caseId,
  caseTitle,
}: {
  caseId: string;
  caseTitle: string;
}) {
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
  const [nickname, setNickname] = useState(savedNickname);
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [code, setCode] = useState(pendingRoomCode ?? "");
  const [error, setError] = useState<string | null>(null);

  // `?room=` được provider đọc sau lần render đầu: chuyển thẳng sang bước nickname.
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
    if (!nick) return setError("Nhập nickname 1–20 ký tự.");
    rememberNickname(nick);
    const res = await createRoom({ caseId, maxPlayers, nickname: nick });
    if (!res.success) setError(res.error ?? "Không tạo được phòng.");
  };

  const submitJoin = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeRoomCode(code);
    if (!normalized) return setError("Mã phòng gồm 4 ký tự.");
    const nick = cleanNickname(nickname);
    if (!nick) return setError("Nhập nickname 1–20 ký tự.");
    rememberNickname(nick);
    const res = await joinRoom(normalized, nick);
    if (!res.success) setError(res.error ?? "Không vào được phòng.");
  };

  return (
    <>
      <header className="space-y-1">
        <PlayLabel>Hồ sơ vụ án</PlayLabel>
        <h1 className="text-2xl font-bold leading-tight text-zinc-50">
          {caseTitle}
        </h1>
      </header>

      <PlayError>{exitMessage}</PlayError>

      {step === "choose" && (
        <div className="flex flex-col gap-3">
          <PlayCard className="space-y-3">
            <PlayButton className="w-full" onClick={() => go("create")}>
              <Users className="size-4" aria-hidden />
              Tạo phòng
            </PlayButton>
            <p className="text-xs leading-relaxed text-zinc-400">
              Chỉ 1 người trong nhóm tạo phòng, những người khác chọn Vào phòng.
            </p>
            <PlayButton
              variant="secondary"
              className="w-full"
              onClick={() => go("join")}
            >
              <DoorOpen className="size-4" aria-hidden />
              Vào phòng
            </PlayButton>
          </PlayCard>

          {oldRooms.length > 0 && (
            <PlayCard className="space-y-2">
              <PlayLabel>Tiếp tục phòng cũ</PlayLabel>
              <ul className="space-y-2">
                {oldRooms.slice(0, 5).map((s) => (
                  <li key={s.roomId}>
                    <PlayButton
                      variant="secondary"
                      className="w-full justify-between"
                      disabled={isConnecting}
                      onClick={async () => {
                        setError(null);
                        const res = await resumeRoom(s.roomId);
                        if (!res.success)
                          setError(res.error ?? "Không mở lại được phòng.");
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <History className="size-4" aria-hidden />
                        {s.nickname}
                      </span>
                      <span className="flex flex-col items-end text-xs text-zinc-400">
                        <span className="font-mono">
                          {s.code ?? "mã mới khi mở lại"}
                        </span>
                        {s.unranked && (
                          <span className="text-amber-300">
                            Không tính xếp hạng
                          </span>
                        )}
                      </span>
                    </PlayButton>
                  </li>
                ))}
              </ul>
            </PlayCard>
          )}

          <Link
            href={`/evidence/web?case_id=${caseId}`}
            className="self-center py-3 text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Chơi một mình (không qua phòng)
          </Link>
          <Link
            href={`/buy/${caseId}`}
            className="self-center py-3 text-sm text-amber-400/80 underline-offset-4 hover:text-amber-300 hover:underline"
          >
            Mua vụ án
          </Link>
        </div>
      )}

      {step === "create" && (
        <form onSubmit={submitCreate} className="flex flex-col gap-4">
          <PlayCard className="space-y-4">
            <NicknameField
              id="create-nick"
              value={nickname}
              onChange={setNickname}
            />
            <div className="space-y-1.5">
              <div id="max-label" className="text-sm font-medium text-zinc-200">
                Số người tối đa
              </div>
              <div
                className="flex items-center gap-3"
                role="group"
                aria-labelledby="max-label"
              >
                <PlayButton
                  variant="secondary"
                  aria-label="Giảm số người"
                  onClick={() => setMaxPlayers((n) => Math.max(1, n - 1))}
                  className="w-11 px-0"
                >
                  <Minus className="size-4" />
                </PlayButton>
                <output className="min-w-10 text-center font-mono text-2xl font-bold">
                  {maxPlayers}
                </output>
                <PlayButton
                  variant="secondary"
                  aria-label="Tăng số người"
                  onClick={() => setMaxPlayers((n) => Math.min(99, n + 1))}
                  className="w-11 px-0"
                >
                  <Plus className="size-4" />
                </PlayButton>
              </div>
              <p className="text-xs text-zinc-500">Sửa được trong phòng chờ.</p>
            </div>
          </PlayCard>
          <PlayError>{error}</PlayError>
          <PlayButton type="submit" disabled={isConnecting} className="w-full">
            {isConnecting ? "Đang tạo phòng…" : "Tạo phòng"}
          </PlayButton>
          <PlayButton variant="ghost" onClick={() => go("choose")}>
            <ArrowLeft className="size-4" aria-hidden />
            Quay lại
          </PlayButton>
        </form>
      )}

      {step === "join" && (
        <form onSubmit={submitJoin} className="flex flex-col gap-4">
          <PlayCard className="space-y-4">
            {pendingRoomCode ? (
              <div>
                <PlayLabel>Mã phòng</PlayLabel>
                <div className="font-mono text-3xl font-extrabold tracking-[0.3em]">
                  {pendingRoomCode}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="join-code"
                  className="text-sm font-medium text-zinc-200"
                >
                  Mã phòng
                </label>
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
                  placeholder="4 ký tự"
                  className={`${inputClass} font-mono text-2xl font-bold uppercase tracking-[0.3em]`}
                />
              </div>
            )}
            <NicknameField
              id="join-nick"
              value={nickname}
              onChange={setNickname}
            />
          </PlayCard>
          <PlayError>{error}</PlayError>
          <PlayButton type="submit" disabled={isConnecting} className="w-full">
            {isConnecting ? "Đang vào phòng…" : "Vào phòng"}
          </PlayButton>
          {!pendingRoomCode && (
            <PlayButton variant="ghost" onClick={() => go("choose")}>
              <ArrowLeft className="size-4" aria-hidden />
              Quay lại
            </PlayButton>
          )}
        </form>
      )}
    </>
  );
}
