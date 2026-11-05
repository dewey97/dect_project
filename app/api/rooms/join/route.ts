import { normalizeRoomCode } from "@/lib/rooms/code";
import { cleanNickname } from "@/lib/rooms/nickname";
import { JoinGuard } from "@/lib/rooms/join-guard";
import { eventMessage } from "@/lib/rooms/messages";
import { getClientIp } from "@/lib/security/rate-limiter";
import {
  RoomError,
  addEvents,
  broadcastMembers,
  buildSnapshot,
  getDb,
  hashToken,
  markUnrankedIfIdle,
  mapRpcError,
  newToken,
  readBody,
  readClientId,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";
import type { GameRoomRow, RoomParticipantRow } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Bộ đếm nhập sai theo IP, sống trong process (một container VPS).
const guard = new JoinGuard();

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

/**
 * Vào phòng bằng mã. Body: { code, nickname, token? }.
 * Mã không tồn tại thì 404, không bao giờ tạo phòng mới (spec 2.3).
 * `token`: token cũ của thiết bị cho phòng này, để nhận lại đúng người và nickname.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const blocked = guard.blockedFor(ip, Date.now());
    if (blocked > 0) {
      throw new RoomError(
        429,
        "RATE_LIMITED",
        "Nhập sai mã quá nhiều lần. Thử lại sau 5 phút.",
        {
          retryAfter: blocked,
        },
      );
    }

    const body = await readBody(request);
    const code = normalizeRoomCode(body.code);
    if (!code) {
      guard.recordFailure(ip, Date.now());
      throw new RoomError(
        404,
        "ROOM_NOT_FOUND",
        "Không tìm thấy phòng. Kiểm tra lại mã.",
      );
    }
    const existingToken =
      typeof body.token === "string" && TOKEN_PATTERN.test(body.token)
        ? body.token
        : null;
    const nickname = cleanNickname(body.nickname);
    if (!nickname && !existingToken) {
      throw new RoomError(400, "INVALID_NICKNAME", "Nickname cần 1–20 ký tự.");
    }

    const fresh = newToken();
    let token = existingToken ?? fresh.token;
    const db = getDb();
    const join = (hash: string) =>
      db.rpc("room_join", {
        p_room_code: code,
        p_nickname: nickname ?? "Thám tử",
        p_token_hash: hash,
      });
    let { data, error } = await join(
      existingToken ? hashToken(existingToken) : fresh.hash,
    );
    // Token cũ thuộc một phòng khác (unique token_hash): vào như người mới.
    if (existingToken && error?.code === "23505" && nickname) {
      token = fresh.token;
      ({ data, error } = await join(fresh.hash));
    }
    if (error) {
      const mapped = mapRpcError(error);
      if (mapped?.code === "ROOM_NOT_FOUND")
        guard.recordFailure(ip, Date.now());
      throw mapped ?? error;
    }

    const result = data as {
      room: GameRoomRow;
      participant: RoomParticipantRow;
      is_new_seat: boolean;
    };
    // Q12: người vào muộn sau một khoảng cả phòng vắng quá 15 phút. RPC vừa ghi
    // last_seen_at của chính người này, nên không tính họ khi đo khoảng trống.
    result.room = await markUnrankedIfIdle(
      db,
      result.room,
      readClientId(request),
      result.participant.id,
    );
    if (result.is_new_seat) {
      const events = await addEvents(db, result.room.id, [
        {
          actorId: result.participant.id,
          type: "member_joined",
          message: eventMessage("member_joined", result.participant.nickname),
        },
      ]);
      await broadcastMembers(db, result.room, readClientId(request), events);
    }

    const snapshot = await buildSnapshot(db, result.room, result.participant);
    return roomJson({ token, snapshot });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
