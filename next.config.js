/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? '/admin' : '',
  images: {
    domains: [],
  },
}

module.exports = nextConfig