import { Suspense, type ReactNode } from "react";
import { ResponsiveLayout } from "@/components/investigation/responsive-layout";
import { SettingsProvider } from "@/components/investigation/contexts/settings-context";
import { CheckpointsProvider } from "@/components/investigation/contexts/checkpoints-context";
import { RoomSyncProvider } from "@/components/investigation/room/room-sync-context";
import { CaseCharactersProvider } from "@/components/investigation/contexts/case-characters-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * The investigation OS shell wrapped in global providers.
 */
export default function InvestigationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SettingsProvider>
      <Suspense>
        <CaseCharactersProvider>
          <RoomSyncProvider>
            <CheckpointsProvider>
              <ResponsiveLayout>{children}</ResponsiveLayout>
            </CheckpointsProvider>
          </RoomSyncProvider>
        </CaseCharactersProvider>
      </Suspense>
    </SettingsProvider>
  );
}
