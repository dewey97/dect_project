import type { RoomEventType, RoomPhase } from "../types/room";

/**
 * Nội dung thông báo phòng, sinh ở server từ nickname của người làm.
 * Client không gửi text tự do vào room_events.
 */

const PHASE_LABELS: Record<RoomPhase, string> = {
  lobby: "Phòng chờ",
  intro_scene: "Cảnh mở đầu",
  intro_handover: "Bàn giao hồ sơ",
  investigating: "Đang điều tra",
  epilogue: "Hậu truyện",
};

export function phaseLabel(phase: RoomPhase): string {
  return PHASE_LABELS[phase];
}

export function eventMessage(
  type: RoomEventType,
  actor: string,
  extra?: { target?: string; phase?: RoomPhase },
): string {
  switch (type) {
    case "checkpoint_solved":
      return `${actor} đã giải xong một mục tiêu điều tra`;
    case "dossier_unlocked":
      return `${actor} đã mở khóa bộ hồ sơ mới`;
    case "phone_solved":
      return `${actor} đã bẻ khóa điện thoại`;
    case "member_joined":
      return `${actor} vừa vào phòng`;
    case "member_entered":
      return `${actor} vừa vào cuộc`;
    case "member_left":
      return `${actor} đã rời phòng`;
    case "member_kicked":
      return `${extra?.target ?? "Một thành viên"} đã bị mời ra khỏi phòng`;
    case "host_changed":
      return `${extra?.target ?? actor} là Host mới`;
    case "phase_changed":
      return `Phòng chuyển sang: ${extra?.phase ? phaseLabel(extra.phase) : "màn mới"}`;
    case "conclusion_submitted":
      return `${actor} đã nộp kết luận`;
  }
}
