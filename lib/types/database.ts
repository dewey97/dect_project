import type { PaperConfig, LoiKhaiData, LyLichData } from "@/lib/types/dossier";

export type CaseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type UserRole = "player" | "admin";
export type PlayStatus = "PLAYING" | "COMPLETED" | "ABANDONED";

/** Bảng cases: Metadata danh mục vụ án */
export interface DbCase {
  id: string;
  /** Mã nghiệp vụ duy nhất (`case_000`), khóa tham chiếu của mọi bảng nội dung vụ án. */
  slug: string;
  title: string;
  synopsis: string | null;
  full_story: string | null;
  difficulty: number;
  status: CaseStatus;
  cover_image_url: string | null;
  panorama_url?: string | null;
  scene_360_url?: string | null;
  reinvestigation_bg_url?: string | null;
  created_at: string;
  updated_at: string;
}

/** Bảng profiles: Thông tin người dùng & quyền hạn */
export interface DbProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

/** Bảng play_sessions: Phiên chơi game của tài khoản */
export interface DbPlaySession {
  id: string;
  player_id: string;
  case_id: string;
  status: PlayStatus;
  score: number;
  started_at: string;
  completed_at: string | null;
}

/** Bảng feedbacks: Góp ý, báo lỗi và đánh giá từ người chơi */
export interface DbFeedback {
  id: string;
  case_id?: string;
  type: "BUG" | "TYPO" | "FEEDBACK" | "RATING" | "OTHER";
  rating_score?: number;
  content?: string;
  contact_info?: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "IGNORED";
  created_at: string;
  resolved_at?: string;
}

/** Bảng boardgame_pins: Layout ghim bảng điều tra do admin setup (id TEXT: c0-*, admin-*, custom-*) */
export interface DbBoardgamePin {
  id: string;
  case_id: string;
  position_x: number;
  position_y: number;
  mobile_x?: number | null;
  mobile_y?: number | null;
  label: string | null;
  detail: string | null;
  color: string | null;
  note_color: string | null;
  pin_color: string | null;
  photo_url: string | null;
  is_locked: boolean;
  is_solved: boolean;
  pulse_border: boolean;
  rotation: number;
  scale: number;
  updated_at: string;
}

/** Bảng boardgame_connections: Dây chỉ đỏ admin nối giữa các ghim */
export interface DbBoardgameConnection {
  id: string;
  case_id: string;
  from_pin_id: string;
  to_pin_id: string;
  updated_at: string;
}

/** Bảng app_settings: Cấu hình thông báo toàn cục & trạng thái hệ thống */
export interface DbAppSettings {
  id: number;
  maintenance_mode: boolean;
  banner_active: boolean;
  banner_text: string;
  updated_at: string;
}

/**
 * Bảng case_checkpoints: Dữ liệu checkpoint do Checkpoint Studio biên tập.
 * Gameplay đọc cùng bảng qua `/api/checkpoints`.
 */
export interface DbCaseCheckpoint {
  id: string;
  case_id: string;
  checkpoint_id: string;
  node_id: string | null;
  dossier: string | null;
  title: string;
  question: string;
  type: string;
  /** Loại checkpoint theo gameplay (migration 26). */
  kind?: string;
  /** Khóa nhân vật liên quan (`case_characters.key` cùng vụ). */
  subject_key?: string | null;
  question_type: string | null;
  followup_of: string | null;
  depends_on: string[];
  flow_position: { x: number; y: number } | null;
  answer_config: Record<string, unknown>;
  hints: unknown;
  narrative: string | null;
  ai_context: string | null;
  ai_valid_cases: unknown;
  ai_invalid_cases: unknown;
  board_config?: BoardConfig;
  created_at: string;
  updated_at: string;
}

/** Bảng dossier_documents: Hồ sơ biên bản lấy lời khai và lý lịch tư pháp nghi phạm */
export interface DbDossierDocument {
  id: string;
  case_id: string;
  mode: "loi_khai" | "ly_lich";
  tag_code: string;
  subject_name: string;
  paper_config: PaperConfig;
  content: LoiKhaiData | LyLichData;
  created_at: string;
  updated_at: string;
}

