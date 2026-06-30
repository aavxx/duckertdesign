import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/kundeservice",
        destination: "https://kundeservice.duckert.design",
        permanent: true,
      },
      {
        source: "/kontakt",
        destination: "https://kundeservice.duckert.design",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    // beforeFiles runs before static pages are served from the CDN cache.
    // Explicit "/" rule avoids empty-capture edge cases.
    // /:path+ (one-or-more) handles sub-paths; /api/ and /_next/ excluded
    // so relative API calls from the admin UI resolve correctly.
    return {
      beforeFiles: [
        // mit.duckert.design → /mit
        {
          source: "/",
          has: [{ type: "host", value: "mit.duckert.design" }],
          destination: "/mit",
        },
        {
          source: "/((?!api/|_next/).+)",
          has: [{ type: "host", value: "mit.duckert.design" }],
          destination: "/mit/$1",
        },
        // kundeservice.duckert.design → /kundeservice
        {
          source: "/",
          has: [{ type: "host", value: "kundeservice.duckert.design" }],
          destination: "/kundeservice",
        },
        {
          source: "/((?!api/|_next/).+)",
          has: [{ type: "host", value: "kundeservice.duckert.design" }],
          destination: "/kundeservice/$1",
        },
      ],
    };
  },
};

export default nextConfig;
