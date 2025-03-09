const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.2.144', // Хост
        port: '',
        pathname: '/api/media/get/images/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/api/media/get/images/avatars/**',
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;
