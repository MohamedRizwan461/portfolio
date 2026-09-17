import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // there is no resume page any more; old links go straight to the PDF
  redirects() {
    return [{ source: "/resume", destination: "/resume/Mohamed-Rizwan-Ameer-John-Resume.pdf", permanent: false }];
  },
};

export default nextConfig;
