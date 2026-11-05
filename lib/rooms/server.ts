import "server-only";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  GameRoomRow,
  PublicParticipant,
  PublicRoom,
  PublicRoomEvent,
  RoomBroadcastEvent,
  RoomBroadcastPayload,
  RoomEventRow,
  RoomEventType,
  RoomParticipantRow,
  RoomSnapshot,
} from "@/lib/types/room";
import { generateRoomCode } from "@/lib/rooms/code";
import { normalizeRoomState } from "@/lib/rooms/merge";
import { isSeated } from "@/lib/rooms/host";
import { shouldMarkUnranked } from "@/lib/rooms/ranking";

/**
 * Helper dùng chung cho Route Handler `/api/rooms/*` (server-only, service role).
 * Spec: docs/architecture/group_play_realtime.md Phần 5.
 */

export type Db = SupabaseClient;

export function getDb(): Db {
  return createAdminClient();
}

// ---------------------------------------------------------------------------
// Lỗi và response
// ---------------------------------------------------------------------------

export class RoomError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export function roomJson(data: unknown, status = 200): NextResponse {
  const res = NextResponse.json(data, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export function roomErrorResponse(err: unknown): NextResponse {
  if (err instanceof RoomError) {
    const res = roomJson(
      { error: err.message, code: err.code, ...err.extra },
      err.status,
    );
    const retry = err.extra?.retryAfter;
    if (typeof retry === "number")
      res.headers.set("Retry-After", String(retry));
    return res;
  }
  console.error("[rooms] unexpected error:", err);
  return roomJson(
    { error: "Lỗi máy chủ, thử lại sau.", code: "SERVER_ERROR" },
    500,
  );
}

const MAX_BODY_BYTES = 300_000;

export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new RoomError(413, "PAYLOAD_TOO_LARGE", "Dữ liệu gửi lên quá lớn.");
  }
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  throw new RoomError(400, "BAD_REQUEST", "Dữ liệu không hợp lệ.");
}

/** Map lỗi RPC (MESSAGE cố định trong migration 51) sang RoomError. */
export function mapRpcError(
  err: { message?: string; code?: string } | null,
): RoomError | null {
  if (!err) return null;
  const msg = err.message ?? "";
  if (msg.includes("ROOM_NOT_FOUND"))
    return new RoomError(
      404,
      "ROOM_NOT_FOUND",
      "Không tìm thấy phòng. Kiểm tra lại mã.",
    );
  if (msg.includes("ROOM_FULL"))
    return new RoomError(409, "ROOM_FULL", "Phòng đã đủ người.");
  if (msg.includes("KICKED"))
    return new RoomError(403, "KICKED", "Bạn đã bị mời ra khỏi phòng này.");
  if (msg.includes("INVALID_NICKNAME"))
    return new RoomError(400, "INVALID_NICKNAME", "Nickname cần 1–20 ký tự.");
  if (msg.includes("INVALID_MAX_PLAYERS"))
    return new RoomError(
      400,
      "INVALID_MAX_PLAYERS",
      "Số người tối đa không hợp lệ.",
    );
  return null;
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function newRoomCode(): string {
  return generateRoomCode((max) => randomInt(max));
}

function readBearer(request: Request): string | null {
  const auth = request.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+([A-Za-z0-9_-]{20,128})$/);
  return m ? m[1] : null;
}

/** `x-room-client`: id phiên tab của client, dùng cho echo guard. */
export function readClientId(request: Request): string | null {
  const v = request.headers.get("x-room-client");
  return v && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : null;
}

export interface ParticipantContext {
  db: Db;
  participant: RoomParticipantRow;
  room: GameRoomRow;
  senderId: string | null;
}

/**
 * Xác thực participant token. Mặc định yêu cầu đang giữ chỗ (chưa rời, chưa bị kick)
 * và phòng chưa bị xóa.
 */
