/**
 * Case & Investigation domain types
 */

export type CaseStatus = "locked" | "active" | "solved" | "sealed";
export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

/** A single investigation, activated with a code from the physical game box. */
export interface Case {
  id: string;
  code: string;
  title: string;
  logline: string;
  briefing: string;
  objective?: string;
  estimatedTime?: string;
  status: CaseStatus;
  difficulty: DifficultyRating;
  progress: number;
  hidden?: boolean;
  location: string;
  coverImage?: string;
  openedAt?: string;
}

/** Case Victim details */
export interface Victim {
  id: string;
  caseId: string;
  name: string;
  alias?: string;
  role: string;
  status: string;
}

/** Suspect details */
export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  role: string;
  background: string;
  alibi: string;
  collected: boolean;
}

/** General character interface */
export interface Character {
  id: string;
  name: string;
  role: string;
}

/** Case objectives */
export interface Objective {
  id: string;
  caseId: string;
  label: string;
  completed: boolean;
}

/** An intelligence card collected during play ("Trace"). */
export interface TraceCard {
  id: string;
  caseId: string;
  code: string;
  name: string;
  category: "suspect" | "location" | "object" | "event";
  description: string;
  collected: boolean;
}

/** Graded hint system */
export interface Hint {
  level: 1 | 2 | 3;
  text: string;
}

/** Assistant prompt flow */
export interface AssistantConversation {
  caseId: string;
  welcomeMessage: string;
  initialChips: { label: string; action: string }[];
  timelineInfo: {
    title: string;
    rows: { label: string; value: string }[];
  };
  recoveredMessageRef: {
    evidenceId: string;
    title: string;
    previewText: string;
  };
  hints: Hint[];
}

/** Timeline Event sequencing choice */
export interface TimelineEvent {
  id: string;
  text: string;
}

/** Final conclusion choice cards */
export interface ConclusionOption {
  id: string;
  title: string;
  desc: string;
}

/** Evaluation details for Victory screen */
export interface Evaluation {
  caseId: string;
  suspectName: string;
  motiveTitle: string;
  methodTitle: string;
  radarScores: { id: string; name: string; score: number; desc: string }[];
  strengths: string;
  weaknesses: string;
  missedEvidence: string;
  correctTimeline: string[];
  evidenceUsage: {
    used: string[];
    ignored: string[];
    critical: string[];
  };
}

/** Clearance rewards */
export interface Reward {
  caseId: string;
  newRank: string;
  unlockedTraceCards: string[];
  codeFragment: string;
  nextCaseId: string;
}

export interface FinalCodeFragment {
  code: string;
  cipherText: string;
}

/** The player's detective profile and career progress. */
export interface DetectiveProfile {
  codename: string;
  rank: string;
  badgeId: string;
  casesSolved: number;
  totalCases: number;
  averageRating: DifficultyRating;
}

export interface CheckpointOptionItem {
  id: string;
  label: string;
  code?: string;
  description?: string;
}

export interface EpilogueStoryRuntime {
  id: string;
  title: string;
  monologue: string;
}

/**
 * Model runtime của checkpoint phía client gameplay.
 * Không chứa đáp án: dữ liệu đến từ `/api/checkpoints` đã lọc
 * (`lib/checkpoints/public-checkpoint.ts`). Chấm điểm qua server.
 */
export interface Checkpoint {
  id: string;
  caseId: string;
  title: string;
  question: string;
  hint: string;
  hintsList?: string[];
  options?: string[];
  nodeId?: string;
  followupOf?: string;
  dependsOn?: string[];
  status: "locked" | "active" | "completed";
  dossier?: string;
  unlocksDossier?: string;
  /** Loại checkpoint theo gameplay (migration 26). */
  kind?: string;
  /** Khóa nhân vật liên quan (`case_characters.key` cùng vụ). */
  subjectKey?: string;
  type?: string;
  /** Kiểu ô nhập: time | choice | code | text | text_match_3 | evidence_picker. */
  questionType?: string;
  storyConfig?: {
    /** Mốc thời gian in trên header, ví dụ `Đêm 24/07/2016`. */
    date?: string;
    /** Dòng phụ đề ngắn (mặc định dùng chung `date` nếu bỏ trống). */
    subtitle?: string;
    monologue: string;
  };
  /** Danh sách bài Hậu Án (chỉ có khi kind = epilogue). */
  epilogueStories?: EpilogueStoryRuntime[];
  textMatchConfig?: {
    inputs: { id: string; label: string; placeholder: string }[];
  };
  photoCodes?: string[];
  pickerConfig?: {
    availableEvidences?: CheckpointOptionItem[];
    /** Thẩm tra 2 lớp: lớp nào có yêu cầu mã chứng cứ. */
    hasMotive?: boolean;
    hasContradiction?: boolean;
  };
}

/**
 * Dẫn truyện cinematic của một chặng điều tra.
 * `phase`: 0 = Ban Đầu, 1 = Bộ A, 2 = Bộ B, 3 = Bộ C.
 */
export interface PhaseNarrative {
  caseId: string;
  phase: number;
  /** Nhãn bộ hồ sơ cho biên kịch: `Ban Đầu` | `Bộ A` | `Bộ B` | `Bộ C`. */
  dossier?: string;
  /** Mốc thời gian in trên header, ví dụ `Đêm 24/07/2016`. */
  date?: string;
  /** Đoạn độc thoại dẫn truyện (xuống dòng đôi = ngắt đoạn). */
  monologue: string;
}

