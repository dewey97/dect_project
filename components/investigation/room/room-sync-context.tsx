"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type {
  DetectivePing,
  PublicParticipant,
  PublicRoom,
  PublicRoomEvent,
  RoomBroadcastPayload,
  RoomInvestigationState,
  RoomMember,
  RoomPhase,
  RoomSnapshot,
} from "@/lib/types/room";
import { DEFAULT_ROOM_STATE } from "@/lib/types/room";
import {
  mergeRoomState,
  normalizeRoomState,
  sanitizeProgressPatch,
  type ProgressPatch,
} from "@/lib/rooms/merge";
import { normalizeRoomCode } from "@/lib/rooms/code";
import {
  findSessionByCode,
  readRoomSessions,
  setSavedRoom,
  removeRoomSession,
  roomApi,
  saveRoomSession,
  type RoomApiResult,
  type StoredRoomSession,
} from "@/lib/rooms/client";
import { clearStorageScope, setStorageScope } from "@/lib/investigation/storage";
import { RoomToastStack } from "@/components/investigation/room/room-notifications";

/**
 * Chơi nhóm v3 (spec docs/architecture/group_play_realtime.md).
 *
 * - Mọi thao tác ghi đi qua `/api/rooms/*` bằng participant token. Client không đọc,
 *   không ghi `game_rooms` trực tiếp.
 * - Kênh realtime `room:<room_id>`: server broadcast PHASE_CHANGE, PROGRESS_UPDATE,
 *   MEMBER_UPDATE, HOST_CHANGE, ROOM_EVENT. Client chỉ tự gửi DETECTIVE_PING
 *   (và CURSOR của live cursor #12 qua `channel`).
 * - Presence chỉ mang `{ pid, nickname, readPhase }`. Không email, không userId.
 * - Catch-up theo `version` khi tab active lại, khi có mạng lại và mỗi 30 giây.
 */

export interface ToastNotice {
  id: string;
  actorName: string;
  actionText: string;
  timestamp: number;
  /** Sự kiện phòng gắn với toast (bấm để mở nội dung). */
  event?: PublicRoomEvent;
}

const MAX_TOASTS = 3;
const TOAST_MS = 4500;

export interface CurrentDetectiveUser {
  id: string;
  email?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
}

interface PresencePayload {
  pid?: string;
  nickname?: string;
  readPhase?: RoomPhase | null;
}

type ActionResult = { success: boolean; error?: string; code?: string | null };

/** Trạng thái kết thúc phiên do server quyết định (để UI báo cho người chơi). */
export type RoomExitReason =
  "kicked" | "closed" | "left_elsewhere" | "invalid" | null;

interface RoomSyncContextType {
  // ---- API giữ nguyên cho các consumer v1 ----
  /** Mã phòng đang chơi. Phòng đã kết thúc (mã đã giải phóng) vẫn trả chuỗi khác rỗng để consumer biết đang ở chế độ phòng. */
  roomCode: string | null;
  nickname: string;
  isConnected: boolean;
  isConnecting: boolean;
  roomState: RoomInvestigationState;
  /** Thành viên đang online (theo Presence). */
  members: RoomMember[];
  memberCount: number;
  currentUser: CurrentDetectiveUser | null;
  deviceId: string;
  activeToast: ToastNotice | null;
  activePing: DetectivePing | null;
  joinRoom: (code: string, nickname?: string) => Promise<ActionResult>;
  leaveRoom: () => Promise<void>;
  /** Rời phòng nhưng giữ chỗ: lưu làm phòng duy nhất để [Tiếp tục phòng cũ]. */
  saveAndExitRoom: () => void;
  syncUpdate: (
    patch: Partial<RoomInvestigationState>,
    actionText?: string,
  ) => Promise<void>;
  broadcastPing: (
    targetId: string,
    label: string,
    coords?: { x: number; y: number },
    options?: {
      targetType?: "pin" | "doc" | "evidence";
      docType?: "pdf" | "evidence";
      phase?: number;
      page?: number;
    },
  ) => void;

