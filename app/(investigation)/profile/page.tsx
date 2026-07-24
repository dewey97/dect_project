import Link from 'next/link'
import { Shield, Award, Star, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getProfile } from '@/lib/mock-data'

export default async function ProfilePage() {
  const profile = await getProfile()
  const completion = Math.round(
    (profile.casesSolved / profile.totalCases) * 100,
  )

  return (
    <div className="pb-6">
      <ScreenHeader eyebrow="Hồ Sơ Nhân Sự" title="Thám Tử" />

      <div className="px-4">
        {/* Badge / identity card */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
          <div
            aria-hidden="true"
            className="noir-scanlines pointer-events-none absolute inset-0 opacity-20"
          />
          <div className="relative flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <Shield className="size-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="label-system text-primary">Mật Danh</p>
              <p className="truncate text-xl font-semibold tracking-tight">
                {profile.codename}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile.rank}
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
            <span>HUY HIỆU {profile.badgeId}</span>
            <span className="flex items-center gap-1">
              ĐÁNH GIÁ
              <span className="ml-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-3',
                      i < profile.averageRating
                        ? 'fill-primary text-primary'
                        : 'text-border',
                    )}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </span>
          </div>
        </div>

        {/* Career stats */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="label-system">Đã phá án</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-primary">
              {profile.casesSolved}
              <span className="text-base text-muted-foreground">
                /{profile.totalCases}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="label-system">Hoàn thành</p>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {completion}
              <span className="text-base text-muted-foreground">%</span>
            </p>
          </div>
        </div>

        {/* Career progress toward the sealed final case */}
        <div className="mt-3 rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Award className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Mở khóa Vụ án Tối mật</p>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Hãy hoàn thành toàn bộ các vụ án đang hoạt động để giải mật và truy cập hồ sơ vụ án cuối cùng.
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <Link href="/" className="w-full mt-4 block">
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5 text-destructive"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Thoát Máy Trạm (Về Trang Chủ)
          </Button>
        </Link>
        <p className="label-system mt-3 text-center">
          Quản lý tài khoản cá nhân sẽ khả dụng sau khi Supabase được kết nối
        </p>
      </div>
    </div>
  )
}
