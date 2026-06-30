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
    // beforeFiles runs before static pages are served from the CDN cache —
    // this is the correct way to do subdomain routing on Vercel.
    // Explicit paths only (no wildcards) to avoid Next.js chaining rewrites
    // on the already-rewritten destination path.
    return {
      beforeFiles: [
        // mit.duckert.design → /mit (SPA, only / matters)
        {
          source: "/",
          has: [{ type: "host", value: "mit.duckert.design" }],
          destination: "/mit",
        },
        // kundeservice.duckert.design → /kundeservice + /kundeservice/mail
        {
          source: "/",
          has: [{ type: "host", value: "kundeservice.duckert.design" }],
          destination: "/kundeservice",
        },
        {
          source: "/mail",
          has: [{ type: "host", value: "kundeservice.duckert.design" }],
          destination: "/kundeservice/mail",
        },
      ],
    };
  },
};

export default nextConfig;