export async function requireParticipant(
  request: Request,
  opts: { allowLeft?: boolean } = {},
): Promise<ParticipantContext> {
  const token = readBearer(request);
  if (!token)
    throw new RoomError(401, "NO_TOKEN", "Thiếu mã thiết bị. Vào lại phòng.");
  const db = getDb();

  const { data: participant, error } = await db
    .from("room_participants")
    .select("*")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!participant)
    throw new RoomError(
      401,
      "INVALID_TOKEN",
      "Phiên không còn hợp lệ. Vào lại phòng.",
    );

  const p = participant as RoomParticipantRow;
  if (p.kicked)
    throw new RoomError(403, "KICKED", "Bạn đã bị mời ra khỏi phòng này.");
  if (p.left_at && !opts.allowLeft) {
    throw new RoomError(
      410,
      "LEFT",
      "Bạn đã rời phòng. Vào lại bằng mã phòng.",
    );
  }

  let room = await loadRoom(db, p.room_id);
  const senderId = readClientId(request);
  // Kiểm khoảng trống TRƯỚC khi ghi nhận hoạt động của người gọi (Q12).
  room = await markUnrankedIfIdle(db, room, senderId);
  const participantNow = await touchParticipant(db, p);
  return { db, participant: participantNow, room, senderId };
}

const TOUCH_MIN_MS = 15_000;

/**
 * Ghi nhận hoạt động của participant (`last_seen_at`): dùng cho tự chuyển Host (D1)
 * và quy tắc không xếp hạng (Q12). Mọi route có token đều gọi qua đây.
 * Bỏ qua nếu vừa ghi trong 15 giây, để heartbeat không ghi DB liên tục.
 */
export async function touchParticipant(
  db: Db,
  p: RoomParticipantRow,
): Promise<RoomParticipantRow> {
  if (Date.now() - Date.parse(p.last_seen_at) <= TOUCH_MIN_MS) return p;
  const now = new Date().toISOString();
  const { error } = await db
    .from("room_participants")
    .update({ last_seen_at: now })
    .eq("id", p.id);
  if (error) throw error;
  return { ...p, last_seen_at: now };
}

/**
 * Q12: sau `started_at`, cả phòng vắng quá 15 phút thì ghi `unranked_at` (một lần,
 * không gỡ) và báo cả phòng. Chỉ áp dụng khi phòng đang chơi (`investigating`,
 * chưa có `ended_at`). `excludeParticipantId`: người vừa được ghi nhận hoạt động
 * trong chính request này (join) thì không tính.
 */
export async function markUnrankedIfIdle(
  db: Db,
  room: GameRoomRow,
  senderId: string | null,
  excludeParticipantId?: string,
): Promise<GameRoomRow> {
  if (!room.started_at || room.ended_at || room.unranked_at) return room;
  const { data, error } = await db
    .from("room_participants")
    .select("id, last_seen_at")
    .eq("room_id", room.id);
  if (error) throw error;
  const lastSeenAt = ((data ?? []) as { id: string; last_seen_at: string }[])
    .filter((r) => r.id !== excludeParticipantId)
    .map((r) => r.last_seen_at);
  if (
    !shouldMarkUnranked({
      startedAt: room.started_at,
      unrankedAt: room.unranked_at,
      lastSeenAt,
      now: Date.now(),
    })
  ) {
    return room;
  }

  const now = new Date().toISOString();
  const { data: updated, error: upErr } = await db
    .from("game_rooms")
    .update({ unranked_at: now, version: room.version + 1, updated_at: now })
    .eq("id", room.id)
    .eq("version", room.version)
    .is("unranked_at", null)
    .select("*")
    .maybeSingle();
  if (upErr) throw upErr;
  // Không có dòng: request khác vừa ghi trước (version đổi). Đọc lại là đủ.
  const next = (updated as GameRoomRow | null) ?? (await loadRoom(db, room.id));
  if (updated) {
    await broadcastRoom(room.id, [
      {
        event: "MEMBER_UPDATE",
        payload: { senderId, version: next.version, room: toPublicRoom(next) },
      },
    ]);
  }
  return next;
}

