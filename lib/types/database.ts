export type CaseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type UserRole = "player" | "admin";
export type PlayStatus = "PLAYING" | "COMPLETED" | "ABANDONED";

/** Bảng cases: Metadata danh mục vụ án */
export interface DbCase {
  id: string;
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

/** Bảng app_settings: Cấu hình thông báo toàn cục & trạng thái hệ thống */
export interface DbAppSettings {
  id: number;
  maintenance_mode: boolean;
  banner_active: boolean;
  banner_text: string;
  updated_at: string;
}
