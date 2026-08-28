import React from 'react'
import { getCases } from '@/lib/actions/case-actions'
import { CasesListClient } from './cases-client'

export const dynamic = 'force-dynamic'

export default async function CasesPage() {
  const { data: cases } = await getCases()
  return <CasesListClient initialCases={cases || []} />
}
