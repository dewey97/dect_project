import type { RoomPhase } from "../types/room";

/** Thứ tự phase (spec 2.1). Giữ đồng bộ với ROOM_PHASES trong lib/types/room.ts. */
const ORDER: readonly RoomPhase[] = [
  "lobby",
  "intro_scene",
  "intro_handover",
  "investigating",
  "epilogue",
];

export function isRoomPhase(value: unknown): value is RoomPhase {
  return (
    typeof value === "string" && (ORDER as readonly string[]).includes(value)
  );
}

/**
 * Phase kế tiếp: bối cảnh ban đầu nằm ngay trong phòng chờ, nên
 * lobby -> investigating. intro_scene / intro_handover chỉ còn cho phòng cũ
 * đang dừng ở đó; từ đó cũng đi thẳng sang investigating.
 */
export function nextPhase(phase: RoomPhase): RoomPhase | null {
  if (phase === "lobby") return "investigating";
  if (phase === "intro_scene" || phase === "intro_handover") return "investigating";
  return null;
}

/**
 * Phase Host được tự chuyển qua `/api/rooms/phase`.
 * `investigating → epilogue` chỉ đi qua `/api/rooms/conclusion`.
 */
export function hostCanAdvance(from: RoomPhase): boolean {
  return (
    from === "lobby" || from === "intro_scene" || from === "intro_handover"
  );
}
