import React from 'react'
import { getAppSettings } from '@/lib/actions/settings-actions'
import { SettingsClient } from './settings-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { data, success } = await getAppSettings()
  
  if (!success || !data) {
    notFound()
  }

  return <SettingsClient initialSettings={data} />
}
