import React from 'react'
import { getCharacters } from '@/lib/actions/character-actions'
import { getRelationships } from '@/lib/actions/relationship-actions'
import { getTimelineEvents } from '@/lib/actions/timeline-actions'
import RelationshipsClient from './relationships-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RelationshipsPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  
  const [charsRes, relsRes, eventsRes] = await Promise.all([
    getCharacters(caseId),
    getRelationships(caseId),
    getTimelineEvents(caseId)
  ])
  
  if (!charsRes.success || !relsRes.success || !eventsRes.success) {
    notFound()
  }

  // Khớp nhân vật từ timeline events sang sơ đồ quan hệ
  const dbChars = charsRes.data || []
  const dbCharNames = new Set(dbChars.map(c => c.name))
  const extraChars: any[] = []

  if (eventsRes.data) {
    eventsRes.data.forEach(event => {
      const charName = event.character_name
      if (charName && charName !== 'Unknown' && !dbCharNames.has(charName)) {
        dbCharNames.add(charName)
        extraChars.push({
          id: charName,
          case_id: caseId,
          name: charName,
          role: 'SUSPECT',
          avatar_url: '',
          position_x: 200 + Math.random() * 200,
          position_y: 200 + Math.random() * 200,
          real_motive: '',
          real_alibi: '',
          red_herring_secret: ''
        })
      }
    })
  }

  return (
    <RelationshipsClient 
      caseId={caseId} 
      initialCharacters={[...dbChars, ...extraChars]} 
      initialRelationships={relsRes.data || []} 
    />
  )
}