export async function loadRoom(db: Db, roomId: string): Promise<GameRoomRow> {
  const { data, error } = await db
    .from("game_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new RoomError(404, "ROOM_NOT_FOUND", "Phòng không còn tồn tại.");
  return data as GameRoomRow;
}

export async function loadParticipants(
  db: Db,
  roomId: string,
): Promise<RoomParticipantRow[]> {
  const { data, error } = await db
    .from("room_participants")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RoomParticipantRow[];
}

export function requireHost(ctx: ParticipantContext): void {
  if (ctx.room.host_participant_id !== ctx.participant.id) {
    throw new RoomError(403, "NOT_HOST", "Chỉ Host được làm thao tác này.");
  }
}

export function requireActive(room: GameRoomRow): void {
  if (room.status !== "active") {
    throw new RoomError(409, "ROOM_NOT_ACTIVE", "Phòng không còn hoạt động.");
  }
}

// ---------------------------------------------------------------------------
// Ghi game_rooms không race: compare-and-swap theo version
// ---------------------------------------------------------------------------

/**
 * `mutate` nhận dòng mới nhất, trả các cột cần đổi (hoặc ném RoomError).
 * Ghi kèm điều kiện `version` cũ; lệch version thì đọc lại và thử lại.
 */
export async function updateRoomCas(
  db: Db,
  room: GameRoomRow,
  mutate: (current: GameRoomRow) => Partial<GameRoomRow>,
  maxAttempts = 4,
): Promise<GameRoomRow> {
  let current = room;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const changes = mutate(current);
    const now = new Date().toISOString();
    const { data, error } = await db
      .from("game_rooms")
      .update({
        ...changes,
        version: current.version + 1,
        updated_at: now,
        last_activity_at: now,
      })
      .eq("id", current.id)
      .eq("version", current.version)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (data) return data as GameRoomRow;
    current = await loadRoom(db, current.id);
  }
  throw new RoomError(409, "BUSY", "Phòng đang bận, thử lại.");
}

/** Cấp mã mới cho phòng (kích hoạt lại phòng dormant). Thử tối đa 5 mã. */
export async function reactivateWithNewCode(
  db: Db,
  room: GameRoomRow,
): Promise<GameRoomRow> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const now = new Date().toISOString();
    const { data, error } = await db
      .from("game_rooms")
      .update({
        status: "active",
        room_code: newRoomCode(),
        version: room.version + 1,
        updated_at: now,
        last_activity_at: now,
      })
      .eq("id", room.id)
      .eq("status", "dormant")
      .select("*")
      .maybeSingle();
    if (error) {
      if (error.code === "23505") continue; // mã trùng phòng active khác
      throw error;
    }
    if (data) return data as GameRoomRow;
    return loadRoom(db, room.id); // đã có thiết bị khác kích hoạt lại
  }
  throw new RoomError(503, "NO_CODE", "Không cấp được mã phòng, thử lại.");
}

// ---------------------------------------------------------------------------
// Chuyển đổi sang dữ liệu public
// ---------------------------------------------------------------------------

export function toPublicRoom(r: GameRoomRow): PublicRoom {
  return {
    id: r.id,
    code: r.room_code,
    caseId: r.game_id,
    mode: r.mode,
    status: r.status,
    phase: r.phase,
    phaseChangedAt: r.phase_changed_at,
    maxPlayers: r.max_players,
    hostParticipantId: r.host_participant_id,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    unrankedAt: r.unranked_at ?? null,
    version: r.version,
  };
}

export function toPublicParticipant(
  p: RoomParticipantRow,
  hostId: string | null,
): PublicParticipant {
  return {
    id: p.id,
    nickname: p.nickname,
    joinedAt: p.joined_at,
    enteredAt: p.entered_at,
    isHost: p.id === hostId,
  };
}

