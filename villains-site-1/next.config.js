/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use basePath only for local Cloudflare tunnel, not for Vercel
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

module.exports = nextConfig
