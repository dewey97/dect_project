import { eventMessage } from "@/lib/rooms/messages";
import { pickSuccessor } from "@/lib/rooms/host";
import {
  addEvents,
  broadcastMembers,
  broadcastRoom,
  loadParticipants,
  requireParticipant,
  roomErrorResponse,
  roomJson,
  updateRoomCas,
} from "@/lib/rooms/server";
import type { PublicRoomEvent } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Bấm [Rời phòng]: giải phóng chỗ (spec 2.4).
 * Host rời: chuyển quyền cho thành viên vào sớm nhất. Không còn ai và phòng còn ở
 * lobby thì hủy phòng. Đã bắt đầu thì giữ phòng (tiến trình), chờ người vào lại.
 */
export async function POST(request: Request) {
  try {
    const {
      db,
      participant: me,
      room,
      senderId,
    } = await requireParticipant(request);
    const now = new Date().toISOString();

    const { error } = await db
      .from("room_participants")
      .update({ left_at: now, last_seen_at: now })
      .eq("id", me.id);
    if (error) throw error;

    const events: PublicRoomEvent[] = [];
    let current = room;

    if (room.host_participant_id === me.id) {
      const participants = await loadParticipants(db, room.id);
      const successor = pickSuccessor(
        participants.map((p) => (p.id === me.id ? { ...p, left_at: now } : p)),
        me.id,
      );

      if (!successor && room.phase === "lobby") {
        const { error: delErr } = await db
          .from("game_rooms")
          .delete()
          .eq("id", room.id);
        if (delErr) throw delErr;
        await broadcastRoom(room.id, [
          {
            event: "MEMBER_UPDATE",
            payload: { senderId, version: room.version, closed: true },
          },
        ]);
        return roomJson({ ok: true, closed: true });
      }

      current = await updateRoomCas(db, room, () => ({
        host_participant_id: successor,
      }));
      if (successor) {
        const newHost = participants.find((p) => p.id === successor);
        events.push(
          ...(await addEvents(db, room.id, [
            {
              actorId: successor,
              type: "host_changed",
              message: eventMessage("host_changed", me.nickname, {
                target: newHost?.nickname,
              }),
            },
          ])),
        );
      }
    }

    events.unshift(
      ...(await addEvents(db, room.id, [
        {
          actorId: me.id,
          type: "member_left",
          message: eventMessage("member_left", me.nickname),
        },
      ])),
    );
    await broadcastMembers(db, current, senderId, events);
    return roomJson({ ok: true, closed: false });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
