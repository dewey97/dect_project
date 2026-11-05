"use client";

import type { RoomSnapshot } from "@/lib/types/room";

/**
 * Phía client của chơi nhóm v3: lưu phiên phòng trên thiết bị và gọi `/api/rooms/*`.
 * Token gốc chỉ nằm ở localStorage của thiết bị (spec 8.1).
 */

export interface StoredRoomSession {
  roomId: string;
  token: string;
  code: string | null;
  caseId: string;
  nickname: string;
  /** Q12: phòng đã mất xếp hạng (lần cuối thiết bị biết). */
  unranked?: boolean;
  updatedAt: number;
}

const SESSIONS_KEY = "dect_room_sessions";
const MAX_SESSIONS = 20;

export function readRoomSessions(): StoredRoomSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return (parsed as StoredRoomSession[])
      .filter(
        (s) => s && typeof s.roomId === "string" && typeof s.token === "string",
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function writeRoomSessions(list: StoredRoomSession[]): void {
  try {
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify(list.slice(0, MAX_SESSIONS)),
    );
  } catch {
    // localStorage đầy hoặc bị chặn: phiên chỉ sống trong tab này.
  }
}

export function saveRoomSession(
  token: string,
  snapshot: RoomSnapshot,
): StoredRoomSession {
  const session: StoredRoomSession = {
    roomId: snapshot.room.id,
    token,
    code: snapshot.room.code,
    caseId: snapshot.room.caseId,
    nickname: snapshot.me.nickname,
    unranked: !!snapshot.room.unrankedAt,
    updatedAt: Date.now(),
  };
  writeRoomSessions([
    session,
    ...readRoomSessions().filter((s) => s.roomId !== session.roomId),
  ]);
  return session;
}

export function removeRoomSession(roomId: string): void {
  writeRoomSessions(readRoomSessions().filter((s) => s.roomId !== roomId));
}

export function findSessionByCode(code: string): StoredRoomSession | undefined {
  return readRoomSessions().find((s) => s.code === code);
}

/** Link mời vào phòng (QR động, nút chia sẻ). */
export function roomInviteUrl(caseId: string, code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/play/${encodeURIComponent(caseId)}?room=${encodeURIComponent(code)}`;
}

export interface RoomApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  code: string | null;
}

export async function roomApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    token?: string | null;
    body?: unknown;
    clientId?: string;
  } = {},
): Promise<RoomApiResult<T>> {
  try {
    const res = await fetch(`/api/rooms/${path}`, {
      method: options.method ?? "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.clientId ? { "x-room-client": options.clientId } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const json = (await res.json().catch(() => null)) as
      (T & { error?: string; code?: string }) | null;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: json?.error ?? "Không kết nối được máy chủ.",
        code: json?.code ?? null,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: json,
      error: null,
      code: null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Mất kết nối mạng. Thử lại.",
      code: "NETWORK",
    };
  }
}
