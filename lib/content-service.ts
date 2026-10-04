import {
  Case,
  Victim,
  Suspect,
  EvidenceDevice,
  Conversation,
  Email,
  Photo,
  BrowserHistory,
  RecoveredFile,
  Document,
  AssistantConversation,
  TimelineEvent,
  Evaluation,
  Reward,
  Checkpoint
} from './types'

// Import Case 000 files (TEST-99)
import { case000 } from '../content/cases/case-000/case'
import { victim000 } from '../content/cases/case-000/victim'
import { suspects000 } from '../content/cases/case-000/suspects'
import { devices000 } from '../content/cases/case-000/devices'
import { conversations000 } from '../content/cases/case-000/messages'
import { emails000 } from '../content/cases/case-000/emails'
import { photos000 } from '../content/cases/case-000/photos'
import { browserHistory000 } from '../content/cases/case-000/browser-history'
import { files000, documents000 } from '../content/cases/case-000/files'
import { assistant000 } from '../content/cases/case-000/assistant'
import { timelineEvents000, conclusionOptions000, evaluation000 } from '../content/cases/case-000/evaluation'
import { rewards000 } from '../content/cases/case-000/rewards'
import { checkpoints000 } from '../content/cases/case-000/checkpoints'

export {
  case000,
  victim000,
  suspects000,
  devices000,
  conversations000,
  emails000,
  photos000,
  browserHistory000,
  files000,
  documents000,
  assistant000,
  timelineEvents000,
  conclusionOptions000,
  evaluation000,
  rewards000,
  checkpoints000
}

// Registry of cases
const CASES_REGISTRY: Record<string, Case> = {
  'case-000': case000
}

const VICTIMS_REGISTRY: Record<string, Victim> = {
  'case-000': victim000
}

const SUSPECTS_REGISTRY: Record<string, Suspect[]> = {
  'case-000': suspects000
}

const DEVICES_REGISTRY: Record<string, EvidenceDevice[]> = {
  'case-000': devices000
}

const CONVERSATIONS_REGISTRY: Record<string, Record<string, Conversation[]>> = {
  'case-000': conversations000
}

const EMAILS_REGISTRY: Record<string, Record<string, Email[]>> = {
  'case-000': emails000
}

const PHOTOS_REGISTRY: Record<string, Record<string, Photo[]>> = {
  'case-000': photos000
}

const BROWSER_HISTORY_REGISTRY: Record<string, Record<string, BrowserHistory[]>> = {
  'case-000': browserHistory000
}

const FILES_REGISTRY: Record<string, Record<string, RecoveredFile[]>> = {
  'case-000': files000
}

const DOCUMENTS_REGISTRY: Record<string, Record<string, Document[]>> = {
  'case-000': documents000
}

const ASSISTANT_REGISTRY: Record<string, AssistantConversation> = {
  'case-000': assistant000
}

const TIMELINE_EVENTS_REGISTRY: Record<string, TimelineEvent[]> = {
  'case-000': timelineEvents000
}

const CONCLUSION_OPTIONS_REGISTRY: Record<string, typeof conclusionOptions000> = {
  'case-000': conclusionOptions000
}

const EVALUATION_REGISTRY: Record<string, Evaluation> = {
  'case-000': evaluation000
}

const REWARDS_REGISTRY: Record<string, Reward> = {
  'case-000': rewards000
}

const CHECKPOINTS_REGISTRY: Record<string, Checkpoint[]> = {
  'case-000': checkpoints000
}

// Service queries layer
export async function getCheckpoints(caseId: string): Promise<Checkpoint[]> {
  return CHECKPOINTS_REGISTRY[caseId] || []
}

export async function getCase(id: string): Promise<Case | undefined> {
  return CASES_REGISTRY[id]
}

export async function getCases(): Promise<Case[]> {
  return Object.values(CASES_REGISTRY)
}

export async function getVictim(caseId: string): Promise<Victim | undefined> {
  return VICTIMS_REGISTRY[caseId]
}

export async function getSuspects(caseId: string): Promise<Suspect[]> {
  return SUSPECTS_REGISTRY[caseId] || []
}

export async function getDevices(caseId: string): Promise<EvidenceDevice[]> {
  return DEVICES_REGISTRY[caseId] || []
}

export async function getDevice(deviceId: string): Promise<EvidenceDevice | undefined> {
  for (const caseId in DEVICES_REGISTRY) {
    const found = DEVICES_REGISTRY[caseId].find((d) => d.id === deviceId)
    if (found) return found
  }
  return undefined
}

export async function getDeviceConversations(deviceId: string): Promise<Conversation[]> {
  for (const caseId in CONVERSATIONS_REGISTRY) {
    const list = CONVERSATIONS_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getDeviceEmails(deviceId: string): Promise<Email[]> {
  for (const caseId in EMAILS_REGISTRY) {
    const list = EMAILS_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getDevicePhotos(deviceId: string): Promise<Photo[]> {
  for (const caseId in PHOTOS_REGISTRY) {
    const list = PHOTOS_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getDeviceBrowserHistory(deviceId: string): Promise<BrowserHistory[]> {
  for (const caseId in BROWSER_HISTORY_REGISTRY) {
    const list = BROWSER_HISTORY_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getDeviceFiles(deviceId: string): Promise<RecoveredFile[]> {
  for (const caseId in FILES_REGISTRY) {
    const list = FILES_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getDeviceDocuments(deviceId: string): Promise<Document[]> {
  for (const caseId in DOCUMENTS_REGISTRY) {
    const list = DOCUMENTS_REGISTRY[caseId][deviceId]
    if (list) return list
  }
  return []
}

export async function getAssistantConversation(caseId: string): Promise<AssistantConversation | undefined> {
  return ASSISTANT_REGISTRY[caseId]
}

export async function getTimelineEvents(caseId: string): Promise<TimelineEvent[]> {
  return TIMELINE_EVENTS_REGISTRY[caseId] || []
}

export async function getConclusionOptions(caseId: string) {
  return CONCLUSION_OPTIONS_REGISTRY[caseId] || { suspects: [], motives: [], methods: [], evidenceList: [] }
}

export async function getEvaluation(caseId: string): Promise<Evaluation | undefined> {
  return EVALUATION_REGISTRY[caseId]
}

export async function getRewards(caseId: string): Promise<Reward | undefined> {
  return REWARDS_REGISTRY[caseId]
}
