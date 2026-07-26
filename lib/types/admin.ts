/**
 * Types specific to the Admin Studio (Creator side).
 * These types include internal logic, red herrings, and full truth profiles
 * which should never be leaked to the player frontend.
 */

export interface CaseMetadata {
  id: string
  title: string
  synopsis: string
  coverUrl?: string
  difficulty: number
  category: string
  reqDetectiveLevel: number
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED'
}

export interface CharacterTruthProfile {
  id: string
  characterId: string
  realMotive: string
  realAlibi: any // Will be refined as JSONB
  redHerringSecret: string
}

export interface RelationshipNode {
  id: string
  caseId: string
  character1Id: string
  character2Id: string
  relationType: string
  affinityScore: number // -100 to 100
}
