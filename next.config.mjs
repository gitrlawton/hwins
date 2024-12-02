/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
