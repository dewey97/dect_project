import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * The official XPLORE logo banner.
 */
export function BrandMark({
  className,
  imageClassName,
  href,
  variant = 'full',
}: {
  className?: string
  imageClassName?: string
  href?: string
  variant?: 'full' | 'favicon'
}) {
  const content = (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <img
        src={variant === 'favicon' ? '/brand/favicon.png' : '/brand/logo.png'}
        alt="XPLORE"
        className={cn(
          variant === 'favicon'
            ? 'size-7.5 sm:size-8 object-contain block'
            : 'h-6 sm:h-7 w-auto object-contain block',
          imageClassName
        )}
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
