/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'n3agvegndvorzrxf.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;