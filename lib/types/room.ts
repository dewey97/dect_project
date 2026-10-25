export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

/** Ping sự kiện thám tử chỉ điểm - realtime broadcast */
export interface DetectivePing {
  id: string
  actorName: string
  targetId: string        // ID của ghim, tài liệu hoặc vật chứng được chỉ điểm
  label: string           // Nhãn hiển thị (VD: "DOC-A01", "Lời khai nhân chứng")
  targetType?: 'pin' | 'doc' | 'evidence' // Loại mục tiêu chỉ điểm
  docType?: 'pdf' | 'evidence'            // Loại tài liệu để tự động chuyển tab
  phase?: number                          // Phase của tài liệu để tự mở bộ hồ sơ tương ứng
  page?: number                           // Trang tài liệu (nếu có)
  /** Tọa độ chuẩn hóa trên bảng Corkboard [0..1], nếu có */
  coords?: { x: number; y: number }
  timestamp: number
}

export interface RoomMember {
  key: string;
  nickname: string;
  joinedAt: number;
}

export interface RoomInvestigationState {
  completedCheckpoints: string[];
  phoneSolved: boolean;
  phoneInputs: Record<string, string>;
  investigatedSuspects: string[];
  solvedFollowups: string[];
  reinvestigateUnlocked: boolean;
  reinvestigateOpened: boolean;
  indictmentSolved: boolean;
  solvedCulprit: string | null;
  annotations?: Record<string, AnnotationStroke[]>;
  teamNotes?: string;
  lastAction?: {
    by?: string;
    text: string;
    timestamp: number;
  };
}

export interface GameRoomRow {
  room_code: string;
  game_id: string;
  state_json: RoomInvestigationState;
  last_action: string | null;
  updated_at: string;
  created_at: string;
}

export const DEFAULT_ROOM_STATE: RoomInvestigationState = {
  completedCheckpoints: [],
  phoneSolved: false,
  phoneInputs: {},
  investigatedSuspects: [],
  solvedFollowups: [],
  reinvestigateUnlocked: false,
  reinvestigateOpened: false,
  indictmentSolved: false,
  solvedCulprit: null,
  annotations: {},
  teamNotes: '',
};
