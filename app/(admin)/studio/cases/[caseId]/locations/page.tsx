import React from 'react'
import { getLocations } from '@/lib/actions/map-actions'
import LocationsClient from './locations-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LocationsPage({
  params
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const { data, success } = await getLocations(caseId)
  
  if (!success) {
    notFound()
  }

  return <LocationsClient caseId={caseId} initialLocations={data || []} />
}
