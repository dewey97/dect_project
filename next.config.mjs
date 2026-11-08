/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/map-studio',
        destination: '/studio/map',
        permanent: true,
      },
      {
        source: '/admin/dossier-studio',
        destination: '/studio/dossier',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/studio',
        permanent: true,
      },
      // Studio Nhân vật gộp vào Checkpoint Studio, Evidence Studio gộp vào Dossier Studio.
      // Query `?case=` được giữ nguyên khi chuyển hướng.
      {
        source: '/studio/characters',
        destination: '/studio/checkpoints',
        permanent: true,
      },
      {
        source: '/studio/evidence',
        destination: '/studio/dossier',
        permanent: true,
      },
      // Route chơi cũ (/evidence/*?case_id=X) → /play/X/... Query còn lại (?room=) được giữ.
      {
        source: '/evidence/web',
        has: [{ type: 'query', key: 'case_id', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/board',
        permanent: true,
      },
      {
        source: '/evidence/web',
        has: [{ type: 'query', key: 'caseId', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/board',
        permanent: true,
      },
      {
        source: '/evidence/web',
        destination: '/play/case_000/board',
        permanent: true,
      },
      {
        source: '/evidence/boardgame',
        has: [{ type: 'query', key: 'case_id', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/box',
        permanent: true,
      },
      {
        source: '/evidence/boardgame',
        has: [{ type: 'query', key: 'caseId', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/box',
        permanent: true,
      },
      {
        source: '/evidence/boardgame',
        destination: '/play/case_000/box',
        permanent: true,
      },
      {
        source: '/evidence/victim-phone',
        has: [{ type: 'query', key: 'case_id', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/phone',
        permanent: true,
      },
      {
        source: '/evidence/victim-phone',
        has: [{ type: 'query', key: 'caseId', value: '(?<cid>[A-Za-z0-9_-]+)' }],
        destination: '/play/:cid/phone',
        permanent: true,
      },
      {
        source: '/evidence/victim-phone',
        destination: '/play/case_000/phone',
        permanent: true,
      },
      { source: '/evidence', destination: '/play/case_000/board', permanent: true },
      { source: '/cabinet-demo', destination: '/', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|brand|images|audio|documents).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
