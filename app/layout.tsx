import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { FeedbackModal } from '@/components/investigation/feedback-modal'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xplore.vn'),
  title: 'XPLORE — Hệ Thống Trinh Thám Tương Tác',
  description:
    'Game trinh thám điều tra tương tác lai: Đối chiếu hồ sơ hiện vật giấy, khai thác dữ liệu điện thoại và bẻ khóa kỳ án trực tuyến.',
  applicationName: 'XPLORE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'XPLORE',
  },
  openGraph: {
    title: 'XPLORE — Hệ Thống Trinh Thám Tương Tác',
    description:
      'Chuyên án #000: Trốn Tìm. Đối chiếu hồ sơ vật chứng, trích xuất dữ liệu điện thoại và vạch trần thủ phạm.',
    siteName: 'XPLORE',
    images: [
      {
        url: '/brand/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'XPLORE — Chuyên Án #000: Trốn Tìm',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPLORE — Hệ Thống Trinh Thám Tương Tác',
    description:
      'Chuyên án #000: Trốn Tìm. Đối chiếu hồ sơ vật chứng, trích xuất dữ liệu điện thoại và vạch trần thủ phạm.',
    images: ['/brand/og-image.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/brand/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/brand/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/brand/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className="dark font-sans"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-dvh w-full bg-background font-sans text-foreground antialiased">
        {children}
        <FeedbackModal />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
