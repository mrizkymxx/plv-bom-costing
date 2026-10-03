/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: async () => [
    {
      source: '/',
      destination: '/index.html'
    }
  ]
};

export default nextConfig;