/** Bảng case_dossiers: Quản lý danh mục các bộ hồ sơ và danh sách mã tài liệu/vật chứng thuộc mỗi bộ */
export interface DbCaseDossier {
  id: string;
  case_id: string;
  dossier_key: string;
  title: string;
  document_codes: string[];
  flow_position: { x: number; y: number } | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type CaseCharacterRole = "victim" | "suspect" | "witness" | "related";

/** Metadata điện thoại tang vật gắn với nhân vật (thường là nạn nhân). */
export interface CaseCharacterDevice {
  label?: string;
  model?: string;
  model_id?: string;
  lastUpdated?: string;
  description?: string;
  chassis?: "iphone_classic" | "iphone_modern" | "android_vintage";
  wallpaper_url?: string;
  lockscreen_url?: string;
  selfie_url?: string;
  passcode?: string;
  status_bar?: {
    time?: string;
    battery?: number;
    service_text?: string;
  };
  lock_screen?: {
    time?: string;
    date?: string;
  };
  settings_info?: Record<string, string>;
}

/** Bảng case_characters: danh sách nhân vật theo vụ án (Case Bible) */
export interface DbCaseCharacter {
  id: string;
  case_slug: string;
  key: string;
  name: string;
  aliases: string[];
  role: CaseCharacterRole;
  description: string | null;
  avatar_code: string | null;
  avatar_url?: string | null;
  avatar_asset_path?: string | null;
  avatarUrl?: string;
  phones: string[];
  slot_index: number;
  device: CaseCharacterDevice | null;
  created_at: string;
  updated_at: string;
}

/** Bảng map_vectors: Bản đồ vector thế giới mở rộng dùng chung */
export interface DbMapVector {
  id: string;
  data: unknown;
  updated_at: string;
}

/** Bảng reinvestigation_hotspots: Danh sách điểm khám xét lại theo từng vụ án */
export interface DbReinvestigationHotspots {
  case_slug: string;
  hotspots: unknown;
  updated_at: string;
}

/** Bảng waitlist_entries: Danh sách email đăng ký nhận thông tin vụ án mới */
export interface DbWaitlistEntry {
  id: string;
  email: string;
  source: string;
  ip: string | null;
  created_at: string;
}

/** Bảng case_phone_apps: App launcher per-case */
export interface DbCasePhoneApp {
  id: string;
  case_slug: string;
  app_type: string;
  display_name: string;
  icon_url: string | null;
  slot_index: number;
  is_dock: boolean;
  is_locked: boolean;
  unlock_checkpoint_id: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_contacts */
export interface DbPhoneContact {
  id: string;
  case_slug: string;
  contact_id: string | null;
  name: string;
  display_name: string | null;
  phone_number: string | null;
  category: string | null;
  note: string | null;
  is_saved: boolean;
  avatar_url: string | null;
  is_suspicious: boolean;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_calls */
export interface DbPhoneCall {
  id: string;
  case_slug: string;
  code: string | null;
  contact_name: string;
  phone_number: string | null;
  call_type: string;
  timestamp: string | null;
  duration: string | null;
  audio_url: string | null;
  is_key_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_messages */
export interface DbPhoneMessage {
  id: string;
  case_slug: string;
  thread_key: string;
  thread_name: string;
  thread_phone: string | null;
  sender: string;
  role: string;
  body: string;
  timestamp: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  attachment_type: string | null;
  attachment_url: string | null;
  attachment_duration: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_photos */
export interface DbPhonePhoto {
  id: string;
  case_slug: string;
  photo_code: string | null;
  label: string;
  image_url: string;
  taken_at: string | null;
  description: string | null;
  exif_json: Record<string, unknown> | null;
  is_evidence: boolean;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_notes */
export interface DbPhoneNote {
  id: string;
  case_slug: string;
  title: string;
  body: string;
  is_pinned: boolean;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_bank_transactions */
export interface DbPhoneBankTx {
  id: string;
  case_slug: string;
  tx_type: string;
  amount: number;
  counterparty: string;
  note: string | null;
  timestamp: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  clue_analysis: string | null;
  balance_after: number | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/** Bảng phone_browser_history */
export interface DbPhoneBrowserHistory {
  id: string;
  case_slug: string;
  title: string;
  url: string | null;
  visited_at: string | null;
  favicon_url: string | null;
  code: string | null;
  is_clue: boolean;
  clue_title: string | null;
  slot_index: number;
  created_at: string;
  updated_at: string;
}

// WT-2
/** Bảng case_evidence (M3 / WT-2) */
export interface DbCaseEvidence {
  id: string;
  case_slug: string;
  code: string;
  title: string;
  kind: "pdf" | "image" | "photo" | "audio" | "object";
  file_url: string | null;
  thumb_url: string | null;
  phase: number;
  description: string | null;
  slot_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Case metadata mở rộng trường ảnh 360 / Panorama (WT-2) */
export interface DbCaseWithEvidenceConfig extends DbCase {
  panorama_url?: string | null;
  scene_360_url?: string | null;
}

// WT-1
export type BoardNodeKind =
  | "victim"
  | "victim_phone"
  | "reinvestigate"
  | "suspects_hub"
  | "evidence_hub"
  | "note"
  | "photo"
  | "dossier"
  | "custom";

export interface BoardPosition {
  x: number;
  y: number;
}

export interface BoardConfig {
  pin_title?: string;
  icon?: string;
  photo_url?: string;
  note_style?: string;
  position?: {
    desktop?: BoardPosition;
    mobile?: BoardPosition;
  };
  connections?: string[];
  hidden?: boolean;
  locked_until_checkpoint?: string;
}

export interface DbCaseBoardNode {
  id: string;
  case_slug: string;
  node_kind: BoardNodeKind;
  title: string | null;
  subject_key: string | null;
  checkpoint_id: string | null;
  slot_index: number;
  config: BoardConfig;
  created_at: string;
  updated_at: string;
}
