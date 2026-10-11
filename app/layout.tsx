import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { FeedbackModal } from '@/components/investigation/feedback-modal'
import './globals.css'

export const metadata: Metadata = {
  title: 'XPLORE',
  description:
    'Hệ thống game trinh thám điều tra tương tác, tài liệu chứng cứ vụ án và hồ sơ Google Docs / Live CMS.',
  applicationName: 'XPLORE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'XPLORE',
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