  // ---- v3 ----
  room: PublicRoom | null;
  roomId: string | null;
  phase: RoomPhase | null;
  version: number;
  me: PublicParticipant | null;
  isHost: boolean;
  /** Thành viên đang giữ chỗ (từ server), theo thứ tự vào phòng. */
  participants: PublicParticipant[];
  onlineIds: ReadonlySet<string>;
  /** Phase mà từng participant đã báo "đã đọc" (intro). */
  readPhaseById: Readonly<Record<string, RoomPhase | null>>;
  events: PublicRoomEvent[];
  /** Kênh realtime hiện tại (chỉ đọc), cho live cursor dùng chung. */
  channel: RealtimeChannel | null;
  /** `?room=<CODE>` trên URL mà thiết bị chưa có phiên: cần nhập nickname để vào. */
  pendingRoomCode: string | null;
  savedSessions: StoredRoomSession[];
  exitReason: RoomExitReason;
  lastError: string | null;
  createRoom: (input: {
    caseId: string;
    maxPlayers: number;
    nickname: string;
  }) => Promise<ActionResult>;
  resumeRoom: (roomId: string) => Promise<ActionResult>;
  enterRoom: () => Promise<ActionResult>;
  advancePhase: () => Promise<ActionResult>;
  hostAction: (
    action:
      | { action: "transfer"; participantId: string }
      | { action: "kick"; participantId: string }
      | { action: "max_players"; maxPlayers: number }
      | { action: "claim" },
  ) => Promise<ActionResult>;
  submitConclusion: (culprit?: string | null) => Promise<ActionResult>;
  markRead: (phase: RoomPhase) => void;
  refreshRoom: () => Promise<void>;
  clearExitReason: () => void;
}

const RoomSyncContext = createContext<RoomSyncContextType | undefined>(
  undefined,
);

const CATCH_UP_INTERVAL_MS = 30_000;
const HOST_CLAIM_AFTER_MS = 60_000;
const HOST_CLAIM_CHECK_MS = 10_000;
const HEAVY_FLUSH_MS = 500;
/** Field ghi dày (vẽ, kéo note, gõ sổ tay): gom và gửi sau 500 ms. */
const HEAVY_KEYS = ["annotations", "canvasNotes", "teamNotes"] as const;

function randomId(): string {
  return Math.random().toString(36).slice(2, 12);
}

function mergeEvents(
  prev: PublicRoomEvent[],
  incoming: PublicRoomEvent[],
): PublicRoomEvent[] {
  if (incoming.length === 0) return prev;
  const seen = new Set(prev.map((e) => e.id));
  const next = [...prev, ...incoming.filter((e) => !seen.has(e.id))];
  next.sort((a, b) => a.id - b.id);
  return next.slice(-200);
}

/** Gộp 2 patch nặng: annotations theo key, notes last-write-wins. */
function combineHeavy(a: ProgressPatch, b: ProgressPatch): ProgressPatch {
  return {
    ...a,
    ...b,
    ...(a.annotations || b.annotations
      ? { annotations: { ...(a.annotations ?? {}), ...(b.annotations ?? {}) } }
      : {}),
  };
}

function setRoomUrlParam(code: string | null): void {
  try {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("room", code);
    else url.searchParams.delete("room");
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // ignore
  }
}

/**
 * Đặt storage scope ngay ở lần render đầu, trước khi effect của các component con
 * đọc localStorage: F5 trong phòng (`?room=<CODE>` + có phiên) không được nạp
 * savegame Solo dù chỉ một khoảnh khắc.
 */
function initialStorageScope(): null {
  if (typeof window === "undefined") return null;
  try {
    const code = normalizeRoomCode(new URLSearchParams(window.location.search).get("room"));
    const session = code ? findSessionByCode(code) : undefined;
    setStorageScope(session?.roomId ?? null);
  } catch {
    // ignore
  }
  return null;
}

