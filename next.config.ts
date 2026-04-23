import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // TODO: add Cloudinary hostname when images are uploaded
    ],
  },
};

export default nextConfig;
