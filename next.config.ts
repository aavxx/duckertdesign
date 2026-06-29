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
};

export default nextConfig;
