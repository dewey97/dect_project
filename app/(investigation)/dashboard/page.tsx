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
        eyebrow="Danh mục Hồ sơ"
        title="Hồ sơ chuyên án"
        description="Danh sách các chuyên án đang điều tra và đã niêm phong. Nhập mã kích hoạt từ hộp bài vật lý của bạn để mở chuyên án mới."
        action={
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            render={<Link href="/activate" />}
            nativeButton={false}
          >
            <KeyRound className="size-4" aria-hidden="true" />
            Kích hoạt
          </Button>
        }
      />

      <CaseArchiveList cases={cases} />
    </div>
  )
}
