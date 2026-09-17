import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the resume now lives on the contact page, beside the ways to reach me
  redirects() {
    return [{ source: "/resume", destination: "/contact", permanent: true }];
  },
};

export default nextConfig;
