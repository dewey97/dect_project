import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CaseArchiveList } from '@/components/investigation/case-archive-list'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getCases } from '@/lib/mock-data'

export default async function DashboardPage() {
  const cases = await getCases()

  return (
    <div className="pb-6">
      <ScreenHeader
        eyebrow="Case Files"
        title="Investigations"
        description="Active and sealed case files. Activate a new file with the code from your game box."
        action={
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            render={<Link href="/activate" />}
            nativeButton={false}
          >
            <KeyRound className="size-4" aria-hidden="true" />
            Activate
          </Button>
        }
      />

      <CaseArchiveList cases={cases} />
    </div>
  )
}
