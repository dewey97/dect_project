import type { Metadata, Viewport } from 'next'
import { FeedbackModal } from '@/components/investigation/modals/feedback-modal'
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
    // Tab favicon theo màu giao diện trình duyệt: nền sáng dùng bản light, nền tối dùng bản dark.
    icon: [
      {
        url: '/brand/favicon-light.png',
        sizes: '64x64',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/favicon-dark.png',
        sizes: '64x64',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [
      {
        url: '/brand/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
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
      <head>
        {/* Google Fonts via <link>: Turbopack drops a remote @import from globals.css, and next/font/google is banned (AGENTS.md §11). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono:wght@400;500;600;700&family=Caveat:wght@400;700&family=Playpen+Sans:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Dancing+Script:wght@500;700&subset=vietnamese&display=swap" />
      </head>
      <body suppressHydrationWarning className="min-h-dvh w-full bg-background font-sans text-foreground antialiased">
        {children}
        <FeedbackModal />
      </body>
    </html>
  )
}
