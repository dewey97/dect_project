export interface AnnotationStroke {
  id: string;
  tool: "pen" | "highlighter";
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

export interface CanvasStickyNote {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  createdAt: number;
  authorName?: string;
}

/** Ping sự kiện thám tử chỉ điểm - realtime broadcast */
export interface DetectivePing {
  id: string;
  actorName: string;
  targetId: string; // ID của ghim, tài liệu hoặc vật chứng được chỉ điểm
  label: string; // Nhãn hiển thị (VD: "DOC-A01", "Lời khai nhân chứng")
  targetType?: "pin" | "doc" | "evidence"; // Loại mục tiêu chỉ điểm
  docType?: "pdf" | "evidence"; // Loại tài liệu để tự động chuyển tab
  phase?: number; // Phase của tài liệu để tự mở bộ hồ sơ tương ứng
  page?: number; // Trang tài liệu (nếu có)
  /** Tọa độ chuẩn hóa trên bảng Corkboard [0..1], nếu có */
  coords?: { x: number; y: number };
  timestamp: number;
}

/**
 * Thành viên đang online (Presence). Không chứa email/userId: người lạ cùng phòng
 * chỉ thấy nickname (spec 8.2). `key` = participant id.
 */
export interface RoomMember {
  key: string;
  nickname: string;
  joinedAt: number;
  avatarUrl?: string | null;
  isAuthenticated?: boolean;
}

export interface RoomInvestigationState {
  completedCheckpoints: string[];
  phoneSolved: boolean;
  phoneInputs: Record<string, string>;
  investigatedSuspects: string[];
  solvedFollowups: string[];
  /** Bộ hồ sơ đã mở (ref chuẩn hóa, xem lib/progress/case-progress.ts). */
  unlockedDossiers?: string[];
  reinvestigateOpened: boolean;
  indictmentSolved: boolean;
  solvedCulprit: string | null;
  annotations?: Record<string, AnnotationStroke[]>;
  teamNotes?: string;
  canvasNotes?: CanvasStickyNote[];
  lastAction?: {
    by?: string;
    text: string;
    timestamp: number;
  };
}

/** Phase màn hình của phòng (spec group_play_realtime.md 2.1), theo đúng thứ tự. */
export const ROOM_PHASES = [
  "lobby",
  "intro_scene",
  "intro_handover",
  "investigating",
  "epilogue",
] as const;
export type RoomPhase = (typeof ROOM_PHASES)[number];

/** Vòng đời lưu trữ của phòng (spec Phần 6), tách riêng với phase. */
export type RoomStatus = "active" | "dormant" | "completed";

export type RoomMode = "box" | "online";

/** Dòng `game_rooms` (migration 51). Chỉ server đọc/ghi sau migration 52. */
export interface GameRoomRow {
  id: string;
  /** NULL khi phòng không còn active (mã đã được giải phóng). */
  room_code: string | null;
  game_id: string;
  mode: RoomMode;
  status: RoomStatus;
  phase: RoomPhase;
  phase_changed_at: string | null;
  max_players: number;
  host_participant_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  /** Q12: không còn tính xếp hạng (vắng cả phòng quá 15 phút). Ghi một lần, không gỡ. */
  unranked_at: string | null;
  last_activity_at: string | null;
  state_json: RoomInvestigationState;
  version: number;
  /** Cột v1, không còn ghi từ v3. */
  last_action?: string | null;
  updated_at: string;
  created_at: string;
}

/** Dòng `room_participants`. `token_hash` không bao giờ trả về client. */
export interface RoomParticipantRow {
  id: string;
  room_id: string;
  nickname: string;
  token_hash: string;
  joined_at: string;
  entered_at: string | null;
  left_at: string | null;
  kicked: boolean;
  last_seen_at: string;
}

export type RoomEventType =
  | "checkpoint_solved"
  | "dossier_unlocked"
  | "phone_solved"
  | "member_joined"
  | "member_entered"
  | "member_left"
  | "member_kicked"
  | "host_changed"
  | "phase_changed"
  | "conclusion_submitted";

/** Dòng `room_events`. */
export interface RoomEventRow {
  id: number;
  room_id: string;
  actor_participant_id: string | null;
  type: RoomEventType;
  target_ref: string | null;
  message: string;
  created_at: string;
}

export const DEFAULT_ROOM_STATE: RoomInvestigationState = {
  completedCheckpoints: [],
  phoneSolved: false,
  phoneInputs: {},
  investigatedSuspects: [],
  solvedFollowups: [],
  reinvestigateOpened: false,
  indictmentSolved: false,
  solvedCulprit: null,
  annotations: {},
  teamNotes: "",
  canvasNotes: [],
};

// ---------------------------------------------------------------------------
// Dữ liệu phòng trả về client (API /api/rooms/* và broadcast kênh room:<id>).
// Không bao giờ chứa token_hash, email hay userId.
// ---------------------------------------------------------------------------

export interface PublicRoom {
  id: string;
  code: string | null;
  caseId: string;
  mode: RoomMode;
  status: RoomStatus;
  phase: RoomPhase;
  phaseChangedAt: string | null;
  maxPlayers: number;
  hostParticipantId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  /** Khác null: phòng không còn tính xếp hạng (Q12). Client ẩn đồng hồ. */
  unrankedAt: string | null;
  version: number;
}

export interface PublicParticipant {
  id: string;
  nickname: string;
  joinedAt: string;
  /** NULL = còn ở phòng chờ. */
  enteredAt: string | null;
  isHost: boolean;
}

export interface PublicRoomEvent {
  id: number;
  type: RoomEventType;
  actorParticipantId: string | null;
  targetRef: string | null;
  message: string;
  createdAt: string;
}

export interface RoomSnapshot {
  room: PublicRoom;
  state: RoomInvestigationState;
  /** Thành viên đang giữ chỗ (chưa rời, chưa bị kick), theo thứ tự vào phòng. */
  participants: PublicParticipant[];
  /** Sự kiện mới nhất (tăng dần theo id). */
  events: PublicRoomEvent[];
  me: PublicParticipant;
  serverTime: string;
}

/** Tên sự kiện broadcast server gửi trên kênh `room:<id>` (spec 5.2). */
export type RoomBroadcastEvent =
  | "PHASE_CHANGE"
  | "PROGRESS_UPDATE"
  | "MEMBER_UPDATE"
  | "HOST_CHANGE"
  | "ROOM_EVENT";

export interface RoomBroadcastPayload {
  /** `x-room-client` của request gây ra thay đổi, để client bỏ qua echo của mình. */
  senderId: string | null;
  version: number;
  room?: PublicRoom;
  state?: RoomInvestigationState;
  participants?: PublicParticipant[];
  events?: PublicRoomEvent[];
  kickedParticipantId?: string;
  /** Phòng bị hủy (Host rời khi phòng trống, còn ở lobby). */
  closed?: boolean;
}
