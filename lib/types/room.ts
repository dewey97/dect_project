export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: { x: number; y: number }[];
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
