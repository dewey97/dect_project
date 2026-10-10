import React from 'react'
import { getAppSettings } from '@/lib/actions/settings-actions'
import { SettingsClient } from './settings-client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const defaultSettings = {
  id: 1,
  maintenance_mode: false,
  banner_active: true,
  banner_text: '🚀 Chào mừng đến với Dect Project - Studio đang trong giai đoạn Alpha Test!',
  updated_at: new Date().toISOString()
}

export default async function SettingsPage() {
  const { data } = await getAppSettings()
  return <SettingsClient initialSettings={data || defaultSettings} />
}
