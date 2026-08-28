import type { ReactNode } from 'react'
import { SystemHeader } from '@/components/investigation/system-header'
import { ResponsiveLayout } from '@/components/investigation/responsive-layout'
import { getActiveCase, getDevices, getEvidence, getTraceCards } from '@/lib/mock-data'
import { SettingsProvider } from '@/components/investigation/settings-context'
import { CheckpointsProvider } from '@/components/investigation/checkpoints-context'

/**
 * The investigation OS shell. Adapts between:
 * - Mobile portrait view (single central column max ~430px)
 * - Desktop command center view (3-column grid layout rendering Hub, Simulator, and Minh side-by-side)
 *   wrapped in the global SettingsProvider.
 */
export default async function InvestigationLayout({
  children,
}: {
  children: ReactNode
}) {
  const activeCase = await getActiveCase()
  const devices = activeCase ? await getDevices(activeCase.id) : []
  const evidence = activeCase ? await getEvidence(activeCase.id) : []
  const traceCards = activeCase ? await getTraceCards(activeCase.id) : []

  return (
    <SettingsProvider>
      <CheckpointsProvider>
        <ResponsiveLayout
          activeCase={activeCase}
          devices={devices}
          evidence={evidence}
          traceCards={traceCards}
        >
          {children}
        </ResponsiveLayout>
      </CheckpointsProvider>
    </SettingsProvider>
  )
}
