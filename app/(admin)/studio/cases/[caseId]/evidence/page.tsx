import React from 'react'
import { getEvidenceBoard } from '@/lib/actions/board-actions'
import EvidenceClient from './evidence-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EvidenceBoardPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const { nodes, edges, success } = await getEvidenceBoard(caseId)
  
  if (!success) {
    notFound()
  }

  return <EvidenceClient caseId={caseId} initialNodes={nodes || []} initialEdges={edges || []} />
}
