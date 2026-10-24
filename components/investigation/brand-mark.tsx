import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * The official XPLORE logo banner.
 */
export function BrandMark({
  className,
  imageClassName,
  href,
}: {
  className?: string
  imageClassName?: string
  href?: string
}) {
  const content = (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <img
        src="/brand/logo.png"
        alt="XPLORE"
        className={cn('h-6 sm:h-7 w-auto object-contain block', imageClassName)}
      />
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn('inline-flex items-center justify-center hover:opacity-90 transition-opacity', className)}
      >
        {content}
      </Link>
    )
  }

  return content
}