export function RoomSyncProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  useState(initialStorageScope);

  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [roomState, setRoomState] =
    useState<RoomInvestigationState>(DEFAULT_ROOM_STATE);
  const [participants, setParticipants] = useState<PublicParticipant[]>([]);
  const [events, setEvents] = useState<PublicRoomEvent[]>([]);
  const [me, setMe] = useState<PublicParticipant | null>(null);
  const [onlineIds, setOnlineIds] = useState<ReadonlySet<string>>(new Set());
  const [readPhaseById, setReadPhaseById] = useState<
    Record<string, RoomPhase | null>
  >({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<StoredRoomSession[]>([]);
  const [exitReason, setExitReason] = useState<RoomExitReason>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentDetectiveUser | null>(
    null,
  );
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const activeToast = toasts[toasts.length - 1] ?? null;
  const [activePing, setActivePing] = useState<DetectivePing | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [clientId, setClientId] = useState("");

  const sessionRef = useRef<StoredRoomSession | null>(null);
  const roomRef = useRef<PublicRoom | null>(null);
  const meRef = useRef<PublicParticipant | null>(null);
  const versionRef = useRef(0);
  const stateRef = useRef<RoomInvestigationState>(DEFAULT_ROOM_STATE);
  const pendingHeavyRef = useRef<ProgressPatch | null>(null);
  const heavyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientIdRef = useRef("");
  const readPhaseRef = useRef<RoomPhase | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitRef = useRef(false);

  // id phiên tab: echo guard cho broadcast của server (spec 5.2).
  useEffect(() => {
    const id = randomId();
    clientIdRef.current = id;
    setClientId(id);
    setSavedSessions(readRoomSessions());
  }, []);

  // Thông tin đăng nhập chỉ dùng hiển thị cục bộ, không bao giờ gửi cho người khác.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const u = session?.user;
        if (!alive) return;
        setCurrentUser(
          u
            ? {
                id: u.id,
                email: u.email,
                avatarUrl:
                  u.user_metadata?.avatar_url ||
                  u.user_metadata?.picture ||
                  null,
                displayName:
                  u.user_metadata?.full_name || u.user_metadata?.name || null,
              }
            : null,
        );
      } catch {
        // ignore
      }
    };
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ---------------------------------------------------------------------------
  // Toast & ping
  // ---------------------------------------------------------------------------

  const triggerToast = useCallback(
    (actorName: string, actionText: string, event?: PublicRoomEvent) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }
    const notice: ToastNotice = {
      id: randomId(),
      actorName,
      actionText,
      timestamp: Date.now(),
      event,
    };
    // Tối đa 3 toast cùng lúc (spec 2.7); toast cũ nhất nhường chỗ, vẫn còn trong chuông.
    setToasts((prev) => [...prev, notice].slice(-MAX_TOASTS));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notice.id));
    }, TOAST_MS);
  }, []);

  const triggerPing = useCallback((ping: DetectivePing) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch {
        // ignore
      }
    }
    if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
    setActivePing(ping);
    pingTimerRef.current = setTimeout(() => {
      setActivePing(null);
      pingTimerRef.current = null;
    }, 4500);
  }, []);

  const showEventToasts = useCallback(
    (incoming: PublicRoomEvent[]) => {
      const fresh = incoming.filter(
        (e) =>
          e.id > lastEventIdRef.current &&
          e.actorParticipantId !== meRef.current?.id,
      );
      for (const e of fresh.slice(-MAX_TOASTS)) triggerToast("", e.message, e);
    },
    [triggerToast],
  );

  const ingestEvents = useCallback(
    (incoming: PublicRoomEvent[], toast: boolean) => {
      if (incoming.length === 0) return;
      if (toast) showEventToasts(incoming);
      setEvents((prev) => mergeEvents(prev, incoming));
      lastEventIdRef.current = Math.max(
        lastEventIdRef.current,
        ...incoming.map((e) => e.id),
      );
    },
    [showEventToasts],
  );

  // ---------------------------------------------------------------------------
  // Áp dữ liệu server vào state
  // ---------------------------------------------------------------------------

  const applyState = useCallback((serverState: RoomInvestigationState) => {
    const pending = pendingHeavyRef.current;
    const next = pending ? mergeRoomState(serverState, pending) : serverState;
    stateRef.current = next;
    setRoomState(next);
  }, []);

  const applyRoom = useCallback((next: PublicRoom) => {
    roomRef.current = next;
    setRoom(next);
    if (
      sessionRef.current &&
      next.code &&
      sessionRef.current.code !== next.code
    ) {
      sessionRef.current = { ...sessionRef.current, code: next.code };
    }
  }, []);

  const applyParticipants = useCallback((list: PublicParticipant[]) => {
    setParticipants(list);
    const mine = meRef.current && list.find((p) => p.id === meRef.current?.id);
    if (mine) {
      meRef.current = mine;
      setMe(mine);
    }
  }, []);

  const resetRoom = useCallback(
    (reason: RoomExitReason) => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (heavyTimerRef.current) clearTimeout(heavyTimerRef.current);
      heavyTimerRef.current = null;
      pendingHeavyRef.current = null;
      sessionRef.current = null;
      roomRef.current = null;
      meRef.current = null;
      setStorageScope(null);
      versionRef.current = 0;
      lastEventIdRef.current = 0;
      readPhaseRef.current = null;
      stateRef.current = DEFAULT_ROOM_STATE;
      setChannel(null);
      setIsSubscribed(false);
      setRoom(null);
      setMe(null);
      setParticipants([]);
      setEvents([]);
      setOnlineIds(new Set());
      setReadPhaseById({});
      setRoomState(DEFAULT_ROOM_STATE);
      setExitReason(reason);
      setSavedSessions(readRoomSessions());
      if (typeof window !== "undefined") setRoomUrlParam(null);
    },
    [supabase],
  );

  // ---------------------------------------------------------------------------
  // Kênh realtime room:<id>
  // ---------------------------------------------------------------------------

  const trackPresence = useCallback(() => {
    const ch = channelRef.current;
    const mine = meRef.current;
    if (!ch || !mine) return;
    ch.track({
      pid: mine.id,
      nickname: mine.nickname,
      readPhase: readPhaseRef.current,
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(
    (roomId: string, participantId: string) => {
      if (channelRef.current) {
        if (channelRef.current.topic === `realtime:room:${roomId}`) return;
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const ch = supabase.channel(`room:${roomId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: participantId },
        },
      });

      const isEcho = (p: RoomBroadcastPayload | undefined) =>
        !!p?.senderId && p.senderId === clientIdRef.current;

      ch.on("presence", { event: "sync" }, () => {
        const state = ch.presenceState() as Record<string, PresencePayload[]>;
        const ids = new Set<string>();
        const reads: Record<string, RoomPhase | null> = {};
        for (const [key, metas] of Object.entries(state)) {
          ids.add(key);
          // track() lần sau thêm meta mới vào cuối mảng, bản cũ có thể còn: lấy bản cuối.
          reads[key] = metas?.[metas.length - 1]?.readPhase ?? null;
        }
        setOnlineIds(ids);
        setReadPhaseById(reads);
      })
        .on("broadcast", { event: "DETECTIVE_PING" }, ({ payload }) => {
          if (!payload) return;
          const ping = payload as DetectivePing;
          triggerPing(ping);
          triggerToast(
            ping.actorName || "Đồng đội",
            `đang chỉ vào: ${ping.label || "manh mối"}`,
          );
        })
        .on("broadcast", { event: "PROGRESS_UPDATE" }, ({ payload }) => {
          const p = payload as RoomBroadcastPayload;
          if (!p?.state || isEcho(p) || p.version <= versionRef.current) return;
          versionRef.current = p.version;
          applyState(normalizeRoomState(p.state));
        })
        .on("broadcast", { event: "PHASE_CHANGE" }, ({ payload }) => {
          const p = payload as RoomBroadcastPayload;
          if (!p?.room || p.version < versionRef.current) return;
          versionRef.current = Math.max(versionRef.current, p.version);
          applyRoom(p.room);
          if (p.state) applyState(normalizeRoomState(p.state));
        })
        .on("broadcast", { event: "HOST_CHANGE" }, ({ payload }) => {
          const p = payload as RoomBroadcastPayload;
          if (!p?.room || p.version < versionRef.current) return;
          versionRef.current = Math.max(versionRef.current, p.version);
          applyRoom(p.room);
        })
        .on("broadcast", { event: "MEMBER_UPDATE" }, ({ payload }) => {
          const p = payload as RoomBroadcastPayload;
          if (!p) return;
          if (p.closed) {
            if (sessionRef.current) {
              removeRoomSession(sessionRef.current.roomId);
              clearStorageScope(sessionRef.current.roomId);
            }
            resetRoom("closed");
            return;
          }
          if (
            p.kickedParticipantId &&
            p.kickedParticipantId === meRef.current?.id
          ) {
            if (sessionRef.current) {
              removeRoomSession(sessionRef.current.roomId);
              clearStorageScope(sessionRef.current.roomId);
            }
            resetRoom("kicked");
            return;
          }
          if (p.room && p.version >= versionRef.current) {
            versionRef.current = p.version;
            applyRoom(p.room);
          }
          if (p.participants) applyParticipants(p.participants);
        })
        .on("broadcast", { event: "ROOM_EVENT" }, ({ payload }) => {
          const p = payload as RoomBroadcastPayload;
          if (p?.events) ingestEvents(p.events, true);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsSubscribed(true);
            trackPresence();
          } else if (
            status === "CLOSED" ||
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            setIsSubscribed(false);
          }
        });

      channelRef.current = ch;
      setChannel(ch);
    },
    [
      supabase,
      triggerPing,
      triggerToast,
      applyState,
      applyRoom,
      applyParticipants,
      ingestEvents,
      resetRoom,
      trackPresence,
    ],
  );

  /** Nạp snapshot từ server (create / join / reconnect / state). */
  const applySnapshot = useCallback(
    (snapshot: RoomSnapshot, token?: string) => {
      const prevRoomId = roomRef.current?.id;
      const sameRoom = prevRoomId === snapshot.room.id;
      setStorageScope(snapshot.room.id);

      const sessionToken = token ?? sessionRef.current?.token;
      if (sessionToken) {
        sessionRef.current = saveRoomSession(sessionToken, snapshot);
        setSavedSessions(readRoomSessions());
      }

      meRef.current = snapshot.me;
      setMe(snapshot.me);
      if (!sameRoom || snapshot.room.version >= versionRef.current) {
        versionRef.current = snapshot.room.version;
        applyRoom(snapshot.room);
        applyState(normalizeRoomState(snapshot.state));
      }
      setParticipants(snapshot.participants);
      if (!sameRoom) {
        setEvents([]);
        lastEventIdRef.current = 0;
      }
      ingestEvents(snapshot.events, sameRoom);
      setExitReason(null);
      setPendingRoomCode(null);
      if (snapshot.room.code) setRoomUrlParam(snapshot.room.code);
      subscribe(snapshot.room.id, snapshot.me.id);
    },
    [applyRoom, applyState, ingestEvents, subscribe],
  );

  /** Xử lý lỗi phiên chung (token hết hạn, bị kick, đã rời, phòng bị xóa). */
  const handleSessionError = useCallback(
    (res: RoomApiResult<unknown>): boolean => {
      if (
        res.status === 401 ||
        res.status === 403 ||
        res.status === 410 ||
        res.status === 404
      ) {
        if (sessionRef.current) removeRoomSession(sessionRef.current.roomId);
        resetRoom(
          res.code === "KICKED"
            ? "kicked"
            : res.code === "LEFT"
              ? "left_elsewhere"
              : res.code === "ROOM_NOT_FOUND"
                ? "closed"
                : "invalid",
        );
        return true;
      }
      return false;
    },
    [resetRoom],
  );

  // ---------------------------------------------------------------------------
  // Hành động
  // ---------------------------------------------------------------------------

  const call = useCallback(
    <T,>(path: string, body?: unknown, method: "GET" | "POST" = "POST") =>
      roomApi<T>(path, {
        method,
        body,
        token: sessionRef.current?.token,
        clientId: clientIdRef.current,
      }),
    [],
  );

  const reconnectWith = useCallback(
    async (session: StoredRoomSession): Promise<ActionResult> => {
      setIsConnecting(true);
      sessionRef.current = session;
      const res = await call<{ snapshot: RoomSnapshot }>("reconnect");
      setIsConnecting(false);
      if (res.ok && res.data) {
        applySnapshot(res.data.snapshot, session.token);
        return { success: true };
      }
      if (!handleSessionError(res)) sessionRef.current = null;
      setLastError(res.error);
      return { success: false, error: res.error ?? undefined, code: res.code };
    },
    [call, applySnapshot, handleSessionError],
  );

  const createRoom = useCallback(
    async (input: { caseId: string; maxPlayers: number; nickname: string }) => {
      setIsConnecting(true);
      const res = await roomApi<{ token: string; snapshot: RoomSnapshot }>(
        "create",
        {
          body: input,
          clientId: clientIdRef.current,
        },
      );
      setIsConnecting(false);
      if (res.ok && res.data) {
        applySnapshot(res.data.snapshot, res.data.token);
        return { success: true };
      }
      setLastError(res.error);
      return { success: false, error: res.error ?? undefined, code: res.code };
    },
    [applySnapshot],
  );

  /** Vào phòng bằng mã. Không bao giờ tạo phòng mới (spec 2.3). */
  const joinRoom = useCallback(
    async (rawCode: string, nickname?: string): Promise<ActionResult> => {
      const code = normalizeRoomCode(rawCode);
      if (!code)
        return {
          success: false,
          error: "Mã phòng gồm 4 ký tự.",
          code: "INVALID_CODE",
        };
      const existing = findSessionByCode(code);
      setIsConnecting(true);
      const res = await roomApi<{ token: string; snapshot: RoomSnapshot }>(
        "join",
        {
          body: {
            code,
            nickname: nickname ?? existing?.nickname,
            token: existing?.token,
          },
          clientId: clientIdRef.current,
        },
      );
      setIsConnecting(false);
      if (res.ok && res.data) {
        applySnapshot(res.data.snapshot, res.data.token);
        return { success: true };
      }
      setLastError(res.error);
      return { success: false, error: res.error ?? undefined, code: res.code };
    },
    [applySnapshot],
  );

  const resumeRoom = useCallback(
    async (roomId: string): Promise<ActionResult> => {
      const session = readRoomSessions().find((s) => s.roomId === roomId);
      if (!session)
        return { success: false, error: "Không còn phiên của phòng này." };
      return reconnectWith(session);
    },
    [reconnectWith],
  );

  const refreshRoom = useCallback(async () => {
    if (!sessionRef.current) return;
    const res = await call<{ snapshot: RoomSnapshot }>(
      `state?since=${lastEventIdRef.current}`,
      undefined,
      "GET",
    );
    if (res.ok && res.data) {
      const snap = res.data.snapshot;
      if (snap.room.version > versionRef.current) {
        versionRef.current = snap.room.version;
        applyRoom(snap.room);
        applyState(normalizeRoomState(snap.state));
      }
      applyParticipants(snap.participants);
      ingestEvents(snap.events, true);
      return;
    }
    handleSessionError(res);
  }, [
    call,
    applyRoom,
    applyState,
    applyParticipants,
    ingestEvents,
    handleSessionError,
  ]);

  /** Chạy một thao tác trả snapshot, rồi nạp snapshot. */
  const runSnapshotAction = useCallback(
    async (path: string, body?: unknown): Promise<ActionResult> => {
      if (!sessionRef.current)
        return { success: false, error: "Chưa vào phòng." };
      const res = await call<{ snapshot: RoomSnapshot }>(path, body);
      if (res.ok && res.data) {
        applySnapshot(res.data.snapshot);
        return { success: true };
      }
      if (!handleSessionError(res)) {
        setLastError(res.error);
        // Lệch phase (người khác đã chuyển) hoặc bận: đọc lại trạng thái mới nhất.
        if (res.status === 409) await refreshRoom();
      }
      return { success: false, error: res.error ?? undefined, code: res.code };
    },
    [call, applySnapshot, handleSessionError, refreshRoom],
  );

  const enterRoom = useCallback(
    () => runSnapshotAction("enter"),
    [runSnapshotAction],
  );

  const advancePhase = useCallback(
    () => runSnapshotAction("phase", { from: roomRef.current?.phase }),
    [runSnapshotAction],
  );

  const hostAction = useCallback<RoomSyncContextType["hostAction"]>(
    (action) => runSnapshotAction("host", action),
    [runSnapshotAction],
  );

  const submitConclusion = useCallback(
    (culprit?: string | null) =>
      runSnapshotAction("conclusion", { culprit: culprit ?? null }),
    [runSnapshotAction],
  );

  const leaveRoom = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    await call("leave");
    removeRoomSession(session.roomId);
    clearStorageScope(session.roomId);
    resetRoom(null);
  }, [call, resetRoom]);

  const saveAndExitRoom = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    setSavedRoom(session.roomId);
    resetRoom(null);
  }, [resetRoom]);

  const markRead = useCallback(
    (phase: RoomPhase) => {
      if (readPhaseRef.current === phase) return;
      readPhaseRef.current = phase;
      trackPresence();
    },
    [trackPresence],
  );

  // ---------------------------------------------------------------------------
  // Ghi tiến trình
  // ---------------------------------------------------------------------------

  const sendProgress = useCallback(
    async (patch: ProgressPatch) => {
      if (!sessionRef.current || roomRef.current?.phase !== "investigating")
        return;
      const res = await call<{
        version: number;
        state: RoomInvestigationState;
      }>("progress", {
        patch,
      });
      if (res.ok && res.data) {
        if (res.data.version > versionRef.current) {
          versionRef.current = res.data.version;
          applyState(normalizeRoomState(res.data.state));
        }
        return;
      }
      if (!handleSessionError(res)) {
        console.warn("[RoomSync] progress failed:", res.status, res.error);
        await refreshRoom();
      }
    },
    [call, applyState, handleSessionError, refreshRoom],
  );

  const flushHeavy = useCallback(() => {
    if (heavyTimerRef.current) clearTimeout(heavyTimerRef.current);
    heavyTimerRef.current = null;
    const patch = pendingHeavyRef.current;
    pendingHeavyRef.current = null;
    if (patch) void sendProgress(patch);
  }, [sendProgress]);

  const syncUpdate = useCallback(
    async (rawPatch: Partial<RoomInvestigationState>, _actionText?: string) => {
      if (!sessionRef.current) return;

      // Nộp kết luận từ bảng điều tra (use-investigation-state): đi route riêng.
      if (rawPatch.indictmentSolved) {
        await submitConclusion(rawPatch.solvedCulprit ?? null);
        return;
      }

      const patch = sanitizeProgressPatch(rawPatch);
      if (!patch) return;

      // Cập nhật lạc quan tại chỗ.
      const optimistic = mergeRoomState(stateRef.current, patch);
      stateRef.current = optimistic;
      setRoomState(optimistic);

      const heavy: ProgressPatch = {};
      const light: ProgressPatch = { ...patch };
      for (const key of HEAVY_KEYS) {
        if (patch[key] !== undefined) {
          (heavy as Record<string, unknown>)[key] = patch[key];
          delete (light as Record<string, unknown>)[key];
        }
      }

      if (Object.keys(heavy).length > 0) {
        pendingHeavyRef.current = pendingHeavyRef.current
          ? combineHeavy(pendingHeavyRef.current, heavy)
          : heavy;
        if (heavyTimerRef.current) clearTimeout(heavyTimerRef.current);
        heavyTimerRef.current = setTimeout(flushHeavy, HEAVY_FLUSH_MS);
      }
      if (Object.keys(light).length > 0) await sendProgress(light);
    },
    [submitConclusion, sendProgress, flushHeavy],
  );

  const broadcastPing = useCallback<RoomSyncContextType["broadcastPing"]>(
    (targetId, label, coords, options) => {
      const ping: DetectivePing = {
        id: randomId(),
        actorName: meRef.current?.nickname ?? "Thám tử",
        targetId,
        label,
        coords,
        targetType: options?.targetType,
        docType: options?.docType,
        phase: options?.phase,
        page: options?.page,
        timestamp: Date.now(),
      };
      triggerPing(ping);
      channelRef.current?.send({
        type: "broadcast",
        event: "DETECTIVE_PING",
        payload: ping,
      });
    },
    [triggerPing],
  );

  // ---------------------------------------------------------------------------
  // Khởi động: chỉ tự kết nối khi URL có ?room=<CODE> và thiết bị có phiên của mã đó.
  // Không tự kéo người chơi Solo vào phòng cũ (spec 1.3 mục 3).
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (didInitRef.current || !clientId) return;
    didInitRef.current = true;
    try {
      const code = normalizeRoomCode(
        new URLSearchParams(window.location.search).get("room"),
      );
      if (!code) return;
      const session = findSessionByCode(code);
      if (session) void reconnectWith(session);
      else setPendingRoomCode(code);
    } catch {
      // ignore
    }
  }, [clientId, reconnectWith]);

  // Catch-up theo version + heartbeat (spec 5.4, plan D1).
  useEffect(() => {
    if (!room?.id || room.status === "completed") return;
    const onWake = () => {
      if (document.visibilityState === "visible") void refreshRoom();
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("online", onWake);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refreshRoom();
    }, CATCH_UP_INTERVAL_MS);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("online", onWake);
      clearInterval(timer);
    };
  }, [room?.id, room?.status, refreshRoom]);

  // Tự nhận quyền Host khi Host vắng Presence quá 60 giây (spec Phần 3, plan D1).
  // Chỉ thành viên online vào phòng sớm nhất gửi yêu cầu; server kiểm lại bằng
  // last_seen_at của Host, nên client không tự giành được quyền khi Host còn hoạt động.
  const hostMissingSinceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!room || room.status !== "active" || !me || !isSubscribed) return;
    const tick = () => {
      const hostId = roomRef.current?.hostParticipantId ?? null;
      const mine = meRef.current;
      if (!mine || hostId === mine.id) {
        hostMissingSinceRef.current = null;
        return;
      }
      if (hostId && onlineIds.has(hostId)) {
        hostMissingSinceRef.current = null;
        return;
      }
      const now = Date.now();
      hostMissingSinceRef.current ??= now;
      if (now - hostMissingSinceRef.current < HOST_CLAIM_AFTER_MS) return;
      const firstOnline = participants
        .filter((p) => p.id !== hostId && (p.id === mine.id || onlineIds.has(p.id)))
        .sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt))[0];
      if (firstOnline?.id === mine.id) {
        void call<{ snapshot: RoomSnapshot }>("host", { action: "claim" }).then((res) => {
          if (res.ok && res.data) applySnapshot(res.data.snapshot);
        });
        hostMissingSinceRef.current = now; // thử lại sau một chu kỳ nữa nếu server từ chối
      }
    };
    const timer = setInterval(tick, HOST_CLAIM_CHECK_MS);
    return () => clearInterval(timer);
  }, [room, me, isSubscribed, onlineIds, participants, call, applySnapshot]);

  // Gửi nốt patch nặng khi rời trang.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && pendingHeavyRef.current)
        flushHeavy();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flushHeavy]);

  useEffect(() => {
    return () => {
      if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
      if (heavyTimerRef.current) clearTimeout(heavyTimerRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [supabase]);

  // ---------------------------------------------------------------------------
  // Giá trị context
  // ---------------------------------------------------------------------------

  const members = useMemo<RoomMember[]>(
    () =>
      participants
        .filter((p) => onlineIds.has(p.id) || p.id === me?.id)
        .map((p) => ({
          key: p.id,
          nickname: p.nickname,
          joinedAt: Date.parse(p.joinedAt) || 0,
          avatarUrl: null,
          isAuthenticated: false,
        })),
    [participants, onlineIds, me?.id],
  );

  const roomCode = room ? (room.code ?? "----") : null;
  const isHost = !!room && !!me && room.hostParticipantId === me.id;

  const value = useMemo<RoomSyncContextType>(
    () => ({
      roomCode,
      nickname: me?.nickname ?? "Thám tử",
      isConnected: !!room && isSubscribed,
      isConnecting,
      roomState,
      members,
      memberCount: members.length,
      currentUser,
      deviceId: me?.id ?? "",
      activeToast,
      activePing,
      joinRoom,
      leaveRoom,
      saveAndExitRoom,
      syncUpdate,
      broadcastPing,
      room,
      roomId: room?.id ?? null,
      phase: room?.phase ?? null,
      version: room?.version ?? 0,
      me,
      isHost,
      participants,
      onlineIds,
      readPhaseById,
      events,
      channel,
      pendingRoomCode,
      savedSessions,
      exitReason,
      lastError,
      createRoom,
      resumeRoom,
      enterRoom,
      advancePhase,
      hostAction,
      submitConclusion,
      markRead,
      refreshRoom,
      clearExitReason: () => setExitReason(null),
    }),
    [
      roomCode,
      me,
      room,
      isSubscribed,
      isConnecting,
      roomState,
      members,
      currentUser,
      activeToast,
      activePing,
      joinRoom,
      leaveRoom,
      saveAndExitRoom,
      syncUpdate,
      broadcastPing,
      isHost,
      participants,
      onlineIds,
      readPhaseById,
      events,
      channel,
      pendingRoomCode,
      savedSessions,
      exitReason,
      lastError,
      createRoom,
      resumeRoom,
      enterRoom,
      advancePhase,
      hostAction,
      submitConclusion,
      markRead,
      refreshRoom,
    ],
  );

  return (
    <RoomSyncContext.Provider value={value}>
      {children}
      <RoomToastStack toasts={toasts} />
    </RoomSyncContext.Provider>
  );
}

const noop = async () => ({ success: false, error: "No Room Provider" });

const DEFAULT_ROOM_SYNC_CONTEXT: RoomSyncContextType = {
  roomCode: null,
  nickname: "Thám tử",
  isConnected: false,
  isConnecting: false,
  roomState: DEFAULT_ROOM_STATE,
  members: [],
  memberCount: 0,
  currentUser: null,
  deviceId: "",
  activeToast: null,
  activePing: null,
  joinRoom: noop,
  leaveRoom: async () => {},
  saveAndExitRoom: () => {},
  syncUpdate: async () => {},
  broadcastPing: () => {},
  room: null,
  roomId: null,
  phase: null,
  version: 0,
  me: null,
  isHost: false,
  participants: [],
  onlineIds: new Set(),
  readPhaseById: {},
  events: [],
  channel: null,
  pendingRoomCode: null,
  savedSessions: [],
  exitReason: null,
  lastError: null,
  createRoom: noop,
  resumeRoom: noop,
  enterRoom: noop,
  advancePhase: noop,
  hostAction: noop,
  submitConclusion: noop,
  markRead: () => {},
  refreshRoom: async () => {},
  clearExitReason: () => {},
};

export function useRoomSync() {
  return useContext(RoomSyncContext) ?? DEFAULT_ROOM_SYNC_CONTEXT;
}
