/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "frame-src https://docs.google.com",
              "connect-src 'self' http://localhost:8080 https://localhost:8080",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
