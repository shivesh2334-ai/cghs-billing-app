/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWR optimization
  swcMinify: true,
  
  // Optimize images
  images: {
    optimization: true,
    unoptimized: false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  
  // Redirect HTTP to HTTPS in production
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
