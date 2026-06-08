import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    qualities: [75, 90, 95],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thewildwild.in" }],
        destination: "https://thewildwild.in/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/shop", destination: "/shop.html" },
      { source: "/our-story", destination: "/our-story.html" },
    ];
  },
};

export default nextConfig;
