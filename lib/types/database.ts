export type CaseStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'
export type NodeType = 'evidence' | 'question'
export type LocationType = 'CASE' | 'LOCATION' | 'EVIDENCE'
export type UserRole = 'player' | 'admin'
export type PlayStatus = 'PLAYING' | 'COMPLETED' | 'ABANDONED'

export interface DbCase {
  id: string
  title: string
  synopsis: string | null
  full_story: string | null
  difficulty: number
  status: CaseStatus
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface DbEvidenceNode {
  id: string
  case_id: string
  type: NodeType
  position_x: number
  position_y: number
  label: string
  description: string | null
  category: string | null
  logic_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DbEvidenceEdge {
  id: string
  case_id: string
  source_node_id: string
  target_node_id: string
  created_at: string
}

export interface DbTimelineEvent {
  id: string
  case_id: string
  character_name: string
  event_title: string
  location: string | null
  start_min: number
  end_min: number
  is_truth: boolean
  is_fatal: boolean
  created_at: string
}

export interface DbLocation {
  id: string
  case_id: string
  title: string
  type: LocationType | null
  details: string | null
  position_x: number
  position_y: number
  created_at: string
}

export interface DbProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface DbPlaySession {
  id: string
  player_id: string
  case_id: string
  status: PlayStatus
  score: number
  started_at: string
  completed_at: string | null
}

export interface DbPlayerAnswer {
  id: string
  session_id: string
  player_id: string
  case_id: string
  node_id: string
  submitted_answer: string | null
  is_correct: boolean
  unlocked_at: string
}

export interface DbFeedback {
  id: string
  case_id?: string
  type: 'BUG' | 'TYPO' | 'FEEDBACK' | 'RATING' | 'OTHER'
  rating_score?: number
  content?: string
  contact_info?: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED'
  created_at: string
  resolved_at?: string
}

export interface DbAppSettings {
  id: number
  maintenance_mode: boolean
  banner_active: boolean
  banner_text: string
  updated_at: string
}
