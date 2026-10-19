import type { ReactNode } from 'react'
import { ResponsiveLayout } from '@/components/investigation/responsive-layout'
import { SettingsProvider } from '@/components/investigation/settings-context'
import { CheckpointsProvider } from '@/components/investigation/checkpoints-context'
import { RoomSyncProvider } from '@/components/investigation/room-sync-context'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * The investigation OS shell wrapped in global providers.
 */
export default function InvestigationLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SettingsProvider>
      <RoomSyncProvider>
        <CheckpointsProvider>
          <ResponsiveLayout>
            {children}
          </ResponsiveLayout>
        </CheckpointsProvider>
      </RoomSyncProvider>
    </SettingsProvider>
  )
}
