import React from 'react'
import { getCaseOverview } from '@/lib/actions/case-actions'
import { OverviewClient } from './overview-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CaseOverviewPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const { data: caseData, success } = await getCaseOverview(caseId)
  
  if (!success || !caseData) {
    notFound()
  }

  return <OverviewClient initialData={caseData} />
}
