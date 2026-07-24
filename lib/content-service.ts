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
  Reward
} from './types'

// Import Case 001 files
import { case001 } from '../content/cases/case-001/case'
import { victim001 } from '../content/cases/case-001/victim'
import { suspects001 } from '../content/cases/case-001/suspects'
import { devices001 } from '../content/cases/case-001/devices'
import { conversations001 } from '../content/cases/case-001/messages'
import { emails001 } from '../content/cases/case-001/emails'
import { photos001 } from '../content/cases/case-001/photos'
import { browserHistory001 } from '../content/cases/case-001/browser-history'
import { files001, documents001 } from '../content/cases/case-001/files'
import { assistant001 } from '../content/cases/case-001/assistant'
import { timelineEvents001, conclusionOptions001, evaluation001 } from '../content/cases/case-001/evaluation'
import { rewards001 } from '../content/cases/case-001/rewards'

// Registry of cases
const CASES_REGISTRY: Record<string, Case> = {
  'case-001': case001
}

const VICTIMS_REGISTRY: Record<string, Victim> = {
  'case-001': victim001
}

const SUSPECTS_REGISTRY: Record<string, Suspect[]> = {
  'case-001': suspects001
}

const DEVICES_REGISTRY: Record<string, EvidenceDevice[]> = {
  'case-001': devices001
}

const CONVERSATIONS_REGISTRY: Record<string, Record<string, Conversation[]>> = {
  'case-001': conversations001
}

const EMAILS_REGISTRY: Record<string, Record<string, Email[]>> = {
  'case-001': emails001
}

const PHOTOS_REGISTRY: Record<string, Record<string, Photo[]>> = {
  'case-001': photos001
}

const BROWSER_HISTORY_REGISTRY: Record<string, Record<string, BrowserHistory[]>> = {
  'case-001': browserHistory001
}

const FILES_REGISTRY: Record<string, Record<string, RecoveredFile[]>> = {
  'case-001': files001
}

const DOCUMENTS_REGISTRY: Record<string, Record<string, Document[]>> = {
  'case-001': documents001
}

const ASSISTANT_REGISTRY: Record<string, AssistantConversation> = {
  'case-001': assistant001
}

const TIMELINE_EVENTS_REGISTRY: Record<string, TimelineEvent[]> = {
  'case-001': timelineEvents001
}

const CONCLUSION_OPTIONS_REGISTRY: Record<string, typeof conclusionOptions001> = {
  'case-001': conclusionOptions001
}

const EVALUATION_REGISTRY: Record<string, Evaluation> = {
  'case-001': evaluation001
}

const REWARDS_REGISTRY: Record<string, Reward> = {
  'case-001': rewards001
}

// Service queries layer
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
