/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
};

export default nextConfig;
