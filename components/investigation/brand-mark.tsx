import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * The official XPLORE logo banner.
 */
export function BrandMark({
  className,
  href,
}: {
  className?: string
  href?: string
}) {
  const content = (
    <div className={cn('inline-flex items-center', className)}>
      <img
        src="/brand/logo.png"
        alt="XPLORE"
        className="h-8 sm:h-9 w-auto object-contain"
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
