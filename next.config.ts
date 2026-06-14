import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Runs after proxy.ts only if proxy fell through (NextResponse.next())
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "host", value: "mit.duckert.design" }],
          destination: "/mit/:path*",
        },
        {
          source: "/:path*",
          has: [{ type: "host", value: "kundeservice.duckert.design" }],
          destination: "/kundeservice/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
