/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === "production" ? "/admin" : "",
  // Proxy /api-proxy/* to the backend server at runtime (server-side only)
  // This avoids CORS and baked-in API URLs in browser JS
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
