import { eventMessage } from "@/lib/rooms/messages";
import {
  RoomError,
  addEvents,
  broadcastMembers,
  buildSnapshot,
  requireActive,
  requireParticipant,
  roomErrorResponse,
  roomJson,
} from "@/lib/rooms/server";
import type { RoomParticipantRow } from "@/lib/types/room";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Người vào muộn bấm [Vào cuộc]: ghi entered_at, báo cả phòng (spec 2.4). */
export async function POST(request: Request) {
  try {
    const ctx = await requireParticipant(request);
    const { db, room, senderId } = ctx;
    requireActive(room);
    if (room.phase === "lobby") {
      throw new RoomError(409, "NOT_STARTED", "Phòng chưa bắt đầu, chờ Host.");
    }

    let me = ctx.participant;
    if (!me.entered_at) {
      const now = new Date().toISOString();
      const { data, error } = await db
        .from("room_participants")
        .update({ entered_at: now, last_seen_at: now })
        .eq("id", me.id)
        .is("entered_at", null)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (data) {
        me = data as RoomParticipantRow;
        const events = await addEvents(db, room.id, [
          {
            actorId: me.id,
            type: "member_entered",
            message: eventMessage("member_entered", me.nickname),
          },
        ]);
        await broadcastMembers(db, room, senderId, events);
      }
    }

    return roomJson({ snapshot: await buildSnapshot(db, room, me) });
  } catch (err) {
    return roomErrorResponse(err);
  }
}
