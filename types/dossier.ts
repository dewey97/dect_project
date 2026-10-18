// Data models matching Figma master file & Legal Admin Documents

export type DossierMode = 'loi_khai' | 'ly_lich'

export interface PaperConfig {
  size: 'A4' | 'A5'
  orientation: 'portrait' | 'landscape'
}

export interface QABlock {
  id: string
  question: string
  answer: string
  isClue?: boolean
}

export interface LoiKhaiData {
  tagCode: string // e.g. A-19
  docTitle: string
  caseSubtitle: string
  recordLead: string
  investigatorText: string
  subjectName: string
  reasonText: string
  relationText: string
  qaList: QABlock[]
  paperConfig?: PaperConfig
  sortOrder?: number
}

export interface LyLichData {
  tagCode: string // e.g. A-17
  idCode: string // e.g. B-381762904
  photoUrl: string
  fullName: string
  nickname: string
  dob: string
  gender: string
  cmnd: string
  permanentAddress: string
  currentAddress: string
  job: string
  phone: string
  maritalStatus: string
  identifyingTraits: string
  criminalRecord: string
  relationWithVictim: string
  archiveNote: string
  caseFileNumber: string
  archiveStatus: string
  signingCity: string
  signingDay: string
  signingMonth: string
  signingYear: string
  investigatorRankAndName: string
  caseSubtitle?: string
  paperConfig?: PaperConfig
  sortOrder?: number
}
