import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { cleanNickname } from "@/lib/rooms/nickname";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import {
  RoomError,
  buildSnapshot,
  getDb,
  mapRpcError,
  newRoomCode,
  newToken,
  readBody,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";
import type { GameRoomRow, RoomParticipantRow } from "@/lib/types/room";
import { createClient } from "@/lib/supabase/server";
import {
  getOwnership,
  isPlayGatingEnabled,
  ownsCase,
} from "@/lib/payments/ownership";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_CODE_ATTEMPTS = 5;

/**
 * Tạo phòng, người gọi thành Host. Body: { caseId, maxPlayers, nickname, mode? }.
 * Khi bật PLAY_GATING_ENABLED: Host phải sở hữu vụ án. Có hộp thì tạo miễn phí
 * (mode box); chỉ có bản online thì trừ 1 lượt nhóm (mode online), hoàn lượt
 * nếu tạo phòng lỗi.
 */
export async function POST(request: Request) {
  let refundCredit: (() => PromiseLike<unknown>) | null = null;
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`room_create:${ip}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      throw new RoomError(
        429,
        "RATE_LIMITED",
        "Tạo phòng quá nhanh, thử lại sau.",
        {
          retryAfter: rate.retryAfterSeconds,
        },
      );
    }

    const body = await readBody(request);
    const rawCase = typeof body.caseId === "string" ? body.caseId : "";
    if (!isValidCaseId(rawCase)) {
      throw new RoomError(400, "INVALID_CASE", "Vụ án không hợp lệ.");
    }
    const caseId = normalizeCaseId(rawCase);
    const maxPlayers = Number(body.maxPlayers);
    if (!Number.isInteger(maxPlayers) || maxPlayers < 1 || maxPlayers > 99) {
      throw new RoomError(
        400,
        "INVALID_MAX_PLAYERS",
        "Số người tối đa từ 1 đến 99.",
      );
    }
    const nickname = cleanNickname(body.nickname);
    if (!nickname)
      throw new RoomError(400, "INVALID_NICKNAME", "Nickname cần 1–20 ký tự.");
    let mode = body.mode === "online" ? "online" : "box";

    const db = getDb();
    const { data: caseRow, error: caseErr } = await db
      .from("cases")
      .select("slug")
      .eq("slug", caseId)
      .maybeSingle();
    if (caseErr) throw caseErr;
    if (!caseRow)
      throw new RoomError(404, "CASE_NOT_FOUND", "Không tìm thấy vụ án.");

    if (isPlayGatingEnabled()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const ownership = await getOwnership(user?.id, caseId);
      if (!user || !ownsCase(ownership)) {
        throw new RoomError(
          403,
          "NOT_OWNED",
          "Cần mua vụ án hoặc kích hoạt hộp để tạo phòng.",
        );
      }
      if (ownership.box) {
        mode = "box";
      } else {
        const { data: left, error: creditErr } = await db.rpc(
          "license_use_group_credit",
          { p_user_id: user.id, p_case_id: caseId },
        );
        if (creditErr) throw creditErr;
        if (typeof left !== "number" || left < 0) {
          throw new RoomError(
            402,
            "NO_GROUP_CREDITS",
            "Hết lượt tạo phòng nhóm. Mua thêm lượt hoặc chơi một mình.",
          );
        }
        mode = "online";
        const userId = user.id;
        refundCredit = () =>
          db.rpc("license_refund_group_credit", {
            p_user_id: userId,
            p_case_id: caseId,
          });
      }
    }

    const { token, hash } = newToken();
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const { data, error } = await db.rpc("room_create", {
        p_game_id: caseId,
        p_mode: mode,
        p_max_players: maxPlayers,
        p_room_code: newRoomCode(),
        p_nickname: nickname,
        p_token_hash: hash,
      });
      if (error) {
        // Mã trùng một phòng active khác: sinh mã mới.
        if (
          error.code === "23505" &&
          error.message.includes("idx_game_rooms_active_code")
        )
          continue;
        throw mapRpcError(error) ?? error;
      }
      const result = data as {
        room: GameRoomRow;
        participant: RoomParticipantRow;
      };
      refundCredit = null; // the room exists: the credit is spent
      const snapshot = await buildSnapshot(db, result.room, result.participant);
      return roomJson({ token, snapshot }, 201);
    }
    throw new RoomError(503, "NO_CODE", "Không cấp được mã phòng, thử lại.");
  } catch (err) {
    if (refundCredit) {
      try {
        await refundCredit();
      } catch (refundErr) {
        console.error("[ROOM CREATE] credit refund failed:", refundErr);
      }
    }
    return roomErrorResponse(err);
  }
}
