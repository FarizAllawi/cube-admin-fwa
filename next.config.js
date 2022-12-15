/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: `/api`,
        destination: `${process.env.NEXT_PUBLIC_STORAGE_API}/files/upload`,
      },
    ]
  },
}

module.exports = nextConfig
