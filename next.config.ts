import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/beta",
        destination: "https://form.typeform.com/to/xBMhn4nQ",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
