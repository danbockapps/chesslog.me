/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable logs that show what's cached
  // logging: {fetches: {fullUrl: true}},
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.chesscomfiles.com',
      },
    ],
  },
}

export default nextConfig
