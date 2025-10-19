/** @type {import('next').NextConfig} */

const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/api/auth/login",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/api/auth/register",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  images: {
    minimumCacheTTL: 60,
    domains: [
      "source.unsplash.com",
      "googleusercontent.com",
      "lh3.googleusercontent.com",
      "*.amazonaws.com", // Allow all S3 buckets under conatins amazonaws.com
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
