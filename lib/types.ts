/**
 * Domain types and Content Models for the NOCTURNE investigation system.
 *
 * These describe the shape of the data the app works with, completely decoupled
 * from UI components, serving as the schema for the Content Engine.
 */

export type CaseStatus = 'locked' | 'active' | 'solved' | 'sealed'
export type DifficultyRating = 1 | 2 | 3 | 4 | 5
export type DeviceKind = 'phone' | 'laptop' | 'tablet' | 'drive' | 'recorder' | 'camera' | 'gps'
export type DeviceStatus = 'locked' | 'unlocking' | 'unlocked' | 'analyzing' | 'completed'
export type EvidenceKind = 'message' | 'email' | 'voice' | 'photo' | 'gps' | 'document'

/** A single investigation, activated with a code from the physical game box. */
export interface Case {
  id: string
  code: string
  title: string
  logline: string
  briefing: string
  objective?: string
  estimatedTime?: string
  status: CaseStatus
  difficulty: DifficultyRating
  progress: number
  hidden?: boolean
  location: string
  openedAt?: string
}

/** Case Victim details */
export interface Victim {
  id: string
  caseId: string
  name: string
  alias?: string
  role: string
  status: string
}

/** Suspect details */
export interface Suspect {
  id: string
  caseId: string
  name: string
  role: string
  background: string
  alibi: string
  collected: boolean
}

/** General character interface */
export interface Character {
  id: string
  name: string
  role: string
}

/** Case objectives */
export interface Objective {
  id: string
  caseId: string
  label: string
  completed: boolean
}

/** A confiscated digital device the detective can unlock and explore. */
export interface EvidenceDevice {
  id: string
  caseId: string
  kind: DeviceKind
  label: string
  owner: string
  locked: boolean
  status: DeviceStatus
  evidenceId: string
  recoveryLevel: number
  lastUpdated: string
  previewStats?: string
  pinLength?: number
}

// Deprecated alias for legacy code compatibility
export type Device = EvidenceDevice

/** A single piece of evidence found on a device. */
export interface Evidence {
  id: string
  caseId: string
  deviceId?: string
  kind: EvidenceKind
  title: string
  preview: string
  timestamp: string
  flagged?: boolean
  evidenceId: string
  recoveredBy: string
  integrityStatus: 'secured' | 'corrupted' | 'analyzing'
  chainOfCustody: string
}

/** Message content in a thread */
export interface Message {
  id: string
  sender: string
  role: 'sent' | 'received' | 'corrupted'
  text: string
  timestamp: string
}

/** Conversation thread containing messages */
export interface Conversation {
  id: string
  name: string
  timestamp: string
  previewText: string
  recoveryProgress: number
  unread: boolean
  messages: Message[]
}

/** Email model */
export interface Email {
  id: string
  sender: string
  subject: string
  body: string
  timestamp: string
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'UNCLASSIFIED'
  integrity: 'SECURED' | 'CORRUPTED' | 'ANALYZING'
}

/** Photo details */
export interface Photo {
  id: string
  filename: string
  size: string
  location: string
  status: 'recovered' | 'corrupted' | 'encrypted'
}

/** Voice Recording audio details */
export interface VoiceRecording {
  id: string
  title: string
  duration: string
  waveformPoints: number[]
  transcript: string
  integrity: string
}

/** GPS location ping details */
export interface GPSLocation {
  id: string
  timestamp: string
  coordinates: string
  accuracy: string
  locationLabel: string
}

/** Browser/Timeline History URL details */
export interface BrowserHistory {
  id: string
  time: string
  label: string
  status: string
  redacted?: boolean
}

/** Document note details */
export interface Document {
  id: string
  title: string
  content: string
  meta: string
  damaged?: boolean
}

/** Recovered binary/Zip/PDF file info */
export interface RecoveredFile {
  id: string
  filename: string
  kind: 'pdf' | 'zip' | 'image' | 'audio'
  size: string
  status: 'secured' | 'corrupted' | 'analyzing'
  integrity: string
}

/** An intelligence card collected during play ("Trace"). */
export interface TraceCard {
  id: string
  caseId: string
  code: string
  name: string
  category: 'suspect' | 'location' | 'object' | 'event'
  description: string
  collected: boolean
}

/** Graded hint system */
export interface Hint {
  level: 1 | 2 | 3
  text: string
}

/** Assistant prompt flow */
export interface AssistantConversation {
  caseId: string
  welcomeMessage: string
  initialChips: { label: string; action: string }[]
  timelineInfo: {
    title: string
    rows: { label: string; value: string }[]
  }
  recoveredMessageRef: {
    evidenceId: string
    title: string
    previewText: string
  }
  hints: Hint[]
}

/** Timeline Event sequencing choice */
export interface TimelineEvent {
  id: string
  text: string
}

/** Final conclusion choice cards */
export interface ConclusionOption {
  id: string
  title: string
  desc: string
}

/** Evaluation details for Victory screen */
export interface Evaluation {
  caseId: string
  suspectName: string
  motiveTitle: string
  methodTitle: string
  radarScores: { id: string; name: string; score: number; desc: string }[]
  strengths: string
  weaknesses: string
  missedEvidence: string
  correctTimeline: string[]
  evidenceUsage: {
    used: string[]
    ignored: string[]
    critical: string[]
  }
}

/** Clearance rewards */
export interface Reward {
  caseId: string
  newRank: string
  unlockedTraceCards: string[]
  codeFragment: string
  nextCaseId: string
}

export interface FinalCodeFragment {
  code: string
  cipherText: string
}

/** The player's detective profile and career progress. */
export interface DetectiveProfile {
  codename: string
  rank: string
  badgeId: string
  casesSolved: number
  totalCases: number
  averageRating: DifficultyRating
}

export interface Checkpoint {
  id: string
  caseId: string
  title: string
  question: string
  hint: string
  options: string[]
  correctAnswer: string
  unlockedEvidenceId?: string // e.g. 'dev-02'
  status: 'locked' | 'active' | 'completed'
}

