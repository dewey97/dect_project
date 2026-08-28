import React from 'react'
import { getTimelineEvents } from '@/lib/actions/timeline-actions'
import { getCharacters } from '@/lib/actions/character-actions'
import TimelineClient from './timeline-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TimelineEditorPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  
  const [eventsRes, charsRes] = await Promise.all([
    getTimelineEvents(caseId),
    getCharacters(caseId)
  ])
  
  if (!eventsRes.success || !charsRes.success) {
    notFound()
  }

  return (
    <TimelineClient 
      caseId={caseId} 
      initialEvents={eventsRes.data || []} 
      initialCharacters={charsRes.data || []} 
    />
  )
}