export function toPublicEvent(e: RoomEventRow): PublicRoomEvent {
  return {
    id: e.id,
    type: e.type,
    actorParticipantId: e.actor_participant_id,
    targetRef: e.target_ref,
    message: e.message,
    createdAt: e.created_at,
  };
}

export function seatedPublic(
  participants: RoomParticipantRow[],
  hostId: string | null,
): PublicParticipant[] {
  return participants
    .filter(isSeated)
    .map((p) => toPublicParticipant(p, hostId));
}

const SNAPSHOT_EVENT_LIMIT = 50;

export async function buildSnapshot(
  db: Db,
  room: GameRoomRow,
  me: RoomParticipantRow,
  sinceEventId?: number,
): Promise<RoomSnapshot> {
  const participants = await loadParticipants(db, room.id);
  let query = db
    .from("room_events")
    .select("*")
    .eq("room_id", room.id)
    .order("id", { ascending: false })
    .limit(SNAPSHOT_EVENT_LIMIT);
  if (sinceEventId && sinceEventId > 0) query = query.gt("id", sinceEventId);
  const { data: events, error } = await query;
  if (error) throw error;

  const fresh = participants.find((p) => p.id === me.id) ?? me;
  return {
    room: toPublicRoom(room),
    state: normalizeRoomState(room.state_json),
    participants: seatedPublic(participants, room.host_participant_id),
    events: ((events ?? []) as RoomEventRow[]).reverse().map(toPublicEvent),
    me: toPublicParticipant(fresh, room.host_participant_id),
    serverTime: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// room_events + broadcast
// ---------------------------------------------------------------------------

export async function addEvents(
  db: Db,
  roomId: string,
  items: {
    actorId: string | null;
    type: RoomEventType;
    message: string;
    targetRef?: string | null;
  }[],
): Promise<PublicRoomEvent[]> {
  if (items.length === 0) return [];
  const { data, error } = await db
    .from("room_events")
    .insert(
      items.map((i) => ({
        room_id: roomId,
        actor_participant_id: i.actorId,
        type: i.type,
        message: i.message,
        target_ref: i.targetRef ?? null,
      })),
    )
    .select("*");
  if (error) {
    // Thông báo không được làm hỏng thao tác chính.
    console.error("[rooms] insert room_events failed:", error);
    return [];
  }
  return ((data ?? []) as RoomEventRow[])
    .sort((a, b) => a.id - b.id)
    .map(toPublicEvent);
}

/**
 * Broadcast qua Realtime REST API sau khi DB đã ghi xong (spec 5.2).
 * Lỗi broadcast không làm hỏng request: client tự catch-up theo version.
 */
export async function broadcastRoom(
  roomId: string,
  messages: { event: RoomBroadcastEvent; payload: RoomBroadcastPayload }[],
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || messages.length === 0) return;
  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          topic: `room:${roomId}`,
          event: m.event,
          payload: m.payload,
          private: false,
        })),
      }),
      cache: "no-store",
    });
    if (!res.ok)
      console.error("[rooms] broadcast failed:", res.status, await res.text());
  } catch (err) {
    console.error("[rooms] broadcast error:", err);
  }
}

/** Gửi MEMBER_UPDATE (+ ROOM_EVENT nếu có) với danh sách thành viên mới nhất. */
export async function broadcastMembers(
  db: Db,
  room: GameRoomRow,
  senderId: string | null,
  events: PublicRoomEvent[],
  extra: Partial<RoomBroadcastPayload> = {},
): Promise<void> {
  const participants = await loadParticipants(db, room.id);
  const base = { senderId, version: room.version };
  await broadcastRoom(room.id, [
    {
      event: "MEMBER_UPDATE",
      payload: {
        ...base,
        room: toPublicRoom(room),
        participants: seatedPublic(participants, room.host_participant_id),
        ...extra,
      },
    },
    ...(events.length > 0
      ? [{ event: "ROOM_EVENT" as const, payload: { ...base, events } }]
      : []),
  ]);
}
