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
 * Chưa nối vào runtime — gameplay vẫn đọc Google Sheets.
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
  unlocked_evidence_id: string | null;
  followup_of: string | null;
  suspect_label: string | null;
  evidence_step_label: string | null;
  depends_on: string[];
  flow_position: { x: number; y: number } | null;
  answer_config: Record<string, unknown>;
  hints: unknown;
  narrative: string | null;
  ai_context: string | null;
  ai_valid_cases: unknown;
  ai_invalid_cases: unknown;
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
  paper_config: any;
  content: any;
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
  lastUpdated?: string;
  description?: string;
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
  phones: string[];
  slot_index: number;
  device: CaseCharacterDevice | null;
  created_at: string;
  updated_at: string;
}
