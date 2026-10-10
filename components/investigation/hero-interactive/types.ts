export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ZoomState {
  active: boolean;
  originX: number;
  originY: number;
}

export interface ViewTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface BoardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PinPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  color?:
    | "red"
    | "yellow"
    | "blue"
    | "green"
    | "black"
    | "purple"
    | "orange"
    | "cyan"
    | "brass"
    | "silver"
    | "dark";
  noteColor?: "yellow" | "black" | "white" | "red" | "blue";
  pinColor?:
    | "red"
    | "yellow"
    | "blue"
    | "green"
    | "black"
    | "purple"
    | "orange"
    | "cyan"
    | "brass"
    | "silver"
    | "dark";
  pulseBorder?: boolean;
  photoUrl?: string;
  noteTextureUrl?: string;
  isLocked?: boolean;
  isSolved?: boolean;

  // Interactive Question / Checkpoint metadata
  actionType?: "info" | "sheet_checkpoint" | "custom_question";
  checkpointId?: string;
  questionType?: "text_match_3" | "evidence_picker" | "mcq" | "accusation";
  question?: string;
  answers?: string;
  hints?: string;
  unlockedEvidenceId?: string;

  // Visual transform overrides
  rotation?: number; // degrees (-45 to 45)
  scale?: number; // multiplier (0.5 to 2.0)
}

export interface CaseConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
}

export type BoardMode = "zoom" | "pin";

export interface UserPin {
  id: string;
  x: number; // Ratio 0-1 relative to case inner board bounds
  y: number;
  label: string;
}

export interface UserConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
}

export interface CaseData {
  id: string;
  title: string;
  description: string;
  status: "active" | "solved" | "locked";
  bgImage: string; // Cases maps
  pins: PinPoint[];
  connections: CaseConnection[];
}

export interface TooltipState {
  pinIndex: number;
  isUserPin: boolean;
  x: number;
  y: number;
}

export interface HeroInteractiveProps {
  className?: string;
  controlledCaseId?: string;
  customPins?: PinPoint[];
  customConnections?: CaseConnection[];
  customBgImage?: string;
  selectedPinId?: string | null;
  onSelectPin?: (pinId: string | null) => void;
  onConnectPins?: (fromPinId: string, toPinId: string) => void;
  onDeleteConnection?: (connId: string) => void;
  onPinClick?: (
    pinId: string,
    pin?: PinPoint,
    coords?: { clientX: number; clientY: number },
  ) => void;
  isEditMode?: boolean;
  onPinPositionChange?: (pinId: string, newX: number, newY: number) => void;
}
