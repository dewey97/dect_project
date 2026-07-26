import React from 'react'
import { getTimelineEvents } from '@/lib/actions/timeline-actions'
import TimelineClient from './timeline-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TimelineEditorPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const { data, success } = await getTimelineEvents(caseId)
  
  if (!success) {
    notFound()
  }

  return <TimelineClient caseId={caseId} initialEvents={data || []} />
}
