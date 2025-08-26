/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/users/auth/:path*',
        destination: '/api/users/auth/:path*',
      },
    ]
  },
}

module.exports = nextConfig
