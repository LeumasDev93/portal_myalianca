import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
     typedRoutes: false
  },
  images: {
    domains: ["st2.depositphotos.com", "via.placeholder.com", "gestao.aliancaseguros.cv"], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gestao.aliancaseguros.cv", 
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/anywhere/:path*',
        destination: 'https://aliancacvtest.rtcom.pt/anywhere/:path*', 
      },
    ];
  }
};

export default nextConfig;