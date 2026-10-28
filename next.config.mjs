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
